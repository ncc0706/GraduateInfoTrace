var crypto = require('crypto');

var algorithm = 'sha1';
var clearEncoding = 'utf8';
var cipherEncoding = 'base64';
//var cipherEncoding = 'hex';

hash = function(data) {
    var shasum = crypto.createHash(algorithm);
    shasum.update(data, clearEncoding);
    return shasum.digest(cipherEncoding);
}

exports.hash = hash;
