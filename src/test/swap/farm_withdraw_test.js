/**
 * 退出farm
 */
const nerve = require('../../index');
// 设置网络环境
nerve.testnet();

// 账户信息
let fromAddress = "TNVTdTSPMcyC8e7jz8f6ngX5yTmK6S8CXEGva";
let pri = '17c50c6f7f18e7afd37d39f92c1d48054b6b3aa2373a70ecf2d6663eace2a7d6';
let remark = 'farm withdraw remark...';

//调用
test();
async function test() {
    let txhex = await nerve.swap.farmWithdraw(pri, fromAddress,
        nerve.swap.token(5, 1),  100000000,
        "1e51dea44f9e295ac3e44c7fb98eec719459ad023051aff7c6195c3970a14469",remark);
    console.log(txhex);
}
