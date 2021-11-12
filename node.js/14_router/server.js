const http = require('http')
const fs = require('fs')
const mime = require('mime')
const app = http.createServer((req, res) => {
  const urlString = req.url
  const type = mime.getType(urlString.split('.')[1])
  res.writeHead(200, {
    'content-type': type
  })
  const file = fs.readFileSync(`.${urlString}`)
  res.end(file)
})

app.listen(8090, () => {
  console.log('8090')
})