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
	var collection = db.collection('bp'),
		max = options.tpe === "add" ? Math.min(10, options.max) : options.max;

	var loadAll = function(){
		collection
			.find({},{
				'_id':false, 
				'dia':true, 
				'sys':true, 
				'pulse':true,
				'dt': true})
			.sort({'dt':1})
			.toArray(function(err, docs) {
				assert.equal(null, err);
				callback(docs, 0);
			});
	};

	var loadNotes = function(){
		collection
			.find({note:{$exists: true, $ne: ""}},{
				'_id':false, 
				'note':true, 
				'dtNote': true})
			.sort({'dtNote':1})
			.toArray(function(err, docs) {
				assert.equal(null, err);
				callback(docs, 0);
			});
	};

	var loadMonth = function(){
		var y = parseInt(options.month.year, 10),
			m = parseInt(options.month.month, 10),
			dtStart = new Date(y, m, 1),
			dtEnd = new Date(y, m, 1);
		dtEnd.setMonth(dtEnd.getMonth() + 1);

		collection
			.find({dt:{"$gte": dtStart, "$lt":dtEnd}},
			{
				'dia':true, 
				'sys':true, 
				'pulse':true,
				'note':true,
				'noteOnChart':true,
				'dt': true,
				'dtSubmit': true})
			.sort({'dt':-1})
			.toArray(function(err, docs) {
				assert.equal(null, err);
				collection.count(function(err, count) {
					assert.equal(null, err);
					callback(docs, count);
				});
			});
	};

	switch(options.tpe){
		case "export": 
		case "chart": loadAll();break;
		case "notes": loadNotes();break;
		default: loadMonth();
	}
};

var updateBPR = function(db, data, callback){
	var mongoId = new mongo.ObjectID(data._id);

	db.collection('bp').updateOne(
		{_id: mongoId}, 
		{$set: {
			dtUpdated: new Date(), 
			sys:data.sys,
			dia:data.dia,
			pulse:data.pulse,
			dt:new Date(data.dt)}
		}, 
		function(err, r){
			assert.equal(null, err);
			callback(r);
		}
	);

};

var updateNote = function(db, data, callback){
	var mongoId = new mongo.ObjectID(data._id);

	db.collection('bp').updateOne(
		{_id: mongoId}, 
		{$set: {
			note: data.note, 
			noteOnChart: data.noteOnChart,
			dtNote: new Date()}
		}, 
		function(err, r){
			assert.equal(null, err);
			callback(r);
		}
	);

};

var deleteBPR = function(db, id, callback){
	var mongoId = new mongo.ObjectID(id);

	db.collection('bp').deleteOne({_id:mongoId}, function(err, r) {
      assert.equal(null, err);
  	});

	callback();
};

var getFirstYear = function(db, callback){
	db.collection('bp').find({}).limit(1).sort({dt:1}).toArray(function(err, docs) {
		assert.equal(null, err);
		callback(docs[0].dt);
	});
};

//Format records for export to csv/excel
var formatDates = function(records){
	var dt;
	records.forEach(function(record) {
		dt = new Date(record.dt);
		record.d = dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2);
		record.h = ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
	});
	return records;
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
			max = req.app.settings.maxRecordsPerPage,
			month = {year:req.query.y, month:req.query.m};
		if (tpe==="firstyear"){
			getFirstYear(mongo.DB, function(dt){
				res.status(200).send(dt);
			});
		} else {
			loadBPR(mongo.DB, {'tpe':tpe, 'max':max, 'month': month}, function(records, total){
				if (tpe === "export"){
					records = formatDates(records);
				}
				res.status(200).send({"records" : records, "total": total});
			});
		}
	},
	update: function(req, res){
		updateBPR(mongo.DB, req.body, function(r){
			res.status(200).send(r);
		});
	},
	updateNote: function(req, res){
		updateNote(mongo.DB, req.body, function(r){
			res.status(200).send(r);
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