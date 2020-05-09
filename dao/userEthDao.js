const web3 = require("../utils/web3helper").getWeb3();
const fileUtil = require('../utils/fileUtil');
const path = require('path');
const config = require("../config/config");
const contractTool = require('../config/contractTool');

// 生成私钥、地址，部署并初始化一个新的合约，指定拥有者为此地址
function createAccount(callback) {
    // 生成私钥和地址
    let account = web3.eth.accounts.create();

    // encrypt 返回一个JSON 对象
    const keystoreJson = account.encrypt(pwd);

    // 将 JSON 对象转为字符串
    const keystoreStr = JSON.stringify(keystoreJson);

    // 生成随机文件存储 keystore 的字符串
    const randFilename = "UTC--" + new Date().toISOString() + "--" + account.address;

    // 设置存储文件的目录
    const filePath = path.join(__dirname, "../static/keystore/" + randFilename);

    // 将 keystore 的内容写入文件中
    fileUtil.writeFile(filePath, keystoreStr);

    // 部署合约
    let userContract = new web3.eth.Contract(contractTool.userContractAbi);
    userContract.deploy({
        data: contractTool.userByteCode,
        arguments: account.address
    }).send({
        from: contractTool.adminAddress,
        gas: 3000000
    }).then(function (newContractInstance) {
        let result = {                             // 成功部署和初始化
            privateKey: account.privateKey,
            ethAddress: account.address,
            contractAddr: newContractInstance.options.address,
            keystore: config.keystoreUrl + randFilename
        };
        console.log('合约部署成功');
        callback(1, result);
        // 初始化此合约一定的以太币
        web3.eth.sendTransaction({
            from: contractTool.adminAddress,
            to: newContractInstance.options.address,
            value: 20000000000000000000                 // 20ETH
        }).then(function () {
            // 初始化用户一定的以太币
            web3.eth.sendTransaction({
                from: contractTool.adminAddress,
                to: account.address,
                value: 20000000000000000000             // 20ETH
            }).then(function () {
                console.log('初始化以太币成功')
            }, function (err) {
                console.log('初始化以太币失败, 错误信息：' + err)
            })
        }, function (err) {
            console.log('初始化合约以太币失败, 错误信息：' + err)
        })
    }, function () {
        callback(0)
    })
}


// 由用户调用，获取用户链上基本信息
// ethAddress: 用户以太坊地址，contractAddr：用户的合约地址
function getUserInfo(ethAddress, contractAddr, callback) {
    let userContract = new web3.eth.Contract(contractTool.userContractAbi, contractAddr);

    userContract.methods.getUserInfo(ethAddress).call().then(function (result) {
        callback(1, result)
    }, function () {
        callback(0)
    });
}

// 由用户调用，上传数据
function firstVote(voteData, privateKey, contractAddr, callback) {
    let userContract = new web3.eth.Contract(contractTool.userContractAbi, contractAddr);

    // 通过私钥获得账户
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    // 构造一个原生交易
    let tx = {
        to: contractAddr,
        gasLimit: 546157,
        value: 0,
        data: userContract.methods.firstVote(voteData.voteAddress, voteData.owner, voteData.candidateList.map(x => web3.utils.asciiToHex(x)),
            web3.utils.asciiToHex(voteData.candidate),voteData.votes).encodeABI()  // 为指定的合约方法进行ABI编码
    };
    // 对原生交易进行签名并发送
    account.signTransaction(tx).then(function (result) {
        web3.eth.sendSignedTransaction(result.rawTransaction.toString('hex')).then(function () {
            callback(1)
        }, function () {
            callback(0)
        })
    }, function () {
        callback(0)
    })
}

// 由用户调用，上传数据
function addVoteData(voteData, privateKey, contractAddr, callback) {
    let userContract = new web3.eth.Contract(contractTool.userContractAbi, contractAddr);

    // 通过私钥获得账户
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    // 构造一个原生交易
    let tx = {
        to: contractAddr,
        gasLimit: 546157,
        value: 0,
        data: userContract.methods.addVoteData(voteData.voteAddress, web3.utils.asciiToHex(voteData.candidate),voteData.votes).encodeABI()  // 为指定的合约方法进行ABI编码
    };
    // 对原生交易进行签名并发送
    account.signTransaction(tx).then(function (result) {
        web3.eth.sendSignedTransaction(result.rawTransaction.toString('hex')).then(function () {
            callback(1)
        }, function () {
            callback(0)
        })
    }, function () {
        callback(0)
    })
}

// 是否已经投过票
function isVoted(ethAddress, voteAddress, contractAddr, callback) {
    let userContract = new web3.eth.Contract(contractTool.userContractAbi, contractAddr);

    userContract.methods.isVoted(ethAddress, voteAddress).call().then(function (result) {
        callback(1, result)
    }, function () {
        callback(0)
    });
}

// 获取投票数据
function getVoteData(ethAddress, voteAddress, contractAddr, callback) {
    let userContract = new web3.eth.Contract(contractTool.userContractAbi, contractAddr);

    userContract.methods.getVoteData(ethAddress, voteAddress).call().then(function (result) {
        callback(1, result)
    }, function () {
        callback(0)
    });
}

// 所有人调用（除管理员），由一个账户向另一个账户转一定的以太币
// senderPrivateKey：发送方私钥，receiverEthAddr：接收方以太坊地址，value：转账金额
function transfer(senderPrivateKey, receiverEthAddr, value, callback) {
    // 通过私钥获得账户
    var account = web3.eth.accounts.privateKeyToAccount(senderPrivateKey)
    // 构造一个原生交易
    var tx = {
        to: receiverEthAddr,
        gasLimit: 546157,
        value: value,
        data: ''
    }
    // 对原生交易进行签名并发送
    account.signTransaction(tx).then(function (result) {
        web3.eth.sendSignedTransaction(result.rawTransaction.toString('hex')).then(function () {
            callback(1)
        }, function () {
            callback(0)
        })
    }, function () {
        callback(0)
    })
}

// 所有人调用，获取账户余额
// ethAddress：要查看余额的以太坊地址
function getBalance(ethAddress, callback) {
    web3.eth.getBalance(ethAddress).then(function (result) {
        callback(1, result)
    }, function () {
        callback(0)
    })
}

module.exports = {
    createAccount,
    getUserInfo,
    firstVote,
    addVoteData,
    isVoted,
    getVoteData,
    transfer,
    getBalance
};