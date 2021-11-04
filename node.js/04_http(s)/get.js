const http = require('http')
const https = require('https')
const myChunk = require('05_custom_zuziqiu') // 动态发布的npm包加载回来这里作为例子
const querystring = require('querystring')
var server = http.createServer((request, response) => {
  https.get('https://www.xiaomiyoupin.com/mtop/mf/cat/list', (result) => {
    let data = ''
    result.on('data', (chunk) => {
      data += chunk
    })
    result.on('end', () => {
      response.writeHead(200, {
        // 'content-type': 'text/html' // html格式
        'content-type': 'application/json;charset=utf-8' // json格式
      })
      // response.write(JSON.stringify(querystring.parse(data))) // 往前端写数据
      response.write(data)
      response.end() // 没有end ,前端就一直等
    })
  })
})

// console.log(myChunk([4, 5, 6, 7]))
server.listen(8090, 'localhost', () => {
  console.log('localhost: 8090')
})
