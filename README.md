# Install
```bash
$ npm i nerve-sdk-js
```

# Usage
```js
const nerve = require('./index');

let chainId = 4; //chainID 3:NVT main 4：TNVT test
let passWord = "";
let prefix = "TNVT"; //Chain prefix

//Create the address 创建地址
const newAddress = nerve.newAddress(chainId, passWord, prefix);
console.log(newAddress);

//The import address 导入地址
const key ="";
const importAddress = nerve.importByKey(chainId, key, passWord,prefix);
console.log(importAddress);

//Assembly trading 组装交易
const inputs =[];
const outputs =[];
const remark ="";
const type =2; //交易类型 （2:转账交易 3:设置别名 4:创建节点...）
const info ={};
const restAssemble = nerve.transactionAssemble(inputs, outputs, remark, type, info);
console.log(restAssemble);

//Transaction signature  交易签名
const pri ="";
const pub ="";
const tAssemble ="";
const resHex = nerve.transactionSerialize(pri, pub, tAssemble);
console.log(resHex);


```