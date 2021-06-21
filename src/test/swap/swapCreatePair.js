const nerve = require('../../index');
const sdk = require('../../api/sdk');

const {getNulsBalance, validateTx, broadcastTx} = require('../api/util');
const _chainId = 5;
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';

// 接收地址
let toAddress = '0xc11D9943805e56b630A401D4bd9A29550353EFa1';

let remark = 'withdrawal transaction remark...';
//调用
swapCreatePairTest(pri, fromAddress, token(5, 1), token(5, 6), remark);

function token(chainId, assetId) {
    return {chainId: chainId, assetId: assetId};
}
/**
 * 创建Swap交易对
 */
async function swapCreatePairTest(pri, fromAddress, tokenA, tokenB, remark) {
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: fromAddress,
        fee: 0,
        chainId: _chainId,
        assetId: _assetId,
        amount: 0,
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
        61,
        {
            tokenA: tokenA,
            tokenB: tokenB
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
            console.log("广播交易失败: " + JSON.stringify(results))
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
    let withdrawalBalance = await getNulsBalance(transferInfo.fromAddress, transferInfo.chainId, transferInfo.assetId);
    let mainBalance = await getNulsBalance(transferInfo.fromAddress, NERVE_INFO.chainId, NERVE_INFO.assetId);

    let newFee = Number(timesDecimals(Plus(transferInfo.withdrawalFee, transferInfo.fee), NERVE_INFO.decimals));
    let newAmount = Number(Plus(transferInfo.amount, newFee));
    let inputs = [];
    if (transferInfo.chainId === NERVE_INFO.chainId && transferInfo.assetId === NERVE_INFO.assetId) {
        inputs.push({
            address: transferInfo.fromAddress,
            amount: newAmount,
            assetsChainId: transferInfo.chainId,
            assetsId: transferInfo.assetId,
            nonce: withdrawalBalance.data.nonce,
            locked: 0,
        });
    } else {
        inputs = [
            {
                address: transferInfo.fromAddress,
                amount: transferInfo.amount,
                assetsChainId: transferInfo.chainId,
                assetsId: transferInfo.assetId,
                nonce: withdrawalBalance.data.nonce,
                locked: 0,
            },
            {
                address: transferInfo.fromAddress,
                amount: newFee,
                assetsChainId: NERVE_INFO.chainId,
                assetsId: NERVE_INFO.assetId,
                nonce: mainBalance.data.nonce,
                locked: 0,
            }
        ];
    }


    let feeAddress = nerve.getAddressByPub(NERVE_INFO.chainId, NERVE_INFO.assetId, NERVE_INFO.feePubkey, NERVE_INFO.prefix);

    let outputs = [
        {
            address: NERVE_INFO.blockHoleAddress, //黑洞地址
            amount: transferInfo.amount,
            assetsChainId: transferInfo.chainId,
            assetsId: transferInfo.assetId,
            locked: 0
        },
        {
            address: feeAddress, //提现费用地址
            amount: Number(timesDecimals(transferInfo.withdrawalFee, NERVE_INFO.decimals)),
            assetsChainId: NERVE_INFO.chainId,
            assetsId: NERVE_INFO.assetId,
            locked: 0
        },
    ];
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}


