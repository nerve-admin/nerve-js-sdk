var tbcLib = {};
tbcLib.FT = require("./contract/ft.js");
tbcLib.API = require("./api/api.js");
tbcLib.MultiSig = require("./contract/multiSig.js");
tbcLib.tbc = require('tbc-lib-js');
tbcLib.txFromString = function (rawtx) {
  const tx = new tbcLib.tbc.Transaction();
  tx.fromString(rawtx);
  return tx;
};
tbcLib.getToken = function (contractId, tokenInfo) {
  const token = new tbcLib.FT(contractId);
  token.initialize(tokenInfo);
  return token;
};

module.exports = tbcLib;