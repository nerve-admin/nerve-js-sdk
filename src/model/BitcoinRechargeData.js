const Serializers = require("../api/serializers");
const sdk = require("../api/sdk");

let BitcoinRechargeData = function () {
  this.to = null;
  this.value = 0;
  this.feeTo = null;
  this.extend0 = null;
  this.extend1 = null;
  this.extend2 = null;
  this.extend3 = null;
  this.extend4 = null;
  this.extend5 = null;
  this.serialize = function () {
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(this.to));
    bw.getBufWriter().writeVarintNum(this.value);
    if (this.feeTo != null) {
      bw.getBufWriter().write(Buffer.from([0x01]));
      bw.getBufWriter().write(sdk.getBytesAddress(this.feeTo));
    } else {
      bw.getBufWriter().write(Buffer.from([0x00]));
    }
    bw.writeString(this.extend0);
    bw.writeString(this.extend1);
    bw.writeString(this.extend2);
    bw.writeString(this.extend3);
    bw.writeString(this.extend4);
    bw.writeString(this.extend5);
    return bw.getBufWriter().toBuffer();
  };
  this.test = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeVarintNum(2000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(12000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(102000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(1002000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(10002000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(120002000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(1020002000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))

    bw = new Serializers();
    bw.getBufWriter().writeVarintNum(10020002000);
    console.log(bw.getBufWriter().toBuffer().toString('hex'))
  }

  this.parse = function (bufferReader) {
    this.to = sdk.getStringAddressByBytes(bufferReader.slice(23));
    this.value = bufferReader.readVarInt();
    let b = bufferReader.slice(1);
    if (Buffer.from([0x01]).compare(b) === 0) {
      this.feeTo = sdk.getStringAddressByBytes(bufferReader.slice(23));
    }
    this.extend0 = bufferReader.readBytesByLength().toString();
    this.extend1 = bufferReader.readBytesByLength().toString();
    this.extend2 = bufferReader.readBytesByLength().toString();
    this.extend3 = bufferReader.readBytesByLength().toString();
    this.extend4 = bufferReader.readBytesByLength().toString();
    this.extend5 = bufferReader.readBytesByLength().toString();
  };
};

module.exports = {
  BitcoinRechargeData
};
