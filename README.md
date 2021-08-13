# Install
```bash
$ npm i nerve-sdk-js
```

# build
```angular2
webpack --mode production --config webpack.conf.js --progress
```

# Usage
```js
const nerve = require('./index');
// 指定网络环境 testnet/mainnet/customnet
nerve.testnet();

let chainId = nerve.chainId(); //链ID 9:NVT主网 5：TNVT测试网
let passWord = "";
let prefix = "TNVT"; //链前缀

//创建地址
const newAddress = nerve.newAddress(chainId, passWord, prefix);
console.log(newAddress);

//导入地址
const key ="";
const importAddress = nerve.importByKey(chainId, key, passWord,prefix);
console.log(importAddress);




```