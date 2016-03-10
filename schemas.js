module.export = function() {
  require('mongoose');
  // schemas // * try seperating file *
  var Schema = mongoose.Schema;

  var rideSchema = new Schema({
    driverName: String,
    driverId: String,
    from: {
      lat: Number,
      long: Number,
      name: String
    },
    to: {
      lat: Number,
      long: Number,
      name: String
    },
    date: Date,
    distance: Number,
    route: {
      distance: Number,
      duration: Number,
      durationInTraffic: Number,
      steps: [{
        htmlInstructions: String,
        polyline: Number
      }]
    },
    spots: Number,
    passengerIds: [String]
  });

  var userSchema = new Schema({
    facebookId: String,
    name: String,
    rides: [{
      id: String,
      to: String,
      from: String,
      date: Date,
      driverId: String
    }]
  });

  var models = {
    Rides: mongoose.model('Rides', ridesSchema),
    Users: mongoose.model('Users', usersSchema)
  }
  return models;
}
