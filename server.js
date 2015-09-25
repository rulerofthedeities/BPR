var express = require('express'),
	app = express(),
	bodyParser = require('body-parser');

//config
app.set('port', process.env.PORT || 3302);
app.use(express.static('public'));
app.use(bodyParser.json());

//routing
app.get('/', function(request, response){
	response.sendFile(__dirname + '/public/bpr.htm');
});
app.get('/records', function(request, response){
	//return records
	var records = [
		{sys:130, dia:80, pulse: 62, dtSubmit: new Date(2015, 9, 28, 10, 06)}, 
		{sys:121, dia:77, pulse: 60, dtSubmit: new Date(2015, 9, 28, 22, 11)}];
    response.json(records);
});
app.post('/submitBP', function(request, response){
	//todo: add to database
	console.log(request.body);
	response.status(201).json(request.body);
});

//run server
app.listen(app.get('port'), function() { 
    console.log('Server up: http://localhost:' + app.get('port'));
});

