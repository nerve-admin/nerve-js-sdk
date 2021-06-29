/**
 * 移除Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
let tokenAmountLP = nerve.swap.tokenAmount(5, 18, "2698778989");// 移除的资产LP的数量
let tokenAmountAMin = nerve.swap.tokenAmount(5, 1, "140000000000");// 资产A最小移除值
let tokenAmountBMin = nerve.swap.tokenAmount(5, 6, "100000000");// 资产B最小移除值
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 移除流动性份额接收地址
let remark = 'swap remove liquidity remark...';
//调用
test();
async function test() {
    let txhex = await nerve.swap.swapRemoveLiquidity(pri, fromAddress, tokenAmountLP,
        tokenAmountAMin, tokenAmountBMin, deadline, toAddress, remark);
    console.log(txhex);
}