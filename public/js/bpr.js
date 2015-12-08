angular.module("bpApp", ["ngRoute", "ui.bootstrap"])

.constant("DEFAULTS", {"dir": "partials/directives/"})

.value("settings", {
	"limits": {
		"sys": {"min": 140, "max": 150},
		"dia": {"min": 80, "max": 90}
	},
	"rowsPerPage" : 10
}
)

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
				 url: '/bpr',
				 headers: {
				   'Content-Type': "application/json"
				 },
				 data: data
				};
			return $http(req);
		},
		"retrieve": function(tpe, page){
            return $http.get("/bpr/" + tpe + '?page=' + page);
		},
		"update": function(data){
			return $http.put("/bpr", data);
		},
		"delete": function(data){
			var id = data._id;
			return $http.delete("/bpr?id=" + id);
		}
	};
})

.service('modal', function ($uibModal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: '/partials/modals/confirm.htm'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Delete?',
        bodyText: 'Are you sure you want to delete this record?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
		if (!customModalDefaults) {
			customModalDefaults = {};
		}
		customModalDefaults.backdrop = 'static';

		var tempModalDefaults = {};
		var tempModalOptions = {};

		angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
		angular.extend(tempModalOptions, modalOptions, customModalOptions);

		if (!tempModalDefaults.controller) {
			tempModalDefaults.controller = function ($scope, $uibModalInstance) {
				$scope.modalOptions = tempModalOptions;
				$scope.modalOptions.ok = function (result) {
					$uibModalInstance.close(result);
				};
				$scope.modalOptions.close = function (result) {
					$uibModalInstance.dismiss('cancel');
				};
			};
		}

		return $uibModal.open(tempModalDefaults).result;
	};
})

.directive("bpNav", function(DEFAULTS){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'bpnav.htm'
	};
})

.directive('addBp', function(DEFAULTS, settings){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'addbp.htm',
		controllerAs: 'ctrl',
		controller: function($scope, bprecords){
			this.bpr = {};

			this.submitBpr = function(bpr){
				bprecords.save(this.bpr).then(function(response) {
					//update list
					$scope.records.unshift(response.data);
					$scope.records = $scope.records.splice(0, settings.rowsPerPage); 
					$scope.bpForm.$setPristine();
				});
				this.bpr = {};
			};
		}
	};
})

.directive('bpRecords', function(DEFAULTS){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'bprecords.htm',
		controller: function($scope, $window, $attrs, modal, bprecords, settings){
        	var currentEdit = null,
        		cancelRow;

        	$scope.editRowNo = -1;
        	$scope.limits = settings.limits;
        	$scope.tpe = $attrs.tpe;

			cancelRow = function(rowNo){
				if (currentEdit && currentEdit.no !== rowNo){
					//Previous edit not submitted, cancel
					$scope.cancelEdit(currentEdit.no);
				}
			};

			$scope.editRow = function(rowNo){
				cancelRow(rowNo);
				currentEdit = {
					"data":angular.copy($scope.records[rowNo]), 
					"no": rowNo
				};
				$scope.editRowNo = rowNo;
			};
			$scope.deleteRow = function(rowNo){
				cancelRow(rowNo);

				var modalOptions = {
					closeButtonText: 'Cancel',
					actionButtonText: 'Delete record',
					headerText: 'Delete?',
					bodyText: 'Are you sure you want to delete this record?'
				};

				modal.showModal({}, modalOptions).then(function (result) {
					bprecords.delete($scope.records[rowNo]);
					$scope.records.splice(rowNo, 1);
					$scope.editRowNo = -1;
				});
			};
			$scope.submitEdit = function(rowNo){
				bprecords.update($scope.records[rowNo]);
				$scope.editRowNo = -1;
			};
			$scope.cancelEdit = function(rowNo){
				if (currentEdit){
					$scope.records[rowNo] = currentEdit.data;
					$scope.editRowNo = -1;
					currentEdit = null;
				}
			};
			$scope.onKeyPressed = function(event){
				if (event.which === 13){ //Enter
					$scope.submitEdit($scope.editRowNo);
				}
			};
			$window.onkeydown = function(event) {
				if (event.which === 27){ //ESC
					$scope.cancelEdit($scope.editRowNo);
					$scope.$apply();
				}
			};
		}
    };
})

.directive("bpPager", function(DEFAULTS){
	return{
		restrict: 'E',
		templateUrl: DEFAULTS.dir + 'pager.htm',
		controller: function($scope, bprecords){
			var loadRows;

			$scope.pager = {};
        	$scope.pager.currentPage = 1;

        	loadRows = function(page){
				bprecords.retrieve('all', page).then(function(response){
					$scope.records = response.data.records;
					$scope.pager.totalNoOfRecords = response.data.total;
				});
			};

			loadRows($scope.pager.currentPage);
			
			$scope.pager.pageChanged = function() {
				loadRows($scope.pager.currentPage);
			};
		}
	};
})
;



