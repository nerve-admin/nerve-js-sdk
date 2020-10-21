"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var http = require('./https.js');

module.exports = {
  /**
   * 判断是否为主网
   * @param chainId
   **/
  isMainNet: function isMainNet(chainId) {
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
  countFee: function countFee(tx, signatrueCount) {
    var txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 100000 * Math.ceil(txSize / 1024);
  },

  /**
   * 计算跨链交易手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countCtxFee: function countCtxFee(tx, signatrueCount) {
    var txSize = tx.txSerialize().length;
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
  mutiInputsOrOutputs: function mutiInputsOrOutputs(transferInfo, balanceInfo, type) {
    var newAmount = transferInfo.from.amount + transferInfo.fee;
    var newLocked = 0;
    var newNonce = balanceInfo.nonce;

    if (balanceInfo.balance < newAmount) {
      return {
        success: false,
        data: "Your balance is not enough."
      };
    }

    var inputs = [{
      address: transferInfo.from.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    }];
    var outputs = [];

    for (var i = 0; i < transferInfo.to.length; i++) {
      var to = transferInfo.to[i];
      outputs.push({
        address: to.toAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: to.amount,
        lockTime: to.lockTime ? to.lockTime : 0
      });
    }

    return {
      success: true,
      data: {
        inputs: inputs,
        outputs: outputs
      }
    };
  },

  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type 2:转账 4:创建节点 5:加入staking 6:退出staking 9:注销节点 28:追加保证金 29:退出保证金
   * @returns {*}
   */
  inputsOrOutputs: function inputsOrOutputs(transferInfo, balanceInfo, type) {
    var newAmount = transferInfo.amount + transferInfo.fee;
    var newLocked = 0;
    var newNonce = balanceInfo.nonce;
    var newoutputAmount = transferInfo.amount;
    var newLockTime = 0;
    var inputs = [];
    var outputs = [];

    if (type === 4) {
      newLockTime = -1;
    } else if (type === 5) {
      if (transferInfo.defaultAssetsInfo) {
        // 加入的资产不是nvt input组装两个
        var newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: 0,
          nonce: balanceInfo.nonce
        };
        inputs.push(newArr);
        var feeArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.defaultAssetsInfo.chainId,
          assetsId: transferInfo.defaultAssetsInfo.assetsId,
          amount: transferInfo.fee,
          locked: 0,
          nonce: transferInfo.feeBalanceInfo.nonce
        };
        inputs.push(feeArr);
      } else {
        // 加入的资产是nvt 合并amount+fee
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount + transferInfo.fee,
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
      return {
        success: true,
        data: {
          inputs: inputs,
          outputs: outputs
        }
      };
    } else if (type === 6) {
      if (transferInfo.defaultAssetsInfo) {
        // 加入的资产不是nvt input组装两个
        var _newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: -1,
          nonce: balanceInfo.nonce
        };
        inputs.push(_newArr);
        var _feeArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.defaultAssetsInfo.chainId,
          assetsId: transferInfo.defaultAssetsInfo.assetsId,
          amount: transferInfo.fee,
          locked: -1,
          nonce: transferInfo.feeBalanceInfo.nonce
        };
        inputs.push(_feeArr);
        outputs.push({
          address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          lockTime: 0
        });
      } else {
        // 加入的资产是nvt 合并amount+fee
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
          amount: transferInfo.amount - transferInfo.fee,
          lockTime: 0
        });
      }

      return {
        success: true,
        data: {
          inputs: inputs,
          outputs: outputs
        }
      };
    } else if (type === 9) {
      //注销节点
      newoutputAmount = transferInfo.amount - transferInfo.fee;
      var times = new Date().valueOf() + 3600000 * 72; //锁定三天

      newLockTime = Number(times.toString().substr(0, times.toString().length - 3));

      var _iterator = _createForOfIteratorHelper(transferInfo.nonceList),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;
          var _newArr2 = {
            address: transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: item.deposit,
            locked: -1,
            nonce: item.nonce
          };
          inputs.push(_newArr2);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newoutputAmount,
        lockTime: newLockTime
      });
      return {
        success: true,
        data: {
          inputs: inputs,
          outputs: outputs
        }
      };
    } else if (type === 28) {
      //追加保证金
      newLockTime = -1;
    } else if (type === 29) {
      //退出保证金
      newoutputAmount = transferInfo.amount - transferInfo.fee; //锁定三天

      var _times = new Date().valueOf() + 3600000 * 72;

      newLockTime = Number(_times.toString().substr(0, _times.toString().length - 3));

      var _iterator2 = _createForOfIteratorHelper(transferInfo.nonceList),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _item = _step2.value;
          var _newArr3 = {
            address: transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: _item.deposit,
            locked: -1,
            nonce: _item.nonce
          };
          inputs.push(_newArr3);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newoutputAmount,
        lockTime: newLockTime
      });
      var allAmount = 0;

      var _iterator3 = _createForOfIteratorHelper(transferInfo.nonceList),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _item2 = _step3.value;
          allAmount = allAmount + Number(_item2.deposit);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: allAmount - transferInfo.amount,
        lockTime: -1
      });
      return {
        success: true,
        data: {
          inputs: inputs,
          outputs: outputs
        }
      };
    }

    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    });
    outputs.push({
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newoutputAmount,
      lockTime: newLockTime
    });
    /*console.log(inputs);
    console.log(outputs);*/

    return {
      success: true,
      data: {
        inputs: inputs,
        outputs: outputs
      }
    };
  },

  /**
   * 获取跨链交易inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param chainId
   * @returns {*}
   */
  ctxInputsOrOutputs: function ctxInputsOrOutputs(transferInfo, balanceInfo, chainId) {
    var _this = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var inputs, outputs, mainNetBalanceInfo, localBalanceInfo, newAmount, _newAmount;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              inputs = [];
              outputs = [{
                address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
                assetsChainId: transferInfo.assetsChainId,
                assetsId: transferInfo.assetsId,
                amount: transferInfo.amount,
                lockTime: 0
              }];
              _context.next = 4;
              return _this.getBalance(chainId, 2, 1, transferInfo.fromAddress);

            case 4:
              mainNetBalanceInfo = _context.sent;

              if (isMainNet(chainId)) {
                _context.next = 9;
                break;
              }

              if (!(mainNetBalanceInfo.balance < transferInfo.fee)) {
                _context.next = 9;
                break;
              }

              console.log("余额不足");
              return _context.abrupt("return");

            case 9:
              if (!(chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1)) {
                _context.next = 18;
                break;
              }

              newAmount = transferInfo.amount + transferInfo.fee;

              if (!(balanceInfo.balance < transferInfo.amount + transferInfo.fee)) {
                _context.next = 14;
                break;
              }

              console.log("余额不足");
              return _context.abrupt("return");

            case 14:
              //转出的本链资产 = 转出资产amount + 本链手续费
              inputs.push({
                address: transferInfo.fromAddress,
                assetsChainId: transferInfo.assetsChainId,
                assetsId: transferInfo.assetsId,
                amount: newAmount,
                locked: 0,
                nonce: balanceInfo.nonce
              }); //如果不是主网需收取主网NULS手续费

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

              _context.next = 35;
              break;

            case 18:
              _context.next = 20;
              return _this.getBalance(chainId, chainId, 1, transferInfo.fromAddress);

            case 20:
              localBalanceInfo = _context.sent;

              if (!(localBalanceInfo.balance < transferInfo.fee)) {
                _context.next = 24;
                break;
              }

              console.log("该账户本链主资产不足够支付手续费！");
              return _context.abrupt("return");

            case 24:
              if (!(transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1)) {
                _context.next = 32;
                break;
              }

              _newAmount = transferInfo.amount + transferInfo.fee;

              if (!(mainNetBalanceInfo.balance < _newAmount)) {
                _context.next = 29;
                break;
              }

              console.log("余额不足");
              return _context.abrupt("return");

            case 29:
              inputs.push({
                address: transferInfo.fromAddress,
                assetsChainId: transferInfo.assetsChainId,
                assetsId: transferInfo.assetsId,
                amount: _newAmount,
                locked: 0,
                nonce: mainNetBalanceInfo.nonce
              });
              _context.next = 34;
              break;

            case 32:
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

            case 34:
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

            case 35:
              return _context.abrupt("return", {
                success: true,
                data: {
                  inputs: inputs,
                  outputs: outputs
                }
              });

            case 36:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @param chainId
   * @param assetChainId
   * @param assetId
   * @returns {Promise<AxiosResponse<any>>}
   */
  getBalance: function getBalance(chainId) {
    var _arguments = arguments;
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var assetChainId, assetId, address;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              assetChainId = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : 5;
              assetId = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : 1;
              address = _arguments.length > 3 ? _arguments[3] : undefined;
              _context2.next = 5;
              return http.postComplete('/', 'getAccountBalance', [chainId, assetChainId, assetId, address]).then(function (response) {
                //console.log(response);
                return {
                  'balance': response.result.balance,
                  'nonce': response.result.nonce
                };
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 5:
              return _context2.abrupt("return", _context2.sent);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @returns {Promise<AxiosResponse<any>>}
   */
  getNulsBalance: function getNulsBalance(address) {
    var _arguments2 = arguments;
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var chainId, assetId;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              chainId = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : 5;
              assetId = _arguments2.length > 2 && _arguments2[2] !== undefined ? _arguments2[2] : 1;
              _context3.next = 4;
              return http.post('/', 'getAccountBalance', [chainId, assetId, address]).then(function (response) {
                return {
                  success: true,
                  data: {
                    'balance': response.result.balance,
                    'nonce': response.result.nonce
                  }
                };
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 4:
              return _context3.abrupt("return", _context3.sent);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }))();
  },

  /**
   * 获取合约代码构造函数
   * @param contractCodeHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  getContractConstructor: function getContractConstructor(contractCodeHex) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return http.post('/', 'getContractConstructor', [contractCodeHex]).then(function (response) {
                //console.log(response);
                if (response.hasOwnProperty("result")) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context4.abrupt("return", _context4.sent);

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }))();
  },

  /**
   * 获取合约指定函数的参数类型
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @returns {Promise<AxiosResponse<any>>}
   */
  getContractMethodArgsTypes: function getContractMethodArgsTypes(contractAddress, methodName, methodDesc) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return http.post('/', 'getContractMethodArgsTypes', [contractAddress, methodName, methodDesc]).then(function (response) {
                if (response.hasOwnProperty("result")) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context5.abrupt("return", _context5.sent);

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
  },

  /**
   * 验证创建合约交易
   * @param sender
   * @param gasLimit
   * @param price
   * @param contractCode
   * @param args
   * @returns {Promise<T>}
   */
  validateContractCreate: function validateContractCreate(sender, gasLimit, price, contractCode, args) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return http.post('/', 'validateContractCreate', [sender, gasLimit, price, contractCode, args]).then(function (response) {
                //console.log(response.result);
                return response.result;
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context6.abrupt("return", _context6.sent);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }))();
  },

  /**
   * 预估创建合约交易的gas
   * @param sender
   * @param contractCode
   * @param args
   * @returns {Promise<T>}
   */
  imputedContractCreateGas: function imputedContractCreateGas(sender, contractCode, args) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return http.post('/', 'imputedContractCreateGas', [sender, contractCode, args]).then(function (response) {
                //console.log(response);
                if (response.hasOwnProperty("result")) {
                  return response.result.gasLimit;
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context7.abrupt("return", _context7.sent);

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }))();
  },

  /**
   * 验证调用合约交易
   * @param sender
   * @param value
   * @param gasLimit
   * @param price
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<T>}
   */
  validateContractCall: function validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return http.post('/', 'validateContractCall', [sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args]).then(function (response) {
                if (response.hasOwnProperty("result")) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context8.abrupt("return", _context8.sent);

            case 3:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }))();
  },

  /**
   * 预估调用合约交易的gas
   * @param sender
   * @param value
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<T>}
   */
  imputedContractCallGas: function imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return http.post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args]).then(function (response) {
                if (response.hasOwnProperty("result")) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context9.abrupt("return", _context9.sent);

            case 3:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }))();
  },

  /**
   * 验证删除合约交易
   * @param sender
   * @param contractAddress
   * @returns {Promise<T>}
   */
  validateContractDelete: function validateContractDelete(sender, contractAddress) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return http.post('/', 'validateContractDelete', [sender, contractAddress]).then(function (response) {
                if (response.hasOwnProperty("result")) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context10.abrupt("return", _context10.sent);

            case 3:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10);
    }))();
  },

  /**
   * 验证交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  validateTx: function validateTx(txHex) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return http.post('/', 'validateTx', [txHex]).then(function (response) {
                //console.log(response);
                if (response.hasOwnProperty("result")) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    error: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  error: error
                };
              });

            case 2:
              return _context11.abrupt("return", _context11.sent);

            case 3:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11);
    }))();
  },

  /**
   * 获取所有地址前缀映射关系
   * @returns {Promise<AxiosResponse<any>>}
   */
  getAllAddressPrefix: function getAllAddressPrefix() {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return http.post('/', 'getAllAddressPrefix', []).then(function (response) {
                console.log(response);

                if (response.hasOwnProperty("result")) {
                  var data = {};

                  for (var i = 0; i < response.result.length; i++) {
                    data[response.result[i].chainId] = response.result[i].addressPrefix;
                  }

                  return {
                    success: true,
                    data: data
                  };
                } else {
                  return {
                    success: false,
                    data: response.error
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context12.abrupt("return", _context12.sent);

            case 3:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    }))();
  },

  /**
   * 广播交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  broadcastTx: function broadcastTx(txHex) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return http.post('/', 'broadcastTx', [txHex]).then(function (response) {
                if (response.hasOwnProperty("result")) {
                  return response.result;
                } else {
                  return response.error;
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context13.abrupt("return", _context13.sent);

            case 3:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13);
    }))();
  },

  /**
   * 跨链交易广播
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  sendCrossTx: function sendCrossTx(txHex) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return http.post('/', 'sendCrossTx', [8, txHex]).then(function (response) {
                console.log(response);
                return response.result;
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context14.abrupt("return", _context14.sent);

            case 3:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14);
    }))();
  },

  /**
   * 获取节点详细信息
   * @param agentHash
   * @returns {Promise<AxiosResponse<any>>}
   */
  getConsensusNode: function getConsensusNode(agentHash) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return http.post('/', 'getConsensusNode', [agentHash]).then(function (response) {
                if (response.hasOwnProperty('result')) {
                  return {
                    success: true,
                    data: response.result
                  };
                } else {
                  return {
                    success: false,
                    data: response
                  };
                }
              })["catch"](function (error) {
                return {
                  success: false,
                  data: error
                };
              });

            case 2:
              return _context15.abrupt("return", _context15.sent);

            case 3:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15);
    }))();
  }
};