var db = require("../db/mysql");

var conn = db.connect();

function insert(params, callback){
    let sql_insert = 'insert into candidate set ?';
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

function deleteByVoteAddress(params, callback){
    let sql_delete = "delete from user candidate vote_address = ?";
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

function updateByVoteAddressAndCandidateIndex(params, callback){
    let sql_update = "update candidate set ? where vote_address = ? and candidate_index = ?";
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

function findByVoteAddress(params, callback){
    let sql_select = "select * from candidate where vote_address = ?";
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
    deleteByVoteAddress,
    updateByVoteAddressAndCandidateIndex,
    findByVoteAddress,
};