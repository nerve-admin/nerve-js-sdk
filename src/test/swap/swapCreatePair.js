/**
 * 创建swap交易对
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
let tokenA = nerve.swap.token(5, 1);// 资产A的类型
let tokenB = nerve.swap.token(5, 6);// 资产B的类型
let remark = 'swap create pair remark...';
//调用
test();
async function test() {
    let txhex = await nerve.swap.swapCreatePair(pri, fromAddress, tokenA, tokenB, remark);
    console.log(txhex);
}
