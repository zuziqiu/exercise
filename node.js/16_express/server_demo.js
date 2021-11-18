const http = require('http')
const express = require('express')
const app = express()

// 回调函数在express中又被称为中间件，配合next形成中间件栈
// app.use('/', (req, res, next) => {
//   console.log(0)
//   next()
//   res.send('hello')
// }, (req, res) => {
//   console.log(1)
// })

// use方法监听的路由会形成栈堆，使用next可以放行，但是如果其中也给use匹配失败，该use的回调不会入栈
const middleWares = [(req, res, next) => {
  console.log(0)
  next()
}, (req, res, next) => {
  console.log(1)
  next()
}, (req, res, next) => {
  console.log(2)
  next()
}]
app.use('/', middleWares)

app.listen(8090, () => {
  console.log('8090')
})