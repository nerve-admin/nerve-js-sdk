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
let stablePairAddress = "TNVTdTSQjmPidBfvZdjbS3js5A9cidYcyt3Mu";// 稳定币交易对地址
let amountIn = "20000000"; //nerve.swap.tokenAmount(5, 2, "20000000");// 卖出的资产数量
let tokenPath = [nerve.swap.token(5, 2), nerve.swap.token(5, 14), nerve.swap.token(5, 1)];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
let amountOutMin = "0";// 最小买进的资产数量
let feeTo = null;// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";// 资产接收地址
let remark = 'stable lp swap trade remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.stableLpSwapTrade(fromAddress, stablePairAddress, amountIn, tokenPath, amountOutMin,
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


