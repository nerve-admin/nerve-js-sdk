const nerve = require('../../index');
const sdk = require('../../api/sdk');
const util = require('../api/util');

const _chainId = 5;
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
// 流动性份额接收地址
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
let remark = 'swap add liquidity remark...';
//调用
swapAddLiquidityTest(_chainId, pri, fromAddress,
    util.tokenAmount(5, 1, "140000000000"), util.tokenAmount(5, 6, "100000000"),
    "140000000000", "100000000", util.currentTime() + 300, toAddress, remark);

/**
 * 添加Swap流动性
 */
async function swapAddLiquidityTest(chainId, pri, fromAddress, tokenAmountA, tokenAmountB, amountAMin, amountBMin, deadline, to, remark) {
    let pairAddress = util.getStringPairAddress(chainId, tokenAmountA, tokenAmountB);
    let inOrOutputs = await inputsOrOutputs(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress);
    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        64,
        {
            tokenA: tokenAmountA,
            tokenB: tokenAmountB,
            to: to,
            deadline: deadline,
            amountAMin: amountAMin,
            amountBMin: amountBMin
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

async function inputsOrOutputs(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress) {
    let balanceA = await util.getNulsBalance(fromAddress, tokenAmountA.chainId, tokenAmountA.assetId);
    let balanceB = await util.getNulsBalance(fromAddress, tokenAmountA.chainId, tokenAmountA.assetId);
    let inputs = [
        {
            address: fromAddress,
            amount: tokenAmountA.amount,
            assetsChainId: tokenAmountA.chainId,
            assetsId: tokenAmountA.assetId,
            nonce: balanceA.data.nonce,
            locked: 0,
        },
        {
            address: fromAddress,
            amount: tokenAmountB.amount,
            assetsChainId: tokenAmountB.chainId,
            assetsId: tokenAmountB.assetId,
            nonce: balanceB.data.nonce,
            locked: 0,
        }
    ];
    let outputs = [
        {
            address: pairAddress,
            amount: tokenAmountA.amount,
            assetsChainId: tokenAmountA.chainId,
            assetsId: tokenAmountA.assetId,
            locked: 0
        },
        {
            address: pairAddress,
            amount: tokenAmountB.amount,
            assetsChainId: tokenAmountB.chainId,
            assetsId: tokenAmountB.assetId,
            locked: 0
        }
    ];
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}


