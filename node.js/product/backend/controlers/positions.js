const positionsModel = require('../models/positions')
const moment = require('moment')
exports.add = async (req, res, next) => {
  let result = await positionsModel.add({
    ...req.body,
    createTime: moment().format('YYYY年MM月DD日 HH:mm')
  })
  if (result) {
    res.render('success', {
      data: JSON.stringify({
        message: '职位添加成功！'
      })
    })
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '职位添加失败'
      })
    })
  }
}

exports.list = async (req, res, next) => {
  let result = await positionsModel.list()
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

exports.remove = async (req, res, next) => {
  let result = await positionsModel.remove(req.body.id)
  try {
    if (result.deletedCount > 0) {
      res.render('success', {
        data: JSON.stringify({
          message: '职位删除成功！'
        })
      })
    } else {
      res.render('fail', {
        data: JSON.stringify({
          message: '职位删除失败。'
        })
      })
    }
  } catch (err) {
    res.render('fail', {
      data: JSON.stringify({
        message: '职位删除失败。'
      })
    })
  }
  res.send('ok')
}