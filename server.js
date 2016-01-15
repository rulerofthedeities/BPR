var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	routes = require('./server/routes'),
	db = require('./server/db');

//config
app.set('port', process.env.PORT || 3302);
app.set('maxRecordsPerPage', 10);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

//routing
routes.initialize(app, new express.Router());

db.connect(function(){
	app.listen(app.get('port'), function() { 
		console.log('Server up: http://localhost:' + app.get('port'));
	});
});

