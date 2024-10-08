const http = require('./https.js');
const sdk = require('../../api/sdk');
const cryptos = require("crypto");
const numberUtil = require("../../utils/numberUtil");

module.exports = {

  /**
   * 判断是否为主网
   * @param chainId
   **/
  isMainNet(chainId) {
    if (chainId === 2) {
      return true;
    }
    return false;
  },

  /**
   * 计算手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countFee(tx, signatrueCount) {
    let txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 100000 * Math.ceil(txSize / 1024);
  },

  /**
   * 计算跨链交易手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countCtxFee(tx, signatrueCount) {
    let txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 1000000 * Math.ceil(txSize / 1024);
  },

  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type
   * @returns {*}
   */
  mutiInputsOrOutputs(transferInfo, balanceInfo, type) {
    let newAmount = numberUtil.Plus(transferInfo.from.amount, transferInfo.fee);
    let newLocked = 0;
    let newNonce = balanceInfo.nonce;
    if (numberUtil.isLessThan(balanceInfo.balance, newAmount)) {
      return {success: false, data: "Your balance is not enough."}
    }
    let inputs = [{
      address: transferInfo.from.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    }];
    let outputs = [];
    for (let i = 0; i < transferInfo.to.length; i++) {
      let to = transferInfo.to[i];
      outputs.push({
        address: to.toAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: to.amount,
        lockTime: to.lockTime ? to.lockTime : 0
      })
    }
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  },

  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type 2:转账 4:创建节点 5:加入staking 6:退出staking 9:注销节点 28:追加保证金 29:退出保证金
   * @returns {*}
   */
  inputsOrOutputs(transferInfo, balanceInfo, type) {
    transferInfo.amount = numberUtil.instance(transferInfo.amount).toFixed();
    transferInfo.fee = numberUtil.instance(transferInfo.fee).toFixed();
    let newAmount = numberUtil.Plus(transferInfo.amount, transferInfo.fee);
    let newLocked = 0;
    let newNonce = balanceInfo.nonce;
    let newoutputAmount = numberUtil.instance(transferInfo.amount);
    let newLockTime = 0;
    let inputs = [];
    let outputs = [];

    if (type === 4) {
      newLockTime = -1;
    } else if (type === 5) {
      if (transferInfo.defaultAssetsInfo) { // 加入的资产不是nvt input组装两个
        let newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: 0,
          nonce: balanceInfo.nonce
        };
        inputs.push(newArr);
        let feeArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.defaultAssetsInfo.chainId,
          assetsId: transferInfo.defaultAssetsInfo.assetsId,
          amount: transferInfo.fee,
          locked: 0,
          nonce: transferInfo.feeBalanceInfo.nonce
        };
        inputs.push(feeArr);
      } else { // 加入的资产是nvt 合并amount+fee
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: newAmount.toFixed(),
          locked: 0,
          nonce: balanceInfo.nonce
        });
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        lockTime: transferInfo.locked
      });
      return {success: true, data: {inputs: inputs, outputs: outputs}};
    } else if (type === 6) {
      if (transferInfo.defaultAssetsInfo) { // 加入的资产不是nvt input组装两个
        let newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: -1,
          nonce: balanceInfo.nonce
        };
        inputs.push(newArr);
        let feeArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.defaultAssetsInfo.chainId,
          assetsId: transferInfo.defaultAssetsInfo.assetsId,
          amount: transferInfo.fee,
          locked: -1,
          nonce: transferInfo.feeBalanceInfo.nonce
        };
        inputs.push(feeArr);
        outputs.push({
          address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          lockTime: 0
        });
      } else { // 加入的资产是nvt 合并amount+fee
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: -1,
          nonce: balanceInfo.nonce
        });
        outputs.push({
          address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: numberUtil.Minus(transferInfo.amount, transferInfo.fee).toFixed(),
          lockTime: 0
        });
      }

      return {success: true, data: {inputs: inputs, outputs: outputs}};
    } else if (type === 9) { //注销节点
      newoutputAmount = numberUtil.Minus(transferInfo.amount, transferInfo.fee);
      let times = (new Date()).valueOf() + 3600000 * 72;//锁定三天
      newLockTime = Number(times.toString().substr(0, times.toString().length - 3));
      for (let item of transferInfo.nonceList) {
        let newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: item.deposit,
          locked: -1,
          nonce: item.nonce
        };
        inputs.push(newArr)
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newoutputAmount.toFixed(),
        lockTime: newLockTime
      });
      return {success: true, data: {inputs: inputs, outputs: outputs}};
    } else if (type === 28) { //追加保证金
      newLockTime = -1;
    } else if (type === 29) { //退出保证金
      newoutputAmount = numberUtil.Minus(transferInfo.amount, transferInfo.fee);
      //锁定三天
      let times = (new Date()).valueOf() + 3600000 * 72;
      newLockTime = Number(times.toString().substr(0, times.toString().length - 3));

      for (let item of transferInfo.nonceList) {
        let newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: item.deposit,
          locked: -1,
          nonce: item.nonce
        };
        inputs.push(newArr)
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newoutputAmount.toFixed(),
        lockTime: newLockTime
      });
      let allAmount = 0;
      for (let item of transferInfo.nonceList) {
        // allAmount = allAmount + Number(item.deposit);
        allAmount = numberUtil.Plus(allAmount, item.deposit);
      }
      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: numberUtil.Minus(allAmount, transferInfo.amount).toFixed(),
        lockTime: -1
      });

      return {success: true, data: {inputs: inputs, outputs: outputs}};
    }

    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount.toFixed(),
      locked: newLocked,
      nonce: newNonce
    });

    outputs.push({
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newoutputAmount.toFixed(),
      lockTime: newLockTime
    });

    /*console.log(inputs);
    console.log(outputs);*/
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  },

  /**
   * 获取跨链交易inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param chainId
   * @returns {*}
   */
  async ctxInputsOrOutputs(transferInfo, balanceInfo, chainId) {
    let inputs = [];
    let outputs = [{
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: transferInfo.amount,
      lockTime: 0
    }];

    let mainNetBalanceInfo = await this.getBalance(chainId, 2, 1, transferInfo.fromAddress);
    let localBalanceInfo;
    //如果不是主网需要收取NULS手续费
    if (!isMainNet(chainId)) {
      if (mainNetBalanceInfo.balance < transferInfo.fee) {
        console.log("余额不足");
        return;
      }
    }

    //如果转出资产为本链主资产，则直接将手续费加到转出金额上
    if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
      let newAmount = transferInfo.amount + transferInfo.fee;
      if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
        console.log("余额不足");
        return;
      }
      //转出的本链资产 = 转出资产amount + 本链手续费
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newAmount,
        locked: 0,
        nonce: balanceInfo.nonce
      });
      //如果不是主网需收取主网NULS手续费
      if (!isMainNet(chainId)) {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
    } else {
      localBalanceInfo = await this.getBalance(chainId, chainId, 1, transferInfo.fromAddress);
      if (localBalanceInfo.balance < transferInfo.fee) {
        console.log("该账户本链主资产不足够支付手续费！");
        return;
      }
      //如果转出的是NULS，则需要把NULS手续费添加到转出金额上
      if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
        let newAmount = transferInfo.amount + transferInfo.fee;
        if (mainNetBalanceInfo.balance < newAmount) {
          console.log("余额不足");
          return;
        }
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: newAmount,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      } else {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: 0,
          nonce: balanceInfo.nonce
        });
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
      //本链主资产手续费
      if (!isMainNet(chainId)) {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: chainId,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: localBalanceInfo.nonce
        });
      }
    }
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @param chainId
   * @param assetChainId
   * @param assetId
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getBalance(chainId, assetChainId = 5, assetId = 1, address) {
    return await http.postComplete('/', 'getAccountBalance', [chainId, assetChainId, assetId, address])
      .then((response) => {
        //console.log(response);
        return {'balance': response.result.balance, 'nonce': response.result.nonce};
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getNulsBalance(address, chainId = 5, assetId = 1) {
    return await http.post('/', 'getAccountBalance', [chainId, assetId, address])
        .then((response) => {
          //console.log(response);

          if (response.hasOwnProperty("result")) {
            return {success: true, data: {balance: response.result.balance, nonce: response.result.nonce}}
          } else {

            throw "Get balance error"
            // return {success: false, data: response}
          }
        })
        .catch((error) => {
          // console.log(error)
          throw "Network error"
          // return {success: false, data: error};
        });
  },

  /**
   * 验证交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async validateTx(txHex) {
    return await http.post('/', 'validateTx', [txHex])
      .then((response) => {
        //console.log(response);
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, error: response.error};
        }
      })
      .catch((error) => {
        return {success: false, error: error};
      });
  },

  /**
   * 获取所有地址前缀映射关系
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getAllAddressPrefix() {
    return await http.post('/', 'getAllAddressPrefix', [])
      .then((response) => {
        console.log(response);
        if (response.hasOwnProperty("result")) {
          let data = {};

          for (var i = 0; i < response.result.length; i++) {
            data[response.result[i].chainId] = response.result[i].addressPrefix
          }

          return {success: true, data: data};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取所有可用于swap交易的稳定币交易池
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getStablePairListForSwapTrade() {
    return await http.post('/', 'getStablePairListForSwapTrade', [])
      .then((response) => {
        console.log(response);
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 广播交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async broadcastTx(txHex) {
    return await http.post('/', 'broadcastTx', [txHex])
      .then((response) => {
        if (response.hasOwnProperty("result")) {
          return response.result;
        } else {
          return response.error;
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 跨链交易广播
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async sendCrossTx(txHex) {
    return await http.post('/', 'sendCrossTx', [8, txHex])
      .then((response) => {
        console.log(response);
        return response.result;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取节点详细信息
   * @param agentHash
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getConsensusNode(agentHash) {
    return await http.post('/', 'getConsensusNode', [agentHash])
      .then((response) => {
        if (response.hasOwnProperty('result')) {
          return {success: true, data: response.result}
        } else {
          return {success: false, data: response}
        }

      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 查询资产的USD价格
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getSymbolPriceOfUsdt(chainId, assetId, assetType = '') {
    return await http.postComplete('/', 'getQuotationUsdtPrice', [chainId, assetId, assetType])
    // return await http.postComplete('/', 'getBestSymbolPrice', [chainId, assetId, assetType])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
            return response.result;
          } else {
            return response.error;
          }
        })
        .catch((error) => {
          return {success: false, data: error};
        });
  },

  /**
   * 返回异构链主资产在NERVE网络的资产信息
   */
  async getHeterogeneousMainAsset(htgChainId) {
    return await http.postComplete('/', 'getHeterogeneousMainAsset', [htgChainId])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
            return response.result;
          } else {
            return response.error;
          }
        })
        .catch((error) => {
          return {success: false, data: error};
        });
  },

  async getMinimumFeeOfWithdrawal(htgChainId, nerveTxHash) {
    return await http.postComplete('/', 'getMinimumFeeOfWithdrawal', [htgChainId, nerveTxHash])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
            return response.result;
          } else {
            return response.error;
          }
        })
        .catch((error) => {
          return {success: false, data: error};
        });
  },
};
