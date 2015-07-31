'use strict';

var passport     = require('passport');
var UcozStrategy = require('passport-ucoz').Strategy;

passport.use(new UcozStrategy({
	consumerKey       : 'r989r8gwedv89ddrvjerjrgergeff',
	consumerSecret    : '2IKf0y6IJr0PIiq3TLtaq3si26FRgO',
	callbackURL       : 'http://localhost:3000/ucoz/callback',
	passReqToCallback : true,
}, function (req, accessToken, tokenSecret, profile, cb) {
	
	profile.accessToken   = accessToken;
	profile.tokenSecret   = tokenSecret;
	profile.verifiedEmail = true; // так как на uid.me всегда подтвержденный email
	
	/**
	 * Если явно не указать необходимые поля, то в сесиию
	 * будет сложенно много лишней информации.
	 *
	 * И есть проблема с этим, как понимаю или вылазием за размеры сессии
	 * или какие-то проблемы с хешированием возникают.
	 */
	req.session.socialProfile = {
		username    : profile.username,
		displayName : profile.displayName,
		photos      : profile.photos,
		provider    : profile.provider,
	};
	cb(null, profile);
}));


var Ucoz = {
	in: function(req, res) {
		passport.authenticate(passport, {scope: ['email']})(req, res);
	},
	
	
	/**
	 * Создать новый аккаунт через социалку
	 */
	auth: function(req, res) {
		req.session.userAction = 'create';
		if (req.user) {
			res.end('ucoz auth');
		} else {
			passport.authenticate(passport, {scope: ['email']})(req, res);
		}
	},
	
	
	/**
	 * Основной колбэк, на котрый отправляют соц. сети
	 */
	callback: function(req, res) {
				
		// пользователь не предоставил доступа к своей учетке
		if (req.param('error')) {
			console.error('ucoz callback', req.param('error'));
			return res.end('error');
		}
		
		passport.authenticate(passport, function(err, profile) {
			
			// В случае если соц сеть вернула ошибку
			if (err) {
				console.error('ucoz callback2', err);
				return res.end('error');
			}
			
			// Обработка нажатия в twitter "отмена"
			if (req.param('denied')) {
				
				return res.render('outer_api/redirect', {
					social : SocialName,
					error  : res.i18n.__(
						'all.no oembed discovery information available from social network'
					),
				});
			}
			
			if ( ! profile || ! profile.id) {
				
				e.log.error(SocialName + ' | profile.id is empty');
				e.log.error(profile);
				req.prodlog('outer_api | profile.id is empty', {
					social  : SocialName,
					profile : profile,
				});
				
				return res.error(new Error('profile.id is empty'));
			}
			
			// scope пользователя
			// (права которые были запрошенны для работы с приложением)
			profile.scope = [];
			if (req.session.userScope[SocialName]) {
				profile.scope = req.session.userScope[SocialName];
			}
			
			//var condition = '"socialData. + SocialName + '.userId''
			var condition = { $or: [] };
			var cond1 = {};
			cond1['socialData.' + SocialName + '.userId'] = profile.id;
			condition.$or.push(cond1);
			var cond2 = {};
			cond2['socialData.' + SocialName + '.userId'] = profile.id.toString();
			condition.$or.push(cond2);
			
			if (
				req.session.userAction
				&& req.session.userAction === 'siteAddApp'
			) {
				return obj._crateOrUpdateSiteApp(req, res, profile);
			}
			
			var map = {
				
				addSocial: function(user) {
					
					obj._addSocial(req, res, user, profile);
				},
				
				create: function(user) {
					
					// Если это анонимный пользователь,
					// то заменяем анонима на того, кого нашли.
					if (req.o.user && req.o.user.isAnonymous) {
						
						e.m.site.changeSitesOwner(
							req.o.user._id,
							user._id,
							res.ok(function(){
								obj._create(req, res, user, profile);
							})
						);
						
					} else {
						obj._create(req, res, user, profile);
					}
				},
				
				login: function(user) {
					
					if (user) {
						
						// Если это анонимный пользователь,
						// то заменяем анонима на того, кого нашли.
						if (req.o.user && req.o.user.isAnonymous) {
							
							e.m.site.changeSitesOwner(
								req.o.user._id,
								user._id,
								res.ok(function() {
									obj._login(req, res, user, profile);
								})
							);
							
						} else {
							obj._login(req, res, user, profile);
						}
						
					} else if (
						profile.verifiedEmail
						&& profile.emails
						&& profile.emails[0]
						&& profile.emails[0].value
						&& profile.emails[0].value.length > 0
					) {
						
						// пытаемся получить пользователя по email
						e.m.user.findOne(
							{ email: profile.emails[0].value },
							res.ok(function(user) {
								
								if ( ! user) {
									
									e.log.error(
										SocialName
										+ ' | User not exist with email: '
										+ profile.emails[0].value
									);
									
									return res.render('outer_api/redirect', {
										social : SocialName,
										error  : res.i18n.__('all.you are not logged in'),
									});
								}
								
								obj._login(req, res, user, profile);
							})
						);
						
					} else {
						
						req.prodlog('outer_api | login | no found user', {
							social  : SocialName,
							profile : profile,
						});
						
						// если логинились и не нашли пользователя
						res.render('outer_api/redirect', {
							social : SocialName,
							error  : res.i18n.__('all.you are not logged in'),
						});
					}
				},
			};
			
			e.m.user.findOne(condition, res.ok(function(user) {
				
				var f = map[req.session.userAction];
				
				if (f) {
					f(user);
				} else {
					res.noAccess();
				}
			}));
			
		})(req, res);
	}
};

module.exports = Ucoz;
