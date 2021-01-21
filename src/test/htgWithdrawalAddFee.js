const nerve = require('../index');
const sdk = require('../api/sdk');
const {NERVE_INFO, Plus, timesDecimals} = require('./htgConfig');

const {getNulsBalance, validateTx, broadcastTx} = require('./api/util');

// 设置追加手续费的账户，必须与提现账户一致
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';

// 发出的提现交易hash
let withdrawalTxHash = '4ac93222a3a88a554c9d12c11e8d1b1e03f43a4324b9e745514ef52c1b60b1cd';
// 追加的NVT手续费，此处设置为追加2个NVT
let addFeeAmount = '3';

let remark = 'withdrawal add fee transaction remark...';
//调用
withdrawalAddFee(pri, fromAddress, withdrawalTxHash, addFeeAmount, remark);

/**
 * 异构链提现追加手续费交易
 */
async function withdrawalAddFee(pri, fromAddress, withdrawalTxHash, addFeeAmount, remark) {
    let feeAddress = nerve.getAddressByPub(NERVE_INFO.chainId, NERVE_INFO.assetId, NERVE_INFO.feePubkey, NERVE_INFO.prefix);
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: feeAddress,//this.info.blockHoleAddress,
        fee: 0.001,
        chainId: NERVE_INFO.chainId,
        assetId: NERVE_INFO.assetId,
        amount: Number(addFeeAmount),
    };
    let inOrOutputs = await inputsOrOutputs(transferInfo);
    //console.log(inOrOutputs);
    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        56,
        {
            txHash: withdrawalTxHash
        }
    );
    //获取hash
    let hash = await tAssemble.getHash();

    //交易签名
    let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
    //通过拼接签名、公钥获取HEX
    let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
    tAssemble.signatures = signData;
    let txhex = tAssemble.txSerialize().toString("hex");
    console.log(txhex.toString('hex'));

    let result = await validateTx(txhex);
    if (result.success) {
        console.log(result.data.value);
        let results = await broadcastTx(txhex);
        if (results && results.value) {
            console.log("交易完成")
        } else {
            console.log("广播交易失败")
        }
    } else {
        console.log("验证交易失败:" + JSON.stringify(result.error))
    }
}

/**
 * 获取inputs and outputs
 * @param transferInfo
 * @returns {*}
 **/
async function inputsOrOutputs(transferInfo) {
    let balanceInfo = await getNulsBalance(transferInfo.fromAddress, transferInfo.chainId, transferInfo.assetId);
    let inAmount =  timesDecimals(Plus(transferInfo.amount, transferInfo.fee), NERVE_INFO.decimals).toString();
    let outAmount = timesDecimals(transferInfo.amount, NERVE_INFO.decimals).toString();
    let inputs = [{
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.chainId,
        assetsId: transferInfo.assetId,
        amount: inAmount,
        locked: 0,
        nonce: balanceInfo.data.nonce
    }];
    let outputs = [{
        address: transferInfo.toAddress,
        assetsChainId: transferInfo.chainId,
        assetsId: transferInfo.assetId,
        amount: outAmount,
        lockTime: 0
    }];
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}



