const nerve = require('../../index');
const sdk = require('../../api/sdk');
nerve.testnet();
const {getNulsBalance, inputsOrOutputs, validateTx, broadcastTx, token} = require('../api/util');
const _chainId = nerve.chainId();
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';


//调用
farmCreatePairTest(pri, fromAddress, token(5, 8), token(5, 1),5, 1000000000000,100000000,1,1,"TNVT");

/**
 * 创建farm
 */
async function farmCreatePairTest(pri, fromAddress, tokenA, tokenB, chainId,syrupTotalAmount,syrupPerBlock,startBlockHeight,lockedTime,addressPrefix) {
    let farmInfo = {
        tokenA: tokenA,
        tokenB: tokenB,
        fromAddress: fromAddress,
        toAddress: sdk.getStringSpecAddress(chainId,5,"0000000000000000000000000000000000000000000000000000000000000000",addressPrefix),//根据空hash+ 类型=5，计算出地址
        fee: 0,
        assetsChainId: tokenB.chainId,
        assetsId: tokenB.assetId,
        amount: syrupTotalAmount,
    };
    let balance = await getNulsBalance(farmInfo.fromAddress, farmInfo.assetsChainId, farmInfo.assetId);
    balance.data.nonce = '0000000000000000';//todo 临时增加的
    let inOrOutputs = await inputsOrOutputs(farmInfo, balance.data);
    //console.log(inOrOutputs);
    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        "",
        62,
        {
            tokenA: tokenA,
            tokenB: tokenB,
            syrupPerBlock: syrupPerBlock ,
            totalSyrupAmount:syrupTotalAmount,
            startBlockHeight:startBlockHeight,
            lockedTime:lockedTime
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

    /*let result = await validateTx(txhex);
    if (result.success) {
        console.log(result.data.value);
        let results = await broadcastTx(txhex);
        if (results && results.value) {
            console.log("交易完成")
        } else {
            console.log("广播交易失败: " + JSON.stringify(results))
        }
    } else {
        console.log("验证交易失败:" + JSON.stringify(result.error))
    }*/
}


