const http = require('http');
const server = http.createServer((req, res) => {
  let url = req.url
  switch (url) {
    case '/api/data':
      res.writeHead(200, {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.write('{"code": 0, "data": "hello"}')
      break;
    default:
      res.write('page not found')
  }
  res.end()
})

server.listen(8090, () => {
  console.log(8090)
})