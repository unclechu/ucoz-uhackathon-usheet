#!/usr/bin/env node

'use strict';


var domain = require('domain');
var appDomain = domain.create(); // домен для ошибок, выпадающих из server

appDomain.on('error', function(err) {
	console.error("Fatal error catched: \n" + err.stack || err);
	if ('development' != process.env.NODE_ENV) {
		/*
		 * для режима development не используем остановку программы(process.exit),
		 * так как supervisor будет ее перезапускать бесконечно в случае фатальной ошибки
		 */
		process.exit(255);
	}
});

process.on('uncaughtException', function(err) {
	console.error(
		'process.on.uncaughtException',
		err.stack || err
	);
	process.exit(0);
});

appDomain.run(function() {
	require('./server');
});

process.on('shutdown', function(msg) {
	process.exit(0);
});
