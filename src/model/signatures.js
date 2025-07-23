let TxSignatures = function (bufferReader) {
  this.list = [];
  this.isPersonalSign = false;
  while (!bufferReader.isFinished() && bufferReader.remainLength() > 32) {
    this.list.push(new Item(bufferReader));
  }
  if (!bufferReader.isFinished()) {
    this.isPersonalSign = bufferReader.readBoolean();
  }
};
let Item = function (bufferReader) {
  let length = bufferReader.readUInt8();
  this.publicKey = bufferReader.slice(length);
  this.signData = bufferReader.readBytesByLength();
};

TxSignatures.prototype.getPrintInfo = function () {
  let result = '"list": [';
  for (let i = 0; i < this.list.length; i++) {
    if (i > 0) {
      result += ",";
    }
    result += this.list[i].getPrintInfo();
  }
  result += ']';
  result += ', "isPersonalSign": ' + this.isPersonalSign;
  return result;
};
Item.prototype.getPrintInfo = function () {
  let result = "{\n";
  result += "       pubkey : " + this.publicKey.toString('hex') + ',\n';
  result += "     signData : " + this.signData.toString('hex') + '\n';
  result += "    }";
  return result;
};

module.exports = TxSignatures;
