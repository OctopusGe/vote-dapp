var db = require("../db/mysql");

var conn = db.connect();

function insert(params, callback){
  let sql_insert = 'insert into user set ?';
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
  let sql_delete = "delete from user where id = ?";
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

function updateByAddress(params, callback){
  let sql_update = "update user set ? where address = ?";
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

function updateByPrimaryKey(params, callback){
  let sql_update = "update user set ? where id = ?";
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
  let sql_select = "select * from user where id = ?";
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

function findByAccount(params, callback){
  let sql_select = "select * from user where account = ?";
  conn.query(sql_select, params, function(err, result){
    if(err){
      console.log('[FIND ERROR] - ',err.message);
      callback(0);
      return;
    }
    console.log("查找成功");
    callback(1, result);
  })
}

function findByAddress(params, callback){
  let sql_select = "select * from user where address = ?";
  conn.query(sql_select, params, function(err, result){
    if(err){
      console.log('[FIND ERROR] - ',err.message);
      callback(0);
      return;
    }
    console.log("查找成功");
    callback(1, result);
  })
}

function findByConditionsCount(params, callback){
  let sql_select_count = 'select count(*) as allCount from user where 1 = 1 ';  // 注意末尾空格

  console.log(sql_select_count);

  conn.query(sql_select_count, "",function(err, res){
    if(err){
      console.log('[FIND ERROR] - ',err.message);
      callback(0);
      return;
     }
    console.log("条数查找成功~");
    callback(1, res);
  })
}

function findByConditions(params, callback){
  let sql_select = 'select * from user where 1 = 1 '; // 注意末尾空格

  sql_select += 'limit ' + params.limit*(params.page-1) + ',' + params.limit
  // sql_select += 'limit ?, ?';

  conn.query(sql_select, "",function(err, res){
    if(err){
      console.log('[FIND ERROR] - ',err.message);
      callback(0, res);
      return;
     }
    console.log("查找成功~");
    callback(1, res);
  })
}

// 获取用户交易记录
function findTransactByUserAddress(params, callback){
  let sql_select = 'select transactionrecord.* from transactionrecord, user where (user.ethAddress = transactionrecord.sendAddress or user.ethAddress = transactionrecord.recieveAddress) and user.ethAddress = ?'

  conn.query(sql_select, params, function(err, result){
    if(err){
      console.log('[FIND ERROR] - ',err.message);
      callback(0);
      return
    }
    console.log("查询成功");
    callback(1, result)
  })
}


module.exports = {
  insert,
  deleteByPrimaryKey,
  updateByAddress,
  updateByPrimaryKey,
  findByPrimaryKey,
  findByAccount,
  findByAddress,
  findByConditionsCount,
  findByConditions,
  findTransactByUserAddress
}
