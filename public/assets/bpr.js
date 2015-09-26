var app = angular.module("bpApp", []);
app.controller("formController", function($scope, $http){
    this.bpr = {};
    this.submitBpr = function(bpr){
	    console.log(this.bpr);
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
        	console.log("response");
        	console.log(response);
		    $scope.records = response.data; 
		 });
	    this.bpr = {};
    
    };
});

app.directive('bpRecord', function(){
	var controller = ['$http', '$scope', function($http, $scope){
                this.records = [];
                $http.get("/records").then(function(response){
                	console.log(response);
                    $scope.records = response.data;
                    console.log("database");
                    console.log($scope.records);
                });
            }];

	return{
		restrict: 'E',
		templateUrl: '/assets/bprecord.htm',
		controller: controller 
	};
});
