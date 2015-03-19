var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var order = require('gulp-order');

gulp.task('scripts', function() {

	gulp.src(['src/coffee/**/*.coffee'])
		.pipe(order([
			'Tiny.coffee',
			'Store.coffee',
			'Driver.coffee'
		], {
			base: 'src/coffee/',
		}))
		.pipe(coffee())
		.pipe(concat('Tiny.js'))
		.pipe(gulp.dest('dist/js'));

	gulp.src(['example/**/*.coffee'])
		.pipe(coffee())
		.pipe(gulp.dest('example'));

});

gulp.task('watch', function() {
	gulp.watch(['src/coffee/**/*.coffee', 'example/**/*.coffee'], ['scripts']);
});

gulp.task('default', function() {
	gulp.run('scripts');
	gulp.run('watch');
});