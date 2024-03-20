const nerve = require("../index");
require('dotenv').config();

function acc(pri) {
    let pub = nerve.getPubByPri(pri);
    let fromAddress = nerve.getAddressByPri(nerve.chainId(), pri);
    console.log(fromAddress);
    return {pri, pub, fromAddress};
}

var testAcc = {
    acc0() {
        return acc(process.env.acc0);
    },

    acc1() {
        return acc(process.env.acc1);
    },

    acc2() {
        return acc(process.env.acc2);
    },

    acc3() {
        return acc(process.env.acc3);
    },
    acc4() {
        return acc(process.env.acc4);
    },
}

module.exports = testAcc;
