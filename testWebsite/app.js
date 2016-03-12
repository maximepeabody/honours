angular.module('app', ['google.places', 'ngResource'])
.controller('postCtrl', function($scope, $resource) {
	
 	$scope.postRide = function(ride) {
		console.log(ride);
		var formatedRide = {
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
			origin: formatedRide.origin.lat + ',' + formatedRide.origin.lng,
			destination: formatedRide.destination.lat + ',' + formatedRide.destination.lng
		};
		
		var DirectionsApi = $resource('https://maps.googleapis.com/maps/api/directions/json', {});
		var directions;
		DirectionsApi.get(directionArgs,function(dir) {
			directions = dir;
			console.log(dir);
		});

    };
		
		
	
})

.controller('searchCtrl', function() {
	
	
})

.controller('viewRidesCtrl', function() {
	
	
})