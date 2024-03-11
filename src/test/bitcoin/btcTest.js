const nerve = require('../../index');
const bitcore = require('bitcore-lib');
const {BitcoinRechargeData} = require('../../model/BitcoinRechargeData');
const http = require('../api/https.js');
const bitcoin = require('bitcoinjs-lib');

// for node env
let ECPair = nerve.bitcoin.initEccLibForNode();

let o = {
    "from": "mwyEyEL2bvP2f2LUiuFCFxEqr5UgHjJ7NM",
    "multySignAddress": "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF",
    "nerveAddress": "TNVTdTSPMvHcrsgCsGKxsbjQn66W4QN2Azo4r",
    "amount": "10000",
    "pub": "03f93d5fb9db5386a6851a3a8d308609a069d599aa7c60b7e34dcc5b946e94dfa9",
    "isMainnet": false
};
/**
 * Legacy地址跨链转入NERVE
 */
async function createLegacyTxTest() {
    const mainnet = false;
    const pubkeyHex = "03f93d5fb9db5386a6851a3a8d308609a069d599aa7c60b7e34dcc5b946e94dfa9";
    const senderAddress = 'mwyEyEL2bvP2f2LUiuFCFxEqr5UgHjJ7NM';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10000);
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPMvHcrsgCsGKxsbjQn66W4QN2Azo4r';
    txData.value = 10000;
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
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10100);
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
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10200);
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
    let feeRate = await nerve.bitcoin.getFeeRate(true, false);
    console.log(feeRate);
    // let a = await nerve.bitcoin.getUtxos(false, 'tb1qnwnk40t55dsgfd4nuz5aq8sflj8vanh5nskec5');
    // console.log(a);
    // let b = await nerve.bitcoin.getUtxos(true, 'bc1pdgv0kguuwwn9q5qp5e896jxlq346xmpfzfy7a8hy0hewsstegf5s2mjfx9');
    // console.log(b);
}
// test();
/*let psbt = bitcoin.Psbt.fromHex('70736274ff0100c90200000003a9ca7f4e28aca6b92119800236bdc7f847ae3c7cd384c9b009b9b7895b112d5d0000000000ffffffff64b29ded4b31c3ad3c4f1f31627f5d6526716767c2b619512907fbbc09ad03b10000000000ffffffffc0f61fe9093e9851e4144ad7f94fb3235f4acc24e502f60d44a6ad5cb9616e460100000000ffffffff02a0860100000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac0b911c00000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac0000000000010122e8030000000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac00010122e8030000000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac000101229d111e00000000001976a9149393d5936cf79b3b480b52f9652c2f2bf04d270088ac000000');
let outputs = psbt.txOutputs;
console.log(outputs);
let tx = psbt.extractTransaction(false);
console.log(psbt);
console.log(tx);*/
// console.log('signed tx', bitcoin.Psbt.fromHex('70736274ff0100cc02000000029f37a189d6642dfe0d0bf2cd9acfb27db020316798143360917f19eede649f4c0200000000ffffffffa999de39f068e9e79799d4a87944abc4041a32d5db73cca93326a3f3895ccf330100000000ffffffff0300000000000000001a6a18546170726f6f74207478206372656174696f6e2074657374a03b0100000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688ac543201000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e000000000001012b320c01000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e01084201404414c3c81319c4bd7ef6d4e2c3af9d149482f0bf50c71c2ebaf906864d753565a49ce1683f7ed35a85e32f1f09441f123dec8dd34c78a819d6d54254746eb8430001012bb06201000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e010842014066ad6f57ba56ad03843ebe2d79c01d3b0e374430560c557bf670c53b79f394e9bd072ac3550606e91c4464425df4fd43c9ef90912102066df66f48233b0eabd700000000').extractTransaction().toHex())
function calcSizeTest() {
    let utxos = [
        {amount: 123},
        {amount: 12},
        {amount: 12},
        {amount: 1050},
        {amount: 130},
        {amount: 100},
        {amount: 2230},
    ];
    let {size, fee} = nerve.bitcoin.calcSpendingUtxosAndFee(false, 0, utxos, 'mqYkDJboJGMa7XJjrVm3pDxYwB6icxTQrW', 500, 1, [Buffer.from("bc1pdgv0kguuwwn9q5qp5e896jxlq346xmpfzfy7a8hy0hewsstegf5s2mjfx9", 'utf8')])
    console.log(size, fee);
}

async function calcSizeTest1() {
    const mainnet = false;
    const pubkeyHex = "03f93d5fb9db5386a6851a3a8d308609a069d599aa7c60b7e34dcc5b946e94dfa9";
    const senderAddress = 'mwyEyEL2bvP2f2LUiuFCFxEqr5UgHjJ7NM';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 10000);
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPMvHcrsgCsGKxsbjQn66W4QN2Azo4r';
    txData.value = 10000;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;

    const addrType = nerve.bitcoin.checkAddressType(mainnet, senderAddress);
    let {size, fee} = nerve.bitcoin.calcSpendingUtxosAndFee(mainnet, addrType, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log(size, fee);
}

// pubkeyA: 03b77df3d540817d20d3414f920ccec61b3395e1dc1ef298194e5ff696e038edd9, priA: c48f55dbe619e83502be1f72c875ed616aeaab6108196f0d644d72e992f6a155
// pubkeyB: 024173f84acb3de56b3ef99894fa3b9a1fe4c48c1bdc39163c37c274cd0334ba75, priA: 30002e81d449f16b69bc3e06918ff6ff088863edef8a0ba3d9b06fe5d02744d7
// pubkeyC: 02c0a82ba398612daa4133a891b3f52832114e0d3d6210348543f1872020556ded, priA: ce608d31bfd260ab5a4098d45c8130fdf407753dfcd88bcb366ae8f362b0c8ba

function nativeSegwitMultiSignTx() {
    let network = bitcoin.networks.testnet;
    const p2ms = bitcoin.payments.p2ms({
        m: 2, pubkeys: [
            Buffer.from('03b77df3d540817d20d3414f920ccec61b3395e1dc1ef298194e5ff696e038edd9', 'hex'),
            Buffer.from('024173f84acb3de56b3ef99894fa3b9a1fe4c48c1bdc39163c37c274cd0334ba75', 'hex'),
            Buffer.from('02c0a82ba398612daa4133a891b3f52832114e0d3d6210348543f1872020556ded', 'hex'),
        ], network});
    const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network})
    console.log('P2WSH address', p2wsh.address);
    console.log('p2ms.output', p2ms.output.toString('hex'));
    console.log('p2wsh.redeem.output', p2wsh.redeem.output.toString('hex'));

    const psbt = new bitcoin.Psbt({network})
        .addInput({
            hash: 'a2265316922e3e749271103ed215cd36ec607341ec33ed45032dc1c2b462c791',
            index: 1,
            witnessScript: p2wsh.redeem.output,
            witnessUtxo: {
                script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
                value: 179724,
            }
        })
        .addOutput({
            address: 'mmLahgkWGHQSKszCDcZXPooWoRuYhQPpCF',
            value: 7100,
        })
        .addOutput({
            address: 'tb1q7xe4hh34v66nep9qz9dj850l0e02deasua2lryse9p648kcegyrsysrarw',
            value: 179724 - 7100 - 300,
        });
    psbt.addOutput({
        script: bitcoin.payments.embed({data: [Buffer.from('withdraw 581a896871161de3b879853cfef41b3bdbf69113ba66b0b9f699535f72a5ba68', 'utf8')]}).output,
        value: 0,
    });

    const keyPairAlice1 = ECPair.fromWIF('cUAngTZ4WSbrkE7vRG8Qh2emAUdHAogN5CN9SHTXk3ohH7FQMgFH', network);
    const keyPairBob1 = ECPair.fromWIF('cPC1TgQ7WCwJMjMfFjMt3Bbri6nbgjs5SQT4PcmffWjKFvQjcVsJ', network);

    psbt.signInput(0, keyPairAlice1)
        .signInput(0, keyPairBob1);

    // psbt.validateSignaturesOfInput(0, bitcoin.Psbt. Buffer.from('03b77df3d540817d20d3414f920ccec61b3395e1dc1ef298194e5ff696e038edd9', 'hex'));
    // psbt.validateSignaturesOfInput(0, Buffer.from('024173f84acb3de56b3ef99894fa3b9a1fe4c48c1bdc39163c37c274cd0334ba75', 'hex'));

    psbt.finalizeAllInputs();

    console.log('Transaction hexadecimal:');
    console.log(psbt.extractTransaction().toHex());
}

function nativeSegwitMultiSignTxFor10Of15() {
    let network = bitcoin.networks.testnet;
    let eckeys = [];
    for (let i=0;i<15;i++) {
        eckeys.push(ECPair.makeRandom({network}));
    }
    let _pubkeys = [];
    for (let i=0;i<15;i++) {
        _pubkeys.push(eckeys[i].publicKey);
    }
    const p2ms = bitcoin.payments.p2ms({
        m: 10, pubkeys: _pubkeys, network});
    const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network})
    console.log('P2WSH address', p2wsh.address);

    const psbt = new bitcoin.Psbt({network})
        .addInput({
            hash: '668faa5aaea6319336290c2778edc099228fae0e099b2d4170a4903d4d9f38c2',
            index: 0,
            witnessScript: p2wsh.redeem.output,
            witnessUtxo: {
                script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
                value: 187252,
            }
        })
        // .addInput({
        //     hash: '668faa5aaea6319336290c2778edc099228fae0e099b2d4170a4903d4d9f38c3',
        //     index: 0,
        //     witnessScript: p2wsh.redeem.output,
        //     witnessUtxo: {
        //         script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
        //         value: 187252,
        //     }
        // })
        .addOutput({
            address: 'mmLahgkWGHQSKszCDcZXPooWoRuYhQPpCF',
            value: 7252,
        })
        .addOutput({
            address: p2wsh.address,
            value: 187252 - 7252 - 276,
        });
    psbt.addOutput({
        script: bitcoin.payments.embed({data: [Buffer.from('withdraw 581a896871161de3b879853cfef41b3bdbf69113ba66b0b9f699535f72a5ba68', 'utf8')]}).output,
        value: 0,
    });

    for (let i=0;i<10;i++) {
        psbt.signInput(0, eckeys[i])
    }

    // psbt.validateSignaturesOfInput(0, Buffer.from('03b77df3d540817d20d3414f920ccec61b3395e1dc1ef298194e5ff696e038edd9', 'hex'));
    // psbt.validateSignaturesOfInput(0, Buffer.from('024173f84acb3de56b3ef99894fa3b9a1fe4c48c1bdc39163c37c274cd0334ba75', 'hex'));

    psbt.finalizeAllInputs();

    console.log('Transaction hexadecimal:');
    console.log(psbt.extractTransaction().toHex());
}
test();
