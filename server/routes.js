var bprecord = require('../server/controllers/bprecords');

module.exports.initialize = function(app, router) {
	
	router.get('/getBP/:tpe', bprecord.load);
	router.post('/submitBP', bprecord.save);

	app.use(router);
};