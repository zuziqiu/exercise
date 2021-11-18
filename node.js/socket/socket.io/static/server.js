const http = require('http')
const path = require('path')
const readStaticFile = require('./readStaticFile')
http.createServer(async (req, res) => {
  let urlString = req.url
  let filePathName = path.join(__dirname, './public', urlString)
  let { mimeType, data } = await readStaticFile(filePathName, res)
  res.writeHead(200, {
    'content-type': `${mimeType}; charset=utf-8`,
    'Access-Control-Allow-Origin': '*'
  })
  res.write(data)
  res.end()
}).listen(8090, () => {
  console.log('8090')
})