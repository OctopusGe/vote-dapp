
class Web3Util {

    constructor() {
    }

    /**
     * 解锁账户
     * @param account 账户名
     * @param password 密码
     */
    static unlockAccount(account, password, cb) {
        web3.personal.unlockAccount(account, password, 600, (err, result) => {
            if(result) 
                cb(null, result);
            if(err)
                cb(err.message, null);
            });
    }
    
}
export default Web3Util;