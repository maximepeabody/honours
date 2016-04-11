 module.exports = function(mongoose) {

   // schemas // * try seperating file *
   var Schema = mongoose.Schema;

<<<<<<< HEAD
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
=======
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
     cost: Number,
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
>>>>>>> 6a4d6a6b5026de8cb14cbcbf5eb7920656742a67

   var models = {
     Rides: mongoose.model('Rides', rideSchema),
     Users: mongoose.model('Users', userSchema)
   };
   return models;
 }
