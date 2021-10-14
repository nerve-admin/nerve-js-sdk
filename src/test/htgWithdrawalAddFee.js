const nerve = require('../index');
nerve.testnet();
const sdk = require('../api/sdk');
const {NERVE_INFOS, Plus, timesDecimals} = require('./htgConfig');

const {getNulsBalance, validateTx, broadcastTx} = require('./api/util');

// 总共需要的BNB: 0.002100000000000000, 用户提供的BNB: 0.001230000000000000, 需要追加的BNB: 0.000870000000000000
let NERVE_INFO = nerve.chainId() == 9 ? NERVE_INFOS.mainnet : nerve.chainId() == 5 ? NERVE_INFOS.testnet : null;

// 设置追加手续费的账户，必须与提现账户一致
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '4594348E3482B751AA235B8E580EFEF69DB465B3A291C5662CEDA6459ED12E39';

// 发出的提现交易hash
let withdrawalTxHash = '1f7637f1b876ecc7300155b3bfd57c349f6cf8734cb4783252fdd825dcb309ef';
// 追加的NVT手续费，此处设置为追加2个NVT
let addFeeAmount = '0.000870000000000000';
let feeChain = 'BNB';

let remark = 'withdrawal add fee transaction remark...';
//调用
withdrawalAddFeeTest(pri, fromAddress, withdrawalTxHash, addFeeAmount, feeChain, remark);

/**
 * 异构链提现追加手续费交易
 */
async function withdrawalAddFeeTest(pri, fromAddress, withdrawalTxHash, addFeeAmount, feeChain, remark) {
    // 默认使用NVT作为跨链手续费
    if (!feeChain || feeChain == '') {
        feeChain = 'NVT';
    }
    // 获取手续费资产信息
    let feeCoin = NERVE_INFO.htgMainAsset[feeChain];
    let feeAddress = nerve.getAddressByPub(NERVE_INFO.chainId, NERVE_INFO.assetId, NERVE_INFO.feePubkey, NERVE_INFO.prefix);
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: feeAddress,//this.info.blockHoleAddress,
        fee: 0,
        chainId: feeCoin.chainId,
        assetId: feeCoin.assetId,
        feeCoin: feeCoin,
        amount: addFeeAmount,
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
    let feeCoin = transferInfo.feeCoin;
    let balanceInfo = await getNulsBalance(transferInfo.fromAddress, transferInfo.chainId, transferInfo.assetId);
    let inAmount = timesDecimals(transferInfo.amount, feeCoin.decimals).toFixed();
    let outAmount = inAmount;
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



