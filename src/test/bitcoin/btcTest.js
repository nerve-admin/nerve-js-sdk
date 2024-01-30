const nerve = require('../../index');
const bitcore = require('bitcore-lib');
const {BitcoinRechargeData} = require('../../model/BitcoinRechargeData');
const http = require('../api/https.js');
const bitcoin = require('bitcoinjs-lib');

/**
 * Legacy地址跨链转入NERVE
 */
async function createLegacyTxTest() {
    const mainnet = false;
    const pubkeyHex = "0218509f52e47491df3b8331cbb3d2c784512c5ffb58689413a748a0c9fbd77aa5";
    const senderAddress = 'mqYkDJboJGMa7XJjrVm3pDxYwB6icxTQrW';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10800);
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 10800;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = await nerve.bitcoin.createLegacyTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
}

/**
 * NestedSegwit地址跨链转入NERVE
 */
async function createNestedSegwitTxTest() {
    const mainnet = false;
    const pubkeyHex = "02c33b15d12f51122974d6c44aa429ea19efad06431803711b2658a967dfa574e4";
    const senderAddress = '2N9zTP5UCTiHr9wB5y3kMT94h7aK4x6DaTU';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10800);
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 10800;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = nerve.bitcoin.createNestedSegwitTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
}

/**
 * NativeSegwit地址跨链转入NERVE
 */
async function createNativeSegwitTxTest() {
    const mainnet = false;
    const pubkeyHex = "026bcdc8821c9d7288b6bfab48ee6ed5347df45261d9a5ea88e27cbccc457c5c6e";
    const senderAddress = 'tb1qnwnk40t55dsgfd4nuz5aq8sflj8vanh5nskec5';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10800);
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 10800;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = nerve.bitcoin.createNativeSegwitTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
}

/**
 * Taproot地址跨链转入NERVE
 */
async function createTaprootTxTest() {
    const mainnet = false;
    const pubkeyHex = "021581e09eb49bfdb52e147ddeb943219fdfc15f04cb49686a37d7a757800fb591";
    const senderAddress = 'tb1ps240r4jpxcnauxm0vk2dy0nh5wuzaua2luppf096keq8ym4eyx8qktkd7q';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10800);
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 10800;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = nerve.bitcoin.createTaprootTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
}

function dataTest() {
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 10800;
    txData.extend0 = '2024-01-25 17:49';
    txData.feeTo = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    console.log(txData.serialize().toString('hex'));
    txData.test();
}

/*
mqYkDJboJGMa7XJjrVm3pDxYwB6icxTQrW === 0218509f52e47491df3b8331cbb3d2c784512c5ffb58689413a748a0c9fbd77aa5
2N9zTP5UCTiHr9wB5y3kMT94h7aK4x6DaTU === 02c33b15d12f51122974d6c44aa429ea19efad06431803711b2658a967dfa574e4
tb1qnwnk40t55dsgfd4nuz5aq8sflj8vanh5nskec5 === 026bcdc8821c9d7288b6bfab48ee6ed5347df45261d9a5ea88e27cbccc457c5c6e
tb1ps240r4jpxcnauxm0vk2dy0nh5wuzaua2luppf096keq8ym4eyx8qktkd7q === 021581e09eb49bfdb52e147ddeb943219fdfc15f04cb49686a37d7a757800fb591
*/

/*nerve.bitcoin.estimateTxSize(0, 1, 1, 1, 1, 1, [Buffer.from('YOUR Legacy OP_RETURN DATA HERE', 'utf8')]);
nerve.bitcoin.estimateTxSize(1, 1, 1, 1, 1, 1, [Buffer.from('YOUR NestedSegwit OP_RETURN DATA HERE', 'utf8')]);
nerve.bitcoin.estimateTxSize(2, 1, 1, 1, 1, 1, [Buffer.from('YOUR NativeSegwit OP_RETURN DATA HERE', 'utf8')]);
nerve.bitcoin.estimateTxSize(3, 1, 1, 1, 1, 1, [Buffer.from('YOUR Taproot OP_RETURN DATA HERE', 'utf8')]);
let add = bitcore.Address.fromString("tb1p84mvl77xm8gk0je5fcqdjqda4vs7a58dhgcpnw0hrkkrk0mdjh4qyect2y", 'testnet');
console.log(add.isPayToPublicKeyHash());
console.log(add.isPayToScriptHash());
console.log(add.isPayToWitnessPublicKeyHash());
console.log(add.isPayToTaproot());*/

// dataTest();
// createLegacyTxTest();// dd8ea832075bbc06ea001540c8cd9266c4e0b8b9412c66ed172bed4f1aaabc4f
// createNestedSegwitTxTest();// 40f75c8e1807d966b6e5cd44005b5881caec13be656cff780f1b32da9a28f132
// createNativeSegwitTxTest();// 84ca24ef56b9eb57e27a0b74e38ccb31b0416678b65b27f89b53cb4f9a0b7544
// createTaprootTxTest();// 0073297d32373a7ec869b4f75f6d8d7e0e163e44debded4c4889ad605a7c9a64
async function test() {
    let feeRate = await nerve.bitcoin.getFeeRate(true, true);
    console.log(feeRate);
    // let a = await nerve.bitcoin.getUtxos(false, 'tb1qnwnk40t55dsgfd4nuz5aq8sflj8vanh5nskec5');
    // console.log(a);
    // let b = await nerve.bitcoin.getUtxos(true, 'bc1pdgv0kguuwwn9q5qp5e896jxlq346xmpfzfy7a8hy0hewsstegf5s2mjfx9');
    // console.log(b);
}
// test();
let psbt = bitcoin.Psbt.fromHex('70736274ff0100c90200000003a9ca7f4e28aca6b92119800236bdc7f847ae3c7cd384c9b009b9b7895b112d5d0000000000ffffffff64b29ded4b31c3ad3c4f1f31627f5d6526716767c2b619512907fbbc09ad03b10000000000ffffffffc0f61fe9093e9851e4144ad7f94fb3235f4acc24e502f60d44a6ad5cb9616e460100000000ffffffff02a0860100000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac0b911c00000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac0000000000010122e8030000000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac00010122e8030000000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac000101229d111e00000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac000000');
let outputs = psbt.txOutputs;
console.log(outputs);
let tx = psbt.extractTransaction(false);
console.log(psbt);
console.log(tx);
// console.log('signed tx', bitcoin.Psbt.fromHex('70736274ff0100cc02000000029f37a189d6642dfe0d0bf2cd9acfb27db020316798143360917f19eede649f4c0200000000ffffffffa999de39f068e9e79799d4a87944abc4041a32d5db73cca93326a3f3895ccf330100000000ffffffff0300000000000000001a6a18546170726f6f74207478206372656174696f6e2074657374a03b0100000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688ac543201000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e000000000001012b320c01000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e01084201404414c3c81319c4bd7ef6d4e2c3af9d149482f0bf50c71c2ebaf906864d753565a49ce1683f7ed35a85e32f1f09441f123dec8dd34c78a819d6d54254746eb8430001012bb06201000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e010842014066ad6f57ba56ad03843ebe2d79c01d3b0e374430560c557bf670c53b79f394e9bd072ac3550606e91c4464425df4fd43c9ef90912102066df66f48233b0eabd700000000').extractTransaction().toHex())

