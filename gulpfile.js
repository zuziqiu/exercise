var gulp = require('gulp'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    rename = require('gulp-rename');

// less=>min.wxss
gulp.task('less:wxss', function(){
    gulp.src(['./_kj/pages/common/components/*.less'])
    .pipe(less())
    .pipe(rename({extname: ".wxss"}))
    .pipe(gulp.dest('./kj/pages/common/components/'))
})

// wxml
gulp.task('wxmlmin', function(){
    gulp.src(['./_kj/pages/common/components/*.wxml'])
    .pipe(less())
    .pipe(gulp.dest('./kj/pages/common/components/'))
})

gulp.task('default', function(){
    gulp.watch('./_kj/pages/common/components/*.wxml',['wxmlmin']);
    gulp.watch('./_kj/pages/common/components/*.less',['less:wxss']);
})