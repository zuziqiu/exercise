var fs = require('fs')
var express = require('express')
var app = express()

app.use(express.static('assets'))
app.get('/', (req, res) => {
  // console.log(req, 'req')
  // console.log(res, 'res')
  fs.readFile('./index.html', (err, data) => {
    // console.log(data)
    // res.setHeader('')
    res.end(data)
  })
  // res.end('hello world')
})


app.listen('8080', '127.0.0.1', () => {
  console.log('listen on: 8080')
})
