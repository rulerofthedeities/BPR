var gulp = require('gulp'),
	concat = require('gulp-concat'),

	config = {
    	bowerDir: 'bower_components/'
	},

	vendorJS 	= [
		config.bowerDir + 'angular/angular.js',
		config.bowerDir + 'angular-route/angular-route.js',
		config.bowerDir + 'angular-bootstrap/ui-bootstrap-tpls.js'],

	vendorCSS 	= [
		config.bowerDir + 'bootstrap/dist/css/bootstrap.min.css',
		config.bowerDir + 'font-awesome/css/font-awesome.min.css'],

	vendorFonts = [
		config.bowerDir + '/font-awesome/fonts/**.*',
		config.bowerDir + '/bootstrap/fonts/**.*'];

gulp.task('vendor_scripts', function() {
	return gulp.src(vendorJS)
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('public/js'));
});

gulp.task('vendor_styles', function() {
	return gulp.src(vendorCSS)
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest('public/css'));
});

gulp.task('vendor_fonts', function() {
	return gulp.src(vendorFonts)
		.pipe(gulp.dest('public/fonts'));
});


gulp.task('default', [
	'vendor_scripts', 
	'vendor_styles', 
	'vendor_fonts']);

