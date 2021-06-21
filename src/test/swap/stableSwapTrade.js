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
// 交易对地址
let stablePairAddress = "TNVTdTSQkXMz7PGy5j48LfuQbAbVzHcYTMAzM";
// 交易手续费取出一部分给指定的接收地址
let feeTo = null;
let remark = 'stable swap trade remark...';
//调用
stableSwapTradeTest(_chainId, pri, fromAddress, stablePairAddress,
    [util.tokenAmount(5, 6, "600000000"), util.tokenAmount(5, 9, "90000000")],
    3, feeTo, util.currentTime() + 300, toAddress, remark);

/**
 * Stable-Swap币币交换
 */
async function stableSwapTradeTest(chainId, pri, fromAddress, stablePairAddress, amountIns, tokenOutIndex, feeTo, deadline, to, remark) {
    let inOrOutputs = await inputsOrOutputs(fromAddress, stablePairAddress, amountIns);
    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }
    if (feeTo == null) {
        feeTo = '';
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        72,
        {
            to: to,
            tokenOutIndex: Buffer.from(tokenOutIndex + ''),
            feeTo: feeTo,
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

async function inputsOrOutputs(fromAddress, to, tokenAmounts) {
    let inputs = [];
    let outputs = [];
    let length = tokenAmounts.length;
    for (let i = 0; i < length; i++) {
        let tokenAmount = tokenAmounts[i];
        let balance = await util.getNulsBalance(fromAddress, tokenAmount.chainId, tokenAmount.assetId);
        inputs.push({
            address: fromAddress,
            amount: tokenAmount.amount,
            assetsChainId: tokenAmount.chainId,
            assetsId: tokenAmount.assetId,
            nonce: balance.data.nonce,
            locked: 0,
        });
        outputs.push({
            address: to,
            amount: tokenAmount.amount,
            assetsChainId: tokenAmount.chainId,
            assetsId: tokenAmount.assetId,
            locked: 0
        });
    }
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}


