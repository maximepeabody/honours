angular.module('starter.controllers', [])


//controls the search function.
//connects with the database, and queries it with the given input
//queries based on 'origin' and 'destination' coordinates, + 'date'.
//can add option destination query destination anywhere, or a date range

.controller('SearchCtrl', function($scope, RideViewObject, Auth, $resource, $ionicLoading, RidesDbs, $state) {
  //get user data //
  $scope.authData = Auth.$getAuth();

  // error for input validation /./
  $scope.error = false;
  $scope.errorMessage = "";
  $scope.noRides = false;

  $scope.goTo = function(ride) {
    RideViewObject.setRideObject(ride);
    $state.go("menu.rideView");
  }

  $scope.search = function(input) {
    //if there is no error //
    if (validate(input)) {
      $scope.error = false;

      //create a query //
      var q = {
        originlat: input.origin.geometry.location.lat(),
        originlng: input.origin.geometry.location.lng(),
        destinationlat: input.destination.geometry.location.lat(),
        destinationlng: input.destination.geometry.location.lng(),
        type: input.type
      };
      if (input.type) {
        q.type = "advanced";
      }


      // show a loading popup while we wait for a response from the dbs//
      $ionicLoading.show({
        template: 'Searching...'
      });
      // query the database // returns a array
      $scope.rides = RidesDbs.query(q, function(results) {
        $ionicLoading.hide();

        if ($scope.rides.length == 0) {
          $scope.noRides = true;
        } else {
          $scope.noRides = false;
        }
      });

    }
    // if the query is invalid //
    else {
      $scope.error = true;
      $scope.errorMessage = "Please fill in the required forms"
      console.log("error");
    }
  };

  //validates a query. origin, destination and date must be filled //
  validate = function(input) {
    if (input == null)
      return false;
    return (input.origin != null && input.destination != null && input.date != null);
  }
})

.controller('RideViewCtrl', function($scope, Auth, RideViewObject, RidesDbs,CurrentUser) {
  $scope.user = CurrentUser.data;
  console.log(CurrentUser);
  console.log(RideViewObject);
  $scope.ride = RideViewObject.rideObject;
})

//controls the logout button in the menu //
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
.controller('PostRideCtrl', function($scope, Auth, RidesDbs, UsersDbs, $ionicPopup, $ionicLoading) {
  //data variable for the input.
  $scope.data = {};

  //defaults:
  $scope.data.spots = 3;
  // times for the time dropdown option //
  $scope.times = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00',
    '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];
  $scope.error = false;

  // get reference destination user in dbs //
  $scope.authData = Auth.$getAuth();

  var formatRide = function(ride, directions) {
  //  ride.spots = 0;
    var leg = directions.routes[0].legs[0];
    ride.route = {};
    ride.route.distance = leg.distance;
    ride.route.duration = leg.duration;
    ride.route.duration_in_traffic = leg.duration_in_traffic;
    ride.route.polyline = directions.routes[0].overview_polyline;
    var bounds = directions.routes[0].bounds;
    ride.route.bounds = {
      northeast: {
        lat: bounds.getNorthEast().lat(),
        lng: bounds.getNorthEast().lng()
      },
      southwest: {
        lat: bounds.getSouthWest().lat(),
        lng: bounds.getSouthWest().lng()
      }
    };

    console.log(ride);
    return ride;
  }

  // function that takes input and creates a ride on server //
  $scope.postRide = function(data) {
    console.log(data);

    if (validate(data)) {
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
        destination: data.destination.geometry.location.lat() + ',' + data.destination.geometry.location.lng(),
        travelMode: google.maps.TravelMode.DRIVING
      };

      var directionsService = new google.maps.DirectionsService;
      var directions;

      directionsService.route(directionArgs, function(dir, status) {
        directions = dir;
        var ride = formatRide(query, dir);

        //create loading screen //
        $ionicLoading.show({
          template: 'Loading...'
        });

        // get user data so we can add it to the ride //

        var user = UsersDbs.get({
          _id: $scope.authData.uid
        }, function(u) {
          ride.driver = $scope.authData.uid;
          ride.driverName = u.name;

          RidesDbs.save(ride, function(m) {
            $ionicLoading.hide();
            $scope.showConfirm();

            // now save destination user database
            console.log(m);
            rideId = m._id;
            user.rides.push(rideId);
            user.$save();
          });
        });
      });


    } else {
      console.log("error");
      $scope.error = true;
      $scope.errorMessage = "Please fill out the required fields";
    }
  };

  // function which validates the input //
  validate = function(data) {
    if (data == null) return false;
    return (data.origin != null && data.destination != null && data.date != null);
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
      if (res) {
        console.log('confirmed');
        clear();
      } else {
        console.log('canceled');
      }
    });
  };
})

//if ever i integrate email or other authentication //
.controller('RegisterCtrl', function($scope, $ionicPopup) {
  $scope.register = function(data) {


  }
})

// controls the login
// connects with facebook, and authenticates with firebase
// sdestinationres the facebook uid and image on the dbs
// each user has a unique uid
//todo switch over to storing user data only on node server //
.controller('LoginCtrl', function($scope, $ionicPopover, Auth, $state, $firebaseArray, $firebaseObject, UsersDbs ) {
  //the following logs in with facebook with either a popup or a redirect

  var saveUserData = function(authData) {
    // check firebase for user data //
    var userRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + authData.uid));
    // set the user data from facebook//
    var userdata = {
      name: authData.facebook.displayName,
      image: authData.facebook.profileImageURL,
      fbid: authData.facebook.id
    };
    //save user data //
    userRef.$loaded().then(function() {
      userRef.$value = userdata;
      userRef.$save()

      // save or update user data to node server //
      var user = {};
      user.name = userdata.name;
      user.image = userdata.image;
      user.fbid = userdata.fbid;
      user._id = authData.uid;
      UsersDbs.save(user);
      $state.go('menu.rides');
    });
  };

  $scope.fbLogin = function() {
    // uses the firebase authentication service to get data from facebook //
    Auth.$authWithOAuthPopup("facebook").then(saveUserData)
    .catch(function(error) {
      Auth.$authWithOAuthRedirect("facebook").then(saveUserData).catch(function(error) {
        console.log(error);
      })

    })

  };
})

//
.controller('MyRidesCtrl', function($scope, $state, $firebaseArray, RideViewObject, Auth, RidesDbs, UsersDbs, CurrentUser) {
  $scope.authData = Auth.$getAuth();

  //for clicking on a ride //
  $scope.goTo = function(ride) {
    RideViewObject.setRideObject(ride);
    $state.go('menu.rideView');
  }

  $scope.user = UsersDbs.get({
    _id: $scope.authData.uid
  }, function(u) {
    CurrentUser.setData(u);
  });

  $scope.upcoming = function(item) {
      destinationday = new Date();
      dd = destinationday.getDate();
      yy = destinationday.getYear();
      mm = destinationday.getMonth() + 1;
      yymmdd = dd + mm * 100 + yy * 10000;
      return item.date > yymmdd;
    }
})


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  //    $scope.chat = Chats.get($stateParams.chatId);
})

// controls the account view
// connects with firebase destination grab the user info, and displays it
.controller('AccountCtrl', function($scope, Auth, UsersDbs) {
  $scope.authData = Auth.$getAuth();
  $scope.user = UsersDbs.get({_id: $scope.authData.uid});
});
