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

var updateBPR = function(db, data, callback){
	var mongoId = new mongo.ObjectID(data._id);

	db.collection('bp').updateOne(
		{_id: mongoId}, 
		{$set: {
			dtUpdated: Date.Now, 
			sys:data.sys,
			dia:data.dia,
			pulse:data.pulse}
		}, 
		function(err, r){
			assert.equal(null, err);
		}
	);

	callback();
};

var deleteBPR = function(db, id, callback){
	var mongoId = new mongo.ObjectID(id);

	db.collection('bp').deleteOne({_id:mongoId}, function(err, r) {
      assert.equal(null, err);
  	});

	callback();
};

module.exports = {
	save: function(req, res){
		var newRecord = req.body;
		newRecord.dtSubmit = new Date();
		newRecord.dt = new Date();

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
	},
	update: function(req, res){
		updateBPR(mongo.DB, req.body, function(){
			res.status(200);
		});
	},
	delete: function(req, res){
		if (req.query && req.query.id){
			deleteBPR(mongo.DB, req.query.id, function(){
				res.status(204);
			});
		} else {
			res.status(404);
		}
	}
};