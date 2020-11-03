"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var EC = require("elliptic").ec;

var ec = new EC("secp256k1");
var browserCrypto = global.crypto || global.msCrypto || {};
var subtle = browserCrypto.subtle || browserCrypto.webkitSubtle;

var nodeCrypto = require('crypto');

var promise = typeof Promise === "undefined" ? require("es6-promise").Promise : Promise;
var iv = Buffer.from("00000000000000000000000000000000", "hex");
var EC_GROUP_ORDER = Buffer.from('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex');
var ZERO32 = Buffer.alloc(32, 0);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function isScalar(x) {
  return Buffer.isBuffer(x) && x.length === 32;
}

function isValidPrivateKey(privateKey) {
  if (!isScalar(privateKey)) {
    return false;
  }

  return privateKey.compare(ZERO32) > 0 && // > 0
  privateKey.compare(EC_GROUP_ORDER) < 0; // < G
} // Compare two buffers in constant time to prevent timing attacks.


function equalConstTime(b1, b2) {
  if (b1.length !== b2.length) {
    return false;
  }

  var res = 0;

  for (var i = 0; i < b1.length; i++) {
    res |= b1[i] ^ b2[i]; // jshint ignore:line
  }

  return res === 0;
}
/* This must check if we're in the browser or
not, since the functions are different and does
not convert using browserify */


function randomBytes(size) {
  var arr = new Uint8Array(size);

  if (typeof window === 'undefined') {
    return Buffer.from(nodeCrypto.randomBytes(size));
  } else {
    browserCrypto.getRandomValues(arr);
  }

  return Buffer.from(arr);
}

function sha512(msg) {
  return new promise(function (resolve) {
    var hash = nodeCrypto.createHash('sha512');
    var result = hash.update(msg).digest();
    resolve(new Uint8Array(result));
  });
}

;

function getAes(op) {
  return function (iv, key, data) {
    return new promise(function (resolve) {
      if (subtle) {
        // console.info("dao aes subtle");
        var importAlgorithm = {
          name: "AES-CBC"
        };
        var keyp = subtle.importKey("raw", key, importAlgorithm, false, [op]);
        return keyp.then(function (cryptoKey) {
          var encAlgorithm = {
            name: "AES-CBC",
            iv: iv
          };
          return subtle[op](encAlgorithm, cryptoKey, data);
        }).then(function (result) {
          resolve(Buffer.from(new Uint8Array(result)));
        });
      } else {
        if (op === 'encrypt') {
          var cipher = nodeCrypto.createCipheriv('aes-256-cbc', key, iv);
          cipher.update(data);
          resolve(cipher["final"]());
        } else if (op === 'decrypt') {
          var decipher = nodeCrypto.createDecipheriv('aes-256-cbc', key, iv);
          decipher.update(data);
          resolve(decipher["final"]());
        }
      }
    });
  };
}

var aesCbcEncrypt = getAes("encrypt");
var aesCbcDecrypt = getAes("decrypt");

function hmacSha256Sign(key, msg) {
  return new promise(function (resolve) {
    var hmac = nodeCrypto.createHmac('sha256', Buffer.from(key));
    hmac.update(msg);
    var result = hmac.digest();
    resolve(result);
  });
}

;

function hmacSha256Verify(key, msg, sig) {
  return new promise(function (resolve) {
    var hmac = nodeCrypto.createHmac('sha256', Buffer.from(key));
    hmac.update(msg);
    var expectedSig = hmac.digest();
    resolve(equalConstTime(expectedSig, sig));
  });
}
/**
 * Generate a new valid private key. Will use the window.crypto or window.msCrypto as source
 * depending on your browser.
 * @return {Buffer} A 32-byte private key.
 * @function
 */


exports.generatePrivate = function () {
  var privateKey = randomBytes(32);

  while (!isValidPrivateKey(privateKey)) {
    privateKey = randomBytes(32);
  }

  return privateKey;
};

var getPublic = exports.getPublic = function (privateKey) {
  // This function has sync API so we throw an error immediately.
  assert(privateKey.length === 32, "Bad private key");
  assert(isValidPrivateKey(privateKey), "Bad private key"); // XXX(Kagami): `elliptic.utils.encode` returns array for every
  // encoding except `hex`.

  return Buffer.from(ec.keyFromPrivate(privateKey).getPublic("arr"));
};
/**
 * Get compressed version of public key.
 */


var getPublicCompressed = exports.getPublicCompressed = function (privateKey) {
  // jshint ignore:line
  assert(privateKey.length === 32, "Bad private key");
  assert(isValidPrivateKey(privateKey), "Bad private key"); // See https://github.com/wanderer/secp256k1-node/issues/46

  var compressed = true;
  return Buffer.from(ec.keyFromPrivate(privateKey).getPublic(compressed, "arr"));
}; // NOTE(Kagami): We don't use promise shim in Browser implementation
// because it's supported natively in new browsers (see
// <http://caniuse.com/#feat=promises>) and we can use only new browsers
// because of the WebCryptoAPI (see
// <http://caniuse.com/#feat=cryptography>).


exports.sign = function (privateKey, msg) {
  return new promise(function (resolve) {
    assert(privateKey.length === 32, "Bad private key");
    assert(isValidPrivateKey(privateKey), "Bad private key");
    assert(msg.length > 0, "Message should not be empty");
    assert(msg.length <= 32, "Message is too long");
    resolve(Buffer.from(ec.sign(msg, privateKey, {
      canonical: true
    }).toDER()));
  });
};

exports.verify = function (publicKey, msg, sig) {
  return new promise(function (resolve, reject) {
    assert(publicKey.length === 65 || publicKey.length === 33, "Bad public key");

    if (publicKey.length === 65) {
      assert(publicKey[0] === 4, "Bad public key");
    }

    if (publicKey.length === 33) {
      assert(publicKey[0] === 2 || publicKey[0] === 3, "Bad public key");
    }

    assert(msg.length > 0, "Message should not be empty");
    assert(msg.length <= 32, "Message is too long");

    if (ec.verify(msg, sig, publicKey)) {
      resolve(null);
    } else {
      reject(new Error("Bad signature"));
    }
  });
};

var derive = function derive(privateKeyA, publicKeyB) {
  return new promise(function (resolve) {
    assert(Buffer.isBuffer(privateKeyA), "Bad private key");
    assert(Buffer.isBuffer(publicKeyB), "Bad public key");
    assert(privateKeyA.length === 32, "Bad private key");
    assert(isValidPrivateKey(privateKeyA), "Bad private key");
    assert(publicKeyB.length === 65 || publicKeyB.length === 33, "Bad public key");

    if (publicKeyB.length === 65) {
      assert(publicKeyB[0] === 4, "Bad public key");
    }

    if (publicKeyB.length === 33) {
      assert(publicKeyB[0] === 2 || publicKeyB[0] === 3, "Bad public key");
    }

    var keyA = ec.keyFromPrivate(privateKeyA);
    var keyB = ec.keyFromPublic(publicKeyB);
    var Px = keyA.derive(keyB.getPublic()); // BN instance

    resolve(Buffer.from(Px.toArray()));
  });
};

exports.encrypt = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(publicKeyTo, msg) {
    var ephemPrivateKey, ephemPublicKey, Px, hash, encryptionKey, macKey, ciphertext, dataToMac, mac;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            assert(subtle, "WebCryptoAPI is not available");
            ephemPrivateKey = randomBytes(32);

            while (!isValidPrivateKey(ephemPrivateKey)) {
              ephemPrivateKey = randomBytes(32);
            }

            ephemPublicKey = getPublic(ephemPrivateKey);
            _context.next = 6;
            return derive(ephemPrivateKey, publicKeyTo);

          case 6:
            Px = _context.sent;
            _context.next = 9;
            return sha512(Px);

          case 9:
            hash = _context.sent;
            encryptionKey = hash.slice(0, 32);
            macKey = hash.slice(32);
            _context.next = 14;
            return aesCbcEncrypt(iv, encryptionKey, msg);

          case 14:
            ciphertext = _context.sent;
            dataToMac = Buffer.concat([iv, ephemPublicKey, ciphertext]);
            _context.next = 18;
            return hmacSha256Sign(macKey, dataToMac);

          case 18:
            mac = _context.sent;
            return _context.abrupt("return", Buffer.concat([ephemPublicKey, iv, ciphertext, mac]));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.decrypt = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(privateKey, encrypted) {
    var metaLength, ephemPublicKey, cipherTextLength, iv, ciphertext, msgMac, Px, hash, encryptionKey, macKey, dataToMac, macGood, msg;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            assert(subtle, "WebCryptoAPI is not available");
            metaLength = 1 + 64 + 16 + 32;
            assert(encrypted.length > metaLength, "Invalid Ciphertext. Data is too small");
            assert(encrypted[0] >= 2 && encrypted[0] <= 4, "Not valid ciphertext."); // deserialise

            ephemPublicKey = encrypted.slice(0, 65);
            cipherTextLength = encrypted.length - metaLength;
            iv = encrypted.slice(65, 65 + 16);
            ciphertext = encrypted.slice(65 + 16, 65 + 16 + cipherTextLength);
            msgMac = encrypted.slice(65 + 16 + cipherTextLength);
            _context2.next = 11;
            return derive(privateKey, ephemPublicKey);

          case 11:
            Px = _context2.sent;
            _context2.next = 14;
            return sha512(Px);

          case 14:
            hash = _context2.sent;
            encryptionKey = hash.slice(0, 32);
            macKey = hash.slice(32);
            dataToMac = Buffer.concat([iv, ephemPublicKey, ciphertext]);
            _context2.next = 20;
            return hmacSha256Verify(macKey, dataToMac, msgMac);

          case 20:
            macGood = _context2.sent;
            assert(macGood, "Bad MAC");
            _context2.next = 24;
            return aesCbcDecrypt(iv, encryptionKey, ciphertext);

          case 24:
            msg = _context2.sent;
            return _context2.abrupt("return", Buffer.from(new Uint8Array(msg)));

          case 26:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();