// 就是将使用mysql模块的前三步封装

const mysql = require('mysql')
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'user'
})
// conn.connect()
var query = function(sql, options, callback) {
  conn.getConnection(function(err, conn) {
    if (err) {
      callback(err, null, null)
    } else {
      conn.query(sql, options, function(err, results, fields) {
        // 事件驱动回调
        callback(err, results, fields)
      })
      // 释放连接，需要注意的是连接释放需要在此处释放，而不是在查询回调里面释放
      conn.release()
    }
  })
}
// 导出conn对象
module.exports = query
