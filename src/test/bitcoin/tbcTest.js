require('dotenv').config();
const nerve = require('../../index');
const {BitcoinRechargeData} = require('../../model/BitcoinRechargeData');
const tbcLib = nerve.tbcLib;
// const network = "testnet";
const network = "mainnet"

//计算多签地址
// devnet: FBeMrqQWFkhBJt6rA2yKxVWg9Jeiww76Pr
// testnet: FJ5buUdNQ8FBpwh3ZT2W1peVUidHRvje2m
const multiSigAddress = 'FJ5buUdNQ8FBpwh3ZT2W1peVUidHRvje2m';
const privateKey = tbcLib.tbc.PrivateKey.fromString(process.env._8KFu);
const tbc_from = tbcLib.tbc.Address.fromPrivateKey(privateKey).toString();

//普通地址向多签地址转tbc
async function transferToMulti(network = 'testnet', privateKey, tbc_from, tbc_multiSigAddress, nerve_to, amount, remark) {
    const utxos = await tbcLib.API.getUTXOs(tbc_from, amount + 0.0003, network);
    const txData = new BitcoinRechargeData();
    txData.to = nerve_to;
    txData.value = Math.floor(amount * Math.pow(10, 6));
    if (remark) {
        txData.extend0 = remark;
    }
    let remarkData = Buffer.concat([Buffer.from('88888888', 'hex'), txData.serialize()]);
    const txraw = tbcLib.MultiSig.p2pkhToMultiSig_sendTBC(tbc_from, tbc_multiSigAddress, amount, utxos, privateKey, remarkData);
    await tbcLib.API.broadcastTXraw(txraw, network);
}

//普通地址向多签地址转ft
async function transferToMultiWithFT(network = 'testnet', privateKey, tbc_from, tbc_multiSigAddress, nerve_to, ft_amount, ft_contract, remark, tbc_amount = 0) {
    const utxo = await tbcLib.API.fetchUTXO(privateKey, 0.01 + tbc_amount, network);
    const Token = new tbcLib.FT(ft_contract);
    const TokenInfo = await tbcLib.API.fetchFtInfo(Token.contractTxid, network);
    Token.initialize(TokenInfo);
    const transferTokenAmount = ft_amount;//转移数量
    const transferTokenAmountBN = BigInt(Math.floor(transferTokenAmount * Math.pow(10, Token.decimal)));
    const ftutxo_codeScript = tbcLib.FT.buildFTtransferCode(Token.codeScript, tbc_from).toBuffer().toString('hex');
    const ftutxos = await tbcLib.API.fetchFtUTXOs(Token.contractTxid, tbc_from, ftutxo_codeScript, network, transferTokenAmountBN);//准备ft utxo
    let preTXs = [];
    let prepreTxDatas = [];
    for (let i = 0; i < ftutxos.length; i++) {
        preTXs.push(await tbcLib.API.fetchTXraw(ftutxos[i].txId, network));//获取每个ft输入的父交易
        prepreTxDatas.push(await tbcLib.API.fetchFtPrePreTxData(preTXs[i], ftutxos[i].outputIndex, network));//获取每个ft输入的爷交易
    }

    const txData = new BitcoinRechargeData();
    txData.to = nerve_to;
    txData.value = tbc_amount <= 0 ? 0 : (Math.floor(tbc_amount * Math.pow(10, 6)));
    if (remark) {
        txData.extend0 = remark;
    }
    txData.extend1 = ft_contract + transferTokenAmountBN.toString();
    let remarkData = Buffer.concat([Buffer.from('88888888', 'hex'), txData.serialize()]);

    const transferTX = tbcLib.MultiSig.p2pkhToMultiSig_transferFT(tbc_from, tbc_multiSigAddress, Token, transferTokenAmount, utxo, ftutxos, preTXs, prepreTxDatas, privateKey, tbc_amount, remarkData);//组装交易
    await tbcLib.API.broadcastTXraw(transferTX, network);
}

transferToMulti(network, privateKey, tbc_from, multiSigAddress, 'TNVTdTSPSShZokMfXRo82TP2Kq6Fc2nhMNmF7', 0.221, 'test233333333');
// transferToMultiWithFT(network, privateKey, tbc_from, multiSigAddress, 'TNVTdTSPJJMGh7ijUGDqVZyucbeN1z4jqb1ad', 2.21, '29a753233bf4f3b546b5eacd0a8ec7a7a236bf7b987f51390a7cac90bb1d8bcf', 'test233333333');

/**
 * DAPP接口调用参考
 * sendTransaction
 * const amount = 1000; // TBC转账金额-右移精度
 * const nerveTo = ""; // Nerve网络接收地址
 * const extend = "test23333333";
 * const tbcTo = ""; // TBC网络接收地址
 * params = [{flag:"P2PKH", satoshis: amount, address: tbcTo, ramark: transferTBCData(nerveTo, amount, extend)}];
 * 
 * @param {Nerve接收地址} nerveTo 
 * @param {跨入的TBC金额-右移精度} tbcAmount 
 * @param {扩展备注-选填，可填任意值} extend 
 * @returns 
 */
function transferTBCData(nerveTo, tbcAmount, extend) {
    const txData = new BitcoinRechargeData(); 
    txData.to = nerveTo;
    txData.value = tbcAmount;
    txData.extend0 = extend;
    return '88888888' + txData.serialize().toString('hex');
}

/**
 * DAPP接口调用参考
 * sendTransaction
 * const nerveTo = ""; // Nerve网络接收地址
 * const tokenValue = 30000; // Token转账金额-右移精度
 * const tokenContract = ""; // Token合约地址
 * const tbcTo = ""; // TBC网络接收地址
 * const extend = "test23333333";
 * const tbcValue = 0; // 大于0则同时跨链tbc资产-右移精度
 * params = [{flag:"FT_TRANSFER", ft_contract_address: tokenContract, ft_amount: tokenValue, address: tbcTo, tbc_amount: tbcValue, ramark: transferTokenData(nerveTo, tokenValue, tokenContract, extend, tbcValue)}];
 * @param {Nerve接收地址} nerveTo 
 * @param {跨入的TOKEN金额-右移精度} tokenAmount 
 * @param {token合约地址} tokenContract 
 * @param {扩展备注-选填，可填任意值，swapbox用于填写订单号} extend 
 * @param {跨入的TBC金额-右移精度-选填} tbcAmount 
 * @returns 
 */
function transferTokenData(nerveTo, tokenAmount, tokenContract, extend, tbcAmount = 0) {
    const txData = new BitcoinRechargeData(); 
    txData.to = nerveTo;
    txData.value = tbcAmount;
    txData.extend0 = extend;
    txData.extend1 = tokenContract + '' + tokenAmount;
    return '88888888' + txData.serialize().toString('hex');
}
