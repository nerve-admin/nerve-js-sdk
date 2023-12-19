/**
 * 移除Stable-Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();
// nerve.customnet(5, "http://127.0.0.1:17004/jsonrpc");

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '';
let stablePairAddress = "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB";// 交易对地址
let tokenAmountLP = nerve.swap.tokenAmount(5, 102, "10000000000000000000");// 移除的资产LP的数量
let receiveOrderIndexs = [3];// 按币种索引顺序接收资产
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";// 移除流动性份额接收地址
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
    let result = await nerve.broadcastTx(signedTx.data.hex);
    console.log(result, 'result');
}

