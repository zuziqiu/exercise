var gulp = require('gulp'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename');

gulp.task('less:wxss', function(){
    gulp.src(['./_kj/pages/common/components/*.less'])
    .pipe(less())
    .pipe(minifycss())
    .pipe(rename({extname: ".wxss"}))
    .pipe(gulp.dest('./kj/pages/common/components/'))
})

gulp.task('default', function(){
    gulp.watch('./_kj/pages/common/components/*.less',['less:wxss']);
})