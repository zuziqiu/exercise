var express = require('express');
var router = express.Router();

const { signup, list, remove, signin } = require('../controlers/users')
/* GET users listing. */
router.post('/', signup);
router.get('/', list);
router.delete('/', remove);

router.post('/signin', signin)
module.exports = router;
