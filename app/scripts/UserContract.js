import contractUser from './index.js';

class UserContract {

    constructor() {
    }

    //user 合约

    /**
     * 判断用户名是否存在
     */
    static isExitUsername(username, cb) {
        contractUser.isExitUsername(username).call()
            .then(result => {
                cb(null, result)
            })
            .catch(err => {
                cb(err.message)
            });
    }

    /**
     * 根据用户名查找对于的地址
     */
    static findUserAddressByUsername(username, cb) {
        contractUser.findUserAddressByUsername(username)
            .then(result => {
                cb(null, result)
            })
            .catch(err => {
                cb(err.message)
            });
    }

    /**
     * 查找用户信息
     */
    static findUser(userAddress, cb) {
        index.contractUser.findUser(userAddress).call()
            .then(result => {
                cb(null, result)
            })
            .catch(err => {
                cb(err.message)
            });
    }

    /**
     * 创建用户信息 (发送合约需要先解锁)
     */
    static createUser(username, password, cb) {
        let options = {
            // 创建账户用主账号
            from: web3.eth.accounts[0],
            // 最大的gas数值 
            gas: 10000000
        }
        web3.personal.newAccount(password, (err, address) => {
            if (address) {
                contractUser.createUser(address, username).send(options)
                    .then(result => {
                        cb(null, result)
                    })
                    .catch(err => {
                        cb(err.message)
                    });
            } 
            if (err) {
                cb(err.message)
            }
        });
    }

    /**
     * 创建用户信息 (发送合约需要先解锁)
     */
    // static createUser(userAddress, username, cb) {
    //     let options = {
    //         // 创建账户用主账号
    //         from: Web3Util.ACCOUNT_ADDRESS_MAIN,
    //         //最大的gas数值 
    //         gas: 10000000
    //     }
    //     web3Util.contractUser.methods.createUser(userAddress, username).send(options)
    //         .then(result => {
    //             cb(null, result)
    //         })
    //         .catch(err => {
    //             cb(err.message)
    //         });
    // }

}
export default UserContract;