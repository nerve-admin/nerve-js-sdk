/**
 * 移除Stable-Swap流动性
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();
// nerve.customnet(5, "http://127.0.0.1:17004/jsonrpc");

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '4594348E3482B751AA235B8E580EFEF69DB465B3A291C5662CEDA6459ED12E39';

let stablePairAddress = "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB";// 交易对地址
let amountIns = [nerve.swap.tokenAmount(5, 72, "2000000000000000000")];// 卖出的资产数量列表
let tokenOutIndex = 2;// 买进的资产索引
let feeTo = 'TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva';// 交易手续费接收地址
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";// 资产接收地址
let feeTokenAmount = nerve.swap.tokenAmount(5, 72, "100000000000000000");
let remark = 'stable swap trade remark...';
//调用
test();
async function test() {
    // feeTo = '';
    // feeTokenAmount = null;
    let tx = await nerve.swap.stableSwapTrade(fromAddress, stablePairAddress,
        amountIns, tokenOutIndex, feeTo, deadline, toAddress, remark, feeTokenAmount);
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

