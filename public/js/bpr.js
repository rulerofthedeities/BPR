angular.module("bpApp", ['ngRoute'])

.config(function($routeProvider){
	$routeProvider.when('/add', {
		templateUrl: 'views/bpnew.htm'
	}).when('/all', {
		templateUrl: 'views/bplist.htm'
	}).when('/charts', {
		templateUrl: 'views/bpcharts.htm'
	}).otherwise({redirectTo: '/add'});
})

.factory("bprecords", function($http){

	return {
		"save": function(data){
			var req = {
				 method: 'POST',
				 url: '/submitBP',
				 headers: {
				   'Content-Type': "application/json"
				 },
				 data: data
				};
			return $http(req);
		},
		"retrieve": function(tpe){
            return $http.get("/getBP/" + tpe);
		}
	};
})

.controller("formController", function($scope, bprecords){
	this.bpr = {};

	this.submitBpr = function(bpr){
		bprecords.save(this.bpr).then(function(response) {
			//update list
			$scope.records.unshift(response.data); 
			$scope.bpForm.$setPristine();
		});
		this.bpr = {};
	};
})

.directive("bpNav", function(){
	return{
		restrict: 'E',
		templateUrl: '/directives/bpnav.htm'
	};
})

.directive('addBp', function(){
	return{
		restrict: 'E',
		templateUrl: '/directives/addbp.htm'
	};
})

.directive('bpList', function(){
	return{
		restrict: 'E',
		templateUrl: '/directives/bplist.htm',
		controller: function($scope, $attrs, bprecords){
            
            this.getRecords= function(){
            	bprecords.retrieve($attrs.tpe).then(function(response){
                	$scope.records = response.data;
            	});
        	};
        }
	};
})

.directive('bpRecords', function(){

	return{
		restrict: 'E',
		templateUrl: '/directives/bprecords.htm',
        require: "^bpList",
        link: function(scope, element, attrs, parentController){
  			parentController.getRecords();
		}
	};
});

