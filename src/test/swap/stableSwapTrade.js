/**
 * 移除Stable-Swap流动性
 */
const nerve = require('../../index');
const swap = nerve.swap;
// 设置网络环境
nerve.testnet();
const _chainId = nerve.chainId();
const _assetId = 1;

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
// 资产接收地址
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
// 交易对地址
let stablePairAddress = "TNVTdTSQkXMz7PGy5j48LfuQbAbVzHcYTMAzM";
// 交易手续费取出一部分给指定的接收地址
let feeTo = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let remark = 'stable swap trade remark...';
//调用
test();
async function test() {
    let txhex = await swap.stableSwapTrade(pri, fromAddress, stablePairAddress,
        [swap.tokenAmount(5, 6, "600000000"), swap.tokenAmount(5, 9, "90000000")],
        3, feeTo, swap.currentTime() + 300, toAddress, remark);
    console.log(txhex);
}

