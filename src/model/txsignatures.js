const Serializers = require("../api/serializers");

let P2PHKSignature = function () {
  this.pubkey = null;
  this.signData = null;
};

let TransactionSignatures = function (_isPersonalSign) {
  this.signatures = null;
  this.isPersonalSign = false;
  if (_isPersonalSign) {
      this.isPersonalSign = _isPersonalSign;
  }
  this.serialize = function () {
    let bw = new Serializers();
    if (this.signatures && this.signatures.length > 0) {
      for (let i = 0; i < this.signatures.length; i++) {
        let signature = this.signatures[i];
        bw.getBufWriter().writeUInt8(signature.pubkey.length);
        bw.getBufWriter().write(signature.pubkey);
        bw.writeBytesWithLength(signature.signData);
      }
      if (this.isPersonalSign) {
        bw.writeBoolean(this.isPersonalSign);
      }
    }
    return bw.getBufWriter().toBuffer();
  };

  this.parse = function (bufferReader) {
    this.signatures = [];
    this.isPersonalSign = false;
    while (!bufferReader.isFinished() && bufferReader.remainLength() > 32) {
      let length = bufferReader.readUInt8();
      let sign = new P2PHKSignature();
      sign.pubkey = bufferReader.slice(length);
      sign.signData = bufferReader.readBytesByLength();
      this.signatures.push(sign);
    }
    if (!bufferReader.isFinished()) {
      this.isPersonalSign = bufferReader.readBoolean();
    }
  };

  this.addSign = function (pubkey, signValue) {
    if (!this.signatures || this.signatures == null) {
      this.signatures = [];
    }
    let sign = new P2PHKSignature();
    sign.pubkey = pubkey;
    sign.signData = signValue;
    this.signatures.push(sign);
  }
};

module.exports = {
  TransactionSignatures, P2PHKSignature,
};
