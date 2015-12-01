var mongo = require('mongodb'),
	mongoClient = mongo.MongoClient,
	url = "mongodb://localhost:27017/bpr";

exports.connect = function(callback){
	if (mongo.DB){
		return callback();
	}
	mongoClient.connect(url, function(err, db) {
		if (err){
			console.log("Error connecting to mongodb");
			process.exit(1);
		} else {
			console.log("Connected to mongodb");
			mongo.DB = db;
			callback();
		}
	});
};

exports.get = function() {
  return mongo.DB;
};

exports.close = function(callback) {
  if (mongo.DB) {
    mongo.DB.close(function(err, result) {
      mongo.DB = null;
      callback(err);
    });
  }
};
