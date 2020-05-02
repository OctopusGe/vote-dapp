//import keythereum from "keythereum";


export default function getPrivateKey(address, password){
    var keythereum = require('../dist/keythereum');
    var fromkey = keythereum.importFromFile(address, "/Users/stone/geth-project/myDevChina2");
    //recover输出为buffer类型的私钥
    var privateKey = keythereum.recover(password, fromkey);
    console.log(privateKey.toString('hex'));
    return privateKey.toString('hex');
}



//getPrivateKey("0x6216f122c62af25e7109fbfc93e5d82da96bff61","123");

//const _getPrivateKey = getPrivateKey;
//export { _getPrivateKey as getPrivateKey };

// export{
//     getPrivateKey
// }