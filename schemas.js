 module.exports = function(mongoose) {

  // schemas // * try seperating file *
  var Schema = mongoose.Schema;

  var rideSchema = new Schema({
    driverName: String,
    driver: {type: String, ref: 'Users'},
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
    passengers: [{type: String, ref: 'Users'}]
  });

  var userSchema = new Schema({
    _id: String,
    facebookId: String,
    image: String,
    name: String,
    rides: [{type: Schema.Types.ObjectId, ref: 'Rides'}]
  });

  var models = {
    Rides: mongoose.model('Rides', rideSchema),
    Users: mongoose.model('Users', userSchema)
  };
  return models;
}
