var aes = require('./myaes');
var sha1 = require('./mysha1');
var md5 = require('./mymd5');


exports.cipheraes = aes.cipher;
exports.decipheraes = aes.decipher;

exports.hashsha1 = sha1.hash;

exports.hashmd5 = md5.hash;