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
let tokenAmountLP = nerve.swap.tokenAmount(5, 18, "2698778989");// 移除的资产LP的数量
let receiveOrderIndexs = [0, 2, 3, 1];// 按币种索引顺序接收资产
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 移除流动性份额接收地址
let remark = 'stable swap remove liquidity remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.stableSwapRemoveLiquidity(fromAddress, stablePairAddress,
        tokenAmountLP, receiveOrderIndexs, deadline, toAddress, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}

