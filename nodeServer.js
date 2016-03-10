//Lets require/import the HTTP module, express, bodyparser and mongoose
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var polyline = require('polyline');
var geolib = require('geolib');

//test geolib //

var point = {
	lat: 41.84604,
	lng: -87.63931
};

var lineStart = {
	lat: 41.81662,
	lng: -87.73441
};

var lineEnd = {
	lat: 41.82097,
	lng: -87.63897
};
console.log(geolib);
console.log(geolib.getDistanceFromLine(point, lineStart, lineEnd));
console.log(geolib.isPointNearLine(point, lineStart, lineEnd, 3000));

var mongoose = require('mongoose');

//connect to the running db //
mongoose.connect('mongodb://localhost/hiked');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.on('open', function() {  console.log('connected to dbs!');})

//load the dbs models:
//models.Rides and models.users //
var models = require('./schemas');

//deifne our express app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

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
app.post('/postRide', function(req, res) {
  var ride =  new Ride(req.body);
  ride.save();
  /*new Ride({
    name: req.body.driverName,
    from: {
      name: req.body.from.name,
      lat: req.body.from.lat,
      long: req.body.from.long
    },
    to: {
      name: req.body.from.name,
      lat: req.body.from.lat,
      long: req.body.from.long
    },
    driverId: req.body.driverId,
    date: req.body.date,
    distance: req.body.distance,
    route: {
      distance: req.body.route.distance,
      duration: req.body.route.duration,
      durationInTraffic: req.body.route.durationInTraffic,
      steps: req.body.route.steps
    },
    passengerIds: []

  });
  */
  console.log(ride);
});

app.post('/postUser', function(req, res) {
  var user = new User(req.body);
  user.save();
  /*
  var user = new User({
    facebookId: req.body.facebookId,
    name: req.body.name,
    rides: []
  });*/
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
  db.find(req.id).then(function(ride) {
	  res.send(ride);
  });
  //req.query //
});

// gets user based on user id //
app.get('/user', function(req, res) {
  db.find(req.id).then(function(user) {
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
	db.find(query);
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
	var bounds = {
		northeast: {
			lat: boundNortheastLat,
			lng: boundNortheastLng
		},
		southwest: {
			lat:boundsouthwestlat,
			lng: boundsouthwestlng
		}
	};
	var origin = {
		lat: originlat,
		lng: originlng
	}
	var destination = {
		lat: destinationlat,
		lng: destinationlng
	};
	var validRides = [];
	// for each ride in the bounding box, see if the origin/destination lies on the path//
	db.find(bounds).then(function(rides) {
		
		//accuracy of pointInLine search, in meters //
		var accuracy = 3000;
		
		for(ride in rides) {
			// bool value to see if origin/destination are on the path //
			var originOnPath = false;
			var destinationOnPath = false;
			
			// for each step, and for each point inside the step //
			for(step in ride.steps) {
				//decode the points from the polyline //
				var points = polyline.decode(step.polyline);
				for(var i = 0; i<points.length-1; i++ ) {
					if(geolib.isPointNearLine(origin, points[i], points[i+1], accuracy))
						originOnPath = true;
					if(originOnPath) {
						if(geolib.isPointNearLine(destination, points[i], points[i+1], accuracy)){
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
app.delete('ride', function(req, res) {

});

app.listen(PORT, function() {
  console.log('Example app listening on port' + PORT + '!');
});
