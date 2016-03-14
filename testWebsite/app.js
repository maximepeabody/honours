angular.module('app', ['google.places', 'ngResource'])
  .controller('postCtrl', function($scope, $resource) {

		var rideDbs = $resource('http://45.55.157.150:8080/ride');
		//google api
		var directionsService = new google.maps.DirectionsService;

		//format the inputted ride and directiosn info tos end to teh server//
		var formatRide = function(ride, directions) {
			ride.driverName = "name";
			ride.driverId = "id";
			ride.spots = 0;
			var leg = directions.routes[0].legs[0];
      ride.route = {};
			ride.route.distance = leg.distance;
			ride.route.duration = leg.duration;
			ride.route.duration_in_traffic = leg.duration_in_traffic;
			ride.route.steps = leg.steps;

			return ride;
		}

    $scope.postRide = function(ride) {
      console.log(ride);
      var query = {
        origin: {
          lat: ride.origin.geometry.location.lat(),
          lng: ride.origin.geometry.location.lng(),
          name: ride.origin.name
        },
        destination: {
          lat: ride.destination.geometry.location.lat(),
          lng: ride.destination.geometry.location.lng(),
          name: ride.destination.name
        },
        date: ride.date
      };

      var directionArgs = {
        origin: query.origin.lat + ',' + query.origin.lng,
        destination: query.destination.lat + ',' + query.destination.lng,
        travelMode: google.maps.TravelMode.DRIVING
      };
      var directions;
      directionsService.route(directionArgs, function(response, status) {
        console.log(response);
        directions = response;
        var ride = formatRide(query, directions);
        rideDbs.save(ride);
      });





    };

  })

.controller('searchCtrl', function() {


})

.controller('viewRidesCtrl', function() {


})
