var template = require('art-template')
var path = require('path')
var fs = require('fs')
var { dataArray } = require('../model/list')
var jwt = require('jsonwebtoken')
const list = (req, res, next) => {
  // res.set('Content-Type', 'application/json; charset=utf-8')
  // res.render('list-html', {
  //   data: dataArray
  // })
  var html = template(path.join(__dirname, '../view/list-html.art'), {
    data: dataArray
  })
  fs.writeFileSync(path.join(__dirname, '../public/list.html'), html)
  // fs.writeFile('./log.txt', 'hello', (err, data) => {
  res.send(html)
}

const token = (req, res, next) => {
  // 这种是对称加密
  // const __token = jwt.sign({username: 'admin'}, 'sh')
  // const decoded = jwt.verify(__token, 'sh')

  // 非对称加密
  const privateKey = fs.readFileSync(path.join(__dirname, '../keys/rsa_private_key.pem'))
  const __token = jwt.sign({username: 'admin'}, privateKey, {algorithm: 'RS256'})

  const pubilcKey = fs.readFileSync(path.join(__dirname, '../keys/rsa_public_key.pem'))
  let result = jwt.verify(__token, pubilcKey)
  res.send(result)
}
exports.token = token
exports.list = list