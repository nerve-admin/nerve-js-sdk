function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nuls = require('../index');

var sdk = require('../api/sdk');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;
/**
 * @disc: 设置别名 dome
 * @params:
 * @date: 2019-10-18 10:38
 * @author: Wave
 */


var pri = '4100e2f88c3dba08e5000ed3e8da1ae4f1e0041b856c09d35a26fb399550f530';
var pub = '020e19418ed26700b0dba720dcc95483cb4adb1b5f8a103818dab17d5b05231854';
var fromAddress = "tNULSeBaMu38g1vnJsSZUCwTDU9GsE5TVNUtpD"; //黑洞地址

var toAddress = 'tNULSeBaMhZnRteniCy3UZqPjTbnWKBPHX1a5d';
var amount = 100000000;
var remark = 'set alias....'; //调用设置别名

setAlias(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);
/**
 * 设置别名
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

function setAlias(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
  return _setAlias.apply(this, arguments);
}

function _setAlias() {
  _setAlias = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
    var balanceInfo, transferInfo, inOrOutputs, aliasInfo, tAssemble, hash, txSignature, signData, txhex, result, results;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getNulsBalance(fromAddress);

          case 2:
            balanceInfo = _context.sent;
            transferInfo = {
              fromAddress: fromAddress,
              toAddress: toAddress,
              assetsChainId: assetsChainId,
              assetsId: assetsId,
              amount: amount,
              fee: 100000
            };
            _context.next = 6;
            return inputsOrOutputs(transferInfo, balanceInfo, 3);

          case 6:
            inOrOutputs = _context.sent;
            aliasInfo = {
              fromAddress: fromAddress,
              alias: 'wave'
            }; //交易组装

            _context.next = 10;
            return nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 3, aliasInfo);

          case 10:
            tAssemble = _context.sent;
            console.log(tAssemble); //获取hash

            _context.next = 14;
            return tAssemble.getHash();

          case 14:
            hash = _context.sent;
            console.log(hash); //交易签名

            _context.next = 18;
            return sdk.getSignData(hash.toString('hex'), pri);

          case 18:
            txSignature = _context.sent;
            console.log(txSignature); //通过拼接签名、公钥获取HEX

            _context.next = 22;
            return sdk.appSplicingPub(txSignature.signValue, pub);

          case 22:
            signData = _context.sent;
            tAssemble.signatures = signData;
            txhex = tAssemble.txSerialize().toString("hex");
            console.log(txhex.toString('hex'));
            /*let getHex = await  sdk.appSplicingPub(txSignature);
            console.log(getHex);
              let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
            console.log(txhex);*/

            _context.next = 28;
            return validateTx(txhex.toString('hex'));

          case 28:
            result = _context.sent;
            console.log(result);

            if (!result) {
              _context.next = 38;
              break;
            }

            console.log(result.data.value);
            _context.next = 34;
            return broadcastTx(txhex);

          case 34:
            results = _context.sent;

            if (results && result.data.value) {
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
  return _setAlias.apply(this, arguments);
}