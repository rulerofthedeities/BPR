var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),

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
		config.bowerDir + 'font-awesome/fonts/**.*',
		config.bowerDir + 'bootstrap/fonts/**.*'];

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

gulp.task('client_scss', function() {
    return gulp.src('client/scss/**.scss')
        .pipe(sass().on('error', sass.logError))
		.pipe(concat('bpr.css'))
        .pipe(gulp.dest('public/css/'));
});

gulp.task('vendor_fonts', function() {
	return gulp.src(vendorFonts)
		.pipe(gulp.dest('public/fonts'));
});

gulp.task('watch', function() {
  gulp.watch('client/scss/**.scss', ['client_scss']);

  //gulp.watch('client.js', ['client_scripts']);
  //gulp.watch('client/js/*.js', ['client_scripts']);
});

gulp.task('default', [
	'vendor_scripts', 
	'vendor_styles', 
	'client_scss',
	'vendor_fonts',
	'watch']);

