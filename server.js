
'use strict';

var cfg      = require('./config.json');
var express  = require('express');
var sessions = require('client-sessions');
var passport = require('passport');
var path     = require('path');
var jade     = require('jade');


var routesIndex  = require('./routes/index');
var routesSocial = require('./routes/social');

GLOBAL.U = {
	db    : require('./model/db')(cfg.db),
	model : {
		user : require('./model/user')
	},
	lib   : require('./lib')
};


var staticPath = 'public';
var revision = 1;

var app = express();
app.use(require('express-domain-middleware'));
app.engine('jade', jade.__express);
app.set('views', path.resolve(process.cwd(), 'templates'));
app.set('view engine', 'jade');

app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser(cfg.session.secret));
app.use(sessions(cfg.session));


// Passport:
app.use(passport.initialize());
app.use(passport.session());

app.use(path.join('/', staticPath), express.static(staticPath));

app.locals.isDebug  = cfg.isDebug ? true : false;
app.locals.revision = revision;

app.locals.staticFile = function (file) {
	while (file.charAt(0) === '/') {
		file = file.slice(1);
	}
	return path.join('/', staticPath, file) + '?v=' + revision;
};

app.locals.staticDir = function (dir) {
	if ( ! dir) {
		dir = '';
	}
	while (dir.charAt(0) === '/') {
		dir = dir.slice(1);
	}
	return path.join('/', staticPath, dir);
};


app.use(function(req, res, next) {
	res.ok = function(code){
		return function(err,data){
			if (err) {
				req.prodlog('res.ok error ', err.stack || err);
				return res.error(err);
			}
			try{
				return code(data);
			} catch (e) {
				res.error(e);
			}
		};
	};
	
	next();
});


//
var routes = require('./routes');
app.use(function(req, res, next) {
	app.router(req, res, next);
});
routes(app);
//app.get('/', function(req, res){
//	res.send('hello world');
//});


// обработка ошибок на уровне express
app.use(function(err, req, res, next) {
	console.log('error', err);
	if (res.error) {
		res.error(err);
	} else {
		res.status(500).send('Sorry, something wrong!');
	}
});


var server = app.listen(cfg.port, cfg.host, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});
