(function(ng, app){
	
	"use strict";

	app.directive("bpNav", function(DEFAULTS){
		return{
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'bpnav.htm'
		};
	})

	.directive('addBp', function(DEFAULTS){
		return{
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'addbp.htm',
			controllerAs: 'ctrl',
			controller: function($scope, bprecords){
				this.bpr = {};

				this.submitBpr = (bpr) => {
					bprecords.save(this.bpr).then((response) => {
						//update list
						$scope.records.unshift(response.data);
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
			templateUrl: DEFAULTS.DIR + 'bprecords.htm',
			controller: function($scope, $window, $attrs, modal, bprecords, settings, pager, utils){
				let currentEdit = null,
					cancelRow,
					loadRows;

				$scope.editRowNo = -1;
				$scope.limits = settings.limits;
				$scope.pageTpe = $attrs.tpe;

				cancelRow = (rowNo) => {
					if (currentEdit && currentEdit.no !== rowNo){
						//Previous edit not submitted, cancel
						$scope.cancelEdit(currentEdit.no);
					}
				};
				loadRows = (month) => {
					bprecords.retrieve('all', month).then((response) => {
						$scope.records = response.data.records;
						$scope.totalNoOfRecords = response.data.total;
					});
				};

				$scope.editRow = (rowNo) => {
					let dt = new Date($scope.records[rowNo].dt);
					cancelRow(rowNo);
					currentEdit = {
						"data":angular.copy($scope.records[rowNo]), 
						"no": rowNo
					};

					$scope.dateEdit = {
						dt,
						date: utils.getDate(dt), 
						time: utils.getTime(dt)
					};

					$scope.editRowNo = rowNo;
				};
				$scope.deleteRow = (rowNo) => {
					cancelRow(rowNo);

					modal.showModal({}, {}, null).then((result) => {
						bprecords.delete($scope.records[rowNo]);
						$scope.records.splice(rowNo, 1);
						$scope.editRowNo = -1;
					});
				};
				$scope.submitEdit = (rowNo) => {
					let dtOriginal = currentEdit.data.dt,
						dtupdated = false,
						time;

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
					time = $scope.dateEdit.time.split(":");
					$scope.dateEdit.dt.setHours(time[0]);
					$scope.dateEdit.dt.setMinutes(time[1]);

					if (dtOriginal !== $scope.dateEdit.dt.toISOString()) {
						$scope.records[rowNo].dt = $scope.dateEdit.dt;
						dtupdated = true;
					}

					bprecords.update($scope.records[rowNo]);
					$scope.editRowNo = -1;

					//Datetime updated, reload view
					if (dtupdated){
						bprecords.retrieve('all', pager.getSelectedMonth()).then((response) => {
							$scope.records = response.data.records;
						});
					}
				};
				$scope.cancelEdit = (rowNo) => {
					if (currentEdit){
						$scope.records[rowNo] = currentEdit.data;
						$scope.editRowNo = -1;
						currentEdit = null;
					}
				};
				$scope.editNote = (rowNo) => {
					let modalDefaults = {templateUrl: '/partials/modals/note.htm'},
						modalOptions = {headerText: 'Note'},
						data = {
							"note": $scope.records[rowNo].note, 
							"noteOnChart": $scope.records[rowNo].noteOnChart};

					modal.showModal(modalDefaults, modalOptions, angular.copy(data)).then(function (newData) {
						if (!angular.equals(data, newData)){
							newData._id = $scope.records[rowNo]._id;
							bprecords.update(newData, "note").then((response) => {
								$scope.records[rowNo].note = newData.note;
								$scope.records[rowNo].noteOnChart = newData.noteOnChart;
							});
						}
					});
				};
				$scope.onKeyPressed = (event) => {
					if (event.which === 13){ //Enter
						$scope.submitEdit($scope.editRowNo);
					}
				};
				$window.onkeydown = (event) => {
					if (event.which === 27){ //ESC
						$scope.cancelEdit($scope.editRowNo);
						$scope.$apply();
					}
				};
				$scope.$on("month:updated", (event, month) => {
					loadRows(month);
				});

				loadRows(pager.getCurrentMonth());
			}
	    };
	})

	.directive("bpPager", function(DEFAULTS){
		return{
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'bppager.htm',
			controller: function($scope, bprecords, pager, settings){
				let firstYear,
					curYear;
				$scope.pager = pager.getCurrentMonth();
				$scope.months = settings.months;
				
				
				bprecords.getOldestDay().then((response) => {
					let dt = new Date(response.data),
						years = [];

					firstYear = dt.getFullYear();
					curYear = new Date().getFullYear();

					for (let y = firstYear; y <= curYear; y++){
						years.push(y);
					}
					$scope.years = years;
				});

				$scope.changeMonth = (month) => {
					pager.setMonth(month);
					$scope.pager.month = month;
					$scope.$emit("month:updated", $scope.pager);
				};

				$scope.changeYear = (year) => {
					pager.setYear(year);
					$scope.pager.year = year;
					$scope.$emit("month:updated", $scope.pager);
				};

				$scope.nextMonth = (direction) => {
					let  m = $scope.pager.month + direction;
					m = m < 0 ? DEFAULTS.MONTHS - 1 : m;
					m = m % DEFAULTS.MONTHS;
					pager.setMonth(m);
					$scope.pager.month = m;
					$scope.$emit("month:updated", $scope.pager);
				};

				$scope.nextYear = (direction) => {
					let  y = $scope.pager.year + direction;
					y = y < firstYear ? curYear : y;
					y = y > curYear ? firstYear : y;
					pager.setYear(y);
					$scope.pager.year = y;
					$scope.$emit("month:updated", $scope.pager);
				};
			}
		};
	})

	.directive("datetimePicker", function(DEFAULTS){
		return{
			restrict:'E',
			templateUrl: DEFAULTS.DIR + 'datetimepicker.htm',
			controller: 
			function ($scope) {
				
				$scope.today = () => {
					$scope.dt = new Date();
				};

				$scope.clear = () => {
					$scope.dt = null;
				};
				$scope.clear();

				$scope.maxDate = new Date();

				$scope.open = ($event) => {
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
	});
})(angular, kmBpr);


