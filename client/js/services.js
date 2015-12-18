(function(ng, app){
	
	"use strict";

	app.factory("utils", function(){
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
			},
			"getDate": function(dt){
				return ('0' + dt.getDate()).slice(-2) + '/' + ("0" + (dt.getMonth() + 1)).slice(-2) + '/' + ('0' + dt.getYear()).slice(-2);
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
			"retrieve": function(tpe, month){
				return $http.get("/bpr/" + tpe + '?y=' + month.year + '&m=' + month.month);
			},
			"update": function(data){
				return $http.put("/bpr", data);
			},
			"updateNote": function(data){
				return $http.put("/bprnote", data);
			},
			"delete": function(data){
				var id = data._id;
				return $http.delete("/bpr?id=" + id);
			},
			"getOldestDay": function(){
				return $http.get("/bpr/firstyear");
			}
		};
	})

	.factory("chart", function($http, settings){
		return{
			"fetchData": function(){
				return $http.get("/bpr/chart");
			},
			"fetchNotes": function(){
				return $http.get("/bpr/notes");
			},
			"build": function(columnData, customOptions){
				var limits = settings.limits,
					options,
					defaultOptions = {
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
				};
				options = angular.merge(defaultOptions, customOptions);
				return c3.generate(options);
			}
		};
	})

	.service("pager", function(){
		var dt = new Date();
		this.curYear = dt.getFullYear();
		this.curMonth = dt.getMonth();
		
		this.getCurrentMonth = function(){
			return {
				year:this.curYear, 
				month:this.curMonth};
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
	        closeButtonText: 'Cancel',
	        actionButtonText: 'OK',
	        headerText: 'Delete?',
	        bodyText: 'Are you sure you want to delete this record?'
	    };

	    this.showModal = function (customModalDefaults, customModalOptions, data) {
			var tempModalDefaults = {},
				tempModalOptions = {};

			if (!customModalDefaults) {
				customModalDefaults = {};
			}
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