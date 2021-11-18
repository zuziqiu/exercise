const express = require('express')

// 路由中间件
const router = express.Router()

// 接收get请求（地址栏路由也是get）
router.get('/', (req, res, next) => {
  res.send('hello')
})

// get 语义：获取数据
router.get('/index', (req, res, next) => {
  const query = req.query
  res.send(query)
})

// post 语义：增加数据
router.post('/index', (req, res, next) => {
  const data = req.body
  console.log(data)
  res.send(data)
})

// put 语义：修改数据（覆盖式修改）
router.put('/index', (req, res, next) => {
  const data = req.body
  console.log(data)
  res.send(data)
})

// patch 语义：修改数据（增量修改）
router.patch('/index', (req, res, next) => {
  const data = req.body
  console.log(data)
  res.send(data)
})

// 语义：删除数据
router.delete('/index', (req, res, next) => {
  const data = req.body
  console.log(data)
  res.send(data)
})
module.exports = router