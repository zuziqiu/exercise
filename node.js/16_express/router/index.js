const express = require('express')
const { list } = require('../controler')
// 路由中间件
const router = express.Router()
router.get('/api/list', list)
module.exports = router