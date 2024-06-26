const Serializers = require("../api/serializers");
const BufferReader = require("../utils/bufferreader");
const TxSignatures = require("./signatures");
const CoinData = require("./coindata");
const sdk = require("../api/sdk");
const bs58 = require('bs58');
const bufferFrom = require('buffer-from');

/**
 *
 * @param address
 * @returns {*}
 */
function addressToBytes(address) {
  let bytes = bs58.decode(address);
  return bufferFrom(bytes.subarray(0, 23));
}

/**
 *
 * @param bytes
 * @returns {*}
 */
function bytesToAddress(bytes) {
  let xor = 0x00;
  let temp = "";
  let tempBuffer = new Buffer(bytes.length + 1);
  for (let i = 0; i < bytes.length; i++) {
    temp = bytes[i];
    temp = temp > 127 ? temp - 256 : temp;
    tempBuffer[i] = temp;
    xor ^= temp
  }
  tempBuffer[bytes.length] = xor;
  return bs58.encode(tempBuffer)
}

let typeMap = {
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
  49: "虚拟银行初始化异构链",
};

/**
 * 所有交易的基础类
 * @constructor
 */
let Transaction = function () {
  this.hash = null;
  this.type = 0;//交易类型
  let times = (new Date()).valueOf();
  this.time = Number(times.toString().substr(0, times.toString().length - 3)); //交易时间
  this.remark = null;//备注
  this.txData = null;//业务数据
  this.coinData = [];//输入输出
  this.signatures = [];//签名列表

  this.parse = function (bufferReader) {
    this.type = bufferReader.readUInt16LE();
    this.time = bufferReader.readUInt32LE();
    this.remark = bufferReader.readBytesByLength();
    this.txData = bufferReader.readBytesByLength();
    this.coinData = bufferReader.readBytesByLength();
    this.signatures = bufferReader.readBytesByLength();
  };

  this.printInfo = function () {
    let signatures = new TxSignatures(new BufferReader(this.signatures, 0));
    let coinData = new CoinData(new BufferReader(this.coinData, 0));
    return {coinData: coinData, signatures: signatures};
  };
  this.getTxDataStr = function () {
    if (!this.txData || 0 === this.txData.length) {
      return "--";
    }
    return this.txData.toString('hex');
  };

  this.txSerialize = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
    bw.writeString(this.remark);
    bw.writeBytesWithLength(this.txData);//txData
    bw.writeBytesWithLength(this.coinData);
    bw.writeBytesWithLength(this.signatures);
    return bw.getBufWriter().toBuffer();
  };

  //序列化交易，不包含签名数据
  this.serializeForHash = function () {
    let bw = new Serializers();
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
    let bw = new Serializers();
    bw.getBufWriter().writeVarintNum(inputs.length);
    if (inputs.length > 0) {
      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
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
      for (let i = 0; i < outputs.length; i++) {
        let output = outputs[i];
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
  Transaction,

  /**
   * 转账交易
   * @constructor
   */
  TransferTransaction: function () {
    Transaction.call(this);
    this.type = 2;
  },

  /**
   * 跨链交易
   * @constructor
   */
  CrossChainTransaction: function () {
    Transaction.call(this);
    this.type = 10;
  },

  /**
   * 设置别名交易
   * @param address
   * @param alias
   * @constructor
   */
  AliasTransaction: function (address, alias) {
    Transaction.call(this);
    this.type = 3;
    let bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(address));
    bw.writeString(alias);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 创建节点交易
   * @param agent
   * @constructor
   */
  CreateAgentTransaction: function (agent) {
    Transaction.call(this);
    //对象属性结构
    if (!agent || !agent.agentAddress || !agent.packingAddress || !agent.rewardAddress || !agent.deposit) {
      throw "Data wrong!";
    }
    this.type = 4;
    let bw = new Serializers();
    bw.writeBigInt(agent.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(agent.agentAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.packingAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.rewardAddress));
    //bw.getBufWriter().writeUInt8(agent.commissionRate);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 加入staking
   * @param entity
   * @constructor
   */
  addStakingTransaction: function (entity) {
    //console.log(entity);
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.deposit || !entity.address || !entity.assetsChainId || !entity.assetsId) {
      throw "Data Wrong!";
    }
    this.type = 5;
    let bw = new Serializers();
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
  outStakingTransaction: function (entity, lockTime) {
    //console.log(entity);
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash) {
      throw "Data Wrong!";
    }
    this.type = 6;
    if (lockTime) {
      this.time = lockTime;
    }

    let bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 批量退出staking
   * @param entity
   * @constructor
   */
  batchOutStakingTransaction: function (entity, lockTime) {
    //console.log(entity);
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.agentHash.length) {
      throw "Data Wrong!";
    }
    this.type = 32;
    if (lockTime) {
      this.time = lockTime;
    }

    let bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().writeVarintNum(entity.agentHash.length)
    for (let item of entity.agentHash) {
      bw.getBufWriter().write(Buffer.from(item, 'hex'));
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 批量合并
   * @param entity
   * @constructor
   */
  batchMergeTransaction: function (entity) {
    //console.log(entity);
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.deposit || !entity.address || !entity.assetsChainId || !entity.assetsId || !entity.agentHash || !entity.agentHash.length) {
      throw "Data Wrong!";
    }
    this.type = 33;
    let bw = new Serializers();
    bw.writeBigInt(entity.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().writeUInt16LE(entity.assetsChainId);
    bw.getBufWriter().writeUInt16LE(entity.assetsId);
    bw.getBufWriter().write(Buffer.from([entity.depositType]));
    bw.getBufWriter().write(Buffer.from([entity.timeType]));
    bw.getBufWriter().writeVarintNum(entity.agentHash.length)
    for (let item of entity.agentHash) {
      bw.getBufWriter().write(Buffer.from(item, 'hex'));
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 注销节点
   * @param entity
   * @constructor
   */
  StopAgentTransaction: function (entity, lockTime) {
    Transaction.call(this);
    if (!entity || !entity.address || !entity.agentHash) {
      throw "Data wrong!";
    }
    this.type = 9;
    this.time = lockTime;

    let bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 追加保证金
   * @param entity
   * @constructor
   */
  DepositTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.amount) {
      throw "Data Wrong!";
    }
    this.type = 28;
    let bw = new Serializers();
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
  WithdrawTransaction: function (entity) {
    //console.log(entity);
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.amount) {
      throw "Data Wrong!";
    }
    this.type = 29;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.writeBigInt(entity.amount);
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  WithdrawalTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.heterogeneousAddress || !entity.heterogeneousChainId) {
      throw "Data Wrong!";
    }
    this.type = 43;
    let bw = new Serializers();
    bw.writeString(entity.heterogeneousAddress);
    bw.getBufWriter().writeUInt16LE(entity.heterogeneousChainId);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc 提现追加手续费
   */
  AdditionFeeTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.txHash) {
      throw "Data Wrong!";
    }
    this.type = 56;
    let bw = new Serializers();
    bw.writeString(entity.txHash)
    if (entity.extend) {
      bw.writeBytesWithLength(Buffer.from(entity.extend, 'hex'))
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc 创建swap交易对
   */
  SwapCreatePairTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.tokenA || !entity.tokenB) {
      throw "Data Wrong!";
    }
    this.type = 61;
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(entity.tokenA.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenA.assetId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.assetId);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc swap添加流动性
   */
  SwapAddLiquidityTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 64;
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(entity.tokenA.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenA.assetId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.assetId);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    bw.getBufWriter().writeUInt32LE(entity.deadline);
    bw.writeBigInt(entity.amountAMin);
    bw.writeBigInt(entity.amountBMin);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc swap移除流动性
   */
  SwapRemoveLiquidityTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 65;
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(entity.tokenA.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenA.assetId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.assetId);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    bw.getBufWriter().writeUInt32LE(entity.deadline);
    bw.writeBigInt(entity.amountAMin);
    bw.writeBigInt(entity.amountBMin);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc swap币币交易
   */
  SwapTradeTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 63;
    let bw = new Serializers();
    bw.writeBigInt(entity.amountOutMin);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.feeTo));
    bw.getBufWriter().writeUInt32LE(entity.deadline);
    let tokenPath = entity.tokenPath;
    let length = tokenPath.length;
    bw.getBufWriter().writeUInt8(length);
    for (let i = 0; i < length; i++) {
      let token = tokenPath[i];
      bw.getBufWriter().writeUInt16LE(token.chainId);
      bw.getBufWriter().writeUInt16LE(token.assetId);
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc 创建stable-swap交易对
   */
  StableSwapCreatePairTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 71;
    let bw = new Serializers();
    let coins = entity.coins;
    let symbol = entity.symbol;
    let length = coins.length;
    bw.getBufWriter().writeUInt8(length);
    for (let i = 0; i < length; i++) {
      let coin = coins[i];
      bw.getBufWriter().writeUInt16LE(coin.chainId);
      bw.getBufWriter().writeUInt16LE(coin.assetId);
    }
    if (symbol && symbol.length > 0) {
      bw.writeString(symbol);
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc stable-swap添加流动性
   */
  StableSwapAddLiquidityTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 73;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc stable-swap移除流动性
   */
  StableSwapRemoveLiquidityTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 74;
    let bw = new Serializers();
    bw.writeBytesWithLength(entity.indexs);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc stable-swap币币交易
   */
  StableSwapTradeTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 72;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    bw.getBufWriter().write(entity.tokenOutIndex);
    if (entity.feeTo && entity.feeTo.length > 0) {
      bw.getBufWriter().write(sdk.getBytesAddress(entity.feeTo));
    }
    this.txData = bw.getBufWriter().toBuffer();
  },
  /**
   * @desc stable-lp-swap交易
   */
  StableLpSwapTradeTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 77;
    let bw = new Serializers();
    bw.writeBigInt(entity.amountOutMin);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.feeTo));
    bw.getBufWriter().writeUInt32LE(entity.deadline);
    let tokenPath = entity.tokenPath;
    let length = tokenPath.length;
    bw.getBufWriter().writeUInt8(length);
    for (let i = 0; i < length; i++) {
      let token = tokenPath[i];
      bw.getBufWriter().writeUInt16LE(token.chainId);
      bw.getBufWriter().writeUInt16LE(token.assetId);
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @desc Swap交易聚合稳定币撤销流动性交易
   */
  SwapTradeStableRemoveLpTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity) {
      throw "Data Wrong!";
    }
    this.type = 83;
    let bw = new Serializers();
    bw.writeBigInt(entity.amountOutMin);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.to));
    bw.writeBytesWithLength(sdk.getBytesAddress(entity.feeTo));
    bw.getBufWriter().writeUInt32LE(entity.deadline);
    let tokenPath = entity.tokenPath;
    let length = tokenPath.length;
    bw.getBufWriter().writeUInt8(length);
    for (let i = 0; i < length; i++) {
      let token = tokenPath[i];
      bw.getBufWriter().writeUInt16LE(token.chainId);
      bw.getBufWriter().writeUInt16LE(token.assetId);
    }
    bw.getBufWriter().writeUInt16LE(entity.targetToken.chainId);
    bw.getBufWriter().writeUInt16LE(entity.targetToken.assetId);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * @disc: 创建交易对
   * @params:
   * @date: 2020-08-20 12:00
   * @author: Wave
   */
  CoinTradingTransaction: function (coinTrading) {
    Transaction.call(this);
    this.type = 228;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(coinTrading.address))
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
  TradingOrderTransaction: function (tradingOrder) {
    Transaction.call(this);
    this.type = 229;
    let bw = new Serializers();
    let hash = Buffer.from(tradingOrder.tradingHash, 'hex');
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
  CancelTradingOrderTransaction: function (tradingOrder) {
    Transaction.call(this);
    this.type = 230;
    let bw = new Serializers();
    let hash = Buffer.from(tradingOrder.orderHash, 'hex');
    bw.getBufWriter().write(hash);
    this.txData = bw.getBufWriter().toBuffer();
  },

  FarmCreateTransaction: function (entity) {
    Transaction.call(this);
    this.type = 62;
    let bw = new Serializers();

    bw.getBufWriter().writeUInt16LE(entity.tokenA.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenA.assetId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.chainId);
    bw.getBufWriter().writeUInt16LE(entity.tokenB.assetId);
    bw.writeBigInt(entity.syrupPerBlock)
    bw.writeBigInt(entity.totalSyrupAmount)
    bw.writeUInt64LE(entity.startBlockHeight);
    bw.writeUInt64LE(entity.lockedTime);
    if(!entity.modifiable){
      entity.modifiable = false;
    }
    if(!entity.withdrawLockTime){
      entity.withdrawLockTime = 0;
    }
    bw.writeBoolean(entity.modifiable);
    bw.writeUInt64LE(entity.withdrawLockTime)
    this.txData = bw.getBufWriter().toBuffer();
  },

  FarmStakeTransaction: function (entity) {
    Transaction.call(this);
    this.type = 66;
    let bw = new Serializers();
    let hash = Buffer.from(entity.farmHash, 'hex');
    bw.getBufWriter().write(hash);
    bw.writeBigInt(entity.amount);
    this.txData = bw.getBufWriter().toBuffer();
  },

  FarmUpdateTransaction: function (entity) {
    Transaction.call(this);
    this.type = 75;
    let bw = new Serializers();
    let hash = Buffer.from(entity.farmHash, 'hex');
    bw.getBufWriter().write(hash);
    bw.writeBigInt(entity.newSyrupPerBlock);
    bw.getBufWriter().writeUInt8(entity.changeType);
    bw.writeBigInt(entity.changeTotalSyrupAmount);
    bw.writeUInt64LE(entity.withdrawLockTime);
    this.txData = bw.getBufWriter().toBuffer();
  },

  FarmWithdrawTransaction: function (entity) {
    Transaction.call(this);
    this.type = 67;
    let bw = new Serializers();
    let hash = Buffer.from(entity.farmHash, 'hex');
    bw.getBufWriter().write(hash);
    bw.writeBigInt(entity.amount);
    this.txData = bw.getBufWriter().toBuffer();
  },

};

