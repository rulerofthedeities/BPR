(function(ng, app){
	"use strict";

	app.config(function($routeProvider){
		$routeProvider.when('/add', {
			templateUrl: 'partials/views/bpnew.htm'
		}).when('/all', {
			templateUrl: 'partials/views/bplist.htm'
		}).when('/charts', {
			templateUrl: 'partials/views/bpcharts.htm'
		}).otherwise({redirectTo: '/add'});
	});

})(angular, kmBpr);

