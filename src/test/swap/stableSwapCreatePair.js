/**
 * 创建稳定币Swap交易对
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
let coins = [nerve.swap.token(5, 6), nerve.swap.token(5, 9), nerve.swap.token(5, 7), nerve.swap.token(5, 8)];
let remark = 'stable swap create pair remark...';
//调用
test();
async function test() {
    let txhex = await nerve.swap.stableSwapCreatePair(pri, fromAddress, coins, remark);
    console.log(txhex);
}
