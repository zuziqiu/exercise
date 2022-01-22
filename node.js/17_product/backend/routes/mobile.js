var express = require('express')
var router = express.Router()

const { positions } = require('../controlers/mobile')
router.get('/positions', positions)

module.exports = router
