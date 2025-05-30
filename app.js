var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/indexRouter');
var loginRouter = require('./routes/loginRouter');
var signupRouter = require('./routes/signupRouter');
var accountRouter = require('./routes/accountRouter')
var logoutRouter = require('./routes/logoutRouter');
var productRouter = require('./routes/productRouter');
var cartRouter = require('./routes/cartRouter');
var checkoutRouter = require('./routes/checkoutRouter');
var testRouter = require('./routes/test');

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
require('dotenv').config();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/account', accountRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/test', testRouter);
app.use('/logout', logoutRouter)

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
});

module.exports = app;
