angular.module("bpApp", ['ngRoute'])

.constant("DEFAULTS", {"dir": "partials/directives/"})

.config(function($routeProvider){
	$routeProvider.when('/add', {
		templateUrl: 'partials/views/bpnew.htm'
	}).when('/all', {
		templateUrl: 'partials/views/bplist.htm'
	}).when('/charts', {
		templateUrl: 'partials/views/bpcharts.htm'
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
		},
		"update": function(data){
			return $http.put("/updateBP", data);
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

.directive("bpNav", function(DEFAULTS){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'bpnav.htm'
	};
})

.directive('addBp', function(DEFAULTS){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'addbp.htm'
	};
})

.directive('bpRecords', function(DEFAULTS){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'bprecords.htm',
		controller: function($scope, $attrs, bprecords){
        	var currentEdit = null,
        		cancelRow = function(rowNo){
					if (currentEdit && currentEdit.no !== rowNo){
						//Previous edit not submitted, cancel
						$scope.cancelEdit(currentEdit.no);
					}
				};

        	$scope.editRowNo = -1;
        	
        	bprecords.retrieve($attrs.tpe).then(function(response){
            	$scope.records = response.data;
        	});

			$scope.editRow = function(rowNo){
				cancelRow(rowNo);
				currentEdit = {"data":angular.copy($scope.records[rowNo]), "no": rowNo};
				$scope.editRowNo = rowNo;
			};
			$scope.deleteRow = function(rowNo){
				cancelRow(rowNo);
				//TODO:prompt and submit to database
			};
			$scope.submitEdit = function(rowNo){
				//TODO:submit to database
				bprecords.update($scope.records[rowNo]);
				$scope.editRowNo = -1;
			};
			$scope.cancelEdit = function(rowNo){
				$scope.records[rowNo] = currentEdit.data;
				$scope.editRowNo = -1;
				currentEdit = null;
			};
        }
	};
});
