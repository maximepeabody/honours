// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'google.places', 'ngResource', 'firebase', 'ngRoute', 'ionic-ratings'])

.run(function ($ionicPlatform, Auth, $rootScope, $state) {

    //this gets called every time the user changes pages (states)
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
      console.log("stateChange");
      console.log(Auth.$getAuth());
      console.log(toState);
      console.log(toState.AuthRequired);

    // if the page that the user wants to go to needs authentication, check if the user is logged in
    if (toState.AuthRequired && !Auth.$getAuth()){ //Assuming the AuthService holds authentication logic
      // User isn’t authenticated
      console.log("block");
      $state.transitionTo("login");
    }
    });
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        .state('login', {
            url: '/login',
            templateUrl: 'templates/loginFb.html',
            controller: 'LoginCtrl'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl'
        })


    // setup an abstract state for the menu directive
    .state('menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl',

    })

        .state('menu.account', {
            url: '/account',
            AuthRequired: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/account.html',
                    controller: 'AccountCtrl',
                }
            }


        })
        .state('menu.accountPublic', {
            url: '/accountPublic',
            AuthRequired: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/accountPublic.html',
                    controller: 'UserViewCtrl',
                }
            }


        })
        .state('menu.postRide', {
            url: '/postRide',
            AuthRequired: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/postRide.html',
                    controller: 'PostRideCtrl'

                }
            }
        })

    .state('menu.rides', {
        cache: false,
        url: '/rides',
        AuthRequired: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/rides.html',
                controller: 'MyRidesCtrl'
            }
        }

    })
    .state('menu.search', {
        url: '/search',
        AuthRequired: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html',
                controller: 'SearchCtrl'
            }
        }


    })

    .state('menu.rideView', {
        cache: false,
          url: '/rideView',
          AuthRequired: true,
          views: {
            'menuContent':{
              templateUrl: 'templates/rideView.html',
              controller: 'RideViewCtrl',

              /*resolve: {
                ride: function($stateParams, UserDbs) {
                  console.log($stateParams.rideid);
                  return $stateParams.rideid;
                }
              }*/
            }
          }
        })
      .state('menu.privateRideView', {
              cache: false,
              url: '/privateRideView',
              AuthRequired: true,
              views: {
                'menuContent':{
                  templateUrl: 'templates/privateRideView.html',
                  controller: 'PrivateRideViewCtrl',
                }
              }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});
