/**
 * Swap币币交换
 */
const nerve = require('../../index');
// 设置网络环境
// nerve.testnet();
nerve.customnet(5, "http://192.168.1.39:17004/jsonrpc");

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '4594348E3482B751AA235B8E580EFEF69DB465B3A291C5662CEDA6459ED12E39';
let amountIn = "20100000000";// 卖出的资产数量
let tokenPath = [nerve.swap.token(5, 1), nerve.swap.token(5, 1), nerve.swap.token(5, 1)];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
let amountOutMin = "0";// 最小买进的资产数量
let feeTo = null;// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";// 资产接收地址
let remark = 'swap trade remark...';
//调用
test1();
async function test() {
    let tx = await nerve.swap.swapTrade(fromAddress, amountIn, tokenPath, amountOutMin,
        feeTo, deadline, toAddress, remark);
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

async function test1() {
    let txHex = "3f00212eed6013746573742072656d61726b20636f6e74656e74490000000000000000000000000000000000000000000000000000000000000000050001b9978dbea4abebb613b6be2d0d66b4179d2511cb00ee2fed60030500010005000100050003008c0117050001b9978dbea4abebb613b6be2d0d66b4179d2511cb0500010000a90dae0400000000000000000000000000000000000000000000000000000008e97fb78a6b5c97b400011705000444bbf88ae1b9bff4e07827fb363eea3362f868f40500010000a90dae04000000000000000000000000000000000000000000000000000000000000000000000000";
    // 签名交易
    let signedTx = nerve.appendSignature(txHex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    let result = await nerve.broadcastTx(signedTx.data.hex);
    console.log('result: ' + result);
}


