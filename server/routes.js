var bprecord = require('../server/controllers/bprecords');

module.exports.initialize = function(app, router) {

	router.get('/records/:tpe', function(request, response){
	//original records
		var records = [
			{sys:150, dia:80, pulse: 62, dtSubmit: new Date(2015, 9, 28, 22, 11)}, 
			{sys:121, dia:82, pulse: 60, dtSubmit: new Date(2015, 9, 28, 10, 06)}, 
			{sys:135, dia:92, pulse: 65, dtSubmit: new Date(2015, 9, 27, 09, 12)}];
		var tpe = request.params.tpe || "all";
		//todo: Get records, limit depending on tpe
	    response.json(records);
	});

	router.post('/submitBP', bprecord.save);

	app.use(router);
};