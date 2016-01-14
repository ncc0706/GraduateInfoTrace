var crypto = require('crypto');

var algorithm = 'aes-128-ecb';
var clearEncoding = 'utf8';
var cipherEncoding = 'base64';

cipher = function(data, key) {
    var cipher = crypto.createCipher(algorithm, key);
    cipher.update(data, clearEncoding);
    return cipher.final(cipherEncoding);
};

decipher = function(data, key) {
    var decipher = crypto.createDecipher(algorithm, key);
    decipher.update(data, cipherEncoding);
    return decipher.final(clearEncoding);
};

exports.cipher = cipher;
exports.decipher = decipher;
