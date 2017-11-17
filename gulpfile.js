var gulp = require('gulp'),
    less = require('gulp-less'),
    rename = require('gulp-rename');

gulp.task('less:wxss', function(){
        gulp.src(['./akj/pages/common/components/*.less'])
        pipe(less())
    .pipe(gulp.dest('./akj/pages/common/components/'))


})