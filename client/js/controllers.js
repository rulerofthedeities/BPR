(function(ng, app){
	
	"use strict";

	app.controller("chartController", function($scope, chart, utils){
		var lines = {'SYS':true, 'DIA': true, 'Pulse':false},
		chartData = [],
		srcChartData = [],
		thisChart;

		var loadChart = function(options){
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
				thisChart = chart.build(chartData, {});
			});
		};


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

		$scope.notes = false;

		$scope.updateNotes = function(){
			if ($scope.notes){
				//adding notes to chart
				chart.fetchNotes().then(function(response){
					var notes = [];
					angular.forEach(response.data.records, function(value, key) {
						notes.push({value:value.dtNote, text:value.note});
					});
					thisChart = chart.build(chartData, {grid:{x:{lines: notes}}});
				});
			} else {
				//removing notes from chart
				thisChart = chart.build(chartData, {});
			}
		};

		loadChart({});
			
	});

})(angular, kmBpr);


