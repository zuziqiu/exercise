const Koa = require('koa')
const koa = new Koa()
// const logger = require('./middlewares/logger-async')

// koa.use(logger)

// koa.use(({ body }, next) => {
  //   body = 'hello koa'
  // })
  
// require('./routes/')

const router = require('./routes/koa-router/index')
const bodyParser = require('koa-bodyparser') // 获取post请求的body内容，返回json格式到body
const static = require('koa-static')
const views = require('koa-views')
const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')

koa.use(bodyParser())
// koa-static 是暴露静态资源路径的。访问时不需要加上static,即 http://127.0.0.1:4200/文件名 这种形式即可访问
koa.use(static('./public', {
  index: 'app.html'
}))
koa.use(views('./views', {
  map: {
    html: 'ejs'
  },
  // extension: 'ejs'
}))

// 配置存储session信息的mysql
// let store = new MysqlSession({
//   user: 'root',
//   password: '11111111',
//   database: 'gp21',
//   host: '127.0.0.1',
// })
// // 使用session中间件
// koa.use(session({
//   key: 'SESSION_ID',
//   store: store
// }))

koa
  .use(router.routes())
  .use(router.allowedMethods())

koa.listen(3333, 'localhost')
