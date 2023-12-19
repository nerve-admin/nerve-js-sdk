import { ethers } from 'ethers';

const { BigNumber } = require("ethers/utils");

/**
 * 转出enuls的数据凭证
 */
export function encoderTransferAsset(chainId, contractVersion, txKey, toAddress, amount) {
    let result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(txKey));
    result += toAddress.substring(2);
    result += ethers.utils.hexZeroPad(new BigNumber(amount).toHexString(), 32).substring(2);
    result += Buffer.from("transferAsset", "utf8").toString("hex");
    result += ethers.utils.hexZeroPad(new BigNumber(chainId * 2 + contractVersion).toHexString(), 32).substring(2);
    console.log(result, 'encode data');
    let hash = ethers.utils.keccak256(result).substring(2);
    console.log(hash, 'hash');
    return hash;
}

