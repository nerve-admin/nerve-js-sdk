"use strict";

const BigNumber = require('bignumber.js');

//异构网络信息 测试网:test, 主网:main
const HTGNET = 'test';

const RPC_URL = {
    BNB: {
        test: "https://endpoints.omniatech.io/v1/bsc/testnet/public",
        main: "https://bsc-dataseed1.defibit.io/"
    },
    HT: {
        test: "https://http-testnet.hecochain.com",
        main: "https://http-mainnet.hecochain.com"
    },
    OKT: {
        test: "https://exchaintestrpc.okex.org",
        main: "https://exchainrpc.okex.org"
    },
    ONE: {
        test: "https://api.s0.b.hmny.io/",
        main: "https://api.s0.t.hmny.io"
    },
    MATIC: {
        test: "https://rpc-mumbai.maticvigil.com",
        main: "https://rpc-mainnet.maticvigil.com"
    },
    KCS: {
        test: "https://rpc-testnet.kcc.network",
        main: "https://rpc-mainnet.kcc.network"
    },
    CRO: {
        test: "https://cronos-testnet-3.crypto.org:8545",
        main: "https://evm.cronos.org"
    },
    FTM: {
        test: "https://rpc.testnet.fantom.network",
        main: "https://rpc.ftm.tools"
    },
    KAVA: {
        test: "https://evm.testnet.kava.io",
        main: "https://evm.kava.io"
    },
    OETH: {
        test: "https://endpoints.omniatech.io/v1/op/goerli/public\t",
        main: "https://endpoints.omniatech.io/v1/op/mainnet/public"
    }
};

// NERVE 网络基本信息
const NERVE_INFOS = {
    testnet: {
        chainId: 5,
        assetId: 1,
        prefix: "TNVT",
        symbol: "NVT",
        decimals: 8,
        blackHolePublicKey: "000000000000000000000000000000000000000000000000000000000000000000",
        blockHoleAddress: "TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY",
        feePubkey: "111111111111111111111111111111111111111111111111111111111111111111",
        htgMainAsset: {
            NVT:    {chainId: 5, assetId: 1,  decimals: 8},
            ETH:    {chainId: 5, assetId: 2,  decimals: 18},
            BNB:    {chainId: 5, assetId: 8,  decimals: 18},
            HT:     {chainId: 5, assetId: 9,  decimals: 18},
            OKT:    {chainId: 5, assetId: 12, decimals: 18},
            ONE:    {chainId: 5, assetId: 33, decimals: 18},
            MATIC:  {chainId: 5, assetId: 34, decimals: 18},
            KCS:    {chainId: 5, assetId: 35, decimals: 18},
            TRX:    {chainId: 5, assetId: 55, decimals: 6},
            CRO:    {chainId: 5, assetId: 93, decimals: 18},
            FTM:    {chainId: 5, assetId: 0, decimals: 18}
        },
        trxWithdrawFee: '60000000'
    },
    mainnet: {
        chainId: 9,
        assetId: 1,
        prefix: "NERVE",
        symbol: "NVT",
        decimals: 8,
        blackHolePublicKey: "000000000000000000000000000000000000000000000000000000000000000000",
        blockHoleAddress: "NERVEepb63T1M8JgQ26jwZpZXYL8ZMLdUAK31L",
        feePubkey: "111111111111111111111111111111111111111111111111111111111111111111",
        htgMainAsset: {
            NVT:    {chainId: 9, assetId: 1,   decimals: 8},
            ETH:    {chainId: 9, assetId: 2,   decimals: 18},
            BNB:    {chainId: 9, assetId: 25,  decimals: 18},
            HT:     {chainId: 9, assetId: 55,  decimals: 18},
            OKT:    {chainId: 9, assetId: 87,  decimals: 18},
            ONE:    {chainId: 9, assetId: 159, decimals: 18},
            MATIC:  {chainId: 9, assetId: 160, decimals: 18},
            KCS:    {chainId: 9, assetId: 161, decimals: 18},
            TRX:    {chainId: 9, assetId: 218, decimals: 6},
            CRO:    {chainId: 9, assetId: 266, decimals: 18},
            FTM:    {chainId: 9, assetId: 269, decimals: 18},
           KAVA:    {chainId: 9, assetId: 597, decimals: 18},
           OETH:    {chainId: 9, assetId: 447, decimals: 18}
        },
        trxWithdrawFee: '60000000'
    }
};

function Power(arg) {
    let newPower = new BigNumber(10);
    return newPower.pow(arg);
}

function Plus(nu, arg) {
    let newPlus = new BigNumber(nu);
    return newPlus.plus(arg);
}

function Times(nu, arg) {
    let newTimes = new BigNumber(nu);
    return newTimes.times(arg);
}

function divisionDecimals(nu, decimals = '') {
    let newDecimals = decimals ? decimals : NERVE_INFO.decimals;
    if (newDecimals === 0) {
        return nu
    }
    let newNu = new BigNumber(Division(nu, Power(newDecimals)));
    return newNu.toFormat().replace(/[,]/g, '');
}

function timesDecimals(nu, decimals) {
    let newDecimals = decimals ? decimals : NERVE_INFO.decimals;
    if (decimals === 0) {
        return nu
    }
    let newNu = new BigNumber(Times(nu, Power(newDecimals)));
    return newNu;
}

function Minus(nu, arg) {
    let newMinus = new BigNumber(nu);
    return newMinus.minus(arg);
}

module.exports = {NERVE_INFOS, HTGNET, RPC_URL, Minus, Plus, timesDecimals}
