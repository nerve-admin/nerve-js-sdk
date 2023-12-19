/**
 * 退出farm
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '';
let remark = 'farm withdraw remark...';

//调用
test();
async function test() {
    let tx = await nerve.swap.farmWithdraw(fromAddress,
        nerve.swap.token(5, 1),  100000000,
        "1e51dea44f9e295ac3e44c7fb98eec719459ad023051aff7c6195c3970a14469",remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}
