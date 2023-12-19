/**
 * 质押farm
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '';

let remark = 'farm update remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.farmUpdate(fromAddress,"80f375ffb94ac8058647e7d6eda6ef1463433d525de03f4e644efea334cd0bc7",0,
        nerve.swap.token(5, 15), 0,100000000,1000000,5, "TNVT", remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);
    // 广播交易
    nerve.broadcastTx(signedTx.data.hex);
}
