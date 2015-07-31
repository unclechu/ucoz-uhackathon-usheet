'use strict';

var Route = {
	userBridg: function(req, res, next) {
		U.model.user.findOne({_id: req.session.userId}, function(err, user) {
			if (user) {
				req.user = user;
			}
			
			console.log('req.user', req.session.userId, err, user);
			
			next();
		})
	},
	
	isAuth: function(req, res) {
		res.json({
			isAuth: !!req.session.userId,
			username: req.session.username,
		});
	},
	
	index: function(req, res) {
		
		res.render('pages/main.jade');
	},
	
	
	//search: function(req, res) {
		//var api = new U.lib.UCozApi({
		//	consumer_key: 'dfg98dfg8df8g9d98gd98g8dfg',
		//	consumer_secret: '.dA7xzR7fDlOrltTc7tZHVI95oMsEa',
		//	oauth_token: 'BRKkNkf3ZbijzdRC6F9bPhCeYVW7FTtqNRbwsDbq',
		//	oauth_token_secret: 'qSSUWTG7FbryN3ZXpSf0fbZeEVdDkLXYrX2jGrsl',
		//	url: 'test-ucoz.ucoz.net'
		//});
		//
		//var api = new U.lib.UCozApi({
		//	consumer_key: 'dfg98dfg8df8g9d98gd98g8dfg',
		//	consumer_secret: '.dA7xzR7fDlOrltTc7tZHVI95oMsEa',
		//	oauth_token: 'BRKkNkf3ZbijzdRC6F9bPhCeYVW7FTtqNRbwsDbq',
		//	oauth_token_secret: 'qSSUWTG7FbryN3ZXpSf0fbZeEVdDkLXYrX2jGrsl',
		//	url: 'test-ucoz.ucoz.net'
		//});
		//
		//api.exec('/search', 'get', {query: 'кровь боги'}, function(err, data) {
		//	console.log('exec done', err, data);
		//	
		//	res.json(data)
		//});
	//},
	
	
	blogList: function(req, res) {
		var api = new U.lib.UCozApi({
			consumer_key: 'dfg98dfg8df8g9d98gd98g8dfg',
			consumer_secret: '.dA7xzR7fDlOrltTc7tZHVI95oMsEa',
			oauth_token: 'BRKkNkf3ZbijzdRC6F9bPhCeYVW7FTtqNRbwsDbq',
			oauth_token_secret: 'qSSUWTG7FbryN3ZXpSf0fbZeEVdDkLXYrX2jGrsl',
			url: 'test-ucoz.ucoz.net'
		});
		
		api.exec('/blog', 'get', function(err, data) {
			console.log('exec done', err, data);
			
			res.json(data)
		});
	},
	
	createUser: function(req, res) {
		var user = U.model.user({
			login    : 'dima',
			password : '123',
			uid      : 1
		});
		
		user.save(function(err, r) {
			res.json({
				err : err,
				r   : r
			});
		})
	}
};


module.exports = Route;
