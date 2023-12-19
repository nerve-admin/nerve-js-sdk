/**
 * 创建swap交易对
 */
const nerve = require('../../..');
const sdk = require('../../../api/sdk');
// 设置网络环境
// nerve.testnet();
nerve.customnet(5, "http://192.168.1.110:17003/")

// 账户信息
let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
let pri = '';
let tokenAmountA = nerve.swap.tokenAmount(5, 1, "140000000000");// 添加的资产A的数量
let tokenAmountB = nerve.swap.tokenAmount(5, 3, "100000000");// 添加的资产B的数量
let deadline = nerve.swap.currentTime() + 300;// 过期时间
let amountAMin = "140000000000";// 资产A最小添加值
let amountBMin = "100000000";// 资产B最小添加值
let toAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";// 流动性份额接收地址
let remark = 'swap add liquidity remark...';

//调用
test();
async function test() {
    let tx = await nerve.swap.swapAddLiquidity(fromAddress, tokenAmountA, tokenAmountB,
        amountAMin, amountBMin, deadline, toAddress, remark);
    console.log('hash: ' + tx.hash);
    console.log('hex: ' + tx.hex);
    // 签名交易
    // 反序列回交易对象
    let tAssemble = nerve.deserializationTx(tx.hex);
    //获取hash
    let hash = await tAssemble.getHash();
    //交易签名
    let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
    //通过拼接签名、公钥获取HEX
    let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
    tAssemble.signatures = signData;
    let txhex = tAssemble.txSerialize().toString("hex");
    console.log("signedTx hex(metamask):" + txhex.toString('hex'));

    // 广播交易
    let result = await nerve.broadcastTx(txhex);
    console.log(result);
}
