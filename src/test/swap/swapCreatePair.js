/**
 * 创建swap交易对
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '';
let tokenA = nerve.swap.token(5, 1);// 资产A的类型
let tokenB = nerve.swap.token(5, 6);// 资产B的类型
let remark = 'swap create pair remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.swapCreatePair(fromAddress, tokenA, tokenB, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}
