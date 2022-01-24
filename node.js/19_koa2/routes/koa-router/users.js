const Router = require('@koa/router')
const { query } = require('../../utils/async-db')

const router = new Router()

function getData(ctx) {
  return new Promise((resolve, reject) => {
    let data = ''
    // ctx.req是koa封装过的，ctx.request才是node原生的。
    ctx.req.on('data', (chunk) => {
      data += chunk
    })
    ctx.req.on('end', () => {
      resolve(data)
    })
  })
}

router.post('/signin', async (ctx, next) => {
  // getData 原生方法获取参数
  let result = await getData(ctx)
  let param = new URLSearchParams(result)
  console.log(param.get('username'))
  ctx.body = result
})

router.get('/list', async (ctx, next) => {
  // ctx.req是koa封装过的，ctx.request才是node原生的。
  let query = ctx.request.query // 获取参数是对象的形式
  let queryString = ctx.request.querystring // 获取参数是字符串的形式
  ctx.body = queryString
  // ctx.session.username = 'abc'

  // let result = await query('select * from users where id=?', [2])
  // ctx.body = result
})

router.post('/signup', async (ctx, next) => {
  const body = ctx.request.body
  let result = await query('insert into users set ?', body)

  ctx.session = body
  ctx.body = result
})

module.exports = router