/**
 * 移除Stable-Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';

let stablePairAddress = "TNVTdTSQkXMz7PGy5j48LfuQbAbVzHcYTMAzM";// 交易对地址
let amountIns = [nerve.swap.tokenAmount(5, 6, "600000000"), nerve.swap.tokenAmount(5, 9, "90000000")];// 卖出的资产数量列表
let tokenOutIndex = 3;// 买进的资产索引
let feeTo = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 资产接收地址
let remark = 'stable swap trade remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.stableSwapTrade(fromAddress, stablePairAddress,
        amountIns, tokenOutIndex, feeTo, deadline, toAddress, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}

