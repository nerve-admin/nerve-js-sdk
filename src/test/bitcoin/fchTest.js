const fch = require('fch-sdk');
const {BitcoinRechargeData} = require('../../model/BitcoinRechargeData');
const {acc0, acc1, acc2, acc3, acc4} = require('../testAcc');
const BigNumber = require('bignumber.js');

function computerBtc(amount) {
    let totalInputAmount = new BigNumber(amount)
    return totalInputAmount.div(100000000).toString();
}

function computerSatoshi(amount) {
    let totalInputAmount = new BigNumber(amount)
    return totalInputAmount.times(100000000).toNumber();
}

/**
 * Legacy地址跨链转入NERVE
 */
async function createLegacyTxTest() {
    let {pri} = acc4();
    const pubkeyHex = fch.getPublicKey(pri);
    const senderAddress = fch.getAddress(pubkeyHex);
    const sendAmount = "0.0001";

    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPMvHcrsgCsGKxsbjQn66W4QN2Azo4r';
    txData.value = computerSatoshi(sendAmount);
    const opReturnBuffer = txData.serialize();
    const msg = opReturnBuffer.toString('hex');

    let utxos = await fch.getAccountUTXOs(senderAddress);
    let feeAndUTXO = fch.calcFeeAndUTXO(utxos, sendAmount, msg)
    const receiveAddress = "3BXpnXkAG7SYNxyKyDimcxjkyYQcaaJs5X";
    const hash = await fch.sendTransaction(pri, feeAndUTXO.utxo, receiveAddress, sendAmount, msg);
    console.log('hash', hash);
}

function test() {
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPMvHcrsgCsGKxsbjQn66W4QN2Azo4r';
    txData.value = computerSatoshi('0.002');
    const opReturnBuffer = txData.serialize();
    console.log(opReturnBuffer.length);
    console.log(opReturnBuffer.toString('hex'));
}

test();
// acc4()
