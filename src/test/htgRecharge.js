const {HTGNET} = require('./htgConfig');

const {
    getProvider,
    getEthBalance,
    getERC20Balance,
    isNeedApprovedERC20,
    approveERC20,
    sendETH,
    sendERC20,
    validateAddress
} = require('./api_ethers');
// NERVE网络信息
const NERVE_INFO = {
    chainId: 5,
    assetId: 1,
    prefix: "TNVT",
    symbol: "TNVT",
    decimals: 8,
    blackHolePublicKey: "000000000000000000000000000000000000000000000000000000000000000000",
    blockHoleAddress: "TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY",
    feePubkey: "111111111111111111111111111111111111111111111111111111111111111111"
};


crossMainAssetTest();
// crossTokenTest();
// approveCrossTokenTest();

// 跨链转入异构链主资产, 示例为HT
async function crossMainAssetTest() {
    // 选择异构链网络的RPC服务
    // Heco - HT
    // Binance - BNB
    // Ethereum - ETH
    let provider = getProvider("BNB", HTGNET);
    // 转出地址
    let fromAddress = "0xc11D9943805e56b630A401D4bd9A29550353EFa1";
    let pri = '';
    let amount = "0.0125";
    let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    let multySignContractAddress = "0xf85f03C3fAAC61ACF7B187513aeF10041029A1b2";
    let result = await sendETH(pri, fromAddress, provider, multySignContractAddress, toAddress, amount);
    console.log(JSON.stringify(result));
}

// 跨链转入异构链ERC20标准的token资产, 示例为USDT(0x02e1afeef2a25eabd0362c4ba2dc6d20ca638151)
async function crossTokenTest() {
    // 选择异构链网络的RPC服务
    // Heco - HT
    // Binance - BNB
    // Ethereum - ETH
    let provider = getProvider("BNB", HTGNET);
    // 转出地址
    let fromAddress = "0xc11D9943805e56b630A401D4bd9A29550353EFa1";
    let pri = '';
    let amount = "0.128";
    let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    let tokenContract = "0x02e1aFEeF2a25eAbD0362C4Ba2DC6d20cA638151";
    let tokenDecimals = 18;
    let multySignContractAddress = "0xf85f03C3fAAC61ACF7B187513aeF10041029A1b2";
    // 检查是否已经授权
    let isNeedApproved = await isNeedApprovedERC20(provider, tokenContract, multySignContractAddress, fromAddress);
    if (isNeedApproved) {
        throw "请先授权, 调用授权函数`approveERC20`"
    }
    let result = await sendERC20(pri, fromAddress, provider, tokenContract, multySignContractAddress, toAddress, tokenDecimals, amount);
    console.log(JSON.stringify(result));
}

// 授权-ERC20跨链转入, 示例为USDT(0x02e1afeef2a25eabd0362c4ba2dc6d20ca638151)
async function approveCrossTokenTest() {
    // 选择异构链网络的RPC服务
    // Heco - HT
    // Binance - BNB
    // Ethereum - ETH
    let provider = getProvider("BNB", HTGNET);
    // 转出地址
    let fromAddress = "0xc11D9943805e56b630A401D4bd9A29550353EFa1";
    let pri = '';
    let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    let tokenContract = "0x02e1aFEeF2a25eAbD0362C4Ba2DC6d20cA638151";
    let multySignContractAddress = "0xf85f03C3fAAC61ACF7B187513aeF10041029A1b2";
    let result = await approveERC20(pri, fromAddress, provider, tokenContract, multySignContractAddress);
    console.log(JSON.stringify(result));
}


