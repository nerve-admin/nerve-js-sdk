const nerve = require('../index');
nerve.mainnet();
const sdk = require('../api/sdk');
const {Plus, timesDecimals} = require('./htgConfig');

const {getNulsBalance, validateTx, broadcastTx} = require('./api/util');

// NERVE 网络基本信息
const NERVE_INFOS = {
    testnet: {
        chainId: 5,
        assetId: 1,
        prefix: "TNVT",
        symbol: "NVT",
        decimals: 8,
        blackHolePublicKey: "000000000000000000000000000000000000000000000000000000000000000000",
        blockHoleAddress: "TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY",
        feePubkey: "111111111111111111111111111111111111111111111111111111111111111111"
    },
    mainnet: {
        chainId: 9,
        assetId: 1,
        prefix: "NERVE",
        symbol: "NVT",
        decimals: 8,
        blackHolePublicKey: "000000000000000000000000000000000000000000000000000000000000000000",
        blockHoleAddress: "NERVEepb63T1M8JgQ26jwZpZXYL8ZMLdUAK31L",
        feePubkey: "111111111111111111111111111111111111111111111111111111111111111111"
    }
};
let NERVE_INFO = nerve.chainId() == 9 ? NERVE_INFOS.mainnet : nerve.chainId() == 5 ? NERVE_INFOS.testnet : null;

// 设置追加手续费的账户，必须与提现账户一致
let fromAddress = "NERVEepb688ErqaurAVdNDXkyAT74FxGJbyQ2N";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';

// 发出的提现交易hash
let withdrawalTxHash = 'c7fece64ab0b31b223fcf654aeb2335b8bf10d03104fcfd930fd6ce99d0593d4';
// 追加的NVT手续费，此处设置为追加2个NVT
let addFeeAmount = '1';

let remark = 'withdrawal add fee transaction remark...';
//调用
withdrawalAddFeeTest(pri, fromAddress, withdrawalTxHash, addFeeAmount, remark);

/**
 * 异构链提现追加手续费交易
 */
async function withdrawalAddFeeTest(pri, fromAddress, withdrawalTxHash, addFeeAmount, remark) {
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

    let result = await nerve.broadcastTx(txhex);
    console.log(result);
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



