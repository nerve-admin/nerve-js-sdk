const nerve = require('../index');

let isMainnet = false;
if (isMainnet) {
    nerve.mainnet();
} else {
    nerve.testnet();
}
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
        },
        one: {
            chainId: 5,
            assetId: 33
        },
        matic: {
            chainId: 5,
            assetId: 34
        },
        kcs: {
            chainId: 5,
            assetId: 35
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

// withdrawalToETH(isMainnet);
// withdrawalToBSC(isMainnet);
// withdrawalToHECO(isMainnet);
// withdrawalToOKT(isMainnet);
withdrawalToONE(isMainnet);
// withdrawalToMATIC(isMainnet);
// withdrawalToKCS(isMainnet);

async function withdrawalToETH(isMainnet) {
    let nvtNumber = await calcFee("ETH", isMainnet);
    console.log("提现到ETH网络:" + nvtNumber);
}

async function withdrawalToBSC(isMainnet) {
    let nvtNumber = await calcFee("BNB", isMainnet);
    console.log("提现到BSC网络:" + nvtNumber);
}

async function withdrawalToHECO(isMainnet) {
    let nvtNumber = await calcFee("HT", isMainnet);
    console.log("提现到HECO网络:" + nvtNumber);
}

async function withdrawalToOKT(isMainnet) {
    let nvtNumber = await calcFee("OKT", isMainnet);
    console.log("提现到OKT网络:" + nvtNumber);
}

async function withdrawalToONE(isMainnet) {
    let nvtNumber = await calcFee("ONE", isMainnet);
    console.log("提现到ONE网络:" + nvtNumber);
}

async function withdrawalToMATIC(isMainnet) {
    let nvtNumber = await calcFee("MATIC", isMainnet);
    console.log("提现到MATIC网络:" + nvtNumber);
}

async function withdrawalToKCS(isMainnet) {
    let nvtNumber = await calcFee("KCS", isMainnet);
    console.log("提现到KCS网络:" + nvtNumber);
}

async function calcFee(chain, isMainnet) {
    let provider = api_ethers.getProvider(chain, isMainnet ? "main" : "test");
    let net = isMainnet ? "mainnet" : "testnet";
    let nvt = NERVE_ASSET_INFO[net].nvt;
    let htg = NERVE_ASSET_INFO[net][chain.toLowerCase()];
    let nvtPrice = await util.getSymbolPriceOfUsdt(nvt.chainId, nvt.assetId);
    let htgPrice = await util.getSymbolPriceOfUsdt(htg.chainId, htg.assetId);
    let result = await api_ethers.calNVTOfWithdrawTest(provider, nvtPrice, htgPrice, true);
    return api_ethers.formatNVT(result);
}




