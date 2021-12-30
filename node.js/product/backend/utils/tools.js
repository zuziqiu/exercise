const bcrypt = require("bcrypt")
// 存储的密码hash加密
exports.hash = (myPlaintextPassword) => {
  return new Promise((resolve, reject) => {
    // bcrypt.hash(password, 10, function (err, hash) {
    //   if (err) {
    //     reject(err)
    //   }
    //   resolve(hash)
    // })
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        if (err) {
          reject(err)
        }
        resolve(hash)
      })
    })
  })
}

exports.compare = (myPlaintextPassword, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
      resolve(result)
    })
  })
}