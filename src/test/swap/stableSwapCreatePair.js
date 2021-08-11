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
let symbol = '';// LP名称（选填）
let remark = 'stable swap create pair remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.stableSwapCreatePair(fromAddress, coins, symbol, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}
