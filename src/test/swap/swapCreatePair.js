/**
 * 创建swap交易对
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

let remark = 'swap create pair remark...';
//调用
test();
async function test() {
    let txhex = await swap.swapCreatePair(pri, fromAddress, swap.token(5, 1), swap.token(5, 6), remark);
    console.log(txhex);
}
