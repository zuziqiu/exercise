var gulp = require('gulp'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    es2015 = require('babel-preset-es2015'),
    babel = require('gulp-babel'),
    rename = require('gulp-rename'),
    spritesmith = require("gulp.spritesmith");
var browserify = require("browserify");
var sourcemaps = require("gulp-sourcemaps");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var gutil = require('gulp-util');
var ejs = require('gulp-ejs');
var fileinclude  = require('gulp-file-include');

gulp.task('fileinclude', function() {
    gulp.src('./browserify/src/**.html')
        .pipe(fileinclude({
          prefix: '@@',
          basepath: './browserify/component/'
        }))
    .pipe(gulp.dest('./browserify/dist'));
});

gulp.task('browserify', function(){
    //定义多个入口文件
    var entryFiles = [
        './browserify/src/main.js'
    ];
    var fileName = /(.*\/).+\.js/;
    //遍历映射这些入口文件
    var tasks = entryFiles.map(function(entry){
        return browserify({
            entries: [entry],
            debug: true,
        })
        .transform(babelify.configure({
            presets:['es2015']
        }))
        .on('error',gutil.log)
        .bundle()
        .on('error',gutil.log)
        .pipe(source(entry.replace(fileName.exec(entry)[1], "")))
        .pipe(gulp.dest('./browserify/dist'));
    });

    //创建一个合并流
    //return es.merge.apply(null, tasks);
});
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

gulp.task('ejs', function() {
    gulp.src('./browserify/src/**.html')
        .pipe(ejs())
    .pipe(gulp.dest('./browserify/dist'));
});


// const gulp = require("gulp")
 
// // 本实例为完成精灵图的合并
// const spritesmith = require("gulp.spritesmith")
 
gulp.task('sprite',function(){
    gulp.src("webpack/sprite/src/*.png")
        .pipe(spritesmith({
            imgName:'sprite/sprite_min.png', //合并后大图的名称
            cssName:'sprite/sprite.less',
            padding:30,// 每个图片之间的间距，默认为0px
            algorithm: 'top-down',
            cssTemplate:(data)=>{
            // data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
               let arr = [],
            //    sprite.px[i].replace(/\d+/,(sprite.px[i].match(/\d+/)[0])/2)
                    // width = data.spritesheet.px.width
                    width = data.spritesheet.px.width.replace(/\d+/,(data.spritesheet.px.width.match(/\d+/)[0])/2),
                    // height = data.spritesheet.px.height,
                    height = data.spritesheet.px.height.replace(/\d+/,(data.spritesheet.px.height.match(/\d+/)[0])/2),
                    url =  data.spritesheet.image
                // console.log(data)
                data.sprites.forEach(function(sprite) {
                    for(var i in sprite.px){
                        sprite.px[i] = sprite.px[i].replace(/(-|\d)+/,(sprite.px[i].match(/(-|\d)+/)[0])/2+13)
                    }
                    arr.push(
                        "."+sprite.name+
                        "{"+
                            "background: url('"+url+"') "+
                            "no-repeat "+
                            sprite.px.offset_x+" "+sprite.px.offset_y+";"+
                            "background-size: "+ width+" "+height+";"+
                            "width: "+sprite.px.width+";"+                       
                            "height: "+sprite.px.height+";"+
                        "}\n"
                    ) 
                })
                // return "@fs:108rem;\n"+arr.join("")
                return arr.join("")
            }
        }))
        .pipe(gulp.dest("webpack/sprite/exports/"))
})