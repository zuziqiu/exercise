/**
 * @date 2015-09-10
 * @author liangh
 * @name 点播SDK-v1.0.2版
 * @API: http://open.talk-fun.com/open/doc/sdk.js.vod.html
 */

// 加载模版
var MT = window.MT || {}, 
    tplLoadState = false,
    _PPTfullScreen = false, //判断是否为全屏true为全屏
    currentDuration = 0,
    seekDuration = 0,
    isSeekEnd = false,
    isDebug = (window.location.href.indexOf("sdkVersion=test") > -1) ? true : false,
    // 左右收缩
    flexDir = {
        left: false,
        right: false
    },

    // datas
    datas = {
        chatList: null,
        questionList: null,
        chaptersList: null
    },

    isChangeVideo = false, // 是否切换视频
    fullResizeChange = false; //true为全屏窗口开变后切换

/**
 * @初始化执行
 */
HT.baseExecute = {
    flexSet: {
        left: 0,
        right: 0
    },
    isHasPPT: false,
    isLoad: false,
    c_state: 'stop',
    liveStyleTime: null,
    timeSlice: 15,
    tempCurTime: 0,

    current_time: 0,

    // init element
    $playerWrap: $("#mod_player_wrap"),
    $mainPlayer: $("#mod_main_player"),
    $modFooter: $(".mod_footer"),
    $modCameraPlayer: $("#mod_camera_player"),
    $mtAuthorPlayer: $("#mtAuthorPlayer"),

    //记录当前量值
    voice_value: 204,
    // 加载状态
    playerLoaded: false,
    cameraState: false,
    playerState: false,

    isStopScroll: false, //默认为显示
    isShowFlower: false, //默认为显示

    //是否有ppt
    isPPT: function(ret){
        if(ret){
            try{
                if(ret.p<10000){
                    HT.baseExecute.isHasPPT = true;
                }
            }catch(err){
                console.info(e.message);
            }
        }
    },

     //切换到插播，桌面分享摄像头区域显示
    switchModePrivew: function(curMode,nativeMode){
        var that = this;
        //有ppt的情况下
        if(HT.baseExecute.isHasPPT){
            return;
        }

        if(curMode){
            //插播和桌面分享    
            if(curMode.currentMode == 2){
                if(!HT.baseExecute.isLoad){
                    var temp = template("switch_preview");
                    $(".section_main").append(temp);
                    HT.baseExecute.isLoad = true;
                }
                $(".switch_preview").show();
                
                //插播
                if(curMode.sourceMode == 2){
                    $(".section_main .switch_preview span").html("正在播放视频 ...");
                }
                //桌面分享
                else if(curMode.sourceMode  == 3){
                    $(".section_main .switch_preview span").html("正在进行桌面分享 ...");
                }
            }else{
                $(".switch_preview").hide();
            }
        }
    },


    //摄像头区域隐藏
    cameraHide: function(){
        return false;
        $("#lca_change").hide();
        $(".mod_section_album_list").addClass("c_hide");
        $("#camera_play").css({
            width: 1,
            height: 1
        }); 
    },
    //摄像头区域显示
    cameraShow: function(){
        $("#lca_change").show();
        $(".mod_section_album_list").removeClass("c_hide");

        if($("#lca_change").hasClass("changed")){
            $("#camera_play").css({
                width: "auto",
                height: "auto"
            });
        }else{
            $("#camera_play").css({
                width: 280,
                height: 210
            });
        }
        
    },
    



    //获取切换源
    getSource: function(){
        MT.getSource(function(sourceCount){
            var lis= "";
            for(var i= 0;i< sourceCount;i++){
                if(i == 0){
                    lis +='<li class="selected" id="route_'+i+'"data-key='+i+'><span>'+"线路"+(i+1)+'</span></li>';
                }else{
                    lis +='<li id="route_'+i+'"data-key='+i+'><span>'+"线路"+(i+1)+'</span></li>';
                }
                
            }
            $("#switch_list").append(lis);
            var wleft = $("#switch_source").offset().left;
            $(".switch_warp").css({
                left: wleft-65
            });
            $(".switch_warp").show();
        });
    },

    //切换源
    switchSource: function(sourceNum){
        MT.changeSource(sourceNum,function(ret){});

        setTimeout(function(){
            $(".switch_warp").hide();
        },200);
    },


    syncLoad: function() {
        if (this.cameraState && this.playerState) {
            this.playerLoaded = true;
        }
    },

    //临时存储专辑列表数据
    setAlbum: function(albumList) {
        var that = this;
        that.album_list = albumList;
    },
    //初始化滚动到指定专辑
    scroolToAlbum: function(){
        $("#album_list li").each(function(){
            if($(this).find("a").hasClass("cur")){
                $("#album_list").scrollTo($(this).prev(),200);
            }        
        })
    },
    //渲染专辑列表
    renderAlbumList: function() {
        if (this.isAlbumLoad) {
            return false;
        }
        var that = this;
        //目标
        $album_list = $("#album_list");
        $album_ul = $("#album_listli");
        var album_list = that.album_list;
        var albumRender = "";

        for (var i = 0; i < album_list.length; i++) {
            // 读取模版
            albumRender += this.ablumList(album_list, i);
        }
        $('#album_listli').append(albumRender);
        $album_list.scrollTo($album_list.height(), 200);
        this.isAlbumLoad = true;
    },

    //专辑模板export
    ablumList: function(ret, i) {
        var d = ret,
            that = this;
        // data
        var data = {
            d: ret[i]
        };
        var tpl = template("albums_list", data);
        return tpl;
    },

    //渲染章节列表
    renderChapterList: function(list, callback) {

        //目标
        var that = this,
            $chapter_list = $("#chapter_list"),
            $chapter_ul = $("#chapter_listli");
        
        var chapter_list = list,
            chapterRender = "";
        
        // 数据迭代
        for (var i = 0, ilen = chapter_list.length; i<ilen; i++) {
            chapter_list[i].sn = "chapter_"+i;
            chapter_list[i].time = that.convertTimestamp(chapter_list[i].starttime);
            if (i == 0) {
                chapter_list[i].index = 1;
            }

            // 读取模版
            chapterRender += this.chapterList(chapter_list, i);
        }

        that.chapterLength = list.length;

        // 插入模版
        $('#chapter_listli').append(chapterRender);
        if($("#chapter_nav li").size() == 2){
            $("#chapter_list").hide();
        }

        // 数据索引
        chaptersData = list;
        for (var i = 0; i < chaptersData.length; i++) {
            var _time = parseInt(chaptersData[i].starttime, 10);
            chaptersDataObj[_time] = chaptersData[i];
            chaptersTimePoints.push(_time);
        };

        callback();
    },

    //章节模板export
    chapterList: function(ret, i) {
        var chapters = ret,
            that = this;
        // data
        var data = {
            chapters: ret[i]
        };
        var tpl = template("chapters_list", data);
        return tpl;
    },

    //时间转换    
    convertTimestamp: function(intDiff) {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; //时间默认值        
        if (intDiff > 0) {
            day = Math.floor(intDiff / (60 * 60 * 24));
            hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        if (hour > 0) {
            return hour + ":" + minute + ":" + second;
        } else {
            return minute + ":" + second;
        }
    },

    //渲染聊天列表
    renderChatList: function(messages) {

        if(HT.disableChat){
            return false;
        }

        var $chat_list = $("#chat_list"),
            $chat_ul = $("#chat_listli"),
            that = this,
            chat_list = messages,                
            chatRender = "";

        for (var i = 0; i < chat_list.length; i++) {
            var chat_time = chat_list[i].starttime;
            // 资源替换
            chat_list[i].message = HT.getCDNPath(chat_list[i].message);

            // 时间转换
            chat_list[i].starttime = that.convertTimestamp(chat_time);
            chat_list[i].chatpoint = chat_time;

            chatRender += that.chatList(chat_list, i);
        }

        $('#chat_listli').append(chatRender);

    },

    //聊天模板export
    chatList: function(ret, i) {

        var msg = ret,
            that = this;
        // data
        var data = {
            msg: ret[i],
        };

        if(ret[i].message.indexOf("<img") > -1){
            ret[i].content= "isImg";
            ret[i].isShow = (HT.baseExecute.isShowFlower == true) ? "hidden" : "";
        }else{
            ret[i].content= "";
            ret[i].isShow = "";
        }
        var tpl = template("chat_msg_list", data);
        return tpl;
    },
    //回放广播
    broadcastList: function(list) {
        var chat_list = list,                
            chatRender = "";

        for (var i = 0; i < chat_list.length; i++) {
            if(chat_list[i].cmd == 3){//广播
                // 插入模版
                chatRender += '<li class="mod_notify">公共广播：'+chat_list[i].msg+'</li>';

            }        
        }
        $('#chat_listli').append(chatRender);
    },

    //问题列表数据临时存储
    setQuestions: function(questions) {
        var that = this;
        that.questions_list = questions;
        if (that.isLoadQuestion && that.isLoadQuestion === 1) {
            that.renderQuestionList();
        }
    },

    //渲染提问列表
    renderQuestionList: function() {
        if (this.isQuestionLoad) {
            return false;
        }
        if (this.questions_list) {
            //目标
            $question_list = $("#question_list");
            $qustions_ul = $("#qustions_listli");
            var that = this,
                questionlist = that.questions_list,
                questionRender = "";
            for (var i in questionlist) {
                var questions_time = questionlist[i].startTime;
                questionlist[i].startTime = that.convertTimestamp(questions_time);
                var answer_list = questionlist[i].answer;
                if (answer_list == undefined || answer_list == false) { //没有答的数据情况下
                    // 读取模版
                    questionRender += that.questionList(questionlist, i, j, answer_list);
                } else {
                    for (var j in answer_list) {
                        var anser_time = questionlist[i].answer[j].startTime;
                        questionlist[i].answer[j].startTime = that.convertTimestamp(anser_time);
                        // 读取模版
                        questionRender += that.questionList(questionlist, i, j, answer_list);
                    }
                }
            };
            $('#qustions_listli').append(questionRender);
            this.isQuestionLoad = true;
        } else {
            return false;
        }

    },

    //提问模板export
    questionList: function(ret, i, j, answer_list) {
        var questions = ret,
            answers = answer_list,
            that = this;
        //只有问没有答
        if (answer_list == undefined || answer_list == false) {
            var data = {
                questions: ret[i],
                answers: ""
            };
        } else { //有问有答
            var data = {
                questions: ret[i],
                answers: answer_list[j]
            };
        }
        var tpl = template("chat_question_list", data);
        return tpl;
    },

    // 获取播放器状态(主&摄像头播放器)
    getPlayerState: function() {
        if (MT.isMobileSdk()) {
            return true;
        } else {
            return this.playerLoaded;
        }
        return true;
    },

    // 显示摄像头
    toggleCamera: function(that) {
        var inSdk = MT.isMobileSdk();
        // SDK调用
        if (inSdk) {
            if ($(that).hasClass("enable")) {
                MT.callSdk("cameraHide");
                $(that).removeClass("enable").addClass("disable");
            } else {
                MT.callSdk("cameraShow");
                $(that).removeClass("disable").addClass("enable");
            }
        } else {
            var $cam = $(HT.baseExecute.camera);
            // show
            if ($cam.hasClass("hide")) {
                $(that).removeClass("disable").addClass("enable");
                $cam.removeClass("hide");
                // hide
            } else {
                $(that).removeClass("enable").addClass("disable");
                $cam.addClass("hide");
            }
        }
        HT.baseExecute.cameraReset();
    },

    //摄像头全屏兼容不同浏览器方法
    videoFullScreen: function() {
        var video = document.getElementById('mtAuthorPlayer');
        if (video.requestFullscreen) { //其它
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) { //火狐
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullScreen) { //谷歌
            video.webkitRequestFullScreen();
        } else if (video.msRequestFullscreen) { //IE
            video.msRequestFullscreen();
        }
    },

    //摄像头退出全屏的不同浏览器方法
    exitFullScreen: function() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.oRequestFullscreen) {
            document.oCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else {
            var docHtml = document.documentElement;
            var docBody = document.body;
            var videobox = document.getElementById('mtAuthorPlayer');
            docHtml.style.cssText = "";
            docBody.style.cssText = "";
            videobox.style.cssText = "";
            document.IsFullScreen = false;
        }
    },

    //重置摄象头宽高
    videoResize: function() {
        var $modCameraPlayer = $("#mod_camera_player"),
            $mtAuthorPlayer = $("#mtAuthorPlayer");
        $mtAuthorPlayer.width(280);
        $mtAuthorPlayer.height(210);
        $modCameraPlayer.css({
            marginTop: 0,
            marginLeft: 0
        });
    },

    //pc端全屏
    fullscreen: function(cw, ch) {
        // 主播播放器
        var $mainPlayer = this.$mainPlayer;
        var $modFooter = this.$modFooter;
        // 重置   
        var playerReset = {},
            playerReset = MT.playerResize(cw, ch);
        HT.baseExecute.$mainPlayer.width(playerReset.width);
        HT.baseExecute.$mainPlayer.height(playerReset.height);
        $mainPlayer.addClass('fullscreen');
        $modFooter.removeClass('pabsolute');
        $modFooter.addClass('footer');
        $(".head").removeClass('headbg');
        // 居中上下左右
        $mainPlayer.css({
            marginTop: -(playerReset.height / 2),
            marginLeft: -(playerReset.width / 2)
        });

        if (!location_flag) {
            var playerReset = {},
                playerReset = MT.playerResize(cw, ch - 50);
            $("#mod_camera_player").width(playerReset.width);
            $("#mod_camera_player").height(playerReset.height);
            $("#mod_camera_player").addClass('full_camera');
            $("#mod_camera_player").css({
                marginTop: -(playerReset.height / 2),
                marginLeft: -(playerReset.width / 2)
            });
        }

    },

    //获取回放信息
    getInfo: function(live) {
        var that = this;
        that.duration = live.duration;
    },

    //播放进度监听是否结束
    playEnd: function(duration) {
        var that = this;
        if (duration == parseInt(that.duration)) {
            HT.vodTools.setState("stop");
            $(".repeat").show();
            $(".continue_play").hide();
            $("#lv_state").removeClass('playstart_state');
            $("#lv_state").addClass('palayend_state');
            MT.stop();
        } else {
            $(".repeat").hide();
            $(".teacherinfor").hide();
            $("#lv_state").removeClass('palayend_state');
            $("#lv_state").addClass('playstart_state');
        }

    },

    // 左右收缩
    toggleFlex: function(el) {
        var that = this,
            flex = flexDir,
            $el = $(el),
            // 区域
            header = $("#header"),
            footer = $("#footer"),
            main = $("#room"),
            video = $("#camera_play"),
            section = $(".mod_section_album_list"),
            right = $("#mod_col_right");

        // 左侧伸缩 
        if($el.hasClass("left")) {
            if($el.hasClass("active")){
                header.show();
                section.show();
                video.removeClass("hide");
                main.removeClass("close_left");
                $el.removeClass("active");
                flex.left = false;
            }else{
                header.hide();
                section.hide();
                if(!isChangeVideo){
                    video.addClass("hide");
                }
                main.addClass("close_left");
                $el.addClass("active");
                flex.left = true;
            }
        }

        // 右侧伸缩 
        else if($el.hasClass("right")) {
            if($el.hasClass("active")){
                right.show();
                main.removeClass("close_right");
                $el.removeClass("active");
                flex.right = false;
            }else{
                right.hide();
                main.addClass("close_right");
                $el.addClass("active");
                flex.right = true;
            }
        }
    },

    // 占位
    swfHolder: function(){
        var swfobject = template("mod_swf_cover", {});
        $("#mod_ppt_player").append(swfobject);

        // remove check dom
        var dom = document.getElementById("mtMainPlayer"),
            checkDom = setInterval(function(){
            if(dom){
                clearInterval(checkDom);
                checkDom = null;
                $("#mod_swf_holder").remove();
            }
        }, 500);

    },

    // sdk完成执行
    sdkInitCallback: function(_HT){

        // volume setting
        var mediaVolume = _HT.volume;

        //声单控制
        $("#vioce_contorl").on(__Event, function() {
            if ($("#vioce_contorl").hasClass('enable')) {
                $("#vioce_contorl").removeClass('enable');
                $("#vioce_contorl").addClass('diable');
                $("#void_range").slider("value", 0);
                mediaVolume(0);
            } else {
                $("#vioce_contorl").removeClass('diable');
                $("#vioce_contorl").addClass('enable');
                $("#void_range").slider("value",HT.baseExecute.voice_value);
                mediaVolume(HT.baseExecute.voice_value/255);
            }
        });

        //声音滑块初始化 
        $("#void_range").slider({
            orientation: "horizontal",
            range: "min",
            max: 255,
            value: 204,
            //当滑块移动时触发事件
            change: function(event, ui) {
                // var media = mediaVolume;
                if ($("#void_range").slider("value") == 0) {
                    $("#vioce_contorl").removeClass('enable');
                    $("#vioce_contorl").addClass('diable');
                    mediaVolume(0);
                } else {
                    $("#vioce_contorl").removeClass('diable');
                    $("#vioce_contorl").addClass('enable');
                    var current_voice = $("#void_range").slider("value");
                    HT.baseExecute.voice_value =  current_voice; 
                    mediaVolume(current_voice / 255);
                }
            }
        });

        mediaVolume(parseInt($("#void_range").slider("value")));

    },

    // 初始化检测
    init: function() { 

        var that = this;

        // swf-checker
        that.swfHolder();

        // 初始化设置主播放器高宽         
        var cw = that.$playerWrap.width();
        var ch = that.$playerWrap.height();
        HT.baseExecute.initcw = cw;
        HT.baseExecute.initch = ch;
        
        // that.playingArea(cw, ch);
        that.d_cw = $(window).height();
        that.d_ch = $(window).width();

        // sdkInit
        that.sdkInit();
        that.drag();
    },

    // sdk差异化显示
    sdkInit: function(HT) {
        if (MT.isMobileSdk()) {
            $("#full_screen").addClass("enable");
        }
        if(MT.getSource){
            $("#switch_source").show();
        }
    },
    // 拖拽
    drag: function(){
        var _drag = new drag(),
        element_array = [];

        element_array[0] = {
            move_pop: document.querySelector("#camera_play"),
            handle: document.querySelector("#camera_play"),
        }

        // 注册
        _drag.on(element_array); 
    },
    /**
     * SDK命令监听
     */
    cmdRuner: function(MT){

        // 摄像头
        MT.camera("mod_camera_player", "mtAuthorPlayer", function(camera) {
            HT.vodTools.debug('cameraPlayer init success');

            //视频预加载层显示
            // camera.width(280);
            // camera.height(210);
            HT.baseExecute.camera = camera;
            HT.baseExecute.cameraState = true;
            HT.baseExecute.syncLoad();
            HT.modCamera.init();
        });

        // 主播放器
        MT.mainPlayer("mod_main_player", "mtMainPlayer", function(player) {
            HT.vodTools.debug('Player init success');
            // load player
            $(".mask_background").show();
            HT.baseExecute.player = player.ref;
            HT.baseExecute.playerState = true;
            HT.baseExecute.syncLoad();
        });

        //回放总信息
        MT.on('live:info', function(live) {
            HT.seekEvent(live);
            HT.baseExecute.getInfo(live);
            var video_time = HT.baseExecute.convertTimestamp(live.duration);
            totalTime = live.duration;
            $("#totle_time").html(video_time);
            $("#live_title").html(live.title);
            HT.vodTools.checkFlash();
        });

        // 开始播放
        MT.on('live:start', function() {
            // start
        });

        // 暂停
        MT.on('live:video:pause', function() {
            HT.vodTools.debug('live on pause');
            HT.vodTools.setState("pause");
        });

        // 加载完毕
        MT.on("live:video:loaded", function() {
            HT.vodTools.debug("live:video:loaded");
            //lodingim隐藏
            $(".mask_background").hide();
            $(".video_state").hide();
            $(".face").hide();
            // $("#mtAuthorPlayer").show();
            $("#lv_state").removeClass('palayend_state');
            $("#lv_state").addClass('playstart_state');

            // 直播开始 绑定事件
            if (!initLoaded) {
                // fadeout
                HT.bindEvent();
                initLoaded = true;
            }
        });

        // 聊天分段存储
        MT.on("live:chat:slice", function(chatSlice) {
            var cuter = chatSlice;
            for (var i = 0; i < cuter.length; i++) {
                var nameSpace = "start_" + cuter[i].start + "_end_" + cuter[i].end;
                chatSliceObj[nameSpace] = [];
                window.chatSliceObj = chatSliceObj;
            };
        });

        // 内置章节及聊天记录滚动机制，简化外部操作
        //seek 到某个时间点
        MT.on('live:seek:begin', function(duration) {
            HT.vodTools.debug("seek to "+duration);
            $("#btn_pp").removeClass("play");
            $("#btn_pp").addClass("pause");
            MT.pause();
        });

        // seek 完成后
        var $curPage = {};
        MT.on('live:seek:finish', function(duration) {
            MT.play();
            $("#mod_camera_player").removeClass("hide");

        });

        //跳转计时
        var autoJumpTimer = null;
        // 时间更新,当前时间点，总时长，播放进度
        MT.on('live:duration', function(currentTime, duration, currentPercent) {
            $("#load_speed").hide();
            //跳转提示
            var nowTime = duration - currentTime,
                clip_list = $("#album_listli li"),
                liveClipIndex = null;

            clip_list.each(function(){
                if($(this).find('a').hasClass('cur')){
                    liveClipIndex = $(this).index()+1;
                }
            });

            HT.baseExecute.current_time = currentTime;

            // 滚动到指定聊天
            if(!HT.baseExecute.isStopScroll){
                HT.goChat(currentTime);
            }
            // 30秒自动跳转下一个
            // if(parseInt(album) == 1){

            //     if( nowTime <= 30 && liveClipIndex != clip_list.size()){
            //         if( !autoJumpTimer ){
            //             if($('#footer .footer_btn').find('.jump_clip').size() <= 0){

            //                     $('#footer .footer_btn').append("<div class='jump_clip'>即将为您播放下一章节...</div>");
            //                     autoJumpTimer = setTimeout(function(){
            //                         $('.jump_clip').hide();
            //                     }, 5000);
            //             }else if ($('#footer .footer_btn .jump_clip:visible')){
            //                     $('.jump_clip').show();
            //                     autoJumpTimer = setTimeout(function(){
            //                         $('.jump_clip').hide();
            //                     }, 5000);
            //             }
            //         }
            //         if( Math.floor(duration) <= currentTime){
            //                 var nextClipUrl = $("#album_listli li .cur").parent().next().find('a').attr('href');
            //                 window.location.href = nextClipUrl;
            //             }
            //     }
            //     else{
            //         if(autoJumpTimer){
            //             clearTimeout(autoJumpTimer);
            //             autoJumpTimer = null;
            //             if($('.jump_clip').size() > 0){
            //                 $('.jump_clip').hide();
            //             }
            //         }
            //     }
            // }
            

            $("#ctr_range").val(currentTime);
            currentDuration = currentTime;

            $("#cur_time").html(HT.vodTools.second2HMS(currentTime));

            if (currentTime > 0) {
                HT.vodTools.setState("playing");
                if(seekDuration > 0){
                    // 防止seek回弹
                    if(currentTime < seekDuration){
                        return false;
                    }
                    // seek锁
                    if(!seekLock){
                        seeker.noUiSlider.set(currentTime);
                    }
                }
                // play on init.
                else{
                    seeker.noUiSlider.set(currentTime);
                }
            }

            var _pcurTime = parseInt(currentTime, 10);
            var $chatPost = $("#chat_pos_" + _pcurTime);
            __currentTime = _pcurTime;

            // 滚动章节
            if (chaptersDataObj[_pcurTime]) {
                if (chapterCurPoint === chaptersDataObj[_pcurTime]) {
                    return false;
                }
                chapterCurPoint = chaptersDataObj[_pcurTime];
                HT.goChapter(currentTime);
            }
            if (parseInt(currentTime) == parseInt(duration)) {
                isSeekEnd = true;    
                HT.baseExecute.playEnd(parseInt(currentTime));
            }
        });

        /**
         * 章节回调函数
         */
        HT.chapterBind = function(){
            
        };

        MT.on('live:video:seeking', function(chapters) {
            $(".mask_background").show();
            /*$("#load_speed").hide();*/

        });


        var mode = "";

        //模式切换
        MT.on("live:mode:change",function(curMode, beformode){
            console.log(curMode)
            var url =  window.location.href;
            console.log(curMode.currentMode)
            if(curMode.currentMode == 2){
                /*if(curMode.currentMode!= mode){*/
                    mode = curMode.currentMode;
                    HT.baseExecute.cameraHide();
            /* }*/
            }else{
                $("#camera_play").show();
                /*if(curMode.currentMode!= mode){*/
                    mode = curMode.currentMode;
                    setTimeout(function(){
                        if(HT.baseExecute.c_state == "stop"){
                            HT.baseExecute.cameraHide();
                        }else{
                            HT.baseExecute.cameraShow();
                        }
                    },1000);  
                /*} */        
            }
        });

        MT.on("live:video:playing", function(){
            // 正在播放(去掉loading)
            if(initLoaded){
                $(".video_state").hide();
                $(".mask_background").hide();
            }
        });

        // 初始化 ｀buffer｀信息
        MT.on("live:loading:info", function(res){
            // 返回 Object {bytesLoaded: 92057, speed: 102400}
            // 分别除1024 得到 KB/S
            // 计算返回数据 [计算逻辑：<0 返回单位: kb/s, >=1 返回单位: mb/s]
            //loading显示
            $("#load_speed").show();
            if(((res.speed/1024)/1024) < 1){
                $("#speed").html((res.speed/1024).toFixed(2)+"kb/s");
            }else if(((res.speed/1024)/1024) >= 1){
                $("#speed").html((res.speed/1024/1024).toFixed(2) +"mb/s");
            };
            if(((res.bytesLoaded/1024)/1024)< 1){
                $("#precent").html((res.bytesLoaded/1024).toFixed(2)+"kb")
            }else if(((res.bytesLoaded/1024)/1024)>= 1){
                $("#precent").html((res.bytesLoaded/1024/1024).toFixed(2)+"mb");
            };
        });

        MT.on("live:video:loadstart", function(){
            // 第一次加载(显示loading)
            $(".video_state").show();
            $(".ani_dot").show();
            $(".mask_background").show();
        });

        //监听是否有ppt
        MT.on("live:set:page", function(retval){   
            HT.baseExecute.isPPT(retval);
        });

        /*
        * 新增聊天记录
        */
        MT.on('live:message:append', function(messages) {
            datas.chatList = messages;
            HT.baseExecute.renderChatList(messages);
        });

        /*
        * 设置章节列表
        */
        MT.on('live:chapter:list', function(chapters) {
            datas.chaptersList = chapters;
            HT.baseExecute.renderChapterList(chapters, HT.chapterBind);
        });

        /**
         * 广播列表
         */
        MT.on("live:broadcast:list", function(list){
            HT.baseExecute.broadcastList(list);
            
        });

        /**
         *  新增问题列表
         */
        MT.on('live:questions:append', function(questions) {
            datas.questionList = questions;
            HT.baseExecute.setQuestions(questions);
        });

        // 摄像头打开
        MT.on('camera:start', function() {
            HT.vodTools.debug('camera:start');
            HT.baseExecute.c_state = "start";
            $("#mtAuthorPlayer").addClass("camrabg");
            HT.baseExecute.cameraShow();
        });

        // 摄像头关闭
        MT.on('camera:stop', function() {
            HT.baseExecute.c_state = "stop";
            HT.vodTools.debug('camera:stop');
            HT.baseExecute.cameraHide();
        });
    },


    // 清除设置样式 
    clear: function() {
        var camera = this.camera;
        $(camera).removeAttr("style");

        this.$playerWrap.removeAttr("style");
        this.$mainPlayer.removeAttr("style");

        $("#modules").removeAttr("style");
        $("#modules .mod_xcon").removeAttr("style");
        $(".nav_items span").removeClass("cur").eq(2).addClass("cur");
        $("#room").removeAttr("style");
    },

    setCameraSize: function() {
        var camera = this.camera,
            cw = $(camera).width();
        if ($(camera).hasClass("hide")) {
            $(camera).height(0);
        } else {
            $(camera).height(cw * 0.75);
        }
    },

    //摄像头切换到中间区域重置宽高
    cameraCenter: function(cw, ch, minusHeight) {
        var $modCameraPlayer = $("#mod_camera_player"),
            $mtAuthorPlayer = $("#mtAuthorPlayer"),
            playerReset = MT.playerResize(cw, ch);
        $mtAuthorPlayer.width(playerReset.width);
        $mtAuthorPlayer.height(playerReset.height - minusHeight);
        //重置摄像头区域宽高并居中
        $modCameraPlayer.width(playerReset.width);
        $modCameraPlayer.height(playerReset.height - minusHeight);
        $modCameraPlayer.css({
            marginTop: -(playerReset.height / 2),
            marginLeft: -(playerReset.width / 2)
        })
    },

    //摄像头恢复到左上角重置宽高
    cameraleft: function() {
        var $modCameraPlayer = $("#mod_camera_player"),
            $mtAuthorPlayer = $("#mtAuthorPlayer");
        $mtAuthorPlayer.width(280);
        $mtAuthorPlayer.height(210);
        $modCameraPlayer.css({
            marginTop: 0,
            marginLeft: 0
        });
    },

    //PPT恢复到中间区域时重置宽高
    pptCenter: function() {
        $("#mod_player_wrap").removeClass("mod_main_player_wp1");
        $("#mod_player_wrap").addClass('mod_main_player_wp');
        $("#mod_main_player").removeClass('fullscreen');
        HT.baseExecute.$modFooter.addClass('pabsolute');
        HT.baseExecute.$modFooter.removeClass('footer');
        //重置PPT宽高和居中
        var pptcw = 0;
        var pptch = 0;
        if (fullResizeChange) {
            if (HT.baseExecute.scw == 0) {
                pptcw = $(window).width() - 580;
                pptch = $(window).height()
            } else {
                pptcw = HT.baseExecute.scw - 580;
                pptch = HT.baseExecute.sch;
            }

        } else {
            pptcw = HT.baseExecute.initcw;
            pptch = HT.baseExecute.initch
        }
        HT.baseExecute.playingArea(pptcw, pptch);
    },

    // PPT全屏时重置样式
    pptFullScreen: function() {
        var _cw = $(window).width();
        var _ch = $(window).height();
        $("#mod_player_wrap").removeClass("mod_main_player_wp");
        $("#mod_player_wrap").addClass('mod_main_player_wp1');
        HT.baseExecute.fullscreen(_cw, _ch); //全屏方法
        _PPTfullScreen = true;
        $("#full_screen").removeClass("s_screen");
        $("#full_screen").addClass("k_screen");
        $("#mod_col_left").addClass("zindex");
    },

    //PPT位于左上角重置样式
    pptLeftLocation: function() {
        var playerReset = {},
            playerReset = MT.playerResize(270, 200);
        $("#mod_main_player").width(playerReset.width + 3);
        $("#mod_main_player").height(playerReset.height);
        $("#mod_main_player").css({
            marginTop: 0,
            marginLeft: 0
        });
    },

    //视频的播放区域
    playingArea: function(w, h) {
        // 主播播放器
        var $mainPlayer = this.$mainPlayer,
            $wrap = this.$playerWrap;
        var playerReset = {},
            playerReset = MT.playerResize(w, h);
        $mainPlayer.width(playerReset.width);
        $mainPlayer.height(playerReset.height);
        // 居中上下左右
        $mainPlayer.css({
            marginTop: -(playerReset.height / 2),
            marginLeft: -(playerReset.width / 2)
        });

        $("#mod_camera_player").addClass('full_camera');
    },

    // 摄像头初始化设置
    cameraReset: function(camera) {
        camera || this.camera;
        var orientation = this.isOrientation();
        if (orientation) {
            this.cameraHorizontal(camera);
        } else {
            this.cameraVertical(camera);
        }
    },

    // 摄像头竖
    cameraVertical: function() {
        var that = this,
            camera = this.camera;
        if (camera) {
            $(camera).css("top", that.$mainPlayer.height());
            this.setCameraSize();
        }
    },

    // 摄像头横
    cameraHorizontal: function() {
        var camera = this.camera;
        var $camera = $(camera),
            $modules = $("#modules");
        if ($camera.hasClass("camera_iphone")) {
            $camera.height(0);
        } else {
            this.setCameraSize();
            var base = $(window).height() - $camera.height();
            $modules.height(base);
            $modules.css("margin-top", $camera.height());
        }
    },

    //左右快进
    _seekDown : function(key){
        var that = this;
        if(!seekLock){
            HT.liveStyle(true);
        }
        switch(key){
            // Left
            case 37:
                __currentTime -= that.timeSlice;
                if(__currentTime < 0){
                    __currentTime = 1;
                }
                break;
            // Right
            case 39:
                __currentTime += that.timeSlice;
                if(__currentTime >= totalTime){
                    return;
                }
                break;

        }; 
      
        seeker.noUiSlider.set(__currentTime);
        that.tempCurTime = __currentTime;
        seekLock = true;
        // seeker.noUiSlider.set(__currentTime);

        if(that.liveStyleTime){

            clearTimeout(that.liveStyleTime);
            that.liveStyleTime = null;
        }

        // MT.pause();
        $("#cur_time").html(HT.vodTools.second2HMS(__currentTime));
        
    },

    _seekUp : function(key){
       var that = this;
       var time = that.tempCurTime;
       $('.continue_play').hide();
       $(".keydown_play").hide();
       if(that.liveStyleTime){
            clearTimeout(that.liveStyleTime);
            that.liveStyleTime = null;
        }
        MT.pause();
        that.liveStyleTime = setTimeout(function(){
            // 更新seek时间点
            seekDuration = time;
            MT._seekTime = time;
            // HT.baseExecute.playEnd(time);
            
            MT.seek(time);
            HT.goChapter(time);

            // MT.play();
            // window.parent.HTCMS.videoClip.seekSetTime(time);
        }, 200);
        seekLock = false;
    }
};

// 初始化设置
(function(win) {
    // if(parseInt(album) == 1){//有专辑时tab样式
    //     $("#mod_col_left").addClass("has_ablum");
    //     var num = $("#album_listli li").size();
    //     $("#album_num").html("("+num+")");
    //     if(num==1){
    //         $("#mod_col_left").addClass("one_ablum");
    //     }else if(num ==2){
    //         $("#mod_col_left").addClass("two_ablum");
    //     }
    // }  

    // 判断模块设置是否正确
    // if (Object.keys) {
    //     var _mods = Object.keys(HTSDK.modules.moduleBlocks || {})
    //     if (_mods.length === 0) {
    //         HTSDK.modules.vod.init()
    //     }
    // }

    //loading显示
    $(".mask_background").show();
    $(".video_state").show();
    $(".ani_dot").show();

    //切换源测试案例方法   
    if(isDebug){
        $("#switch_source").show();
    } 

    //模板加载
    var protocol = window.location.protocol + "//",
        tplURL = "";

    // cross问题
    if(window.location.href.indexOf("cross=true") > -1){
        tplURL = window.coreTpl.replace(/static-[\d]/, "open");
    }else{
        tplURL = window.TF_getStaticHost(window.coreTpl);
    }

    // 加载模版
    $("#template_loader").load(tplURL, function() {
        
        tplLoadState = true;

        // SDK初始化
        MT = new MT.SDK.main(window.access_token, function(o){
            HT.baseExecute.sdkInitCallback(MT);
        });  

        //点播模块初始化
        HT.vod.init(MT);

        // cmd 执行
        HT.baseExecute.cmdRuner(MT);
        
        // plackback
        // var html = tmod('playback_mask', {})
        // $(document.body).append(html)

    });

})(window);

// vars
var $ = window.jQuery,
    location_flag = true,
    playFlag = false;//用来判断是否play
    //标识交换位置 
    __Event = "click",
    seeker = document.querySelector("#seek_range");
    noUiSlider = window.noUiSlider, 
    tmod = template, 
    MTSDK = window.MTSDK || {};
    HT = window.HT || {};

// CDN验证
HT.getCDNPath = function(res){
    if(window.TF_getStaticHost){
        return window.TF_getStaticHost(res);
    }else{
        return res;
    }
};


// 对外Api
window.TALKFUN_VOD_API = {
    // 关闭聊天
    disableChat: function(){
        HT.disableChat = true;
        var t = $(".carousel").eq(1);
        HT.baseExecute.toggleFlex(t);
        t.off("click");
        $("#right_arrow").remove();
    }
};

// vod工具
HT.vodTools = {

    // 记录播放状态
    setState: function(state){
        if(this.state === state){
            return false;
        }
        else if(state){
            this.state = state;
            // 17zuoye.com 接口
            if(typeof window.recoderApi !== "undefined"){
                switch(state){
                    case "playing":
                        window.recoderApi.play();
                        break;
                    case "pause":
                        window.recoderApi.pause();
                        break;
                    case "stop":
                        window.recoderApi.stop();
                        break;
                }
            }
        }
    },

    // 是否pc端
    IsPC: function() {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    },
     // 检测是否安装Flash
    checkFlash: function(){
            var check = HT.vodTools.flashChecker(),
            $wrap = $(".mod_main_player_wp");
        if(check.flash){
            return;
        }else{
            $wrap.append('<p class="no_flash">直播课堂需要FLASH支持， 请<a target="_blank" href="http://www.adobe.com/go/getflashplayer">下载安装</a></p>');
        }
    },


    // 判断是否有Flash插件
    flashChecker: function(){
        var hasFlash = false, //是否安装了Flash
            VSwf = {}, //版本信息
            flashVersion = -1; //Flash版本
        if(document.all) {  
            try{
                var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            }catch(err){}
            if(swf) {  
                hasFlash = true;  
                VSwf = swf.GetVariable("$version");  
                flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);  
            }  
        }else {
            if(navigator.plugins && navigator.plugins.length > 0) {
                var swf = navigator.plugins["Shockwave Flash"];  
                if(swf) {  
                    hasFlash = true;
                    var words = swf.description.split(" ");  
                    for(var i = 0; i < words.length; ++i) {  
                        if(isNaN(parseInt(words[i]))) continue;
                        flashVersion = parseInt(words[i]);  
                    }  
                }  
            }  
        }  
        return{
            flash: hasFlash,  
            version: flashVersion
        };  
    },

    // debug
    debug: function(param1, param2) {
        if (window.console) {
            if (!param2) {
                param2 = "";
            }
            console.log(param1, param2);
        }
    },

    // Second to hh:mm:ss
    second2HMS: function(d) {
        d = parseInt(d, 10);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        function format(num) {
            var val = 0;
            if (num > 0) {
                if (num >= 10) {
                    val = num;
                } else {
                    val = '0' + num;
                }
            } else {
                val = '00';
            }
            return val;
        }
        var hr = format(h);
        var min = format(m);
        var sec = format(s);
        var hms = hr + ':' + min + ':' + sec;
        return hms;
    },

    // 取最接近值
    closest: function(array, find) {
        var arr = array,
            num = find;
        var curr = arr[0],
            diff = Math.abs(num - curr);
        // 二分法截取近似值
        for (var val = 0; val < arr.length; val++) {
            var newdiff = Math.abs(num - arr[val]);
            if (newdiff < diff) {
                diff = newdiff;
                curr = arr[val];
            }
        }
        return curr;
    }
};

// 房间状态
var initLoaded = false,
    totalTime =""; 


// 章节
var chaptersData = [],
    chaptersDataObj = {},
    chaptersTimePoints = [],
    chapterCurPoint = 0;

// 聊天
var messagesData = [],
    messagesDataObject = {},
    chatSliceObj = {},
    chatTimePoint = [];

// 问答
var questionData = [];

// 时间节点
var __currentTime = 0,
    __crTimer = null,
    onTouch = true,
    // 触摸
    scrollSection = null;

// seek锁定
var seekLock = false;

//反射調用
var invokeFieldOrMethod = function(element, method) {
        var usablePrefixMethod;
        ["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
            if (usablePrefixMethod) return;
            if (prefix === "") {
                // 无前缀，方法首字母小写
                method = method.slice(0, 1).toLowerCase() + method.slice(1);
            }
            var typePrefixMethod = typeof element[prefix + method];
            if (typePrefixMethod + "" !== "undefined") {
                if (typePrefixMethod === "function") {
                    usablePrefixMethod = element[prefix + method]();
                } else {
                    usablePrefixMethod = element[prefix + method];
                }
            }
        });
        return usablePrefixMethod;
    };

HT.liveStyle = function(type){
    $(".repeat").hide();
    //暂停
    if(type == true){
        $('#btn_pp').removeClass("pause");
        MT.pause();
        $('#btn_pp').addClass("play");
        $("#mod_camera_player").addClass("hide");
        $(".face").show();
        $("#chapter_listli").find('.aclick_bg .p_state').hide();
        if (!location_flag) {
            $("#camera_play").addClass('camerabg');
        }
    //开始
    }else if(type == false){
        $('#btn_pp').addClass("pause");
        MT.play();
        $('#btn_pp').removeClass("play");
        $(".mask_background").hide();
        $("#mod_camera_player").removeClass("hide");
        $("#mod_main_player").show();
        $("#chapter_listli").find('.aclick_bg .p_state').show();
        if (!location_flag) {
            $("#camera_play").removeClass('camerabg');
        }
    }
};

/**
 * DOM控制长度方法
 */
HT.domLimit = function(parent, child, max){
    // 让 parent 的DOM数量保持 max 大小
    var domSize = $(parent).find(child).size();
    HT.vodTools.debug("dom size===> "+domSize);
    if(domSize > max){
        $(parent).find(child).eq(0).remove();
    }
};

// 聊天滚动到指定时间点
HT.goChat = function(duration){
    duration = Math.floor(duration);
    var target = $(".chat_at_"+duration);
    if($("#chat_listli").find(target).size() > 0){
        $("#chat_listli li").removeClass("cur");
        var li = $("#chat_listli").find(target);
        li.addClass("cur");
        $("#chat_list").scrollTo(li, 200);
    }
};


// Seek(进度条拖动)绑定
HT.seekEvent = function(live) {

    // 锁🔒
    var lockSeek = false;

    // seek..
    noUiSlider.create(seeker, {
        start: 0,
        step: 1,
        range: {
            min: 0,
            max: Number(live.duration)
        }
    });

    // seek on update
    seeker.noUiSlider.on("update", function(that) {
       $(".mask_background").hide();
    });


    // on set
    seeker.noUiSlider.on("set", function(that) {
        $(".mask_background").hide();
        seekLock = false;
    });

    // seek on mouseoff
    seeker.noUiSlider.on("change", function(that) {
        // 解锁
        seekLock = false;
        // Todo...
        var _duration = parseInt(that[0], 10);
        if(seekTimer){
            clearTimeout(seekTimer);
        }
        // 更新seek时间点
        seekDuration = _duration;
        // seek延迟执行
        MT.seek(_duration);
        HT.goChapter(_duration);
        HT.goChat(_duration);
        MT._seekTime = _duration;
        HT.baseExecute.playEnd(_duration);
    });

    var seekTimer = null;
    
    // seek on slide
    seeker.noUiSlider.on("slide", function(that) {
        seekLock = true;
        $(".continue_play").hide();
        $("#mod_main_player").show();

        // 记录seek最后时间点
        seekDuration = parseInt(that[0], 10);

        if(seekDuration === parseInt(HT.baseExecute.duration)){
            MT.seek(seekDuration);

            return;
        }

    });

};

// 绑定事件
HT.bindEvent = function() {
    // isLoad: false//是否加载
    // 初始化旋转
    HT.baseExecute.init();

    var isPause = false; //是否暂停，默认不暂停

    // hover出现进度条
    $("body").on("mouseover", function(){
        $("#footer").height("58px");
        $("#footer").css("bottom","0px");
    })
    $("body").on("mouseleave", function(){
        $("#footer").height("0px");
        $("#footer").css("bottom","-20px");
    })

    // 播放
    $(".section_main").on(__Event, "#click_play", function() {
        $(this).hide();
        MT.play();
    });

    $(document).keydown(function(event){
        var e = event|| window.event|| arguments.callee.caller.arguments[0];
        // space 暂停
        // Left
        if(e && e.keyCode == 37){
            HT.baseExecute._seekDown(37);  
            $(".keydown_play").show();    
            $(".keydown_play").addClass("back");
        }
        // Right
        else if(e && e.keyCode == 39){
            HT.baseExecute._seekDown(39);
            $(".keydown_play").show();
            $(".keydown_play").removeClass("back");
            
        }
        // 暂停，播放
        if(e && e.keyCode == 32){
            if(isPause){
                HT.liveStyle(false);
                isPause = false;
            }else{
                HT.liveStyle(true);
                /*$(".continue_play").show();
                MT.pause();*/
                isPause = true;
            }
        }
    });

    $(document).keyup(function(e){
        seekLock = true;
        if(e&&e.keyCode == 37){
            HT.baseExecute._seekUp(__currentTime);
            $('.continue_play').hide();
            
        }else if(e&&e.keyCode == 39){
            HT.baseExecute._seekUp(__currentTime);
            $('.continue_play').hide();
        }

    });

    //切换源
    $("#switch_source").on(__Event,function(){
        $(".switch_warp").show();
        if(!this.isLoad){
            HT.baseExecute.getSource();
            this.isLoad = true;
        }
    });
    //移开隐藏弹框
    $(".switch_warp").on("mouseleave",function(){
        $(".switch_warp").hide();
    });

    //选择切换源
    $("#switch_list").on(__Event,"li",function(){
         var key = $(this).data("key");
         $(this).addClass("selected").siblings().removeClass("selected");
         HT.baseExecute.switchSource(key);   
    });
    
    //鼠标移到摄像头区域
    $("#camera_play").on("mouseover", function(e){
        if(!isChangeVideo){//切换
          $("#teach_infor").show();
        }
    });
    //鼠标移到摄像头区域
    $("#camera_play").on("mouseout", function(e){
        if(!isChangeVideo){//切换
          $("#teach_infor").hide();
        }
    });



    // 拖动时暂停
    $("#ctr_range").on(__Event, function(e) {
        MT.pause();
    });

    //左右收缩
    // $(".carousel").on(__Event, function() {
    //     HT.baseExecute.toggleFlex($(this));
    // });

    //是否点击勾选不看鲜花
    $("#chat_operation").on(__Event, ".hide_flower i", function () {
        if($(this).hasClass("checked")){
            $(this).removeClass("checked");
            $(".message_isImg").show();
            HT.baseExecute.isShowFlower =  false;
        }else{
            $(this).addClass("checked");
            HT.baseExecute.isShowFlower =  true;
            $(".message_isImg").hide();    
        }
    });

    //是否点击勾选停止滚动复选框
    $("#chat_operation").on(__Event, ".stop_chat_scroll i", function () {
        if($(this).hasClass("checked")){
            HT.baseExecute.isStopScroll = false;
            $(this).removeClass("checked");
        }else{
            $(this).addClass("checked");
            HT.baseExecute.isStopScroll = true;    
        }
    });

    //鼠标移过播放进度条某个点
    $("#mod_seek").on("mousemove",function(e){
            var x = e.clientX;
            var mx = x - 290;
            if($("#album_and_chapter").is(":hidden")){
               mx = x-10;         
            }   
           var precent =mx/$(this).width(); 
           var cur_time = HT.baseExecute.convertTimestamp(totalTime*precent);
           $(".point_time").text(cur_time);

           $(".current_time").css({
                left: mx-30
           });
           $(".current_time").show();   
    });
    $("#seek_range").on("mouseleave",function(e){
        $(".current_time").hide();
    });

    // SEEK
    $("#ctr_range").on(__Event, function(range) {
        var that = this;
    });

    // 开始暂停
    $("#btn_pp").on(__Event, function() {
        $(".repeat").hide();
        if ($(this).hasClass("pause")) {
            $(this).removeClass("pause");
            MT.pause();
            $(this).addClass("play");
            $(".continue_play").show();
            $("#mod_camera_player").addClass("hide");
            $(".face").show();
            $("#chapter_listli").find('.aclick_bg .playing_text').html("暂停");
            $("#chapter_listli").find('.aclick_bg .p_state').hide();
            if (!location_flag) {
                $("#camera_play").addClass('camerabg');
            }
            //开始 
        } else {
            $(this).addClass("pause");
            MT.play();
            $(this).removeClass("play");
            $(".continue_play").hide();
            $(".mask_background").hide();
            $("#mod_camera_player").removeClass("hide");
            $("#mod_main_player").show();
            $("#chapter_listli").find('.aclick_bg .playing_text').html("播放");
            $("#chapter_listli").find('.aclick_bg .p_state').show();
            if (!location_flag) {
                $("#camera_play").removeClass('camerabg');
            }

        }
    });

    // view tools
    $("#mod_player_wrap").on(__Event, function(e) {
        var $op = $("#player_operation"),
            $control = $("#controls");
        if ($op.hasClass("hide")) {
            $op.removeClass("hide");
            $control.fadeIn(100);
        } else {
            $op.addClass("hide");
            $control.fadeOut(100);
        }
    });

    //专辑列表效果
    $("#album_listli li a").on(__Event, function(e) {
        if($(this).hasClass("cur")){
            return false;
            //11111
        } 
    });

    var hvTime = null;
    //章节列表鼠标移上去显示章节图片
    $("#chapter_listli").on("mouseover", "li", function(e) {
        clearTimeout(hvTime);
        var offset = $(this).offset();
        var $that = $(this);
        // 后加载图片
        hvTime = setTimeout(function(){
            var $dom = $that.find(".hover_img");
            $dom.show().css({
                top: offset.top - 30,
                left: 250
            });
            var img = $dom.find("img"),
                src = img.data("osrc");
            img.attr("src", src);
        }, 100);
    });

    $("#chapter_listli").on("mouseout", "li", function(e) {
        clearTimeout(hvTime);
        $(this).find(".hover_img").hide();
    });

    $("#chapter_listli").on(__Event, "li a", function(e) {        
        $("#chapter_listli li a").find('.playing_text').hide();
        $("#chapter_listli li a").find('.p_state').hide();
        $(".mask_background").hide();
        $(".continue_play").hide();
        $(this).find(".playing_text").show();
        $(this).find(".p_state").show();
        $("#chapter_listli li a").removeClass("aclick_bg");
        $(this).addClass('aclick_bg');
        $(".repeat_play").hide();
        $("#mod_main_player").show();
    });

    // 章节选择
    $("#chapter_listli").on(__Event, "li", function() {
        var stime = $(this).data("time");
        seekDuration = stime;
        MT.seek(stime);
    });

    // 摄像头开关
    $("#camera").on(__Event, function() {
        HT.baseExecute.toggleCamera(this);
    });

    // 切换摄像头
    var toggleVideo = function(flag){
        var video = $("#camera_play");
        var player = $("#mod_player_wrap");
        if(flag){
            video.addClass("all_toggled");
            player.addClass("all_toggled");
            video.removeClass("hide");
            isChangeVideo = true;
        }else{
            video.removeClass("all_toggled");
            player.removeClass("all_toggled");
            isChangeVideo = false;
        }
    }

    //摄像头和主播放器交换位置
    $("#lca_change").on(__Event, function() {
        var playerReset = {},
            $modCameraPlayer = $("#mod_camera_player"),
            $mtAuthorPlayer = $("#mtAuthorPlayer"),
            $modmainplayer = $("#mod_main_player");

        // ====> add by Marko(切换摄像头)
        // 添加标识
        if($(this).hasClass("changed")){
            $(this).removeClass("changed");
            toggleVideo(false);
            $('.mod_main_player_wp').removeAttr('style');
            $('#camera_play').removeAttr('style');
            
        }else{
            $(this).addClass("changed");
            $("#camera_play").css({
                width: "auto",
                height: "auto"
            });
            toggleVideo(true);        
            var logo_info= HTSDK.modules.getlogo("mod_logo_playback");
            if(logo_info.enable == '0'){
                $('.all_toggled').css('top','0px');
            }
        }
        // <==== end add
    });
    

    //停止播放
    $("#close_play").on(__Event, function() {
        $(".repeat_play").show();
        seeker.noUiSlider.set(0);
        MT.stop();
        seekDuration = 0;
        $("#cur_time").html("00:00:00");
        $(".repeat").show();
        $("#mod_camera_player").addClass("hide");
        $(".continue_play").hide();
        $(".mask_background").hide();
        $("#chapter_listli").find('a').removeClass("aclick_bg");
        $(".playing_text").hide();
        $(".title").show();
        $(".p_state").hide();
        $("#btn_pp").removeClass("pause");
        $("#btn_pp").addClass('play');
        $("#chapter_list").scrollTo(0, 200);
        if (!location_flag) {
            $("#camera_play").addClass('camerabg');
            $("#mod_main_player").hide();
        }
    });

    //恢复播放
    $(".continue_play").on(__Event, function() {
        seekLock = false;
        MT.play();
        $("#btn_pp").addClass("pause ");
        $("#btn_pp").removeClass('play');
        $(".continue_play").hide();
        $("#mod_camera_player").removeClass("hide");
        $("#chapter_listli").find('.aclick_bg .playing_text').html("播放");
        $("#chapter_listli").find('.aclick_bg .p_state').show();
        $(".mask_background").hide();
        $("#mod_main_player").show();
        if (!location_flag) {
            $("#camera_play").removeClass('camerabg');
        }
    });

    //重播
    $(".repeat_play").on(__Event, function() {
        seekLock = false;
        MT.seek(1);
        seeker.noUiSlider.set(1);
        seekDuration = 0;
        $(".repeat").hide();
        $(".mask_background").hide();
        $("#mod_camera_player").show();
        $(".teacherinfor").hide();
        $("#chapter_listli").find("a").removeClass("aclick_bg");
        /*$("#chapter_listli").find('a').eq(0).find(".title").hide();*/
        $(".playing_text").hide();
        $("#chapter_listli").find('a').eq(0).find(".playing_text").show();
        $("#chapter_listli").find('a').eq(0).addClass('aclick_bg');
        $("#chapter_listli").find('a').eq(0).find('.p_state').show();
        if (!location_flag) {
            $("#camera_play").removeClass('camerabg');
            $("#mod_main_player").show();
        }
    });

    //html5倍速功能模版加载
    h5player.init();
    
}


// 滚动到当前(指定)章节
var $chapterScroller = $("#chapter_listli li"),
    $chapterList = $("#chapter_list"),
    $chapterPrevEl = null,
    $chapterSizeLength = $chapterScroller.size();

// 滚动到n章节
HT.goChapter = function(duration) {

    // 没有章节情况
    if(chaptersTimePoints.length === 0){
        return false;
    }

    // 删除最近对象的激活状态
    $chapterList.find("a").removeClass("aclick_bg");
    
    // 章节数据
    var chapterPoint = HT.vodTools.closest(chaptersTimePoints, duration),
        $targetElement = $("#"+chaptersDataObj[chapterPoint].sn);

    // 设置当前
    $targetElement.find("a").addClass("aclick_bg");
    $chapterList.scrollTo($targetElement.prev(), 200);

    // 保存当前对象
    $chapterPrevEl = $targetElement;

};

//聊天切换table
$("#chat_nav li").on(__Event, function() {
    if($(this).hasClass("onlyone")){
        return;
    }
    $("#chat_nav li").removeClass("current");
    $(this).addClass('current');
    if ($(this).index() == 0) {
        $("#chat_list").show();
        $("#question_list").hide();
    } else {
        HT.baseExecute.renderQuestionList();
        $("#chat_list").hide();
        $("#question_list").show();
    }
});


//html5 功能   注意:h5player为全局变量
var h5player = {
    //倍速盒子显示与否标志
    isSpeedTypeBoxShow : false,
    playRate_info : HTSDK.modules._playRate('mod_playrate_playback'),
    delayHideTimer: null,
    //渲染，插入模版
    h5PlayerTpl : function(){
        var html5PlayerTpl = template('player_speed',{});
            //插入点
            $('.footer_right').prepend(html5PlayerTpl);
    },
    //获取操作相关目标
    getTargets : function(){
        return {
            //倍速按钮
            $speedBtn : $('.player_speed'),
            $speedBtnInner : $('.player_now_speed'),
            //倍速盒子
            $speedTypeBox : $('.player_speed_type'),
        }
    },
    addEvent : function(){
        var targets = this.getTargets(),
            that = this;
        targets.$speedBtn.on('click',function(){

            that.isSpeedTypeBoxShow = !that.isSpeedTypeBoxShow;

            if(that.isSpeedTypeBoxShow) {
                targets.$speedTypeBox.show();
            }else {
                targets.$speedTypeBox.hide();
            }
        });

        targets.$speedTypeBox.on('click','li',function(){
            //点击li   点击事件冒泡到 $speedBtn上，触发点击事件，隐藏倍速盒子
            var speed = $(this).data('speed') ;
            var type = $(this).html();
            window.__vodPlayer.playRate(speed);
            if(type === '正常播放') {
                targets.$speedBtnInner.html('倍速');
            }else {
                targets.$speedBtnInner.html(type);
            }
            // return false;
        });
        targets.$speedTypeBox.on('mouseenter', function() {
            clearTimeout(that.delayHideTimer)
        })
        targets.$speedTypeBox.on('mouseleave', function() {
            clearTimeout(that.delayHideTimer)
            var $this = $(this)
            that.delayHideTimer = setTimeout(function() {
                $this.hide()
                that.isSpeedTypeBoxShow = false
            }, 300)
        })
    },
    init : function(){
        // 开启播放速率
        if(this.playRate_info.enable == 1){
            this.h5PlayerTpl();
            this.addEvent();
        }
    }
}

window.MT = MT;