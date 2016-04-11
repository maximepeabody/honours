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
     cost: Number,
     passengers: [String]
   });

   var userSchema = new Schema({
     _id: String,
    // facebookId: String,
     image: String,
     name: String,
     rides: [{
       id: ObjectId,
       origin: String,
       destination: String,
       date: Date,
       driverId: String
     }]
   });

   var requestSchema = new Schema({
     userId: String,
     rideId: ObjectId,
     message: String,
     passengerId: String
   });
   var models = {
     Rides: mongoose.model('Rides', rideSchema),
     Users: mongoose.model('Users', userSchema),
     Requests: mongoose.model('Requests', requestSchema)
   };
   return models;
 }
