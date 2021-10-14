const nerve = require('../index');
const {NERVE_INFOS} = require('./htgConfig');

let isMainnet = false;
if (isMainnet) {
    nerve.mainnet();
} else {
    nerve.testnet();
}
let NERVE_INFO = nerve.chainId() == 9 ? NERVE_INFOS.mainnet : nerve.chainId() == 5 ? NERVE_INFOS.testnet : null;

const api_ethers = require('./api_ethers');
const util = require('./api/util');

// f();
// withdrawalToETH(isMainnet);
// withdrawalToBSC(isMainnet);
// withdrawalToHECO(isMainnet);
// withdrawalToOKT(isMainnet);
// withdrawalToONE(isMainnet);
// withdrawalToMATIC(isMainnet);
// withdrawalToKCS(isMainnet);
withdrawalToTRX(isMainnet);

async function withdrawalToETH(isMainnet) {
    let feeNumber = await calcFee("ETH", isMainnet, true, "NVT");
    console.log("提现到ETH网络:" + feeNumber);
}

async function withdrawalToBSC(isMainnet) {
    let feeNumber = await calcFee("BNB", isMainnet, true, "TRX");
    console.log("提现到BSC网络:" + feeNumber);
}

async function withdrawalToHECO(isMainnet) {
    let feeNumber = await calcFee("HT", isMainnet, true, "NVT");
    console.log("提现到HECO网络:" + feeNumber);
}

async function withdrawalToOKT(isMainnet) {
    let feeNumber = await calcFee("OKT", isMainnet, true, "NVT");
    console.log("提现到OKT网络:" + feeNumber);
}

async function withdrawalToONE(isMainnet) {
    let feeNumber = await calcFee("ONE", isMainnet, true, "NVT");
    console.log("提现到ONE网络:" + feeNumber);
}

async function withdrawalToMATIC(isMainnet) {
    let feeNumber = await calcFee("MATIC", isMainnet, true, "NVT");
    console.log("提现到MATIC网络:" + feeNumber);
}

async function withdrawalToKCS(isMainnet) {
    let feeNumber = await calcFee("KCS", isMainnet, true, "NVT");
    console.log("提现到KCS网络:" + feeNumber);
}

async function withdrawalToTRX(isMainnet) {
    let feeNumber = await calcFee("TRX", isMainnet, true, "BNB");
    console.log("提现到TRX网络:" + feeNumber);
}

async function calcFee(withdrawChain, isMainnet, isToken, feeChain) {
    // 默认使用NVT作为跨链手续费
    if (!feeChain || feeChain === '') {
        feeChain = 'NVT';
    }
    if (withdrawChain === 'TRX') {
        return calcFeeForTRX(isMainnet, isToken, feeChain);
    }
    let provider = api_ethers.getProvider(withdrawChain, isMainnet ? "main" : "test");
    let withdrawCoin = NERVE_INFO.htgMainAsset[withdrawChain];
    if (feeChain === withdrawChain) {
        let result = await api_ethers.calcMainAssetOfWithdrawProtocol15Test(provider, isToken);
        return api_ethers.formatOtherMainAsset(result, withdrawCoin);
    }
    // 获取资产信息
    let feeCoin = NERVE_INFO.htgMainAsset[feeChain];
    let feeCoinPrice = await util.getSymbolPriceOfUsdt(feeCoin.chainId, feeCoin.assetId);
    let withdrawCoinPrice = await util.getSymbolPriceOfUsdt(withdrawCoin.chainId, withdrawCoin.assetId);
    // console.log(feeCoinPrice, "feeCoinPrice", feeChain);
    // console.log(withdrawCoinPrice, "withdrawCoinPrice", withdrawChain);
    let result = await api_ethers.calcOtherMainAssetOfWithdrawTest(provider, feeCoin, feeCoinPrice, withdrawCoinPrice, isToken);
    return api_ethers.formatOtherMainAsset(result, feeCoin);
}

async function calcFeeForTRX(isMainnet, isToken, feeChain) {
    let withdrawChain = 'TRX';
    let withdrawCoin = NERVE_INFO.htgMainAsset[withdrawChain];
    if (feeChain === withdrawChain) {
        return api_ethers.formatOtherMainAsset(NERVE_INFO.trxWithdrawFee, withdrawCoin);
    }
    // 获取资产信息
    let feeCoin = NERVE_INFO.htgMainAsset[feeChain];
    let feeCoinPrice = await util.getSymbolPriceOfUsdt(feeCoin.chainId, feeCoin.assetId);
    let withdrawCoinPrice = await util.getSymbolPriceOfUsdt(withdrawCoin.chainId, withdrawCoin.assetId);
    // console.log(feeCoinPrice, "feeCoinPrice", feeChain);
    // console.log(withdrawCoinPrice, "withdrawCoinPrice", withdrawChain);
    let result = await api_ethers.calcOtherMainAssetOfWithdrawForTRX(feeCoin, feeCoinPrice, withdrawCoinPrice, NERVE_INFO.trxWithdrawFee);
    return api_ethers.formatOtherMainAsset(result, feeCoin);
}

async function f() {
    let provider = api_ethers.getProvider("BNB", "test");
    let nvtFeeCoin = NERVE_INFO.htgMainAsset['NVT'];
    let nvtPrice = '0.0355';
    let htgPrice = '504.482';
    let result = await api_ethers.calcOtherMainAssetOfWithdrawTest(provider, nvtFeeCoin, nvtPrice, htgPrice, true);
    console.log(api_ethers.formatNVT(result));
}



