var mongoose = require('mongoose');

var SiteSchema = mongoose.Schema({
	url: {
		type     : String,
		unique   : true,
		index    : true,
		required : true
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	isAPI: {
		type: Boolean,
		default: false
	},
	ucozApi: {
		consumer_key: {
			type: String,
			required: true
		},
		consumer_secret: {
			type: String,
			required: true
		},
		oauth_token: {
			type: String,
			required: true
		},
		oauth_token_secret: {
			type: String,
			required: true
		}
	}
},{
	autoIndex: true
});


//SiteSchema.statics.getSites

module.exports = mongoose.model('Site', SiteSchema);
