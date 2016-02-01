angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, Auth) {
    $scope.authData = Auth.$getAuth();
    $scope.user = {};
    $scope.user.name = $scope.authData.facebook.displayName;

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

.controller('LoginCtrl', function ($scope, $ionicPopover, Auth, $state) {

        //register -> brings to register page
        $scope.register = function () {
                $state.go('register');
            }
            //login with email
        $scope.login = function (data) {
            $state.go('menu.account');
        }

        //login with facebook
        $scope.fbLogin = function () {
            Auth.$authWithOAuthPopup("facebook").then(function (authData) {
                    console.log(authData);
                    $state.go('menu.rides');
                }).catch(function (error) {
                    Auth.$authWithOAuthRedirect("facebook").then(function (authData) {
                        $state.go('menu.rides');

                    }).catch(function (error) {

                    })

                })
                /*  var ref = new Firebase("https://hiked.firebaseio.com/users");
                  Auth.authWithOAuthPopup("facebook", function(error, authData) {
                    if (error) {
                      console.log("Login Failed!", error);
                      Auth.authWithOAuthRedirect("facebook", function(error, authData) {
                          if (error) {
                              console.log("error");
                          }
                          else {
                              $scope.authData = authData;
                          }
                      });
                    } else {
                      console.log("Authenticated successfully with payload:", authData);
                      $scope.authData = authData;
                      $state.go('tab.dash');
                    }
                  }
                  */
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

.controller('AccountCtrl', function ($scope) {

});