var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	login: {
		type     : String,
		required : true
	},
	password: {
		type     : String,
		required : true
	},
	uid: {
		type     : Number,
		required : true
	}
});

module.exports = mongoose.model('User', UserSchema);
