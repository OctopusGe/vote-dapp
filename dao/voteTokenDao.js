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

function deleteByVoteAddressAndUserAddress(params, callback){
    let sql_delete = "delete from vote_token where vote_address = ? and user_address = ?";
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

function updateByVoteAddressAndUserAddress(params, callback){
    let sql_update = "update vote_token set ? where vote_address = ? and user_address = ?";
    conn.query(sql_update, params, function(err, result){
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            callback(0)
            return;;
        }
        console.log("修改成功~");
        callback(1)
    })
}

function findByVoteAddressAndUserAddress(params, callback){
    let sql_select = "select * from vote_token where vote_address = ? and user_address = ?";
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
    deleteByVoteAddressAndUserAddress,
    updateByVoteAddressAndUserAddress,
    findByVoteAddressAndUserAddress
};