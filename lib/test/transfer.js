"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;
/**
 * @disc: 转账 dome
 * @date: 2020-05-20 13:47
 * @author: Wave
 */

/*let pri = '477059f40708313626cccd26f276646e4466032cabceccbf571a7c46f954eb75';
let pub = '0318f683066b45e7a5225779061512e270044cc40a45c924afcf78bb7587758ca0';
let fromAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
let toAddress = 'TNVTdTSPUZYyUW8ThLzJXWdgWaDFSy5trakjk';*/


var pri = 'dramaendorsepotterystingattitudejaguarslightsnakelemonamazin';
var pub = '03ac01bbb717f9f28db9b7d3ae62555060bf2024825d92259887ab12dbdd6c689e';
var fromAddress = "TNVTdTSPUZYyUW8ThLzJXWdgWaDFSy5trakjk";
var toAddress = 'TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz';
var amount = 100000000;
var remark = 'transfer transaction remark...'; //调用

transferTransaction(pri, pub, fromAddress, toAddress, 5, 1, amount, remark);
/**
 * 转账交易
 * @param pri
 * @param pub
 * @param fromAddress
 * @param toAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param remark
 * @returns {Promise<void>}
 */

function transferTransaction(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
  return _transferTransaction.apply(this, arguments);
}

function _transferTransaction() {
  _transferTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
    var balanceInfo, transferInfo, newAmount, inOrOutputs, tAssemble, txhex, newFee, result, results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getNulsBalance(fromAddress);

          case 2:
            balanceInfo = _context.sent;
            console.log(balanceInfo);

            if (balanceInfo.success) {
              _context.next = 7;
              break;
            }

            console.log("获取账户balanceInfo错误");
            return _context.abrupt("return");

          case 7:
            transferInfo = {
              fromAddress: fromAddress,
              toAddress: toAddress,
              assetsChainId: assetsChainId,
              assetsId: assetsId,
              amount: amount,
              fee: 100000
            };
            newAmount = transferInfo.amount + transferInfo.fee;

            if (!(balanceInfo.data.balance < newAmount)) {
              _context.next = 12;
              break;
            }

            console.log("余额不住，请更换账户");
            return _context.abrupt("return");

          case 12:
            _context.next = 14;
            return inputsOrOutputs(transferInfo, balanceInfo.data, 2);

          case 14:
            inOrOutputs = _context.sent;

            if (inOrOutputs.success) {
              _context.next = 18;
              break;
            }

            console.log("inputOutputs组装失败!");
            return _context.abrupt("return");

          case 18:
            _context.next = 20;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);

          case 20:
            tAssemble = _context.sent;
            //交易组装
            txhex = ""; //交易签名

            newFee = countFee(tAssemble, 1); //获取手续费
            //手续费大于0.001的时候重新组装交易及签名

            if (!(transferInfo.fee !== newFee)) {
              _context.next = 36;
              break;
            }

            transferInfo.fee = newFee;
            _context.next = 27;
            return inputsOrOutputs(transferInfo, balanceInfo, 2);

          case 27:
            inOrOutputs = _context.sent;
            _context.next = 30;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);

          case 30:
            tAssemble = _context.sent;
            _context.next = 33;
            return nuls.transactionSerialize(pri, pub, tAssemble);

          case 33:
            txhex = _context.sent;
            _context.next = 39;
            break;

          case 36:
            _context.next = 38;
            return nuls.transactionSerialize(pri, pub, tAssemble);

          case 38:
            txhex = _context.sent;

          case 39:
            console.log(txhex);
            _context.next = 42;
            return validateTx(txhex);

          case 42:
            result = _context.sent;

            if (!result.success) {
              _context.next = 51;
              break;
            }

            console.log(result.data.value);
            _context.next = 47;
            return broadcastTx(txhex);

          case 47:
            results = _context.sent;

            if (results && results.value) {
              console.log("交易完成");
            } else {
              console.log("广播交易失败");
            }

            _context.next = 52;
            break;

          case 51:
            console.log("验证交易失败:" + JSON.stringify(result.error));

          case 52:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _transferTransaction.apply(this, arguments);
}