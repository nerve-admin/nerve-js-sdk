/**
 * Swap币币交换
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
let amountIn = "1000000000";// 卖出的资产数量
let tokenPath = [nerve.swap.token(5, 1), nerve.swap.token(5, 6)];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
let amountOutMin = "9899567";// 最小买进的资产数量
let feeTo = null;// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 资产接收地址
let remark = 'swap trade remark...';
//调用
test();
async function test() {
    let txhex = await nerve.swap.swapTrade(pri, fromAddress, amountIn, tokenPath, amountOutMin,
        feeTo, deadline, toAddress, remark);
    console.log(txhex);
}
