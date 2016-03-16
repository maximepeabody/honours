 module.exports = function(mongoose) {

  // schemas // * try seperating file *
  var Schema = mongoose.Schema;

  var rideSchema = new Schema({
    driverName: String,
    driverId: String,
    origin: {
      lat: Number,
      lng: Number,
      name: String
    },
    destination: {
      lat: Number,
      lng: Number,
      name: String
    },
    date: Date,
  //  distance: Number,
    route: {
      distance: {
        text: String,
        value: Number 
      },
      bounds: {
	northeast: { 
		lat: Number,
		lng: Number
	},
	southwest: {
		lat: Number,
		lng: Number
	}
      },
      duration: {
        text: String,
        value: Number
      },
      durationInTraffic: {
        text: String,
        value: Number
      },
      polyline: String,
    },
    spots: Number,
    passengerIds: [String]
  });

  var userSchema = new Schema({
    _id: String,
    facebookId: String,
    image: String,
    name: String,
    rides: [{
      id: String,
      origin: String,
      destination: String,
      date: Date,
      driverId: String
    }]
  });

  var models = {
    Rides: mongoose.model('Rides', rideSchema),
    Users: mongoose.model('Users', userSchema)
  };
  return models;
}
