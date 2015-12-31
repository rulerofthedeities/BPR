(function(ng, app){
	
	"use strict";

	app.factory("utils", () => {
		return {
			"transpose": (a) => {
				return Object.keys(a[0]).map(
					(c) => { 
						return a.map( (r) => { 
							return r[c]; 
						}); 
					}
				);
			},
			"getTime": (dt) => {
				return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
			},
			"getDate": (dt) => {
				return ('0' + dt.getDate()).slice(-2) + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + ('0' + dt.getYear()).slice(-2);
			}
		};
	})

	.factory("bprecords", function($http){

		return {
			"save": (data) => {
				let req = {
					 method: 'POST',
					 url: '/bpr',
					 headers: {
					   'Content-Type': "application/json"
					 },
					 data: data
					};
				return $http(req);
			},
			"retrieve": (tpe, month) => {
				return $http.get("/bpr/" + tpe + '?y=' + month.year + '&m=' + month.month);
			},
			"update": (data, tpe = "") => {
				return $http.put("/bpr" + tpe, data);
			},
			"delete": (data) => {
				let id = data._id;
				return $http.delete("/bpr?id=" + id);
			},
			"getOldestDay": () => {
				return $http.get("/bpr/firstyear");
			}
		};
	})

	.factory("exp", ($http) =>{
		return{
			"fetch": (tpe = "export") => {
				return $http.get("/bpr/" + tpe);
			}
		};
	})

	.factory("chart", ($http, settings) => {
		return{
			"fetch": (tpe = "chart") => {
				return $http.get("/bpr/" + tpe);
			},
			"build": (columnData, customOptions) => {
				let limits = settings.limits,
					options,
					defaultOptions = {
					size: {
						height: 400
					},
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
		let dt = new Date();
		
		this.getCurrentMonth = () => {
			return {
				year:dt.getFullYear(), 
				month:dt.getMonth()};
		};

		this.getSelectedMonth = () => {
			return {
				year:this.year, 
				month:this.month};
		};

		this.setYear = (y) => {
			this.year = y;
		}

		this.setMonth = (m) =>{
			this.month = m;
		}

	})

	.service('modal', function ($uibModal) {

		let modalDefaults = {
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

		this.showModal = (customModalDefaults = {}, customModalOptions = {}, data) => {
			let tempModalDefaults = {},
				tempModalOptions = {};

			customModalDefaults.backdrop = 'static';

			angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
			angular.extend(tempModalOptions, modalOptions, customModalOptions);

			if (!tempModalDefaults.controller) {
				tempModalDefaults.controller = ($scope, $uibModalInstance) => {
					$scope.modalOptions = tempModalOptions;
					$scope.note = data;
					$scope.modalOptions.ok = (result) => {
						$uibModalInstance.close($scope.note);
					};
					$scope.modalOptions.close = (result) => {
						$uibModalInstance.dismiss('cancel');
					};
				};
			}

			return $uibModal.open(tempModalDefaults).result;
		};
	});

})(angular, kmBpr);