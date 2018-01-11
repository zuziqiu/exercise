var gulp = require('gulp'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    rename = require('gulp-rename');
123
abc
// less=>min.wxss
gulp.task('less:wxss', function(){
    gulp.src(['./_kj/common/components/*.less'])
    .pipe(less())
    .pipe(rename({extname: ".wxss"}))
    .pipe(gulp.dest('./kj/common/components/'))
})

// pages:wxss
gulp.task('pages:wxss', function(){
    gulp.src(['./_kj/pages/invitation/invitation.less'])
    .pipe(less())
    .pipe(rename({extname: ".wxss"}))
    .pipe(gulp.dest('./kj/pages/invitation/'));

    gulp.src(['./_kj/pages/index/index.less'])
    .pipe(less())
    .pipe(rename({extname: ".wxss"}))
    .pipe(gulp.dest('./kj/pages/index/'));

    gulp.src(['./_kj/pages/personal/personal.less'])
    .pipe(less())
    .pipe(rename({extname: ".wxss"}))
    .pipe(gulp.dest('./kj/pages/personal/'));
})

// wxml
gulp.task('wxmlmin', function(){
    gulp.src(['./_kj/pages/common/components/*.wxml'])
    .pipe(gulp.dest('./kj/pages/common/components/'))
})

gulp.task('default', function(){
    //gulp.watch('./_kj/common/components/*.wxml',['wxmlmin']);
    gulp.watch('./_kj/common/components/*.less',['less:wxss']);
    gulp.watch(['./_kj/pages/invitation/invitation.less',
                './_kj/pages/index/index.less',
                './_kj/pages/personal/personal.less'],
                ['pages:wxss']);
})