const sdk = require('fch-sdk');

const MAX_SAFE_INTEGER = 9007199254740991

function checkUInt53(n) {
    if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

function encodingLength(number) {
    checkUInt53(number)
    return (
        number < 0xfd ? 1
            : number <= 0xffff ? 3
                : number <= 0xffffffff ? 5
                    : 9
    )
}

/**
 * calc split number of Transaction Change Spliting by splitGranularity
 *      change = fromTotal - transfer - fee
 *      change = splitNum * splitGranularity
 *      fee = txSize * feeRate
 *      txSize = f(splitNum)
 *      f(splitNum) = f(1) + 43 * (splitNum - 1) ==> Derived from btc.calcTxSizeWithdrawal(inputNum, splitNum)
 *  In summary:
 *      splitNum = (fromTotal - transfer - btc.calcTxSizeWithdrawal(inputNum, 1) * feeRate + 43 * feeRate) / (43 * feeRate + splitGranularity)
 */
function calcSplitNumP2SH(fromTotal, transfer, feeRate, splitGranularity, inputNum) {
    // numerator and denominator
    const numerator = fromTotal - transfer - calcTxSizeWithdrawal(inputNum, 1) * feeRate + 43 * feeRate;
    const denominator = 43 * feeRate + splitGranularity;
    let splitNum = (int) (numerator / denominator);
    if (splitNum == 0 && numerator % denominator > 0) {
        splitNum = 1;
    }
    return splitNum;
}

function calcFeeMultiSign(inputNum, outputNum, opReturnBytesLen, m, n) {
    let op_mLen =1;
    let op_nLen =1;
    let pubKeyLen = 33;
    let pubKeyLenLen = 1;
    let op_checkmultisigLen = 1;

    let redeemScriptLength = op_mLen + (n * (pubKeyLenLen + pubKeyLen)) + op_nLen + op_checkmultisigLen; //105 n=3
    let redeemScriptVarInt = encodingLength(redeemScriptLength);//1 n=3

    let op_pushDataLen = 1;
    let sigHashLen = 1;
    let signLen=64;
    let signLenLen = 1;
    let zeroByteLen = 1;

    let mSignLen = m * (signLenLen + signLen + sigHashLen); //132 m=2

    let scriptLength = zeroByteLen + mSignLen + op_pushDataLen + redeemScriptVarInt + redeemScriptLength;//236 m=2
    let scriptVarInt = encodingLength(scriptLength);

    let preTxIdLen = 32;
    let preIndexLen = 4;
    let sequenceLen = 4;

    let inputLength = preTxIdLen + preIndexLen + sequenceLen + scriptVarInt + scriptLength;//240 n=3,m=2


    let opReturnLen = 0;
    if (opReturnBytesLen != 0)
        opReturnLen = calcOpReturnLen(opReturnBytesLen);

    let outputValueLen=8;
    let unlockScriptLen = 25; //If sending to multiSignAddr, it will be 23.
    let unlockScriptLenLen =1;
    let outPutLen = outputValueLen + unlockScriptLenLen + unlockScriptLen;

    let inputCountLen=1;
    let outputCountLen=1;
    let txVerLen = 4;
    let nLockTimeLen = 4;
    let txFixedLen = inputCountLen + outputCountLen + txVerLen + nLockTimeLen;

    let length;
    length = txFixedLen + inputLength * inputNum + outPutLen * (outputNum + 1) + opReturnLen;

    return length;
}

function calcOpReturnLen(opReturnBytesLen) {
    let dataLen;
    if (opReturnBytesLen < 76) {
        dataLen = opReturnBytesLen + 1;
    } else if (opReturnBytesLen < 256) {
        dataLen = opReturnBytesLen + 2;
    } else dataLen = opReturnBytesLen + 3;
    let scriptLen;
    scriptLen = (dataLen + 1) + encodingLength(dataLen + 1);
    let amountLen = 8;
    return scriptLen + amountLen;
}

function calcTxSizeWithdrawal(utxoSize, outputNum = 1) {
    let m, n;
    if (nerve.chainId() == 9) {
        m = 10, n = 15;
    } else {
        m = 2, n = 3;
    }
    return calcFeeMultiSign(utxoSize, outputNum, 64, m, n);
}

var fch = {
    getFeeRate() {
        return 1;
    },

    calcFeeWithdrawal(utxos, amount, feeRate, splitGranularity = 0) {
        if (Array.isArray(utxos)) {
            utxos.sort((a, b) => {
                if (a.value !== b.value) {
                    return Number(a.value) < Number(b.value) ? -1 : 1;
                } else if (a.txid !== b.txid) {
                    return a.txid < b.txid ? -1 : 1;
                } else if (a.vout !== b.vout) {
                    return Number(a.vout) < Number(b.vout) ? -1 : 1;
                } else {
                    return 0;
                }
            });
        }
        let _fee = 0, total = 0, totalSpend = 0;
        let resultList = [];
        amount = Number(amount)
        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            total = total + utxo.amount;
            resultList.push(utxo);
            if (splitGranularity > 0) {
                const splitNum = calcSplitNumP2SH(total, amount, feeRate, splitGranularity, resultList.length);
                _fee = calcTxSizeWithdrawal(resultList.length, splitNum) * feeRate;
            } else {
                _fee = calcTxSizeWithdrawal(resultList.length) * feeRate;
            }
            totalSpend = amount + _fee;
            if (total >= totalSpend) {
                break;
            }
        }
        if (total < totalSpend) {
            throw "not enough fee";
        }
        return _fee;
    },
}

module.exports = fch;
