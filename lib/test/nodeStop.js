function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx,
    getConsensusNode = _require.getConsensusNode;

var axios = require('axios');
/**
 * @disc: 注销节点 dome
 * @date: 2019-10-18 10:38
 * @author: Wave
 */


var pri = '33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30';
var pub = '0243a092a010f668680238546f2b68b598bb8c606820f0d5051435adaff59e95b9';
var fromAddress = "TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY";
var remark = 'stop agent....'; //调用注销节点

stopAgent(pri, pub, fromAddress, 4, 1, '6e1f8aaa80f64244a024db0a1979495fb77455fa60650da48b01761e7defa908');
/**
 * 注销节点
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param agentHash
 * @returns {Promise<void>}
 */

function stopAgent(_x, _x2, _x3, _x4, _x5, _x6) {
  return _stopAgent.apply(this, arguments);
}
/**
 * @disc: 获取退出节点/退出保证金对应的追加保证金交易列表
 * @params: agentHash 节点hash
 * @params: reduceAmount 退出金额
 * @params: quitAll  是否全部退出 0：部分 1：全部
 * @date: 2020-05-15 16:03
 * @author: Wave
 */


function _stopAgent() {
  _stopAgent = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pri, pub, fromAddress, assetsChainId, assetsId, agentHash) {
    var reduceNonceList, balanceInfo, allAmount, _iterator, _step, item, transferInfo, inOrOutputs, tAssemble, txhex, result, results;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getReduceNonceList(agentHash, '0', 1);

          case 2:
            reduceNonceList = _context.sent;

            if (reduceNonceList.success) {
              _context.next = 6;
              break;
            }

            console.log("获取退出保证金ReduceNonceList错误");
            return _context.abrupt("return");

          case 6:
            _context.next = 8;
            return getNulsBalance(fromAddress);

          case 8:
            balanceInfo = _context.sent;

            if (balanceInfo.success) {
              _context.next = 12;
              break;
            }

            console.log("获取账户balanceInfo错误");
            return _context.abrupt("return");

          case 12:
            allAmount = 0;
            _iterator = _createForOfIteratorHelper(reduceNonceList.data);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                item = _step.value;
                allAmount = allAmount + Number(item.deposit);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            transferInfo = {
              fromAddress: fromAddress,
              assetsChainId: assetsChainId,
              assetsId: assetsId,
              nonceList: reduceNonceList.data,
              amount: allAmount,
              fee: 100000,
              depositHash: agentHash
            }; //console.log(transferInfo);

            _context.next = 18;
            return inputsOrOutputs(transferInfo, balanceInfo.data, 9);

          case 18:
            inOrOutputs = _context.sent;

            if (inOrOutputs.success) {
              _context.next = 22;
              break;
            }

            console.log("inputOutputs组装失败!");
            return _context.abrupt("return");

          case 22:
            _context.next = 24;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 9, {
              address: fromAddress,
              agentHash: agentHash
            });

          case 24:
            tAssemble = _context.sent;
            _context.next = 27;
            return nuls.transactionSerialize(pri, pub, tAssemble);

          case 27:
            txhex = _context.sent;
            console.log(txhex);
            _context.next = 31;
            return validateTx(txhex);

          case 31:
            result = _context.sent;

            if (!result.success) {
              _context.next = 40;
              break;
            }

            console.log(result.data.value);
            _context.next = 36;
            return broadcastTx(txhex);

          case 36:
            results = _context.sent;

            //console.log(results);
            if (results && results.value) {
              console.log("交易完成");
            } else {
              console.log("广播交易失败");
            }

            _context.next = 41;
            break;

          case 40:
            console.log("验证交易失败");

          case 41:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _stopAgent.apply(this, arguments);
}

function getReduceNonceList(_x7, _x8, _x9) {
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