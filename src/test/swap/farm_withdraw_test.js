const nerve = require('../../index');
const sdk = require('../../api/sdk');

const {getNulsBalance, inputsOrOutputs, validateTx, broadcastTx} = require('../api/util');
const _chainId = 5;
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';

let remark = 'farm create pair remark...';
//调用
farmCreatePairTest(pri, fromAddress, token(5, 1), token(5, 6), remark);

function token(chainId, assetId) {
    return {chainId: chainId, assetId: assetId};
}

/**
 * 创建farm
 */
async function farmCreatePairTest(pri, fromAddress, tokenA, tokenB, remark) {
    let farmInfo = {
        fromAddress: fromAddress,
        toAddress: 'TNVTdTSQWhb5F2pdWRd6W2m5622btcyFWaeZ6',//根据空hash+ 类型=5，计算出地址
        fee: 0,
        assetsChainId: tokenA.chainId,
        assetsId: tokenA.assetId,
        amount: 0,
    };
    let balance = await getNulsBalance(farmInfo.fromAddress, farmInfo.assetsChainId, farmInfo.assetId);
    let inOrOutputs = await inputsOrOutputs(farmInfo, balance.data);
    if (!inOrOutputs.success) {
        //console.log(inOrOutputs);
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        67,
        {
            farmHash: "1e51dea44f9e295ac3e44c7fb98eec719459ad023051aff7c6195c3970a14469",
            amount: 100000000
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

    // let result = await validateTx(txhex);
    // if (result.success) {
    //     console.log(result.data.value);
    //     let results = await broadcastTx(txhex);
    //     if (results && results.value) {
    //         console.log("交易完成")
    //     } else {
    //         console.log("广播交易失败: " + JSON.stringify(results))
    //     }
    // } else {
    //     console.log("验证交易失败:" + JSON.stringify(result.error))
    // }
}

