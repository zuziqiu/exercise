// 写一个koa的异步中间件
function log(ctx) {
  console.log('打印内容')
}

async function logger(ctx, next) {
  // log(ctx)
  let abc = await next()
  console.log('logger', abc)
}

module.exports = logger