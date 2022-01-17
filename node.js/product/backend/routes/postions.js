var express = require('express');
var router = express.Router();

const { add, list, remove, update, listOne } = require('../controlers/positions');
const uploadMiddleware = require('../middlewares/upload');

router.post('/add', uploadMiddleware, add);
router.get('/list', list);
router.delete('/remove', remove);
router.patch('/update', uploadMiddleware, update);
router.post('/listOne', listOne);
module.exports = router;
