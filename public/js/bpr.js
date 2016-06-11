'use strict';

var kmBpr = angular.module("kmBpr", ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'ngCsv']).constant("DEFAULTS", {
	"DIR": "partials/directives/",
	"MONTHS": 12 }).value("settings", {
	"limits": {
		"sys": { "min": 130, "max": 140 },
		"dia": { "min": 80, "max": 90 }
	},
	"months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

(function (ng, app) {
	"use strict";

	app.config(function ($routeProvider) {
		$routeProvider.when('/add', {
			templateUrl: 'partials/views/bpnew.htm'
		}).when('/all', {
			templateUrl: 'partials/views/bplist.htm'
		}).when('/charts', {
			templateUrl: 'partials/views/bpcharts.htm'
		}).when('/export', {
			templateUrl: 'partials/views/bpexport.htm'
		}).otherwise({ redirectTo: '/add' });
	});
})(angular, kmBpr);

(function (ng, app) {

	"use strict";

	app.controller("chartController", function ($scope, chart, utils) {
		var lines = { 'SYS': true, 'DIA': true, 'Pulse': false },
		    chartData = [],
		    srcChartData = [],
		    dataSet = [],
		    thisChart = undefined;

		var loadChart = function loadChart() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			$scope.loaded = false;
			chart.fetch().then(function (response) {
				var dbData = response.data.records;

				dataSet = Object.keys(dbData[0]);
				//transpose data (swap columns and rows)
				dbData = utils.transpose(dbData);
				for (var indx = 0; indx <= 3; indx++) {
					chartData.push(dbData[indx]);
					chartData[indx].unshift(dataSet[indx]);
				}
				srcChartData = angular.copy(dbData); //for filtering
				thisChart = chart.build(chartData, {});
				$scope.updateLines();
				$scope.loaded = true;
			});
		};

		$scope.lines = lines;

		$scope.updateLines = function () {
			angular.forEach($scope.lines, function (show, line) {
				line = line.toLowerCase();
				if (show) {
					thisChart.show([line]);
				} else {
					thisChart.hide([line]);
				}
			});
		};

		$scope.select = "all";

		$scope.updateSelection = function () {
			if ($scope.select !== "all") {
				var dt = undefined,
				    dtIndex = undefined;
				dtIndex = dataSet.indexOf("dt");
				if (dtIndex >= 0) {
					chartData = [[dataSet[0]], [dataSet[1]], [dataSet[2]], [dataSet[3]]];
					for (var indx = 1; indx < srcChartData[0].length; indx++) {
						dt = new Date(srcChartData[dtIndex][indx]);

						if ($scope.select === "am" && dt.getHours() < 12 || $scope.select === "pm" && dt.getHours() >= 12) {
							for (var indy = 0; indy <= 3; indy++) {
								chartData[indy].push(srcChartData[indy][indx]);
							}
						}
					}
				}
			} else {
				chartData = angular.copy(srcChartData);
			}
			thisChart.load({ columns: chartData });
		};

		$scope.notes = false;

		$scope.updateNotes = function () {
			if ($scope.notes) {
				//adding notes to chart
				chart.fetch("notes").then(function (response) {
					var notes = [];
					angular.forEach(response.data.records, function (value, key) {
						notes.push({ value: value.dtNote, text: value.note });
					});
					thisChart = chart.build(chartData, { grid: { x: { lines: notes } } });
					$scope.updateLines();
				});
			} else {
				//removing notes from chart
				thisChart = chart.build(chartData, {});
				$scope.updateLines();
			}
		};

		loadChart();
	}).controller("exportController", function ($scope, $q, exp) {
		$scope.order = ['d', 'h', 'sys', 'dia', 'pulse'];
		$scope.filename = "bpr";

		$scope.getBprArray = function () {
			var deferred = $q.defer();
			exp.fetch().then(function (response) {
				deferred.resolve(response.data.records);
			});
			return deferred.promise;
		};
	});
})(angular, kmBpr);

(function (ng, app) {

	"use strict";

	app.directive("bpNav", function (DEFAULTS) {
		return {
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'bpnav.htm'
		};
	}).directive('addBp', function (DEFAULTS) {
		return {
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'addbp.htm',
			controllerAs: 'ctrl',
			controller: function controller($scope, bprecords) {
				var _this = this;

				this.bpr = {};

				this.submitBpr = function (bpr) {
					bprecords.save(_this.bpr).then(function (response) {
						//update list
						$scope.records.unshift(response.data);
						$scope.bpForm.$setPristine();
					});
					_this.bpr = {};
				};
			}
		};
	}).directive('bpRecords', function (DEFAULTS) {
		return {
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'bprecords.htm',
			controller: function controller($scope, $window, $attrs, modal, bprecords, settings, pager, utils) {
				var currentEdit = null,
				    cancelRow = undefined,
				    loadRows = undefined;

				$scope.editRowNo = -1;
				$scope.limits = settings.limits;
				$scope.pageTpe = $attrs.tpe;
				$scope.loaded = false;

				cancelRow = function (rowNo) {
					if (currentEdit && currentEdit.no !== rowNo) {
						//Previous edit not submitted, cancel
						$scope.cancelEdit(currentEdit.no);
					}
				};
				loadRows = function (month) {
					bprecords.retrieve('all', month).then(function (response) {
						$scope.records = response.data.records;
						$scope.totalNoOfRecords = response.data.total;
						$scope.loaded = true;
					});
				};

				$scope.editRow = function (rowNo) {
					var dt = new Date($scope.records[rowNo].dt);
					cancelRow(rowNo);
					currentEdit = {
						"data": angular.copy($scope.records[rowNo]),
						"no": rowNo
					};

					$scope.dateEdit = {
						dt: dt,
						date: utils.getDate(dt),
						time: utils.getTime(dt)
					};

					$scope.editRowNo = rowNo;
				};
				$scope.deleteRow = function (rowNo) {
					cancelRow(rowNo);

					modal.showModal({}, {}, null).then(function (result) {
						bprecords.delete($scope.records[rowNo]);
						$scope.records.splice(rowNo, 1);
						$scope.editRowNo = -1;
					});
				};
				$scope.submitEdit = function (rowNo) {
					var dtOriginal = currentEdit.data.dt,
					    dtupdated = false,
					    time = undefined;

					//Check if row data is valid
					if ($scope.bpTableForm["sys" + rowNo].$invalid || $scope.bpTableForm["dia" + rowNo].$invalid || $scope.bpTableForm["pulse" + rowNo].$invalid || $scope.bpTableForm["pulse" + rowNo].$invalid || $scope.bpTableForm["date" + rowNo].$invalid || $scope.bpTableForm["time" + rowNo].$invalid) {
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
					if (dtupdated) {
						bprecords.retrieve('all', pager.getSelectedMonth()).then(function (response) {
							$scope.records = response.data.records;
						});
					}
				};
				$scope.cancelEdit = function (rowNo) {
					if (currentEdit) {
						$scope.records[rowNo] = currentEdit.data;
						$scope.editRowNo = -1;
						currentEdit = null;
					}
				};
				$scope.editNote = function (rowNo) {
					var modalDefaults = { templateUrl: '/partials/modals/note.htm' },
					    modalOptions = { headerText: 'Note' },
					    data = {
						"note": $scope.records[rowNo].note,
						"noteOnChart": $scope.records[rowNo].noteOnChart };

					modal.showModal(modalDefaults, modalOptions, angular.copy(data)).then(function (newData) {
						if (!angular.equals(data, newData)) {
							newData._id = $scope.records[rowNo]._id;
							bprecords.update(newData, "note").then(function (response) {
								$scope.records[rowNo].note = newData.note;
								$scope.records[rowNo].noteOnChart = newData.noteOnChart;
							});
						}
					});
				};
				$scope.onKeyPressed = function (event) {
					if (event.which === 13) {
						//Enter
						$scope.submitEdit($scope.editRowNo);
					}
				};
				$window.onkeydown = function (event) {
					if (event.which === 27) {
						//ESC
						$scope.cancelEdit($scope.editRowNo);
						$scope.$apply();
					}
				};
				$scope.$on("month:updated", function (event, month) {
					loadRows(month);
				});

				loadRows(pager.getCurrentMonth());
			}
		};
	}).directive("bpPager", function (DEFAULTS) {
		return {
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'bppager.htm',
			controller: function controller($scope, bprecords, pager, settings) {
				var firstYear = undefined,
				    curYear = undefined;
				$scope.pager = pager.getCurrentMonth();
				$scope.months = settings.months;

				bprecords.getOldestDay().then(function (response) {
					var dt = new Date(response.data),
					    years = [];

					firstYear = dt.getFullYear();
					curYear = new Date().getFullYear();

					for (var y = firstYear; y <= curYear; y++) {
						years.push(y);
					}
					$scope.years = years;
				});

				$scope.changeMonth = function (month) {
					pager.setMonth(month);
					$scope.pager.month = month;
					$scope.$emit("month:updated", $scope.pager);
				};

				$scope.changeYear = function (year) {
					pager.setYear(year);
					$scope.pager.year = year;
					$scope.$emit("month:updated", $scope.pager);
				};

				$scope.nextMonth = function (direction) {
					var m = $scope.pager.month + direction;
					m = m < 0 ? DEFAULTS.MONTHS - 1 : m;
					m = m % DEFAULTS.MONTHS;
					pager.setMonth(m);
					$scope.pager.month = m;
					$scope.$emit("month:updated", $scope.pager);
				};

				$scope.nextYear = function (direction) {
					var y = $scope.pager.year + direction;
					y = y < firstYear ? curYear : y;
					y = y > curYear ? firstYear : y;
					pager.setYear(y);
					$scope.pager.year = y;
					$scope.$emit("month:updated", $scope.pager);
				};
			}
		};
	}).directive("datetimePicker", function (DEFAULTS) {
		return {
			restrict: 'E',
			templateUrl: DEFAULTS.DIR + 'datetimepicker.htm',
			controller: function controller($scope) {

				$scope.today = function () {
					$scope.dt = new Date();
				};

				$scope.clear = function () {
					$scope.dt = null;
				};
				$scope.clear();

				$scope.maxDate = new Date();

				$scope.open = function ($event) {
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

(function (ng, app) {

	"use strict";

	app.factory("utils", function () {
		return {
			"transpose": function transpose(a) {
				return Object.keys(a[0]).map(function (c) {
					return a.map(function (r) {
						return r[c];
					});
				});
			},
			"getTime": function getTime(dt) {
				return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
			},
			"getDate": function getDate(dt) {
				return ('0' + dt.getDate()).slice(-2) + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + ('0' + dt.getYear()).slice(-2);
			}
		};
	}).factory("bprecords", function ($http) {

		return {
			"save": function save(data) {
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
			"retrieve": function retrieve(tpe, month) {
				return $http.get("/bpr/" + tpe + '?y=' + month.year + '&m=' + month.month);
			},
			"update": function update(data) {
				var tpe = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

				return $http.put("/bpr" + tpe, data);
			},
			"delete": function _delete(data) {
				var id = data._id;
				return $http.delete("/bpr?id=" + id);
			},
			"getOldestDay": function getOldestDay() {
				return $http.get("/bpr/firstyear");
			}
		};
	}).factory("exp", function ($http) {
		return {
			"fetch": function fetch() {
				var tpe = arguments.length <= 0 || arguments[0] === undefined ? "export" : arguments[0];

				return $http.get("/bpr/" + tpe);
			}
		};
	}).factory("chart", function ($http, settings) {
		return {
			"fetch": function fetch() {
				var tpe = arguments.length <= 0 || arguments[0] === undefined ? "chart" : arguments[0];

				return $http.get("/bpr/" + tpe);
			},
			"build": function build(columnData, customOptions) {
				var limits = settings.limits,
				    options = undefined,
				    defaultOptions = {
					size: {
						height: 400
					},
					data: {
						x: 'dt',
						columns: columnData,
						types: {
							SYS: 'line',
							DIA: 'line',
							Pulse: 'line'
						},
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
								format: '%Y-%m-%d %H:%M',
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
							lines: []
						},
						y: {
							show: true,
							lines: [{ value: limits.sys.max, text: 'Max SYS', class: 'maxsys' }, { value: limits.dia.max, text: 'max DIA', class: 'maxdia' }]
						}
					},
					subchart: {
						show: true,
						size: {
							height: 20
						}
					}
				};
				options = angular.merge(defaultOptions, customOptions);
				return c3.generate(options);
			}
		};
	}).service("pager", function () {
		var _this2 = this;

		var dt = new Date();

		this.getCurrentMonth = function () {
			return {
				year: dt.getFullYear(),
				month: dt.getMonth() };
		};

		this.getSelectedMonth = function () {
			return {
				year: _this2.year,
				month: _this2.month };
		};

		this.setYear = function (y) {
			_this2.year = y;
		};

		this.setMonth = function (m) {
			_this2.month = m;
		};
	}).service('modal', function ($uibModal) {

		var modalDefaults = {
			backdrop: true,
			keyboard: true,
			modalFade: true,
			templateUrl: '/partials/modals/confirm.htm'
		},
		    modalOptions = {
			closeButtonText: 'Cancel',
			actionButtonText: 'OK',
			headerText: 'Delete?',
			bodyText: 'Are you sure you want to delete this record?'
		};

		this.showModal = function () {
			var customModalDefaults = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var customModalOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			var data = arguments[2];

			var tempModalDefaults = {},
			    tempModalOptions = {};

			customModalDefaults.backdrop = 'static';

			angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
			angular.extend(tempModalOptions, modalOptions, customModalOptions);

			if (!tempModalDefaults.controller) {
				tempModalDefaults.controller = function ($scope, $uibModalInstance) {
					$scope.modalOptions = tempModalOptions;
					$scope.note = data;
					$scope.modalOptions.ok = function (result) {
						$uibModalInstance.close($scope.note);
					};
					$scope.modalOptions.close = function (result) {
						$uibModalInstance.dismiss('cancel');
					};
				};
			}

			return $uibModal.open(tempModalDefaults).result;
		};
	});
})(angular, kmBpr);