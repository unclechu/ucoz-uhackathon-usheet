#!/usr/bin/env node

'use strict';

var express = require('express');
var path = require('path');
var jade = require('jade');

var app = express();
var cfg = require('./config.json');

var staticPath = 'public';
var revision = 1;

app = express();
app.engine('jade', jade.__express);
app.set('views', path.resolve(process.cwd(), 'templates'));
app.set('view engine', 'jade');

app.use(path.join('/', staticPath), express.static(staticPath));

var traits = {
	staticFile: function (file) {
		while (file.charAt(0) === '/') {
			file = file.slice(1);
		}
		return path.join('/', staticPath, file) + '?v=' + revision;
	},
	staticDir: function (dir) {
		if ( ! dir) {
			dir = '';
		}
		while (dir.charAt(0) === '/') {
			dir = dir.slice(1);
		}
		return path.join('/', staticPath, dir);
	}
};


app.get('/', function (req, res) {
	res.render('pages/main.jade', traits);
});

var server = app.listen(cfg.port, cfg.host, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});
