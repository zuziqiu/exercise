const mysql = require('mysql')

const pool = mysql.createPool({ // 创建一个连接池
  host     :  'localhost',
  user     :  'root',
  password :  '123456',
  database :  'pages'
})

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

module.exports = { query }