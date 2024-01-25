const nerve = require('../../index');
const bitcore = require('bitcore-lib');
const {BitcoinRechargeData} = require('../../model/BitcoinRechargeData');
const http = require('../api/https.js');

async function getrawtransaction(txid, verbose = false) {
    return await http.postCompleteWithHeader(
        'https://btctest.nerve.network',
        'getrawtransaction',
        [txid, verbose],
        {'Authorization': 'Basic TmVydmU6OW83ZlNtWFBCZlBRb1FTYm5CQg=='}
    ).then((response) => {
        if (response.hasOwnProperty("result")) {
            return response.result
        } else {
            throw "Get rawtransaction error"
        }
    }).catch((error) => {
        throw "Network error"
    });
}
/*
mqYkDJboJGMa7XJjrVm3pDxYwB6icxTQrW === 0218509f52e47491df3b8331cbb3d2c784512c5ffb58689413a748a0c9fbd77aa5
2N9zTP5UCTiHr9wB5y3kMT94h7aK4x6DaTU === 02c33b15d12f51122974d6c44aa429ea19efad06431803711b2658a967dfa574e4
tb1qnwnk40t55dsgfd4nuz5aq8sflj8vanh5nskec5 === 026bcdc8821c9d7288b6bfab48ee6ed5347df45261d9a5ea88e27cbccc457c5c6e
tb1ps240r4jpxcnauxm0vk2dy0nh5wuzaua2luppf096keq8ym4eyx8qktkd7q === 021581e09eb49bfdb52e147ddeb943219fdfc15f04cb49686a37d7a757800fb591
*/


/**
 * Legacy地址跨链转入NERVE
 */
async function createLegacyTxTest() {
    const mainnet = false;
    const pubkeyHex = "0218509f52e47491df3b8331cbb3d2c784512c5ffb58689413a748a0c9fbd77aa5";
    const utxos = [
        {
            txid: "a683ef1658f4b1e38697cc6ca684dd49145634015fb3b9762d61582f1c2794aa",
            vout: 2,
            amount: 53696
        },
        {
            txid: "f83df08007c4fad1d2d94880f04ddad9365aedf91ebd2c98be75cb1cc56bd2ac",
            vout: 2,
            amount: 60188
        }
    ];
    for (let i=0;i<utxos.length;i++) {
        let utxo = utxos[i];
        let txHex = await getrawtransaction(utxo.txid);
        utxo.txHex = txHex;
    }
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = 1;
    const txData = new BitcoinRechargeData();
    txData.to = 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad';
    txData.value = 10800;
    /*txData.extend0 = '2024-01-25 17:49';
    const crossFee = 9800;
    if (crossFee > 0) {
        txData.feeTo = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    }*/
    const opReturnBuffer = txData.serialize();
    const opReturnArray = [
        opReturnBuffer
    ];
    const sendAmount = txData.value;
    const pbstHex = nerve.bitcoin.createLegacyTx(mainnet, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray);
    console.log('pbstHex', pbstHex);
}

/**
 * NestedSegwit地址跨链转入NERVE
 */
async function createNestedSegwitTxTest() {
    const mainnet = false;
    const pubkeyHex = "02c33b15d12f51122974d6c44aa429ea19efad06431803711b2658a967dfa574e4";
    const utxos = [
        {
            txid: "5b5201766dd1c4022b3a308ff5fe451337d8c5f1e0560c367397ebea95cdedb2",
            vout: 2,
            amount: 68362
        },
        {
            txid: "7b14b4281fbe4ae23a972ea02ad4852546403c700445b2d17a4fb7eb833d6e83",
            vout: 1,
            amount: 88864
        }
    ];
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = 1;
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
    const utxos = [
        {
            txid: "33cf5c89f3a32633a9cc73dbd5321a04c4ab4479a8d49997e7e968f039de99a9",
            vout: 2,
            amount: 61717
        }
    ];
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = 1;
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
    const utxos = [
        {
            txid: "5033bc3d5b9131ce9ef761ff39e6472d9f44a1fa59cdd2bc813c15968f67c92c",
            vout: 2,
            amount: 78420
        }
    ];
    const receiveAddress = "2NDu3vcpjyiMgvRjDpQfbyh9uF2McfDJ3NF";
    const feeRate = 1;
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
createTaprootTxTest();// 0073297d32373a7ec869b4f75f6d8d7e0e163e44debded4c4889ad605a7c9a64

// console.log('signed tx', bitcoin.Psbt.fromHex('70736274ff0100cc02000000029f37a189d6642dfe0d0bf2cd9acfb27db020316798143360917f19eede649f4c0200000000ffffffffa999de39f068e9e79799d4a87944abc4041a32d5db73cca93326a3f3895ccf330100000000ffffffff0300000000000000001a6a18546170726f6f74207478206372656174696f6e2074657374a03b0100000000001976a9146e08011a2a94059cf1545cc1da29f51d73efee8688ac543201000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e000000000001012b320c01000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e01084201404414c3c81319c4bd7ef6d4e2c3af9d149482f0bf50c71c2ebaf906864d753565a49ce1683f7ed35a85e32f1f09441f123dec8dd34c78a819d6d54254746eb8430001012bb06201000000000022512082aaf1d6413627de1b6f6594d23e77a3b82ef3aaff0214bcbab640726eb9218e010842014066ad6f57ba56ad03843ebe2d79c01d3b0e374430560c557bf670c53b79f394e9bd072ac3550606e91c4464425df4fd43c9ef90912102066df66f48233b0eabd700000000').extractTransaction().toHex())

