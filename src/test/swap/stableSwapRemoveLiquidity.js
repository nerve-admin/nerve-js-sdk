const nerve = require('../../index');
const sdk = require('../../api/sdk');
const util = require('../api/util');

const _chainId = 5;
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
// 移除流动性份额接收地址
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
// 交易对地址
let stablePairAddress = "TNVTdTSQkXMz7PGy5j48LfuQbAbVzHcYTMAzM";
let remark = 'stable swap remove liquidity remark...';
//调用
stableSwapRemoveLiquidityTest(_chainId, pri, fromAddress, stablePairAddress,
    util.tokenAmount(5, 18, "2698778989"),
    [4, 2, 3, 1], util.currentTime() + 300, toAddress, remark);


/**
 * 移除Stable-Swap流动性
 */
async function stableSwapRemoveLiquidityTest(chainId, pri, fromAddress, stablePairAddress, tokenAmountLP, receiveOrderIndexs, deadline, to, remark) {
    let pairAddress = stablePairAddress;
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: pairAddress,
        fee: 0,
        assetsChainId: tokenAmountLP.chainId,
        assetsId: tokenAmountLP.assetId,
        amount: tokenAmountLP.amount,
    };
    let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.assetsChainId, transferInfo.assetsId);
    let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);

    // let inOrOutputs = await inputsOrOutputs(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress);
    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        74,
        {
            indexs: Buffer.from(receiveOrderIndexs),
            to: to
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

    /*let result = await util.validateTx(txhex);
    if (result.success) {
        console.log(result.data.value);
        let results = await util.broadcastTx(txhex);
        if (results && results.value) {
            console.log("交易完成")
        } else {
            console.log("广播交易失败: " + JSON.stringify(results))
        }
    } else {
        console.log("验证交易失败:" + JSON.stringify(result.error))
    }*/
}



