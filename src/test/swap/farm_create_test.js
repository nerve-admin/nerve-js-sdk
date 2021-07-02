/**
 * 创建farm
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();
// nerve.customnet(5, "http://192.168.1.110:17003/")

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '4594348E3482B751AA235B8E580EFEF69DB465B3A291C5662CEDA6459ED12E39';
let remark = 'farm create remark...';
//调用
test();
async function test() {
    let tx = await nerve.swap.farmCreate(fromAddress,
        nerve.swap.token(5, 1), nerve.swap.token(5, 4), 5, 10000000000, 10000, 1, 1, "TNVT", remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    let signedTx = nerve.appendSignature(tx.hex, pri);
    console.log('signedTx hash: ' + signedTx.data.hash);
    console.log('signedTx hex: ' + signedTx.data.hex);

    // 广播交易
    // nerve.broadcastTx(signedTx.data.hex);
}

