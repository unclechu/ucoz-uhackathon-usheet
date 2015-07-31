var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	url: {
		type     : String,
		required : true
	},
	userId: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	isAPI: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', UserSchema);
