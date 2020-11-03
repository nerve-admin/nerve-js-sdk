function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Serializers = require("../api/serializers");

var BufferReader = require("../utils/bufferreader");

var TxSignatures = require("./signatures");

var CoinData = require("./coindata");

var sdk = require("../api/sdk");

var bs58 = require('bs58');

var bufferFrom = require('buffer-from');
/**
 *
 * @param address
 * @returns {*}
 */


function addressToBytes(address) {
  var bytes = bs58.decode(address);
  return bufferFrom(bytes.subarray(0, 23));
}
/**
 *
 * @param bytes
 * @returns {*}
 */


function bytesToAddress(bytes) {
  var xor = 0x00;
  var temp = "";
  var tempBuffer = new Buffer(bytes.length + 1);

  for (var i = 0; i < bytes.length; i++) {
    temp = bytes[i];
    temp = temp > 127 ? temp - 256 : temp;
    tempBuffer[i] = temp;
    xor ^= temp;
  }

  tempBuffer[bytes.length] = xor;
  return bs58.encode(tempBuffer);
}

var typeMap = {
  1: "共识奖励",
  2: "转账交易",
  3: "设置别名",
  4: "创建节点",
  5: "参与共识",
  6: "退出共识",
  7: "黄牌惩罚",
  8: "红牌惩罚",
  9: "注销节点",
  10: "跨链转账",
  11: "注册链",
  12: "注销链",
  13: "增加跨链资产",
  14: "注销跨链资产",
  15: "部署合约",
  16: "调用合约",
  17: "删除合约",
  18: "合约内部转账",
  19: "合约退费",
  20: "合约创建节点",
  21: "合约参与共识",
  22: "合约退出共识",
  23: "合约注销节点",
  24: "验证人变更",
  25: "验证人初始化",
  26: "合约转账",
  27: "资产注册登记",
  28: "追加保证金",
  29: "撤销保证金",
  30: "喂价",
  31: "最终交易",
  228: "创建交易对",
  229: "挂单委托",
  230: "挂单撤销",
  231: "挂单成交",
  232: "修改交易对",
  40: "确认虚拟银行变更",
  41: "虚拟银行变更",
  42: "链内充值",
  43: "提现",
  44: "确认提现成功",
  45: "发起提案",
  46: "提案投票",
  47: "异构链交易手续费补贴",
  48: "异构链合约资产注册",
  49: "虚拟银行初始化异构链"
};
/**
 * 所有交易的基础类
 * @constructor
 */

var Transaction = function Transaction() {
  this.hash = null;
  this.type = 0; //交易类型

  var times = new Date().valueOf();
  this.time = Number(times.toString().substr(0, times.toString().length - 3)); //交易时间

  this.remark = null; //备注

  this.txData = null; //业务数据

  this.coinData = []; //输入输出

  this.signatures = []; //签名列表

  this.parse = function (bufferReader) {
    this.type = bufferReader.readUInt16LE();
    this.time = bufferReader.readUInt32LE();
    this.remark = bufferReader.readBytesByLength();
    this.txData = bufferReader.readBytesByLength();
    this.coinData = bufferReader.readBytesByLength();
    this.signatures = bufferReader.readBytesByLength();
  };

  this.printInfo = function () {
    var signatures = new TxSignatures(new BufferReader(this.signatures, 0));
    var coinData = new CoinData(new BufferReader(this.coinData, 0));
  };

  this.getTxDataStr = function () {
    if (!this.txData || 0 === this.txData.length) {
      return "--";
    }

    return this.txData.toString('hex');
  };

  this.txSerialize = function () {
    var bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
    bw.writeString(this.remark);
    bw.writeBytesWithLength(this.txData); //txData

    bw.writeBytesWithLength(this.coinData);
    bw.writeBytesWithLength(this.signatures);
    return bw.getBufWriter().toBuffer();
  }; //序列化交易，不包含签名数据


  this.serializeForHash = function () {
    var bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
    bw.writeString(this.remark);
    bw.writeBytesWithLength(this.txData);
    bw.writeBytesWithLength(this.coinData);
    return bw.getBufWriter().toBuffer();
  };

  this.calcHash = function () {
    return sdk.getTxHash(this);
  };

  this.setCoinData = function (inputs, outputs) {
    var bw = new Serializers();
    bw.getBufWriter().writeVarintNum(inputs.length);

    if (inputs.length > 0) {
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        bw.writeBytesWithLength(sdk.getBytesAddress(input.address));
        bw.getBufWriter().writeUInt16LE(input.assetsChainId);
        bw.getBufWriter().writeUInt16LE(input.assetsId);
        bw.writeBigInt(input.amount);
        bw.writeBytesWithLength(Buffer.from(input.nonce, 'hex'));
        bw.getBufWriter().write(Buffer.from([input.locked]));
      }
    }

    bw.getBufWriter().writeVarintNum(outputs.length);

    if (outputs.length > 0) {
      for (var _i = 0; _i < outputs.length; _i++) {
        var output = outputs[_i];
        bw.writeBytesWithLength(sdk.getBytesAddress(output.address));
        bw.getBufWriter().writeUInt16LE(output.assetsChainId);
        bw.getBufWriter().writeUInt16LE(output.assetsId);
        bw.writeBigInt(output.amount);

        if (output.lockTime === -1) {
          bw.getBufWriter().write(Buffer.from("ffffffffffffffff", "hex"));
        } else if (output.lockTime === -2) {
          bw.getBufWriter().write(Buffer.from("feffffffffffffff", "hex"));
        } else {
          bw.writeUInt64LE(output.lockTime);
        }
      }
    }

    this.coinData = bw.getBufWriter().toBuffer();
  };

  this.getHash = function () {
    if (this.hash) {
      return this.hash;
    }

    return this.calcHash();
  };
};

module.exports = {
  Transaction: Transaction,

  /**
   * 转账交易
   * @constructor
   */
  TransferTransaction: function TransferTransaction() {
    Transaction.call(this);
    this.type = 2;
  },

  /**
   * 跨链交易
   * @constructor
   */
  CrossChainTransaction: function CrossChainTransaction() {
    Transaction.call(this);
    this.type = 10;
  },

  /**
   * 设置别名交易
   * @param address
   * @param alias
   * @constructor
   */
  AliasTransaction: function AliasTransaction(address, alias) {
    Transaction.call(this);
    this.type = 3;
    var bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(address));
    bw.writeString(alias);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 创建节点交易
   * @param agent
   * @constructor
   */
  CreateAgentTransaction: function CreateAgentTransaction(agent) {
    Transaction.call(this); //对象属性结构

    if (!agent || !agent.agentAddress || !agent.packingAddress || !agent.rewardAddress || !agent.deposit) {
      throw "Data wrong!";
    }

    this.type = 4;
    var bw = new Serializers();
    bw.writeBigInt(agent.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(agent.agentAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.packingAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.rewardAddress)); //bw.getBufWriter().writeUInt8(agent.commissionRate);

    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 加入staking
   * @param entity
   * @constructor
   */
  addStakingTransaction: function addStakingTransaction(entity) {
    //console.log(entity);
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.deposit || !entity.address || !entity.assetsChainId || !entity.assetsId) {
      throw "Data Wrong!";
    }

    this.type = 5;
    var bw = new Serializers();
    bw.writeBigInt(entity.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().writeUInt16LE(entity.assetsChainId);
    bw.getBufWriter().writeUInt16LE(entity.assetsId);
    bw.getBufWriter().write(Buffer.from([entity.depositType]));
    bw.getBufWriter().write(Buffer.from([entity.timeType]));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 退出staking
   * @param entity
   * @constructor
   */
  outStakingTransaction: function outStakingTransaction(entity, lockTime) {
    //console.log(entity);
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.address || !entity.agentHash) {
      throw "Data Wrong!";
    }

    this.type = 6;

    if (lockTime) {
      this.time = lockTime;
    }

    var bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 批量退出staking
   * @param entity
   * @constructor
   */
  batchOutStakingTransaction: function batchOutStakingTransaction(entity, lockTime) {
    //console.log(entity);
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.address || !entity.agentHash || !entity.agentHash.length) {
      throw "Data Wrong!";
    }

    this.type = 32;

    if (lockTime) {
      this.time = lockTime;
    }

    var bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().writeVarintNum(entity.agentHash.length);

    var _iterator = _createForOfIteratorHelper(entity.agentHash),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;
        bw.getBufWriter().write(Buffer.from(item, 'hex'));
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 批量合并
   * @param entity
   * @constructor
   */
  batchMergeTransaction: function batchMergeTransaction(entity) {
    //console.log(entity);
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.deposit || !entity.address || !entity.assetsChainId || !entity.assetsId || !entity.agentHash || !entity.agentHash.length) {
      throw "Data Wrong!";
    }

    this.type = 33;
    var bw = new Serializers();
    bw.writeBigInt(entity.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().writeUInt16LE(entity.assetsChainId);
    bw.getBufWriter().writeUInt16LE(entity.assetsId);
    bw.getBufWriter().write(Buffer.from([entity.depositType]));
    bw.getBufWriter().write(Buffer.from([entity.timeType]));
    bw.getBufWriter().writeVarintNum(entity.agentHash.length);

    var _iterator2 = _createForOfIteratorHelper(entity.agentHash),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var item = _step2.value;
        bw.getBufWriter().write(Buffer.from(item, 'hex'));
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 注销节点
   * @param entity
   * @constructor
   */
  StopAgentTransaction: function StopAgentTransaction(entity, lockTime) {
    Transaction.call(this);

    if (!entity || !entity.address || !entity.agentHash) {
      throw "Data wrong!";
    }

    this.type = 9;
    this.time = lockTime;
    var bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 追加保证金
   * @param entity
   * @constructor
   */
  DepositTransaction: function DepositTransaction(entity) {
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.address || !entity.agentHash || !entity.amount) {
      throw "Data Wrong!";
    }

    this.type = 28;
    var bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.writeBigInt(entity.amount);
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 退出保证金
   * @param entity
   * @constructor
   */
  WithdrawTransaction: function WithdrawTransaction(entity) {
    //console.log(entity);
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.address || !entity.agentHash || !entity.amount) {
      throw "Data Wrong!";
    }

    this.type = 29;
    var bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.writeBigInt(entity.amount);
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },
  WithdrawalTransaction: function WithdrawalTransaction(entity) {
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.heterogeneousAddress) {
      throw "Data Wrong!";
    }

    this.type = 43;
    var bw = new Serializers();
    bw.writeString(entity.heterogeneousAddress);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc 提现追加手续费
   */
  AdditionFeeTransaction: function AdditionFeeTransaction(entity) {
    Transaction.call(this); //对象属性结构

    if (!entity || !entity.txHash) {
      throw "Data Wrong!";
    }

    this.type = 56;
    var bw = new Serializers();
    bw.getBufWriter().write(Buffer.from(entity.txHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @disc: 创建交易对
   * @params:
   * @date: 2020-08-20 12:00
   * @author: Wave
   */
  CoinTradingTransaction: function CoinTradingTransaction(coinTrading) {
    Transaction.call(this);
    this.type = 228;
    var bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(coinTrading.address));
    bw.getBufWriter().writeUInt16LE(coinTrading.baseAssetChainId);
    bw.getBufWriter().writeUInt16LE(coinTrading.baseAssetId);
    bw.getBufWriter().writeUInt8(coinTrading.scaleBaseDecimal);
    bw.getBufWriter().writeUInt16LE(coinTrading.quoteAssetChainId);
    bw.getBufWriter().writeUInt16LE(coinTrading.quoteAssetId);
    bw.getBufWriter().writeUInt8(coinTrading.scaleQuoteDecimal);
    bw.writeBigInt(coinTrading.minBaseAmount);
    bw.writeBigInt(coinTrading.minQuoteAmount);
    this.txData = bw.getBufWriter().toBuffer();
  },
  //dex 交易对添加委托
  TradingOrderTransaction: function TradingOrderTransaction(tradingOrder) {
    Transaction.call(this);
    this.type = 229;
    var bw = new Serializers();
    var hash = Buffer.from(tradingOrder.tradingHash, 'hex');
    bw.getBufWriter().write(hash);
    bw.getBufWriter().write(sdk.getBytesAddress(tradingOrder.address));
    bw.getBufWriter().writeUInt8(tradingOrder.orderType);
    bw.writeBigInt(tradingOrder.amount);
    bw.writeBigInt(tradingOrder.price);
    bw.writeBytesWithLength(sdk.getBytesAddress(tradingOrder.feeAddress));
    bw.getBufWriter().writeUInt8(tradingOrder.feeScale);
    this.txData = bw.getBufWriter().toBuffer();
  },
  //dex 交易对撤销委托
  CancelTradingOrderTransaction: function CancelTradingOrderTransaction(tradingOrder) {
    Transaction.call(this);
    this.type = 230;
    var bw = new Serializers();
    var hash = Buffer.from(tradingOrder.orderHash, 'hex');
    bw.getBufWriter().write(hash);
    this.txData = bw.getBufWriter().toBuffer();
  }
};