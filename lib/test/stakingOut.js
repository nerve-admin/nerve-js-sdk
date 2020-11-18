function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;
/**
 * @disc: 加入staking dome
 * @date: 2019-10-18 10:34
 * @author: Wave
 */


var pri = '33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30';
var pub = '0243a092a010f668680238546f2b68b598bb8c606820f0d5051435adaff59e95b9';
var fromAddress = "TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY";
var amount = 200000000000;
var remark = 'out staking ....';
var timeMap = [0, 1]; //【活期，定期】

var timeType = [0, 1, 2, 3, 4, 5, 6]; //【三个月，半年，一年，两年，三年，五年，十年】

var deposit = {
  address: fromAddress,
  agentHash: '4b48c23a9c9717bf47660885fbdf83f673eddc661e0f14d83b26be7fd04ed37b',
  deposit: 200000000000,
  assetsChainId: 4,
  //退出staking链ID
  assetsId: 1,
  //退出staking资产ID
  depositType: timeMap[0],
  //委托类型 只能退出活期
  timeType: timeType[0] //委托时长

}; //调用加入共识

outStaking(pri, pub, fromAddress, 4, 1, amount, deposit);

function outStaking(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
  return _outStaking.apply(this, arguments);
}

function _outStaking() {
  _outStaking = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pri, pub, fromAddress, assetsChainId, assetsId, amount, deposit) {
    var defaultAssetsInfo, transferInfo, balanceInfo, feeBalanceInfo, inOrOutputs, tAssemble, txhex, result, results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            defaultAssetsInfo = {
              chainId: 4,
              assetsId: 1
            };
            transferInfo = {
              fromAddress: fromAddress,
              assetsChainId: assetsChainId,
              assetsId: assetsId,
              amount: amount,
              fee: 100000
            };
            balanceInfo = {};
            feeBalanceInfo = {};

            if (!(defaultAssetsInfo.chainId === assetsChainId && defaultAssetsInfo.assetsId === assetsId)) {
              _context.next = 8;
              break;
            }

            //资产信息相同合并 amount+fee
            balanceInfo = {
              success: true,
              data: {
                balance: amount,
                nonce: deposit.agentHash.substring(deposit.agentHash.length - 16)
              }
            };
            _context.next = 16;
            break;

          case 8:
            _context.next = 10;
            return getNulsBalance(fromAddress, defaultAssetsInfo.chainId, defaultAssetsInfo.assetsId);

          case 10:
            feeBalanceInfo = _context.sent;

            if (feeBalanceInfo.success) {
              _context.next = 14;
              break;
            }

            console.log("获取账户feeBalanceInfo错误");
            return _context.abrupt("return");

          case 14:
            transferInfo.feeBalanceInfo = feeBalanceInfo.data;
            transferInfo.defaultAssetsInfo = defaultAssetsInfo;

          case 16:
            _context.next = 18;
            return inputsOrOutputs(transferInfo, balanceInfo.data, 6);

          case 18:
            inOrOutputs = _context.sent;
            _context.next = 21;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 6, deposit);

          case 21:
            tAssemble = _context.sent;
            _context.next = 24;
            return nuls.transactionSerialize(pri, pub, tAssemble);

          case 24:
            txhex = _context.sent;
            console.log(txhex);
            _context.next = 28;
            return validateTx(txhex);

          case 28:
            result = _context.sent;
            console.log(result);

            if (!result) {
              _context.next = 38;
              break;
            }

            _context.next = 33;
            return broadcastTx(txhex);

          case 33:
            results = _context.sent;
            console.log(results);

            if (results && results.hash) {
              console.log("交易完成");
            } else {
              console.log("广播交易失败");
            }

            _context.next = 39;
            break;

          case 38:
            console.log("验证交易失败");

          case 39:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _outStaking.apply(this, arguments);
}