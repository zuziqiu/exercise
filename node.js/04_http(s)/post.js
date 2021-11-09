const http = require('http')
const querystring = require('querystring')

const postData = querystring.stringify({
  province: '上海',
  district: '宝山区',
  adress: '天河棠下',
  message: '求购一条小鱼',
  time: '1314'
})

var server = http.createServer((request, response) => {
  if (request.url == '/') {
    const __request = http.request({
      protocol: 'http:',
      hostname: 'localhost',
      method: 'post',
      port: 3000,
      path: '/data',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(postData)
      }
    }, (result) => {
    })
    __request.write(postData)
    __request.end() // 没有end ,前端就一直等
    response.end() // 没有end ,前端就一直等
  }
})
server.listen(8090, 'localhost', () => {
  console.log('localhost: 8090')
})
