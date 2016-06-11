(function(ng, app){
	
	"use strict";

	app.controller("chartController", function($scope, chart, utils){
		let lines = {'SYS':true, 'DIA': true, 'Pulse':false},
			chartData = [],
			srcChartData = [],
			dataSet = [],
			thisChart;

		let loadChart = (options = {}) => {
			$scope.loaded = false;
			chart.fetch().then(function(response){
				let dbData = response.data.records;

				dataSet = Object.keys(dbData[0]);
				//transpose data (swap columns and rows)
				dbData = utils.transpose(dbData);
				for (let indx = 0; indx <= 3; indx++){
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

		$scope.updateLines = () => {
			angular.forEach($scope.lines, function(show, line) {
				line = line.toLowerCase();
				if (show) {
					thisChart.show([line]);
				} else {
					thisChart.hide([line]);
				}
			});
		};

		$scope.select = "all";

		$scope.updateSelection = () => {
			if ($scope.select !== "all"){
				let dt, dtIndex;
				dtIndex = dataSet.indexOf("dt");
				if (dtIndex >= 0){
					chartData = [[dataSet[0]],[dataSet[1]],[dataSet[2]],[dataSet[3]]];
					for (let indx = 1; indx < srcChartData[0].length; indx++){
						dt = new Date(srcChartData[dtIndex][indx]);
						
						if (($scope.select === "am" && dt.getHours() < 12) || ($scope.select === "pm" && dt.getHours() >= 12)){
							for (let indy = 0; indy <= 3; indy++){
								chartData[indy].push(srcChartData[indy][indx]);
							}
						}
					}
				}
			} else {
				chartData = angular.copy(srcChartData);
			}
			thisChart.load({columns:chartData});
		};

		$scope.notes = false;

		$scope.updateNotes = () => {
			if ($scope.notes){
				//adding notes to chart
				chart.fetch("notes").then((response) => {
					let notes = [];
					angular.forEach(response.data.records, (value, key) => {
						notes.push({value:value.dtNote, text:value.note});
					});
					thisChart = chart.build(chartData, {grid:{x:{lines: notes}}});
					$scope.updateLines();
				});
			} else {
				//removing notes from chart
				thisChart = chart.build(chartData, {});
				$scope.updateLines();
			}
		};

		loadChart();
			
	})

.controller("exportController", function($scope, $q, exp){
	$scope.order = ['d', 'h', 'sys', 'dia', 'pulse'];
	$scope.filename = "bpr";

	$scope.getBprArray = () => {
		let deferred = $q.defer();
		exp.fetch().then(function(response){
			deferred.resolve(response.data.records);
		});
		return deferred.promise;
	}
});

})(angular, kmBpr);


