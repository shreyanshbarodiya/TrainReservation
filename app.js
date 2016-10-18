var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var path = require('path');

var LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');

var models = require('./models');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set up passport
app.use(session({secret : 'dgfshdfghjdsvjsdvhvgjbvs', resave: false,  saveUninitialized: true}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  {
    usernameField : 'username',
    passwordField : 'password'
  },
  function (username, password, done) {
    models.User.findByPrimary(username).then(function (user) {
      if(!user)
        return done(null, false, {message : "Incorrect username"});
      if(!passwordHash.verify(password, user.password))
        return done(null, false, {message : "Incorrect password"});

      return done(null, user);
    })
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  models.User.findByPrimary(username).then(function(user) {
    done(null, user);
  }).catch(function(err) {
    done(err, null);
  });
});

// passport set up done

app.all('*', function(req,res,next) {
  if (req.path === '/login' || req.path === '/signup')
    next();
  else
    ensureAuthenticated(req,res,next);
});

app.post('/login', passport.authenticate('local',
  { failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: true
  }
));

app.get('/login', function(req, res) {
  if (req.isAuthenticated())
    res.redirect('/');

  res.render('login', {title: "Login", loginerrmsg: req.flash('error'), signuperrmsg: req.flash('signup_error')});
});

app.get('/logout', function (req, res){
  req.logOut();
  res.redirect('/login');
});

app.post('/signup', function (req, res) {
  models.User.findOrCreate({where: {username: req.body.username},
    defaults: {
      name: req.body.first + ' ' + req.body.last,
      password: passwordHash.generate(req.body.password),
      ph_no: req.body.ph_no,
      balance: 0
    }})
    .spread(function (user, created) {
      if(created)
        res.redirect('/');
      else
        req.flash('signup_error', 'This username is taken');
    })
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    res.render('login', {title : "Login"});
}

module.exports = app;