const {NERVE_INFO, HTGNET} = require('./htgConfig');

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



// crossMainAssetTest();
crossTokenTest();
// approveCrossTokenTest();

// 跨链转入异构链主资产, 示例为HT
async function crossMainAssetTest() {
    // 选择异构链网络的RPC服务
    // Heco - HT
    // Binance - BNB
    // Ethereum - ETH
    let provider = getProvider("HT", HTGNET);
    // 转出地址
    let fromAddress = "0x9484b26cba3c52161d2d320395da94e336e8a3cd";
    let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
    let amount = "0.125";
    let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
    let multySignContractAddress = "0xb339211438Dcbf3D00d7999ad009637472FC72b3";
    let result = await sendETH(pri, fromAddress, provider, multySignContractAddress, toAddress, amount);
    console.log(JSON.stringify(result));
}

// 跨链转入异构链ERC20标准的token资产, 示例为USDT(0x02e1afeef2a25eabd0362c4ba2dc6d20ca638151)
async function crossTokenTest() {
    // 选择异构链网络的RPC服务
    // Heco - HT
    // Binance - BNB
    // Ethereum - ETH
    let provider = getProvider("HT", HTGNET);
    // 转出地址
    let fromAddress = "0x9484b26cba3c52161d2d320395da94e336e8a3cd";
    let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
    let amount = "0.128";
    let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
    let tokenContract = "0x02e1afeef2a25eabd0362c4ba2dc6d20ca638151";
    let tokenDecimals = 6;
    let multySignContractAddress = "0xb339211438Dcbf3D00d7999ad009637472FC72b3";
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
    let provider = getProvider("HT", HTGNET);
    // 转出地址
    let fromAddress = "0x9484b26cba3c52161d2d320395da94e336e8a3cd";
    let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
    let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
    let tokenContract = "0x02e1afeef2a25eabd0362c4ba2dc6d20ca638151";
    let multySignContractAddress = "0xb339211438Dcbf3D00d7999ad009637472FC72b3";
    let result = await approveERC20(pri, fromAddress, provider, tokenContract, multySignContractAddress);
    console.log(JSON.stringify(result));
}


