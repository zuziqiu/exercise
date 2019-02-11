var gulp = require("gulp");
var uglify = require("gulp-uglify"); // 文件压缩
var concat = require("gulp-concat"); // 文件合并		
var spritesmith = require('gulp.spritesmith'); // 生成雪碧图
var minifycss = require('gulp-minify-css');
// var paths = {
// 	script:["js/start.js,js/end.js"]
// }

// 压缩合并
gulp.task("default",function(){
	gulp.src('js/*.js')
    //.pipe(jade())
    .pipe(uglify())
    .pipe(concat("all.js"))
    .pipe(gulp.dest('build'));
});

// 生成spirte图
gulp.task("default",function(){
	gulp.src("img/*png")
    .pipe(spritesmith({
        imgName: 'no_course.png',//保存合并后图片的名字
        cssName: 'no_course.css',//保存合并后对于css样式的地址
        padding: 5,//合并时两个图片的间距
        algorithm: 'top-down'
    }))
    .pipe(gulp.dest('images')); // 输出到
})
gulp.task("course",function(){
    gulp.src("img-课程创建/*png")
    .pipe(spritesmith({
        imgName: 'course_vod_handle.png',//保存合并后图片的名字
        cssName: 'course_vod_handle.less',//保存合并后对于css样式的地址
        padding: 5,//合并时两个图片的间距
        algorithm: 'top-down'
    }))
    .pipe(gulp.dest('images')); // 输出到
})
// 流量统计雪碧图
gulp.task('course_traffic_statistics', function() {
    return gulp.src('img_course_traffic_statistics/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'course_traffic_statistics_sprite.png',//保存合并后图片的名字
            cssName: 'course_traffic_statistics_sprite.less',//保存合并后对于css样式的地址
            padding: 8,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('course_traffic_statistics_sprite')); // 输出到
});

// 功能版本雪碧图
gulp.task('functional', function() {
    return gulp.src('功能版本/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'functional_version.png',//保存合并后图片的名字
            cssName: 'functional_version.less',//保存合并后对于css样式的地址
            padding: 8,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('功能版本sprites')); // 输出到
});
// 侧边栏雪碧图
gulp.task('leftNav', function() {
    return gulp.src('imgs_nav bar/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'left_nav_sprite.png',//保存合并后图片的名字
            cssName: 'left_nav_sprite.less',//保存合并后对于css样式的地址
            padding: 16,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('left_nav')); // 输出到
});

// 营销中心雪碧图
gulp.task('marketing', function() {
    return gulp.src('marketing_imgs/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'marketing_sprite.png',//保存合并后图片的名字
            cssName: 'marketing_sprite.less',//保存合并后对于css样式的地址
            padding: 32,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('marketing_sprite')); // 输出到
});

// 红包打赏雪碧图
gulp.task('red_pack', function() {
    return gulp.src('打赏/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'red_pack.png',//保存合并后图片的名字
            cssName: 'red_pack.less',//保存合并后对于css样式的地址
            padding: 20,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('red_pack')); // 输出到
});

// 红包打赏雪碧图
gulp.task('er', function() {
    return gulp.src('er/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'course_type_icon.png',//保存合并后图片的名字
            cssName: 'course_type_icon.less',//保存合并后对于css样式的地址
            padding: 8,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('ersprite')); // 输出到
});
// 邀请卡懒加载雪碧图
gulp.task('invitation', function() {
    return gulp.src('btn/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'invitation_sprite.png',//保存合并后图片的名字
            cssName: 'invitation_sprite.less',//保存合并后对于css样式的地址
            padding: 8,//合并时两个图片的间距
            algorithm: 'top-down'
        }))
        .pipe(gulp.dest('btn_img')); // 输出到
});
gulp.task("html2canvas",function(){
    gulp.src('html2canvas/*.js')
    //.pipe(jade())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task("date_time",function(){
    gulp.src('date_time/*.css')
    //.pipe(jade())
    .pipe(minifycss())
    .pipe(gulp.dest('date_folder'));
});