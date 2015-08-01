var mongoose = require('mongoose');
var _ = require('lodash');


var MaterialItemScheme = mongoose.Schema({
	id: {
		type     : String
	},
	siteId: {
		type    : [mongoose.Types.ObjectId],
		default : []
	}
});


var MaterialScheme = mongoose.Schema({
	title: {
		type     : String,
		default: ''
	},
	message: {
		type     : String,
		required : true
	},
	description: {
		type     : String,
		required : true
	},
	publishedSites: {
		type    : [MaterialItemScheme],
		default : []
	},
	dateCreated : {
		type    : Date,
		default : Date.now
	},
	modulaName: {
		type     : String,
		enum     : ['blog', 'publ'],
		required : true
	}
});


module.exports = mongoose.model('Material', MaterialScheme);
