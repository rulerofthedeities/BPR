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

//original records
var records = [
	{sys:150, dia:80, pulse: 62, dtSubmit: new Date(2015, 9, 28, 22, 11)}, 
	{sys:121, dia:82, pulse: 60, dtSubmit: new Date(2015, 9, 28, 10, 06)}, 
	{sys:135, dia:92, pulse: 65, dtSubmit: new Date(2015, 9, 27, 09, 12)}];

app.get('/records', function(request, response){
	//return records
    response.json(records);
});
app.post('/submitBP', function(request, response){
	//todo: add to database
	var newRecord = request.body;
	newRecord.dtSubmit = new Date();
	console.log("body");
	console.log(request.body);
	console.log(newRecord);
	records.push(newRecord);
	response.status(201).json(records);
});

//run server
app.listen(app.get('port'), function() { 
    console.log('Server up: http://localhost:' + app.get('port'));
});

