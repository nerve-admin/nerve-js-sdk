const BigNumber = require('bignumber.js');


module.exports = {
  instance(nu) {
    return new BigNumber(nu);
  },
  /**
   * 10的N 次方
   * @param arg
   * @returns {BigNumber}
   * @constructor
   */
  Power(arg) {
    let newPower = new BigNumber(10);
    return newPower.pow(arg);
  },

  /**
   * 加法
   * @param nu
   * @param arg
   * @returns {BigNumber}
   * @constructor
   */
  Plus(nu, arg) {
    let newPlus = new BigNumber(nu);
    return newPlus.plus(arg);
  },

  /**
   * 减法
   * @param nu
   * @param arg
   * @returns {BigNumber}
   * @constructor
   */
  Minus(nu, arg) {
    let newMinus = new BigNumber(nu);
    return newMinus.minus(arg);
  },

  isGreaterThan(a, b) {
    let _a = new BigNumber(a);
    return _a.isGreaterThan(b);
  },

  isLessThan(a, b) {
    let _a = new BigNumber(a);
    return _a.isLessThan(b);
  },

  /**
   * 乘法
   * @param nu
   * @param arg
   * @returns {BigNumber}
   * @constructor
   */
  Times(nu, arg) {
    let newTimes = new BigNumber(nu);
    return newTimes.times(arg);
  },

  /**
   * 除法
   * @param nu
   * @param arg
   * @returns {BigNumber}
   * @constructor
   */
  Division(nu, arg) {
    let newDiv = new BigNumber(nu);
    return newDiv.div(arg);
  },

  /**
   * 数字乘以精度系数
   */
  timesDecimals(nu, decimals) {
    let newInfo = sessionStorage.hasOwnProperty('info') ? JSON.parse(sessionStorage.getItem('info')) : '';
    let newDecimals = decimals ? decimals : newInfo.defaultAsset.decimals;
    if (decimals === 0) {
      return nu
    }
    let newNu = 0;
    if(newDecimals > 9 ){
      newNu = new BigNumber(Times(nu, Power(newDecimals))).toFormat().replace(/[,]/g, '');
    }else {
      newNu = new BigNumber(Times(nu, Power(newDecimals))).toString();
    }
    return newNu;
  },

  /**
   * 数字除以精度系数
   */
  divisionDecimals(nu, decimals = '') {
    let newInfo = sessionStorage.hasOwnProperty('info') ? JSON.parse(sessionStorage.getItem('info')) : '';
    let newDecimals = decimals ? decimals : newInfo.defaultAsset.decimals;
    if (decimals === 0) {
      return nu
    }
    let newNu = new BigNumber(Division(nu, Power(newDecimals)));
    return newNu.toFormat().replace(/[,]/g, '');
  },


  /**
   * 超长数字显示
   * @param nu
   * @param powerNu
   * @returns {string}
   */
  langNumber(nu, powerNu) {
    let newNu = new BigNumber(Division(nu, powerNu).toString());
    return newNu.toFormat().replace(/[,]/g, '');
  },


//转千分位
  toThousands(num = 0) {
    const N = num.toString().split('.');
    const int = N[0];
    const float = N[1] ? '.' + N[1] : '';
    return int.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + float;
  }
}



