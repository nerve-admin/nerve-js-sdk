const {ECPairFactory} = require('ecpair');
const ecc = require('tiny-secp256k1');
const bufferutils_1 = require('bitcoinjs-lib/src/bufferutils');
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcore = require('bitcore-lib');
const http = require("../test/api/https");
const ECPair = ECPairFactory(ecc);
const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));

function estimateTxSizeHeader(mainnet) {
    if (!mainnet) mainnet = false;
    const currentNetwork = mainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const keyPair = ECPair.fromWIF(
        'L2uPYXe17xSTqbCjZvL2DsyXPCbXspvcu5mHLDYUgzdUbZGSKrSr',
    );
    const script0 = bitcoin.payments.p2pkh({network: currentNetwork, pubkey: keyPair.publicKey});
    const script1 = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({network: currentNetwork, pubkey: keyPair.publicKey}),
    });
    const script2 = bitcoin.payments.p2wpkh({network: currentNetwork, pubkey: keyPair.publicKey});
    const childNodeXOnlyPubkey = toXOnly(keyPair.publicKey);
    const script3 = bitcoin.payments.p2tr({
        network: currentNetwork,
        internalPubkey: childNodeXOnlyPubkey,
    });
    return {currentNetwork, keyPair, script0, script1, script2, script3, childNodeXOnlyPubkey};
}

function estimateTxSizeBody(currentNetwork, inputCount, inputData, address0, address1, address2, address3, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray) {
    const psbt = new bitcoin.Psbt({network: currentNetwork});
    psbt.addInput(inputData);
    for (let i = 1; i < inputCount; i++) {
        const _inputData = Object.assign({}, inputData);
        _inputData.index = i;
        psbt.addInput(_inputData);
    }
    for (let i = 0; i < opReturnArray.length; i++) {
        let opReturnBuffer = opReturnArray[i];
        psbt.addOutput({
            script: bitcoin.payments.embed({data: [opReturnBuffer]}).output,
            value: 0,
        })
    }
    for (let i = 0; i < legacyOutputCount; i++) {
        psbt.addOutput({
            address: address0,
            value: 1002000,
        })
    }
    for (let i = 0; i < nestedSegwitOutputCount; i++) {
        psbt.addOutput({
            address: address1,
            value: 1002000,
        })
    }
    for (let i = 0; i < nativeSegwitOutputCount; i++) {
        psbt.addOutput({
            address: address2,
            value: 1002000,
        })
    }
    for (let i = 0; i < taprootOutputCount; i++) {
        psbt.addOutput({
            address: address3,
            value: 1002000,
        })
    }
    return psbt;
}

function estimateTxSizeFooter(psbt) {
    psbt.finalizeAllInputs();
    let vSize = psbt.extractTransaction(true).virtualSize();
    // console.log('vSize', vSize);
    return vSize;
}

function estimateLegacyTxSize(mainnet, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray) {
    try {
        const {
            currentNetwork,
            keyPair,
            script0,
            script1,
            script2,
            script3,
            childNodeXOnlyPubkey
        } = estimateTxSizeHeader(mainnet);
        const inputData = {
            hash: "097185463c95e968755ed7589a57d4561e502323a250819754749e376be0d472",
            index: 0,
            nonWitnessUtxo: Buffer.from('010000000190a1ae9724b99311109e72d76684a7db5c181b9aad4d37c0698b7e1846ce5a14010000006b483045022100c61529e323d5c268bde6a458ff00fc38028fd1b339305c7a0a0f6ca7ed07b15302205df6d82a9acac5826f8b5db8ea2aad3720fa0d3537b74b2aa86059bf125713bb01210365db9da3f8a260078a7e8f8b708a1161468fb2323ffda5ec16b261ec1056f455ffffffff02f0e62607000000001976a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac24260000000000001976a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac00000000', 'hex')
        };
        const psbt = estimateTxSizeBody(currentNetwork, inputCount, inputData, script0.address, script1.address, script2.address, script3.address, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
        for (let i = 0; i < inputCount; i++) {
            psbt.signInput(i, keyPair);
        }
        return estimateTxSizeFooter(psbt);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

function estimateNestedSegwitTxSize(mainnet, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray) {
    try {
        const {
            currentNetwork,
            keyPair,
            script0,
            script1,
            script2,
            script3,
            childNodeXOnlyPubkey
        } = estimateTxSizeHeader(mainnet);
        const inputData = {
            hash: "c904f6daae3617a2611e30bfbb782a8ad4845fb25e1a6759ed9eee25e2990ad3",
            index: 0,
            witnessUtxo: {script: script1.output, value: 11181008},
            redeemScript: script1.redeem.output
        };
        const psbt = estimateTxSizeBody(currentNetwork, inputCount, inputData, script0.address, script1.address, script2.address, script3.address, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
        for (let i = 0; i < inputCount; i++) {
            psbt.signInput(i, keyPair);
        }
        return estimateTxSizeFooter(psbt);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

function estimateNativeSegwitTxSize(mainnet, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray) {
    try {
        const {
            currentNetwork,
            keyPair,
            script0,
            script1,
            script2,
            script3,
            childNodeXOnlyPubkey
        } = estimateTxSizeHeader(mainnet);
        const inputData = {
            hash: "c904f6daae3617a2611e30bfbb782a8ad4845fb25e1a6759ed9eee25e2990ad3",
            index: 0,
            witnessUtxo: {script: script2.output, value: 11181008}
        };
        const psbt = estimateTxSizeBody(currentNetwork, inputCount, inputData, script0.address, script1.address, script2.address, script3.address, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
        for (let i = 0; i < inputCount; i++) {
            psbt.signInput(i, keyPair);
        }
        return estimateTxSizeFooter(psbt);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

function estimateTaprootTxSize(mainnet, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray) {
    try {
        const {
            currentNetwork,
            keyPair,
            script0,
            script1,
            script2,
            script3,
            childNodeXOnlyPubkey
        } = estimateTxSizeHeader(mainnet);
        const tweakedChildNode = keyPair.tweak(
            bitcoin.crypto.taggedHash('TapTweak', childNodeXOnlyPubkey),
        );
        const inputData = {
            hash: "a5c83bbcdd14bc1b502e4a9e349409dbfbe1afa6eb94decea942b92dc1e2231c",
            index: 0,
            witnessUtxo: {script: script3.output, value: 11181008},
            tapInternalKey: childNodeXOnlyPubkey
        };
        const psbt = estimateTxSizeBody(currentNetwork, inputCount, inputData, script0.address, script1.address, script2.address, script3.address, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
        for (let i = 0; i < inputCount; i++) {
            psbt.signInput(i, tweakedChildNode);
        }
        return estimateTxSizeFooter(psbt);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

function getSpendingUtxos(utxos, spending) {
    let spendingUtxos = [];
    let total = 0;
    let inputCount = 0;
    for (let i = 0; i < utxos.length; i++) {
        let utxo = utxos[i];
        if (total >= spending) {
            break;
        }
        inputCount++;
        total += utxo.amount;
        spendingUtxos.push(utxo);
    }
    if (total < spending) {
        throw "not enough utxo";
    }
    return {spendingUtxos, total, inputCount};
}

function createSpendingUtxosAndOutput(mainnet, txType, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray) {
    const currentNetwork = mainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const pubkeyBuffer = Buffer.from(pubkeyHex, 'hex');
    let script;
    if (txType == 0) {
        script = bitcoin.payments.p2pkh({network: currentNetwork, pubkey: pubkeyBuffer});
    } else if (txType == 1) {
        script = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({network: currentNetwork, pubkey: pubkeyBuffer}),
        });
    } else if (txType == 2) {
        script = bitcoin.payments.p2wpkh({network: currentNetwork, pubkey: pubkeyBuffer});
    } else if (txType == 3) {
        const childNodeXOnlyPubkey = toXOnly(pubkeyBuffer);
        script = bitcoin.payments.p2tr({
            network: currentNetwork,
            internalPubkey: childNodeXOnlyPubkey,
        });
    }
    const psbt = new bitcoin.Psbt({network: currentNetwork});
    let len0 = 0, len1 = 0, len2 = 0, len3 = 0;
    let outForType = 'len' + txType + '++';
    eval(outForType);
    let add = bitcore.Address.fromString(receiveAddress, mainnet ? 'livenet' : 'testnet');
    if (add.isPayToPublicKeyHash()) {
        len0++;
    } else if (add.isPayToScriptHash()) {
        len1++;
    } else if (add.isPayToWitnessPublicKeyHash()) {
        len2++;
    } else if (add.isPayToTaproot()) {
        len3++;
    }
    // console.log(len0, len1,len2,len3);
    let size0 = btc.estimateTxSize(txType, 1, len0, len1, len2, len3, opReturnArray);
    let fee = size0 * feeRate;
    let spending = sendAmount + fee;
    let {spendingUtxos, total, inputCount} = getSpendingUtxos(utxos, spending);
    if (inputCount > 1) {
        let _size = btc.estimateTxSize(txType, inputCount, len0, len1, len2, len3, opReturnArray);
        fee = _size * feeRate;
        spending = sendAmount + fee;
        while (total < spending) {
            let {
                spendingUtxos: spendingUtxos1,
                total: total1,
                inputCount: inputCount1
            } = getSpendingUtxos(utxos, spending);
            if (inputCount1 > inputCount) {
                let size1 = btc.estimateTxSize(txType, inputCount1, len0, len1, len2, len3, opReturnArray);
                fee = _size * feeRate;
                spending = sendAmount + fee;
            }
            total = total1;
            inputCount = inputCount1;
            spendingUtxos = spendingUtxos1;
        }
    }
    for (let i = 0; i < opReturnArray.length; i++) {
        let opReturnBuffer = opReturnArray[i];
        psbt.addOutput({
            script: bitcoin.payments.embed({data: [opReturnBuffer]}).output,
            value: 0,
        });
    }
    psbt.addOutput({
        address: receiveAddress,
        value: sendAmount,
    });
    if (total > spending) {
        psbt.addOutput({
            address: script.address,
            value: total - spending,
        });
    }
    return {psbt, currentNetwork, spendingUtxos, script};
}

function getBtcRpc(mainnet = false) {
    let url = 'https://btctest.nerve.network';
    let authValue = 'Basic TmVydmU6OW83ZlNtWFBCZlBRb1FTYm5CQg==';
    if (mainnet) {
        url = 'https://btc.nerve.network';
        authValue = 'Basic TmVydmU6OW83ZlNtWFBCQ000RjZjQUpzZlBRb1FTYm5CQg==';
    }
    return {url, authValue};
}

var btc = {
    estimateTxSize(txType, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray) {
        switch (txType) {
            case 0:
                return estimateLegacyTxSize(false, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
            case 1:
                return estimateNestedSegwitTxSize(false, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
            case 2:
                return estimateNativeSegwitTxSize(false, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
            case 3:
                return estimateTaprootTxSize(false, inputCount, legacyOutputCount, nestedSegwitOutputCount, nativeSegwitOutputCount, taprootOutputCount, opReturnArray);
            default:
                return 0;
        }
    },

    async getrawtransaction(mainnet = false, txid, verbose = false) {
        let {url, authValue} = getBtcRpc(mainnet);
        return await http.postCompleteWithHeader(
            url,
            'getrawtransaction',
            [txid, verbose],
            {'Authorization': authValue}
        ).then((response) => {
            if (response.hasOwnProperty("result")) {
                return response.result
            } else {
                throw "Get rawtransaction error"
            }
        }).catch((error) => {
            throw "Network error"
        });
    },

    async getFeeRate(mainnet = false) {
        if (!mainnet) {
            return 1;
        }
        let {url, authValue} = getBtcRpc(mainnet);
        return await http.postCompleteWithHeader(
            url,
            'estimatesmartfee',
            [3, "ECONOMICAL"],
            {'Authorization': authValue}
        ).then((response) => {
            if (response.hasOwnProperty("result")) {
                return Math.ceil(response.result.feerate * 1.1 * 100000)
            } else {
                throw "Get rawtransaction error"
            }
        }).catch((error) => {
            throw "Network error"
        });
    },

    async getUtxos(mainnet = false, address, amount) {
        if (mainnet) {
            return await http.postDirect(
                'https://api.v2.nabox.io/nabox-api/btc/utxo',
                {
                    "language": "CHS",
                    "chainId": 0,
                    "address": address,
                    "coinAmount": amount,
                    "serviceCharge": amount,
                    "utxoType": 1
                }
            ).then((response) => {
                if (response.hasOwnProperty("code")) {
                    if (response.code !== 1000) {
                        throw response.msg;
                    }
                    let utxos = response.data.utxo;
                    for (let i = 0; i < utxos.length; i++) {
                        let utxo = utxos[i];
                        utxo.amount = utxo.satoshi;
                    }
                    return utxos
                } else {
                    throw "Get utxo error"
                }
            }).catch((error) => {
                throw "Network error"
            });
        }
        return await http.get(
            'https://mempool.space/testnet/api/address/' + address + '/utxo'
        ).then((response) => {
            if (typeof response === 'object') {
                let utxos = response;
                for (let i = 0; i < utxos.length; i++) {
                    let utxo = utxos[i];
                    utxo.amount = utxo.value;
                }
                return utxos
            } else {
                console.log(typeof response, response);
                throw "Get utxo error";
            }
        }).catch((error) => {
            throw "Network error"
        });
    },

    checkAddressType(mainnet = false, address) {
        let add = bitcore.Address.fromString(address, mainnet ? 'livenet' : 'testnet');
        if (add.isPayToPublicKeyHash()) {
            return 0;
        } else if (add.isPayToScriptHash()) {
            return 1;
        } else if (add.isPayToWitnessPublicKeyHash()) {
            return 2;
        } else if (add.isPayToTaproot()) {
            return 3;
        }
        return -1;
    },

    async createLegacyTx(mainnet = false, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray) {
        const {
            psbt,
            currentNetwork,
            spendingUtxos,
            script
        } = createSpendingUtxosAndOutput(mainnet, 0, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray)
        for (let i = 0; i < spendingUtxos.length; i++) {
            let utxo = spendingUtxos[i];
            let txHex = await this.getrawtransaction(mainnet, utxo.txid);
            utxo.txHex = txHex;
            psbt.addInput({
                hash: utxo.txid,
                index: Number(utxo.vout),
                nonWitnessUtxo: Buffer.from(utxo.txHex, 'hex')
            });
        }
        const psbtHex = psbt.toHex();
        return psbtHex;
    },

    createNestedSegwitTx(mainnet = false, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray) {
        const {
            psbt,
            currentNetwork,
            spendingUtxos,
            script
        } = createSpendingUtxosAndOutput(mainnet, 1, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray)
        for (let i = 0; i < spendingUtxos.length; i++) {
            let utxo = spendingUtxos[i];
            psbt.addInput({
                hash: utxo.txid,
                index: Number(utxo.vout),
                witnessUtxo: {script: script.output, value: utxo.amount},
                redeemScript: script.redeem.output
            });
        }
        const psbtHex = psbt.toHex();
        return psbtHex;
    },
    createNativeSegwitTx(mainnet = false, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray) {
        const {
            psbt,
            currentNetwork,
            spendingUtxos,
            script
        } = createSpendingUtxosAndOutput(mainnet, 2, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray)
        for (let i = 0; i < spendingUtxos.length; i++) {
            let utxo = spendingUtxos[i];
            psbt.addInput({
                hash: utxo.txid,
                index: Number(utxo.vout),
                witnessUtxo: {script: script.output, value: utxo.amount}
            });
        }
        const psbtHex = psbt.toHex();
        return psbtHex;
    },
    createTaprootTx(mainnet = false, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray) {
        const {
            psbt,
            currentNetwork,
            spendingUtxos,
            script
        } = createSpendingUtxosAndOutput(mainnet, 3, pubkeyHex, utxos, receiveAddress, sendAmount, feeRate, opReturnArray)
        const childNodeXOnlyPubkey = toXOnly(Buffer.from(pubkeyHex, 'hex'));
        for (let i = 0; i < spendingUtxos.length; i++) {
            let utxo = spendingUtxos[i];
            psbt.addInput({
                hash: utxo.txid,
                index: Number(utxo.vout),
                witnessUtxo: {script: script.output, value: utxo.amount},
                tapInternalKey: childNodeXOnlyPubkey
            });
        }
        const psbtHex = psbt.toHex();
        return psbtHex;
    },

}
module.exports = btc;