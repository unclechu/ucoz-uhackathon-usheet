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

passport.serializeUser(function(user, done) {
	console.log('serializeUser', user.id);
	done(null, user.id);
});


passport.deserializeUser(function(id, done) {
	U.model.user.findOne({login: id}, function(err, user){
		console.log('deserializeUser', err, user, id);
		err
			? done(err)
			: done(null,user);
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
			
			req.session.userId = user._id;
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
	logout : function(req, res) {
		req.logout();
		delete req.session.userId;
		console.log('here', 1);
		res.redirect('/');
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
			password : req.body.password
		});
		
		user.save(function(err) {
			return err
				? next(err)
				: req.logIn(user, function(err) {
					
					if (err) {
						console.error(
							"Registering new user '"
							+ req.body.email +"' error."
						);
					} else {
						console.info(
							"New user '"
							+ req.body.email
							+"' sucessfully registered."
						);
					}
					
					return err ? next(err) : res.status(200).end();
				});
		});
	},
	
	mustAuthenticatedMw: function (req, res, next){
		req.isAuthenticated()
			? next()
			: res.redirect('/');
	}
};


module.exports = Social;
