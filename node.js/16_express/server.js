const express = require('express')
const router = require('./router')
const app = express()
const path = require('path')

app.use(express.json()) // 通过 express.json()解析表单中的 JSON 格式的数据
app.use(express.urlencoded({extended: false})) // 通过 express.urlencoded()解析表单中的 url-encoded 格式的数据
app.use(express.static('./public')) // 静态资源服务中间件

// view engine setup
app.engine('art', require('express-art-template'));
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production',
    escape: false
});
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'art');

app.use('/', router) // 路由中间件
app.listen(8090, () => {
  console.log(8090)
})