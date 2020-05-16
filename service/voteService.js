var dao = require('../dao');
var dateUtil = require('../utils/dateUtil');

var obj = {
    _code: '',
    _msg: '',
    _data: {}
};

/**
 *
 | ownerAddress    | varchar(50)   | NO   |     | NULL    |                |
 | contractAddress | varchar(50)   | YES  |     | NULL    |                |
 | startTime       | bigint        | YES  |     | NULL    |                |
 | endTime         | bigint        | YES  |     | NULL    |                |
 | proposal        | varchar(100)  | YES  |     | NULL    |                |
 | candidates      | varchar(255)  | YES  |     | NULL    |                |
 | voteStatus      | int(1)        | YES  |     | 0       |                |
 | voteType        | int(1)        | YES  |     | 0       |                |
 | totalTokens     | int(11)       | YES  |     | 0       |                |
 | balanceTokens   | int(11)       | YES  |     | 0       |                |
 | tokenPrice      | decimal(10,2) | YES  |     | 0.00    |                |
 | tokenUnit       | varchar(20)   | YES  |     | ETH     |                |
 | winner          | varchar(200)  | YES  |     | NULL    |                |
 | createTime      | varchar(25)
 */

// 用户发布投票
function createVote(req, callback) {
    if (req.body && req.body.verify && req.body.verify.id && req.body.startTime < req.body.endTime) {
        console.log(req.body);
        let candidateList = [req.body.candidates, "懂", "其它"];
        dao.userDao.findByAccount("admin", function (status, result) {
            if (1 === status && result[0]) {
                let voteInfo = {
                    ownerAddress: req.body.verify.ethAddress,
                    proposal: req.body.proposal,
                    voteType: req.body.voteType,
                    totalTokens: req.body.totalTokens,
                    balanceTokens: req.body.totalTokens,
                    tokenPrice: req.body.tokenPrice,
                    candidates: candidateList,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime
                };
                console.log("============");
                console.log(voteInfo);
                dao.voteEthDao.createVote(voteInfo, result[0].privateKey, function (status1, contractAddress) {
                    if (1 === status1 && contractAddress) {
                        // 初始化候选人得票信息表数据
                        let candidateParam = {
                            voteAddress: contractAddress,
                            candidateIndex: 0,
                            candidateName: '',
                            votes: 0,
                            createTime: dateUtil.format(new Date(), "-")
                        };
                        for (let i = 0; i < voteInfo.candidates.length; i++) {
                            candidateParam.candidateIndex = i + 1;
                            candidateParam.candidateName = voteInfo.candidates[i];
                            candidateParam.createTime = dateUtil.format(new Date(), "-");
                            dao.candidateDao.insert(candidateParam, (status2) => {});
                        }
                        // 将投票信息写进mysql数据库
                        voteInfo.contractAddress = contractAddress;
                        voteInfo.candidates = voteInfo.candidates.toString();
                        voteInfo.voteStatus = getVoteStatus(new Date().getTime(), req.body.startTime, req.body.endTime);
                        voteInfo.createTime = dateUtil.format(new Date(), "-");
                        dao.voteDao.insert(voteInfo, (status3) => {
                            if (1 === status3) {
                                obj._code = '200';
                                obj._msg = '发布投票成功';
                                obj._data = {};
                                callback(obj)
                            } else {
                                obj._code = '201';
                                obj._msg = '发布投票失败';
                                obj._data = {};
                                callback(obj)
                            }
                        });
                    } else {
                        obj._code = '201';
                        obj._msg = '发布投票失败';
                        obj._data = {};
                        callback(obj)
                    }
                });
            } else {
                obj._code = '201';
                obj._msg = '发布投票失败';
                obj._data = {};
                callback(obj)
            }
        })
    } else {
        obj._code = '201';
        obj._msg = '发布投票失败';
        obj._data = {};
        callback(obj)
    }
}

function getVoteStatus(now, startTime, endTime) {
    if (now < startTime) {
        return 0;
    } else if (now >= startTime && now < endTime) {
        return 1;
    } else if (now > endTime) {
        return 2;
    }
}

function getVoteInfo (req, callback) {
    if (req.body && req.body.voteId && req.body.verify && req.body.verify.ethAddress) {
        dao.voteDao.findByPrimaryKey(req.body.voteId, function (status, result) {
            if (1 === status && result[0]) {
                dao.voteEthDao.getVoteInfo(result[0].voteType, result[0].contractAddress, (status1, result1) => {
                    if (1 === status1 && result1) {
                        // 统计总票数
                        let totalVotes = 0;
                        for (let i = 0; i < result1.votesList.length; i++) {
                            totalVotes += Number(result1.votesList[i]);
                        }
                        let voteParams = {
                            voteStatus: getVoteStatus(new Date().getTime(), result[0].startTime, result[0].endTime),
                            totalVoter: result1.totalVoter,
                            totalVotes: totalVotes
                        };
                        if (result[0].voteType === 1 || result[0].voteType === 3) {
                            delete result[0].totalTokens;
                            delete result[0].balanceTokens;
                            delete result[0].tokenPrice;
                            delete result[0].tokenUnit;
                        }
                        if (result[0].voteType === 2) {
                            //console.log("token投票");
                            voteParams.balanceTokens = result1.balanceTokens;
                            result[0].balanceTokens = result1.balanceTokens;
                        }
                        // 更新vote表信息
                        dao.voteDao.updateByPrimaryKey([voteParams, result[0].id], (status2, result2) => {
                        });

                        // 投票结束，将候选人投票数据写进mysql
                        if (result[0].voteStatus === 1 && voteParams.voteStatus === 2) {
                            let candidateParam = {
                                voteAddress: result[0].contractAddress,
                                candidateIndex: 0,
                                candidateName: '',
                                votes: 0,
                                createTime: dateUtil.format(new Date(), "-")
                            };
                            for (let i = 0; i < result1.candidateList.length; i++) {
                                candidateParam.candidateIndex = i + 1;
                                candidateParam.candidateName = result1.candidateList[i];
                                candidateParam.createTime = dateUtil.format(new Date(), "-");
                                candidateParam.votes = result1.votesList[i];
                                dao.candidateDao.insert(candidateParam, (status2) => {
                                });
                            }
                        }
                        // callback result
                        delete result[0].createTime;
                        delete result[0].candidates;
                        // 更新状态
                        result[0].voteStatus = voteParams.voteStatus;
                        let returnResult = result[0];
                        // let candidateVotes = {};
                        // for (let i = 0; i < result1.candidateList.length; i++) {
                        //     candidateVotes[result1.candidateList[i]] = result1.votesList[i];
                        // }
                        //returnResult.candidateVotes = candidateVotes;
                        returnResult.candidateList = result1.candidateList;
                        returnResult.votesList = result1.votesList;
                        returnResult.totalVoter = result1.totalVoter;
                        returnResult.totalVotes = totalVotes;

                        // 获取用户在这个投票上的数据
                        dao.voteEthDao.getVoterDetails(req.body.verify.ethAddress, result[0].contractAddress, result[0].voteType, (status2, result2) => {
                            if (1 === status2) {
                                if (result2) {
                                    returnResult.voterDatail = result2;
                                }
                                obj._code = '200';
                                obj._msg = '查询成功';
                                obj._data = returnResult;
                                callback(obj);
                            } else {
                                obj._code = '201';
                                obj._msg = '查询失败';
                                obj._data = {};
                                callback(obj);
                            }
                        });
                    } else {
                        obj._code = '201';
                        obj._msg = '查询失败';
                        obj._data = {};
                        callback(obj);
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

function getVoteInfoList(req, callback) {

}

function buyTokens(req, callback) {
    if (req.body && req.body.tokenValue && req.body.voteId && req.body.verify && req.body.verify.id) {
        dao.userDao.findByPrimaryKey(req.body.verify.id, (status, result) => {
            if (1 === status && result[0]) {
                dao.voteDao.findByPrimaryKey(req.body.voteId, (status1, result1) => {
                    if (1 === status1 && result1[0] && result1[0].voteStatus === 1) {
                        dao.voteEthDao.buyTokens(req.body.tokenValue, result[0].privateKey, result1[0].contractAddress, (status2) => {
                            if (1 === status2) {
                                obj._code = '200';
                                obj._msg = '购买成功';
                                obj._data = {};
                                callback(obj)
                            } else {
                                obj._code = '201';
                                obj._msg = '购买失败';
                                obj._data = {};
                                callback(obj)
                            }
                        })
                    } else {
                        obj._code = '201';
                        obj._msg = '购买失败';
                        obj._data = {};
                        callback(obj)
                    }
                });
            } else {
                obj._code = '201';
                obj._msg = '购买失败';
                obj._data = {};
                callback(obj)
            }
        });
    } else {
        obj._code = '201';
        obj._msg = '购买失败';
        obj._data = {};
        callback(obj)
    }
}

module.exports = {
    createVote,
    getVoteInfo,
    buyTokens
};