angular.module('starter.controllers', [])

//controls the view for myRides.
//connects with the dbs to list the hosted rides, the passenger ride, and past rides
//can click on a ride too see more info about it.


//controls the search function.
//connects with the database, and queries it with the given input
//queries based on 'from' and 'to' coordinates, + 'date'.
//can add option to query to anywhere, or a date range

.controller('SearchCtrl', function($scope, Auth, $firebaseArray, RidesDbs, $ionicLoading){
  //get user data //
  $scope.authData = Auth.$getAuth();
  var userRidesRef = $firebaseArray(new Firebase("http://hiked.firebaseio.com/users/" + $scope.authData.uid + "/rides/"));

  // error for input validation /./
  $scope.error = false;
  $scope.errorMessage = "";

  $scope.noRides = false;

  //search function
  $scope.search = function(input) {
    if(validate(input)) {
      //then there is no error//
      $scope.error = false;
      //create a query //
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
     // to query a date range, do date: {$lt: query.datefrom + 1, $gt: query.dateto -1}

      // send a query to the dbs, once a response is given, create popup //
      $ionicLoading.show({
        template: 'Searching...'
      });
      RidesDbs.query(queryJson).then(function(results){
        console.log(results);
        $ionicLoading.hide();
        $scope.rides=results;
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

  //validates a query. from, to and date must be filled //
  validate = function(input) {
    if(input == null)
      return false;
    return (input.from != null && input.to != null && input.date != null);
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
.controller('PostRideCtrl', function ($scope, RidesDbs, Auth, $firebaseArray, $ionicPopup, UserDbs, $ionicLoading) {
  //data variable for the input.
  $scope.data = {};

  //defaults:
  $scope.data.spots = 3;

  // times for the time dropdown option //
  $scope.times = ['00:00','00:30','01:00','01:30',  '02:00',  '02:30',  '03:00',  '03:30',  '04:00',  '04:30',  '05:00',  '05:30',  '06:00',  '06:30',  '07:00',
  '07:30',  '08:00',  '08:30',  '09:00',  '09:30',  '10:00',  '10:30',  '11:00',  '11:30',  '12:00',  '12:30',  '13:00',  '13:30',  '14:00',  '14:30',  '15:00',
  '15:30',  '16:00',  '16:30',  '17:00',  '17:30',  '18:00',  '18:30',  '19:00',  '19:30',  '20:00',  '20:30',  '21:00',  '21:30',  '22:00',  '22:30',  '23:00',  '23:30'];

  $scope.error = false;

  // get reference to user in dbs //
  $scope.authData = Auth.$getAuth();

  // function that takes input and creates a ride on server //
  $scope.postRide = function(data) {
    console.log(data);
    if(validate(data)) {
      $scope.error = false;
      var Ride = new RidesDbs();
      //create loading screen //
      $ionicLoading.show({
        template: 'Loading...'
      });
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
    // copy input from data to dbs reference //
    dbs.from = data.from.name;
    dbs.to = data.to.name;
    dbs.fromCoord = {"lat": data.from.geometry.location.lat(), "long": data.from.geometry.location.lng()};
    dbs.toCoord =  {"lat": data.to.geometry.location.lat(), "long": data.to.geometry.location.lng()}
    //dbs.date = data.date;
    dbs.day = data.date.getDay();
    dbs.month = data.date.getMonth();
    dbs.year = data.date.getYear();
    dbs.time = data.time;
    dbs.spots = data.spots;
    dbs.driverid = $scope.authData.uid;


    dd = data.date.getDate();
    yy = data.date.getYear();
    mm = data.date.getMonth() + 1;
    yymmdd = dd + mm*100 + yy*10000;
    dbs.date = yymmdd;


    // save to ride database //
    dbs.$save().then(function(m){
      $ionicLoading.hide();
      $scope.showConfirm();

      // now save to user database
      rideId = m._id.$oid;
      var userRideData = {};
      userRideData.from = data.from.name;
      userRideData.to = data.to.name;
      userRideData.rideId = rideId;
      userRideData.driver = dbs.driverid;
      userRideData.date = dbs.date;
      UserDbs.getById($scope.authData.uid).then(function(result){
        console.log(result);
        result.rides.push(userRideData);
        result.$saveOrUpdate();
        console.log("here i should save the ride to the user dbs");
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
// stores the facebook uid and image on the dbs
// each user has a unique uid
.controller('LoginCtrl', function ($scope, $ionicPopover, Auth, $state, $firebaseArray, $firebaseObject, UserDbs) {


        //register -> brings to register page
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
  });

  $scope.upcoming = function(item) {
    today = new Date();
    dd = today.getDate();
    yy = today.getYear();
    mm = today.getMonth() + 1;
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
