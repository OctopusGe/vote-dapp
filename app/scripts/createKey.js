
var keythereum = require("keythereum");
// optional private key and initialization vector sizes in bytes
// (if params is not passed to create, keythereum.constants is used by default)
var params = { keyBytes: 32, ivBytes: 16 };

var password = "linjing";

// synchronous
var dk = keythereum.create(params);

var options = {
  kdf: "pbkdf2",
  cipher: "aes-128-ctr",
  kdfparams: {
    c: 262144,
    dklen: 32,
    prf: "hmac-sha256"
  }
};
// synchronous
var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
//keythereum.exportToFile(keyObject); //将密钥写入到当前js目录下的keystore目录下
console.log(keyObject); //控制台输出

console.log();


var fromkey = keythereum.importFromFile("0xe161814870b47a01b96d57f16029c06557fbedcf", "/Users/stone/geth-project/myDevChina2");
//recover输出为buffer类型的私钥
var privateKey = keythereum.recover('123', fromkey);
console.log(privateKey.toString('hex'));
//console.log(fromkey);



