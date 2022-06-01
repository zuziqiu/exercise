var fs = require('fs')

var express = require('express')

var app = express()

var port = '8889'



app.get('/',(req,res)=>{
    res.end(fs.readFileSync('./test.html'))
})


app.use(express.static('assets'))

app.listen(port,'127.0.0.1',()=>{
    console.log('listen at port:'+port)
})
