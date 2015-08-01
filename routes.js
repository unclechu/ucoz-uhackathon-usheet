'use strict';

var
	Router = require('urouter'),
	index  = require('./routes/index'),
	social = require('./routes/social'),
	site   = require('./routes/site'),
	ucoz   = require('./routes/ucoz');

module.exports = function (app) {
	Router(app, function ($) {
		
		$.bridge(index.userBridg, function ($) {
			
			$.get('/').to(index.index);
			
			$.get('/is_auth').to(index.isAuth);
			
			$.post ( '/login'    ) .to(social.login);
			$.post ( '/register' ) .to(social.register);
			$.post ( '/logout'   ) .to(social.logout);
			$.get  ( '/logout'   ) .to(social.logout); // на всякий пожарный
			
			$.get  ( '/ulogin/callback'    ) .to(social.uloginCallback);
			$.post ( '/ulogin/callback'    ) .to(social.uloginCallback);
			$.get  ( '/signin-ucoz-iframe' ) .to(social.uloginWrap);
			$.post ( '/signin-ucoz-iframe' ) .to(social.uloginWrap);
			
			
			$.bridge(social.authBridh, function ($) {
				$.bridge('/site', function ($) {
					$.get  ( '/add'    ) .to(site.form);
					$.post  ( '/edit'    ) .to(site.edit);
					$.post  ( '/remove'    ) .to(site.remove);
					$.post ( '/search' ) .to(site.search);
					$.post ( '/add'    ) .to(site.add);
					$.get ( '/list'   ) .to(site.list);
					$.get ( '/blog_list'   ) .to(site.blogList);
					$.post ( '/remove' ) .to(site.remove);
					$.get('/search').to(site.search);
				});
				
				$.bridge('/publish', function($) {
					$.post('/blog').to(site.publishBlog);
					$.post('/page').to(site.publishPage);
					
				});
			});
			
			// test routes TODO remove
			$.get('/login').to(social.loginForm);
			$.get('/reg').to(social.registerForm);
			$.get('/user/create').to(index.createUser);
			
			$.get('/test2').to(function (req, res) {
				setTimeout(function () {
					throw new Error('1234');
					res.send('test');
				}, 1000);
			});
		});
		
		// Если не смогли никак обработать
		$.get('*').to(function (req, res) {
			res.status(404).send('Sorry, we cannot find that!');
		});
		
	}, function (errors) {
		errors.forEach(function (err) {
			console.error('Router error', err);
		});
	});
};
