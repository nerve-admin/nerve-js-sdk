const multi = require("../../model/mutilsigntxsignatures");
const nerve = require('../../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('../api/util');

nerve.customnet(5, "http://beta.public.nerve.network/")

async function getTransferTransaction(m, pubkeyArray, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
    const balanceInfo = await getNulsBalance(fromAddress);

    if (!balanceInfo.success) {
        console.log("获取账户balanceInfo错误");
        return null;
    }

    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: toAddress,
        assetsChainId: assetsChainId,
        assetsId: assetsId,
        amount: amount,
        fee: 0
    };

    let newAmount = transferInfo.amount + transferInfo.fee;
    if (balanceInfo.data.balance < newAmount) {
        console.log("余额不住，请更换账户");
        return;
    }

    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 2);
    if (!inOrOutputs.success) {
        console.log("inputOutputs组装失败!");
        return;
    }

    let tAssemble = await nerve.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);//交易组装
    let pubkeyBufferArray = [];
    for (index in pubkeyArray) {
        pubkeyBufferArray.push(Buffer.from(pubkeyArray[index],"hex"))
    }
    let sign = new multi.MultiTransactionSignatures(m, pubkeyBufferArray);
    tAssemble.signatures = sign.serialize();

    let txHex = tAssemble.txSerialize().toString("hex");

    return txHex;
}
async function test() {
    let prikey2 = "3e73f764492e95362cf325bd7168d145110a75e447510c927612586c06b23e91";
    let prikey1 = "6d10f3aa23018de6bc7d1ee52badd696f0db56082c62826ba822978fdf3a59fa";
    let prikey3 = "f7bb391ab82ba9ec7a552955b2fe50d79eea085d7571e5e2480d1777bc171f5e";


    let m = 2;
    let pubkeyArray = [nerve.getPubByPri(prikey1), nerve.getPubByPri(prikey2), nerve.getPubByPri(prikey3)];

    let txHex = await getTransferTransaction(m, pubkeyArray, "TNVTdTSPyT1GGPrbahr9qo7S87dMBatx9NHtP", "TNVTdTSPQvEngihwxqwCNPq3keQL1PwrcLbtj", 5, 1, 1234, "multi-test");
    console.log("txHex:")
    console.log(txHex)
}
test();