const sdk = require('../api/sdk');
const util = require('../test/api/util');
const cryptos = require("crypto");
const nerve = require('../index');

async function inputsOrOutputsOfSwapAddLiquidity(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress) {
    let balanceA = await util.getNulsBalance(fromAddress, tokenAmountA.chainId, tokenAmountA.assetId);
    let balanceB = await util.getNulsBalance(fromAddress, tokenAmountA.chainId, tokenAmountA.assetId);
    let inputs = [
        {
            address: fromAddress,
            amount: tokenAmountA.amount,
            assetsChainId: tokenAmountA.chainId,
            assetsId: tokenAmountA.assetId,
            nonce: balanceA.data.nonce,
            locked: 0,
        },
        {
            address: fromAddress,
            amount: tokenAmountB.amount,
            assetsChainId: tokenAmountB.chainId,
            assetsId: tokenAmountB.assetId,
            nonce: balanceB.data.nonce,
            locked: 0,
        }
    ];
    let outputs = [
        {
            address: pairAddress,
            amount: tokenAmountA.amount,
            assetsChainId: tokenAmountA.chainId,
            assetsId: tokenAmountA.assetId,
            locked: 0
        },
        {
            address: pairAddress,
            amount: tokenAmountB.amount,
            assetsChainId: tokenAmountB.chainId,
            assetsId: tokenAmountB.assetId,
            locked: 0
        }
    ];
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}

async function inputsOrOutputsOfStableAddLiquidityOrTrade(fromAddress, to, tokenAmounts) {
    let inputs = [];
    let outputs = [];
    let length = tokenAmounts.length;
    for (let i = 0; i < length; i++) {
        let tokenAmount = tokenAmounts[i];
        let balance = await util.getNulsBalance(fromAddress, tokenAmount.chainId, tokenAmount.assetId);
        inputs.push({
            address: fromAddress,
            amount: tokenAmount.amount,
            assetsChainId: tokenAmount.chainId,
            assetsId: tokenAmount.assetId,
            nonce: balance.data.nonce,
            locked: 0,
        });
        outputs.push({
            address: to,
            amount: tokenAmount.amount,
            assetsChainId: tokenAmount.chainId,
            assetsId: tokenAmount.assetId,
            locked: 0
        });
    }
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}

function int32ToBytes(x) {
    return Buffer.concat([
        Buffer.from([0xFF & x]),
        Buffer.from([0xFF & x >> 8]),
        Buffer.from([0xFF & x >> 16]),
        Buffer.from([0xFF & x >> 24])
    ]);
}

module.exports = {
    currentTime() {
        var times = new Date().valueOf();
        return Number(times.toString().substr(0, times.toString().length - 3)); //交易时间
    },
    token(chainId, assetId) {
        return {chainId: chainId, assetId: assetId};
    },
    tokenAmount(chainId, assetId, amount) {
        return {chainId: chainId, assetId: assetId, amount: amount};
    },
    tokenSort(token0, token1) {
        let positiveSequence = token0.chainId < token1.chainId || (token0.chainId == token1.chainId && token0.assetId < token1.assetId);
        if (positiveSequence) {
            return [token0, token1];
        }
        return [token1, token0];
    },
    getStringPairAddress(chainId, token0, token1) {
        let array = this.tokenSort(token0, token1);
        let all = Buffer.concat([
            cryptos.createHash('sha256').update(int32ToBytes(array[0].chainId)).digest(),
            cryptos.createHash('sha256').update(int32ToBytes(array[0].assetId)).digest(),
            cryptos.createHash('sha256').update(int32ToBytes(array[1].chainId)).digest(),
            cryptos.createHash('sha256').update(int32ToBytes(array[1].assetId)).digest()
        ]);
        let prefix = null;
        if (5 === chainId) {
            prefix = 'TNVT';
        } else if (9 === chainId) {
            prefix = "NERVE";
        }
        return sdk.getStringAddressBase(chainId, 4, null, cryptos.createHash('sha256').update(all).digest(), prefix);
    },
    async swapCreatePair(pri, fromAddress, tokenA, tokenB, remark) {
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: fromAddress,
            fee: 0,
            assetsChainId: nerve.chainId(),
            assetsId: 1,
            amount: 0,
        };
        let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.chainId, transferInfo.assetId);
        let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            61,
            {
                tokenA: tokenA,
                tokenB: tokenB
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();
        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },
    async swapAddLiquidity(pri, fromAddress, tokenAmountA, tokenAmountB, amountAMin, amountBMin, deadline, to, remark) {
        let pairAddress = this.getStringPairAddress(nerve.chainId(), tokenAmountA, tokenAmountB);
        let inOrOutputs = await inputsOrOutputsOfSwapAddLiquidity(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            64,
            {
                tokenA: tokenAmountA,
                tokenB: tokenAmountB,
                to: to,
                deadline: deadline,
                amountAMin: amountAMin,
                amountBMin: amountBMin
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },

    async swapRemoveLiquidity(pri, fromAddress, tokenAmountLP, tokenAmountAMin, tokenAmountBMin, deadline, to, remark) {
        let pairAddress = this.getStringPairAddress(nerve.chainId(), tokenAmountAMin, tokenAmountBMin);
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: pairAddress,
            fee: 0,
            assetsChainId: tokenAmountLP.chainId,
            assetsId: tokenAmountLP.assetId,
            amount: tokenAmountLP.amount,
        };
        let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.assetsChainId, transferInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);

        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            65,
            {
                tokenA: tokenAmountAMin,
                tokenB: tokenAmountBMin,
                to: to,
                deadline: deadline,
                amountAMin: tokenAmountAMin.amount,
                amountBMin: tokenAmountBMin.amount
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },
    async swapTrade(pri, fromAddress, amountIn, tokenPath, amountOutMin, feeTo, deadline, to, remark) {
        if (feeTo == null) {
            feeTo = '';
        }
        let firstTokenIn = tokenPath[0];
        let pairAddress = this.getStringPairAddress(nerve.chainId(), firstTokenIn, tokenPath[1]);
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: pairAddress,
            fee: 0,
            assetsChainId: firstTokenIn.chainId,
            assetsId: firstTokenIn.assetId,
            amount: amountIn,
        };
        let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.assetsChainId, transferInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);

        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            63,
            {
                amountOutMin: amountOutMin,
                to: to,
                feeTo: feeTo,
                deadline: deadline,
                tokenPath: tokenPath
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },
    async stableSwapCreatePair(pri, fromAddress, coins, remark) {
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: fromAddress,
            fee: 0,
            assetsChainId: nerve.chainId(),
            assetsId: 1,
            amount: 0,
        };
        let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.chainId, transferInfo.assetId);
        let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            71,
            {
                coins: coins,
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },
    async stableSwapAddLiquidity(pri, fromAddress, stablePairAddress, tokenAmounts, deadline, to, remark) {
        let inOrOutputs = await inputsOrOutputsOfStableAddLiquidityOrTrade(fromAddress, stablePairAddress, tokenAmounts);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            73,
            {
                to: to
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },
    async stableSwapRemoveLiquidity(pri, fromAddress, stablePairAddress, tokenAmountLP, receiveOrderIndexs, deadline, to, remark) {
        let pairAddress = stablePairAddress;
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: pairAddress,
            fee: 0,
            assetsChainId: tokenAmountLP.chainId,
            assetsId: tokenAmountLP.assetId,
            amount: tokenAmountLP.amount,
        };
        let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.assetsChainId, transferInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);

        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            74,
            {
                indexs: Buffer.from(receiveOrderIndexs),
                to: to
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },
    async stableSwapTrade(pri, fromAddress, stablePairAddress, amountIns, tokenOutIndex, feeTo, deadline, to, remark) {
        let inOrOutputs = await inputsOrOutputsOfStableAddLiquidityOrTrade(fromAddress, stablePairAddress, amountIns);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }
        if (feeTo == null) {
            feeTo = '';
        }
        let tAssemble = await nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            72,
            {
                to: to,
                tokenOutIndex: Buffer.from([tokenOutIndex]),
                feeTo: feeTo,
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();

        //交易签名
        let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
        //通过拼接签名、公钥获取HEX
        let signData = await sdk.appSplicingPub(txSignature.signValue, sdk.getPub(pri));
        tAssemble.signatures = signData;
        let txhex = tAssemble.txSerialize().toString("hex");
        return txhex;
    },

}