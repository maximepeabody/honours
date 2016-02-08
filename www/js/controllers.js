angular.module('starter.controllers', [])

.controller('MyridesCtrl', function($scope, Auth, $firebaseObject) {
  $scope.authData = Auth.$getAuth();
  console.log($scope.authData);

  myRidesRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/rides"));
  myRidesRef.$loaded().then(function(){
    console.log("myRides is loaded");
    console.log(myRidesRef);
    $scope.rides = myRidesRef;
  });
  //quick test to see if dbs security rules work:
/*  usersRef = $firebaseObject(new Firebase("https://hiked.firebaseio.com/users/facebook:02930329"));
  usersRef.$loaded().then(function() {
    console.log(usersRef);
  //  var usr = usersRef.$value;
  //  usr.newVal = "tret";
    usersRef.newVal = "test";
    usersRef.$save();
  });
*/

})

.controller('SearchCtrl', function($scope, Auth, $firebaseArray, RidesDbs){
  $scope.authData = Auth.$getAuth();
  var userRidesRef = $firebaseArray(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/hostedRides/"));
  //RidesDbs.query().then();


  $scope.search = function(input) {
    if(validate(input)) {
      var query = {};
      query.fromCoord = {"lat": input.from.geometry.location.lat(), "long": input.from.geometry.location.lng()};
      query.toCoord =  {"lat": input.to.geometry.location.lat(), "long": input.to.geometry.location.lng()}
      query.day = input.date.getDay();
      query.month = input.date.getMonth();
      query.year = input.date.getYear();
      queryJson = {'fromCoord.long': {$lt: query.fromCoord.long + 0.1},
                   'fromCoord.long': {$gt: query.fromCoord.long - 0.1},
                   'fromCoord.lat': {$lt: query.fromCoord.lat + 0.1},
                   'fromCoord.lat': {$gt: query.fromCoord.lat - 0.1},
                   'toCoord.long': {$lt: query.toCoord.long + 0.1},
                   'toCoord.long': {$gt: query.toCoord.long - 0.1},
                   'toCoord.lat': {$lt: query.toCoord.lat + 0.1},
                   'toCoord.lat': {$gt: query.toCoord.lat - 0.1},
                   day: query.day,
                   month: query.month,
                   year: query.year};
      RidesDbs.query(queryJson).then(function(results){
        console.log(results);
        console.log('queried');
      });
    }
    else{
      console.log("error");
    }
  };

  validate = function(input) {
    if(input == null)
      return false;
    return (input.from != null && input.to != null && input.date != null);
  }
})

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
.controller('PostRideCtrl', function ($scope, RidesDbs, Auth, $firebaseArray) {
  // times for the time dropdown option //
  $scope.times = ['00:00',
  '00:30',
  '01:00',
  '01:30',
  '02:00',
  '02:30',
  '03:00',
  '03:30',
  '04:00',
  '04:30',
  '05:00',
  '05:30',
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30'];


  // get reference to user in dbs //
  $scope.authData = Auth.$getAuth();
  var userRidesRef = $firebaseArray(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/hostedRides/"));

  // function that takes input and creates a ride on server //
  $scope.postRide = function(data) {
    console.log(data);
    var Ride = new RidesDbs();
    if(validate(data)) {
      saveToDbs(data, Ride);
    }
    else {
      console.log("error");
    }
  };

  // function which validates the input //
  validate = function(data) {
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
      console.log(m);
    });
  };
})

.controller('RegisterCtrl', function ($scope, $ionicPopup) {
    $scope.register = function (data) {


    }
})

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
.controller('RidesCtrl', function ($scope, $firebaseArray) {

})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function ($scope, Auth, $firebaseObject) {
  $scope.authData = Auth.$getAuth();
  console.log($scope.authData);
  var profileRef = $firebaseObject(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid));
  profileRef.$loaded().then(function(){
    $scope.profile = profileRef;
    console.log($scope.profile);
  })
});
