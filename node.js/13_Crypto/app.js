const crypto = require('crypto')
const password = 'abc123'
// crypto用于加密数据,md5、hash、对成型？、非对称性？
const pro = crypto
  .createHash('md5') // 用哈希
  .update(password)
  .digest('hex') // 用十六进制

console.log(pro)