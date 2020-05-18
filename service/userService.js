var dao = require('../dao');
var createToken = require('../middleware/createToken');

var BigNumber = require("bignumber.js");
var dateUtil = require('../utils/dateUtil');

var obj = {
    _code: '',
    _msg: '',
    _data: {}
};

// 用户登录
function login(req, callback) {
    if (req.body && req.body.account && req.body.password) {
        dao.userDao.findByAccount(req.body.account, function (status, result) {
            // 验证登录
            if (1 === status && result[0] && result[0].password === req.body.password) {
                obj._code = '200';
                obj._msg = '登录成功';
                obj._data = {};
                obj._data.token = createToken({id: result[0].id, ethAddress: result[0].ethAddress, type: 'user'});
                delete result[0].privateKey;
                delete result[0].password;
                delete result[0].contractAddr;
                delete result[0].createTime;
                //delete result[0].voteCount;
                //delete result[0].myVoteCount;
                //delete result[0].lastVoteTime;
                //delete result[0].lastCreateVoteTime;
                obj._data.userInfo = result[0];
                console.log(obj._data.token);
                callback(obj)
            } else {
                obj._code = '201';
                obj._msg = '登录失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '登录失败';
        obj._data = {};
        callback(obj)
    }
}

// 用户注册
function register(req, callback) {
    if (req.body && req.body.account && req.body.password) {
        // 判定账户是否已存在
        dao.userDao.findByAccountList([req.body.account, "admin"], function (status, result) {
            if (1 === status && result.length === 1) {
                console.log("==============");
                console.log(result[0]);
                // 生成私钥、地址、初始化智能合约
                dao.userEthDao.createAccount(req.body.password, result[0].privateKey, function (status, result) {
                    //console.log(result);
                    //console.log();
                    //console.log("status2:" + status);
                    if (1 === status) {
                        req.body.privateKey = result.privateKey;
                        req.body.ethAddress = result.ethAddress;
                        req.body.contractAddr = result.contractAddr;
                        req.body.createTime = dateUtil.format(new Date(), "-");
                        dao.userDao.insert(req.body, function (status) {
                            if (1 === status) {
                                obj._code = '200';
                                obj._msg = '注册成功';
                                obj._data = {};
                                callback(obj)
                            } else {
                                obj._code = '201';
                                obj._msg = '注册失败';
                                obj._data = {};
                                callback(obj)
                            }
                        })
                    } else {
                        obj._code = '201';
                        obj._msg = '注册失败';
                        obj._data = {};
                        callback(obj)
                    }
                })
            } else {
                obj._code = '201';
                obj._msg = '注册失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '注册失败4';
        obj._data = {};
        callback(obj)
    }
}

// 获取用户信息
function getUserInfo(req, callback) {
    if (req.body && req.body.verify && req.body.verify.id) {
        dao.userDao.findByPrimaryKey(req.body.verify.id, function (status, result) {
            if (1 === status && result[0]) {
                let userInfo = {};
                dao.userEthDao.getUserInfo(result[0].ethAddress, result[0].contractAddr, (status1, result1) => {
                    console.log("result1：");
                    console.log(result1);
                    if (1 === status1 && result1) {
                        userInfo.voteCount = result1.voteCount;
                        userInfo.voteProject = result1.voteProject;
                        userInfo.myVoteCount = result1.myVoteCount;
                        if ( result1.lastVoteTime != 0) {
                            userInfo.lastVoteTime = dateUtil.format(new Date(result1.lastVoteTime * 1000), "-");
                        }
                        if (result1.lastCreateVoteTime != 0) {
                            userInfo.lastCreateVoteTime = dateUtil.format(new Date(result1.lastCreateVoteTime * 1000), "-");
                        }
                        console.log("userInfo:");
                        console.log(userInfo);
                        dao.userDao.updateByPrimaryKey([userInfo, req.body.verify.id], status2 => {
                            if (1 === status2) {
                                dao.userDao.findByPrimaryKey(req.body.verify.id, function (status3, result3) {
                                    if (1 === status3 && result3[0]) {
                                        obj._code = '200';
                                        obj._msg = '查询成功';
                                        delete result3[0].privateKey;
                                        delete result3[0].password;
                                        delete result3[0].contractAddr;
                                        delete result3[0].createTime;
                                        obj._data = result3[0];
                                        callback(obj)
                                    } else {
                                        obj._code = '201';
                                        obj._msg = '查询失败';
                                        obj._data = {};
                                        callback(obj)
                                    }
                                });
                            } else {
                                obj._code = '201';
                                obj._msg = '查询失败';
                                obj._data = {};
                                callback(obj)
                            }
                        });
                    } else {
                        obj._code = '201';
                        obj._msg = '查询失败';
                        obj._data = {};
                        callback(obj)
                    }
                });
            } else {
                obj._code = '201';
                obj._msg = '查询失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '查询失败';
        obj._data = {};
        callback(obj)
    }
}

// 获取用户合约信息
function getUserEthInfo(ethAddress, contractAddr) {
    let userInfo = {};
    dao.userEthDao.getUserInfo(ethAddress, contractAddr, (status, result) => {
        if (1 === status && result) {
            userInfo.voteCount = result.voteCount;
            userInfo.voteProject = result.voteProject;
            userInfo.myVoteCount = result.myVoteCount;
            userInfo.lastVoteTime = result.lastVoteTime;
            userInfo.lastCreateVoteTime = result.lastCreateVoteTime;
        } else {
            console.log("获取用户合约数据失败");
        }
    });
    return userInfo;
}

// 是否已经投票
function isVoted(ethAddress, voteAddress, contractAddr) {
    dao.userEthDao.isVoted(ethAddress, voteAddress, contractAddr, (status, result) => {
        if (1 === status && result) {
            console.log(result);
            return result;
        } else {
            console.log("获取投票状态失败");
        }
    });
}

// 获取候选人列表
async function getCandidateList(voteAddress) {
    let candidateList = [];
    dao.candidateDao.findByVoteAddress(voteAddress, async (status, result) => {
        if (1 === status && result) {
            await result.forEach(candidate => {
                candidateList.push(candidate.candidateName);
            });
        } else {
            console.log("获取候选人列表失败");
        }
    });
    return await candidateList;
}

// 获取投票信息
function getVoteInfo(voteAddress) {

    dao.voteDao.findByContractAddress(voteAddress,(status, result) => {
        if (1 === status && result[0]) {
            return result[0];
        } else {
            console.log("获取投票信息失败或者投票不存在~~");
        }
    });

}

// 用户投票
async function vote(req, callback) {
    if (req.body && req.body.voteId && req.body.candidate && req.body.verify && req.body.verify.id) {
        dao.userDao.findByPrimaryKey(req.body.verify.id, function (status, result) {
            if (1 === status && result[0]) {
                dao.voteDao.findByPrimaryKey(req.body.voteId,(status1, voteInfo) => {
                    if (1 === status1 && voteInfo[0] && voteInfo[0].voteStatus === 1) {
                        console.log("2");
                        let voteData = {
                            voteType : voteInfo[0].voteType,
                            candidate : req.body.candidate,
                            votes : 1,
                            candidateList : []
                        };
                        if (req.body.votes) {
                            voteData.votes = req.body.votes;
                        }
                        // 给投票合约添加数据
                        dao.voteEthDao.addVoteData(voteData, result[0].privateKey, voteInfo[0].contractAddress, (status2) => {
                            console.log("3");
                            console.log("status1: " + status2);
                            if (1 === status2) {
                                console.log("已投票");
                                // 给用户合约添加数据
                                voteData.voteAddress = voteInfo[0].contractAddress;
                                dao.userEthDao.isVoted(result[0].ethAddress, voteInfo[0].contractAddress, result[0].contractAddr, async (status3, result3) => {
                                    if (1 === status3) {
                                        console.log("result3: " + result3);
                                        if (result3) {
                                            console.log("5");
                                            dao.userEthDao.addVoteData(voteData, result[0].privateKey, result[0].contractAddr, (status4) => {
                                                console.log("6");
                                                if (1 === status4) {
                                                    console.log("7");
                                                    let voterParams = {
                                                        voterAddress: result[0].ethAddress,
                                                        voteAddress: voteInfo[0].contractAddress,
                                                        candidate: req.body.candidate,
                                                        votes: req.body.votes,
                                                        createTime: dateUtil.format(new Date(), "-")
                                                    };
                                                    // 更新或者插入投票者数据
                                                    dao.voterDao.insert1(voterParams, status5 => {});
                                                    obj._code = '200';
                                                    obj._msg = '投票成功';
                                                    obj._data = {};
                                                    callback(obj)
                                                } else {
                                                    console.log("给用户合约添加投票数据失败~~");
                                                    obj._code = '201';
                                                    obj._msg = '投票失败';
                                                    obj._data = {};
                                                    callback(obj)
                                                }
                                            });
                                        } else {
                                            console.log("13");
                                            voteData.owner = voteInfo[0].ownerAddress;
                                            dao.candidateDao.findByVoteAddress(voteInfo[0].contractAddress,(status4, result4) => {
                                                if (1 === status4 && result4) {
                                                    result4.forEach(candidate => {
                                                        voteData.candidateList.push(candidate.candidateName);
                                                    });
                                                    console.log("voteData.candidateList：");
                                                    console.log(voteData.candidateList);
                                                    dao.userEthDao.firstVote(voteData, result[0].privateKey, result[0].contractAddr, (status5) => {
                                                        console.log("14");
                                                        if (1 === status5) {
                                                            console.log("15");
                                                            let voterParams = {
                                                                voterAddress: result[0].ethAddress,
                                                                voteAddress: voteInfo[0].contractAddress,
                                                                candidate: req.body.candidate,
                                                                votes: req.body.votes,
                                                                createTime: dateUtil.format(new Date(), "-")
                                                            };
                                                            dao.voterDao.insert(voterParams, status6 => {
                                                            });
                                                            console.log("给用户合约添加投票数据成功~~");
                                                            obj._code = '200';
                                                            obj._msg = '投票成功';
                                                            obj._data = {};
                                                            callback(obj)
                                                        } else {
                                                            console.log("给用户合约添加投票数据失败~~");
                                                            obj._code = '201';
                                                            obj._msg = '投票失败';
                                                            obj._data = {};
                                                            callback(obj)
                                                        }
                                                    })
                                                } else {
                                                    console.log("获取候选人列表失败");
                                                    obj._code = '201';
                                                    obj._msg = '投票失败';
                                                    obj._data = {};
                                                    callback(obj)
                                                }
                                            });
                                        }
                                    } else {
                                        console.log("获取投票状态失败");
                                        obj._code = '201';
                                        obj._msg = '投票失败';
                                        obj._data = {};
                                        callback(obj)
                                    }
                                });
                            } else {
                                obj._code = '201';
                                obj._msg = '投票失败';
                                obj._data = {};
                                callback(obj)
                            }
                        });
                    } else {
                        obj._code = '201';
                        obj._msg = '投票失败，获取投票信息失败或者投票不存在~~';
                        obj._data = {};
                        callback(obj)
                    }
                });
            } else {
                obj._code = '201';
                obj._msg = '投票失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '投票失败';
        obj._data = {};
        callback(obj)
    }
}


// 更新用户信息
function updateUserInfo(req, callback) {
    if (req.body && req.body.verify && req.body.verify.id) {
        let id = req.body.verify.id;
        delete req.body.token;
        delete req.body.verify;
        dao.userDao.findByPrimaryKey(id, function (status, result) {
            if (1 === status && result[0]) {
                dao.userDao.updateByPrimaryKey([req.body, id], function (status) {
                    obj._code = '200';
                    obj._msg = '更新成功';
                    obj._data = {};
                    callback(obj)
                })
            } else {
                obj._code = '201';
                obj._msg = '更新失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '更新失败';
        obj._data = {};
        callback(obj)
    }
}

// 获取用户发布的投票
function getUserVoted(req, callback) {
    if (req.body && req.body.verify && req.body.verify.id) {
        dao.userDao.findByPrimaryKey(req.body.verify.id, function (status, result) {
            if (1 === status && result[0]) {
                dao.userEthDao.getVotedAddresses(result[0].ethAddress, result[0].contractAddr,function (status2, result2) {
                    if (1 === status2 && result2) {
                        console.log("result2.length:");
                        console.log(result2.length);
                        let addressesParams = {
                            addressList : result2,
                            pageNo : 0,
                            pageSize : 0
                        };
                        if (req.body.pageNo !== null && req.body.pageNo !== undefined && req.body.pageNo !== "") {
                            addressesParams.pageNo = parseInt(req.body.pageNo);
                            console.log("1");
                        } else {
                            addressesParams.pageNo = 1;
                        }
                        if (req.body.pageSize !== null && req.body.pageSize !== undefined && req.body.pageSize !== "") {
                            addressesParams.pageSize = parseInt(req.body.pageSize);
                            console.log("2");
                        } else {
                            addressesParams.pageSize = result2.length;
                        }
                        let totalSize = result2.length;
                        dao.voteDao.findByContractAddressList(addressesParams, (status3, result3) => {
                            if (1 === status3 && result3) {
                                obj._data = {
                                    totalSize: totalSize,
                                    totalPage: (totalSize % addressesParams.pageSize) === 0 ?
                                        totalSize / addressesParams.pageSize : Math.ceil(totalSize / addressesParams.pageSize),
                                    pageNo: addressesParams.pageNo,
                                    pageSize: addressesParams.pageSize,
                                    voteInfoList: result3
                                };
                                obj._code = '200';
                                obj._msg = '查询成功';
                                callback(obj)
                            } else {
                                obj._code = '201';
                                obj._msg = '查询失败';
                                obj._data = {};
                                callback(obj)
                            }
                        });
                    } else {
                        obj._code = '201';
                        obj._msg = '查询失败';
                        obj._data = {};
                        callback(obj)
                    }
                })
            } else {
                obj._code = '201';
                obj._msg = '查询失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '查询失败';
        obj._data = {};
        callback(obj)
    }
}

function getBalance(req, callback){
    if(req.body && req.body.verify && req.body.verify.id){
        dao.userDao.findByPrimaryKey(req.body.verify.id, function(status, user){
            if(1 === status && user[0]){
                dao.userEthDao.getBalance(user[0].ethAddress, function(status, result){
                    if(1 === status){
                        obj._code = '200';
                        obj._msg = '查询成功';
                        obj._data = {
                            balance: result
                        };
                        callback(obj)
                    } else {
                        obj._code = '201';
                        obj._msg = '查询失败';
                        obj._data = {};
                        callback(obj)
                    }
                })
            }
        })
    } else{
        obj._code = '201';
        obj._msg = '查询失败';
        obj._data = {};
        callback(obj)
    }
}

module.exports = {
    login,
    register,
    getUserInfo,
    getUserVoted,
    vote,
    getBalance
};

