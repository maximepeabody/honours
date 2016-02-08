angular.module('starter.controllers', [])

//controls the view for myRides.
//connects with the dbs to list the hosted rides, the passenger ride, and past rides
//can click on a ride too see more info about it.


//controls the search function.
//connects with the database, and queries it with the given input
//queries based on 'from' and 'to' coordinates, + 'date'.
//can add option to query to anywhere, or a date range

.controller('SearchCtrl', function($scope, Auth, $firebaseArray, RidesDbs, $ionicPopup){

  // error for input validation /./
  $scope.error = false;
  $scope.errorMessage = "";
  //get user data //
  $scope.authData = Auth.$getAuth();
  var userRidesRef = $firebaseArray(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/rides/"));

  //search function
  $scope.search = function(input) {
    if(validate(input)) {
      $scope.error = false;
      var query = {};
      query.fromCoord = {"lat": input.from.geometry.location.lat(), "long": input.from.geometry.location.lng()};
      query.toCoord =  {"lat": input.to.geometry.location.lat(), "long": input.to.geometry.location.lng()}
      query.day = input.date.getDay();
      query.month = input.date.getMonth();
      query.year = input.date.getYear();
      queryJson = {'fromCoord.long': {$lt: query.fromCoord.long + 0.1, $gt: query.fromCoord.long - 0.1},
                   'fromCoord.lat': {$lt: query.fromCoord.lat + 0.1, $gt: query.fromCoord.lat - 0.1},
                   'toCoord.long': {$lt: query.toCoord.long + 0.1, $gt: query.toCoord.long - 0.1},
                   'toCoord.lat': {$lt: query.toCoord.lat + 0.1,$gt: query.toCoord.lat - 0.1},
                   day: query.day,
                   month: query.month,
                   year: query.year};
      RidesDbs.query(queryJson).then(function(results){
        console.log(results);
        $scope.showConfirm();
        console.log('queried');
      });
    }
    else{
      $scope.error = true;
      $scope.errorMessage = "Please fill in the required forms"
      console.log("error");
    }
  };

  validate = function(input) {
    if(input == null)
      return false;
    return (input.from != null && input.to != null && input.date != null);
  }

  //popup code //
  // A confirm dialog
 $scope.showConfirm = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Consume Ice Cream',
     template: 'Are you sure you want to eat this ice cream?'
   });

   confirmPopup.then(function(res) {
     if(res) {
       console.log('You are sure');
     } else {
       console.log('You are not sure');
     }
   });
 };

})

//controls the logout button in the menu //
.controller('MenuCtrl', function($scope, Auth, $state) {
  $scope.logout = function() {
    Auth.$unauth();
    $state.go('login');
    console.log('loging out');
  };
})

// controller to post the ride data to server //
// ride data has form:
// from: city
// to  : city
// from: latitude, longitude
// to  : latitude, longitude
// date: day//month/year
// time
// number of passengers
// approximate cost:
.controller('PostRideCtrl', function ($scope, RidesDbs, Auth, $firebaseArray, $ionicPopup) {
  $scope.data = {};
  $scope.data.spots = 3;
  // times for the time dropdown option //
  $scope.times = ['00:00','00:30','01:00','01:30',  '02:00',  '02:30',  '03:00',  '03:30',  '04:00',  '04:30',  '05:00',  '05:30',  '06:00',  '06:30',  '07:00',
  '07:30',  '08:00',  '08:30',  '09:00',  '09:30',  '10:00',  '10:30',  '11:00',  '11:30',  '12:00',  '12:30',  '13:00',  '13:30',  '14:00',  '14:30',  '15:00',
  '15:30',  '16:00',  '16:30',  '17:00',  '17:30',  '18:00',  '18:30',  '19:00',  '19:30',  '20:00',  '20:30',  '21:00',  '21:30',  '22:00',  '22:30',  '23:00',  '23:30'];
  //$scope.data;
  $scope.error = false;
  // get reference to user in dbs //
  $scope.authData = Auth.$getAuth();
  var userRidesRef = $firebaseArray(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/rides/"));

  // function that takes input and creates a ride on server //
  $scope.postRide = function(data) {
    console.log(data);
    var Ride = new RidesDbs();
    if(validate(data)) {
      $scope.error = false;
      saveToDbs(data, Ride);
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
    return(data.from != null && data.to != null && data.date != null );
  };

  //function that takes input data and formats it for database //
  saveToDbs = function(data, dbs) {
    dbs.from = data.from.name;
    dbs.to = data.to.name;
    dbs.fromCoord = {"lat": data.from.geometry.location.lat(), "long": data.from.geometry.location.lng()};
    dbs.toCoord =  {"lat": data.to.geometry.location.lat(), "long": data.to.geometry.location.lng()}
    dbs.date = data.date;
    dbs.day = data.date.getDay();
    dbs.month = data.date.getMonth();
    dbs.year = data.date.getYear();
    dbs.time = data.time;
    dbs.spots = data.spots;
    dbs.driverid = $scope.authData.uid;
    dbs.$save().then(function(m){
      rideId = m._id.$oid;
      userRidesRef.$add(rideId);
      $scope.showConfirm();
      console.log(m);
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
// stores the facebook uid and image on the dbs
// each user has a unique uid
.controller('LoginCtrl', function ($scope, $ionicPopover, Auth, $state, $firebaseArray, $firebaseObject) {


        //register -> brings to register page
        $scope.register = function () {
                $state.go('register');
            }
            //login with email
        $scope.login = function (data) {
            $state.go('menu.account');
        }

        //login with facebook -- prefered?
        $scope.fbLogin = function () {
            Auth.$authWithOAuthPopup("facebook").then(function (authData) {
                    var userRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + authData.uid));

                    var userdata = {name: authData.facebook.displayName, image: authData.facebook.profileImageURL, fbid: authData.facebook.id };
                    userRef.$loaded().then(function(){
                      userRef.$value = userdata;
                      userRef.$save()
                      $state.go('menu.rides');
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
                      console.log(authData);

                    }).catch(function (error) {
                        console.log(error);
                    })

                })

        };
})

//
.controller('MyRidesCtrl', function ($scope, $firebaseArray, Auth, RidesDbs) {
  $scope.authData = Auth.$getAuth();
  RidesDbs.query({ '$or':{'driverid': $scope.authData.uid}, {'passengers.'}).then(function(results){
    console.log(results);
    $scope.rides = results;
  }, function(error){
    console.log(error);
  });


})


.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
//    $scope.chat = Chats.get($stateParams.chatId);
})

// controls the account view
// connects with firebase to grab the user info, and displays it
.controller('AccountCtrl', function ($scope, Auth, $firebaseObject) {
  $scope.authData = Auth.$getAuth();
  console.log($scope.authData);
  var profileRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid));
  profileRef.$loaded().then(function(){
    $scope.profile = profileRef;
    console.log($scope.profile);
  })
});
