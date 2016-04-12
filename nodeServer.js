//Lets require/import the HTTP module, express, bodyparser and mongoose
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var polyline = require('polyline');
var geolib = require('geolib');
var mongoose = require('mongoose');

//connect to the running db //
mongoose.connect('mongodb://localhost/hiked');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.on('open', function() {  console.log('connected to dbs!');})

//load the dbs models:
//models.Rides and models.users //
var models = require('./schemas.js')(mongoose);

//deifne our express app
var app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//defines a port we want to listen to
const PORT = 8080;


// here we define the REST api //

// posting a ride request
app.post('/request', function(req, res) {
    var request =  new models.Requests(req.body);
    request.save(function(err, r) {
      if(err) return err;
      else res.send(r);
    });
});

// getting a ride request, given a user id or ride id //
app.get('/request', function(req, res) {
  var userid = req.query.userid;
  var rideid = req.query.rideid;

  console.log("query: ", req.query);

  if(rideid) {
    models.Requests.find({rideId: rideid}).populate('ride passenger').then(function( requests) {
      res.send(requests);
  });
}
  else if(userid) {
    models.Requests.find({userId: userid}).populate('ride passenger').then(function( requests) {
      console.log("requests found", requests);
      res.send(requests);
  });
}
});

app.delete('/request', function(req, res){
  models.Requests.remove({_id: req.body.id}, function(r){res.send(r)});
})
// this posts a new ride to the server, or updates an existing ride if  //
// an id is provided//
app.post('/ride', function(req, res) {
  //if an id is provided, update the ride //
  var ride;
  if(req.body._id) {
  	models.Rides.findById(req.body._id, function(err, ride) {
		if(err) { return err;}
		else {
			for(var elem in req.body) {
				ride[elem] = req.body[elem];
			}
			ride.save(function(err, r) {
				if(err) return err;
				res.send(r);
			});
		}
	});

  }
  else {
  ride =  new models.Rides(req.body);


  ride.save(function(err, r){
	if(err) console.log(err);
	if(err) return err;
	res.send(r);
	console.log("saved");
	// otherwise it's saved. //
  });
  }
  console.log(ride);
});

// create a new user, or update an existing one //
app.post('/user', function(req, res) {
	console.log(req.body);
	if(req.body.nopopulate) {
	console.log('not populating rides array');
	models.Users.findById(req.body._id, function(err, user) {
		  //create a new user //
		  if(!user || err) {
			console.log('cannot find user');
			console.log(err);
			console.log('creating new user')
			user = new models.Users(req.body);
			console.log(user);
			user.save(function(err, u) {
				if(err) {
					console.log(err);
					return err;
				}
				else {
					res.send(u);
				}
			});
		  }
		  else {
		  //otherwise we found a user, so update it//
		  for(var elem in req.body) {
				user[elem] = req.body[elem];
		  }
		  user.save(function(err, u) {
			  if(err) {
				  console.log(err);
				  return err;
			  }
			  else {
				res.send(u);
			  }
		  });
		}
  });
  }
  else {
       	models.Users.findById(req.body._id).populate('rides').then(function(user) {
		  //create a new user //
		 console.log(user);
		 if(!user) {
			console.log('cannot find user');

			user = new models.Users(req.body);
			console.log('creating new user');
			console.log(user);
			user.save(function(err, u) {
				if(err) {
					console.log(err);
					return err;
				}
				else {
					res.send(u);
				}
			});
		  }
		  else {
		  //otherwise we found a user, so update it//
		  for(var elem in req.body) {
				user[elem] = req.body[elem];
		  }
		  user.save(function(err,u) {
			  if(err) {
				  console.log(err);
				  return err;
			  }
			  else {
				res.send(u);
			  }
		  });
		}
  });

 }
});


// Get methods:
// -getRide -by id
// -getUser -by id

app.get('/ride', function(req, res) {
  console.log(req.query);
  //if id is provided, find the ride by id //
  if(req.query._id) {
  models.Rides.findById(req.query._id).populate('driver passengers').then(function(ride) {
	  res.send(ride);
  });
  }
  // otherwise, check if it's an advanced query //
  else if(req.query.type == "advanced") {
	var origin = {
		lat: req.query.originlat,
		lng:  req.query.originlng
	};
	var destination = {
		lat: req.query.destinationlat,
		lng: req.query.destinationlng
	};
	var validRides = [];
	// for each ride in the bounding box, see if the origin/destination lies on the path//
	var query = {
		'route.bounds.southwest.lng':{$lt: Number(req.query.originlng) + 0.1, $lt: Number(req.query.destinationlng) + 0.1},
		'route.bounds.southwest.lat':{$lt:Number(req.query.originlat) + 0.1, $lt:Number(req.query.destinationlat) + 0.1},
		'route.bounds.northeast.lng': {$gt: Number(req.query.destinationlng) - 0.1, $gt: Number(req.query.originlng) - 0.1},
		'route.bounds.northeast.lat': {$gt: Number(req.query.originlat) - 0.1, $gt: Number(req.query.destinationlat) - 0.1}
	};
	if(req.query.date) {
		var d1 = new Date(req.query.date);
		d1.setSeconds(0);
		d1.setHours(0);
		d1.setMinutes(0);
		var d2 = new Date(req.query.date);
		d2.setSeconds(59);
		d2.setHours(23);
		d2.setMinutes(59);
		query.date = {$gte:d1, $lte: d2};
	}
	models.Rides.find(query).populate('driver passengers').exec(function(err, rides) {
		console.log(rides);

		if(err){console.log(err); return err;}

		//accuracy of pointInLine search, in meters //
		var accuracy = 5000;

		for(var f = 0; f<rides.length; f++) {
			var ride = rides[f];
			// bool value to see if origin/destination are on the path //
			var originOnPath = false;
			var destinationOnPath = false;




				//decode the points from the polyline //
				var points = polyline.decode(ride.route.polyline);
				if(points.length<2) break;
				for(var i = 0; i<points.length-1; i++ ) {
					var p1 = {lat: points[i][0], lng: points[i][1]};
					var p2 = {lat: points[i+1][0], lng: points[i+1][1]};

					if(!originOnPath && geolib.isPointNearLine(origin, p1, p2, accuracy)) { console.log("o on path");
						console.log(geolib.getDistanceFromLine(origin,p1,p2));
						console.log("p1: " + p1.lat + ", " + p1.lng);
						console.log("p2: " + p2.lat + "," + p2.lng);
						originOnPath = true;
					}
					if(originOnPath) {
						if(geolib.isPointNearLine(destination, p1, p2, accuracy)){
							destinationOnPath = true;
							console.log("d on path");
						}
					}
				}

			if(originOnPath && destinationOnPath) {
				console.log("valid ride");
				console.log(ride);
				validRides.push(ride);
			}

		}

		res.send(validRides);

  	});
  }
  //otherwise it's a regular from-to query//
  else {
	console.log("regular query");
	var query = {
		'origin.lng':{$lt: Number(req.query.originlng) + 0.1, $gt: Number(req.query.originlng) - 0.1},
		'origin.lat':{$lt:Number(req.query.originlat) + 0.1, $gt:Number(req.query.originlat) - 0.1},
		'destination.lng': {$lt: Number(req.query.destinationlng) + 0.1, $gt: Number(req.query.destinationlng) - 0.1},
		'destination.lat': {$lt: Number(req.query.destinationlat) + 0.1, $gt: Number(req.query.destinationlat) - 0.1}
	};

  	if(req.query.date) {
		var d1 = new Date(req.query.date);
		d1.setSeconds(0);
		d1.setHours(0);
		d1.setMinutes(0);
		var d2 = new Date(req.query.date);
		d2.setSeconds(59);
		d2.setHours(23);
		d2.setMinutes(59);
		query.date = {$gte:d1, $lte: d2};
	}
	models.Rides.find(query, function(err, rides) {
		if(err) {console.log(err); return err;}
		console.log(rides);
		res.send(rides);
	});
  }
  //req.query //
});

// custom query //
app.get('/customRideQuery', function(req, res) {
	console.log(req.query);
	models.Rides.find(req.query).populate('driver passengers').exec(function(err, rides) {
		if(err) return err;
		res.send(rides);
	});

});

// gets user based on user id //
app.get('/user', function(req, res) {
  models.Users.findById(req.query._id).populate('rides').exec(function(err, user) {
		if(err) return err;
		res.send(user);
	});
});

// gets list of rides based on query //
// query is of the form :
// origin.lat:
// oring.lng :
// destination.lat:
// destination.long:
// date:
app.get('/queryRides', function(req, res) {
	var query = req.query;
	models.Rides.find(query).then(function(rides) {
		res.send(rides);
	}, function(err) {
		return err;
	});
});


app.listen(PORT, function() {
  console.log('Example app listening on port' + PORT + '!');
});
