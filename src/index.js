const BufferReader = require("./utils/bufferreader");
const txsignatures = require("./model/txsignatures");
const sdk = require('./api/sdk');
const txs = require('./model/txs');
const eccrypto = require("./crypto/eciesCrypto");
const axios = require('axios');
let API_CHAIN_ID;

module.exports = {
  mainnet() {
    API_CHAIN_ID = 9;
    axios.defaults.timeout = 9000;
    axios.defaults.baseURL = 'https://public.nerve.network';
  },
  testnet() {
    API_CHAIN_ID = 5;
    axios.defaults.timeout = 9000;
    axios.defaults.baseURL = 'https://beta.public.nerve.network';
  },
  customnet(chainId, url, timeout) {
    API_CHAIN_ID = chainId;
    axios.defaults.baseURL = url;
    if (!timeout) {
      axios.defaults.timeout = 9000;
    } else {
      axios.defaults.timeout = timeout;
    }
  },
  chainId() {
    return API_CHAIN_ID;
  },
  getPubByPri(pri) {
    return sdk.getPub(pri);
  },
  getAddressByPri(chainId, pri) {
    return sdk.getStringAddress(chainId, pri);
  },
  /**
   * 生成地址
   * @param chainId
   * @param passWord
   * @param prefix
   * @returns {{}}
   */
  newAddress(chainId, passWord, prefix) {
    let addressInfo = {"prefix": prefix};
    if (passWord) {
      addressInfo = sdk.newEcKey(passWord);
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
      addressInfo.pri = null;
    } else {
      addressInfo = sdk.newEcKey(passWord);
    }
    addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub, prefix);
    return addressInfo
  },

  /**
   * 根据公钥获取地址
   * @param chainId
   * @param type
   * @param pub
   * @param prefix
   * @returns {*|string}
   */
  getAddressByPub(chainId, type, pub, prefix) {
    return sdk.getStringAddressBase(chainId, type, '', pub, prefix);
  },

  /**
   * 验证地址
   * @param address
   * @returns {*}
   */
  verifyAddress(address) {
    return sdk.verifyAddress(address);
  },

  /**
   * 导入地址
   * @param chainId
   * @param pri
   * @param passWord
   * @param prefix
   * @returns {{}}
   */
  importByKey(chainId, pri, passWord, prefix) {
    let addressInfo = {};
    const patrn = /^[A-Fa-f0-9]+$/;
    if (!patrn.exec(pri)) { //判断私钥是否为16进制
      return {success: false, data: 'Bad private key format'}
    }
    addressInfo.pri = pri;
    addressInfo.address = sdk.getStringAddress(chainId, pri, null, prefix);
    addressInfo.pub = sdk.getPub(pri);
    if (passWord) {
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
      addressInfo.pri = null;
    }
    return addressInfo
  },

  /**
   * 组装交易
   * @param inputs
   * @param outputs
   * @param remark
   * @param type
   * @param info
   * @returns {Array}
   */
  transactionAssemble(inputs, outputs, remark, type, info) {
    let tt = [];
    if (type === 2) { //转账交易
      tt = new txs.TransferTransaction();
    } else if (type === 3) { //设置别名
      tt = new txs.AliasTransaction(info.fromAddress, info.alias);
    } else if (type === 4) { //创建节点
      tt = new txs.CreateAgentTransaction(info);
    } else if (type === 5) { //加入staking
      tt = new txs.addStakingTransaction(info);
    } else if (type === 6) { //nvt退出staking 锁定7天
      outputs[0].lockTime ? tt = new txs.outStakingTransaction(info, outputs[0].lockTime - 86400 * 7) : tt = new txs.outStakingTransaction(info)
      // tt = new txs.outStakingTransaction(info, outputs[0].lockTime - 86400 * 7);
    } else if (type === 9) { //注销节点  锁定15天 =86400*15
      tt = new txs.StopAgentTransaction(info, outputs[0].lockTime - 86400 * 15);
    } else if (type === 10) { //跨链转账
      tt = new txs.CrossChainTransaction();
    } else if (type === 28) { //追加保证金
      tt = new txs.DepositTransaction(info);
    } else if (type === 29) { //退出保证金
      tt = new txs.WithdrawTransaction(info);
    } else if (type === 32) { //批量退出
      outputs[0].lockTime ? tt = new txs.batchOutStakingTransaction(info, outputs[0].lockTime - 86400 * 7) : tt = new txs.batchOutStakingTransaction(info)
    } else if (type === 33) { //批量合并
      tt = new txs.batchMergeTransaction(info);
    } else if (type === 43) { //跨链提现
      tt = new txs.WithdrawalTransaction(info);
    } else if (type === 56) { //提现追加手续费
      tt = new txs.AdditionFeeTransaction(info);
    } else if (type === 61) { //创建Swap交易对
      tt = new txs.SwapCreatePairTransaction(info);
    } else if (type === 64) { //Swap添加流动性
      tt = new txs.SwapAddLiquidityTransaction(info);
    } else if (type === 65) { //Swap移除流动性
      tt = new txs.SwapRemoveLiquidityTransaction(info);
    } else if (type === 63) { //Swap币币交易
      tt = new txs.SwapTradeTransaction(info);
    } else if (type === 62) { //创建挖矿池
      tt = new txs.FarmCreateTransaction(info);
    } else if (type === 66) { //质押挖矿
      tt = new txs.FarmStakeTransaction(info);
    } else if (type === 67) { //退出质押
      tt = new txs.FarmWithdrawTransaction(info);
    } else if (type === 71) { //创建Stable-Swap交易对
      tt = new txs.StableSwapCreatePairTransaction(info);
    } else if (type === 72) { //Stable-Swap币币交易
      tt = new txs.StableSwapTradeTransaction(info);
    } else if (type === 73) { //Stable-Swap添加流动性
      tt = new txs.StableSwapAddLiquidityTransaction(info);
    } else if (type === 74) { //Stable-Swap移除流动性
      tt = new txs.StableSwapRemoveLiquidityTransaction(info);
    } else if (type === 75) { //Stable-Swap移除流动性
      tt = new txs.FarmUpdateTransaction(info);
    } else if (type === 77) { //Stable-Lp-Swap-Trade交易
      tt = new txs.StableLpSwapTradeTransaction(info);
    } else if (type === 83) { //Swap-Trade-Stable-Remove-Lp Swap交易聚合稳定币撤销流动性交易
      tt = new txs.SwapTradeStableRemoveLpTransaction(info);
    } else if (type === 228) {  //创建交易对
      tt = new txs.CoinTradingTransaction(info);
    } else if (type === 229) {  //委托挂单
      tt = new txs.TradingOrderTransaction(info);
    } else if (type === 230) {   //取消委托挂单
      tt = new txs.CancelTradingOrderTransaction(info);
    }
    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    return tt
  },

  /**
   * 交易签名
   * @param pri
   * @param pub
   * @param tAssemble
   * @returns {boolean}
   */
  transactionSerialize(pri, pub, tAssemble) {
    sdk.signatureTx(tAssemble, pri, pub);
    return tAssemble.txSerialize().toString('hex');
  },

  /**
   * @disc: App签名，拼接公钥
   * @date: 2019-12-03 16:01
   * @author: Wave
   */
  appSplicingPub: function appSplicingPub(signValue, pubHex) {
    return sdk.appSplicingPub(signValue, pubHex);
  },

  /**
   * 交易签名
   * @param pri
   * @param tAssemble
   * @returns {boolean}
   */
  transactionSignature(pri, tAssemble) {
    return sdk.signatureTransaction(tAssemble, pri);
  },

  /**
   * 解密私钥
   * @param aesPri
   * @param password
   * @returns {*}
   */
  decrypteOfAES(aesPri, password) {
    return sdk.decrypteOfAES(aesPri, password)
  },

  /**
   * 公钥加密内容
   * @param pub
   * @param data
   * @returns {Promise<string>}
   */
  async encryptOfECIES(pub, data) {
    let bufferData = Buffer.from(data);
    let encrypted = await eccrypto.encrypt(pub, bufferData);
    return encrypted.toString("hex");
  },

  /**
   * 私钥解密内容
   * @param pri
   * @param encrypted
   * @returns {Promise<string>}
   */
  async decryptOfECIES(pri, encrypted) {
    let bufferData = Buffer.from(encrypted, "hex");
    let decrypted = await eccrypto.decrypt(pri, bufferData);
    return decrypted.toString();
  },

  /**
   *  追加签名
   * @params: txHex 签名hex
   * @params: prikeyHex 追加签名私钥
   * @date: 2020-08-12 15:24
   * @author: Wave
   **/
  appendSignature(txHex, prikeyHex) {
    // 解析交易
    let bufferReader = new BufferReader(Buffer.from(txHex, "hex"), 0);
    // 反序列回交易对象
    let tx = new txs.Transaction();
    tx.parse(bufferReader);
    // 初始化签名对象
    let txSignData = new txsignatures.TransactionSignatures();
    // 反序列化签名对象
    let reader = new BufferReader(tx.signatures, 0);
    txSignData.parse(reader);
    //获取本账户公钥
    let pub = sdk.getPub(prikeyHex);
    // 签名
    let sigHex = sdk.signature(tx.getHash().toString("hex"), prikeyHex);
    let signValue = Buffer.from(sigHex, 'hex');
    // 追加签名到对象中
    txSignData.addSign(Buffer.from(pub, "hex"), signValue);
    // 追加签名到交易中
    tx.signatures = txSignData.serialize();
    //计算交易hash
    tx.calcHash();
    //console.log(tx.getHash().toString("hex"));
    // 结果
    //console.log(tx.txSerialize().toString("hex"));
    return {success: true, data: {hash: tx.getHash().toString("hex"), hex: tx.txSerialize().toString("hex")}}
  },

  /**
   * 反序列化交易
   * @param txHex
   * @returns {Transaction}
   */
  deserializationTx(txHex) {
    // 解析交易
    let bufferReader = new BufferReader(Buffer.from(txHex, "hex"), 0);
    // 反序列回交易对象
    let tx = new txs.Transaction();
    tx.parse(bufferReader);
    return tx;
  },

  programEncodePacked(args) {
    return sdk.newProgramEncodePacked(args);
  },

  parseProgramEncodePacked(data) {
    return sdk.parseProgramEncodePacked(data);
  },

  getL1Fee(htgChainId, ethNetworkGasPrice) {
    return sdk.getL1Fee(htgChainId, ethNetworkGasPrice);
  }

};
const swap = require("./utils/swap");
module.exports.swap = swap;
const rpcUtil = require('./test/api/util');
const broadcastTx = async function(txhex) {
  let result = await rpcUtil.validateTx(txhex);
  if (result.success) {
    let results = await rpcUtil.broadcastTx(txhex);
    if (results && results.value) {
      return results.hash;
    } else {
      return "广播交易失败: " + JSON.stringify(results);
    }
  } else {
    return "验证交易失败:" + JSON.stringify(result);
  }
}
module.exports.broadcastTx = broadcastTx;
const btc = require("./utils/bitcoin");
module.exports.bitcoin = btc;
const fch = require("./utils/freecash");
module.exports.fch = fch;
const bch = require("./utils/bitcoincash");
module.exports.bch = bch;
