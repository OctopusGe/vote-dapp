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
                obj._code = '200';
                obj._msg = '查询成功';
                delete result[0].privateKey;
                delete result[0].password;
                delete result[0].contractAddr;
                delete result[0].createTime;
                obj._data = result[0];
                callback(obj)
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
function getUserVote(req, callback) {
    if (req.body && req.body.verify && req.body.verify.id) {
        dao.userDao.findByPrimaryKey(req.body.verify.id, function (status, result) {
            if (1 === status && result[0]) {
                dao.userEthDao.getMyVoteAddresses(result[0].ethAddress, result[0].contractAddr,function (status2, result2) {
                    if (1 === status2 && result2[0]) {
                        obj._code = '200';
                        obj._msg = '查询成功';
                        obj._data = result2[0];
                        callback(obj)
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
    getBalance
};

