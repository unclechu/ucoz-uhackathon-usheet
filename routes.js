'use strict';

var
	Router         = require('urouter'),
	index           = require('./routes/index'),
	social           = require('./routes/social');

module.exports = function(app) {
	Router(app, function($) {
		$.get('/').to(index.index);
		$.get('/is_auth').to(index.isAuth);
		$.get('/reg').to(social.registerForm);
		$.post('/login').to(social.login);
		$.post('/register').to(social.register);
		$.post('/logout').to(social.logout);
		
		
		$.get('/user/create').to(index.createUser);
		$.get('/search').to(index.search);
		$.get('/test2').to(function (req, res) {
			setTimeout(function() {
				throw new Error('1234');
				res.send('test');
			}, 1000);
		});
		
		// Если не смогли никак обработать
		$.get('*').to(function(req, res){
			res.status(404).send('Sorry, we cannot find that!');
		});
	}, function(errors){
		errors.forEach(function(error){
			console.log('Router error', error);
		});
	});
};
