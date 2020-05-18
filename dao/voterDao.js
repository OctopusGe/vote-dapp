var db = require("../db/mysql");

var conn = db.connect();

function insert(params, callback){
    let sql_insert = 'insert into voter set ?';
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
    let sql_select = "select * from voter where voterAddress = ? and voteAddress = ? and candidate = ?";
    conn.query(sql_select, [params.voterAddress, params.voteAddress, params.candidate], function(err, result){
        if(err){
            console.log('[FIND ERROR] - ',err.message);
            callback(0);
            return;
        }
        console.log("查找成功");
        if (result[0]) {
            let sql_update = "update voter set ? where id = ?";
            let votesParam = {
                votes : (Number(params.votes) + Number(result[0].votes))
            }
            conn.query(sql_update, [votesParam, result[0].id], function(err, result){
                if(err){
                    console.log('[UPDATE ERROR] - ',err.message);
                    callback(0);
                    return;
                }
                console.log("修改成功~");
                callback(1)
            })
        } else {
            let sql_insert = 'insert into voter set ?';
            console.log("insert1:");
            console.log(params);
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
        callback(1, result)
    });
}


function deleteByPrimaryKey(params, callback){
    let sql_delete = "delete from voter where id = ?";
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
    let sql_update = "update voter set ? where id = ?";
    conn.query(sql_update, params, function(err, result){
        if(err){
            console.log('[UPDATE ERROR] - ',err.message);
            callback(0)
            return;
        }
        console.log("修改成功~");
        callback(1)
    })
}

// function updateByVoterAddressAndVoteAddressAndCandidate(params, callback){
//     let sql_update = "update voter set ? where voterAddress = ? and voteAddress and candidate = ?";
//     conn.query(sql_update, params, function(err, result){
//         if(err){
//             console.log('[UPDATE ERROR] - ',err.message);
//             callback(0)
//             return;;
//         }
//         console.log("修改成功~");
//         callback(1)
//     })
// }

function findByVoterAddressAndVoteAddressAndCandidate(params, callback){
    let sql_select = "select * from voter where voterAddress = ? and voteAddress = ? and candidate = ?";
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

function findByVoterAddressAndVoteAddress(params, callback){
    console.log(params);
    let sql_select = "select * from voter where voterAddress = ? and voteAddress = ?";
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
    deleteByPrimaryKey,
    updateByPrimaryKey,
    findByVoterAddressAndVoteAddressAndCandidate,
    findByVoterAddressAndVoteAddress
};