var mongo = require('mongodb'),
	assert = require("assert");

var saveBPR = function(db, data, callback){
	var collection = db.collection('bp');
	
	collection.insertOne(data, function (err, result){
		assert.equal(err, null);
		callback(result);
	});
};

var loadBPR = function(db, options, callback){

	var max = options.tpe === "add" ? Math.min(10, options.max) : options.max;

	db.collection('bp')
		.find({})
		.limit(max)
		.sort({'dtSubmit':-1})
		.toArray(function(err, docs) {
			assert.equal(null, err);
			callback(docs);
	    });
};

module.exports = {
	save: function(req, res){
		var newRecord = req.body;
		newRecord.dtSubmit = new Date();

		saveBPR(mongo.DB, newRecord, function(result){
			res.status(201).json(newRecord);
		});
	},
	load: function(req, res){
		var tpe = req.params.tpe,
			max = req.app.settings.maxRecordsPerPage;

		loadBPR(mongo.DB, {'tpe':tpe, 'max':max}, function(records){
			res.status(200).send(records);
		});
	}
};