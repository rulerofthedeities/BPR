angular.module("bpApp", ["ngRoute", "ui.bootstrap"])

.constant("DEFAULTS", {"dir": "partials/directives/"})

.value("settings", {
	"limits": {
		"sys": {"min": 130, "max": 140},
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

.factory("utils", function(){
	return {
		"transpose": function(a){
			return Object.keys(a[0]).map(
				function (c) { 
					return a.map(function (r) { 
						return r[c]; 
					}); 
				}
			);
		},
		"getTime": function(dt){
			return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
		}
	};
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

.factory("chart", function($http, settings){
	return{
		"fetchData": function(){
            return $http.get("/bpr/chart");
		},
		"build": function(columnData){
			var limits = settings.limits;
			return c3.generate({
				data: {
		        	x: 'x',
					columns: columnData,
					types: {
						SYS: 'spline',
						DIA: 'spline' ,
						Pulse: 'spline' 
					},
  					hide: ['Pulse'],
  					xFormat: '%Y-%m-%dT%H:%M:%S.%LZ'
				},
				axis: {
					y: {
						label: { 
							text: 'mmHg',
							position: 'outer-middle'
						},
			            max: 200,
			            min: 20
						},
					x: {
						type: 'timeseries',
						tick: {
							format: '%Y-%m-%d',
							//format: function (x) { return x.getFullYear(); },
							fit: true,
							culling: {
								max: 10 // the number of tick texts will be adjusted to less than this value
							}
						}
					}
				},
				grid: {
					x: {
						show: false,
						lines: [
							{value: "2014-06-06T18:17:04.777Z", text: 'Test'},
						]
					},
					y: {
		            	show: true,
						lines: [
							{value: limits.sys.max, text: 'Max SYS', class:'maxsys'},
							{value: limits.dia.max, text: 'max DIA', class:'maxdia'}
							]
					}
				},
				subchart: {
					show: true,
					size: {
						height: 20
					}
				}
			});
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
		controller: function($scope, $window, $attrs, $filter, modal, bprecords, settings, utils){
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
				var dt = new Date($scope.records[rowNo].dt);
				cancelRow(rowNo);
				currentEdit = {
					"data":angular.copy($scope.records[rowNo]), 
					"no": rowNo
				};

				$scope.dateEdit = {
					date: angular.copy($scope.records[rowNo].dt), 
					time: utils.getTime(dt)
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
				var dt = new Date($scope.dateEdit.date),
					dtOriginal = new Date(currentEdit.data.dt),
					originalTime = utils.getTime(dtOriginal),
					dtupdated = false;

				//Check if row data is valid
				if ($scope.bpTableForm["date" + rowNo].$invalid || 
					$scope.bpTableForm["time" + rowNo].$invalid || 
					$scope.bpTableForm["sys" + rowNo].$invalid || 
					$scope.bpTableForm["dia" + rowNo].$invalid || 
					$scope.bpTableForm["pulse" + rowNo].$invalid
				){
					return;
				}

				//Check if date or time was modified
				if (currentEdit.data.dt !== dt.toISOString() || originalTime !== $scope.dateEdit.time){
					var time = $scope.dateEdit.time.split(":");
					dt.setHours(time[0]);
					dt.setMinutes(time[1]);
					$scope.records[rowNo].dt = dt.toISOString();
					dtupdated = true;
				}

				bprecords.update($scope.records[rowNo]);
				$scope.editRowNo = -1;

				if (dtupdated){
					bprecords.retrieve('all', $scope.pager.currentPage).then(function(response){
						$scope.records = response.data.records;
					});
				}
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

.controller("chartController", function($scope, chart, utils){
	var lines = {'SYS':true, 'DIA': true, 'Pulse':false},
	chartData = [],
	srcChartData = [],
	thisChart;

	chart.fetchData().then(function(response){
		var dbData = response.data.records,
			dataSet = ['SYS', 'DIA', 'Pulse', 'x'];

		//transpose data (swap columns and rows)
		dbData = utils.transpose(dbData);
		for (var indx = 0; indx <= 3; indx++){
			chartData.push(dbData[indx]);
			chartData[indx].unshift(dataSet[indx]);
		}
		srcChartData = angular.copy(dbData); //for filtering
		thisChart = chart.build(chartData);
	});

	$scope.lines = lines;

	$scope.updateLines = function(){
		angular.forEach($scope.lines, function(show, line) {
			if (show) {
				thisChart.show([line]);
			} else {
				thisChart.hide([line]);
			}
		});
	};

	$scope.select = "all";

	$scope.updateSelection = function(){
		if ($scope.select !== "all"){
			var dt;
			chartData = [["SYS"],["DIA"],["Pulse"],["x"]];
			for (indx = 1; indx < srcChartData[0].length; indx++){
				dt = new Date(srcChartData[3][indx]);
				if (($scope.select === "am" && dt.getHours() < 12) || ($scope.select === "pm" && dt.getHours() >= 12)){
					for (var indy = 0; indy <= 3; indy++){
						chartData[indy].push(srcChartData[indy][indx]);
					}
				}
			} 
		} else {
			chartData = angular.copy(srcChartData);
		}
		thisChart.load({columns:chartData});
	};
		
})

.directive("datetimePicker", function(DEFAULTS){
	return{
		restrict:'E',
		templateUrl: DEFAULTS.dir + 'datetimepicker.htm',
		controller: 
		function ($scope) {
			
			$scope.today = function() {
				$scope.dt = new Date();
			};

			$scope.clear = function () {
				$scope.dt = null;
			};
			$scope.clear();

			$scope.maxDate = new Date();

			$scope.open = function($event) {
				$scope.status.opened = true;
			};

			$scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			$scope.formats = ['dd/MM/yy'];
			$scope.format = $scope.formats[0];

			$scope.status = {
				opened: false
			};
		}
	};
})

.directive("timePicker", function(DEFAULTS){
	return{
		restrict:'E',
		templateUrl: DEFAULTS.dir + 'timepicker.htm',
		controller: function ($scope) {
			
		}
	};
});




