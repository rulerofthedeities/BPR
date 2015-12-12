var bprecord = require('../server/controllers/bprecords');

module.exports.initialize = function(app, router) {
	
	router.get('/bpr/:tpe', bprecord.load);
	router.post('/bpr', bprecord.save);
	router.put('/bpr', bprecord.update);
	router.put('/bprnote', bprecord.updateNote);
	router.delete('/bpr', bprecord.delete);

	app.use(router);
};