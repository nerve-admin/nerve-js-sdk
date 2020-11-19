function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;
/**
 * @disc: 创建节点 dome
 * @date: 2019-10-18 10:37
 * @author: Wave
 */


var pri = '10d8804991ceaafa5d19dfa30d79c5091767a48da8e66b73494f0b6af8554618';
var pub = '024bafc4a364659db1674d888bd3e0e7ab11cc4ca02dca95d548637c6b66d63f42';
var fromAddress = "TNVTdN9iJcMNiTttfV4Wdi6wUp3k8NteoebYo";
var amount = 2000100000000;
var remark = 'new agent...';
var agent = {
  agentAddress: fromAddress,
  packingAddress: "TNVTdN9i3GqhhTXjzqBEqmcp28yYx3BPGkQDB",
  rewardAddress: fromAddress,
  deposit: 2000100000000
}; //调用创建节点

newAgent(pri, pub, fromAddress, 4, 1, amount, agent);
/**
 * 创建节点
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param agent
 * @returns {Promise<*>}
 */

function newAgent(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
  return _newAgent.apply(this, arguments);
}

function _newAgent() {
  _newAgent = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pri, pub, fromAddress, assetsChainId, assetsId, amount, agent) {
    var balanceInfo, transferInfo, newAmount, inOrOutputs, tAssemble, txhex, result, results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getNulsBalance(fromAddress);

          case 2:
            balanceInfo = _context.sent;

            if (balanceInfo.success) {
              _context.next = 6;
              break;
            }

            console.log("获取账户balanceInfo错误");
            return _context.abrupt("return");

          case 6:
            transferInfo = {
              fromAddress: fromAddress,
              assetsChainId: assetsChainId,
              assetsId: assetsId,
              amount: amount,
              fee: 100000
            };
            newAmount = transferInfo.amount + transferInfo.fee;

            if (!(balanceInfo.data.balance < newAmount)) {
              _context.next = 11;
              break;
            }

            console.log("余额不住，请更换账户");
            return _context.abrupt("return");

          case 11:
            _context.next = 13;
            return inputsOrOutputs(transferInfo, balanceInfo.data, 4);

          case 13:
            inOrOutputs = _context.sent;

            if (inOrOutputs.success) {
              _context.next = 17;
              break;
            }

            console.log("inputOutputs组装失败!");
            return _context.abrupt("return");

          case 17:
            _context.next = 19;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 4, agent);

          case 19:
            tAssemble = _context.sent;
            _context.next = 22;
            return nuls.transactionSerialize(pri, pub, tAssemble);

          case 22:
            txhex = _context.sent;
            _context.next = 25;
            return validateTx(txhex);

          case 25:
            result = _context.sent;

            if (!result) {
              _context.next = 34;
              break;
            }

            console.log(result.data.value);
            _context.next = 30;
            return broadcastTx(txhex);

          case 30:
            results = _context.sent;

            if (results && result.data.value) {
              console.log("交易完成");
            } else {
              console.log("广播交易失败");
            }

            _context.next = 35;
            break;

          case 34:
            console.log("验证交易失败");

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _newAgent.apply(this, arguments);
}