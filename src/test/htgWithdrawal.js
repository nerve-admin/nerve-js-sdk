const nerve = require('../index');
nerve.testnet();
// nerve.mainnet();
const sdk = require('../api/sdk');
const {NERVE_INFOS, Plus, timesDecimals} = require('./htgConfig');
const {getNulsBalance, validateTx, broadcastTx, getSymbolPriceOfUsdt, getHeterogeneousMainAsset} = require('./api/util');

let NERVE_INFO = nerve.chainId() == 9 ? NERVE_INFOS.mainnet : nerve.chainId() == 5 ? NERVE_INFOS.testnet : null;

// 提现账户信息
let fromAddress = "TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad";
let pri = '';

// 提现接收地址
let toAddress = 'mmLahgkWGHQSKszCDcZXPooWoRuYhQPpCF';
// 提现金额
let withdrawalAmount = '0.00001';
// 提现异构链网络ID(ETH:101, BSC:102, HECO:103, OKT:104, ONE:105, MATIC:106, KCS:107, TRX:108)
let heterogeneousChainId = 201;
// 提现资产信息
let withdrawalAssetChainId = 5;
let withdrawalAssetId = 171;
// 提现资产小数位
let withdrawalDecimals = 8;
// 提现手续费(NVT)
let withdrawalFee = '500';
let feeChain = 'NVT';

let remark = 'withdrawal transaction remark...';
//调用
withdrawalTest(pri, fromAddress, toAddress, heterogeneousChainId, withdrawalAssetChainId, withdrawalAssetId, withdrawalAmount, withdrawalDecimals, withdrawalFee, feeChain, remark);
// test();

async function test() {
    let result = await getHeterogeneousMainAsset(102);
    console.log(JSON.stringify(result));
}
/**
 * 异构链提现交易
 */
async function withdrawalTest(pri, fromAddress, toAddress, heterogeneousChainId, assetsChainId, assetsId, withdrawalAmount, withdrawalDecimals, withdrawalFee, feeChain, remark) {
    // 默认使用NVT作为跨链手续费
    if (!feeChain || feeChain == '') {
        feeChain = 'NVT';
    }
    // 获取手续费资产信息
    let feeCoin = NERVE_INFO.htgMainAsset[feeChain];
    let newAmount = timesDecimals(withdrawalAmount, withdrawalDecimals).toFixed();
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: toAddress,
        withdrawalFee: withdrawalFee,
        fee: 0,
        chainId: assetsChainId,
        assetId: assetsId,
        feeCoin: feeCoin,
        amount: newAmount,
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
        43,
        {
            heterogeneousAddress: toAddress,
            heterogeneousChainId: heterogeneousChainId
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
    let feeCoin = transferInfo.feeCoin;
    let withdrawalBalance = await getNulsBalance(transferInfo.fromAddress, transferInfo.chainId, transferInfo.assetId);
    let feeAmount = timesDecimals(transferInfo.withdrawalFee, feeCoin.decimals).toFixed();
    let inputs = [];
    if (transferInfo.chainId === feeCoin.chainId && transferInfo.assetId === feeCoin.assetId) {
        let newAmount = Plus(transferInfo.amount, feeAmount).toFixed();
        inputs.push({
            address: transferInfo.fromAddress,
            amount: newAmount,
            assetsChainId: transferInfo.chainId,
            assetsId: transferInfo.assetId,
            nonce: withdrawalBalance.data.nonce,
            locked: 0,
        });
    } else {
        let feeBalance = await getNulsBalance(transferInfo.fromAddress, feeCoin.chainId, feeCoin.assetId);
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
                amount: feeAmount,
                assetsChainId: feeCoin.chainId,
                assetsId: feeCoin.assetId,
                nonce: feeBalance.data.nonce,
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
            amount: feeAmount,
            assetsChainId: feeCoin.chainId,
            assetsId: feeCoin.assetId,
            locked: 0
        },
    ];
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}


