const {ECPairFactory} = require('ecpair');
const ecc = require('tiny-secp256k1');
const {isTaprootInput}  = require( "bitcoinjs-lib/src/psbt/bip371");
const bs58  = require( "bs58");
const crypto = require("crypto");
const ECPair = ECPairFactory(ecc);
const bitcoin = require("bitcoinjs-lib");
bitcoin.initEccLib(ecc);

const addressMap = {
    'p2pkh': 0,
    'p2wpkh': 1,
    'p2tr': 2,
    'p2sh_p2wpkh': 3,
    'm44_p2wpkh': 4, // deprecated
    'M44_P2TR': 5, // deprecated
    'p2wsh': 6,
    'p2sh': 7
};

const UNISAT_AddressType = {
    0: 'p2pkh',
    1: 'p2wpkh',
    2: 'p2tr',
    3: 'p2sh_p2wpkh',
    4: 'm44_p2wpkh', // deprecated
    5: 'M44_P2TR', // deprecated
    6: 'p2wsh',
    7: 'p2sh',
};

const NetworkType = {
    "MAINNET" : 0,
    "TESTNET" : 1,
    "REGTEST" : 2
}

const AddressType = {
    "P2PKH" : 0,
    "P2WPKH" : 1,
    "P2TR" : 2,
    "P2SH_P2WPKH" : 3,
    "M44_P2WPKH" : 4,
    "M44_P2TR" : 5,
    "P2WSH" : 6,
    "P2SH" : 7,
    "UNKNOWN" : 8
}

function getAddressTypeDust(addressType) {
    if (addressType === AddressType.P2WPKH || addressType === AddressType.M44_P2WPKH) {
        return 294;
    }
    else if (addressType === AddressType.P2TR || addressType === AddressType.M44_P2TR) {
        return 330;
    }
    else {
        return 546;
    }
}

function decodeAddress(address) {
    const mainnet = bitcoin.networks.bitcoin;
    const testnet = bitcoin.networks.testnet;
    const regtest = bitcoin.networks.regtest;
    let decodeBase58;
    let decodeBech32;
    let networkType;
    let addressType;
    if (address.startsWith('bc1') || address.startsWith('tb1') || address.startsWith('bcrt1')) {
        try {
            decodeBech32 = bitcoin.address.fromBech32(address);
            if (decodeBech32.prefix === mainnet.bech32) {
                networkType = NetworkType.MAINNET;
            } else if (decodeBech32.prefix === testnet.bech32) {
                networkType = NetworkType.TESTNET;
            } else if (decodeBech32.prefix === regtest.bech32) {
                networkType = NetworkType.REGTEST;
            }
            if (decodeBech32.version === 0) {
                if (decodeBech32.data.length === 20) {
                    addressType = AddressType.P2WPKH;
                } else if (decodeBech32.data.length === 32) {
                    addressType = AddressType.P2WSH;
                }
            } else if (decodeBech32.version === 1) {
                if (decodeBech32.data.length === 32) {
                    addressType = AddressType.P2TR;
                }
            }
            return {
                networkType,
                addressType,
                dust: getAddressTypeDust(addressType)
            };
        } catch (e) {
        }
    } else {
        try {
            decodeBase58 = bitcoin.address.fromBase58Check(address);
            if (decodeBase58.version === mainnet.pubKeyHash) {
                networkType = NetworkType.MAINNET;
                addressType = AddressType.P2PKH;
            } else if (decodeBase58.version === testnet.pubKeyHash) {
                networkType = NetworkType.TESTNET;
                addressType = AddressType.P2PKH;
            } else if (decodeBase58.version === regtest.pubKeyHash) {
                // do not work
                networkType = NetworkType.REGTEST;
                addressType = AddressType.P2PKH;
            } else if (decodeBase58.version === mainnet.scriptHash) {
                networkType = NetworkType.MAINNET;
                addressType = AddressType.P2SH_P2WPKH;
            } else if (decodeBase58.version === testnet.scriptHash) {
                networkType = NetworkType.TESTNET;
                addressType = AddressType.P2SH_P2WPKH;
            } else if (decodeBase58.version === regtest.scriptHash) {
                // do not work
                networkType = NetworkType.REGTEST;
                addressType = AddressType.P2SH_P2WPKH;
            }
            return {
                networkType,
                addressType,
                dust: getAddressTypeDust(addressType)
            };
        } catch (e) {
        }
    }
    return {
        networkType: NetworkType.MAINNET,
        addressType: AddressType.UNKNOWN,
        dust: 546
    };
}

function getAddressType(address, networkType = NetworkType.MAINNET) {
    return decodeAddress(address).addressType;
}

const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));

var wallet = {

    _getAddressType(address, env) {
        const type = env === 'beta' ? 1 : 0;
        return getAddressType(address, type);
    },

    toPsbtNetwork(env) {
        if (env === 'main') {
            return bitcoin.networks.bitcoin;
        } else if (env === 'beta') {
            return bitcoin.networks.testnet;
        } else {
            return bitcoin.networks.regtest;
        }
    },

    formatPsbtHex(psbtHex){
        let formatData = '';
        try {
            if(!(/^[0-9a-fA-F]+$/.test(psbtHex))){
                formatData = bitcoin.Psbt.fromBase64(psbtHex).toHex()
            }else{
                bitcoin.Psbt.fromHex(psbtHex);
                formatData = psbtHex;
            }
        } catch(e) {
            throw new Error('invalid psbt')
        }
        return formatData;
    },

    privateKeyToWIF(privateKey, isCompressed = true, network = 'testnet', chain) {
        const mainnetVersionPrefix = chain === 'LTC' ? 0xb0 : chain === 'DOGE' ? 0x9e : 0x80;
        const testnetVersionPrefix = chain === 'LTC' ? 0xef : chain === 'DOGE' ? 0xf1 : 0xEF;
        const versionPrefix = network === 'testnet' ? testnetVersionPrefix : mainnetVersionPrefix;
        const compressedFlag = isCompressed ? 0x01 : 0x00;
        const data = Buffer.concat([
            Buffer.from([versionPrefix]),
            Buffer.from(privateKey, 'hex'),
            Buffer.from([compressedFlag]),
        ]);
        const checksum = crypto
            .createHash('sha256')
            .update(crypto.createHash('sha256').update(data).digest())
            .digest()
            .slice(0, 4);

        const wifData = Buffer.concat([data, checksum]);
        return bs58.encode(wifData);
    },

    generateBTCAddress(pubKey, networkType, type) {
        try {
            if (!pubKey) return;
            let BTCAddress;
            const publicKeyBuffer = Buffer.from(pubKey, 'hex');
            const network = networkType === 'beta' && bitcoin?.networks.testnet || bitcoin?.networks.bitcoin;
            if (type === 'p2wpkh') {
                const { address } = bitcoin.payments.p2wpkh({ network, pubkey: publicKeyBuffer });
                BTCAddress = address;
            } else if (type === 'p2sh' || type === 'p2sh_p2wpkh') {
                const { address } = bitcoin.payments.p2sh({
                    network,
                    redeem: bitcoin.payments.p2wpkh({ network, pubkey: publicKeyBuffer }),
                });
                BTCAddress = address;
            } else if (type === 'p2tr') {
                const { address } = bitcoin.payments.p2tr({ network, internalPubkey: toXOnly(publicKeyBuffer) });
                BTCAddress = address;
            } else {
                const { address } = bitcoin.payments.p2pkh({ network, pubkey: publicKeyBuffer });
                BTCAddress = address;
            }
            return BTCAddress;
        } catch (error) {
            console.error(error, 'e');
        }
    },

    scriptPkToAddress(scriptPk, env) {
        const network = wallet.toPsbtNetwork(env);
        try {
            return bitcoin.address.fromOutputScript(
                typeof scriptPk === "string" ? Buffer.from(scriptPk, "hex") : scriptPk,
                network
            );
        } catch (e) {
            return "";
        }
    },


}

class BTCWallet {
    address = '';
    addressType = '';
    pubkey = '';
    signer = null;
    network = null;
    constructor(privateKey, addressType, network) {
        const WIF = wallet.privateKeyToWIF(privateKey, true, network==='beta' && 'testnet' || 'mainnet');
        this.addressType = addressType;
        this.network = network;
        this.signer = ECPair.fromWIF(WIF, network==='beta' && bitcoin?.networks.testnet || bitcoin?.networks.bitcoin);
        this.pubkey = this.signer.publicKey.toString("hex");
        this.address = wallet.generateBTCAddress(this.pubkey, this.network, addressType);
    }

    formatOptionsToSignInputs(_psbt, options) {
        const accountPubkey = this.pubkey;
        const accountAddress = this.address;
        let toSignInputs = [];
        if (options && options.toSignInputs) {
            toSignInputs = options.toSignInputs.map((input) => {
                const index = Number(input.index);
                if (isNaN(index)) throw new Error("invalid index in toSignInput");
                if (input.address && input.publicKey) {
                    throw new Error("no address or public key in toSignInput");
                }

                if (input.address && input.address != accountAddress) {
                    throw new Error("invalid address in toSignInput");
                }

                if (input.publicKey && input.publicKey != accountPubkey) {
                    throw new Error("invalid public key in toSignInput");
                }

                const sighashTypes = input.sighashTypes?.map(Number);
                if (sighashTypes?.some(isNaN)) throw new Error("invalid sighash type in toSignInput");

                return {
                    index,
                    publicKey: accountPubkey,
                    sighashTypes,
                    disableTweakSigner: input.disableTweakSigner,
                };
            });
        } else {
            const psbtNetwork = wallet.toPsbtNetwork(this.network);
            const psbt = typeof _psbt === "string" ? bitcoin.Psbt.fromHex(_psbt, { network: psbtNetwork }) : _psbt;
            psbt.data.inputs.forEach((v, index) => {
                let script = null;
                let value = 0;
                if (v.witnessUtxo) {
                    script = v.witnessUtxo.script;
                    value = v.witnessUtxo.value;
                } else if (v.nonWitnessUtxo) {
                    const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
                    const output = tx.outs[psbt.txInputs[index].index];
                    script = output.script;
                    value = output.value;
                }
                const isSigned = v.finalScriptSig || v.finalScriptWitness;
                if (script && !isSigned) {
                    const address = wallet.scriptPkToAddress(script, this.network);
                    if (accountAddress === address) {
                        toSignInputs.push({
                            index,
                            publicKey: accountPubkey,
                            sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                        });
                    }
                }
            });
        }
        return toSignInputs;
    }

    signPsbt(psbt, opts) {
        const _opts = opts || {
            autoFinalized: true,
            toSignInputs: [],
        };
        let _inputs = this.formatOptionsToSignInputs(
            psbt,
            opts
        );
        psbt.data.inputs.forEach((v, index) => {
            const isNotSigned = !(v.finalScriptSig || v.finalScriptWitness);
            const isP2TR = this.addressType === 'p2tr' || this.addressType === 'm44p2tr';
            const lostInternalPubkey = !v.tapInternalKey;
            // Special measures taken for compatibility with certain applications.
            if (isNotSigned && isP2TR && lostInternalPubkey) {
                const tapInternalKey = toXOnly(Buffer.from(this.pubkey, "hex"));
                const { output } = bitcoin.payments.p2tr({
                    internalPubkey: tapInternalKey,
                    network: toPsbtNetwork(this.network),
                });
                if (v.witnessUtxo?.script.toString("hex") == output?.toString("hex")) {
                    v.tapInternalKey = tapInternalKey;
                }
            }
        });
        psbt = this.signTransaction(psbt, _inputs);
        if (_opts.autoFinalized) {
            psbt.finalizeAllInputs();
        }
        return psbt;
    }
    signTransaction(psbt, inputs) {
        const publicKeyBuffer = Buffer.from(this.pubkey, 'hex');
        inputs.forEach((input) => {
            if (
                isTaprootInput(psbt.data.inputs[input.index]) &&
                !input.disableTweakSigner
            ) {
                const signer = this.signer.tweak(
                    bitcoin.crypto.taggedHash('TapTweak', toXOnly(publicKeyBuffer)),
                );
                psbt.signInput(input.index, signer, input.sighashTypes);
            } else {
                const signer = this.signer;
                psbt.signInput(input.index, signer, input.sighashTypes);
            }
        });
        return psbt;
    }
}

module.exports = wallet;
module.exports.BTCWallet = BTCWallet;
module.exports.addressMap = addressMap;
module.exports.UNISAT_AddressType = UNISAT_AddressType;
module.exports.toXOnly = toXOnly;
