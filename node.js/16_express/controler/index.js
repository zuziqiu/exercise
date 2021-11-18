var template = require('art-template')
var path = require('path')
var fs = require('fs')
var { dataArray } = require('../model/list')
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
exports.list = list