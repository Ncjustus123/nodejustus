var express = require('express');
var router = express.Router();
var multer= require ('multer');
var upload= multer({dest: "./uploads"});
var User = require('../models/user');
var LocalStrategy = require ('passport-local').Strategy;
var passport = require ('passport');

const { check, validationResult } = require('express-validator');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'register'});
});
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});
router.post('/login', 
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:'Invalid username or password'}),
  function(req, res) {
    req.flash('success','You are now logged  in');
    res.redirect('/');
    res.redirect('/users/' + req.user.username);
  });
 

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new LocalStrategy(function(username,password,done){
  User.getUserbyUsername(username,function(err,user) {
    if(err) throw err;
    if(!user){
      return done(null,false, {message:'Unknown User'});
    }

    User.comparePassword(password,user.password,function(err, isMatch){
      if(err) return done (err);
      if(isMatch){
        return done (null,user);
      }else {
        return done (null,false,{message:'Invalid Password'});
      }
    });
  });
}));

 
/*Get home page */ 
router.get('/', function(req, res, next) {
  res.render('index',{title:'members'});
});
  
 

router.post('/register', upload.single('file'), [
  // username must be an email
  check('name','Name field is required').notEmpty(),
  check('email','Email is not valid').isEmail(),
  check('username','Username field is required').notEmpty(),
  check('password','Password field is required').notEmpty(),
  //check('password2','Passwords do not match').equals('password')
], function(req, res, next) {
  console.log(req.file);
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
 if (req.file){
  console.log('Uploading image...');
  var profileimage=req.file.filename;
 }else{
  console.log('No file Uploaded...');
  var profileimage='no image.jpg';
 }
 // Form validator 

 //check errors 
 const errors = validationResult(req);
 //var errors = req.validationErrors();

 if(!errors.isEmpty()){
   console.log(errors);
  res.render('register',{  errors: errors.array() });
return;
 }else{
  var newUser = new User({
    name: name,
    email:email,
    username:username,
    password:password,
    profileimage:profileimage
  });

  User.createUser(newUser, function(err,user){
    if(err)throw err;
    console.log(user);

  });

  req.flash('success','You are now registered and can login ');

  res.location('/');
  res.redirect('/');
 }
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success','You are now logeed out');
  res.redirect('/users/login');
});

module.exports = router;
 