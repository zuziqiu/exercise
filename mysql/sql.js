var mysql = require('mysql')
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'exercise',
  port: 3306
})

db.connect()

// 查询
db.query('select type from exercisetable', function (error, results, fields) {
  if (error) throw error
  // 注意：如果执行的是select查询语句，则执行的结果是数据
  console.log('The solution is: ', results[0].type)
})

// 新增
var source = { type: 'audio', username: '足子求' }
/*
 * 该注释演示的是单个属性列举然后再插入数据，正式代码中是整个对象插入
 * query方法中的第二个参数要求是数组，会填充到sqlStr 后面的占位符
 * var sqlStr = 'insert into exercisetable (username, type) values (?, ?)'
 * db.query(sqlStr, [source.username, source.type], function (error, results, fields) {
 */
var sqlStr = 'insert into exercisetable set ?'
db.query(sqlStr, source, function (error, results, fields) {
  if (error) throw error
  // 注意：如果执行的是insert into语句，则执行的结果是对象，
  // 可以通过results.affectedRows属性判断是否插入成功
  if (results.affectedRows === 1) {
    console.log('插入数据成功')
  }
})

// 更新
var source = { type: 'audio2', username: '足子求', id: 9 }
/*
 * 该注释演示的是单个属性列举然后再插入数据，正式代码中是整个对象插入
 * query方法中的第二个参数要求是数组，会填充到sqlStr 后面的占位符
 * var sqlStr = 'update exercisetable set username=?, type=? where id=?'
 * db.query(sqlStr, [source.username, source.type, source.id], function (error, results, fields) {
 */
var sqlStr = 'update exercisetable set ? where id=?'
db.query(sqlStr, [source, source.id], function (error, results, fields) {
  if (error) throw error
  // 注意：如果执行的是update语句，则执行的结果是对象，
  // 可以通过results.affectedRows属性判断是否插入成功
  if (results.affectedRows === 1) {
    console.log('更新数据成功')
  }
})

// 删除 使用delete会真正删除，为了保险推荐使用标记删除来模拟删除动作
var sqlStr = 'delete from exercisetable where id=?'
db.query(sqlStr, 9, function (error, results, fields) {
  if (error) return console.log(error)
  // 注意：如果执行的是update语句，则执行的结果是对象，
  // 可以通过results.affectedRows属性判断是否插入成功
  if (results) {
    if (results.affectedRows === 1) {
      console.log('删除数据成功')
    } else {
      console.log('数据不存在')
    }
  }
})

// 标志删除 设置一个status 的field 作为标记
var sqlStr = 'update exercisetable set status=? where id=?'
db.query(sqlStr, [1, 7], function (error, results, fields) {
  if (error) throw error
  // 注意：如果执行的是update语句，则执行的结果是对象，
  // 可以通过results.affectedRows属性判断是否插入成功
  if (results.affectedRows === 1) {
    console.log('标记删除成功')
  }
})
db.end()
