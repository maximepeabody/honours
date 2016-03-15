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

// Post methods :
// -postRide
// -postUser
// -updateRide
// -updateUser
// -addPassengerToRide

// this posts a new ride to the server //
app.post('/ride', function(req, res) {
  
  var ride =  new models.Rides(req.body);
  console.log(ride);
  ride.save(function(err){
	if(err) console.log(err);
	if(err) return err;
	// otherwise it's saved. //


  });

  console.log(ride);
});

app.post('/user', function(req, res) {
  var user = new models.Users(req.body);
  user.save(function(err) {
	  if(err) {}
  });
  res.send(user);
});

app.post('/updateRide', function(req, res) {
	var query = {id: req.body.rideId};
	Rides.update(query, req.body.update);
});

app.post('/updateUser', function(req, res) {
	var query = {id: req.body.userId};
	Users.update(query, req.body.update);
});

/*
app.post('/addPassengerToRide', function(req, res) {
	Users.findByIdAndUpdate(
    req.body.rideId,
    {$push: {"passengerIds": {id: req.body.passengerId}},
    {safe: true, upsert: true},
    function(err, model) {
        console.log(err);
    }
);
});
*/

// Get methods:
// -getRide -by id
// -getUser -by id
// -queryRides
// -advancedQueryRides

// gets ride based on ride id //
app.get('/ride', function(req, res) {
  models.Rides.find(req.query.id).then(function(ride) {
	  res.send(ride);
  });
  //req.query //
});

// gets user based on user id //
app.get('/user', function(req, res) {
  models.User.find(req.query.id).then(function(user) {
		console.log(user);
	  res.send(user);
  }, function(err) {
		res.send(err);
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
		res.send(err);
	});
});

//gets list of rides based on ana advanced query //
// advanced query includes bounds //
// query is of the form :
// origin.lat:
// oring.lng :
// destination.lat:
// destination.long:
// date:
// boundNortheastLat :
// boundnortheastlng:
// boundsouthwestlat:
// boundsouthwestlng:
app.get('/advancedQueryRides', function(req, res) {
	console.log(req.query);
	var bounds = {
		northeast: {
			lat: req.query.boundNortheastLat,
			lng: req.query.boundNortheastLng
		},
		southwest: {
			lat:req.query.boundSouthwestLat,
			lng: req.query.boundSouthwestLng
		}
	};
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
		'origin.lat': {$lt: bounds.northeast.lat, $gt: bounds.southwest.lat},
		'origin.lng': {$lt: bounds.northeast.lng, $gt: bounds.southwest.lng},
		'destination.lat': {$lt: bounds.northeast.lat, $gt: bounds.southwest.lat},
		'destination.lng': {$lt: bounds.northeast.lng, $gt: bounds.southwest.lng}
	};
	models.Rides.find({}, function(err, rides) {
		console.log(rides);

		if(err){console.log(err); return err;}

		//accuracy of pointInLine search, in meters //
		var accuracy = 3000;

		for(var f = 0; f<rides.length; f++) {
			var ride = rides[f];
			// bool value to see if origin/destination are on the path //
			var originOnPath = false;
			var destinationOnPath = false;

			// for each step, and for each point inside the step //
			for(var j = 0; j<ride.route.steps.length; j++) {
				var step = ride.route.steps[j];
				//decode the points from the polyline //
				var points = polyline.decode(step.polyline);
				if(points.length<2) break;
				for(var i = 0; i<points.length-1; i++ ) {
					var p1 = {lat: points[i][0], lng: points[i][1]};
					var p2 = {lat: points[i+1][0], lng: points[i+1][1]};
					if(geolib.isPointNearLine(origin, p1, p2, accuracy))
						originOnPath = true;
					if(originOnPath) {
						if(geolib.isPointNearLine(destination, p1, p2, accuracy)){
							destinationOnPath = true;
						}
					}
				}
			}
			if(originOnPath && destinationOnPath) {
				validRides.push(ride);
			}

		}
	});
	res.send(validRides);

});

// Delete methods:
// -deleteRide -by id
app.delete('/ride', function(req, res) {

});

app.listen(PORT, function() {
  console.log('Example app listening on port' + PORT + '!');
});
