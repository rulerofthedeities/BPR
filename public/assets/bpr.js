var app = angular.module("bpApp", []);
app.controller("formController", function($scope, $http){
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
        //$http.post('/submitBP', this.bpr).then(function(response) {
        	//update list
		    $scope.records.unshift(response.data); 
		    $scope.bpForm.$setPristine();
		});

	    this.bpr = {};
    
    };
});

app.directive("bpNav", function(){

	
	var controller = ['$scope', function($scope){
		$scope.tab = 1;
		$scope.navbarCollapsed = true;
		$scope.setTab = function(newTab){
			this.tab = newTab;
		};
		$scope.isSet = function(tab){
			return tab === this.tab;
		};
		$scope.isCollapsed = function(){
			return $scope.navbarCollapsed;
		};
    }];
	
/*
	var controller = function(){
		this.tab = 1;
		this.navbarCollapsed = true;

		this.setTab = function(newTab){
			this.tab = newTab;
		};
		this.isSet = function(tab){
			console.log(tab + ' - ' + this.tab);
			return tab === this.tab;
		};
		this.isCollapsed = function(){
			return this.navbarCollapsed;
		};

	};
*/
	return{
		restrict: 'E',
		templateUrl: '/assets/templates/bpnav.htm',
		controller:controller
		//controllerAs: "panel" 
	};
});

app.directive('addBp', function(){
	return{
		restrict: 'E',
		templateUrl: '/assets/templates/addbp.htm'
	};
});

app.directive('bpList', function(){
	return{
		restrict: 'E',
		templateUrl: '/assets/templates/bplist.htm'
	};
});


app.directive('bpRecord', function(){
	var controller = ['$http', '$scope', function($http, $scope){
                this.records = [];
                $http.get("/recentrecords").then(function(response){
                    $scope.records = response.data;
                });
            }];

	return{
		restrict: 'E',
		templateUrl: '/assets/templates/bprecord.htm',
		controller: controller 
	};
});

