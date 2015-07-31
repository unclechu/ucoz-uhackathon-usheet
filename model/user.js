var mongoose = require('mongoose');

var User = mongoose.model('User', { 
	login: {
		type    : String,
		require : true
	},
	password: {
		type    : String,
		require : true
	}
});

module.exports = User;