var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieSession = require('cookie-session')
var session = require('express-session')
// var cors = require('cors')

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

const userRouter = require('./routes/users')
const postionsRouter = require('./routes/postions')
const mobileRouter = require('./routes/mobile.js')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors); // 加上跨域之后所有路由都不跑了，不知道为什么

// 设置cookie-session
// app.use(cookieSession({
//   name: 'username',
//   keys: ['key1']
// }))
// 全局使用session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
)
app.use('/api/users', userRouter)
app.use('/api/positions', postionsRouter)
app.use('/mobile', mobileRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
