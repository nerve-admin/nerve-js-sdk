/**
 * 移除Stable-Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPRMtpGNYRx98WkoqKnExU9pWDQjNPf";
let pri = '76b7beaa98db863fb680def099af872978209ed9422b7acab8ab57ad95ab218b';

let stablePairAddress = "TNVTdTSQnXngR4HNnsH2w9kBUwZ8ciKaov2Ui";// 交易对地址
let amountIns = [nerve.swap.tokenAmount(5, 7, "200000")];// 卖出的资产数量列表
let tokenOutIndex = 2;// 买进的资产索引
let feeTo = null;// (暂无)交易手续费取出一部分给指定的接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPRMtpGNYRx98WkoqKnExU9pWDQjNPf";// 资产接收地址
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

