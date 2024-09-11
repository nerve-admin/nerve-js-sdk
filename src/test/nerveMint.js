const nerve = require('../index');
nerve.testnet();
const {getNulsBalance, getBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');
const {currentTime} = require('../utils/swap');
const numberUtil = require("../utils/numberUtil");
const {acc0, acc1, acc2, acc3} = require('./testAcc');


async function deploy() {
  let {pri, pub, fromAddress} = acc0();
  // let toAddress = 'TNVTdTSPmyc6wVo7DTBjsJJ4kCHuzCS4tqsHx';//dev
  let toAddress = 'TNVTdTSQ2wdoL5pCz97r3UYtcesxy79YhUDo8';//testnet
  let amount = "900" + "000000000000000000";
  let minutesForWhitelist = "0";

  let tokenAmountForLp = "0";
  let lockDayForLp = "0";
  let radio = 45;
  // 当加池比例大于0时，项目方需要额外存入的token = HardTop * 95% * radio%
  if (radio > 0) {
    lockDayForLp = "30";
    let tokenDecimals = 18;// 项目方发行的token精度, mint asset
    let tokenBase = numberUtil.Power(tokenDecimals);
    tokenAmountForLp = numberUtil.Times(amount, 95 * radio).times(tokenBase).div(10000).div(tokenBase);
  }
  let deploy = {
    "p": "nerve-mint",//固定
    "op": "deploy",// 发布项目 - deploy, 铸币 - mint
    "tick": "2-58",// 项目方token, Mint Asset
    "max": amount,// 项目方发行总量, Hard Top
    "lim": "100" + "000000000000000000",// single mint amount
    "feetick": "5-1",// mint fee asset
    "fee": "10" + "00000000",// mint fee amount
    "addr": "TNVTdTSPQmKV5o9dhsN6TiXKot4mPLQXQLyHz",// mint fee addr
    "count": "100",// mint limits
    "start": "" + ((currentTime() + 60 * 3)),// mint time
    "unlock": "" + ((currentTime() + 60 * 10)),// mint asset unlock time
    // "whitelist": "TNVTdTSPQh3RLFhij1X8JiE5CyYgDcGcPReKF,TNVTdTSPTXQudD2FBSefpQRkXTyhhtSjyEVAF",
    "minutes": "" + minutesForWhitelist,//白名单mint时间
    "ratio": "" + radio,//LP Addition Ratio
    "days": "" + lockDayForLp//LP Lock Dayas
  };
  let remark = JSON.stringify(deploy);
  //调用
  transferTransaction(pri, pub, fromAddress, toAddress, 2, 58, numberUtil.Plus(amount, tokenAmountForLp), remark);
}

async function mint(pri, pub, fromAddress, pid) {
  // let toAddress = 'TNVTdTSPmyc6wVo7DTBjsJJ4kCHuzCS4tqsHx';//dev
  let toAddress = 'TNVTdTSQ2wdoL5pCz97r3UYtcesxy79YhUDo8';//testnet
  let amount = "80" + "00000000";
  let mint = {
    "p": "nerve-mint",
    "op": "mint",
    "pid": "" + pid
  };
  let remark = JSON.stringify(mint);
  //调用
  await transferTransaction(pri, pub, fromAddress, toAddress, 5, 1, amount, remark);
}

async function test() {
  let {pri, pub, fromAddress} = acc2();
  let pid = 24;
  await mint(pri, pub, fromAddress, pid);
  // await mint(pri, pub, fromAddress, pid);
  // await mint(pri, pub, fromAddress, pid);
  // let {pri: pri1, pub: pub1, fromAddress: fromAddress1} = acc3();
  // await mint(pri1, pub1, fromAddress1, pid);
  // await mint(pri1, pub1, fromAddress1, pid);
  // await mint(pri1, pub1, fromAddress1, pid);
}

test();
// deploy();
// console.log(currentTime())

/**
 * 转账交易
 * @param pri
 * @param pub
 * @param fromAddress
 * @param toAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param remark
 * @returns {Promise<void>}
 */
async function transferTransaction(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
  const balanceInfo = await getBalance(nerve.chainId(), assetsChainId, assetsId, fromAddress);
  console.log(balanceInfo);
  if (!balanceInfo.balance) {
    console.log("获取账户balanceInfo错误");
    return;
  }

  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 0
  };

  let newAmount = numberUtil.Plus(transferInfo.amount, transferInfo.fee);
  if (numberUtil.isLessThan(balanceInfo.balance, newAmount)) {
    console.log("余额不足，请更换账户");
    return;
  }

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }

  let tAssemble = await nerve.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);//交易组装
  let txhex = await nerve.transactionSerialize(pri, pub, tAssemble);
  console.log(txhex);

  let results = await broadcastTx(txhex);
  if (results && results.value) {
    console.log("交易完成", JSON.stringify(results))
  } else {
    console.log("广播交易失败")
  }

  /*let result = await validateTx(txhex);
  if (result.success) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败:" + JSON.stringify(result.error))
  }*/
}



