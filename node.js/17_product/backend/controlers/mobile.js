const mobileModel = require('../models/mobile')

exports.positions = async (req, res, next) => {
  let { start, pageSize } = req.query
  let result = await mobileModel.positions(~~start, ~~pageSize) // ~~按位取反两次，不影响整数部分也不影响正反值
  if (result) {
    res.json(result)
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '获取数据失败。'
      })
    })
  }
}
