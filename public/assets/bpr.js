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

.controller("formController", function($scope, $http){
    this.bpr = {};
    this.submitBpr = function(bpr){
    	//this.bpr.dtSubmit = new Date();

	    //Post new bpr
	    var req = {
			 method: 'POST',
			 url: '/submitBP',
			 headers: {
			   'Content-Type': "application/json"
			 },
			 data: this.bpr
			};
		$http(req).then(function(response) {
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

	var controller = ['$http', '$scope', '$attrs', function($http, $scope, $attrs){
            
            this.getRecords= function(){
            	$http.get("/records/" + $attrs.tpe).then(function(response){
                	$scope.records = response.data;
            	});
        	};
        }];

	return{
		restrict: 'E',
		templateUrl: '/directives/bplist.htm',
		controller: controller
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

