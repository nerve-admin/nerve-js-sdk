const sdk = require("../../api/sdk")

let NerveToken = function (bufferReader) {
    if (!bufferReader) {
        return;
    }
    this.chainId = bufferReader.readUInt16LE();
    this.assetId = bufferReader.readUInt16LE();
};

NerveToken.prototype.printInfo = function () {
    console.log('    chainId   :: ' + this.chainId.toString());
    console.log('    assetId   :: ' + this.assetId.toString());
};

module.exports = NerveToken;
