//Lets require/import the HTTP module, express, bodyparser and mongoose
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
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

// gets ride based on ride id
app.get('/ride', function(req, res) {
  console.log(req);
  res.send({blah:2});
  //req.query //
});

// gets user based on user id //
app.get('/user', function(req, res) {

});

// gets list of rides based on query //
app.get('/queryRides', function(req, res) {

});

//gets list of rides based on ana advanced query //
app.get('/advancedQueryRides', function(req, res) {

});

// Delete methods:
// -deleteRide -by id
app.delete('ride', function(req, res) {

});

app.listen(PORT, function() {
  console.log('Example app listening on port' + PORT + '!');
});
