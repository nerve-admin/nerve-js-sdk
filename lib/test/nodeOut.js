"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    getConsensusNode = _require.getConsensusNode,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

var axios = require('axios');
/**
 * @disc: 退出保证金 dome
 * @date: 2019-10-18 10:39
 * @author: Wave
 */


var pri = '10d8804991ceaafa5d19dfa30d79c5091767a48da8e66b73494f0b6af8554618';
var pub = '024bafc4a364659db1674d888bd3e0e7ab11cc4ca02dca95d548637c6b66d63f42';
var fromAddress = "TNVTdN9iJcMNiTttfV4Wdi6wUp3k8NteoebYo";
var amount = 300000000000;
var remark = 'out node....'; //退出保证金

nodeOut(pri, pub, fromAddress, 4, 1, amount, '8e4310bbdb846abbb2ebe01f85f649927d43bd0183739bde2512ae6fb27b5ef5');
/**
 * 退出保证金
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param depositHash
 * @returns {Promise<void>}
 */

function nodeOut(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
  return _nodeOut.apply(this, arguments);
}
/**
 * @disc: 获取退出节点/退出保证金对应的追加保证金交易列表
 * @params: agentHash 节点hash
 * @params: reduceAmount 退出金额
 * @params: quitAll  是否全部退出 0：部分 1：全部
 * @date: 2020-05-15 16:03
 * @author: Wave
 */


function _nodeOut() {
  _nodeOut = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pri, pub, fromAddress, assetsChainId, assetsId, amount, depositHash) {
    var depositList, freeMargin, reduceNonceList, balanceInfo, transferInfo, inOrOutputs, entity, tAssemble, txhex, result, results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getConsensusNode(depositHash);

          case 2:
            depositList = _context.sent;

            if (depositList.success) {
              _context.next = 6;
              break;
            }

            console.log("获取节点信息错误");
            return _context.abrupt("return");

          case 6:
            freeMargin = depositList.data.deposit - 2000000000000;

            if (!(freeMargin < amount)) {
              _context.next = 10;
              break;
            }

            console.log("您最多可以退" + freeMargin / 100000000 + "保证金");
            return _context.abrupt("return");

          case 10:
            _context.next = 12;
            return getReduceNonceList(depositHash, amount, 0);

          case 12:
            reduceNonceList = _context.sent;

            if (reduceNonceList.success) {
              _context.next = 16;
              break;
            }

            console.log("获取退出保证金ReduceNonceList错误");
            return _context.abrupt("return");

          case 16:
            _context.next = 18;
            return getNulsBalance(fromAddress);

          case 18:
            balanceInfo = _context.sent;

            if (balanceInfo.success) {
              _context.next = 22;
              break;
            }

            console.log("获取账户balanceInfo错误");
            return _context.abrupt("return");

          case 22:
            transferInfo = {
              fromAddress: fromAddress,
              assetsChainId: assetsChainId,
              assetsId: assetsId,
              amount: amount,
              fee: 100000,
              depositHash: depositHash,
              nonceList: reduceNonceList.data
            };
            _context.next = 25;
            return inputsOrOutputs(transferInfo, balanceInfo.data, 29);

          case 25:
            inOrOutputs = _context.sent;
            console.log(inOrOutputs);

            if (inOrOutputs.success) {
              _context.next = 30;
              break;
            }

            console.log("inputOutputs组装失败!");
            return _context.abrupt("return");

          case 30:
            entity = {
              agentHash: depositHash,
              address: transferInfo.fromAddress,
              amount: transferInfo.amount
            };
            _context.next = 33;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 29, entity);

          case 33:
            tAssemble = _context.sent;
            _context.next = 36;
            return nuls.transactionSerialize(pri, pub, tAssemble);

          case 36:
            txhex = _context.sent;
            console.log(txhex);
            _context.next = 40;
            return validateTx(txhex);

          case 40:
            result = _context.sent;
            console.log(result);

            if (!result.success) {
              _context.next = 49;
              break;
            }

            _context.next = 45;
            return broadcastTx(txhex);

          case 45:
            results = _context.sent;

            //console.log(results);
            if (results && results.hash) {
              console.log("交易完成");
            } else {
              console.log("广播交易失败");
            }

            _context.next = 50;
            break;

          case 49:
            console.log("验证交易失败");

          case 50:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _nodeOut.apply(this, arguments);
}

function getReduceNonceList(_x8, _x9, _x10) {
  return _getReduceNonceList.apply(this, arguments);
}

function _getReduceNonceList() {
  _getReduceNonceList = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(agentHash, reduceAmount, quitAll) {
    var url, data, params, res;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            url = 'http://seede.nuls.io:17004/jsonrpc';
            data = [4, agentHash, reduceAmount, quitAll];
            params = {
              "jsonrpc": "2.0",
              "method": 'getReduceNonceList',
              "params": data,
              "id": Math.floor(Math.random() * 1000)
            };
            _context2.prev = 3;
            _context2.next = 6;
            return axios.post(url, params);

          case 6:
            res = _context2.sent;

            if (!res.data.hasOwnProperty('result')) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return", {
              success: true,
              data: res.data.result
            });

          case 11:
            return _context2.abrupt("return", {
              success: false,
              data: res.data
            });

          case 12:
            _context2.next = 17;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](3);
            return _context2.abrupt("return", {
              success: false,
              data: _context2.t0
            });

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 14]]);
  }));
  return _getReduceNonceList.apply(this, arguments);
}