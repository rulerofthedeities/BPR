var express = require('express'),
	app = express(),
	bodyParser = require('body-parser');

//config
app.set('port', process.env.PORT || 3302);
app.use(express.static('public'));
app.use(bodyParser.json());

//routing
app.get('/', function(request, response){
});
app.post('/submitBP', function(request, response){
	console.log(request.body);
	response.status(201).json(request.body);
});

//run server
app.listen(app.get('port'), function() { 
    console.log('Server up: http://localhost:' + app.get('port'));
});

