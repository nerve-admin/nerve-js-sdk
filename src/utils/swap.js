const sdk = require('../api/sdk');
const util = require('../test/api/util');
const cryptos = require("crypto");
const BigNumber = require('bignumber.js');
const nerve = require('../index');

async function inputsOrOutputsOfSwapAddLiquidity(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress) {
    let balanceA = await util.getNulsBalance(fromAddress, tokenAmountA.chainId, tokenAmountA.assetId);
    let balanceB = await util.getNulsBalance(fromAddress, tokenAmountB.chainId, tokenAmountB.assetId);
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

function containsCurrency(currentPathArray, token) {
    let length = currentPathArray.length;
    for (let i = 0; i < length; i++) {
        let pair = currentPathArray[i];
        if (swap.tokenEquals(pair.token0, token) || swap.tokenEquals(pair.token1, token)) {
            return true;
        }
    }
    return false;
}

function getAmountOutForBestTrade(amountIn, reserveIn, reserveOut) {
    let _amountIn = new BigNumber(amountIn);
    if(_amountIn.isLessThanOrEqualTo(0)) {
        return new BigNumber('0');
    }
    let _reserveIn = new BigNumber(reserveIn);
    let _reserveOut = new BigNumber(reserveOut);
    if(_reserveIn.isLessThanOrEqualTo(0) || _reserveOut.isLessThanOrEqualTo(0)) {
        return new BigNumber('0');
    }
    let amountInWithFee = _amountIn.times(997);
    let numerator = amountInWithFee.times(_reserveOut);
    let denominator = _reserveIn.times(1000).plus(amountInWithFee);
    let amountOut = numerator.dividedToIntegerBy(denominator);
    return amountOut;
}

function getAmountInForBestTrade(amountOut, reserveIn, reserveOut) {
    let _amountOut = new BigNumber(amountOut);
    if(_amountOut.isLessThanOrEqualTo(0)) {
        return new BigNumber('0');
    }
    let _reserveIn = new BigNumber(reserveIn);
    let _reserveOut = new BigNumber(reserveOut);
    if(_reserveOut.isLessThanOrEqualTo(_amountOut) ||  _reserveIn.isLessThanOrEqualTo(0) || _reserveOut.isLessThanOrEqualTo(0)) {
        return new BigNumber('0');
    }
    let numerator = _reserveIn.times(_amountOut).times(1000);
    let denominator = _reserveOut.minus(_amountOut).times(997);
    let amountIn = numerator.dividedToIntegerBy(denominator).plus(1);
    return amountIn;
}

function calcBestTradeExactIn(chainId, pairs, tokenAmountIn, tokenOut, currentPathArray, wholeTradeArray, orginTokenAmountIn, maxPairSize, stableGroupArray) {
    let tokenIn = tokenAmountIn.token;
    let length = pairs.length;
    let tokens = swap.tokenSort(tokenIn, tokenOut);
    let subIndex = -1;
    for (let i = 0; i < length; i++) {
        let pair = pairs[i];
        if (swap.tokenEquals(pair.token0, tokens[0]) && swap.tokenEquals(pair.token1, tokens[1])) {
            subIndex = i;
            break;
        }
    }
    if (subIndex != -1) {
        let pair = pairs[subIndex];
        let reserves = swap.getReserves(tokenIn, tokenOut, pair);
        let reserveIn = new BigNumber(reserves[0]);
        let reserveOut = new BigNumber(reserves[1]);
        let amountOut = getAmountOutForBestTrade(tokenAmountIn.amount, reserveIn, reserveOut);
        let tokenAmountOut = swap.tokenAmount(tokenOut.chainId, tokenOut.assetId, amountOut);
        wholeTradeArray.push({
            path: [pair],
            tokenAmountIn: orginTokenAmountIn,
            tokenAmountOut: tokenAmountOut
        });
        pairs = pairs.slice(0, subIndex).concat(pairs.slice(subIndex + 1, length));
    }
    // pair去重，检查交易对中是否有多个相同组下的普通token和稳定币token 筛选机制，留下一个，留下稳定币token在Pair池中数量最多的
    if (stableGroupArray) {
        pairs = deduplicationGroupPair(pairs, stableGroupArray);
    }
    let trades = realBestTradeExactIn(chainId, pairs, tokenAmountIn, tokenOut, currentPathArray, wholeTradeArray, orginTokenAmountIn, 0, maxPairSize, stableGroupArray);
    if (trades.length == 0) return {};
    trades.sort(function (a, b) {return b.tokenAmountOut.amount.minus(a.tokenAmountOut.amount)});

    let trade = trades[0];
    if (trade.tokenAmountOut.amount.isEqualTo(0)) return {};
    return trade;
}

function deduplicationGroupPair(pairs, stableGroupArray) {
    let resultPairs = [];
    let groupPairMap = {};
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i];
        let stableInfo = swap.checkStableToken(pair.token0, stableGroupArray);
        if (stableInfo.success) {
            let array = groupPairMap[swap.tokenStr(stableInfo.lpToken) + "-" + swap.tokenStr(pair.token1)];
            if (!array) {
                array = [];
            }
            pair.stableToken = pair.token0;
            pair.stableTokenReserve = pair.reserve0;
            pair.stableTokenDecimals = stableInfo['groupCoin'][swap.tokenStr(pair.token0)].decimals;
            array.push(pair);
        } else {
            stableInfo = swap.checkStableToken(pair.token1, stableGroupArray);
            if (stableInfo.success) {
                let array = groupPairMap[swap.tokenStr(stableInfo.lpToken) + "-" + swap.tokenStr(pair.token0)];
                if (!array) {
                    array = [];
                    groupPairMap[swap.tokenStr(stableInfo.lpToken) + "-" + swap.tokenStr(pair.token0)] = array;
                }
                pair.stableToken = pair.token1;
                pair.stableTokenReserve = pair.reserve1;
                pair.stableTokenDecimals = stableInfo['groupCoin'][swap.tokenStr(pair.token1)].decimals;
                array.push(pair);
            } else {
                resultPairs.push(pair);
            }
        }
    }
    let keys = Object.keys(groupPairMap);
    if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            // console.log('============key', key);
            let array = groupPairMap[key];
            if (array.length == 0) continue;
            if (array.length == 1) {
                resultPairs.push(array[0]);
            } else {
                // 留下一个，留下稳定币token在Pair池中数量最多的
                let index = 0;
                let maxReserve = new BigNumber('0');
                for (let j = 0; j < array.length; j++) {
                    let pair = array[j];
                    let currentReserve = new BigNumber(pair.stableTokenReserve).times(new BigNumber('10').pow(18 - pair.stableTokenDecimals));
                    // console.log('token', swap.tokenStr(pair.stableToken), 'currentReserve', currentReserve.toFixed());
                    if (currentReserve.isGreaterThan(maxReserve)) {
                        maxReserve = currentReserve;
                        index = j;
                    }
                }
                resultPairs.push(array[index]);
            }
        }
    }
    return resultPairs;
}

function makeStableLinkPair(tokenA, tokenB, amountA, amountB) {
    let array = swap.tokenSort(tokenA, tokenB);
    let token0 = array[0];
    let result = swap.tokenEquals(tokenA, token0) ? swap.pair(tokenA, tokenB, amountA, amountB) : swap.pair(tokenB, tokenA, amountB, amountA);
    return result;
}

function realBestTradeExactIn(chainId, pairs, tokenAmountIn, out, currentPathArray, wholeTradeArray, orginTokenAmountIn, depth, maxPairSize, stableGroupArray) {
    // console.log('-------------', 'pairs', JSON.stringify(pairs), 'depth', depth);
    let length = pairs.length;
    for (let i = 0; i < length; i++) {
        let pair = pairs[i];
        // console.log('pair', JSON.stringify(pair), 'depth', depth);
        let linkPair;
        let tokenIn = tokenAmountIn.token;
        if (!swap.tokenEquals(pair.token0, tokenIn) && !swap.tokenEquals(pair.token1, tokenIn)) {
            // add for link +
            if (stableGroupArray) {
                let stableResult = isGroupStable(pair.token0, tokenAmountIn.token, stableGroupArray);
                if (stableResult.success) {
                    linkPair = makeStableLinkPair(pair.token0, tokenAmountIn.token, '0', '0');
                    linkPair.groupCoin = stableResult.groupCoin;
                    tokenIn = pair.token0;
                } else {
                    stableResult = isGroupStable(pair.token1, tokenAmountIn.token, stableGroupArray);
                    if (stableResult.success) {
                        linkPair = makeStableLinkPair(pair.token1, tokenAmountIn.token, '0', '0');
                        linkPair.groupCoin = stableResult.groupCoin;
                        tokenIn = pair.token1;
                    } else {
                        continue;
                    }
                }
                // add for link -
            } else {
                continue;
            }
        }
        let tokenOut = swap.tokenEquals(pair.token0, tokenIn) ? pair.token1 : pair.token0;
        if (containsCurrency(currentPathArray, tokenOut)) continue;
        // 计算tokenOutAmount
        let amountIn = tokenAmountIn.amount;
        // add for link +
        if (linkPair) {
            // 检查稳定币池是否有足够的金额
            let linkIn = linkPair['groupCoin'][swap.tokenStr(tokenAmountIn.token)];
            let linkOut = linkPair['groupCoin'][swap.tokenStr(tokenIn)];
            let linkAmountOut = new BigNumber(amountIn).times(new BigNumber('10').pow(linkOut.decimals)).div(new BigNumber('10').pow(linkIn.decimals));
            if (new BigNumber(linkOut.balance).isLessThan(linkAmountOut)) {
                amountIn = '0';
            } else {
                amountIn = linkAmountOut.toFixed();
            }
        }
        // add for link -
        let reserves = swap.getReserves(tokenIn, tokenOut, pair);
        let reserveIn = new BigNumber(reserves[0]);
        let reserveOut = new BigNumber(reserves[1]);
        if (reserveIn.isEqualTo(0) || reserveOut.isEqualTo(0)) continue;
        let amountOut = getAmountOutForBestTrade(amountIn, reserveIn, reserveOut);

        if (swap.tokenEquals(tokenOut, out)) {
            // add for link +
            if (linkPair) {
                currentPathArray.push(linkPair);
            }
            // add for link -
            currentPathArray.push(pair);
            let tokenAmountOut = swap.tokenAmount(tokenOut.chainId, tokenOut.assetId, amountOut);
            wholeTradeArray.push({
                path: currentPathArray,
                tokenAmountIn: orginTokenAmountIn,
                tokenAmountOut: tokenAmountOut
            });
        } else if (depth < (maxPairSize - 1) && length > 1) {
            let cloneCurrentPathArray = currentPathArray.slice();
            // add for link +
            if (linkPair) {
                cloneCurrentPathArray.push(linkPair);
            }
            // add for link -
            cloneCurrentPathArray.push(pair);
            let subPairs = pairs.slice(0, i);
            subPairs = subPairs.concat(pairs.slice(i + 1, length));
            realBestTradeExactIn(
                chainId,
                subPairs,
                swap.tokenAmount(tokenOut.chainId, tokenOut.assetId, amountOut),
                out,
                cloneCurrentPathArray,
                wholeTradeArray,
                orginTokenAmountIn,
                depth + 1,
                maxPairSize,
                stableGroupArray
            );
        }
    }
    return wholeTradeArray;
}

function calcBestTradeExactOut(chainId, pairs, _in, tokenAmountOut, currentPathArray, wholeTradeArray, orginTokenAmountOut, maxPairSize, stableGroupArray) {
    let tokenOut = tokenAmountOut.token;
    let length = pairs.length;
    let tokens = swap.tokenSort(_in, tokenOut);
    let subIndex = -1;
    for (let i = 0; i < length; i++) {
        let pair = pairs[i];
        if (swap.tokenEquals(pair.token0, tokens[0]) && swap.tokenEquals(pair.token1, tokens[1])) {
            subIndex = i;
            break;
        }
    }
    if (subIndex != -1) {
        let pair = pairs[subIndex];
        let reserves = swap.getReserves(_in, tokenOut, pair);
        let reserveIn = new BigNumber(reserves[0]);
        let reserveOut = new BigNumber(reserves[1]);
        let amountIn = getAmountInForBestTrade(tokenAmountOut.amount, reserveIn, reserveOut);
        let tokenAmountIn = swap.tokenAmount(_in.chainId, _in.assetId, amountIn);
        wholeTradeArray.push({
            path: [pair],
            tokenAmountIn: tokenAmountIn,
            tokenAmountOut: orginTokenAmountOut
        });
        pairs = pairs.slice(0, subIndex).concat(pairs.slice(subIndex + 1, length));
    }
    // pair去重，检查交易对中是否有多个相同组下的普通token和稳定币token 筛选机制，留下一个，留下稳定币token在Pair池中数量最多的
    if (stableGroupArray) {
        pairs = deduplicationGroupPair(pairs, stableGroupArray);
    }
    let trades = realBestTradeExactOut(chainId, pairs, _in, tokenAmountOut, currentPathArray, wholeTradeArray, orginTokenAmountOut, 0, maxPairSize, stableGroupArray);
    if (trades.length == 0) return {};
    trades.sort(function (a, b) {return a.tokenAmountIn.amount.minus(b.tokenAmountIn.amount)});
    for (let i=0;i<trades.length;i++) {
        let trade = trades[i];
        if (trade.tokenAmountIn.amount.isEqualTo(0)) continue;
        return trade;
    }
    return {};
}

function realBestTradeExactOut(chainId, pairs, _in, tokenAmountOut, currentPathArray, wholeTradeArray, orginTokenAmountOut, depth, maxPairSize, stableGroupArray) {
    let length = pairs.length;
    for (let i = 0; i < length; i++) {
        let pair = pairs[i];
        let linkPair;
        let currentOut = tokenAmountOut.token;
        if (!swap.tokenEquals(pair.token0, currentOut) && !swap.tokenEquals(pair.token1, currentOut)) {
            // add for link +
            if (stableGroupArray) {
                let stableResult = isGroupStable(pair.token0, tokenAmountOut.token, stableGroupArray);
                if (stableResult.success) {
                    linkPair = makeStableLinkPair(pair.token0, tokenAmountOut.token, '0', '0');
                    linkPair.groupCoin = stableResult.groupCoin;
                    currentOut = pair.token0;
                } else {
                    stableResult = isGroupStable(pair.token1, tokenAmountOut.token, stableGroupArray);
                    if (stableResult.success) {
                        linkPair = makeStableLinkPair(pair.token1, tokenAmountOut.token, '0', '0');
                        linkPair.groupCoin = stableResult.groupCoin;
                        currentOut = pair.token1;
                    } else {
                        continue;
                    }
                }
                // add for link -
            } else {
                continue;
            }
        }
        let currentIn = swap.tokenEquals(pair.token0, currentOut) ? pair.token1 : pair.token0;
        if (containsCurrency(currentPathArray, currentIn)) continue;
        // 计算tokenInAmount
        let amountOut = tokenAmountOut.amount;
        // add for link +
        if (linkPair) {
            // 检查稳定币池是否有足够的金额
            let linkIn = linkPair['groupCoin'][swap.tokenStr(currentOut)];
            let linkOut = linkPair['groupCoin'][swap.tokenStr(tokenAmountOut.token)];
            let linkAmountIn = new BigNumber(amountOut).times(new BigNumber('10').pow(linkIn.decimals)).div(new BigNumber('10').pow(linkOut.decimals));
            if (new BigNumber(linkOut.balance).isLessThan(amountOut)) {
                amountOut = '0';
            } else {
                amountOut = linkAmountIn.toFixed();
            }
        }
        // add for link -

        let reserves = swap.getReserves(currentIn, currentOut, pair);
        let reserveIn = new BigNumber(reserves[0]);
        let reserveOut = new BigNumber(reserves[1]);
        if (reserveIn.isEqualTo(0) || reserveOut.isEqualTo(0)) continue;
        let amountIn = getAmountInForBestTrade(amountOut, reserveIn, reserveOut);

        if (swap.tokenEquals(currentIn, _in)) {
            // add for link +
            if (linkPair) {
                currentPathArray.push(linkPair);
            }
            // add for link -
            currentPathArray.push(pair);
            let tokenAmountIn = swap.tokenAmount(currentIn.chainId, currentIn.assetId, amountIn);
            wholeTradeArray.push({
                path: currentPathArray,
                tokenAmountIn: tokenAmountIn,
                tokenAmountOut: orginTokenAmountOut
            });
        } else if (depth < (maxPairSize - 1) && length > 1) {
            let cloneCurrentPathArray = currentPathArray.slice();
            // add for link +
            if (linkPair) {
                cloneCurrentPathArray.push(linkPair);
            }
            // add for link -
            cloneCurrentPathArray.push(pair);
            let subPairs = pairs.slice(0, i);
            subPairs = subPairs.concat(pairs.slice(i + 1, length));
            realBestTradeExactOut(
                chainId,
                subPairs,
                _in,
                swap.tokenAmount(currentIn.chainId, currentIn.assetId, amountIn),
                cloneCurrentPathArray,
                wholeTradeArray,
                orginTokenAmountOut,
                depth + 1,
                maxPairSize,
                stableGroupArray
            );
        }
    }
    return wholeTradeArray;
}

function isGroupStable(tokenA, tokenB, stableGroupArray) {
    let result = {success: false};
    let length = stableGroupArray.length;
    for (let i = 0; i < length; i++) {
        let info = stableGroupArray[i];
        if (info['groupCoin'][swap.tokenStr(tokenA)] && info['groupCoin'][swap.tokenStr(tokenB)]) {
            result.success = true;
            result.address = info.address;
            result.lpToken = swap.parseTokenStr(info.lpToken);
            result.groupCoin = info.groupCoin;
            return result;
        }
    }
    return result;
}

var swap = {
    /**
     * 当前时间，单位秒
     * @returns {number}
     */
    currentTime() {
        var times = new Date().valueOf();
        return Number(times.toString().substr(0, times.toString().length - 3)); //交易时间
    },
    /**
     *
     * 组装一个token的json对象
     */
    token(chainId, assetId) {
        return {chainId: chainId, assetId: assetId};
    },
    /**
     * @param amount 资产数量
     * @returns {{amount: *, chainId: *, assetId: *}}
     */
    tokenAmount(chainId, assetId, amount) {
        let token = this.token(chainId, assetId);
        return {chainId: chainId, assetId: assetId, amount: amount, token: token};
    },
    /**
     * 按`chainId`和`assetId`排序两个token
     */
    tokenSort(token0, token1) {
        let positiveSequence = token0.chainId < token1.chainId || (token0.chainId == token1.chainId && token0.assetId < token1.assetId);
        if (positiveSequence) {
            return [token0, token1];
        }
        return [token1, token0];
    },

    tokenStr(token) {
        return token.chainId + '-' + token.assetId;
    },

    parseTokenStr(tokenStr) {
        let split = tokenStr.split("-");
        return {chainId: Number(split[0].trim()), assetId: Number(split[1].trim())};
    },
    /**
     * 根据token计算swap交易对地址
     */
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
    /**
     *
     * 比较两个token是否相同
     */
    tokenEquals(tokenA, tokenB) {
        return tokenA.chainId == tokenB.chainId && tokenA.assetId == tokenB.assetId;
    },
    /**
     *
     * 组装一个交易对的json对象
     */
    pair(token0, token1, reserve0, reserve1) {
        return {token0: token0, token1: token1, reserve0: reserve0, reserve1: reserve1};
    },
    /**
     *
     * 根据指定的token，返回相应顺序的流动性数量
     */
    getReserves(tokenA, tokenB, pair) {
        let array = this.tokenSort(tokenA, tokenB);
        let token0 = array[0];
        let result = this.tokenEquals(tokenA, token0) ? [pair.reserve0, pair.reserve1] : [pair.reserve1, pair.reserve0];
        return result;
    },

    /**
     * 检查`token`是否为稳定币池中的token
     * @param token
     * @param stableGroupArray
     */
    checkStableToken(token, stableGroupArray) {
        let result = {success: false};
        let length = stableGroupArray.length;
        for (let i = 0; i < length; i++) {
            let info = stableGroupArray[i];
            if (info['groupCoin'][this.tokenStr(token)]) {
                result.success = true;
                result.address = info.address;
                result.lpToken = this.parseTokenStr(info.lpToken);
                result.groupCoin = info.groupCoin;
                return result;
            }
        }
        return result;
    },

    /**
     * 计算最优交易路径
     */
    bestTradeExactIn(chainId, pairs, tokenAmountIn, tokenOut, maxPairSize, stableGroupArray) {
        let trade = calcBestTradeExactIn(chainId, pairs, tokenAmountIn, tokenOut, [], [], tokenAmountIn, maxPairSize, stableGroupArray);
        if (!trade.path) return trade;
        let tokenIn = trade.tokenAmountIn.token;
        let tokenPath = [tokenIn];
        let path = trade.path;
        let length = path.length;
        for (let i = 0; i < length; i++) {
            let pair = path[i];
            let token0 = pair.token0;
            let token1 = pair.token1;
            if (this.tokenEquals(tokenIn, token0)) {
                tokenPath.push(token1);
                tokenIn = token1;
            } else {
                tokenPath.push(token0);
                tokenIn = token0;
            }
        }
        trade.path = tokenPath;
        return trade;
    },
    /**
     * 计算最优交易路径
     */
    bestTradeExactOut(chainId, pairs, tokenIn, tokenAmountOut, maxPairSize, stableGroupArray) {
        let trade = calcBestTradeExactOut(chainId, pairs, tokenIn, tokenAmountOut, [], [], tokenAmountOut, maxPairSize, stableGroupArray);
        if (!trade.path) return trade;
        let tokenOut = tokenAmountOut.token;
        let tokenPath = [tokenOut];
        let path = trade.path;
        let length = path.length;
        let _tokenTmp = tokenOut;
        for (let i = 0; i < length; i++) {
            let pair = path[i];
            let token0 = pair.token0;
            let token1 = pair.token1;
            if (swap.tokenEquals(_tokenTmp, token0)) {
                tokenPath.push(token1);
                _tokenTmp = token1;
            } else {
                tokenPath.push(token0);
                _tokenTmp = token0;
            }
        }
        let tokenPathArray = tokenPath.reverse();
        trade.path = tokenPathArray;
        return trade;
    },
    /**
     *
     * 计算移除流动性可获得的资产数量
     */
    calRemoveLiquidity(liquidity, tokenA, tokenB, pair) {
        let _liquidity = new BigNumber(liquidity);
        let reserves = this.getReserves(tokenA, tokenB, pair);
        let reserveA = reserves[0];
        let reserveB = reserves[1];
        let totalSupply = new BigNumber(pair.totalSupply);
        // 可赎回的资产
        let amountA = _liquidity.times(reserveA).dividedToIntegerBy(totalSupply);
        let amountB = _liquidity.times(reserveB).dividedToIntegerBy(totalSupply);
        if(amountA.isLessThanOrEqualTo(0) || amountB.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_LIQUIDITY_BURNED
            throw "sw_0014";
        }
        return {amountA: amountA, amountB: amountB};
    },
    /**
     * 根据交易对中其中一个币种，计算另外一个币种可添加的流动性
     */
    quote(amountA, reserveA, reserveB) {
        let _amountA = new BigNumber(amountA);
        if(_amountA.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_AMOUNT
            throw "sw_0002";
        }
        let _reserveA = new BigNumber(reserveA);
        let _reserveB = new BigNumber(reserveB);
        if(_reserveA.isLessThanOrEqualTo(0) || _reserveB.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_LIQUIDITY
            throw "sw_0003";
        }
        return _amountA.times(_reserveB).dividedToIntegerBy(_reserveA);
    },
    /**
     * 根据卖出数量，计算可买进的数量
     */
    getAmountOut(amountIn, reserveIn, reserveOut) {
        let _amountIn = new BigNumber(amountIn);
        if(_amountIn.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_INPUT_AMOUNT
            throw "sw_0004";
        }
        let _reserveIn = new BigNumber(reserveIn);
        let _reserveOut = new BigNumber(reserveOut);
        if(_reserveIn.isLessThanOrEqualTo(0) || _reserveOut.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_LIQUIDITY
            throw "sw_0003";
        }
        let amountInWithFee = _amountIn.times(997);
        let numerator = amountInWithFee.times(_reserveOut);
        let denominator = _reserveIn.times(1000).plus(amountInWithFee);
        let amountOut = numerator.dividedToIntegerBy(denominator);
        return amountOut;
    },
    /**
     * 根据买进数量，计算可卖出数量
     */
    getAmountIn(amountOut, reserveIn, reserveOut) {
        let _amountOut = new BigNumber(amountOut);
        if(_amountOut.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_OUTPUT_AMOUNT
            throw "sw_0005";
        }
        let _reserveIn = new BigNumber(reserveIn);
        let _reserveOut = new BigNumber(reserveOut);
        if(_reserveOut.isLessThanOrEqualTo(_amountOut) ||  _reserveIn.isLessThanOrEqualTo(0) || _reserveOut.isLessThanOrEqualTo(0)) {
            // INSUFFICIENT_LIQUIDITY
            throw "sw_0003";
        }
        let numerator = _reserveIn.times(_amountOut).times(1000);
        let denominator = _reserveOut.minus(_amountOut).times(997);
        let amountIn = numerator.dividedToIntegerBy(denominator).plus(1);
        return amountIn;
    },
    /**
     *
     * 根据卖出数量，计算可买进的数量
     */
    getAmountsOut(amountIn, tokenPathArray, pairsArray) {
        let pathLength = tokenPathArray.length;
        if (pathLength < 1 || pathLength > 100) {
            // INVALID_PATH
            throw "sw_0006";
        }
        let amounts = new Array(pathLength);
        amounts[0] = amountIn;
        let reserveIn;
        let reserveOut;
        for (let i = 0; i < pathLength - 1; i++) {
            let reserves = this.getReserves(tokenPathArray[i], tokenPathArray[i + 1], pairsArray[i]);
            reserveIn = reserves[0];
            reserveOut = reserves[1];
            amounts[i + 1] = this.getAmountOut(amounts[i], reserveIn, reserveOut);
        }
        return amounts;
    },
    /**
     *
     * 根据买进数量，计算可卖出数量
     */
    getAmountsIn(amountOut, tokenPathArray, pairsArray) {
        let pathLength = tokenPathArray.length;
        if (pathLength < 1 || pathLength > 100) {
            // INVALID_PATH
            throw "sw_0006";
        }
        let amounts = new Array(pathLength);
        amounts[pathLength - 1] = amountOut;
        let reserveIn;
        let reserveOut;
        for (let i = pathLength - 1; i > 0; i--) {
            let reserves = this.getReserves(tokenPathArray[i - 1], tokenPathArray[i], pairsArray[i - 1]);
            reserveIn = reserves[0];
            reserveOut = reserves[1];
            amounts[i - 1] = this.getAmountIn(amounts[i], reserveIn, reserveOut);
        }
        return amounts;
    },
    /**
     *
     * 根据交易数量，计算当前流动池数量和交易后的流动池数量
     */
    getAmountsReserves(amounts, tokenPathArray, pairsArray) {
        let pathLength = tokenPathArray.length;
        if (pathLength < 1 || pathLength > 100) {
            // INVALID_PATH
            throw "sw_0006";
        }
        let amountIn = amounts[0];
        let amountOut = amounts[amounts.length - 1];
        let reserves = this.getReserves(tokenPathArray[0], tokenPathArray[1], pairsArray[0]);
        let reserveIn = new BigNumber(reserves[0]);
        let _reserveIn = reserveIn.plus(amountIn);
        let reserveOut;
        if (pathLength < 3) {
            reserveOut = new BigNumber(reserves[1]);
        } else {
            reserves = this.getReserves(tokenPathArray[pathLength - 2], tokenPathArray[pathLength - 1], pairsArray[pathLength - 2]);
            reserveOut = new BigNumber(reserves[1]);
        }
        let _reserveOut = reserveOut.minus(amountOut);
        return [reserveIn, reserveOut, _reserveIn, _reserveOut];
    },
    /**
     *
     * 根据交易数量计算价格影响
     *
     * 计算规则:
     *  原始池: reserveIn, reserveOut
     *  交易后的池: _reserveIn, _reserveOut
     *  原始价格: reserveOut / reserveIn
     *  交易后的价格: _reserveOut / _reserveIn
     *  结果 = (原始价格 - 交易后的价格).abs() / 原始价格
     */
    getPriceImpact(amounts, tokenPathArray, pairsArray) {
        let array = this.getAmountsReserves(amounts, tokenPathArray, pairsArray);
        let reserveIn = array[0];
        let reserveOut = array[1];
        let _reserveIn = array[2];
        let _reserveOut = array[3];
        let priceImpact = new BigNumber(1).minus(
            new BigNumber
            ((_reserveOut.times(reserveIn).shiftedBy(78))
                    .div(_reserveIn.times(reserveOut)).toFixed(78))
                .shiftedBy(-78)
        ).abs();
        return priceImpact;
    },

    /**
     * 组装交易: swap创建交易对
     *
     * @param fromAddress           用户地址
     * @param tokenA                资产A的类型，示例：nerve.swap.token(5,1)
     * @param tokenB                资产B的类型，示例：nerve.swap.token(5,6)
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async swapCreatePair(fromAddress, tokenA, tokenB, remark) {
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: fromAddress,
            fee: 0,
            assetsChainId: nerve.chainId(),
            assetsId: 1,
            amount: 0,
        };
        let balance = await util.getNulsBalance(transferInfo.fromAddress, transferInfo.assetsChainId, transferInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(transferInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: swap添加流动性
     *
     * @param fromAddress           用户地址
     * @param tokenAmountA          添加的资产A的数量，示例：nerve.swap.tokenAmount(5, 1, "140000000000")
     * @param tokenAmountB          添加的资产B的数量，示例：nerve.swap.tokenAmount(5, 6, "100000000")
     * @param amountAMin            资产A最小添加值
     * @param amountBMin            资产B最小添加值
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    流动性份额接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async swapAddLiquidity(fromAddress, tokenAmountA, tokenAmountB, amountAMin, amountBMin, deadline, to, remark) {
        let pairAddress = this.getStringPairAddress(nerve.chainId(), tokenAmountA, tokenAmountB);
        let inOrOutputs = await inputsOrOutputsOfSwapAddLiquidity(fromAddress, to, tokenAmountA, tokenAmountB, pairAddress);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },

    /**
     * 组装交易: swap移除流动性
     *
     * @param fromAddress           用户地址
     * @param tokenAmountLP         移除的资产LP的数量，示例：nerve.swap.tokenAmount(5, 18, "2698778989")
     * @param tokenAmountAMin       资产A最小移除值，示例：nerve.swap.tokenAmount(5, 1, "140000000000")
     * @param tokenAmountBMin       资产B最小移除值，示例：nerve.swap.tokenAmount(5, 6, "100000000")
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    移除流动性份额接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async swapRemoveLiquidity(fromAddress, tokenAmountLP, tokenAmountAMin, tokenAmountBMin, deadline, to, remark) {
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

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: swap币币交易
     *
     * @param fromAddress           用户地址
     * @param amountIn              卖出的资产数量
     * @param tokenPath             币币交换资产路径，路径中最后一个资产，是用户要买进的资产，
     *                                      如卖A买B: [A, B] or [A, C, B]，
     *                                      示例: [nerve.swap.token(5, 1), nerve.swap.token(5, 6)]
     * @param amountOutMin          最小买进的资产数量
     * @param feeTo                 交易手续费取出一部分给指定的接收地址
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    资产接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async swapTrade(fromAddress, amountIn, tokenPath, amountOutMin, feeTo, deadline, to, remark) {
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

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: swap币币交易(聚合稳定币池)
     *
     * @param fromAddress           用户地址
     * @param amountIn              卖出的资产数量
     * @param tokenPath             币币交换资产路径，路径中最后一个资产，是用户要买进的资产，
     *                                      如卖A买B: [A, B] or [A, C, B]，
     *                                      示例: [nerve.swap.token(5, 1), nerve.swap.token(5, 6)]
     * @param amountOutMin          最小买进的资产数量
     * @param feeTo                 交易手续费取出一部分给指定的接收地址
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    资产接收地址
     * @param stableGroupArray       支持的稳定币池信息
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async swapTradeWithCombinedStable(fromAddress, amountIn, tokenPath, amountOutMin, feeTo, deadline, to, stableGroupArray, remark) {
        if (feeTo == null) {
            feeTo = '';
        }
        let firstTokenIn = tokenPath[0];
        let secondTokenIn = tokenPath[1];
        // 检查前两个币是否稳定币池
        let pairAddress;
        let group = isGroupStable(firstTokenIn, secondTokenIn, stableGroupArray);
        if (group.success) {
            pairAddress = group.address;
        }
        if (!pairAddress) {
            // 普通交易对
            pairAddress = this.getStringPairAddress(nerve.chainId(), firstTokenIn, secondTokenIn);
        }
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

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: stable-swap创建交易对
     *
     * @param fromAddress           用户地址
     * @param coins                 资产类型列表，示例：[nerve.swap.token(5, 6), nerve.swap.token(5, 9), nerve.swap.token(5, 7), nerve.swap.token(5, 8)]
     * @param symbol                LP名称（选填）
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async stableSwapCreatePair(fromAddress, coins, symbol, remark) {
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

        let tAssemble = nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            71,
            {
                coins: coins,
                symbol: symbol
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: stable-swap添加流动性
     *
     * @param fromAddress           用户地址
     * @param stablePairAddress     交易对地址
     * @param tokenAmounts          添加的资产数量列表，示例：[swap.tokenAmount(5, 6, "60000000000"), swap.tokenAmount(5, 7, "700000000"), swap.tokenAmount(5, 8, "800000000"), swap.tokenAmount(5, 9, "900000000")]
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    流动性份额接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async stableSwapAddLiquidity(fromAddress, stablePairAddress, tokenAmounts, deadline, to, remark) {
        let inOrOutputs = await inputsOrOutputsOfStableAddLiquidityOrTrade(fromAddress, stablePairAddress, tokenAmounts);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: stable-swap移除流动性
     *
     * @param fromAddress           用户地址
     * @param stablePairAddress     交易对地址
     * @param tokenAmountLP         移除的资产LP的数量，示例：nerve.swap.tokenAmount(5, 18, "2698778989")
     * @param receiveOrderIndexs    按币种索引顺序接收资产，示例：[4, 2, 3, 1]
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    移除流动性份额接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async stableSwapRemoveLiquidity(fromAddress, stablePairAddress, tokenAmountLP, receiveOrderIndexs, deadline, to, remark) {
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

        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易：StableSwap币币交易
     *
     * @param fromAddress           用户地址
     * @param stablePairAddress     交易对地址
     * @param amountIns             卖出的资产数量列表，示例：[nerve.swap.tokenAmount(5, 6, "600000000"), nerve.swap.tokenAmount(5, 9, "90000000")]
     * @param tokenOutIndex         买进的资产索引，示例：3
     * @param feeTo                 交易手续费取出一部分给指定的接收地址
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    资产接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async stableSwapTrade(fromAddress, stablePairAddress, amountIns, tokenOutIndex, feeTo, deadline, to, remark) {
        let inOrOutputs = await inputsOrOutputsOfStableAddLiquidityOrTrade(fromAddress, stablePairAddress, amountIns);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }
        if (feeTo == null) {
            feeTo = '';
        }
        let tAssemble = nerve.transactionAssemble(
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 组装交易: stable-lp-swap-trade
     *
     * @param fromAddress           用户地址
     * @param stablePairAddress     稳定币交易对地址
     * @param amountIn              卖出的资产数量
     * @param tokenPath             币币交换资产路径，路径中最后一个资产，是用户要买进的资产，
     *                                      如卖A买B: [A, stableLp, B] or [A, stableLp, C, B]，
     *                                      示例: [nerve.swap.token(5, 1), nerve.swap.token(5, 6)...]
     * @param amountOutMin          最小买进的资产数量
     * @param feeTo                 交易手续费取出一部分给指定的接收地址
     * @param deadline              过期时间，示例：nerve.swap.currentTime() + 300 (5分钟/300秒以后)
     * @param to                    流动性份额接收地址
     * @param remark                交易备注
     * @returns 交易序列化hex字符串
     */
    async stableLpSwapTrade(fromAddress, stablePairAddress, amountIn, tokenPath, amountOutMin, feeTo, deadline, to, remark) {
        if (feeTo == null) {
            feeTo = '';
        }
        let tokenIn = tokenPath[0];
        let tokenAmountIn = this.tokenAmount(tokenIn.chainId, tokenIn.assetId, amountIn);
        let inOrOutputs = await inputsOrOutputsOfStableAddLiquidityOrTrade(fromAddress, stablePairAddress, [tokenAmountIn]);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }

        let tAssemble = nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            77,
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
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 创建farm
     */
    async farmCreate(fromAddress, tokenA, tokenB, chainId, syrupTotalAmount, syrupPerBlock, startBlockHeight, lockedTime, addressPrefix, modifiable, withdrawLockTime, remark) {
        syrupTotalAmount = new BigNumber(syrupTotalAmount).toFixed();
        syrupPerBlock = new BigNumber(syrupPerBlock).toFixed();
        let farmInfo = {
            tokenA: tokenA,
            tokenB: tokenB,
            fromAddress: fromAddress,
            toAddress: sdk.getStringSpecAddress(chainId, 5, "0000000000000000000000000000000000000000000000000000000000000000", addressPrefix),//根据空hash+ 类型=5，计算出地址
            fee: 0,
            assetsChainId: tokenB.chainId,
            assetsId: tokenB.assetId,
            amount: syrupTotalAmount,
        };
        let balance = await util.getNulsBalance(farmInfo.fromAddress, farmInfo.assetsChainId, farmInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(farmInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }
        let tAssemble = nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            62,
            {
                tokenA: tokenA,
                tokenB: tokenB,
                syrupPerBlock: syrupPerBlock ,
                totalSyrupAmount:syrupTotalAmount,
                startBlockHeight:startBlockHeight,
                lockedTime:lockedTime,
                modifiable:modifiable,
                withdrawLockTime: withdrawLockTime
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 质押farm
     */
    async farmStake(fromAddress, tokenA, chainId, addressPrefix, amount, farmHash, remark) {
        let farmInfo = {
            fromAddress: fromAddress,
            toAddress: sdk.getStringSpecAddress(chainId, 5, "0000000000000000000000000000000000000000000000000000000000000000", addressPrefix),//根据空hash+ 类型=5，计算出地址
            fee: 0,
            assetsChainId: tokenA.chainId,
            assetsId: tokenA.assetId,
            amount: amount,
        };
        let balance = await util.getNulsBalance(farmInfo.fromAddress, farmInfo.assetsChainId, farmInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(farmInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }
        let tAssemble = nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            66,
            {
                farmHash: farmHash,
                amount: amount
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * farm更新设置
     */
    async farmUpdate(fromAddress, farmHash, syrupChangeType, tokenB, changeTotalSyrupAmount, newSyrupPerBlock, withdrawLockTime, chainId, addressPrefix,remark) {
        let farmInfo = {
            fromAddress: fromAddress,
            toAddress: sdk.getStringSpecAddress(chainId, 5, "0000000000000000000000000000000000000000000000000000000000000000", addressPrefix),//根据空hash+ 类型=5，计算出地址
            fee: 0,
            assetsChainId: tokenB.chainId,
            assetsId: tokenB.assetId,
            amount: changeTotalSyrupAmount,
        };
        let balance = await util.getNulsBalance(farmInfo.fromAddress, farmInfo.assetsChainId, farmInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(farmInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }
        let tAssemble = nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            75,
            {
                farmHash: farmHash,
                newSyrupPerBlock: newSyrupPerBlock,
                changeType:syrupChangeType,
                changeTotalSyrupAmount:changeTotalSyrupAmount,
                withdrawLockTime:withdrawLockTime
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    },
    /**
     * 退出farm
     */
    async farmWithdraw(fromAddress, tokenA, amount, farmHash, remark) {
        let farmInfo = {
            fromAddress: fromAddress,
            toAddress: fromAddress,//根据空hash+ 类型=5，计算出地址
            fee: 0,
            assetsChainId: tokenA.chainId,
            assetsId: tokenA.assetId,
            amount: 0,
        };
        let balance = await util.getNulsBalance(farmInfo.fromAddress, farmInfo.assetsChainId, farmInfo.assetsId);
        let inOrOutputs = await util.inputsOrOutputs(farmInfo, balance.data);
        if (!inOrOutputs.success) {
            throw "inputs、outputs组装错误";
        }
        let tAssemble = nerve.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark,
            67,
            {
                farmHash:farmHash,
                amount: amount
            }
        );
        //获取hash
        let hash = await tAssemble.getHash();
        let txhex = tAssemble.txSerialize().toString("hex");
        return {hash: hash.toString('hex'), hex: txhex};
    }
}
module.exports = swap;