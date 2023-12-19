/**
 * Swap币币交换
 */
const nerve = require('../../index');
// 设置网络环境
// nerve.testnet();
nerve.mainnet();
// nerve.customnet(5, "http://192.168.1.39:17004/jsonrpc");

// 账户信息
let fromAddress = "NERVEepb65mFoxeXfQN5KgeKxRTfufKekBAn3C";
let pri = '';
let stablePairAddress = "NERVEepb7WDfEU4ZKsEFmwCfGwCaYWgdHgk5tW";// 稳定币交易对地址
let amountIn = "6511219"; // 卖出的资产数量
let tokenPath = [nerve.swap.token(9, 706), nerve.swap.token(9, 388), nerve.swap.token(9, 1), nerve.swap.token(9, 704)];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
let amountOutMin = "0";// 最小买进的资产数量
let feeTo = null;// 交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "NERVEepb65mFoxeXfQN5KgeKxRTfufKekBAn3C";// 资产接收地址
let remark = 'stable lp swap trade remark 0.628527736936315348 usdt to 50 nvt';
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
    // let result = await nerve.broadcastTx(signedTx.data.hex);
    // console.log('result: ' + result);
}


