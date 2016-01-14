var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');

var mycrypto = require('./mycrypto');
var logger = require('./logger');
var captcha = require('./code/verify');
var main = require('./routes/main');
var json = require('./routes/json');
var avatar = require('./routes/avatar');
var User = require('./models/user.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// the logger
logger.use(app);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//the passport
app.use(session({
    secret: 'www.graduateinfo.com',
    cookie: {maxAge: 6000000},
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy(
    {passReqToCallback: true},
    function (req, username, password, done) {
        // The verify code
        if (req.body.veri.toLowerCase() !== req.session.veri)
            return done(null, false, {message: 'Incorrect verify code'});
        // The admin user
        if (req.body.role === 'admin') {
            var adminJson = JSON.parse(fs.readFileSync('./admin.json'));
            if (req.body.username !== adminJson.id)
                return done(null, false, {message: 'Login error !'});

            var passwd= mycrypto.hashsha1(req.body.password);
            if (passwd === adminJson.password)
                return done(null, {id: adminJson.id, role: 'admin', name: adminJson.name});

            return done(null, false, {message: 'Login err !'});

        } else {
            // Not the admin user
            User.findOne({id: req.body.username}, function (err, user) {
                if (!user)
                    return done(null, false, {message: 'Login error !'});

                //var username = req.body.username;
                var password = mycrypto.hashsha1(req.body.password);

                if (user.passwd !== password)
                    return done(null, false, {message: 'Login err !'})

                //the role
                var role = mycrypto.cipheraes(req.body.role, user.name);
                if (user.role !== role)
                    return done(null, false, {message: 'Login err !'});

                //the session user
                return done(null, {id: req.body.username, name: user.name, role: req.body.role});
            });
        }
    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


//the router
// the index
app.get('/', function (req, res) {
    res.render('index', {title: 'news page'});
});

// the verify code
app.get('/code/:id', function (req, res) {
    var code = captcha.captcha();
    req.session.veri = code[0];
    res.set('Content-Type', 'image/jpeg');
    res.send(code[1]);
});

//the login
app.get('/login', function (req, res) {
    res.render('login', {title: 'login page'});
});

//the authentication
app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log(info.message);
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err)
                return next(err);
            res.redirect('/main');
        });
    })(req, res, next);
});

app.all('/*/', isLoggedIn);
app.use('/main', main);
app.use('/json', json);
app.use('/avatar', avatar);

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else
        res.redirect('/login');
}

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
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
