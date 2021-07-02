const sdk = require('../../api/sdk');

var emptyHash = "0000000000000000000000000000000000000000000000000000000000000000";

var addr = sdk.getStringSpecAddress(5,5,emptyHash,"TNVT");
console.log(addr)

