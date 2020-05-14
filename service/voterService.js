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
        dao.userDao.findByAccount("admin", function (status, result) {
            if (1 === status && result[0]) {
                let voteInfo = {
                    ownerAddress: req.body.verify.account,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    proposal: req.body.proposal,
                    candidates: req.body.candidates,
                    voteType: req.body.voteType,
                    totalTokens: req.body.totalTokens,
                    balanceTokens: req.body.balanceTokens,
                    tokenPrice: req.body.tokenPrice,
                    tokenUnit: req.body.tokenUnit
                };
                dao.voteEthDao.createVote(voteInfo, result[0].primaryKey, function (status1, result1) {
                    if (1 === status1 && result1) {
                        voteInfo.contractAddress = result1.contractAddress;
                        voteInfo.voteStatus = getVoteStatus(new Date().getTime(), req.body.startTime, req.body.endTime);
                        voteInfo.createTime = dateUtil.format(new Date(), "-");
                        dao.voteDao.insert(voteInfo, (status2) => {
                            if (1 === status2) {
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