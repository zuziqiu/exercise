/**
 * @name sdk.event.dispatch
 * @note sdk事件监听&执行
 * @author [Marko]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {
    // 包引入
    // 每个模块单独新增文件
    var room = require("./room"), //房间模块
        chat = require("./chat"), //聊天模块
        //flower = require("./flower"), //鲜花模块
        question = require("./question"), //问答模块
        set = require("./set"), //设置模块
        plugins = require("./plugins"), //扩展方法
        widgets = require("./widgets"), //小插件
        desktop = require("./desktop"), //桌面分享
        camera = require("./camera"), //视频模块
        album = require("./album"),
        chapter = require("./chapter");//章节
    
        
    // 事件执行 TODO...
    var HTCMD = {
        
        // 初始化加载
        isLoad: false,

        time: 0,

        // 初始化
        fire: function(HTSDK){
            var that = this;

            // 摄像头
            HTSDK.camera("ht_camera_container", "mtAuthorPlayer", function(cameraPlayer){
                camera.setCamera(cameraPlayer);
            });

            /*
             * 设置章节列表
             */
            HTSDK.on('live:chapter:list',function(chapters){
                chapter.chapterList = chapters;
                chapter.chapterTimePoint(chapters);         
            });

            // 主播放器
            HTSDK.mainPlayer("mod_main_player", "mtMainPlayer", function(player){

            });

            //回放总信息
            HTSDK.on('live:info',function(live){
                room.liveid = live.liveid;
                $(".voice_content img").attr("src", live.authorAvatar);
                chapter.bindEvent();
                chapter.seekEvent(live);
                chapter.totalTime(live);
                album.isHasAlbum();
                room.setLiveInfo(live);

                //防盗录
                widgets.aggregate("start", true, live.user.uid);

            });

            // 开始播放
            HTSDK.on('live:start', function(){
                room.stateChange("start");
                
            });
            
            // 暂停
            HTSDK.on('live:pause',function(){

            });

            // 停止debug
            HTSDK.on('live:stop',function(){

                room.stateChange("stop");
                widgets.aggregate("stop", true);
            });

            // 模式切换
            HTSDK.on("live:mode:change", function (mode) {
                
                room.mode = mode;
                set.mode = mode.currentMode;

                if(this.currentMode == mode.currentMode){
                    return false;
                }
                // 0 => 课件模式 
                // 2 => 桌面分享
                if(mode.currentMode == 2){
                     room.modeChange(mode);
                     if($('#albums').length == 0){
                        chapter.renderChapterList(chapter.chapterList);
                     }
                }else{
                     room.modeChange(mode);
                }
                this.currentMode = mode.currentMode;
            });

            // 等待
            HTSDK.on('live:video:waiting',function(){
                camera.waiting();
                if(that.isLoad){
                    $("#load_mask").hide();
                }
            });

            // 加载完毕
            HTSDK.on("live:video:loaded", function(type){
                if(type === "media"){
                    $("#mod_mask").hide();
                    $(".mask_bg").hide();
                    $("#load_mask").hide();
                }else{
                    $("#mod_mask").hide();
                    $(".mask_bg").hide();
                    $("#load_mask").hide();
                }
                if(!that.isLoad){
                    room.init(HTSDK);//房间初始化模块
                    camera.init(HTSDK, room);//摄像头模块初始化
                    chat.init(HTSDK);//聊天模块初始化
                    question.init(HTSDK);//问题模块初始化
                    set.init(HTSDK, room);//设置模块初始化    
                    plugins.init(room, HTSDK);//公共方法模块   
                    chapter.init(HTSDK);//章节模块 
                    // moduleSetting.init(room); //模块设置
                    that.isLoad = true;
                }
            });

            // 聊天分段存储
            HTSDK.on("live:chat:slice", function(chatSlice){
                chat.chatSlice(chatSlice);
            });

            // 内置章节及聊天记录滚动机制，简化外部操作
            // seek 到某个时间点
            HTSDK.on('live:seek:begin', function(duration){
                chapter.seekTimePoint(duration);
            });

            // seek 完成后
            var $curPage = {};
            HTSDK.on('live:seek:finish', function(duration){
                // todo...
            });
            
            // 跳转计时
            HTSDK.on('live:duration', function(currentTime, duration, currentPercent){
                // 当前进度
                chapter.currentProgress(currentTime, duration, currentPercent, HTSDK);

                // 更新播放时间
                room.timeUpdate(currentTime);

                // //滚动章节
                chat.goCurChat(currentTime);
            });
            /*
             * 新增聊天记录
             */
            HTSDK.on('live:message:append', function(messages){
                chat.chatList = messages;
                chat.renderList(messages);
            });

            /**
             *  新增问题列表
             */
            HTSDK.on('live:questions:append',function(questions){
                question.questionList = questions;
            });

            // 摄像头打开
            HTSDK.on('camera:start',function(){
                camera.cameraState("start");
            });

            // 摄像头关闭
            HTSDK.on('camera:stop',function(){
                camera.cameraState("stop");
                $("#click_play").show();
            });

            // //监听摄像头是否播放
            // HTSDK.on('live:video:playing',function(){
            //     // todo...
            //     $("click_play").hide();
            // });

            // 暂停
            HTSDK.on('live:video:pause',function(){
                camera.pause();
            });

            // 改变
            HTSDK.on('live:video:durationchange',function(){
                camera.waiting();
            });

            // 切换资源
            HTSDK.on("live:source:change", function(){
                camera.durationChange();
            });

        }
    };

    // 暴露
    module.exports = HTCMD;

});















