const axios = require('axios');
const nerve = require('../../index');
axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * 封装post请求
 * Encapsulation post method
 * @param url
 * @param methodName
 * @param data
 * @returns {Promise}
 */
module.exports = {
  post(url, methodName, data = []) {
    return new Promise((resolve, reject) => {
      data.unshift(nerve.chainId());
      const params = {"jsonrpc": "2.0", "method": methodName, "params": data, "id": Math.floor(Math.random() * 1000)};
      axios.post(url, params)
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  },

  postComplete(url, methodName, data = []) {
    return new Promise((resolve, reject) => {
      const params = {"jsonrpc": "2.0", "method": methodName, "params": data, "id": Math.floor(Math.random() * 1000)};
      axios.post(url, params)
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  },

  postCompleteWithHeader(url, methodName, data = [], header = {}) {
    header['Content-Type'] = 'application/json';
    return new Promise((resolve, reject) => {
      const params = {"jsonrpc": "2.0", "method": methodName, "params": data, "id": Math.floor(Math.random() * 1000)};
      axios.post(url, params, {headers: header})
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  },

  postDirect(url, params = {}) {
    return new Promise((resolve, reject) => {
      axios.post(url, params)
          .then(response => {
            resolve(response.data)
          }, err => {
            reject(err)
          })
    })
  },

  get(url) {
    return new Promise((resolve, reject) => {
      axios.get(url)
          .then(response => {
            resolve(response.data)
          }, err => {
            reject(err)
          })
    })
  },
};
