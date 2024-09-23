
const nerve = require("../index");
const BigNumber = require("fch-sdk/src/utils/bignumber");
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
 *      f(splitNum) = f(1) + 43 * (splitNum - 1) ==> Derived from bch.calcTxSizeWithdrawal(inputNum, splitNum)
 *  In summary:
 *      splitNum = (fromTotal - transfer - btc.calcTxSizeWithdrawal(inputNum, 1) * feeRate + 43 * feeRate) / (43 * feeRate + splitGranularity)
 */
function calcSplitNumP2SH(fromTotal, transfer, feeRate, splitGranularity, inputNum) {
    // numerator and denominator
    const numerator = fromTotal - transfer - calcTxSizeWithdrawal(inputNum, 1) * feeRate + 43 * feeRate;
    const denominator = 43 * feeRate + splitGranularity;
    let splitNum = numerator / denominator;
    if (splitNum == 0 && numerator % denominator > 0) {
        splitNum = 1;
    }
    return splitNum;
}

function calcFeeMultiSign(inputNum, outputNum, opReturnBytesLen, m, n) {
    let redeemScriptLength = 1 + (n * (33 + 1)) + 1 + 1;
    let redeemScriptVarInt = encodingLength(redeemScriptLength);
    let scriptLength = 2 + (m * (1 + 1 + 69 + 1 + 1)) + redeemScriptVarInt + redeemScriptLength;
    let scriptVarInt = encodingLength(scriptLength);
    let inputLength = 40 + scriptVarInt + scriptLength;

    let totalOpReturnLen = calcOpReturnLen(opReturnBytesLen);
    let length = 10 + inputLength * inputNum +  43 * (outputNum + 1) + totalOpReturnLen;
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
    return calcFeeMultiSign(utxoSize, outputNum, 32, m, n);
}

function computerSatoshi(amount) {
    let totalInputAmount = new BigNumber(amount)
    return totalInputAmount.times(100000000).toNumber();
}

function msgBytesLength(msg, encoding) {
    if (!msg) {
        msg = '';
    }
    if (!encoding) {
        encoding = 'utf8';
    }
    if (typeof (msg) == 'string') {
        if (msg != '') {
            return Buffer.from(msg, encoding).length;
        }
        return 0;
    } else {
        throw 'only string';
    }
}

function calcTxSize(inputNum, outputNum, opReturnBytesLen) {

    let baseLength = 10;
    let inputLength = 141 * inputNum;
    let outputLength = 34 * (outputNum + 1); // Include change output

    let opReturnLen = 0;
    if (opReturnBytesLen != 0)
        opReturnLen = calcOpReturnLen(opReturnBytesLen);

    return baseLength + inputLength + outputLength + opReturnLen;
}

function calcOpReturnLen(opReturnBytesLen) {
    let dataLen;
    if (opReturnBytesLen < 76) {
        dataLen = opReturnBytesLen + 1;
    } else if (opReturnBytesLen < 256) {
        dataLen = opReturnBytesLen + 2;
    } else {
        dataLen = opReturnBytesLen + 3;
    }
    let scriptLen = (dataLen + 1) + encodingLength(dataLen + 1);
    let amountLen = 8;
    return scriptLen + amountLen;
}

var bch = {

    getFeeRate() {
        return 1;
    },

    calcTxFee(inputNum, msg, encoding) {
        return calcTxSize(inputNum, 1, msgBytesLength(msg, encoding));
    },

    calcFeeAndUTXO(utxos, amount, msg, encoding) {
        let _fee = 0, total = 0;
        let resultList = [];
        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            total = total + utxo.satoshis;
            resultList.push(utxo);
            _fee = this.calcTxFee(resultList.length, msg, encoding);
            let totalSpend = amount + _fee;
            if (total >= totalSpend) {
                break;
            }
        }
        return {utxo: resultList, fee: _fee};
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

module.exports = bch;
