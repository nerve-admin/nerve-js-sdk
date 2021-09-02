const nerve = require('../../index');
const Serializers = require("../../api/serializers");
const cryptos = require("crypto");

let prikey2 = "3e73f764492e95362cf325bd7168d145110a75e447510c927612586c06b23e91";
let prikey1 = "6d10f3aa23018de6bc7d1ee52badd696f0db56082c62826ba822978fdf3a59fa";
let prikey3 = "f7bb391ab82ba9ec7a552955b2fe50d79eea085d7571e5e2480d1777bc171f5e";


let m = 2;
let pubkeyArray = [nerve.getPubByPri(prikey1), nerve.getPubByPri(prikey2), nerve.getPubByPri(prikey3)];

//创建多签地址
function createMultiAddress(chainId, addressPrefix, m, pubkeyArray) {
    if (!m || m < 2 || m > 15) {
        console.log("m invalid")
        return
    }
    if (!pubkeyArray || pubkeyArray.length < m || pubkeyArray.length > 15) {
        console.log("pubkey array invalid")
        return;
    }
    // 公钥排序
    pubkeyArray = pubkeyArray.sort(function(s, t) {
        if (s < t) return -1;
        if (s > t) return 1;
        return 0;
    });

    let pubSeria = new Serializers();
    pubSeria.getBufWriter().writeUInt8(chainId);
    pubSeria.getBufWriter().writeUInt8(m);
    for (var i = 0; i < pubkeyArray.length; i++) {
        var pubkeyHex = pubkeyArray[i];
        var pub = Buffer.from(pubkeyHex, 'hex');
        pubSeria.getBufWriter().write(pub);
    }
    let multiPub = pubSeria.getBufWriter().toBuffer();

    let address = nerve.getAddressByPub(chainId, 3, multiPub, addressPrefix);
    return address;
}


console.log(createMultiAddress(5,"TNVT",m,pubkeyArray));
console.log(createMultiAddress(9,"NERVE",m,pubkeyArray));