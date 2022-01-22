const { hash, compare, sign, verify } = require('../utils/tools')
const auth = (req, res, next) => {
  // if (req.session.username) {
  //   next()
  // } else {
  //   res.render('fail', {
  //     data: JSON.stringify({
  //       // message: '密码错误'
  //       message: '请登录'
  //     })
  //   })
  // }
  const token = req.get('X-Access-Token')
  try {
    let result = verify(token)
    next()
  } catch {
    res.render('fail', {
      data: JSON.stringify({
        message: '请登录'
      })
    })
  }
}

exports.auth = auth