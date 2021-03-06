var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyparsar = require('body-parser');
var session = require ('express-session');
var passport = require ('passport');
var expressValidator = require('express-validator');
const { check, validationResult } = require('express-validator');
var LocalStrategy = require ('passport-local').Strategy;
var multer= require ('multer');
var upload=multer({dest: "./uploads"});
var flash = require ('connect-flash');
var bcrypt = require ('bcryptjs');
var mongo = require ('mongodb');
var mongoose = require ('mongoose');
var logger = require('morgan');

mongoose.connect('mongodb+srv://admin:admin@cluster0-pmphy.azure.mongodb.net/test');
let db = mongoose.connection;

//check connection 
db.once('open', function(){
  console.log('connected to MongoDB')
});
//check for db errors
db.on('error', function(err){
  console.log(err)
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/image/12.jpg')));




// Handle sessions 
app.use(session({
  secret:'secret',
  saveUnitilized: true,
  resave: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

// //Validator
//app.use(expressValidator());
// app.use(expressValidator({
//   // errorFormatter:function(param, msg, value,){
//   //   var namespace = param.slipt('.')
//   //   ,root  = namespace.shift()
//   //   ,formParam = root;

//   //   while(namespace.lenght) {
//   //     formParam += '[' + namespace.shift() + ']'
//   //   }
//   //   return {
//   //     param : formParam,
//   //     msg   : msg,
//   //     value : value 
//   //   };
//   // }

// }));
 

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('*', function (req, res, next){
  res.locals.user = req.user || null;
  next();
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



module.exports = app;
