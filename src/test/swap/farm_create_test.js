/**
 * 创建farm
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();
// nerve.customnet(5, "http://192.168.1.110:17003/")

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '';
let remark = 'farm create remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.farmCreate(fromAddress,
        nerve.swap.token(5, 75), nerve.swap.token(2, 58), 5, 20000000000000000000000000, 15432098765432080000, 20023000, 1635307410, "TNVT", true, 234, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);

    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}

