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
	
	registerForm : function(req, res) {
		res.render('pages/reg.jade');
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
	
	//
	///**
	// * Есть ли у пользователя доступ к работе с этой соц. сетью
	// */
	//this.bridgeUser = function(req, res, next) {
	//	if ( ! req.o.user.socialData[SocialName].userId) {
	//		//e.log('No access on bridge');
	//		req.prodlog(SocialName + ' | No access on bridge');
	//		res.noAccess();
	//	} else {
	//		next();
	//	}
	//};
	
	//
	///**
	// * Удаление соц. данных у пользователя.
	// *
	// * ВНИМАНИЕ!!! если у пользователя не введены email и password,
	// * - то удалить последнюю соц сеть нельзя!
	// */
	//this.userRemoveApp = function(req, res) {
	//	
	//	var existOtherSocial = false;
	//	
	//	_.each(req.o.user.socialData.toObject(), function(social, name) {
	//		
	//		if (social.userId && name != SocialName) {
	//			existOtherSocial = true;
	//			return false;
	//		}
	//	});
	//	
	//	// нельзя удалять последнюю социальную сеть,
	//	// если не заданны email и пароль
	//	if (
	//		existOtherSocial
	//		|| ( req.o.user.email && req.o.user.hashedPassword )
	//	) {
	//		req.o.user.removeApp(SocialName, res.ok(function() {
	//			res.jsonAnswer();
	//		}));
	//	} else {
	//		
	//		res.jsonValidateAnswer({
	//			msg: res.i18n.__('all.no delete last social network'),
	//		});
	//	}
	//};
	//
	
	///**
	// * Залогинииться через социалку
	// */
	//this.in = function(req, res) {
	//	req.session.userAction = 'login';
	//	if (req.o.user) {
	//		// и ещё запомним аналитику
	//		req.o.user.addLoginAnalytics(req, res.ok(function(){
	//			req.o.user.rememberInSession(req, res.ok(function(){//TODO если этого не сделать, то по каким-то причинам сессия ставится на сутки. Где и кем она ставится я так и не нашел
	//				//для того, чтобы запомнить права пользователя
	//				req.session.userScope = {};
	//				req.session.userScope[SocialName] = e.m.apps[SocialName].getScope();
	//				passport.authenticate(strategyName, {scope: e.m.apps[SocialName].getScope()})(req, res);
	//			}));
	//		}));
	//	} else {
	//		//для того, чтобы запомнить права пользователя
	//		req.session.userScope = {};
	//		req.session.userScope[SocialName] = e.m.apps[SocialName].getScope();
	//		passport.authenticate(strategyName, {scope: e.m.apps[SocialName].getScope()})(req, res);
	//	}
	//};
	//
	//
	///**
	// * Добавить социалку к аккаунту
	// */
	//this.add = function(req, res) {
	//	req.userId = req.o.user._id;
	//	req.session.userAction = 'addSocial';
	//	if (req.o.user) {
	//		//TODO если этого не сделать, то по каким-то причинам сессия ставится на сутки. Где и кем она ставится я так и не нашел
	//		req.o.user.rememberInSession(req, res.ok(function(){
	//			//для того, чтобы запомнить права пользователя
	//			req.session.userScope = {};
	//			req.session.userScope[SocialName] = e.m.apps[SocialName].getScope();
	//			passport.authenticate(strategyName, {scope: e.m.apps[SocialName].getScope()})(req, res);
	//		}));
	//	} else {
	//		//для того, чтобы запомнить права пользователя
	//		req.session.userScope = {};
	//		req.session.userScope[SocialName] = e.m.apps[SocialName].getScope();
	//		passport.authenticate(strategyName, {scope: e.m.apps[SocialName].getScope()})(req, res);
	//	}
	//};
	//
	//
	///**
	// * Создать новый аккаунт через социалку
	// */
	//this.auth = function(req, res) {
	//	req.session.userAction = 'create';
	//	if (req.o.user) {
	//		// и ещё запомним аналитику
	//		req.o.user.addLoginAnalytics(req, res.ok(function(){
	//			//TODO если этого не сделать, то по каким-то причинам сессия ставится на сутки. Где и кем она ставится я так и не нашел
	//			req.o.user.rememberInSession(req, res.ok(function(){
	//				//для того, чтобы запомнить права пользователя
	//				req.session.userScope = {};
	//				req.session.userScope[SocialName] = e.m.apps[SocialName].getScope();
	//				passport.authenticate(strategyName, {scope: e.m.apps[SocialName].getScope()})(req, res);
	//			}));
	//		}));
	//	} else {
	//		//для того, чтобы запомнить права пользователя
	//		req.session.userScope = {};
	//		req.session.userScope[SocialName] = e.m.apps[SocialName].getScope();
	//		passport.authenticate(strategyName, {scope: e.m.apps[SocialName].getScope()})(req, res);
	//	}
	//};
	//
	//
	///**
	// * Основной колбэк, на котрый отправляют соц. сети
	// */
	//this.callback = function(req, res) {
	//	
	//	if ( ! req.session || ! req.session.userAction) {
	//		
	//		req.prodlog('outer_api | userAction is empty', {
	//			social     : SocialName,
	//			reqSession : req.session,
	//		});
	//		
	//		return res.error(new Error('userAction is empty'));
	//	}
	//	
	//	// пользователь не предоставил доступа к своей учетке
	//	if (req.param('error')) {
	//		
	//		e.log.error('No access by user select');
	//		req.prodlog('outer_api | No access by user select', {
	//			social: SocialName,
	//		});
	//		
	//		return res.render('outer_api/close_window');
	//	}
	//	
	//	passport.authenticate(strategyName, function(err, profile) {
	//		
	//		// В случае если соц сеть вернула ошибку
	//		if (err) {
	//			
	//			// Делаю такой "велосипед" из-за того,
	//			// что некоторые стратегии генерят свои ошибки
	//			// и они не рапарсиваются нашим обработчиком.
	//			e.log.error(new Error(err.message || err));
	//			
	//			req.prodlog('outer_api | ERROR ', {
	//				social : SocialName,
	//				error  : err,
	//			});
	//			
	//			return res.render('outer_api/redirect', {
	//				social : SocialName,
	//				error  : res.i18n.__(
	//					'all.no oembed discovery information available from social network'
	//				),
	//			});
	//		}
	//		
	//		// Обработка нажатия в twitter "отмена"
	//		if (req.param('denied')) {
	//			
	//			return res.render('outer_api/redirect', {
	//				social : SocialName,
	//				error  : res.i18n.__(
	//					'all.no oembed discovery information available from social network'
	//				),
	//			});
	//		}
	//		
	//		if ( ! profile || ! profile.id) {
	//			
	//			e.log.error(SocialName + ' | profile.id is empty');
	//			e.log.error(profile);
	//			req.prodlog('outer_api | profile.id is empty', {
	//				social  : SocialName,
	//				profile : profile,
	//			});
	//			
	//			return res.error(new Error('profile.id is empty'));
	//		}
	//		
	//		// scope пользователя
	//		// (права которые были запрошенны для работы с приложением)
	//		profile.scope = [];
	//		if (req.session.userScope[SocialName]) {
	//			profile.scope = req.session.userScope[SocialName];
	//		}
	//		
	//		//var condition = '"socialData. + SocialName + '.userId''
	//		var condition = { $or: [] };
	//		var cond1 = {};
	//		cond1['socialData.' + SocialName + '.userId'] = profile.id;
	//		condition.$or.push(cond1);
	//		var cond2 = {};
	//		cond2['socialData.' + SocialName + '.userId'] = profile.id.toString();
	//		condition.$or.push(cond2);
	//		
	//		if (
	//			req.session.userAction
	//			&& req.session.userAction === 'siteAddApp'
	//		) {
	//			return obj._crateOrUpdateSiteApp(req, res, profile);
	//		}
	//		
	//		var map = {
	//			
	//			addSocial: function(user) {
	//				
	//				obj._addSocial(req, res, user, profile);
	//			},
	//			
	//			create: function(user) {
	//				
	//				// Если это анонимный пользователь,
	//				// то заменяем анонима на того, кого нашли.
	//				if (req.o.user && req.o.user.isAnonymous) {
	//					
	//					e.m.site.changeSitesOwner(
	//						req.o.user._id,
	//						user._id,
	//						res.ok(function(){
	//							obj._create(req, res, user, profile);
	//						})
	//					);
	//					
	//				} else {
	//					obj._create(req, res, user, profile);
	//				}
	//			},
	//			
	//			login: function(user) {
	//				
	//				if (user) {
	//					
	//					// Если это анонимный пользователь,
	//					// то заменяем анонима на того, кого нашли.
	//					if (req.o.user && req.o.user.isAnonymous) {
	//						
	//						e.m.site.changeSitesOwner(
	//							req.o.user._id,
	//							user._id,
	//							res.ok(function() {
	//								obj._login(req, res, user, profile);
	//							})
	//						);
	//						
	//					} else {
	//						obj._login(req, res, user, profile);
	//					}
	//					
	//				} else if (
	//					profile.verifiedEmail
	//					&& profile.emails
	//					&& profile.emails[0]
	//					&& profile.emails[0].value
	//					&& profile.emails[0].value.length > 0
	//				) {
	//					
	//					// пытаемся получить пользователя по email
	//					e.m.user.findOne(
	//						{ email: profile.emails[0].value },
	//						res.ok(function(user) {
	//							
	//							if ( ! user) {
	//								
	//								e.log.error(
	//									SocialName
	//									+ ' | User not exist with email: '
	//									+ profile.emails[0].value
	//								);
	//								
	//								return res.render('outer_api/redirect', {
	//									social : SocialName,
	//									error  : res.i18n.__('all.you are not logged in'),
	//								});
	//							}
	//							
	//							obj._login(req, res, user, profile);
	//						})
	//					);
	//					
	//				} else {
	//					
	//					req.prodlog('outer_api | login | no found user', {
	//						social  : SocialName,
	//						profile : profile,
	//					});
	//					
	//					// если логинились и не нашли пользователя
	//					res.render('outer_api/redirect', {
	//						social : SocialName,
	//						error  : res.i18n.__('all.you are not logged in'),
	//					});
	//				}
	//			},
	//		};
	//		
	//		e.m.user.findOne(condition, res.ok(function(user) {
	//			
	//			var f = map[req.session.userAction];
	//			
	//			if (f) {
	//				f(user);
	//			} else {
	//				res.noAccess();
	//			}
	//		}));
	//		
	//	})(req, res);
	//};
	//
	//
	///**
	// * Внимание!!!
	// * @param expires - ожидаем в секундах
	// */
	//this.getExpires = function(expires) {
	//	expires = expires || 0;
	//	return new Date().getTime() + expires * 1000;
	//};
	//
	//
	//this._crateOrUpdateUserApp = function(user, profile, cb) {
	//	e.m.apps[SocialName].findOne({userId: profile.id}, cb.ok(function(app){
	//		if (app) {
	//			if (profile.accessToken) app.accessToken = profile.accessToken;
	//			if (profile.refreshToken) app.refreshToken = profile.refreshToken;
	//			if (profile.scope && profile.scope.length) app.scope = _.union(app.scope, profile.scope);
	//			app.save(cb.ok(function(app){
	//				user.socialData[SocialName] = {
	//					userId: profile.id,
	//					_id: app._id
	//				};
	//				user.save(cb);
	//			}));
	//		} else {
	//			new e.m.apps[SocialName]({
	//				accessToken : profile.accessToken,
	//				refreshToken: profile.refreshToken,
	//				expires     : obj.getExpires(profile.expires),
	//				firstName   : (profile.name && profile.name.givenName) ? profile.name.givenName : '',
	//				lastName    : (profile.name && profile.name.familyName) ? profile.name.familyName : '',
	//				userId      : profile.id,
	//				rawData     : profile._raw || '',
	//				scope       : profile.scope
	//			}).save(cb.ok(function(app){
	//					user.socialData[SocialName] = {
	//						userId: profile.id,
	//						_id: app._id
	//					};
	//					user.save(cb);
	//				}));
	//		}
	//	}));
	//};
	//
	//
	//this._login = function(req, res, userFound, profile){
	//	if (userFound.socialData && userFound.socialData[SocialName].userId) {//если у пользователя уже подключенна эта социалка
	//		userFound.login(req, res, res.ok(function(){
	//			res.render('outer_api/redirect', {social: SocialName});
	//		}));
	//	} else {//подключаем пользователю социалку
	//		//если у пользователя нет еще аватарки, берем с соц сети
	//		obj.uploadAvatar(userFound, profile, function(err){
	//			if (err) {
	//				e.log.error(err);
	//				req.prodlog('outer_api | upload avatar error', {social: SocialName, profile: profile, error: err});
	//			}
	//		});
	//		obj._crateOrUpdateUserApp(userFound, profile, res.ok(function(app){
	//			userFound.login(req, res, res.ok(function(){
	//				res.render('outer_api/redirect', {social: SocialName});
	//			}));
	//		}));
	//	}
	//};
	//
	//
	//this._create = function(req, res, userFound, profile){
	//	//если пользователь которого нашли уже имеет эту социалку, то логинем его
	//	if (userFound && userFound.socialData[SocialName] && userFound.socialData[SocialName].userId) {
	//		userFound.login(req, res, res.ok(function(){
	//			res.render('outer_api/redirect', {social: SocialName});
	//		}));
	//		return;
	//	}
	//	
	//	var email = '';
	//	if (profile.emails && profile.emails[0] && profile.emails[0].value) email = profile.emails[0].value.toLowerCase();
	//	
	//	var run = function (userFound) {
	//		if ( ! userFound) {
	//			var newUserSchema = {
	//				username        : profile.displayName || email,
	//				firstName       : (profile.name && profile.name.givenName) ? profile.name.givenName : '',
	//				lastName        : (profile.name && profile.name.familyName) ? profile.name.familyName : '',
	//				isConfirm       : true,
	//				isSocialRegister: true
	//			};
	//			if (email && email.length) newUserSchema.email = email;
	//			userFound = new e.m.user(newUserSchema);
	//		}
	//		
	//		var saveUser = function() {
	//			// добавляем статданных
	//			userFound.addRegStatData(req);
	//			userFound.validate(function(problems){
	//				if(problems) {
	//					e.log.error(problems);
	//					req.prodlog('outer_api | validate user error', {social: SocialName, profile: profile, error: err});
	//					return res.render('outer_api/redirect', {social: SocialName, error: res.i18n.__('all.sorry error, please contact support')});
	//				}
	//				
	//				req.prodlog('user registration', {social: SocialName, email: req.body.email});
	//				
	//				userFound.save(function(err){
	//					if (err) {
	//						req.prodlog('outer_api | create user error', {social: SocialName, profile: profile, error: err});
	//						return res.error(err);
	//					}
	//					
	//					// Подключаем пользователю социалку
	//					obj._crateOrUpdateUserApp(userFound, profile, res.ok(function(app){
	//						
	//						e.async.parallel(
	//							[
	//								function(cb) {
	//									// и ещё запомним аналитику
	//									userFound.addLoginAnalytics(req, cb);
	//								},
	//								function(cb) {
	//									userFound.rememberInSession(req, cb);
	//								}
	//							],
	//							function (err) {
	//								// Так как это не критические ошибки(после которых не возможно продолжать), то просто пишем в лог их
	//								if(err) e.log.err(err);
	//								
	//								res.render('outer_api/redirect', {social: SocialName});
	//							}
	//						);
	//						
	//						
	//						//если у пользователя нет еще аватарки, берем с соц сети
	//						obj.uploadAvatar(userFound, profile, function(err){
	//							if (err) {
	//								e.log.error(err);
	//								req.prodlog('outer_api | upload avatar error', {social: SocialName, profile: profile, error: err});
	//							}
	//						});
	//						
	//						// Max: решил отправлять письмо асинхронно
	//						userFound.badgesNewUser(res.i18n, function(err){
	//							if (err) {
	//								e.log.error(err);
	//								req.prodlog('outer_api | badgesNewUser error', {social: SocialName, profile: profile, error: err});
	//							}
	//						});
	//						
	//						// userFound.sendMailWelcome(res.i18n, function(err) {
	//						// 	if (err) {
	//						// 		e.log.error(err);
	//						// 		req.prodlog('outer_api | sendMailWelcome error', {social: SocialName, profile: profile, error: err});
	//						// 	}
	//						// });
	//						
	//					}));
	//				});
	//			});
	//		};
	//		
	//		if (e.m.invite.isInviteModeOn(req)) {
	//			var invite = e.m.invite.getReqInvite(req);
	//			e.m.invite.checkExists(
	//				invite,
	//				function(){
	//					if ( e.m.invite.isInviteModeStrict(req) ) {
	//						e.log.error(new Error('Not correct invite'));
	//						req.prodlog('outer_api | not correct invite', { social: SocialName, profile: profile });
	//						res.noAccess();
	//					} else {
	//						if (req.session.invite) delete req.session.invite;
	//						saveUser();
	//					}
	//				},
	//				function(){
	//					//все хорошо, инвайт прошел
	//					e.m.invite.saveUserId(invite, userFound._id, res.ok(function(){
	//						delete req.session.invite;
	//						// всё ок, сохраняем пользователя
	//						saveUser();
	//					}));
	//				}
	//			);
	//		} else {
	//			// всё ок, сохраняем пользователя
	//			saveUser();
	//		}
	//	};
	//	
	//	if (profile.verifiedEmail && email.length > 0) {//если есть email
	//		//пытаемся получить пользователя по email
	//		e.m.user.findOne({email: email}, res.ok(function (userFound) {
	//			run(userFound);
	//		}));
	//	} else if (email.length > 0) {
	//		//пытаемся найти пользователя с таким email, если есть пользователь с такми email - то чистим у нового пользотваеля email
	//		e.m.user.findOne({email: email}, res.ok(function (user) {
	//			if (user) email = null;
	//			run(userFound);
	//		}));
	//	} else {
	//		//пытаемся найти пользователя с таким email, если есть пользователь с такми email - то чистим у нового пользотваеля email
	//		e.m.user.findOne({email: email}, res.ok(function (user) {
	//			if (user) email = null;
	//			
	//			run(userFound);
	//		}));
	//	}
	//	
	//	//if (email && email.length > 0) {//если есть email
	//	//	//пытаемся получить пользователя по email и если такой есть, то не создаем аккаунт
	//	//	e.m.user.findOne({email: email}, res.ok(function (userFound) {
	//	//		if (userFound) {
	//	//			res.render('outer_api/redirect', {social: SocialName, error: res.i18n.__('all.user with email or social network exist')});
	//	//		} else {
	//	//			run(userFound);
	//	//		}
	//	//	}));
	//	//} else {
	//	//	run(userFound);
	//	//}
	//	
	//};
	//
	//
	///**
	// * @param {Object} req - Request от веб-сервера
	// * @param {Object} res - Response от веб-сервера
	// * @param {?Object} userFound - Модель юзера, у которого подключен данный аккаунт соц. сети (если такого нет - null)
	// * @param {Object} profile
	// * @async
	// */
	//this._addSocial = function(req, res, userFound, profile) {
	//	
	//	// нашли пользователя с данным аккаунтом соц. сети
	//	// и это не текущий (другой) пользователь
	//	if (
	//		userFound
	//		&& userFound._id.toString() !== req.o.user._id.toString()
	//	) {
	//		
	//		req.prodlog('outer_api | user exist', {
	//			social  : SocialName,
	//			profile : profile,
	//		});
	//		
	//		// прописываем болт, данный аккаунт соц. сети уже занят
	//		return res.render('outer_api/redirect', {
	//			social : SocialName,
	//			error  : res.i18n.__('all.user with social network exist'),
	//		});
	//		
	//		// у текущего пользователя уже есть этот аккаунт соц. сети
	//		//} else if (userFound && userFound._id == req.o.user._id) {
	//		//	return res.render('outer_api/redirect', {social: SocialName});
	//	}
	//	
	//	// если у юзера не указан email и он прилетел из соц. сети
	//	if (
	//		! req.o.user.email
	//		&& profile.emails
	//		&& profile.emails[0]
	//	) {
	//		// задаём юзеру email, прилетевший от соц. сети
	//		req.o.user.email = profile.emails[0].value;
	//	}
	//	
	//	// подключаем пользователю социалку
	//	obj._crateOrUpdateUserApp(req.o.user, profile, res.ok(function(app) {
	//		
	//		res.render('outer_api/redirect', { social: SocialName });
	//		
	//		// если у пользователя нет еще аватарки, берем с соц. сети
	//		obj.uploadAvatar(req.o.user, profile, function(err) {
	//			
	//			if (err) {
	//				
	//				e.log.error(err);
	//				
	//				req.prodlog('outer_api | upload avatar error', {
	//					social  : SocialName,
	//					profile : profile,
	//					error   : err,
	//				});
	//				
	//				return;
	//			}
	//		});
	//	}));
	//};
	//
	//
	//this._crateOrUpdateSiteApp = function(req, res, profile){
	//	if ( ! req.session.siteId) {
	//		var err = new Error('Empty req.session.siteId');
	//		e.log.error(err);
	//		req.prodlog('outer_api | _crateOrUpdateSiteApp error', {social: SocialName, profile: profile, error: err});
	//		return;
	//	}
	//	
	//	e.m.site.findOne({_id: req.session.siteId}, res.ok(function(site) {
	//		if ( ! site) {
	//			var err = new Error('No found site _id: ' + req.session.siteId);
	//			e.log.error(err);
	//			req.prodlog('outer_api | _crateOrUpdateSiteApp error', {social: SocialName, profile: profile, error: err});
	//			return res.render('outer_api/redirect', {social: SocialName, error: res.i18n.__('all.site no found')});
	//		}
	//		
	//		
	//		e.m.apps[SocialName].findOne({userId: profile.id}, res.ok(function(app){
	//			if (app) {
	//				if (profile.accessToken) app.accessToken = profile.accessToken;
	//				if (profile.refreshToken) app.refreshToken = profile.refreshToken;
	//				if (profile.scope && profile.scope.length) app.scope = profile.scope;
	//				app.save(res.ok(function(){
	//					site[req.session.service][SocialName].userId = profile.id;
	//					site[req.session.service][SocialName]._id = app._id;
	//					site.save(res.ok(function(){
	//						res.render('outer_api/redirect', {social: SocialName});
	//					}));
	//				}));
	//			} else {
	//				new e.m.apps[SocialName]({
	//					accessToken : profile.accessToken,
	//					refreshToken: profile.refreshToken,
	//					expires     : obj.getExpires(profile.expires),
	//					firstName   : (profile.name && profile.name.givenName) ? profile.name.givenName : '',
	//					lastName    : (profile.name && profile.name.familyName) ? profile.name.familyName : '',
	//					userId      : profile.id,
	//					rawData     : profile._raw || '',
	//					scope       : profile.scope
	//				}).save(res.ok(function(app){
	//						site[req.session.service][SocialName].userId = profile.id;
	//						site[req.session.service][SocialName]._id = app._id;
	//						site.save(res.ok(function(){
	//							res.render('outer_api/redirect', {social: SocialName});
	//						}));
	//					}));
	//			}
	//		}));
	//	}));
	//};
	//
	//
	///**
	// * @callback uploadAvatar~cb
	// * @param {?Error} err
	// */
	///**
	// * Заглушка (необходимо определять для каждой соц. сети отдельно)
	// *
	// * @static
	// * @public
	// * @param {ModelUser} user - Объект юзера по модели
	// * @param {Object} profile - Данные профиля
	// * @param {uploadAvatar~cb} cb
	// */
	//this.uploadAvatar = function(user, profile, cb) {
	//	cb();
	//};
};


module.exports = Social;
