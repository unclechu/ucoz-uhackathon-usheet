var mongoose = require('mongoose');
var _ = require('lodash');


var MaterialItemScheme = mongoose.Schema({
	id: {
		type     : String,
		unique   : true,
		required : true
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
	}
});

MaterialScheme.pre('save', function (next) {
	
	if ( ! this.isModified('password')) {
		next();
		return;
	}
	
	bcrypt.genSalt(function (err, salt) {
		
		if (err) {
			next(err);
			return;
		}
		
		bcrypt.hash(this.password, salt, function (err, hash) {
			
			if (err) {
				next(err);
				return;
			}
			
			this.password = hash;
			next();
			
		}.bind(this));
	}.bind(this));
});

MaterialScheme.methods.comparePassword = function (candidatePassword, cb) {
	
	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
		
		if (err) {
			cb(err);
			return;
		}
		
		cb(null, isMatch);
	});
};


MaterialScheme.methods.getSites = function(query, cb) {
	var _query = _.extend({}, query);
	_query['userId'] = this._id;
	
	U.model.site.find(_query).exec(cb);
};


module.exports = mongoose.model('Material', MaterialScheme);
