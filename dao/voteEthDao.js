const web3 = require("../utils/web3helper").getWeb3();
const contractTool = require('../config/contractTool');

// 部署并初始化一个新的投票合约，指定拥有者地址
function createVote(voteInfo, adminPrivateKey, callback) {
    // 部署合约
    let voteContract = new web3.eth.Contract(contractTool.voteContractAbi);

    voteContract.deploy({
        data: contractTool.voteByteCode,
        arguments: [voteInfo.ownerAddress, voteInfo.proposal, voteInfo.voteType, voteInfo.totalTokens,
                    voteInfo.tokenPrice, voteInfo.candidates.map(x => web3.utils.asciiToHex(x)), parseInt(voteInfo.startTime/1000),
                    parseInt(voteInfo.endTime/1000)]    // 指定合约的参数
    }).send({
        //from: contractTool.adminAddress,
        from: "0x3d2d3eded3edaaac0aaa8b75b7bc18647fb3c644",
        gas: 3000000
    }).then(function (newContractInstance) {    // 成功部署和初始化
        let contractAddr = newContractInstance.options.address;
        console.log('合约部署成功');
        // 初始化此合约一定的以太币
        let tx = {
            to: contractAddr,
            value: 20000000000000000000,              // 20ETH
            gas: 6546157
        };

        let adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

        // 初始化合约以太币，对原生交易进行签名并发送
        adminAccount.signTransaction(tx).then(function (result) {
            web3.eth.sendSignedTransaction(result.rawTransaction.toString('hex')).then(function () {
                console.log("初始化投票合约以太币成功");
                callback(1, contractAddr);
            }, function (msg) {
                console.log(msg);
                callback(0)
            })
        }, function (msg) {
            console.log(msg);
            callback(0)
        });

        // web3.eth.sendTransaction({
        //     from: contractTool.adminAddress,
        //     to: newContractInstance.options.address,
        //     value: 20000000000000000000                 // 20ETH
        // })
    }, function (result1) {
        console.log(result1);
        callback(0)
    })
}

// 获取投票链上基本信息
// contractAddr：投票合约地址
function getVoteInfo(voteType, contractAddr, callback) {
    let voteContract = new web3.eth.Contract(contractTool.voteContractAbi, contractAddr);
    // 简单投票和每日投票信息
    if (voteType === 1 || voteType === 2) {
        voteContract.methods.getVoteInfo().call().then(function (result) {
            callback(1, result)
        }, function () {
            callback(0)
        });
    }
    // token投票信息
    if (voteType === 3) {
        voteContract.methods.getTokenVoteInfo().call().then(function (result) {
            callback(1, result)
        }, function () {
            callback(0)
        });
    }
}


// 由用户调用，添加投票数据
function addVoteData(voteDate, privateKey, contractAddr, callback) {
    let voteContract = new web3.eth.Contract(contractTool.userContractAbi, contractAddr);

    // 通过私钥获得账户
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    // 构造一个原生交易
    let tx = {};
    // 简单投票（每人一票）
    if (voteDate.voteType === 1) {
        tx = {
            to: contractAddr,
            gasLimit: 546157,
            value: 0,
            data: voteContract.methods.simpleVoteForCandidate(web3.utils.asciiToHex(voteDate.candidate)).encodeABI()  // 为指定的合约方法进行ABI编码
        };
    }
    // token投票
    if (voteDate.voteType === 2) {
        tx = {
            to: contractAddr,
            gasLimit: 546157,
            value: 0,
            data: voteContract.methods.tokenVoteForCandidate(web3.utils.asciiToHex(voteDate.candidate), voteDate.votesInTokens).encodeABI()  // 为指定的合约方法进行ABI编码
        };
    }
    // 每日投票（一人一天一票）
    if (voteDate.voteType === 3) {
        tx = {
            to: contractAddr,
            gasLimit: 546157,
            value: 0,
            data: voteContract.methods.dailyVoteForCandidate(web3.utils.asciiToHex(voteDate.candidate)).encodeABI()  // 为指定的合约方法进行ABI编码
        };
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

// 购买token，仅供token投票项目使用
function buyTokens(tokenValue, privateKey, contractAddr, callback) {
    let voteContract = new web3.eth.Contract(contractTool.voteContractAbi, contractAddr);

    // 通过私钥获得账户
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // 构造一个原生交易
    let tx = {
        to: contractAddr,
        gasLimit: 546157,
        value: web3.utils.toWei(tokenValue.toString(), 'ether'),
        data: voteContract.methods.buyTokens().encodeABI()  // 为指定的合约方法进行ABI编码
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
    });
}

// 获取单个候选人的得票信息
// candidate: 候选人，contractAddr：投票合约地址
// function getCandidateVotes(candidate, contractAddr, callback) {
//     let voteContract = new web3.eth.Contract(contractTool.voteContractAbi, contractAddr);
//
//     voteContract.methods.getCandidateVotes(web3.utils.asciiToHex(candidate)).call().then(function (result) {
//         callback(1, result)
//     }, function () {
//         callback(0)
//     });
// }

// 获取所有候选人的得票信息
// contractAddr：投票合约地址
function getAllCandidateVotes(contractAddr, callback) {
    let voteContract = new web3.eth.Contract(contractTool.voteContractAbi, contractAddr);

    voteContract.methods.getAllCandidateVotes().call().then(function (result) {
        callback(1, result)
    }, function () {
        callback(0)
    });
}

// 获取单个人的投票信息
// ethAddress: 以太坊地址，contractAddr：投票合约地址
function getVoterDetails(ethAddress, contractAddr, voteType, callback) {
    let voteContract = new web3.eth.Contract(contractTool.voteContractAbi, contractAddr);

    if (voteType === 1 || voteType === 3) {
        voteContract.methods.getVoterDetails(ethAddress).call().then(function (result) {
            callback(1, result)
        }, function () {
            callback(0)
        });
    }
    if (voteType === 2) {
        voteContract.methods.getTokenVoterDetails(ethAddress).call().then(function (result) {
            callback(1, result)
        }, function () {
            callback(0)
        });
    }
}

module.exports = {
    createVote,
    getVoteInfo,
    addVoteData,
    buyTokens,
    getAllCandidateVotes,
    getVoterDetails
    // transferToUser,
    // transfer,
    // getBalance
};
