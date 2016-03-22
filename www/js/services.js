angular.module('starter.services', [])

.factory('CurrentUser', function($rootScope) {
  var obj = {};
  obj.data = {};
  obj.setData = function(data) {obj.data = data; }
  return obj;
})
.factory('RideViewObject', function($rootScope) {
  var rideView = {};
  rideView.rideObject = {};
  rideView.setRideObject = function(ride) {rideView.rideObject = ride; };
  return rideView;
})
.factory('Auth', function($firebaseAuth) {
    var userRef = new Firebase("https://hiked.firebaseio.com/users");
    return $firebaseAuth(userRef);
})
.factory('UsersDbs', function($resource) {
  return $resource('http://45.55.157.150:8080/user')
})
.factory('RidesDbs', function ($resource) {
    return $resource('http://45.55.157.150:8080/ride');
});
