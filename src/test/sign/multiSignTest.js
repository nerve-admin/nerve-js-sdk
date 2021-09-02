const nerve = require('../../index');
const txs = require("../../model/txs");
const multi = require("../../model/mutilsigntxsignatures");
const sdk = require('../../api/sdk');
const util = require("../api/util")
const BufferReader = require("../../utils/bufferreader")

nerve.customnet(5, "http://beta.public.nerve.network/")

let prikey2 = "3e73f764492e95362cf325bd7168d145110a75e447510c927612586c06b23e91";
let prikey1 = "6d10f3aa23018de6bc7d1ee52badd696f0db56082c62826ba822978fdf3a59fa";


let txHex = "02007e6330610a6d756c74692d74657374008c0117050003bc83930d55e1bb7978a29ae1ce81d1cf234b494c05000100d20400000000000000000000000000000000000000000000000000000000000008e6e4fc5449d20891000117050001ab7da01103b1359355cab6afc0d0550c0731c48205000100d20400000000000000000000000000000000000000000000000000000000000000000000000000006802032102362c64e15ab653132ec753e4a8c181ef720ec927466a09417a07877824781f57210224d86a584324fc8e92c6dba19c08926a7af77df884deec0d1c3b879a8f50720f2102962c7942851fa2c937be788a18693885276e3d9688b5997d9f02ebf2fef218db"

function signMultiSigTransaction(txHex, prikeyHex) {
    let reader = new BufferReader(Buffer.from(txHex, "hex"), 0);
    //反序列化交易
    let tx = new txs.Transaction();
    tx.parse(reader);
    //签名
    let sign = new multi.MultiTransactionSignatures(0, null);
    let signReader = new BufferReader(tx.signatures, 0);
    sign.parse(signReader);
    let pubHex = nerve.getPubByPri(prikeyHex);
    let pub = Buffer.from(pubHex, "hex");

    let sigHex = sdk.signature(tx.getHash().toString('hex'), prikeyHex);
    let signValue = Buffer.from(sigHex, 'hex');
    sign.addSign(pub, signValue);
    //组装到交易中
    tx.signatures = sign.serialize();
    //序列化交易，并返回
    console.log("txHash: " + tx.getHash().toString("hex"))
    return tx.txSerialize().toString("hex");
}

txHex = signMultiSigTransaction(txHex, prikey1)
txHex = signMultiSigTransaction(txHex, prikey2)
console.log("txHex-result:")
console.log(txHex)

let result = util.broadcastTx(txHex);
console.log(result);