const nerve = require('../index');
const {NERVE_INFOS, RPC_URL} = require('./htgConfig');

let isMainnet = true;
if (isMainnet) {
    nerve.mainnet();
} else {
    nerve.testnet();
}
let NERVE_INFO = nerve.chainId() == 9 ? NERVE_INFOS.mainnet : nerve.chainId() == 5 ? NERVE_INFOS.testnet : null;

const api_ethers = require('./api_ethers');
const util = require('./api/util');
const ethers = require("ethers");

const _l1GasUsedOnScroll = new ethers.utils.BigNumber(21000);
const _l1GasUsedOnOptimismOrBase = new ethers.utils.BigNumber(18000);
const _l1GasUsedOnManta = new ethers.utils.BigNumber(18000);
const scalarOnScroll = new ethers.utils.BigNumber(1150000000);
const dynamicOverheadOnOptimismOrBase = 684000000;
const precision = new ethers.utils.BigNumber(1000000000);
// TODO pierre Find the `L1 Fee Scalar` for manta, currently set to 1
const dynamicOverheadOnManta = new ethers.utils.BigNumber(1);

function getL1Fee(htgChainId, ethNetworkGasPrice) {
    switch (htgChainId) {
        case 115:
        case 129: return getL1FeeOnOptimismOrBase(_l1GasUsedOnOptimismOrBase, ethNetworkGasPrice);
        case 130: return getL1FeeOnScroll(_l1GasUsedOnScroll, ethNetworkGasPrice);
        case 133: return getL1FeeOnManta(_l1GasUsedOnManta, ethNetworkGasPrice);
        default: return new ethers.utils.BigNumber(0);
    }
}

function getL1FeeOnScroll(_l1GasUsed, ethNetworkGasPrice) {
    return _l1GasUsed.mul(ethNetworkGasPrice).mul(scalarOnScroll).div(precision);
}

function getL1FeeOnOptimismOrBase(_l1GasUsed, ethNetworkGasPrice) {
    return _l1GasUsed.mul(dynamicOverheadOnOptimismOrBase).mul(ethNetworkGasPrice).div(precision);
}

function getL1FeeOnManta(_l1GasUsed, ethNetworkGasPrice) {
    return _l1GasUsed.mul(dynamicOverheadOnManta).mul(ethNetworkGasPrice);
}

// 9-445 metis
// 9-446 iotx
// 9-447 op
// 9-448 klay
// 9-449 bch
async function getPrice(chainId, assetId) {
    let withdrawCoinPrice = await util.getSymbolPriceOfUsdt(chainId, assetId);
    console.log(withdrawCoinPrice, "withdrawCoinPrice", chainId + "-" + assetId);
}

// getPrice(9, 445);
// getPrice(9, 446);
// getPrice(9, 447);
// getPrice(9, 448);
// getPrice(9, 449);
917958010468536

// f();
// withdrawalToETH(isMainnet);
// withdrawalToOETH(isMainnet);
// withdrawalToKAVA(isMainnet);
// withdrawalToBSC(isMainnet);
// withdrawalToHECO(isMainnet);
// withdrawalToOKT(isMainnet);
// withdrawalToONE(isMainnet);
// withdrawalToMATIC(isMainnet);
// withdrawalToKCS(isMainnet);
// withdrawalToTRX(isMainnet);
// withdrawalToCRO(isMainnet);
// withdrawalToFTM(isMainnet);
// withdrawalToFTMByNVT(isMainnet);
// withdrawalToLineaByNVT(isMainnet);
// withdrawalToLineaByNVT(isMainnet);
// withdrawalToLineaByETH(isMainnet);
// withdrawalToLineaByETH(isMainnet);
// withdrawalToAvaxByNVT(isMainnet);
// withdrawalToAvaxByETH(isMainnet);
// withdrawalToPolygon(isMainnet);
// withdrawalToScrollByNVT(isMainnet);
// withdrawalToScrollByETH(isMainnet);
// withdrawalToSomeoneByNVT("SCROLL", isMainnet);
// withdrawalToSomeoneByETH("SCROLL", isMainnet);
// withdrawalToSomeoneByNVT("BASE", isMainnet);
// withdrawalToSomeoneByETH("BASE", isMainnet);
// withdrawalToSomeoneByNVT("OP", isMainnet);
// withdrawalToSomeoneByETH("OP", isMainnet);
withdrawalToL2SomeoneByETH("BASE", 129, isMainnet);

async function getWithdrawGas(provider) {
    return provider.getGasPrice().then((gasPrice) => {
        return gasPrice;
    });
}

async function withdrawalToL2SomeoneByETH(chain, htgChainId, isMainnet) {
    let feeNumber = await calcFee(chain, isMainnet, true, "ETH");
    console.log("提现到"+chain+"网络需要的ETH:" + feeNumber);
    let provider = new ethers.providers.JsonRpcProvider("https://geth.nerve.network");
    const gasPrice = await getWithdrawGas(provider);
    console.log(ethers.utils.formatUnits(gasPrice, 9), 'eth gasPrice');
    let l1Fee = getL1Fee(htgChainId, gasPrice);
    console.log("提现到"+chain+"网络需要L1Fee的ETH:" + l1Fee.toString());
}

async function withdrawalToOETH(isMainnet) {
    let feeNumber = await calcFee("OETH", isMainnet, true, "NVT");
    console.log("提现到OETH网络:" + feeNumber);
}

async function withdrawalToKAVA(isMainnet) {
    let feeNumber = await calcFee("KAVA", isMainnet, true, "NVT");
    console.log("提现到KAVA网络:" + feeNumber);
}

async function withdrawalToETH(isMainnet) {
    let feeNumber = await calcFee("ETH", isMainnet, true, "BNB");
    console.log("提现到ETH网络:" + feeNumber);
}

async function withdrawalToBSC(isMainnet) {
    let feeNumber = await calcFee("BNB", isMainnet, true, "NVT");
    console.log("提现到BSC网络:" + feeNumber);
}

async function withdrawalToHECO(isMainnet) {
    let feeNumber = await calcFee("HT", isMainnet, true, "ONE");
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
    let feeNumber = await calcFee("TRX", isMainnet, true, "NVT");
    console.log("提现到TRX网络:" + feeNumber);
}

async function withdrawalToCRO(isMainnet) {
    let feeNumber = await calcFee("CRO", isMainnet, true, "NVT");
    console.log("提现到CRO网络:" + feeNumber);
}

async function withdrawalToFTM(isMainnet) {
    let feeNumber = await calcFee("FTM", isMainnet, false, "FTM");
    console.log("提现到FTM网络:" + feeNumber);
}

async function withdrawalToFTMByNVT(isMainnet) {
    let feeNumber = await calcFee("FTM", isMainnet, false, "NVT");
    console.log("提现到FTM网络:" + feeNumber);
}

async function withdrawalToLineaByNVT(isMainnet) {
    let feeNumber = await calcFee("LINEA", isMainnet, true, "NVT");
    console.log("提现到LINEA网络:" + feeNumber);
    console.log("1.1倍+5个: ", Number(feeNumber) * 1.1 + 5)
    console.log("1.2倍+5个: ", Number(feeNumber) * 1.2 + 5)
    console.log("1.5倍+5个: ", Number(feeNumber) * 1.5 + 5)
}

async function withdrawalToLineaByETH(isMainnet) {
    let feeNumber = await calcFee("LINEA", isMainnet, true, "ETH");
    console.log("提现到LINEA网络:" + feeNumber);
    console.log("1.2倍: ", Number(feeNumber) * 1.2)
    console.log("1.5倍: ", Number(feeNumber) * 1.5)
}


async function withdrawalToScrollByNVT(isMainnet) {
    let feeNumber = await calcFee("SCROLL", isMainnet, true, "NVT");
    console.log("提现到SCROLL网络需要的NVT:" + feeNumber);
    console.log("1.1倍+5个: ", Number(feeNumber) * 1.1 + 5)
    console.log("1.2倍+5个: ", Number(feeNumber) * 1.2 + 5)
    console.log("1.5倍+5个: ", Number(feeNumber) * 1.5 + 5)
}

async function withdrawalToScrollByETH(isMainnet) {
    let feeNumber = await calcFee("SCROLL", isMainnet, true, "ETH");
    console.log("提现到SCROLL网络需要的ETH:" + feeNumber);
    console.log("1.2倍ETH: ", Number(feeNumber) * 1.2)
    console.log("1.5倍ETH: ", Number(feeNumber) * 1.5)
}

async function withdrawalToSomeoneByNVT(chain, isMainnet) {
    let feeNumber = await calcFee(chain, isMainnet, true, "NVT");
    console.log("提现到"+chain+"网络需要的NVT:" + feeNumber);
    // console.log("1.1倍+5个: ", Number(feeNumber) * 1.1 + 5)
    // console.log("1.2倍+5个: ", Number(feeNumber) * 1.2 + 5)
    // console.log("1.5倍+5个: ", Number(feeNumber) * 1.5 + 5)
    console.log(chain + ", 15倍+5个: ", Number(feeNumber) * 15 + 5)
    console.log(chain + ", 20倍+5个: ", Number(feeNumber) * 20 + 5)
    console.log(chain + ", 200倍+5个: ", Number(feeNumber) * 200 + 5)
}

async function withdrawalToSomeoneByETH(chain, isMainnet) {
    let feeNumber = await calcFee(chain, isMainnet, true, "ETH");
    console.log("提现到"+chain+"网络需要的ETH:" + feeNumber);
    // console.log("1.2倍ETH: ", Number(feeNumber) * 1.2)
    // console.log("1.5倍ETH: ", Number(feeNumber) * 1.5)
    console.log(chain + ", 15倍ETH: ", Number(feeNumber) * 15)
    console.log(chain + ", 20倍ETH: ", Number(feeNumber) * 20)
    console.log(chain + ", 2000倍ETH: ", Number(feeNumber) * 2000)
}

async function withdrawalToAvaxByNVT(isMainnet) {
    let feeNumber = await calcFee("AVAX", isMainnet, true, "NVT");
    console.log("提现到AVAX网络:" + feeNumber);
    console.log("1.2倍+5个: ", Number(feeNumber) * 1.2 + 5)
    console.log("1.5倍+5个: ", Number(feeNumber) * 1.5 + 5)
}

async function withdrawalToAvaxByETH(isMainnet) {
    let feeNumber = await calcFee("AVAX", isMainnet, true, "AVAX");
    console.log("提现到AVAX网络:" + feeNumber);
    console.log("1.2倍: ", Number(feeNumber) * 1.2)
    console.log("1.5倍: ", Number(feeNumber) * 1.5)
}

async function withdrawalToPolygon(isMainnet) {
    let feeNumber = await calcFee("MATIC", isMainnet, true, "HT");
    console.log("提现到Polygon网络:" + feeNumber);
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
    // let feeCoinPrice = await util.getSymbolPriceOfUsdt(feeCoin.chainId, feeCoin.assetId, 'FEE');
    let feeCoinPrice = await util.getSymbolPriceOfUsdt(feeCoin.chainId, feeCoin.assetId);
    let withdrawCoinPrice = await util.getSymbolPriceOfUsdt(withdrawCoin.chainId, withdrawCoin.assetId);
    console.log(feeCoinPrice, "feeCoinPrice", feeChain);
    console.log(withdrawCoinPrice, "withdrawCoinPrice", withdrawChain);
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



