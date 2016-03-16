angular.module('starter.controllers', [])

//controls the view for myRides.
//connects with the dbs destination list the hosted rides, the passenger ride, and past rides
//can click on a ride destinationo see more info about it.


//controls the search function.
//connects with the database, and queries it with the given input
//queries based on 'origin' and 'destination' coordinates, + 'date'.
//can add option destination query destination anywhere, or a date range

.controller('SearchCtrl', function($scope, Auth, $resource, $ionicLoading, RidesDbs,$state){
  //connect to ride dbs //
  //var rideDbs = $resource('http://45.55.157.150:8080/ride');
  //get user data //
  $scope.authData = Auth.$getAuth();

  // error for input validation /./
  $scope.error = false;
  $scope.errorMessage = "";
  $scope.noRides = false;

  $scope.search = function(input) {
	//if there is no error //
    if(validate(input)) {
      $scope.error = false;
	  
      //create a query //
      var query = {};
      query.originlat = input.origin.geometry.location.lat();
	  query.originlng = input.origin.geometry.location.lng();
      query.destinationlat =  input.destination.geometry.location.lat();
	  query.destionationlng = input.destination.geometry.location.lng();
	  query.type = input.type;
     // destination query a date range, do date: {$lt: query.dateorigin + 1, $gt: query.datedestination -1}

      // send a query destination the dbs, once a response is given, create popup //
      $ionicLoading.show({
        template: 'Searching...'
      });

      $scope.rides = RidesDbs.query(queryJson); 
	  
	   $scope.rides.then(function(results){
        console.log(results);
        $ionicLoading.hide();
        //$scope.rides=results;
        if($scope.rides.length == 0) {
          $scope.noRides = true;
        }
        else{
          $scope.noRides = false;
        }
        console.log('queried');
      });
	  
    }
    else{
      $scope.error = true;
      $scope.errorMessage = "Please fill in the required forms"
      console.log("error");
    }
  };

  //validates a query. origin, destination and date must be filled //
  validate = function(input) {
    if(input == null)
      return false;
    return (input.origin != null && input.destination != null && input.date != null);
  }

})

.controller('RideViewCtrl', function($scope, Auth, ride, RidesDbs){
  console.log(ride);
  RidesDbs.getById(ride).then(function(result) {
    console.log(result);
    console.log(ride);
    $scope.ride = result;
  })
})

//controls the logout butdestinationn in the menu //
.controller('MenuCtrl', function($scope, Auth, $state) {
  $scope.logout = function() {
    Auth.$unauth();
    $state.go('login');
    console.log('loging out');
  };
})

// controller destination post the ride data destination server //
// ride data has form:
// origin: city
// destination  : city
// origin: latitude, longitude
// destination  : latitude, longitude
// date: day//month/year
// time
// number of passengers
// approximate cost:
.controller('PostRideCtrl', function ($scope, Auth, RidesDbs, UsersDbs, $ionicPopup, $ionicLoading, googleDirections) {
  //data variable for the input.
  $scope.data = {};

  //defaults:
  $scope.data.spots = 3;

  // times for the time dropdown option //
  $scope.times = ['00:00','00:30','01:00','01:30',  '02:00',  '02:30',  '03:00',  '03:30',  '04:00',  '04:30',  '05:00',  '05:30',  '06:00',  '06:30',  '07:00',
  '07:30',  '08:00',  '08:30',  '09:00',  '09:30',  '10:00',  '10:30',  '11:00',  '11:30',  '12:00',  '12:30',  '13:00',  '13:30',  '14:00',  '14:30',  '15:00',
  '15:30',  '16:00',  '16:30',  '17:00',  '17:30',  '18:00',  '18:30',  '19:00',  '19:30',  '20:00',  '20:30',  '21:00',  '21:30',  '22:00',  '22:30',  '23:00',  '23:30'];

  $scope.error = false;

  // get reference destination user in dbs //
  $scope.authData = Auth.$getAuth();

  var formatRide = function(ride, directions) {
			ride.driverName = "name";
			ride.driverId = "id";
			ride.spots = 0;
			var leg = directions.routes[0].legs[0];
			ride.route = {};
			ride.route.distance = leg.distance;
			ride.route.duration = leg.duration;
			ride.route.duration_in_traffic = leg.duration_in_traffic;
			ride.route.polyline = directions.routes[0].overview_polyline;
			var bounds = directions.routes[0].bounds;
			ride.route.bounds = { 
				northeast: {
					lat:bounds.getNorthEast().lat(),
					lng:bounds.getNorthEast().lng()
				},
				southwest: {
					lat:bounds.getSouthWest().lat(),
					lng:bounds.getSouthWest().lng()
				}
			};

			console.log(ride);
			return ride;
	}
	
    // function that takes input and creates a ride on server //
  $scope.postRide = function(data) {
    console.log(data);
	
    if(validate(data)) {
      $scope.error = false;
	  
	  var query = {
        origin: {
          lat: data.origin.geometry.location.lat(),
          lng: data.origin.geometry.location.lng(),
          name: data.origin.name
        },
        destination: {
          lat: data.destination.geometry.location.lat(),
          lng: data.destination.geometry.location.lng(),
          name: data.destination.name
        },
        date: data.date
      };
	  
	  
      var directionArgs = {
        origin: data.origin.geometry.location.lat() + ',' + data.origin.geometry.location.lng(),
        destination:  data.destination.geometry.location.lat() + ',' + data.destination.geometry.location.lng(),
      };
	  
      var DirectionsApi = $resource('https://maps.googleapis.com/maps/api/directions/json', {});
	  var directions;
	  DirectionsApi.get(directionsArgs).success(function(dir) {
		  directions = dir;
		  var ride = formatRide(query, dir);
		  
          //create loading screen //
          $ionicLoading.show({
          template: 'Loading...' });
		  RidesDbs.save(ride).then(function(m){
			  $ionicLoading.hide();
			  $scope.showConfirm();

			  // now save destination user database
			  rideId = m._id.$oid;
			  var userRideData = {};
			  userRideData.origin = data.origin.name;
			  userRideData.destination = data.destination.name;
			  userRideData.rideId = rideId;
			  userRideData.driver = dbs.driverid;
			  userRideData.date = dbs.date;
		      UserDbs.get({_id: $scope.authData.uid}).then(function(result){
				console.log(result);
				result.rides.push(userRideData);
				result.$save();
			  });
		  });
	  });
 

    }
    else {
      console.log("error");
      $scope.error = true;
      $scope.errorMessage = "Please fill out the required fields";
    }
  };

  // function which validates the input //
  validate = function(data) {
    if(data == null) return false;
    return(data.origin != null && data.destination != null && data.date != null );
  };

  //function that takes input data and formats it for database //
  savedestinationDbs = function(data, dbs) {
    // copy input origin data destination dbs reference //
    dbs.origin = {
      name: data.origin.name,
      lat: data.origin.geometry.location.lat(),
      lng: data.origin.geometry.location.lng()
    };
    dbs.destination = {
      name: data.destination.name,
      lat: data.destination.geometry.location.lat(),
      lng: data.destination.geometry.location.lng()
    };
    dbs.date = data.date;
    dbs.time = data.time;
    dbs.spots = data.spots;
    dbs.driverid = $scope.authData.uid;

    // save destination ride database //
    dbs.$save().then(function(m){
      $ionicLoading.hide();
      $scope.showConfirm();

      // now save destination user database
      rideId = m._id.$oid;
      var userRideData = {};
      userRideData.origin = data.origin.name;
      userRideData.destination = data.destination.name;
      userRideData.rideId = rideId;
      userRideData.driver = dbs.driverid;
      userRideData.date = dbs.date;
      UserDbs.getById($scope.authData.uid).then(function(result){
        console.log(result);
        result.rides.push(userRideData);
        result.$saveOrUpdate();
        console.log("here i should save the ride destination the user dbs");
      });


    });
  };
  clear = function() {
    $scope.data = {};
  };
  //popup code //
  // A confirm dialog
 $scope.showConfirm = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirmation',
     template: 'Thank you! Your ride has been posted'
   });

   confirmPopup.then(function(res) {
     if(res) {
       console.log('confirmed');
       clear();
     } else {
       console.log('canceled');
     }
   });
 };
})

//if ever i integrate email or other authentication //
.controller('RegisterCtrl', function ($scope, $ionicPopup) {
    $scope.register = function (data) {


    }
})

// controls the login
// connects with facebook, and authenticates with firebase
// sdestinationres the facebook uid and image on the dbs
// each user has a unique uid
.controller('LoginCtrl', function ($scope, $ionicPopover, Auth, $state, $firebaseArray, $firebaseObject, UsersDbs) {


        //register -> brings destination register page
        $scope.register = function () {
                $state.go('register');
            }
            //login with email
        $scope.login = function (data) {
            $state.go('menu.account');
        }

        //login with facebook -- prefered? yes.
        //the following logs in with facebook with either a popup or a redirect
        $scope.fbLogin = function () {
            Auth.$authWithOAuthPopup("facebook").then(function (authData) {
                    // check firebase for user data //
                    var userRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + authData.uid));
                    var userdata = {name: authData.facebook.displayName, image: authData.facebook.profileImageURL, fbid: authData.facebook.id };
                    //save user data //
                    userRef.$loaded().then(function(){
                      userRef.$value = userdata;
                      userRef.$save()
                      $state.go('menu.rides');
                    });

                    // check dbs for user data, if not there, save it.
                    //UserDbs.query({})
                    user = new UserDbs();
                    user.name = userdata.name;
                    user.image = userdata.image;
                    user._id = authData.uid;
                    user.rides =  [];
                    user.$saveOrUpdate().then(function(){
                      console.log("saved");
                    });

                    console.log(authData);

                }).catch(function (error) {
                    Auth.$authWithOAuthRedirect("facebook").then(function (authData) {
                      //  $state.go('menu.rides');
                      var userRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + authData.uid));

                      var userdata = {name: authData.facebook.displayName, image: authData.facebook.profileImageURL, fbid: authData.facebook.id };
                      userRef.$loaded().then(function(){
                        userRef.$value = userdata;
                        userRef.$save()
                        $state.go('menu.rides');
                      });

                      // check dbs for user data, if not there, save it.
                      //UserDbs.query({})
                      user = new UserDbs();
                      user.name = userdata.name;
                      user.image = userdata.image;
                      user._id = userdata.fbid;
                      user.rides = [];
                      user.$saveOrUpdate().then(function(){
                        console.log("saved");
                      });
                      console.log(authData);

                    }).catch(function (error) {
                        console.log(error);
                    })

                })

        };
})

//
.controller('MyRidesCtrl', function ($scope, $firebaseArray, Auth, RidesDbs, UserDbs) {
  $scope.authData = Auth.$getAuth();
  //$scope.rideArray = [];

  UserDbs.getById($scope.authData.uid).then(function(user){
    $scope.rides = user.rides;
    console.log(user);
  //  console.log($scope.authData.uid);
}, function(error) {
  console.log(error);
});

  $scope.upcoming = function(item) {
    destinationday = new Date();
    dd = destinationday.getDate();
    yy = destinationday.getYear();
    mm = destinationday.getMonth() + 1;
    yymmdd = dd + mm*100 + yy*10000;
    return item.date > yymmdd;
  }
  /*
  var passengerRidesRef = $firebaseArray(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/passengerRides/"));
  passengerRidesRef.loaded(function(r){
    $scope.passengerRides = r;
  })
*/
})


.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
//    $scope.chat = Chats.get($stateParams.chatId);
})

// controls the account view
// connects with firebase destination grab the user info, and displays it
.controller('AccountCtrl', function ($scope, Auth, $firebaseObject) {
  $scope.authData = Auth.$getAuth();
  console.log($scope.authData);
  var profileRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid));
  profileRef.$loaded().then(function(){
    $scope.profile = profileRef;
    console.log($scope.profile);
  })
});
