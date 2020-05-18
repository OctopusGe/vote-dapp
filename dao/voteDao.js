var db = require("../db/mysql");

var conn = db.connect();

function insert(params, callback){
    let sql_insert = 'insert into vote set ?';
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
function deleteByPrimaryKey(params, callback){
    let sql_delete = "delete from vote where id = ?";
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
    let sql_update = "update vote set ? where id = ?";
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

function findByPrimaryKey(params, callback){
    let sql_select = "select * from vote where id = ?";
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

function findByContractAddress(params, callback){
    let sql_select = "select * from vote where contractAddress = ?";
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

function findByContractAddressList(params, callback) {
    let inlist = '';
    for (let i = 0; i < params.addressList.length; i++) {
        inlist += '?,';
    }
    inlist = inlist.substring(0, inlist.length - 1);
    console.log("param:" + params);
    console.log("inlist:" + inlist);

    let sql_select = "select * from vote where contractAddress in(" + inlist + ") limit ?,?";
    console.log(sql_select);
    //params.pageSize * (params.pageNo - 1), params.pageSize
    params.addressList.push(params.pageSize * (params.pageNo - 1));
    params.addressList.push(params.pageSize);
    conn.query(sql_select, params.addressList, function (err, result) {
        if (err) {
            console.log('[FIND ERROR] - ', err.message);
            callback(0);
            return;
        }
        console.log("查找成功");
        callback(1, result);
    })
}

// 参数列表{"ownerAddress": "", "voteType": "", "voteStatus": ""}
function findByConditionsCount(params, callback) {
    let sql_select_count = 'select count(*) count from vote where 1 = 1 ';  // 注意末尾空格

    if (params.ownerAddress !== "" && params.ownerAddress != null)
        sql_select_count += 'and ownerAddress = ' + '\"' + params.ownerAddress + '\" '; // 字符串拼接需要引号，注意末尾空格

    if (params.voteType !== "" && params.voteType != null)
        sql_select_count += 'and voteType = ' + '\"' + params.voteType + '\" '; // 字符串拼接需要引号，注意末尾空格

    if (params.voteStatus !== "" && params.voteStatus != null)
        sql_select_count += 'and voteStatus = ' + '\"' + params.voteStatus + '\" '; // 字符串拼接需要引号，注意末尾空格

    console.log(sql_select_count);

    conn.query(sql_select_count, "", function (err, res) {
        if (err) {
            console.log('[FIND ERROR] - ', err.message);
            callback(0);
            return;
        }
        console.log("条数查找成功~");
        console.log(res);
        callback(1, res);
    })
}

// 参数列表{"ownerAddress": "", "voteType": "", "voteStatus": "", "limit": 1, "page": 2}
function findByConditions(params, callback) {
    let sql_select = 'select * from vote where 1 = 1 ';

    if (params.ownerAddress !== "" && params.ownerAddress != null)
        sql_select += 'and ownerAddress = ' + '\"' + params.ownerAddress + '\" '; // 字符串拼接需要引号，注意末尾空格

    if (params.voteType !== "" && params.voteType != null)
        sql_select += 'and voteType = ' + '\"' + params.voteType + '\" '; // 字符串拼接需要引号，注意末尾空格

    if (params.voteStatus !== "" && params.voteStatus != null)
        sql_select += 'and voteStatus = ' + '\"' + params.voteStatus + '\" '; // 字符串拼接需要引号，注意末尾空格

    sql_select += 'limit ?, ?';

    console.log(sql_select);

    conn.query(sql_select, [params.pageSize * (params.pageNo - 1), params.pageSize], function (err, res) {
        if (err) {
            console.log('[FIND ERROR] - ', err.message);
            callback(0);
            return false;
        }
        console.log("查找成功");
        callback(1, res);
    })
}

module.exports = {
    insert,
    deleteByPrimaryKey,
    updateByPrimaryKey,
    findByPrimaryKey,
    findByContractAddress,
    findByContractAddressList,
    findByConditionsCount,
    findByConditions
};

