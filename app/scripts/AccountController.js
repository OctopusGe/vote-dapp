/*var express = require('express');
var router = express.Router();

router.post('/register',function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password)
        return res.json(Message.errMessage('用户名或密码不能为空'));
    async.waterfall([
        function (callback) {
            Contract.isExitUsername(username, (err, result) => {
                if (result)
                    return res.json(Message.errMessage('用户名已存在'));
                callback(null, result);
            });
        },
        function (result, callback) {
            Web3.eth.personal.newAccount(password).then(address => {
                callback(null, address);
            });
        },
        function (address, callback) {
            Web3Util.unlockAccount(Web3Util.ACCOUNT_ADDRESS_MAIN, Web3Util.ACCOUNT__PASSWORD_MAIN, (err, result) => {
                if (err)
                    return res.json(Message.errMessage(err));
                Contract.createUser(address, username, (err, result) => {
                    if (err)
                        return res.json(Message.errMessage(err));
                    callback(err, result);
                });
            });
        },
    ], (err, result) => {
        Message.handleResult(res, err, result);
    });
});
*/

export function isExitUsername(req, res) {
    let username = req.query.username;
    if (!username)
        return res.json(Message.errMessage('用户名不能为空'));
    Contract.isExitUsername(username, (err, result) => {
        Message.handleResult(res, err, result);
    });
}
export function login(req, res) {
    let account = req.body.account;
    let password = req.body.password;
    if (!account || !password)
        return res.json(Message.errMessage('用户名或密码不能为空'));
    if (Web3.utils.isAddress(account)) { //account is address
        Web3Util.unlockAccount(account, password, (err, result) => {
            if (err)
                return res.json(Message.errMessage('用户名或密码错误'));
            Contract.findUser(account, (err, result) => {
                Message.handleResult(res, err, result);
            });
        });
    }
    else { //account is username
        Contract.findUserAddressByUsername(account, (err, address) => {
            if (err)
                return res.json(Message.errMessage('用户名或密码错误'));
            Web3Util.unlockAccount(address, password, (err, result) => {
                if (err)
                    return res.json(Message.errMessage('用户名或密码错误'));
                Contract.findUser(address, (err, result) => {
                    Message.handleResult(res, err, result);
                });
            });
        });
    }
}
export function register(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password)
        return res.json(Message.errMessage('用户名或密码不能为空'));
    async.waterfall([
        function (callback) {
            Contract.isExitUsername(username, (err, result) => {
                if (result)
                    return res.json(Message.errMessage('用户名已存在'));
                callback(null, result);
            });
        },
        function (result, callback) {
            Web3.eth.personal.newAccount(password).then(address => {
                callback(null, address);
            });
        },
        function (address, callback) {
            Web3Util.unlockAccount(Web3Util.ACCOUNT_ADDRESS_MAIN, Web3Util.ACCOUNT__PASSWORD_MAIN, (err, result) => {
                if (err)
                    return res.json(Message.errMessage(err));
                Contract.createUser(address, username, (err, result) => {
                    if (err)
                        return res.json(Message.errMessage(err));
                    callback(err, result);
                });
            });
        },
    ], (err, result) => {
        Message.handleResult(res, err, result);
    });
}
