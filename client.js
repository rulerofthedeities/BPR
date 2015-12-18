var kmBpr = angular.module("kmBpr", [
	'ngRoute', 
	'ui.bootstrap'])

.constant("DEFAULTS", {
	"DIR": "partials/directives/",
	"MONTHS": 12})

.value("settings", {
	"limits": {
		"sys": {"min": 130, "max": 140},
		"dia": {"min": 80, "max": 90}
	},
	"rowsPerPage" : 10
});



