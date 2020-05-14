var dao = require('../dao');
var BigNumber = require("bignumber.js");
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
 | startTime       | date          | YES  |     | NULL    |                |
 | endTime         | date          | YES  |     | NULL    |                |
 | proposal        | varchar(100)  | YES  |     | NULL    |                |
 | candidates      | varchar(255)  | YES  |     | NULL    |                |
 | voteStatus      | int(1)        | YES  |     | 0       |                |
 | voteType        | int(1)        | YES  |     | 0       |                |
 | totalTokens     | int(11)       | YES  |     | 0       |                |
 | balanceTokens   | int(11)       | YES  |     | 0       |                |
 | tokenPrice      | decimal(10,2) | YES  |     | 0.00    |                |
 | tokenUnit       | varchar(20)   | YES  |     | ETH     |                |
 | winner          | varchar(200)  | YES  |     | NULL    |                |
 | createTime      | datetime
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
                        let candidateParam = {
                            voteAddress : contractAddress,
                            candidateIndex : 0,
                            candidateName : '',
                            votes : 0,
                            createTime : dateUtil.format(new Date(), "-")
                        };
                        for (let i = 0; i < voteInfo.candidates.length; i++) {
                            candidateParam.candidateIndex = i + 1;
                            candidateParam.candidateName = voteInfo.candidates[i];
                            candidateParam.createTime = dateUtil.format(new Date(), "-");
                            dao.candidateDao.insert(candidateParam, (status2) => {});
                        }
                        console.log(contractAddress);
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

module.exports = {
    createVote
};