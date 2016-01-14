var crypto = require('crypto');

var algorithm = 'md5';
var clearEncoding = 'utf8';
var cipherEncoding = 'hex';

hash = function(data) {
    var md5sum = crypto.createHash(algorithm);
    md5sum.update(data, clearEncoding);
    return md5sum.digest(cipherEncoding);
}

exports.hash = hash;
