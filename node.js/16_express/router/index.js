const express = require('express')
const { list, token } = require('../controler')
// 路由中间件
const router = express.Router()
router.get('/api/list', list)
router.get('/api/token', token)
module.exports = router