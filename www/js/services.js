angular.module('starter.services', [])

.factory('Auth', function($firebaseAuth) {
    var userRef = new Firebase("https://hiked.firebaseio.com/users");
    return $firebaseAuth(userRef);
})
.factory('UserDbs', function($resource) {
  return $resource('http://45.55.157.150:8080/user')
})
.factory('RidesDbs', function ($resource) {
    return $resource('http://45.55.157.150:8080/ride');
});
