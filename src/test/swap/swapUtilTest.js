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
// getAmountsOut();
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

getPriceImpact();
function getPriceImpact() {
    let amountIn = '100000000';
    let tokenPathArray = [
        nerve.swap.token(1, 81),
        nerve.swap.token(1, 1)
    ];
    let pairsArray = [
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(1, 81),
            '876723911218', '348367101072254'),
    ];
    let amounts = nerve.swap.getAmountsOut(amountIn, tokenPathArray, pairsArray);
    let priceImpact = nerve.swap.getPriceImpact(amounts, tokenPathArray, pairsArray);
    console.log(priceImpact.toFixed(), 'toFixed');
    console.log(priceImpact.toFormat(), 'toFormat');
}

// bestTradeExactInTest();
function bestTradeExactInTest() {
    let stableInfoArray = [{
        "address": "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB",
        "lpToken": "5-102",
        "groupCoin": {
            "5-72": {
                "decimals": 18,
                "balance": "20002904580803663208296"
            },
            "5-73": {
                "decimals": 18,
                "balance": "19999095419196336791704"
            },
            "5-74": {
                "decimals": 6,
                "balance": "19999099898"
            }
        }
    }];
    let pairs = [
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 72),
            '10000000000', '10000000000000000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 73),
            '20000000000', '10000000000000000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 74),
            '20000000000000', '10000000000'),
    ];
    // 10:1 / 20:1 / 20:1
    let tokenAmountIn = nerve.swap.tokenAmount(5, 1, '1000000000');
    let tokenOut = nerve.swap.token(5, 5);
    let maxPairSize = 4;
    let trade = nerve.swap.bestTradeExactIn(5, pairs, tokenAmountIn, tokenOut, maxPairSize, stableInfoArray);
    console.log(JSON.stringify(trade));
}

// bestTradeExactOutTest();
function bestTradeExactOutTest() {
    let stableInfoArray = [{
        "address": "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB",
        "lpToken": "5-102",
        "groupCoin": {
            "5-72": {
                "decimals": 18,
                "balance": "20002904580803663208296"
            },
            "5-73": {
                "decimals": 18,
                "balance": "19999095419196336791704"
            },
            "5-74": {
                "decimals": 6,
                "balance": "19999099898"
            }
        }
    }];
    let pairs = [
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 72),
            '10000000000', '10000000000000000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 73),
            '20000000000', '10000000000000000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 74),
            '20000000000000', '10000000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 3),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 3),
            '17113206913684', '1688774384'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 1),
            nerve.swap.token(5, 5),
            '1711320691', '168877'),
        nerve.swap.pair(
            nerve.swap.token(5, 5),
            nerve.swap.token(5, 7),
            '10000000000', '10000000'),
        nerve.swap.pair(
            nerve.swap.token(5, 3),
            nerve.swap.token(5, 5),
            '10000000000', '10000000'),
    ];
    let tokenIn = nerve.swap.token(5, 1);
    let tokenAmountOut = nerve.swap.tokenAmount(5, 5, '6623084');
    let maxPairSize = 4;
    let trade = nerve.swap.bestTradeExactOut(5, pairs, tokenIn, tokenAmountOut, maxPairSize, stableInfoArray);
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

// stableLpSwapTradeTest();
/**
 0. 假设swap交易: `tokenA`兑换`tokenB`
 1. 检查`tokenA`是否为稳定币池中的token
 2. 若是(result.success=true)，则把`tokenA`替换为`result.lpToken`
 3. 使用现有方式查找最优路径
 4. 页面上显示 tokenA-> result.lpToken -> ... -> tokenB
 5. 交易组装调用此函数: nerve.swap.stableLpSwapTrade
     5.1 比swapTrade多出一个stablePairAddrss, 使用result.address填入
     5.2 tokenPath 更换为 [tokenA, result.lpToken, ..., tokenB]
 */
async function stableLpSwapTradeTest() {
    // 账户信息
    let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    let pri = '4594348E3482B751AA235B8E580EFEF69DB465B3A291C5662CEDA6459ED12E39';
    let amountIn = "2000000000000000000"; // 卖出的资产数量
    let amountOutMin = "0";// 最小买进的资产数量
    let feeTo = null;// 交易手续费取出一部分给指定的接收地址
    let deadline = nerve.swap.currentTime() + 300;// 过期时间
    let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";// 资产接收地址
    let remark = 'stable lp swap trade remark...';

    let stableInfoArray = [
        {
            "address": "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB",
            "lpToken": "5-102",
            "groupCoin": {
                "5-90": 1,
                "5-72": 1,
                "5-73": 1,
                "5-74": 1,
                "5-7": 1
            }
        }
    ];
    let tokenIn = nerve.swap.token(5, 90);
    let tokenOut = nerve.swap.token(5, 1);
    let check = nerve.swap.checkStableToken(tokenIn, stableInfoArray);
    if (check.success) {
        let tokenFirst = check.lpToken;
        let stablePairAddress = check.address;// 稳定币交易对地址
        let tokenPath = [tokenIn, tokenFirst, tokenOut];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
        let tx = await nerve.swap.stableLpSwapTrade(fromAddress, stablePairAddress, amountIn, tokenPath, amountOutMin,
            feeTo, deadline, toAddress, remark);
        console.log('稳定币兑换Swap');
        console.log('hash: ' + tx.hash);
        console.log('hex: ' + tx.hex);
    } else {
        let tokenPath = [tokenIn, tokenOut];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
        let tx = await nerve.swap.swapTrade(fromAddress, amountIn, tokenPath, amountOutMin,
            feeTo, deadline, toAddress, remark);
        console.log('普通Swap');
        console.log('hash: ' + tx.hash);
        console.log('hex: ' + tx.hex);
    }
}
