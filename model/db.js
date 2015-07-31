var mongoose = require('mongoose');

module.exports = function(params) {
	mongoose.connect(params.url);
	
	var db = mongoose.connection;
	
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		console.log('open with params:', params);
	});
	
	return db;
};