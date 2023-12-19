/**
 * Swap币币交换
 */
const nerve = require('../../index');
// 设置网络环境
nerve.mainnet();
// nerve.testnet();
// nerve.customnet(5, "http://192.168.1.171:17004/jsonrpc");

// 账户信息
let fromAddress = "NERVEepb6CHoQvfNo9Ud4KZFCX6R7dbK4GtzVx";
let pri = '';
let amountIn = "5000000000";// 卖出的资产数量
let tokenPath = [nerve.swap.token(9, 1),  nerve.swap.token(9, 220)];// 币币交换资产路径，路径中最后一个资产，是稳定币LP资产
let amountOutMin = "0";// 最小买进的资产数量
let feeTo = null;// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "NERVEepb6CHoQvfNo9Ud4KZFCX6R7dbK4GtzVx";// 资产接收地址
let targetToken = nerve.swap.token(9, 195);// 撤销稳定币流动性换出的资产
let remark = 'swap trade remark 50 nvt to 0.628527736172093262 usdt';
//调用
test();

async function test() {
    let tx = await nerve.swap.swapTradeStableRemoveLp(fromAddress, amountIn, tokenPath, amountOutMin,
        feeTo, deadline, toAddress, targetToken, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    let result = await nerve.broadcastTx(signedTx.data.hex);
    console.log('result: ' + result);
}



