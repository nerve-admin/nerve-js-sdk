
const {RPC_URL, Minus} = require('./htgConfig');
const ethers = require('ethers')
const CROSS_OUT_ABI = [
    "crossOut(string to, uint256 amount, address ERC20) public payable returns (bool)"
];
const ERC20_ABI = [
    "transfer(address to, uint value) external returns (bool)",
    "allowance(address owner, address spender) external view returns (uint256)",
    "approve(address spender, uint256 amount) external returns (bool)"
];

//验证交易参数
async function validate(provider, tx) {
    try {
        const result = await provider.call(tx)
        return ethers.utils.toUtf8String('0x' + result.substr(138));
    } catch (e) {
        return e.toString();
    }
}

async function sendTransaction(pri, provider, transactionParameters) {
    /* provider.listAccounts().then((accounts) => {

      console.log(accounts,'====accounts====');
    }); */
    const wallet = new ethers.Wallet(pri, provider);
    try {
        const tx = await wallet.sendTransaction(transactionParameters);
        if (tx.hash) {
            return {success: true, msg: tx.hash}
        }
    } catch (e) {
        return {success: false, msg: e}
    }
}

module.exports = {

    /**
     *获取provider
     * @param chain
     * @param isMetaMask
     */
    getProvider(chain, HTGNET) {
        if (chain === 'ETH') {
            //异构网络信息 测试网:ropsten, 主网:homestead
            if (HTGNET === 'test') {
                HTGNET = 'ropsten';
            } else if (HTGNET === 'main') {
                HTGNET = 'homestead';
            }
            return ethers.getDefaultProvider(HTGNET);
        } else {
            return new ethers.providers.JsonRpcProvider(RPC_URL[chain][HTGNET]);
        }
    },

    validateAddress(account) {
        try {
            ethers.utils.getAddress(account);
            return true;
        } catch (error) {
            console.error("地址校验失败: " + error)
        }
        return false;
    },

    /**
     *获取eth余额
     * @param ethers
     * @param provider
     * @param address
     */
    getEthBalance(provider, address) {
        let balancePromise = provider.getBalance(address);
        return balancePromise.then((balance) => {
            return ethers.utils.formatEther(balance)
        }).catch(e => {
            console.error('获取ETH余额失败' + e)
        });
    },

    /**
     * ERC20合约余额
     * @param provider
     * @param erc20BalanceAbiFragment
     * @param erc20Address ERC20合约地址
     * @param tokenDecimals token小数位数
     * @param address 账户
     */
    getERC20Balance(provider, erc20BalanceAbiFragment, erc20Address, tokenDecimals, address) {
        let contract = new ethers.Contract(erc20Address, erc20BalanceAbiFragment, provider);
        let balancePromise = contract.balanceOf(address);
        return balancePromise.then((balance) => {
            return ethers.utils.formatUnits(balance, tokenDecimals);
        }).catch(e => {
            console.error('获取ERC20余额失败' + e)
        });
    },

    /**
     * 获取ETH交易手续费
     * @param provider
     * @param gasLimit
     */
    getGasPrice(provider, gasLimit) {
        return provider.getGasPrice().then((gasPrice) => {
            return ethers.utils.formatEther(gasPrice.mul(gasLimit).toString()).toString();
        });
    },

    /**
     * 获取加速的手续费
     * @param provider
     * @param gasLimit
     */
    async getSpeedUpFee(provider, gasLimit) {
        const gasPrice = await getSpeedUpGasPrice(provider);
        return ethers.utils.formatEther(gasPrice.mul(gasLimit).toString()).toString();
    },

    /**
     * 加速 GasPrice
     * @param provider
     */
    getSpeedUpGasPrice(provider) {
        const GWEI_10 = ethers.utils.parseUnits('10', 9);
        return provider.getGasPrice().then((gasPrice) => {
            return gasPrice.add(GWEI_10);
        });
    },

    /**
     * 获取ETH 交易nonce
     * @param provider
     * @param address 钱包地址
     */
    getNonce(provider, address) {
        return provider.getTransactionCount(address).then((transactionCount) => {
            return transactionCount;
        });
    },

    getEthBlockNumber(provider) {
        let blockNumberPromise = provider.getBlockNumber();
        return blockNumberPromise.then((blockNumber) => {
            return blockNumber
        });
    },

    /**
     * 查询账户erc20资产是否需要授权额度
     * @param provider
     * @param contractAddress ERC20合约地址
     * @param multySignAddress 多签地址
     * @param fromAddress from地址
     */
    isNeedApprovedERC20(provider, contractAddress, multySignAddress, fromAddress) {
        const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
        const allowancePromise = contract.allowance(fromAddress, multySignAddress);
        return allowancePromise.then((allowance) => {
            const baseAllowance = '100000000000000000000000000000000000000000000000000000000000000000000000000000'
            // console.log(Minus(baseAllowance, allowance).toString())
            //已授权额度小于baseAllowance，则需要授权
            return Minus(baseAllowance, allowance) >= 0;
        }).catch(e => {
            console.error('获取erc20资产授权额度失败' + e)
            return true
        });
    },

    /**
     * 授权erc20额度
     * @param pri 账户私钥
     * @param fromAddress from地址
     * @param provider
     * @param contractAddress ERC20合约地址
     * @param multySignAddress 多签地址
     */
    async approveERC20(pri, fromAddress, provider, contractAddress, multySignAddress) {
        const iface = new ethers.utils.Interface(ERC20_ABI);
        const data = iface.functions.approve.encode([multySignAddress, new ethers.utils.BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')]);
        const transactionParameters = {
            to: contractAddress,
            from: fromAddress,
            value: '0x00',
            data: data,
        };
        const failed = await validate(provider, transactionParameters);
        if (failed) {
            console.error('failed approveERC20' + failed);
            return {success: false, msg: 'failed approveERC20' + failed}
        }
        delete transactionParameters.from   //etherjs 4.0 from参数无效 报错
        return sendTransaction(pri, provider, transactionParameters)
    },

    /**
     * 跨链转入ETH
     * @param pri 账户私钥
     * @param fromAddress from地址
     * @param provider
     * @param multySignAddress 多签地址
     * @param toAddress 接收地址(Nerve网络地址)
     * @param numbers 交易数量
     */
    async sendETH(pri, fromAddress, provider, multySignAddress, toAddress, numbers) {
        const amount = ethers.utils.parseEther(numbers);
        const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
        const data = iface.functions.crossOut.encode([toAddress, amount, '0x0000000000000000000000000000000000000000']);
        const transactionParameters = {
            from: fromAddress,
            to: multySignAddress,
            value: amount,
            data: data
        };
        const failed = await validate(provider, transactionParameters);
        if (failed) {
            console.error('failed approveERC20' + failed);
            return {success: false, msg: 'failed approveERC20' + failed}
        }
        delete transactionParameters.from
        return sendTransaction(pri, provider, transactionParameters)
    },

    /**
     * 跨链转入erc20资产
     * @param pri 账户私钥
     * @param fromAddress from地址
     * @param provider
     * @param contractAddress ERC20合约地址
     * @param multySignAddress 多签地址
     * @param toAddress 接收地址(Nerve网络地址)
     * @param decimals token精度
     * @param numbers 交易数量
     */
    async sendERC20(pri, fromAddress, provider, contractAddress, multySignAddress, toAddress, decimals, numbers) {
        const numberOfTokens = ethers.utils.parseUnits(numbers, decimals);
        const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
        const data = iface.functions.crossOut.encode([toAddress, numberOfTokens, contractAddress]);
        const transactionParameters = {
            to: multySignAddress,
            from: fromAddress, //验证合约调用需要from,必传
            value: '0x00',
            data: data
        };
        const failed = await validate(provider, transactionParameters);
        if (failed) {
            console.error('failed sendERC20' + failed);
            return {success: false, msg: 'failed sendERC20' + failed}
        }
        delete transactionParameters.from   //etherjs 4.0 from参数无效 报错
        return sendTransaction(pri, provider, transactionParameters)
    },

    async transferERC20(pri, fromAddress, provider, contractAddress, toAddress, decimals, numbers) {
        const numberOfTokens = ethers.utils.parseUnits(numbers, decimals);
        const iface = new ethers.utils.Interface(ERC20_ABI);
        const data = iface.functions.transfer.encode([toAddress, numberOfTokens]);
        const transactionParameters = {
            to: contractAddress,
            from: fromAddress, //验证合约调用需要from,必传
            value: '0x00',
            data: data
        };
        const failed = await validate(provider, transactionParameters);
        if (failed) {
            console.error('failed transferERC20' + failed);
            return {success: false, msg: 'failed transferERC20' + failed}
        }
        delete transactionParameters.from   //etherjs 4.0 from参数无效 报错
        const gasPrice = await getWithdrawGas(provider);
        transactionParameters.gasLimit = 150000;
        //todo 是否加速，是则乘以加速系数
        transactionParameters.gasPrice = gasPrice;
        return sendTransaction(pri, provider, transactionParameters)
    },

    /**
     * 提现默认手续费
     * @param provider
     * @param otherMainAssetCoin        手续费资产信息 eg. {chainId: 5, assetId: 1, decimals: 8}
     * @param otherMainAssetUSD         手续费资产的USDT价格
     * @param currentMainAssetUSD       当前提现异构链网络主资产的USDT价格
     * @param isToken   是否token资产
     */
    async calcOtherMainAssetOfWithdrawTest(provider, otherMainAssetCoin, otherMainAssetUSD, currentMainAssetUSD, isToken) {
        const gasPrice = await this.getWithdrawGas(provider);
        console.log(ethers.utils.formatUnits(gasPrice, 9), 'gasPrice');
        const result = this.calcOtherMainAssetOfWithdraw(otherMainAssetCoin, otherMainAssetUSD, gasPrice, currentMainAssetUSD, isToken);
        return result
    },

    async getWithdrawGas(provider) {
        return provider.getGasPrice().then((gasPrice) => {
            return gasPrice;
        });
    },

    /**
     * @param otherMainAssetCoin        手续费资产信息 eg. {chainId: 5, assetId: 1, decimals: 8}
     * @param otherMainAssetUSD         手续费资产的USDT价格
     * @param gasPrice                  当前异构网络的平均gas价格
     * @param currentMainAssetUSD       当前提现异构链网络主资产的USDT价格
     * @param isToken                   是否token资产
     */
    calcOtherMainAssetOfWithdraw(otherMainAssetCoin, otherMainAssetUSD, gasPrice, currentMainAssetUSD, isToken) {
        let gasLimit;
        if (isToken) {
            gasLimit = new ethers.utils.BigNumber('210000');
        } else {
            gasLimit = new ethers.utils.BigNumber('190000');
        }
        const otherMainAssetUSDBig = ethers.utils.parseUnits(otherMainAssetUSD.toString(), 6);
        const currentMainAssetUSDBig = ethers.utils.parseUnits(currentMainAssetUSD.toString(), 6);
        let result = currentMainAssetUSDBig.mul(gasPrice).mul(gasLimit).mul(ethers.utils.parseUnits('1', otherMainAssetCoin.decimals))
            .div(ethers.utils.parseUnits('1', 18))
            .div(otherMainAssetUSDBig);
        // 当NVT作为手续费时，向上取整
        if (otherMainAssetCoin.assetId === 1) {
            let numberStr = ethers.utils.formatUnits(result, otherMainAssetCoin.decimals);
            const ceil = Math.ceil(numberStr);
            result = ethers.utils.parseUnits(ceil.toString(), otherMainAssetCoin.decimals).toString();
        }
        return result;
    },

    calcOtherMainAssetOfWithdrawForTRX(otherMainAssetCoin, otherMainAssetUSD, currentMainAssetUSD, feeLimit) {
        const otherMainAssetUSDBig = ethers.utils.parseUnits(otherMainAssetUSD.toString(), 6);
        const currentMainAssetUSDBig = ethers.utils.parseUnits(currentMainAssetUSD.toString(), 6);
        let result = currentMainAssetUSDBig.mul(feeLimit).mul(ethers.utils.parseUnits('1', otherMainAssetCoin.decimals))
            .div(ethers.utils.parseUnits('1', 6))
            .div(otherMainAssetUSDBig);
        // 当NVT作为手续费时，向上取整
        if (otherMainAssetCoin.assetId === 1) {
            let numberStr = ethers.utils.formatUnits(result, otherMainAssetCoin.decimals);
            const ceil = Math.ceil(numberStr);
            result = ethers.utils.parseUnits(ceil.toString(), otherMainAssetCoin.decimals).toString();
        }
        return result;
    },

    async calcMainAssetOfWithdrawProtocol15Test(provider, isToken) {
        const gasPrice = await this.getWithdrawGas(provider);
        return this.calcMainAssetOfWithdrawProtocol15(gasPrice, isToken);
    },

    calcMainAssetOfWithdrawProtocol15(gasPrice, isToken) {
        let gasLimit;
        if (isToken) {
            gasLimit = new ethers.utils.BigNumber('210000');
        } else {
            gasLimit = new ethers.utils.BigNumber('190000');
        }
        return gasPrice.mul(gasLimit);
    },


    /**
     * 计算提现默认手续费--eth/bnb
     */
    async calDefaultETHOfWithdrawTest(provider, isToken) {
        // 获取当前以太坊网络的gasPrice
        const gasPrice = await getWithdrawGas(provider);
        const result = calDefaultETHOfWithdraw(gasPrice, isToken);
        return result
    },

    /**
     * @param gasPrice  当前异构网络的平均gas价格
     * @param isToken   是否token资产
     */
    calDefaultETHOfWithdraw(gasPrice, isToken) {
        let gasLimit;
        if (isToken) {
            gasLimit = new ethers.utils.BigNumber('210000');
        } else {
            gasLimit = new ethers.utils.BigNumber('190000');
        }
        const result = gasLimit.mul(gasPrice);
        const finalResult = ethers.utils.formatEther(result);
        // console.log('finalResult: ' + finalResult);
        return finalResult.toString();
    },

    /**
     * 根据异构网币种金额换算nvt金额
     * @param nvtUSD                            nvt的USDT价格
     * @param number                           异构链币种数量
     * @param heterogeneousChainUSD      异构链币种的USDT价格
     */
    calNvtByEth(nvtUSD, number, heterogeneousChainUSD) {
        let ethAmount = ethers.utils.parseEther(number);
        // console.log('ethAmount: ' + ethAmount.toString());
        let nvtUSDBig = ethers.utils.parseUnits(nvtUSD, 6);
        let ethUSDBig = ethers.utils.parseUnits(heterogeneousChainUSD, 6);
        let result = ethAmount.mul(ethUSDBig).div(ethers.utils.parseUnits(nvtUSDBig.toString(), 10));
        // console.log('result: ' + result.toString());
        // console.log('result format: ' + ethers.utils.formatUnits(result, 8));
        let numberStr = ethers.utils.formatUnits(result, 8).toString();
        let ceil = Math.ceil(numberStr);
        // console.log('ceil: ' + ceil);
        let finalResult = ethers.utils.parseUnits(ceil.toString(), 8);
        // console.log('finalResult: ' + finalResult);
        return finalResult.toString();
    },

    formatNVT(amount) {
        return ethers.utils.formatUnits(amount, 8).toString();
    },

    formatOtherMainAsset(amount, otherMainAssetCoin) {
        return ethers.utils.formatUnits(amount, otherMainAssetCoin.decimals).toString();
    }
}
