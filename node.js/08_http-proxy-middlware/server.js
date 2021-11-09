const http = require('http');
const url = require('url')
const { createProxyMiddleware } = require('http-proxy-middleware')
const server = http.createServer((req, res) => {
  let __url = req.url
  if (/\/api/.test(__url)) {
    const proxy = createProxyMiddleware('/api', { // 第一个参数匹配搭配的字符前面都会都替换成target定义的域名
      target: 'https://gate.lagou.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // 把api从匹配路由中去掉
      }
    })
    proxy(req, res)
  } else {
    console.log('error')
  }
})

server.listen(8090, () => {
  console.log(8090)
})