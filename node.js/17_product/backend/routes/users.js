var express = require('express');
var router = express.Router();

const { signup, list, remove, signin, signout, isAuth } = require('../controlers/users')
const { auth } = require('../middlewares/auth')
/* GET users listing. */
router.post('/', auth, signup);
router.get('/', auth, list);
router.delete('/', auth, remove);

router.post('/signin', signin)
router.get('/signout', signout)
router.get('/isAuth', isAuth)
module.exports = router;
