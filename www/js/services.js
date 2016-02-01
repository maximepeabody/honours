angular.module('starter.services', [])

.factory('Auth', function($firebaseAuth) {
    var userRef = new Firebase("https://hiked.firebaseio.com/users");
    return $firebaseAuth(userRef);
})

.factory('Rides', function() {
  // Might use a resource here that returns a JSON array

});
