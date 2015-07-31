var express = require('express');
var path = require('path');
var jade = require('jade');

var app = express();

app = express();
app.engine('jade', jade.__express);
app.set('views', path.resolve(process.cwd(), 'templates'));
app.set('view engine', 'jade');

app.use(express.static('public'));

app.get('/', function (req, res) {
	console.log('here', 1);
	
	res.render('pages/main.jade', {});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});