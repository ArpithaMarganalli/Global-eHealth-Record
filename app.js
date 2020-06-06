/**
 * Module dependencies.
 */
const express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  path = require('path'),
  helmet = require('helmet'),
  session = require('express-session'),
  device = require('express-device'),
  useragent = require('express-useragent'),
  mysql = require('mysql'),
  bodyParser = require("body-parser"),
  expressip = require('express-ip'),
  morgan = require('morgan'),
  querystring = require('querystring'),
  expressValidator = require('express-validator'),
  qrcode = require('qrcode'),
  http = require('http'),
  fs = require('fs'),
  i18n = require('i18n'),
  nodemailer = require('nodemailer'),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  tinyURL = require('tinyurl');

var app = express();

let environment = process.env;
 var connection = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: 'root',
 database: 'healthrecord'
});

// var connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'ehealthdbusers',
//   password: '3#ea1tHdb$3cur3u',
//   database: 'healthrecord'
// });

app.disable('x-powered-by');

connection.connect();
global.db = connection;

app.use(session({
  name: 'labMoneta',
  secret: 'D3an4$0n1',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

i18n.configure({
  locales: ['en', 'ru', 'de', 'zh', 'ja', 'ar', 'fr', 'de'],
  cookie: 'labMoneta',
  defaultLocale: 'fr',
  directory: __dirname + '/locales'
});

app.set('port', environment.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(i18n.init);
app.use('*/styles', express.static('public/styles'));
app.use('*/js', express.static('public/js'));
app.use('*/images', express.static('public/images'));
app.use('*/fonts', express.static('public/fonts'));
app.use(expressip().getIpInfoMiddleware);
app.use(useragent.express());
app.use(device.capture());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.post('/signup', user.signup);
app.post('/login', user.login);
app.post('/recordform/', user.recordform);
app.get('/login', routes.index);
app.get('/', routes.index);
app.get('/signup', user.signup);
app.get('/home/dashboard', user.dashboard);
app.get('/home/question', user.question);
app.get('/home/logout', user.logout);
app.get('/home/records', user.records);
app.get('/recordform/:formId', user.recordform);

app.listen(environment.PORT);