var Route = {
	
	index: function(res, res) {
		U.model.user.findOne({}).exec(function(err, user) {
			console.log('index', err, user);
			
			res.render('pages/main.jade');
		})
	},
	
	createUser: function(res, res) {
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
