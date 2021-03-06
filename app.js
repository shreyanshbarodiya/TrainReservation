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
var pnr = require('./routes/pnr');
var pnr_enquiry = require('./routes/pnr_enquiry');
var signup = require('./routes/signup');
var login = require('./routes/login');
var station = require('./routes/station');
var wallet = require('./routes/wallet');
var search_trains = require('./routes/search_trains');
var booked_history = require('./routes/booked_history');
var schedule = require('./routes/schedule');
var cancel = require('./routes/cancel');
var booking_form = require('./routes/booking_form');
var book_ticket = require('./routes/book_ticket');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set up passport
app.use(session({secret: '4i6XUv7GI183FLTkl9h7zYCaZe9Gb70w', resave: false, saveUninitialized: true}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use('local-login', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        models.User.findByPrimary(username).then(function (user) {
            if (!user)
                return done(null, false, {message: "Incorrect username"});
            if (!passwordHash.verify(password, user.password))
                return done(null, false, {message: "Incorrect password"});

            return done(null, {username: user.username, name: user.name, balance: user.balance});
        }).catch(function (error) {
            return done(null, false, {message: "Database Error: " + error.message});
        })
    }
));

passport.use('local-signup', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        models.User.findOrCreate({
            where: {username: username},
            defaults: {
                name: req.body.firstname + ' ' + req.body.lastname,
                password: passwordHash.generate(password),
                ph_no: req.body.mobile,
                balance: 0
            }
        })
            .spread(function (user, created) {
                if (created) {
                    return done(null, {username: user.username, name: user.name, balance: user.balance});
                }
                else
                    return done(null, false, {message: "This username is taken"});
            })
            .catch(function (error) {
                return done(null, false, {message: "Database Error: " + error.message});
            })
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

/* All public routes */
app.use('/pnr_enquiry', pnr_enquiry);
app.use('/signup', signup);
app.use('/search_trains', search_trains);
app.use('/schedule', schedule);

app.use('/login', login);
/* Authentication middleware*/

app.use(ensureAuthenticated);
/* All private routes below */
app.use('/', routes);
app.use('/pnr', pnr);
app.use('/station', station);
app.use('/wallet', wallet);
app.use('/cancel', cancel);
app.use('/booked_history', booked_history);
app.use('/booking_form', booking_form);
app.use('/book_ticket',book_ticket);

app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/login');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
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
        res.render('login', {title: "Login"});
}

module.exports = app;
