const { application, json } = require('express')
const usersModel = require('../models/users')
const { hash, compare, sign, verify } = require('../utils/tools')
const randomstring = require('randomstring')
// 判断用户是否存在
// 注册用户
const signup = async (req, res, next) => {
  res.set("contetn-type", "application/json;chartset=utf-8")
  const { username, password } = req.body
  // 密码加密
  const bcryptHashPassword = await hash(password)
  const findResulte = await usersModel.findUser(username)
  if (findResulte) {
    res.render('fail', {
      data: JSON.stringify({
        message: '用户名已存在'
      })
    })
  } else {
    // 数据库里没有这个用户，开始添加用户
    let resulte = await usersModel.signup({
      username,
      password: bcryptHashPassword
    })

    res.render('success', {
      data: JSON.stringify({
        message: '注册成功！'
      })
    })
  }
}

const list = async (req, res, next) => {
  const listResult = await usersModel.findList()
  res.render('success', {
    data: JSON.stringify(listResult)
  })
}
const remove = async (req, res, next) => {
  const { id } = req.body
  let removeResult = await usersModel.remove(id)
  if (removeResult) {
    res.render('success', {
      data: JSON.stringify({
        message: '用户删除成功'
      })
    })
  } else {
    res.render('fail', {
      data: JSON.stringify({
        message: '用户删除失败'
      })
    })
  }
}

// 登录
const signin = async (req, res, next) => {
  const { username, password } = req.body
  let resulte = await usersModel.findUser(username)
  if (resulte) {
    let { password: hash } = resulte
    let compareResulte = await compare(password, hash)
    // 对比密码成功
    if (compareResulte) {
      // 在http请求中后端可以利用写一个cookies到前端
      // const sessionId = randomstring.generate()
      // res.set('Set-cookie', `sessionId=${sessionId}; Path=/; HttpOnly`)
      // req.session.username = username
      const token = sign(username)
      res.set('X-Access-Token', token)
      res.render('success', {
        data: JSON.stringify({
          username
        })
      })
    } else {
      res.render('fail', {
        data: JSON.stringify({
          // message: '密码错误'
          message: '用户名或密码错误'
        })
      })
    }
  } else {
    res.render('success', {
      data: JSON.stringify({
        // message: '用户名错误'
        message: '用户名或密码错误'
      })
    })
  }
}

const isAuth = async (req, res, next) => {
  const token = req.get('X-Access-Token')
  try {
    let result = verify(token)
    res.render('success', {
      data: JSON.stringify({
        username: result.username
      })
    })
  } catch {
    res.render('fail', {
      data: JSON.stringify({
        message: '请登录'
      })
    })
  }
}
// 退出
const signout = async (req, res, next) => {
  req.session = null
  res.render('success', {
    data: JSON.stringify({
      message: '退出成功'
    })
  })
}
exports.signup = signup
exports.list = list
exports.remove = remove
exports.signin = signin
exports.signout = signout
exports.isAuth = isAuth