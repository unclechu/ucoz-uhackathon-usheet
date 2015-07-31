#!/usr/bin/env node

'use strict';

var cfg = require('./config.json');
var express = require('express');
var path = require('path');
var jade = require('jade');
var routes = require('./routes');

GLOBAL.U = {
	db   : require('./model/db')(cfg.db),
	model: {
		user : require('./model/user')
	}
};

var staticPath = 'public';
var revision = 1;

var app = express();
app.use(require('express-domain-middleware'));
app.engine('jade', jade.__express);
app.set('views', path.resolve(process.cwd(), 'templates'));
app.set('view engine', 'jade');

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

// обработка ошибок на уровне express
app.use(function(err, req, res, next) {
	if (res.error) {
		res.error(err);
	} else {
		console.log(err);
	}
});

app.get('/', routes.index);
app.get('/test', function (req, res) {
	console.log('test');
	res.end('test');
});


var server = app.listen(cfg.port, cfg.host, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});
