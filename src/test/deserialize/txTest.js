const txs = require("../../model/txs")
const BufferReader = require("../../utils/bufferreader")

const txHex = "44007f48836200200d112a1f71d161758c01711a0800b34585fa84c4dc66ec73dee5ede05d8ad2ecfd5a010217090004c8d764dad7dcdba7488f299d48595f3f39c0421b01000100e83c2248020000000000000000000000000000000000000000000000000000000804b99d64646ffe580017090004c8d764dad7dcdba7488f299d48595f3f39c0421b090001004cb8be07000000000000000000000000000000000000000000000000000000000804b99d64646ffe580003170900016baa485461f883cd40ec2d7ebd49f82ae77c035801000100e83c2248020000000000000000000000000000000000000000000000000000000000000000000000170900017880136d099c70f6ba809456de5351eb17d4b08509000100265cdf0300000000000000000000000000000000000000000000000000000000000000000000000017090001ab76668ed092e76ef364cff0363db181c887d50509000100265cdf0300000000000000000000000000000000000000000000000000000000000000000000000000";
let reader = new BufferReader(Buffer.from(txHex, "hex"), 0);
let tx = new txs.Transaction();
tx.parse(reader);
console.log(tx.calcHash().toString('hex'));