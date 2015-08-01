'use strict';

var cfg           = require('../config.json');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request       = require('request');


passport.use(new LocalStrategy({
	
	usernameField: 'email',
	passwordField: 'password',
	
}, function (username, password, done) {
	
	U.model.user.findOne({ login : username }, function (err, user) {
		
		if (err) {
			console.error(
				"user model findOne error for username '"+ username +"'",
				err.stack || err
			);
			done(err);
			return;
		}
		
		if ( ! user) {
			done(null, false, { message: 'Incorrect username' });
			return;
		}
		
		user.comparePassword(password, function (err, isMatch) {
			
			if (err) {
				console.error(
					"Compare password error for user '"+ username +"'.",
					err.stack || err
				);
				done(err);
				return;
			}
			
			if (isMatch) {
				done(null, user.toJSON());
			} else {
				done(null, false, { message: 'Incorrect password' });
			}
		});
	});
}));


passport.serializeUser(function (user, done) {
	console.log('serializeUser', user._id);
	done(null, user._id);
});


passport.deserializeUser(function (id, done) {
	
	U.model.user.findOne({ login: id }, function (err, user) {
		
		console.log('deserializeUser', id);
		
		if (err) {
			console.error(
				'User model findOne error by "'+ id +'"',
				err.stack || err
			);
			done(err);
			return;
		}
		
		done(null, user);
	});
});


var Social = {
	
	authBridh: function(req, res, next) {
		if (req.user) {
			next();
		} else {
			res.status(403).end();
		}
	},
	
	uloginCallback: function(req, res) {
		var token = req.body.token;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		
		
		if (token && ip) {
			request(
				'http://ulogin.ru/token.php?token=' + token + '&host=' + ip,
				function (error, response, body) {
					var query = {};
					
					if (error || response.statusCode !== 200) {
						return res.status(500).end('error');
					} else {
						try {
							var data = JSON.parse(body);
						} catch(e) {
							return res.status(500).error(e);
						}
						
						if (data.email) {
							query['login'] = data.email;
						} else if (response.uid) {
							query['uid'] = data.uid;
						} else {
							return res.status(500).end('error');
						}
						
						U.model.user.findOne(query).exec(res.ok(function (user) {
							if (user) {
								req.session.userId   = user._id;
								req.session.username = 'uid'+user.uid;
								res.redirect('/');
								return;
							}
							
							new U.model.user({
								login : data.email,
								uid   : data.uid,
							}).save(res.ok(function (user) {
								
								req.session.userId   = user._id;
								req.session.username = 'uid'+user.uid;
								res.redirect('/');
							}));
						}));
					}
				}
			);
		} else {
			return res.status(500).end('error4');
		}
	},
	
	uloginWrap: function (req, res) {
		var callbackUrl = encodeURIComponent(cfg.ulogin.callbackUrl);
		res.render('pages/signin-ucoz-iframe', { callbackUrl: callbackUrl });
	},
	
	// TODO remove
	registerForm: function(req, res) {
		res.render('pages/reg.jade');
	},
	
	// TODO remove
	loginForm: function(req, res) {
		res.render('pages/loginForm.jade');
	},
	
	
	login: function(req, res, next) {
		
		passport.authenticate('local', function (err, user, info) {
			
			if (err) {
				console.error('Passport auth error', err.stack || err);
				next(err);
				return;
			}
			
			
			if ( ! user) {
				// incorrect login or password
				res.status(406).json(info);
				return;
			}
			
			req.session.userId   = user._id;
			req.session.username = user.login;
			req.logIn(user, function (err) {
				
				if (err) {
					console.error('req.logIn error', err.stack || err);
					next(err);
					return;
				}
				
				res.status(200).json({ status: 'success' });
			});
			
		})(req, res, next);
	},
	
	
	
	// Здесь все просто =)
	logout: function(req, res) {
		
		req.logout();
		delete req.session.userId;
		delete req.session.username;
		res.status(200).json({ status: 'success' });
	},
	
	
	/**
	 * Регистрация пользователя.
	 * Создаем его в базе данных, и тут же, после сохранения,
	 * вызываем метод `req.logIn`, авторизуя пользователя.
	 */
	register: function(req, res, next) {
		
		console.info("Registering new user '"+ req.body.email +"'...");
		
		var user = new U.model.user({
			login    : req.body.email,
			password : req.body.password,
		});
		
		user.validate(function (err) {
			
			if (err) {
				console.error(
					"Saving user model validate error for username '"
					+ req.body.email +"'",
					err.stack || err
				);
				next(err);
				return;
			}
			
			user.save(function(err, userSaved) {
				
				if (err) {
					
					// duplicate
					if (err.code === 11000) {
						console.error(
							"Cannot register username '"+ req.body.email +"'"
							+", because this username already taken."
						);
						res.status(406).json({
							message: 'Username already taken'
						});
						return;
					}
					
					console.error(
						"Saving user model error for username '"
						+ req.body.email +"'",
						err.stack || err
					);
					next(err);
					return;
				}
				
				req.session.userId   = userSaved._id;
				req.session.username = userSaved.login;
				req.logIn(userSaved, function(err) {
					
					if (err) {
						console.error(
							"Registering new user '"
							+ req.body.email +"' error."
						);
						next(err);
						return;
					}
					
					console.info(
						"New user '"
						+ req.body.email
						+"' sucessfully registered."
					);
					res.status(200).json({ status: 'success' });
					
				});//logIn
				
			});//save
			
		});//validate
		
	},//register
};


module.exports = Social;
