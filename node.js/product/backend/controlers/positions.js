const positionsModel = require('../models/positions');
const moment = require('moment');
exports.add = async (req, res, next) => {
  res.set('content-type', 'application/json; charset=utf-8');
  let result = await positionsModel.add({
    ...req.body,
    companyLogo: req.companyLogo,
    createTime: moment().format('YYYY年MM月DD日 HH:mm')
  });
  if (result) {
    process.socket.emit('message', 'ok')
    res.render('success', {
      data: JSON.stringify({
        message: '职位添加成功！'
      })
    });
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '职位添加失败'
      })
    });
  }
};

exports.list = async (req, res, next) => {
  let result = await positionsModel.list();
  if (result) {
    res.json(result);
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '获取数据失败。'
      })
    });
  }
};

exports.listOne = async (req, res, next) => {
  let result = await positionsModel.listOne(req.body.id);
  if (result) {
    res.json(result);
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '获取数据失败。'
      })
    });
  }
};

exports.remove = async (req, res, next) => {
  let result = await positionsModel.remove(req.body.id);
  try {
    if (result.deletedCount > 0) {
      res.render('success', {
        data: JSON.stringify({
          message: '职位删除成功！'
        })
      });
    } else {
      res.render('fail', {
        data: JSON.stringify({
          message: '职位删除失败。'
        })
      });
    }
  } catch (err) {
    res.render('fail', {
      data: JSON.stringify({
        message: '职位删除失败。'
      })
    });
  }
  res.send('ok');
};

exports.update = async (req, res, next) => {
  res.set('content-type', 'application/json; charset=utf-8');
  const _data = {
    ...req.body
    // createTime: moment().format('YYYY年MM月DD日 HH:mm')
  };
  if (req.companyLogo) {
    _data.companyLogo = req.companyLogo;
  }
  let result = await positionsModel.update(_data);
  if (result) {
    res.render('success', {
      data: JSON.stringify({
        message: '职位改写成功！'
      })
    });
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '职位改写失败'
      })
    });
  }
};
