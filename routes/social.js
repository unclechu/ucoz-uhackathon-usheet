'use strict';

var passport       = require('passport');
var LocalStrategy  = require('passport-local').Strategy;

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
		
	
	registerForm : function(req, res) {
		res.render('pages/reg.jade');
	},
	
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
	
	mustAuthenticatedMw: function (req, res, next){
		req.isAuthenticated()
			? next()
			: res.redirect('/');
	}
};


module.exports = Social;
