angular.module('starter.services', [])

.factory('Auth', function($firebaseAuth) {
    var userRef = new Firebase("https://hiked.firebaseio.com/users");
    return $firebaseAuth(userRef);
})
.factory('RidesDbs', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('rides');
});
