/**
 * 添加Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();
// nerve.customnet(5, "http://192.168.1.110:17003/")

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
let tokenAmountA = nerve.swap.tokenAmount(5, 1, "140000000000");// 添加的资产A的数量
let tokenAmountB = nerve.swap.tokenAmount(5, 6, "100000000");// 添加的资产B的数量
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let amountAMin = "140000000000";// 资产A最小添加值
let amountBMin = "100000000";// 资产B最小添加值
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 流动性份额接收地址
let remark = 'swap add liquidity remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.swapAddLiquidity(fromAddress, tokenAmountA, tokenAmountB,
        amountAMin, amountBMin, deadline, toAddress, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}
