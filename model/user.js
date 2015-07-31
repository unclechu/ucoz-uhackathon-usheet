var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');
var _ = require('lodash');

var UserSchema = mongoose.Schema({
	login: {
		type     : String,
		unique   : true,
		required : true
	},
	password: {
		type     : String,
		default: ''
	},
	uid: {
		type     : Number,
		//required : true
	}
});

UserSchema.pre('save', function (next) {
	
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

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
	
	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
		
		if (err) {
			cb(err);
			return;
		}
		
		cb(null, isMatch);
	});
};


UserSchema.methods.getSites = function(query, cb) {
	var _query = _.extend({}, query);
	_query['userId'] = this._id;
	
	U.model.site.find(_query).exec(cb);
};


module.exports = mongoose.model('User', UserSchema);
