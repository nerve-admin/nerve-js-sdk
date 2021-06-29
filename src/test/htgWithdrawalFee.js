const nerve = require('../index');
const api_ethers = require('./api_ethers');
const util = require('./api/util');
// NERVE 网络资产信息
const NERVE_ASSET_INFO = {
    testnet: {
        nvt: {
            chainId: 5,
            assetId: 1
        },
        eth: {
            chainId: 5,
            assetId: 2
        },
        bnb: {
            chainId: 5,
            assetId: 8
        },
        ht: {
            chainId: 5,
            assetId: 9
        },
        okt: {
            chainId: 5,
            assetId: 12
        }
    },
    mainnet: {
        nvt: {
            chainId: 9,
            assetId: 1
        },
        eth: {
            chainId: 9,
            assetId: 2
        },
        bnb: {
            chainId: 9,
            assetId: 25
        },
        ht: {
            chainId: 9,
            assetId: 55
        },
        okt: {
            chainId: 9,
            assetId: 87
        }
    }
};

withdrawalToETH();
withdrawalToBSC();
withdrawalToHECO();
withdrawalToOKT();

async function withdrawalToETH() {
    let provider = api_ethers.getProvider("ETH", "test");
    let nvt = NERVE_ASSET_INFO.testnet.nvt;
    let eth = NERVE_ASSET_INFO.testnet.eth;
    let nvtPrice = await util.getSymbolPriceOfUsdt(nvt.chainId, nvt.assetId);
    let ethPrice = await util.getSymbolPriceOfUsdt(eth.chainId, eth.assetId);
    let result = await api_ethers.calNVTOfWithdrawTest(provider, nvtPrice, ethPrice, true);
    console.log("提现到eth网络:" + result.toString());
}

async function withdrawalToBSC() {
    let provider = api_ethers.getProvider("BNB", "test");
    let nvt = NERVE_ASSET_INFO.testnet.nvt;
    let bnb = NERVE_ASSET_INFO.testnet.bnb;
    let nvtPrice = await util.getSymbolPriceOfUsdt(nvt.chainId, nvt.assetId);
    let bnbPrice = await util.getSymbolPriceOfUsdt(bnb.chainId, bnb.assetId);
    let result = await api_ethers.calNVTOfWithdrawTest(provider, nvtPrice, bnbPrice, true);
    console.log("提现到bsc网络:" + result.toString());
}

async function withdrawalToHECO() {
    let provider = api_ethers.getProvider("HT", "test");
    let nvt = NERVE_ASSET_INFO.testnet.nvt;
    let ht = NERVE_ASSET_INFO.testnet.ht;
    let nvtPrice = await util.getSymbolPriceOfUsdt(nvt.chainId, nvt.assetId);
    let htPrice = await util.getSymbolPriceOfUsdt(ht.chainId, ht.assetId);
    let result = await api_ethers.calNVTOfWithdrawTest(provider, nvtPrice, htPrice, true);
    console.log("提现到heco网络:" + result.toString());
}

async function withdrawalToOKT() {
    let provider = api_ethers.getProvider("OKT", "test");
    let nvt = NERVE_ASSET_INFO.testnet.nvt;
    let okt = NERVE_ASSET_INFO.testnet.okt;
    let nvtPrice = await util.getSymbolPriceOfUsdt(nvt.chainId, nvt.assetId);
    let oktPrice = await util.getSymbolPriceOfUsdt(okt.chainId, okt.assetId);
    let result = await api_ethers.calNVTOfWithdrawTest(provider, nvtPrice, oktPrice, true);
    console.log("提现到okt网络:" + result.toString());
}




