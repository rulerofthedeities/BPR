var mongo = require('mongodb'),
	assert = require("assert");

var saveBPR = function(db, data, callback){
	var collection = db.collection('bp');
	
	collection.insertOne(data, function (err, result){
		assert.equal(err, null);
		callback(result);
	});
};

module.exports = {
	save: function(req, res){
		var newRecord = req.body;
		newRecord.dtSubmit = new Date();

		saveBPR(mongo.DB, newRecord, function(result){
			console.log(result);
			res.status(201).json(newRecord);
		});
		
	}
};