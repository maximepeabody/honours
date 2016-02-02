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
  usersRef = $firebaseObject(new Firebase("https://hiked.firebaseio.com/users/facebook:02930329"));
  usersRef.$loaded().then(function() {
    console.log(usersRef);
  //  var usr = usersRef.$value;
  //  usr.newVal = "tret";
    usersRef.newVal = "test";
    usersRef.$save();

  });


})

.controller('SearchCtrl', function($scope, Auth, $firebaseObject, $firebaseArray){

})

.controller('MenuCtrl', function($scope, Auth, $state) {
  $scope.logout = function() {
    Auth.$unauth();
    $state.go('login');
    console.log('loging out');
  };
})

.controller('PostRideCtrl', function ($scope, $firebaseArray) {
  $scope.postRide = function(data) {
  console.log(data);
  console.log(data.from.geometry.location.lat());
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



        //for registering with email//
        /*
            // .fromTemplateUrl() method
            $ionicPopover.fromTemplateUrl('templates/register.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
            });



            $scope.openPopover = function($event) {
                console.log("test");
                $scope.popover.show($event);
            };
            $scope.closePopover = function() {
                $scope.popover.hide();
            };
            */

    })
    .controller('RidesCtrl', function ($scope, $firebaseArray) {

    })
    .controller('SearchCtrl', function ($scope, $firebaseArray) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        //first, search for rides //
        //from A to B, A to anywhere, and on a certain date //
        $scope.searched = false;
        var ridesRef = new Firebase("http://hiked.firebaseio.com/rides");

        $scope.search = function (query) {
            $scope.filteredRides = $firebaseArray(ridesRef.orderByChild("from").equalTo(query.from));
            $scope.searched = true;
            console.log("searched");
        }

        $scope.returnToSearch = function () {
            // $scope.filteredRides = {};
            $scope.searched = false;
        }


        // this creates an array which is binded to the database
        // $scope.rides = $firebaseArray(ridesRef);


        $scope.addRide = function (to, from, driver, date, time, pickup) {
            console.log("date:" + date);
            $scope.rides.$add({
                to: to,
                from: from,
                driver: driver,
                date: date,
                time: time,
                pickup: pickup
            });
        };

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
