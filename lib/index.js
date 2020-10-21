"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var BufferReader = require("./utils/bufferreader");

var txsignatures = require("./model/txsignatures");

var sdk = require('./api/sdk');

var txs = require('./model/txs');

var eccrypto = require("./crypto/eciesCrypto");

module.exports = {
  /**
   * 生成地址
   * @param chainId
   * @param passWord
   * @param prefix
   * @returns {{}}
   */
  newAddress: function newAddress(chainId, passWord, prefix) {
    var addressInfo = {
      "prefix": prefix
    };

    if (passWord) {
      addressInfo = sdk.newEcKey(passWord);
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
      addressInfo.pri = null;
    } else {
      addressInfo = sdk.newEcKey(passWord);
    }

    addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub, prefix);
    return addressInfo;
  },

  /**
   * 根据公钥获取地址
   * @param chainId
   * @param assetId
   * @param pub
   * @param prefix
   * @returns {*|string}
   */
  getAddressByPub: function getAddressByPub(chainId, assetId, pub, prefix) {
    return sdk.getStringAddressBase(chainId, assetId, '', pub, prefix);
  },

  /**
   * 验证地址
   * @param address
   * @returns {*}
   */
  verifyAddress: function verifyAddress(address) {
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
  importByKey: function importByKey(chainId, pri, passWord, prefix) {
    var addressInfo = {};
    var patrn = /^[A-Fa-f0-9]+$/;

    if (!patrn.exec(pri)) {
      //判断私钥是否为16进制
      return {
        success: false,
        data: 'Bad private key format'
      };
    }

    addressInfo.pri = pri;
    addressInfo.address = sdk.getStringAddress(chainId, pri, null, prefix);
    addressInfo.pub = sdk.getPub(pri);

    if (passWord) {
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
      addressInfo.pri = null;
    }

    return addressInfo;
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
  transactionAssemble: function transactionAssemble(inputs, outputs, remark, type, info) {
    var tt = [];

    if (type === 2) {
      //转账交易
      tt = new txs.TransferTransaction();
    } else if (type === 3) {
      //设置别名
      tt = new txs.AliasTransaction(info.fromAddress, info.alias);
    } else if (type === 4) {
      //创建节点
      tt = new txs.CreateAgentTransaction(info);
    } else if (type === 5) {
      //加入staking
      tt = new txs.addStakingTransaction(info);
    } else if (type === 6) {
      //nvt退出staking 锁定7天
      outputs[0].lockTime ? tt = new txs.outStakingTransaction(info, outputs[0].lockTime - 86400 * 7) : tt = new txs.outStakingTransaction(info); // tt = new txs.outStakingTransaction(info, outputs[0].lockTime - 86400 * 7);
    } else if (type === 9) {
      //注销节点  锁定15天 =86400*15
      tt = new txs.StopAgentTransaction(info, outputs[0].lockTime - 86400 * 15);
    } else if (type === 10) {
      //跨链转账
      tt = new txs.CrossChainTransaction();
    } else if (type === 28) {
      //追加保证金
      tt = new txs.DepositTransaction(info);
    } else if (type === 29) {
      //退出保证金
      tt = new txs.WithdrawTransaction(info);
    } else if (type === 32) {
      //批量退出
      outputs[0].lockTime ? tt = new txs.batchOutStakingTransaction(info, outputs[0].lockTime - 86400 * 7) : tt = new txs.batchOutStakingTransaction(info);
    } else if (type === 33) {
      //批量合并
      tt = new txs.batchMergeTransaction(info);
    } else if (type === 43) {
      //跨链提现
      tt = new txs.WithdrawalTransaction(info);
    } else if (type === 56) {
      //提现追加手续费
      tt = new txs.AdditionFeeTransaction(info);
    } else if (type === 228) {
      //创建交易对
      tt = new txs.CoinTradingTransaction(info);
    } else if (type === 229) {
      //委托挂单
      tt = new txs.TradingOrderTransaction(info);
    } else if (type === 230) {
      //取消委托挂单
      tt = new txs.CancelTradingOrderTransaction(info);
    }

    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    return tt;
  },

  /**
   * 交易签名
   * @param pri
   * @param pub
   * @param tAssemble
   * @returns {boolean}
   */
  transactionSerialize: function transactionSerialize(pri, pub, tAssemble) {
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
  transactionSignature: function transactionSignature(pri, tAssemble) {
    return sdk.signatureTransaction(tAssemble, pri);
  },

  /**
   * 解密私钥
   * @param aesPri
   * @param password
   * @returns {*}
   */
  decrypteOfAES: function decrypteOfAES(aesPri, password) {
    return sdk.decrypteOfAES(aesPri, password);
  },

  /**
   * 公钥加密内容
   * @param pub
   * @param data
   * @returns {Promise<string>}
   */
  encryptOfECIES: function encryptOfECIES(pub, data) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var bufferData, encrypted;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              bufferData = Buffer.from(data);
              _context.next = 3;
              return eccrypto.encrypt(pub, bufferData);

            case 3:
              encrypted = _context.sent;
              return _context.abrupt("return", encrypted.toString("hex"));

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  },

  /**
   * 私钥解密内容
   * @param pri
   * @param encrypted
   * @returns {Promise<string>}
   */
  decryptOfECIES: function decryptOfECIES(pri, encrypted) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var bufferData, decrypted;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              bufferData = Buffer.from(encrypted, "hex");
              _context2.next = 3;
              return eccrypto.decrypt(pri, bufferData);

            case 3:
              decrypted = _context2.sent;
              return _context2.abrupt("return", decrypted.toString());

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  },

  /**
   *  追加签名
   * @params: txHex 签名hex
   * @params: prikeyHex 追加签名私钥
   * @date: 2020-08-12 15:24
   * @author: Wave
   **/
  appendSignature: function appendSignature(txHex, prikeyHex) {
    // 解析交易
    var bufferReader = new BufferReader(Buffer.from(txHex, "hex"), 0); // 反序列回交易对象

    var tx = new txs.Transaction();
    tx.parse(bufferReader); // 初始化签名对象

    var txSignData = new txsignatures.TransactionSignatures(); // 反序列化签名对象

    var reader = new BufferReader(tx.signatures, 0);
    txSignData.parse(reader); //获取本账户公钥

    var pub = sdk.getPub(prikeyHex); // 签名

    var sigHex = sdk.signature(tx.getHash().toString("hex"), prikeyHex);
    var signValue = Buffer.from(sigHex, 'hex'); // 追加签名到对象中

    txSignData.addSign(Buffer.from(pub, "hex"), signValue); // 追加签名到交易中

    tx.signatures = txSignData.serialize(); //计算交易hash

    tx.calcHash(); //console.log(tx.getHash().toString("hex"));
    // 结果
    //console.log(tx.txSerialize().toString("hex"));

    return {
      success: true,
      data: {
        hash: tx.getHash().toString("hex"),
        hex: tx.txSerialize().toString("hex")
      }
    };
  }
};