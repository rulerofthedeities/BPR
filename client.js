var kmBpr = angular.module("kmBpr", [
	'ngRoute', 
	'ui.bootstrap',
	'ngSanitize', 
	'ngCsv'])

.constant("DEFAULTS", {
	"DIR": "partials/directives/",
	"MONTHS": 12})

.value("settings", {
	"limits": {
		"sys": {"min": 130, "max": 140},
		"dia": {"min": 80, "max": 90}
	},
	"months" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});



