var crypto = require('crypto');

module.exports = {
	md5: function(str) {
		return crypto.createHash('md5').update(str).digest("hex");
	},
	
	getSha1: function(str, key) {
		//digest:  hex', 'binary' or 'base64'
		return crypto['createHmac']('sha1', key).update(str).digest("binary");
	},
	UCozApi: require('ucoz-uapi'),
	
	test: function(a) {
		return a;
	}
};
