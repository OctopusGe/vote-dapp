const createError = require('http-errors');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
//var logger = require('morgan');

const routes = require('./routers');

const app = express();

// 配置模板引擎
// app.engine('html', exphbs({
//   layoutsDir: 'views',
//   //defaultLayout: 'register',
//   extname: '.html'
// }));
// //app.set('view', path.join(__dirname, 'view'));
// app.set('view engine', 'html');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 如果在环境变量内, 设定了程序运行端口，则使用环境变量设定的端口号, 否则使用3000端口
app.set('port', process.env.PORT || 3000);

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 允许跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-headers', 'Content-Type, X-Requested-With');
  next();
});

routes(app);

// 匹配根路由 / (如果不特别指明返回的状态码, 则默认返回200)
app.get('/', function(req, res) {
  res.render('login');
});

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

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

// 监听服务端口, 保证程序不会退出
app.listen(app.get('port'), function() {
  console.log('Express 服务正在运行在 http://localhost:' + app.get('port') + '; 按 Ctrl-C 关闭服务.');
});
//module.exports = app;
