const Router = require('@koa/router')

const router =  new Router()

const users = require('./users')
const products = require('./products')

router
  .get('/', async (ctx, next) => {
    ctx.body = 'home'
  })
  // 可以先检验参数等
  .param('id', (id, ctx, next) => {
    console.log(id)
    next()
  })
  .get('/:id', (ctx, next) => {
    ctx.body = ctx.params.id
    // redirect：转发（重定向？）；
    // router.url可以生成一条规范的路由 "/position/100?name=qianfeng"
    // ctx.redirect(router.url('position', { id: 100 }, { query: {name: 'qianfeng'} }))
  })
  // 这种是用枚举匹配传入的路由
  .get(
    ['/id', '/name'],
    async (ctx, next) => {
      // ctx.body = ctx.params.id
      // let result = await next()
      // console.log(result)
      // ctx.body = ctx.url
      ctx.redirect('/')
    },
    (ctx, next) => {
      return 'hello'
    }
  )

  .get('position', '/list/:id', (ctx, next) => {
    ctx.body = 'route name'
  })
  //  users.routes() 里面又有一层路由，等于二级路由，不像express要写两层路径
  .use('/users', users.routes(), users.allowedMethods())
  // 使用路由中间件的例子 koa-bodyparser
  .use('/products', products.routes(), products.allowedMethods())

  .get(
    '/abc/123',
    async (ctx, next) => {
      console.log('m1 start')
      await next()
      console.log('m1 end')
    },
    async (ctx, next) => {
      console.log('m2 start')
      await next()
      console.log('m2 end')
    },
    async (ctx, next) => {
      console.log('m3 start')
      await next()
      console.log('m3 end')
    }
  )


module.exports = router