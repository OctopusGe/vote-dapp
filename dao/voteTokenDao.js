var db = require("../db/mysql");

var conn = db.connect();

function insert(params, callback){
    let sql_insert = 'insert into vote_token set ?';
    conn.query(sql_insert, params, function(err, result){
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("插入成功~");
        callback(1);
    })
}

function insert1(params, callback){
    let sql_select = "select * from vote_token where voteAddress = ? and userAddress = ?";
    conn.query(sql_select, [params.voteAddress, params.userAddress], function(err, result){
        if(err){
            console.log('[FIND ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("查找成功");
        if (result[0]) {
            let sql_update = "update vote_token set ? where id = ?";
            let tokenBought = {
                tokenBought : (Number(params.tokenBought) + Number(result[0].tokenBought))
            };
            conn.query(sql_update, [tokenBought, result[0].id], function(err, result){
                if(err){
                    console.log('[UPDATE ERROR] - ',err.message);
                    callback(0);
                    return;
                }
                console.log("修改成功~");
                callback(1)
            })
        } else {
            let sql_insert = 'insert into vote_token set ?';
            conn.query(sql_insert, params, function(err, result){
                if(err){
                    console.log('[INSERT ERROR] - ',err.message);
                    callback(0);
                    return;
                }
                console.log("插入成功~");
                callback(1);
            })
        }
    });
}

function deleteByVoteAddressAndUserAddress(params, callback){
    let sql_delete = "delete from vote_token where voteAddress = ? and userAddress = ?";
    conn.query(sql_delete, params, function(err, result){
        if(err){
            console.log('[DELETE ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("删除成功~");
        callback(1);
    })
}

function updateByPrimaryKey(params, callback){
    let sql_update = "update vote_token set ? where id = ?";
    conn.query(sql_update, params, function(err, result){
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("修改成功~");
        callback(1)
    })
}

function updateByVoteAddressAndUserAddress(params, callback){
    let sql_update = "update vote_token set ? where voteAddress = ? and userAddress = ?";
    conn.query(sql_update, params, function(err, result){
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("修改成功~");
        callback(1)
    })
}

function findByVoteAddressAndUserAddress(params, callback){
    let sql_select = "select * from vote_token where voteAddress = ? and userAddress = ?";
    conn.query(sql_select, params, function(err, result){
        if(err){
            console.log('[FIND ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("查找成功");
        callback(1, result)
    })
}

module.exports = {
    insert,
    insert1,
    deleteByVoteAddressAndUserAddress,
    updateByPrimaryKey,
    updateByVoteAddressAndUserAddress,
    findByVoteAddressAndUserAddress
};