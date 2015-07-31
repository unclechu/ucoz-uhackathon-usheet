var Route = {
	
	index: function(res, res) {
		U.model.user.findOne({}).exec(function(err, user) {
			console.log('index', err, user);
			
			res.render('pages/main.jade');
		})
	}
};


module.exports = Route;
