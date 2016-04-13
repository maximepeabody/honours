angular.module('starter.controllers', [])


//controls the search function.
//connects with the database, and queries it with the given input
//queries based on 'origin' and 'destination' coordinates, + 'date'.
//can add option destination query destination anywhere

.controller('SearchCtrl', function($scope, $localStorage, Auth, $resource, $ionicHistory, $ionicLoading, RidesDbs, $state, DateFormater) {
  //get user data //
  $scope.authData = Auth.$getAuth();
  $scope.dateFormater = DateFormater;
  // error for input validation //
  $scope.error = false;
  $scope.errorMessage = "";
  $scope.noRides = false;

  $scope.goTo = function(ride) {
    $localStorage.setObject('viewObject', ride);
    $state.go("menu.rideView");
  };

  $scope.search = function(input) {
    //if there is no error with the input, then try to query the database//
    if (validate(input)) {
      $scope.error = false;

      //create a query //
      var q = createQuery(input);

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
  var validate = function(input) {
    if (input == null)
      return false;
    return (input.origin != null && input.destination != null && input.date != null);
  }

  //creates a valid query from the input //
  var createQuery = function(input) {
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
    return q;
  }
})

.controller('UserViewCtrl', function($scope, Auth, RideViewObject, RidesDbs, RequestsDbs, UsersDbs, $ionicLoading, $localStorage, DateFormater) {
    $scope.dateFormater = DateFormater;
    $scope.authData = Auth.$getAuth();
    $scope.user = UsersDbs.get({
      _id: $scope.authData.uid
    }, function() {
      console.log($scope.user)
    });

    $scope.viewUser = $localStorage.getObject('userViewObject');

  })
  .controller('RideViewCtrl', function($scope, Auth, RideViewObject, RidesDbs, $ionicHistory, RequestsDbs, $state, UsersDbs, $ionicPopup, $ionicLoading, $localStorage, DateFormater) {
    $scope.dateFormater = DateFormater;
    $scope.authData = Auth.$getAuth();
    $scope.user = UsersDbs.get({
      _id: $scope.authData.uid
    }, function() {
      console.log($scope.user);
    });

    $scope.ride = $localStorage.getObject('viewObject');
    $scope.ride = RidesDbs.get({
      _id: $scope.ride._id
    }, function() {
      console.log($scope.ride);
    });

    $scope.viewProfile = function(user) {
      $localStorage.setObject('userViewObject', user);
      $state.go('menu.accountPublic');
    };

    //send a request to the driver
    $scope.requestRide = function(ride) {
      var driverid = ride.driverId;
      var rideid = ride._id;
      var userid = $scope.user._id;

      var req = {
        userId: driverid,
        ride: rideid,
        message: "Hi, I would like to be a passenger for your rideshare!",
        passenger: userid
      };

      // sends the request to the database //
      RequestsDbs.save(req, function(response) {
        console.log(response);
      });
      $scope.showAlert();
    };

    $scope.showAlert = function() {
      var alertPopup = $ionicPopup.alert({
        title: 'Confirmed',
      });

      //go to my rides page //
      alertPopup.then(function(res) {
        //console.log('reload here?');
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('menu.rides', {}, {
          reload: true
        });
      });
    };
  })

.controller('PrivateRideViewCtrl', function($scope, $timeout, Auth, $state, RideViewObject, $ionicLoading, RidesDbs, UsersDbs, $ionicLoading, $localStorage, DateFormater) {
    $scope.dateFormater = DateFormater;
    $scope.authData = Auth.$getAuth();
    $scope.ride = $localStorage.getObject('viewObject');
    $scope.DateFormater = DateFormater;
    $scope.message = {};
    $ionicLoading.show({
      template: 'Loading...'
    });

    $scope.user = UsersDbs.get({
      _id: $scope.authData.uid
    }, function() {
      console.log($scope.user);
    });


    $scope.ride = RidesDbs.get({
      _id: $scope.ride._id
    }, function() {
      console.log($scope.ride);
      $ionicLoading.hide();
    });

    $scope.doRefresh = function() {
      // here refresh data code
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply()
    };
    $scope.viewProfile = function(user) {
      $localStorage.setObject('userViewObject', user);
      $state.go('menu.accountPublic');
    };

    $scope.submitMessage = function(messageString) {
      $scope.ride.messages.push({
        name: $scope.user.name,
        message: messageString,
        timestamp: new Date()
      });
      $scope.message.body = "";
      RidesDbs.save($scope.ride);
      // need to reload after?
      // or use firebase instaed?
      //$state.go($state.current, {}, {reload: true});
    }

  })
  //controls the logout button in the menu //
  .controller('MenuCtrl', function($scope, Auth, $state) {
    $scope.logout = function() {
      Auth.$unauth();
      $state.go('login');
      console.log('loging out');
    };
  })

// controls the postRide page. takes user input and posts a ride to the database //
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

  // function that takes input and creates a ride on server //
  $scope.postRide = function(data) {

    if (validate(data)) {
      $scope.error = false;
      var query = formatQuery(data);


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

        // add UserData //
        $scope.user = UsersDbs.get({
          _id: $scope.authData.uid,
          nopopulate: true
        }, function(user) {
          console.log(user);
          console.log($scope.user)
          ride.driverId = $scope.authData.uid;
          ride.driverName = $scope.user.name;
          ride.driver = $scope.authData.uid;

          RidesDbs.save(ride, function(response) {
            console.log(response);
            user.rides.push(response._id);
            user.$save();
          });
        });
        $ionicLoading.hide();
        $scope.showConfirm();
      });


    } else {
      console.log("error");
      $scope.error = true;
      $scope.errorMessage = "Please fill out the required fields";
    }
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

  var formatQuery = function(data) {
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

    return query;
  };

  //format the ride with the google directions //
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
  };

  // function which validates the input //
  validate = function(data) {
    if (data == null) return false;
    return (data.origin != null && data.destination != null && data.date != null);
  };

  clear = function() {
    $scope.data = {};
  };

})

// controls the login
// connects with facebook, and authenticates with firebase
// sdestinationres the facebook uid and image on the dbs
// each user has a unique uid
//todo switch over to storing user data only on node server //
.controller('LoginCtrl', function($scope, $ionicPopover, Auth, $state, $firebaseArray, $firebaseObject, UsersDbs, $localStorage) {
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
      //  user.fbid = userdata.fbid;
      user._id = authData.uid;
      UsersDbs.save(user, function(u) {
        $localStorage.setObject('user', u);
        console.log(u);
      });
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
.controller('MyRidesCtrl', function($scope, $state, $ionicPopup, $firebaseArray, $ionicHistory, RideViewObject, Auth, RidesDbs, UsersDbs, RequestsDbs, CurrentUser, $localStorage, DateFormater) {
  $scope.dateFormater = DateFormater;
  $scope.authData = Auth.$getAuth();
  $scope.review = {};
  $scope.review.rating = 3;
  $scope.user = UsersDbs.get({
    _id: $scope.authData.uid
  }, function() {
    console.log($scope.user)
    checkForPastRides();
    $scope.requests = RequestsDbs.query({
      userid: $scope.user._id
    }, function() {
      console.log($scope.requests)
    });
  });

  // check if any rides are now in the past // ask for review/ rating//
  var checkForPastRides = function() {
    var currentDate = new Date();
    for (var i = 0; i < $scope.user.rides.length; i++) {
      //if date is in the past, ask for review //
      if (new Date($scope.user.rides[i].date) < currentDate) {
        $scope.user.pastRides.push($scope.user.rides[i]._id);
        $scope.showPopup(i);
      }
      // then remove it from the ride list
    }
  };

  $scope.acceptRequest = function(request) {
    //add passengerid to ride.passengers
    // add rideid to passengerid user
    var ride = RidesDbs.get({
      _id: request.ride._id
    }, function() {
      ride.passengers.push(request.passenger._id);
      RidesDbs.save(ride);
    });

    request.passenger.rides.push(request.ride._id);
    UsersDbs.save(request.passenger);

    // delete this request //
    RequestsDbs.delete({
      _id: request._id
    }, function(resp) {});
    $scope.showAlert();
  };
  $scope.declineRequest = function(request) {
    RequestsDbs.delete({
      _id: request._id
    }, function(resp) {});
    $scope.showAlert();
  };

  //for clicking on a ride //
  $scope.goTo = function(ride) {
    $localStorage.setObject('viewObject', ride);
    $state.go('menu.privateRideView');
  };

  $scope.upcoming = function(item) {
    destinationday = new Date();
    dd = destinationday.getDate();
    yy = destinationday.getYear();
    mm = destinationday.getMonth() + 1;
    yymmdd = dd + mm * 100 + yy * 10000;
    return item.date > yymmdd;
  };

  $scope.ratingsObject = {
    iconOn: 'ion-ios-star',
    rating: 2, //Optional
    minRating: 1, //Optional
    readOnly: false, //Optional
    callback: function(rating) { //Mandatory
      $scope.ratingsCallback(rating);
    }
  };

  $scope.ratingsCallback = function(rating) {
    $scope.review.rating = rating;
    console.log(rating);
  };

  $scope.showPopup = function(rideIndex) {
    $scope.data = {};
    $scope.reviewe = UsersDbs.get({
      _id: $scope.user.rides[rideIndex].driverId
    }, function(user) {

      // An elaborate, custom popup
      var reviewPopup = $ionicPopup.show({
        template: '<textarea ng-model="data.review"> </textarea><ionic-ratings ratingsobj="ratingsObject"></ionic-ratings>',
        title: 'Please Give a review to ' + $scope.reviewe.name,
        subTitle: 'For the ride from ' + $scope.user.rides[rideIndex].origin.name + ' to ' +
          $scope.user.rides[rideIndex].destination.name + ' on ' + DateFormater.formatToString($scope.user.rides[rideIndex].date),
        scope: $scope,
        buttons: [{
          text: '<b>Submit</b>',
          type: 'button-positive',
          onTap: function(e) {
            return $scope.data.review;
          }
        }]
      });
      reviewPopup.then(function(res) {
        console.log('Tapped!', res);
        console.log('rating', $scope.review.rating);
        $scope.reviewe.reviews.push({
          userName: $scope.user.name,
          rating: $scope.review.rating,
          message: res
        });
        if(!$scope.reviewe.rating ){
          $scope.reviewe.rating = $scope.review.rating;
        }
        else {
        $scope.reviewe.rating += $scope.review.rating;
      }
        console.log("reviewe", $scope.reviewe);
        UsersDbs.save($scope.reviewe);

        $scope.user.rides.splice(rideIndex, 1);
        UsersDbs.save($scope.user);
      });
    });
  };

  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Confirmed'
    });

    alertPopup.then(function(res) {
      console.log('reload page here?');
      $ionicHistory.clearCache();
      $state.go($state.current, {}, {
        reload: true
      });
    });
  };

})



// controls the account view
.controller('AccountCtrl', function($scope, Auth, UsersDbs, $ionicPopup) {
  $scope.authData = Auth.$getAuth();
  $scope.user = UsersDbs.get({
    _id: $scope.authData.uid
  });

  $scope.input = {};
  $scope.input.description = $scope.user.description;

  $scope.edit = false;

  $scope.editDescription = function(user) {
    // An elaborate, custom popup
    var descriptionPopup = $ionicPopup.show({
      template: '<textarea ng-model="user.description"> </textarea>',
      title: 'Edit your description',
      subTitle: '',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          return $scope.user.description;
        }
      }]
    });

    descriptionPopup.then(function(res) {
      console.log(res);
      //$scope.user.description = res;
      UsersDbs.save($scope.user);
    });
  };
});
