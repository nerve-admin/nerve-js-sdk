const nerve = require('../../index');
const bitcore = require('bitcore-lib');
const {BitcoinRechargeData} = require('../../model/BitcoinRechargeData');
const nerveUtil = require('../api/util');
const bitcoin = require('bitcoinjs-lib');
const {main} = require("mocha/lib/cli");
const sdk = require("../../api/sdk");
const {NERVE_INFOS, Plus, timesDecimals} = require('../htgConfig');
const {getNulsBalance, validateTx, broadcastTx} = require('../api/util');
let NERVE_INFO = nerve.chainId() == 9 ? NERVE_INFOS.mainnet : nerve.chainId() == 5 ? NERVE_INFOS.testnet : null;

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
    console.log('utxos', JSON.stringify(utxos))
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    // const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const feeRate = 1;
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 800;
    const opReturnBuffer = txData.serialize();
    console.log('opReturnBuffer', opReturnBuffer.toString('hex'));
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
    const mainnet = true;
    const pubkeyHex = "0362d61ec650f9b56601477c111a554a1217fb3b3a0ea02c1db47c3f930b9e187e";
    const senderAddress = 'bc1qyzdyruj0f8xd90zjftfhxrgev3sst3jcdjl30c';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress);
    // let utxos = [];
    // let u1 = {txid: 'cbe2aaf109ce7b47343c48b917ddaee420fbb0efa979889247d7874b4f8d7011', vout: 1, amount: 13654};
    // let u2 = {txid: '5cfa6560e383720bc35668da5539039e633fd754a4220ffd27399a55f5ca41e3', vout: 0, amount: 100000};
    // utxos.push(u1);
    // utxos.push(u2);
    const receiveAddress = "bc1q7l4q8kqekyur4ak3tf4s2rr9rp4nhz6axejxjwrc3f28ywm4tl8smz5dpd";
    // const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const feeRate = 19;
    console.log('=======feeRate', feeRate);
    const txData = new BitcoinRechargeData();
    txData.to = 'NERVEepb6CwyEWh9mhnmPTJcuWpRzmYvoS7tLm';
    txData.value = 500000;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = nerve.bitcoin.createNativeSegwitTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray, true);
    console.log('pbstHex', pbstHex);
}
/**
 * Taproot地址跨链转入NERVE
 */
// createTaprootTxTest();
async function createTaprootTxTest() {
    const mainnet = false;
    const pubkeyHex = "03bf7f76fed8161c20fc54404cfb29725fb9a415990fe9cb786a84d00c11a0324c";
    const senderAddress = 'tb1p8katkhwv8c5rgtph90xx0y87c9rtz63upecrckhd52k54nsv3jcsav8tfc';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress, 100000);
    const receiveAddress = "tb1qtskq8773jlhjqm7ad6a8kxhxleznp0nech0wpk0nxt45khuy0vmqwzeumf";
    const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 100000;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = nerve.bitcoin.createTaprootTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
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
    let feeRate = await nerve.bitcoin.getFeeRate(false, true);
    console.log(feeRate);
    // let a = await nerve.bitcoin.getUtxos(false, 'tb1qnwnk40t55dsgfd4nuz5aq8sflj8vanh5nskec5');
    // console.log(a);
    // let b = await nerve.bitcoin.getUtxos(true, 'bc1pdgv0kguuwwn9q5qp5e896jxlq346xmpfzfy7a8hy0hewsstegf5s2mjfx9');
    // console.log(b);
}


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

function testTxSizeOfWithdrawalBTC() {
    let utxoSize = 2;
    let txSize = nerve.bitcoin.calcTxSizeWithdrawal(utxoSize);
    console.log('txSize', txSize);
}

async function testWithdrawalFee() {
    let mainnet = false;
    let currentMultiSignAddr = 'tb1qtskq8773jlhjqm7ad6a8kxhxleznp0nech0wpk0nxt45khuy0vmqwzeumf';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, currentMultiSignAddr);
    let amount = 300000;
    let feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    let fee = nerve.bitcoin.calcFeeWithdrawal(utxos, amount, feeRate);
    console.log('fee', fee, 'feeRate', feeRate);
}


async function testGetMinimumFeeOfWithdrawal() {
    nerve.testnet();
    let nerveTxHash = 'ffcc90da59b4590e031c32890212c26bffd0aafea35d5c9ed3e2d3ff2573efdd';
    let feeInfo = await nerveUtil.getMinimumFeeOfWithdrawal(201, nerveTxHash);
    console.log(JSON.stringify(feeInfo))
}

/*
    满足Nerve底层的手续费要求
 */
function testAddFeeOfWithdrawalI() {
    nerve.testnet();
    let nerveTxHash = '';
    let mainnet = nerve.chainId() == 9;
    let feeInfo = nerveUtil.getMinimumFeeOfWithdrawal(201, nerveTxHash);
    let minimumFee = feeInfo.minimumFee;
    //todo 1. minimumFee是BTC资产，需转换成用户支付的手续费资产，再和用户已支付的手续费数量比较
    //  2. 不够则追加，发普通追加手续费交易
}

/*
    满足BTC网络的矿工打包的手续费要求
 */
function testAddFeeOfWithdrawalII() {
    nerve.testnet();
    let nerveTxHash = '';
    let mainnet = nerve.chainId() == 9;
    let feeInfo = nerveUtil.getMinimumFeeOfWithdrawal(201, nerveTxHash);
    let utxoSize = feeInfo.utxoSize;
    let feeRateOnTx = feeInfo.feeRate;
    let feeRateOnNetwork = nerve.bitcoin.getFeeRate(mainnet);
    if (feeRateOnNetwork > feeRateOnTx && (feeRateOnNetwork - feeRateOnTx > 2)) {
        let txSize = nerve.bitcoin.calcTxSizeWithdrawal(utxoSize);
        let needAddFee = txSize * (feeRateOnNetwork - feeRateOnTx);
        //todo 1. needAddFee是BTC资产，需转换成用户支付的手续费资产
        //  2. 按换算出来的数量追加，发`特殊`的追加手续费交易
        // 参考以下追加 withdrawalAddFeeTest()
    }
}

/**
 * 异构链提现追加手续费交易
 */
async function withdrawalAddFeeTest(pri, fromAddress, withdrawalTxHash, addFeeAmount, feeChain, remark) {
    // 默认使用NVT作为跨链手续费
    if (!feeChain || feeChain == '') {
        feeChain = 'NVT';
    }
    // 获取手续费资产信息
    let feeCoin = NERVE_INFO.htgMainAsset[feeChain];
    let feeAddress = nerve.getAddressByPub(NERVE_INFO.chainId, NERVE_INFO.assetId, NERVE_INFO.feePubkey, NERVE_INFO.prefix);
    let transferInfo = {
        fromAddress: fromAddress,
        toAddress: feeAddress,//this.info.blockHoleAddress,
        fee: 0,
        chainId: feeCoin.chainId,
        assetId: feeCoin.assetId,
        feeCoin: feeCoin,
        amount: addFeeAmount,
    };
    let inOrOutputs = await inputsOrOutputs(transferInfo);
    //console.log(inOrOutputs);
    if (!inOrOutputs.success) {
        throw "inputs、outputs组装错误";
    }

    let tAssemble = await nerve.transactionAssemble(
        inOrOutputs.data.inputs,
        inOrOutputs.data.outputs,
        remark,
        56,
        {
            txHash: withdrawalTxHash,
            extend: '020000'
        }
    );
    //获取hash
    let hash = await tAssemble.getHash();

    //交易签名
    let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
    //通过拼接签名、公钥获取HEX
    let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
    tAssemble.signatures = signData;
    let txhex = tAssemble.txSerialize().toString("hex");
    console.log(txhex.toString('hex'));

    // let result = await nerve.broadcastTx(txhex);
    // console.log(result);
}

// test();
// const k1 = require("tiny-secp256k1");
// const {isPoint} = require("tiny-secp256k1");
// const {isPrivate} = require("tiny-secp256k1");
// k1.isPrivate(Buffer.from("b77df3d540817d20d3414f920ccec61b3395e1dc1ef298194e5ff696e038edd9").valueOf())
// console.log(k1.__initializeContext())
// console.log(k1.sign(Buffer.from("581a896871161de3b879853cfef41b3bdbf69113ba66b0b9f699535f72a5ba68", 'hex').valueOf(), Buffer.from("4173f84acb3de56b3ef99894fa3b9a1fe4c48c1bdc39163c37c274cd0334ba75", 'hex').valueOf()))

async function createLegacyPbstTest() {
    const mainnet = false;
    const pubkeyHex = '0218509f52e47491df3b8331cbb3d2c784512c5ffb58689413a748a0c9fbd77aa5';
    const senderAddress = 'mqYkDJboJGMa7XJjrVm3pDxYwB6icxTQrW';
    const utxos = await nerve.bitcoin.getUtxos(mainnet, senderAddress);
    const receiveAddress = "mmLahgkWGHQSKszCDcZXPooWoRuYhQPpCF";
    // const feeRate = await nerve.bitcoin.getFeeRate(mainnet);
    const feeRate = 100;
    const opReturnArray = [];
    const sendAmount = 5000;
    const pbstHex = await nerve.bitcoin.createLegacyTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
}
// createLegacyPbstTest();

async function processLegacyPsbt(psbtHex) {
    let psbt = bitcoin.Psbt.fromHex(psbtHex);
    let inputs = psbt.txInputs;
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        let preHash = input.hash.toString('hex');
        let preTxHex = await nerve.bitcoin.getrawtransaction(mainnet, utxo.txid);// 请求网络，根据txHash请求rawTx
        psbt.updateInput(i, {nonWitnessUtxo: Buffer.from(preTxHex, 'hex')});
    }
    return psbt.toHex();
}
/*let psbt = bitcoin.Psbt.fromHex("70736274ff01008f0100000001188feea4d9e4a46028f17b21ebc98426f9d2819e625142ee4f407621309a8e560000000000fdffffff0388130000000000001976a9143fda920e686292be324b438d6509123ecd8e1e9f88acfe740200000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688ac00000000000000000f6a0d74657374207073627420686578000000000000000000");
let inputs = psbt.txInputs;
psbt.updateInput(0, {nonWitnessUtxo: Buffer.from('0100000001bc3be3e8e4c4367b63c2d6a59b6d1e9052ba0f44ff9fe300a5439607ec7fda4c010000006a47304402204fdec92dde647b4a265da3227c6bcd3efb6b415eb3fe727b71c3fb85cec943c7022033cbf5b0d2824fe0347810b1e7877e561ae30695b72da7e15bab6f9e8a78b4328121039087cc88855da54458e231c50cb76300334abe46553d3c7a76bc8af0852b87f0fdffffff028e0c0300000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688acdcf10100000000001976a9143fda920e686292be324b438d6509123ecd8e1e9f88ac00000000', 'hex')});
console.log(psbt.toHex());*/

// console.log(inputs);
// let psbt2 = bitcoin.Psbt.fromHex("70736274ff0100770200000001188feea4d9e4a46028f17b21ebc98426f9d2819e625142ee4f407621309a8e560000000000ffffffff0288130000000000001976a9143fda920e686292be324b438d6509123ecd8e1e9f88ac9e920200000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688ac00000000000100e10100000001bc3be3e8e4c4367b63c2d6a59b6d1e9052ba0f44ff9fe300a5439607ec7fda4c010000006a47304402204fdec92dde647b4a265da3227c6bcd3efb6b415eb3fe727b71c3fb85cec943c7022033cbf5b0d2824fe0347810b1e7877e561ae30695b72da7e15bab6f9e8a78b4328121039087cc88855da54458e231c50cb76300334abe46553d3c7a76bc8af0852b87f0fdffffff028e0c0300000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688acdcf10100000000001976a9143fda920e686292be324b438d6509123ecd8e1e9f88ac00000000000000");
// let inputs2 = psbt2.txInputs;
// console.log(inputs2);

// createLegacyPbstTest();
function pbstConverter() {
    let pbstHex = '70736274ff0100a90200000001fcd832950f9f9664780743e8d65eec24d140c6827baa9d9698e301d0e34a3be20200000000fdffffff030000000000000000236a210500013fda920e686292be324b438d6509123ecd8e1e9ffd20030000000000000020030000000000002200205c2c03fbd197ef206fdd6eba7b1ae6fe4530be79c5dee0d9f332eb4b5f847b36a0cf0000000000001600149ba76abd74a36084b6b3e0a9d01e09fc8ececef4000000000001011fd43c0100000000001600149ba76abd74a36084b6b3e0a9d01e09fc8ececef401086c02483045022100f730a44c07fec517ed138ee297864bfbf2df6ffe5f3ab35b00c9a6bf5c3544bd02204934ab30aef9c143e80483993f6db766b9674e934ed08936aabddbd9535d138d0121026bcdc8821c9d7288b6bfab48ee6ed5347df45261d9a5ea88e27cbccc457c5c6e00000000';
    let tx = bitcoin.Psbt.fromHex(pbstHex).extractTransaction(true);
    console.log('txHex', tx.toHex());
}
function testTxSize() {
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 800;
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    let size = nerve.bitcoin.estimateTxSize(2, 1, 0, 0, 2, 0, opReturnArray, 1);
    console.log('size', size);
}

function dataTest() {
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 0;
    txData.extend0 = '2024-03-25 17:49';
    txData.extend1 = '1707b71efdc207a476e7fefd6f7fa880a2201032c2b1d0a3cc20118ded505da410800';
    // txData.feeTo = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    console.log(txData.serialize().toString('hex'));
    // txData.test();
}

dataTest();
// pbstConverter();
// createNativeSegwitTxTest();
// testTxSize();
// console.log(nerve.bitcoin.checkAddressType(false, 'n444mLdfyD1d347pFRyasP2EE37h3afQaT'));
