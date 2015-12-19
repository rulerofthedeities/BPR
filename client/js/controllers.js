(function(ng, app){
	
	"use strict";

	app.controller("chartController", function($scope, chart, utils){
		let lines = {'SYS':true, 'DIA': true, 'Pulse':false},
			chartData = [],
			srcChartData = [],
			thisChart;

		let loadChart = (options = {}) => {
			chart.fetch().then(function(response){
				let dbData = response.data.records,
					dataSet = ['SYS', 'DIA', 'Pulse', 'x'];

				//transpose data (swap columns and rows)
				dbData = utils.transpose(dbData);
				for (let indx = 0; indx <= 3; indx++){
					chartData.push(dbData[indx]);
					chartData[indx].unshift(dataSet[indx]);
				}
				srcChartData = angular.copy(dbData); //for filtering
				thisChart = chart.build(chartData, {});
			});
		};


		$scope.lines = lines;

		$scope.updateLines = () => {
			angular.forEach($scope.lines, function(show, line) {
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
				let dt;
				chartData = [["SYS"],["DIA"],["Pulse"],["x"]];
				for (let indx = 1; indx < srcChartData[0].length; indx++){
					dt = new Date(srcChartData[3][indx]);
					if (($scope.select === "am" && dt.getHours() < 12) || ($scope.select === "pm" && dt.getHours() >= 12)){
						for (let indy = 0; indy <= 3; indy++){
							chartData[indy].push(srcChartData[indy][indx]);
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
				});
			} else {
				//removing notes from chart
				thisChart = chart.build(chartData, {});
			}
		};

		loadChart();
			
	});

})(angular, kmBpr);


