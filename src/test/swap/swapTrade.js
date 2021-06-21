const nerve = require('../../index');
const sdk = require('../../api/sdk');
const util = require('../api/util');

const _chainId = 5;
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
// 资产接收地址
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
// 交易手续费取出一部分给指定的接收地址
let feeTo = null;
let remark = 'swap trade remark...';
//调用
swapTradeTest(_chainId, pri, fromAddress, "14000000000",
    [util.token(5, 1), util.token(5, 6)], "9899567",
    feeTo, util.currentTime() + 300, toAddress, remark);
// test();
function test() {
    let aaa = sdk.getBytesAddress(null);
    console.log(aaa.length);
}
/**
 * Swap币币交换
 */
async function swapTradeTest(chainId, pri, fromAddress, amountIn, tokenPath, amountOutMin, feeTo, deadline, to, remark) {
    if (feeTo == null) {
        feeTo = '';
    }
    let firstTokenIn = tokenPath[0];
    let pairAddress = util.getStringPairAddress(chainId, firstTokenIn, tokenPath[1]);
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: pairAddress,
        fee: 0,
        assetsChainId: firstTokenIn.chainId,
        assetsId: firstTokenIn.assetId,
        amount: amountIn,
    };
    let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.assetsChainId, transferInfo.assetsId);
    let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);

    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        63,
        {
            amountOutMin: amountOutMin,
            to: to,
            feeTo: feeTo,
            deadline: deadline,
            tokenPath: tokenPath
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



