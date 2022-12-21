const nuls = require('../index');

/**
 * @disc: 地址验证 dome
 * @date: 2019-10-18 10:41
 * @author: Wave
 */

let address = 'NULSd6Hgam8YajetEDnCoJBdEFkMNP41PfH7y';
console.log(nuls.verifyAddress(address));

let ttt = {};
let txInfo = {
    "a": 123,
    "b": 234,
    includeRemark: true
};
test();
function test() {
    if (txInfo.includeRemark) {
        console.log("incliude");
        console.log(txInfo.includeRemark === true);
        console.log(txInfo.includeRemark == true);
        // console.log(!txInfo.includeRemark === true);
        // console.log(!txInfo.includeRemark == true);
    }
    if (!ttt.includeRemark) {
        console.log(!(ttt.includeRemark === true));
        console.log(!ttt.includeRemark == true);
        console.log("ttt");
    }
    let asd = "asdasdasdasdasd567";
    console.log(asd.substring(0, asd.length - 1));
}