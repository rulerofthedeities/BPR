var bprecord = require('../server/controllers/bprecords');

module.exports.initialize = function(app, router) {
	
	router.get('/getBP/:tpe', bprecord.load);
	router.post('/submitBP', bprecord.save);
	router.put('/updateBP', bprecord.update);

	app.use(router);
};