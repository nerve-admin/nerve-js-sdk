/**
 * Swap币币交换
 */
const nerve = require('../../index');
// 设置网络环境
// nerve.mainnet();
// nerve.testnet();
nerve.customnet(5, "http://192.168.5.66:17004/jsonrpc");
const {acc0, acc1, acc2, acc3, acc4} = require('./testAcc');

const chainId = nerve.chainId();
// 账户信息
let pri = acc4().pri;
let fromAddress = nerve.getAddressByPri(chainId, pri);
let amountIn = "500000000";// 卖出的资产数量
let tokenPath = [nerve.swap.token(chainId, 1),  nerve.swap.token(chainId, 9)];// 币币交换资产路径，路径中最后一个资产，是稳定币LP资产
let amountOutMin = "0";// 最小买进的资产数量
let feeTo = null;// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = fromAddress;// 资产接收地址
let targetToken = nerve.swap.token(chainId, 5);// 撤销稳定币流动性换出的资产
let remark = 'swapTradeStableRemoveLp remark';
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



