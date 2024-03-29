/**
 * 添加Stable-Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '';
let stablePairAddress = "TNVTdTSQkXMz7PGy5j48LfuQbAbVzHcYTMAzM";// 交易对地址
let tokenAmounts = [nerve.swap.tokenAmount(5, 6, "60000000000"), nerve.swap.tokenAmount(5, 7, "700000000"),
    nerve.swap.tokenAmount(5, 8, "800000000"), nerve.swap.tokenAmount(5, 9, "900000000")];// 添加的资产数量列表
let deadline = nerve.swap.currentTime() + 300;// 到期时间
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 流动性份额接收地址
let remark = 'stable swap add liquidity remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.stableSwapAddLiquidity(fromAddress, stablePairAddress,
        tokenAmounts, deadline, toAddress, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}
