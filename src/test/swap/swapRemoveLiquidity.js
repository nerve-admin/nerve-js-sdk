/**
 * 移除Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '';
let tokenAmountLP = nerve.swap.tokenAmount(5, 18, "2698778989");// 移除的资产LP的数量
let tokenAmountAMin = nerve.swap.tokenAmount(5, 1, "140000000000");// 资产A最小移除值
let tokenAmountBMin = nerve.swap.tokenAmount(5, 6, "100000000");// 资产B最小移除值
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 移除流动性份额接收地址
let remark = 'swap remove liquidity remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.swapRemoveLiquidity(fromAddress, tokenAmountLP,
        tokenAmountAMin, tokenAmountBMin, deadline, toAddress, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}
