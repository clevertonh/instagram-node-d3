var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var enforce = require('express-sslify');

var root = require('./routes/index');
var ig = require('./routes/ig');


var app = express();

// use HTTPS only when not in development and behind Heroku's LB
if (app.get('env') !== 'development') {
    app.use(enforce.HTTPS());
}

var server = require('http').Server(app);
var io = require('socket.io')(server);
var session = require('express-session')

var socket = require('./lib/socket_helper')
var instagram = require('./lib/instagram')

// Sets up sessions
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false
}));

app.set('io', io);
app.set('server', server);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(logger('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret_key'));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', root);
app.use('/ig', ig);

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
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

instagram.initialize();

socket.initialize(io);

module.exports = app;
