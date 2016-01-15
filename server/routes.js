var bprecord = require('../server/controllers/bprecords'),
	path = require("path");

module.exports.initialize = function(app, router) {
	var home = path.resolve(__dirname + '/../public/bpr.htm');
	
	router.get('/', function(request, response){
		response.sendFile(home);
	});

	router.get('/bpr/:tpe', bprecord.load);
	router.post('/bpr', bprecord.save);
	router.put('/bpr', bprecord.update);
	router.put('/bprnote', bprecord.updateNote);
	router.delete('/bpr', bprecord.delete);

	app.use(router);
};