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
// getAmountOut();
function getAmountOut() {
    let amountIn = '3338955326';
    let reserveIn = '1998664399335';
    let reserveOut = '300774618024814914753';
    let amountOut = nerve.swap.getAmountOut(amountIn, reserveIn, reserveOut);
    console.log('amountOut: ' + amountOut);
}

/**
 * 根据买进数量，计算可卖出数量
 */
// getAmountIn();
function getAmountIn() {
    let amountOut = '3338955326';
    let reserveIn = '300774618024814914753';
    let reserveOut = '1998664399335';
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

// getPriceImpact();
function getPriceImpact() {
    console.log("exec [getPriceImpact]...");
    let amountIn = '1000000';
    let tokenPathArray = [
        nerve.swap.token(9, 1),
        nerve.swap.token(1, 1),
        nerve.swap.token(1, 81),
        nerve.swap.token(9, 220)

    ];
    let pairsArray = [
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(9, 1),
            '79004277894741', '1207858556439915'),
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(1, 81),
            '1086018144897', '283986472447021'),
        nerve.swap.pair(
            nerve.swap.token(1, 81),
            nerve.swap.token(9, 220),
            '100000000', '1000000000000000000'),
        nerve.swap.pair(
            nerve.swap.token(9, 1),
            nerve.swap.token(9, 220),
            '54542052289588', '13836674483460251861935'),
    ];
    let amounts = nerve.swap.getAmountsOut(amountIn, tokenPathArray, pairsArray);
    let priceImpact = nerve.swap.getPriceImpact(amounts, tokenPathArray, pairsArray);
    console.log(priceImpact.toFixed(), 'toFixed');
    console.log(priceImpact.toFormat(), 'toFormat');
}

// bestTradeExactInTest();
function bestTradeExactInTest() {
    console.log("exec [bestTradeExactInTest]...");
    let stableInfoArray;
    /*let stableInfoArray = [{
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
    }];*/
    let pairs = [
        /*nerve.swap.pair(
            nerve.swap.token(9, 1),
            nerve.swap.token(9, 220),
            '52224752005827', '14763892477263583354195'),
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(1, 146),
            '19113106412499', '2208031238227330865404540367'),
        nerve.swap.pair(
            nerve.swap.token(1, 146),
            nerve.swap.token(9, 1),
            '1240000000000000002636', '150000002'),
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(9, 1),
            '79252873416961', '1153409111343822'),*/
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(9, 1),
            '79004277894741', '1207858556439915'),
        nerve.swap.pair(
            nerve.swap.token(1, 1),
            nerve.swap.token(1, 81),
            '1086018144897', '283986472447021'),
        nerve.swap.pair(
            nerve.swap.token(1, 81),
            nerve.swap.token(9, 220),
            '100000000', '1000000000000000000'),
        // nerve.swap.pair(
        //     nerve.swap.token(9, 1),
        //     nerve.swap.token(9, 220),
        //     '54542052289588', '13836674483460251861935'),
    ];
    pairs = [nerve.swap.pair(
        nerve.swap.token(5, 1),
        nerve.swap.token(5, 42),
        '1998664399335', '300774618024814914753', '500'),];
    // 10:1 / 20:1 / 20:1 99999999999.003
    let tokenAmountIn = nerve.swap.tokenAmount(5, 1, '3333000000');
    let tokenOut = nerve.swap.token(5, 42);
    let maxPairSize = 3;
    let trade = nerve.swap.bestTradeExactIn(5, pairs, tokenAmountIn, tokenOut, maxPairSize, stableInfoArray);
    console.log(JSON.stringify(trade));
}

// bestTradeExactOutTest();
function bestTradeExactOutTest() {
    let stableInfoArray;
    // let stableInfoArray = [{
    //     "address": "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB",
    //     "lpToken": "5-102",
    //     "groupCoin": {
    //         "5-72": {
    //             "decimals": 18,
    //             "balance": "20002904580803663208296"
    //         },
    //         "5-73": {
    //             "decimals": 18,
    //             "balance": "19999095419196336791704"
    //         },
    //         "5-74": {
    //             "decimals": 6,
    //             "balance": "19999099898"
    //         }
    //     }
    // }];
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
    // pairs = [nerve.swap.pair(
    //     nerve.swap.token(5, 1),
    //     nerve.swap.token(5, 42),
    //     '1998664399335', '300774618024814914753', '500'),];
    let tokenIn = nerve.swap.token(5, 5);
    let tokenAmountOut = nerve.swap.tokenAmount(5, 1, '3333000000');
    let maxPairSize = 3;
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
    let a = 0;
    console.log(typeof a === 'undefined');
    console.log(typeof a);
    console.log(typeof (typeof a));
    let b;
    console.log(typeof b === 'undefined');
    console.log(typeof b);
    console.log(typeof (typeof b));
    let one = new BigNumber(1);
    let x = new BigNumber(3);
    let y = new BigNumber(1000);
    let z = x.div(y);
    console.log(one.minus(z));
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
    let pri = '';
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
        // 查找最优路径: 使用 tokenFirst, tokenOut 资产去查找最优路径，可能得到 [tokenFirst, tokenOut] or [tokenFirst, ..., tokenOut]
        // 计算出的路径在路径首位加入实际的tokenIn，得到 [tokenIn, tokenFirst, tokenOut] or [tokenIn, tokenFirst, ..., tokenOut]
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

// swapTradeStableRemoveLpTest();
/**
 0. 假设swap交易: `tokenA`兑换`tokenB`
 1. 检查`tokenB`是否为稳定币池中的token
 2. 若是(result.success=true)，则把`tokenB`替换为`result.lpToken`
 3. 使用现有方式查找最优路径
 4. 页面上显示 tokenA-> ... -> result.lpToken -> tokenB
 5. 交易组装调用此函数: nerve.swap.swapTradeStableRemoveLp
 5.1 tokenPath 为 [tokenA, ..., result.lpToken]
 5.2 增加targetToken参数，此处为 `tokenB`
 */
async function swapTradeStableRemoveLpTest() {
    // 账户信息
    let fromAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";
    let pri = '';
    let amountIn = "2000000000000000000"; // 卖出的资产数量
    let amountOutMin = "0";// 最小买进的资产数量
    let feeTo = null;// 交易手续费取出一部分给指定的接收地址
    let deadline = nerve.swap.currentTime() + 300;// 过期时间
    let toAddress = "TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA";// 资产接收地址
    let remark = 'swap trade stable remove lp remark...';
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
    let tokenIn = nerve.swap.token(5, 1);
    let tokenOut = nerve.swap.token(5, 90);
    let check = nerve.swap.checkStableToken(tokenOut, stableInfoArray);
    if (check.success) {
        let tokenLast = check.lpToken;
        let stablePairAddress = check.address;// 稳定币交易对地址
        // 查找最优路径: 使用 tokenIn, tokenLast 资产去查找最优路径，可能得到 [tokenIn, tokenLast] or [tokenIn, ..., tokenLast]
        let tokenPath = [tokenIn, tokenLast];// 币币交换资产路径，路径中最后一个资产，是用户要买进的资产
        let tx = await nerve.swap.swapTradeStableRemoveLp(fromAddress, amountIn, tokenPath, amountOutMin,
            feeTo, deadline, toAddress, tokenOut, remark);
        console.log('Swap交易聚合稳定币撤销流动性交易');
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

let stablePairInfo = {
    "address": "TNVTdTSQoL9quSyGJCA9sY8pcMEVy4RN4EjbB",
    "tokenLP": {
        "assetChainId": 5,
        "assetId": 102,
        "name": "USDTN",
        "symbol": "USDTN",
        "decimals": 18
    },
    "coins": [
        {
            "assetChainId": 5,
            "assetId": 7,
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 6
        },
        {
            "assetChainId": 5,
            "assetId": 72,
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 18
        },
        {
            "assetChainId": 5,
            "assetId": 73,
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 18
        },
        {
            "assetChainId": 5,
            "assetId": 74,
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 18
        },
        {
            "assetChainId": 5,
            "assetId": 90,
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 6
        },
        {
            "assetChainId": 2,
            "assetId": 144,
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 18
        }
    ],
    "totalLP": "242624559880418148907617",
    "balances": [
        "20472632410",
        "186440810665380453160712",
        "13337326273624497142272",
        "0",
        "34035",
        "22373756507916810880374"
    ],
};

// stableSwapAddLiquidityMinReceiveTest();
// 计算用户添加稳定币流动性获取的LP资产
function calcStableSwapAddLiquidityMinReceiveTest() {
    // 添加的资产数量
    let tokenAmountIn = {
        chainId: 5,
        assetId: 72,
        amount: '222123456789123456789',
        decimals: 18
    };
    let minReceive = nerve.swap.calcStableSwapAddLiquidityMinReceive(stablePairInfo, tokenAmountIn);
    console.log(minReceive, 'minReceive');
}

calcStableSwapRemoveLiquidityMinReceiveTest();
// 计算用户移除稳定币流动性LP资产获取的资产
function calcStableSwapRemoveLiquidityMinReceiveTest() {
    // 移除的LP资产
    let tokenAmountLP = {
        chainId: 5,
        assetId: 102,
        amount: '31030165533002692',
        decimals: 18
    };
    // 31030165534473932
    // 31030165533002692
    // 指定接收的资产
    let receiveIndex = 5;
    let minReceive = nerve.swap.calcStableSwapRemoveLiquidityMinReceive(stablePairInfo, tokenAmountLP, receiveIndex);
    console.log(minReceive, 'minReceive');
}

// calcStableSwapMinReceiveTest();
// 计算用户稳定币兑换获取的资产
function calcStableSwapMinReceiveTest() {
    // 卖出的资产
    let tokenAmountIn = {
        chainId: 5,
        assetId: 72,
        amount: '222123456789123456789',
        decimals: 18
    };
    // 指定兑换的资产
    let tokenOutIndex = 3;
    let minReceive = nerve.swap.calcStableSwapMinReceive(stablePairInfo, tokenAmountIn, tokenOutIndex);
    console.log(minReceive, 'minReceive');
}

