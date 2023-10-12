const nuls = require('../index');
const secp256k1 = require("secp256k1")
/**
 * @disc: 根据公钥获取地址
 * @date: 2019-10-18 10:27
 * @author: Wave
 */

let addressInfo = {
  pri: '78e098edce7e73402e39f3b52c58cb57fe7b8305a2bd7d38c7fa178513f54fdd',
  pub: '0272325dc69c640904fd167dffb631c5b6008cc35e8215340da4412026b1b81b3a',
  address: 'TNVTdN9i6N4LERn4iAHhnaFyJNfG8L4hCBBTN',
};
// let address = nuls.getAddressByPub(4, 1, addressInfo.pub, 'TNVT');
// console.log(address);
// console.log(address === addressInfo.address);
// let pubHex = "02a04e6ea40b1ce8b97bda92abae5679737d5156d5aebeca6897b81ab60823665d";
// const secp256k1 = require("secp256k1")
let pubHex = "04a04e6ea40b1ce8b97bda92abae5679737d5156d5aebeca6897b81ab60823665d690dbe182080dbccb8db64ea45434c9d3e1e0be01c701736dd2a9da6d5dfdc48";
let compressedPubHex = secp256k1.publicKeyConvert(Buffer.from(pubHex, "hex"), true).toString("hex");
console.log(compressedPubHex)


