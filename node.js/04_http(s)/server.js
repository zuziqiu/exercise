const http = require('http')
var server = http.createServer((request, response) => {
  let url = request.url
  response.write(url) // 往前端写数据
  response.end() // 没有end ,前端就一直等
})

server.listen(8090, 'localhost', () => {
  console.log('localhost: 8090')
})
