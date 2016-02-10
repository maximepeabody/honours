angular.module('starter.services', [])

.factory('Auth', function($firebaseAuth) {
    var userRef = new Firebase("https://hiked.firebaseio.com/users");
    return $firebaseAuth(userRef);
})
.factory('UserDbs', function($mongolabResourceHttp) {
  return $mongolabResourceHttp('users');
})
.factory('RidesDbs', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('rides');
});
