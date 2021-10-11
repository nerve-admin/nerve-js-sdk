/**
 * swap工具类测试
 */
const BigNumber = require('bignumber.js');
const nerve = require('../../index');
const txs = require('../../model/txs');
// 设置网络环境
nerve.testnet();


/**
 * 根据卖出数量，计算可买进的数量
 */
function getAmountOut() {
    let amountIn = '7869593446';
    let reserveIn = '171132069136';
    let reserveOut = '16887743';
    let amountOut = nerve.swap.getAmountOut(amountIn, reserveIn, reserveOut);
    console.log('amountOut: ' + amountOut);
}

/**
 * 根据买进数量，计算可卖出数量
 */
function getAmountIn() {
    let amountOut = '7403190';
    let reserveIn = '171132069136';
    let reserveOut = '16887743';
    let amountIn = nerve.swap.getAmountIn(amountOut, reserveIn, reserveOut);
    console.log('amountIn: ' + amountIn);
}

/**
 * 当交易路径大于等于3时，使用以下函数计算
 *
 * 根据卖出数量，计算可买进的数量
 */
getAmountsOut();
function getAmountsOut() {
    let amountIn = '110000000000';
    let tokenPathArray = [
        nerve.swap.token(2, 33),
        nerve.swap.token(5, 25),
        nerve.swap.token(5, 1),
        nerve.swap.token(5, 7)
    ];
    let pairsArray = [
        nerve.swap.pair(
            nerve.swap.token(2, 33),
            nerve.swap.token(5, 25),
            '9204387996119851', '10866621900299832899'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 25),
            '88340927', '1132245721610466936'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 7),
            '24526402685', '4477567'),
    ];
    console.log(nerve.swap.getAmountsOut(amountIn, tokenPathArray, pairsArray));
}

// getPriceImpact();
function getPriceImpact() {
    let amountIn = '500000000';
    let tokenPathArray = [
        nerve.swap.token(5, 1),
        nerve.swap.token(2, 1)
    ];
    let pairsArray = [
        nerve.swap.pair(
            nerve.swap.token(2, 1),
            nerve.swap.token(5, 1),
            '8216932570', '815800089228'),
    ];
    let amounts = nerve.swap.getAmountsOut(amountIn, tokenPathArray, pairsArray);
    console.log(amounts, 1);
    let priceImpact = nerve.swap.getPriceImpact(amounts, tokenPathArray, pairsArray);
    console.log(priceImpact.toString(), 2);
}

// bestTradeExactInTest();
function bestTradeExactInTest() {
    let pairs = [
        nerve.swap.pair(
            nerve.swap.token(5, 3),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 3),
            '171132069136', '16887743'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 5),
            '171132069136', '16887743'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 3),
            nerve.swap.token(5, 5),
            '10000000000', '10000000'),
    ];
    let tokenAmountIn = nerve.swap.tokenAmount(5, 3, '2200000');
    let tokenOut = nerve.swap.token(5, 7);
    let maxPairSize = 4;
    let trade = nerve.swap.bestTradeExactIn(5, pairs, tokenAmountIn, tokenOut, maxPairSize);
    console.log(JSON.stringify(trade));
}

// bestTradeExactOutTest();
function bestTradeExactOutTest() {
    let pairs = [
        nerve.swap.pair(
            nerve.swap.token(5, 3),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 3),
            '171132069136', '16887743'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 5),
            '171132069136', '16887743'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 3),
            nerve.swap.token(5, 5),
            '10000000000', '10000000'),
    ];
    let tokenIn = nerve.swap.token(5, 3);
    let tokenAmountOut = nerve.swap.tokenAmount(5, 7, '6623084');
    let maxPairSize = 4;
    let trade = nerve.swap.bestTradeExactOut(5, pairs, tokenIn, tokenAmountOut, maxPairSize);
    console.log(JSON.stringify(trade));
}

// arraySliceTest();
function arraySliceTest() {
    let pairs = [
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 3),
            '171132069136', '16887743'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
    ];
    let subPairs = pairs.slice(0, 0);
    let s2 = pairs.slice(1, 2);
    subPairs = subPairs.concat(s2);
    console.log('aaaaa');
}

/**
 * 当交易路径大于等于3时，使用以下函数计算
 *
 * 根据买进数量，计算可卖出数量
 */
function getAmountsIn() {
    let amountOut = '333620';
    let tokenPathArray = [
        nerve.swap.token(5, 3),
        nerve.swap.token(5, 1),
        nerve.swap.token(5, 7)
    ];
    let pairsArray = [
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 3),
            '171132069136', '16887743'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
    ];
    console.log(nerve.swap.getAmountsIn(amountOut, tokenPathArray, pairsArray));
}

/**
 * 根据交易对中其中一个币种，计算另外一个币种可添加的流动性
 */
function quote() {
    let amountA = '596';
    let reserveA = '2222';
    let reserveB = '3355';
    let amountB = nerve.swap.quote(amountA, reserveA, reserveB);
    console.log('amountB: ' + amountB);
}

function tokenEquals() {
    console.log(nerve.swap.tokenEquals(nerve.swap.token(5, 1), nerve.swap.token(5, 2)), 'false');
    console.log(nerve.swap.tokenEquals(nerve.swap.token(5, 10), nerve.swap.token(5, 10)), 'true');
}

function pair() {
    console.log(nerve.swap.pair(
        nerve.swap.token(5, 1),
        nerve.swap.token(5, 3),
        '171132069136', '16887743'
    ), 'pair');
}

function getReserves() {
    let pair = nerve.swap.pair(
        nerve.swap.token(5, 1),
        nerve.swap.token(5, 3),
        '171132069136', '16887743'
    );
    console.log(nerve.swap.getReserves(nerve.swap.token(5, 1), nerve.swap.token(5, 3), pair));
    console.log(nerve.swap.getReserves(nerve.swap.token(5, 3), nerve.swap.token(5, 1), pair));
}

// divTest();
function divTest() {
    let x = new BigNumber(2);
    let y = new BigNumber(3);
    console.log(x.div(y).toFixed(18));
}