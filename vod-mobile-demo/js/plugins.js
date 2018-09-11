/**
 * @name chat.js
 * @note 聊天区模块
 * @author [Marko]
 * @version [v1.0.1]
 */

define(function(require, exports, module) { 

    var TMOD = require("TMOD"),
        config = require("./global.config");  
    /**
     * @插件
     */
    var plugins = {

        //是否摄像头已加载
        load: false,

        //是否已播放
        play: false,
        
        _MT : null,

        // 默认
        defaults: {
            setToptimer: null,
            defaultAavtar: seajs.domain + "/css/img/user.png"
        },
        
        cmdBroadCast: [],
        isGlobalLoad: false,

        // 父容器
        $target: $("#room"),
        
        // 事件绑定
        events:[
            {"click": [".main_scoller .btn_close", "closeRollNotice"]}, // 关闭滚动
        ],
        binds: function(){
            var that = this;
            that.bindEvent(that.$target, that, that.events);
        },

        // 取最接近值
        closest: function(array, find) {
            var arr = array,
                num = find;
            var curr = arr[0],
                diff = Math.abs (num - curr);
            // 二分法截取近似值
            for (var val = 0; val < arr.length; val++) {
                var newdiff = Math.abs (num - arr[val]);
                if (newdiff < diff) {
                    diff = newdiff;
                    curr = arr[val];
                }
            }
            return curr;
        },

        // SS => HH:MM:SS
        second2HMS: function(d,str){
            d = parseInt(d, 10);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            var times = "";
            function format(num){
                var val = 0;
                if (num > 0){
                if (num >= 10){
                        val = num;
                    }else{
                        val = '0' + num;
                    }
                }
                else{
                val = '00';
                }
                return val;
            }
            var hr = format(h);
            var min = format(m);
            var sec = format(s);

            if(str){
                if(str == "total"){
                    if(hr > 0){
                        plugins.flag = true;
                        times =  hr + ':' + min + ':' + sec;
                        
                    }else{
                        plugins.flag = false;
                        times =  min + ':' + sec;
                    
                    }
                }else if(str == "cur"){
                    if(plugins.flag){
                        if(hr>0){
                            times =  hr + ':' + min + ':' + sec;
                        }else{
                            times ='00:' + min + ':' + sec;
                        } 
                    }else{
                        times =  min + ':' + sec;
                    }
                }
            }else{
                if(hr > 0){
                    plugins.flag = true;
                    times =  hr + ':' + min + ':' + sec;
                    
                }else{
                    plugins.flag = false;
                    times =  min + ':' + sec;
                
                }
            }
            return  times;   
        },

        // 事件绑定
        bindEvent: function(target, callObj, events){
            events.forEach(function(object, index){
                for(var e in object){
                    // console.info(target, object[e], e);
                    target.on(e, object[e][0], callObj[object[e][1]]);
                }
            });
        },

        //重置
        pptReset: function(width, height){
            var that = this,
                resize = (that._MT.playerResize),
                pptObj = resize(width, height);//重置尺寸
            that.pptCenter(pptObj.width, pptObj.height);
            return pptObj;
        },

        //摄像头隐藏
        videoHide: function(){
            //针对iPhone的处理
            var u = navigator.userAgent;
            if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
                $("#ht_camera_container").css({
                    width: 1,
                    height: 1
                });
            }else{
                $("#mtAuthorPlayer").addClass("camerahide");
                $("#ht_camera_container").addClass("move");//移开视频区域
            }   
        },

        //摄像头显示
        videoShow: function(){
            //针对iphone的处理
            var u = navigator.userAgent;
            if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
                plugins.scVerticalRest();
            }else{
                $("#mtAuthorPlayer").removeClass("camerahide");
                $("#ht_camera_container").removeClass("move");//移开视频区域
            }   
        },

        //中小屏状态下
        scVerticalRest: function(){
            var cw = "50%";  
            if(config.screenMode == 1){
                //中屏
                cw = "50%";     
            }else if(config.screenMode == 2){
                //小屏
                cw = "30%";
            }
            if(plugins.isMobileStatus() == "vertical"){
                if(!config.switchFlag && config.isOpen){
                    //不切换
                    $("#ht_camera_container").css("width", cw);
                    $("#ht_camera_container").height($("#ht_camera_container").width()*0.75);
                    $("#mtAuthorPlayer").height($("#ht_camera_container").width()*0.75);
                    $("#mtAuthorPlayer").width($("#ht_camera_container").width());
                }else{
                    $(".mod_ppt_wrap").show();
                }
            }   
        },

        //ppt 居中
        pptCenter: function(cw,ch){
            $("#mod_main_player").css({
                width: cw,
                height: ch,
                marginTop: -(ch/2) + "px",
                marginLeft: -(cw/2) + "px",
                top:"50%",
                left: "50%"
            });
        },
        //针对iphone的处理，重置宽高
        forIphone: function(){
            var u = navigator.userAgent;
            return false;
            //iPhone
            if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
                if(!$("#tab_video").hasClass("selected")){
                    $("#mtAuthorPlayer").css({
                        width: 1,
                        height: 1
                    });
                }     
            }else{
                if(config.screenMode != 0){
                    $("#mtAuthorPlayer").addClass("camerahide");
                }
            }
        },

        //切换模式时针对安桌和iphone作不同的处理
        difTreatment: function(mode){
            var u = navigator.userAgent;
            if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
                if(mode == 0){
                    $("#mtAuthorPlayer").show();
                }else{
                    $("#mtAuthorPlayer").hide();
                }
            }else{
                if(mode == 0){
                    $("#mtAuthorPlayer").removeClass("camerahide");
                }else{
                    if(!config.switchFlag){
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }  
                }
            }
        },

        //是否是安卓机    
        isAndroid: function(){
            var u = navigator.userAgent,
                isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端  
            if(isAndroid){
                return true;
            }else{
                return false;
            }
        },

        //大屏针对iphone ios10白屏处理，PPT在下的情况下
        pptDownIphone: function(type){

            $("#ht_camera_container").css({
                width:  $(".mod_ppt").width(),
                height: $(".mod_ppt").height()
            });

            if(config.mediaSwitch == "video"){
                $("#mtAuthorPlayer").css({
                    width:  $(".mod_ppt").width(),
                    height: $(".mod_ppt").height()
                });  
                $("#voice_bg").hide();
            }else{
                $("#voice_bg").show();
                $("#mtAuthorPlayer").css({
                    width: 1,
                    height: 1
                }); 
            }
        },

        //针对iphone ios10白屏处理，PPT在上的情况下
        pptUpIphone: function(type){
            if(type == "video"){
                if($("#tab_video").text() == "视频"){
                    if(plugins.isMobileStatus()== "vertical"){//竖屏
                        $("#mtAuthorPlayer").css({
                            width:  $(".mod_modules").width(),
                            height: $(".mod_modules").height()
                        });
                    }else{
                        $("#mtAuthorPlayer").css({
                            width:  $(".mod_modules").width(),
                            height: "auto"
                        });
                    }       
                }else if($("#tab_video").text() == "音频"){
                    $("#voice_bg").show();
                }
                $("#ht_camera_container").css({
                    width:  $(".mod_modules").width(),
                    height: $(".mod_modules").height()
                });
            }else{
                $("#voice_bg").hide();
                $("#ht_camera_container").css({
                    width:  1,
                    height: 1
                }); 
                $("#mtAuthorPlayer").css({
                    width: 1,
                    height: 1
                });
            }
        },

        // 不同状态下标签的更改
        currentTable: function(tab){
            if(config.switchFlag){
                $("#tab_video").html("文档");
            }else{
                $("#tab_video").html(tab);
            } 
        },

        // 监听摄像头
        checkVideo: function(){
            if(plugins.play){
                $("#click_play").hide();
            }
        },

        // 模式切换时选中每一个tab
        switchFirstTab: function(){
            $("#chat").hide();
            $("#ask").hide();
            $("#set").hide();
            $("#ht_camera_container").removeClass("move");
            $("#mtAuthorPlayer").removeClass("camerahide");
            if(config.switchFlag){
                
                $("#ht_camera_container").height($("#mod_ppt").height());
                $("#ht_camera_container").width($("#mod_ppt").width());

                if(config.mediaSwitch == "video"){
                    $("#voice_bg").hide();
                    $("#ht_camera_container").height($(".mod_modules").height());
                    $("#ht_camera_container").width($(".mod_modules").width());
                }
            }else{
                
                $("#ht_camera_container").height($(".mod_modules").height());
                $("#ht_camera_container").width($(".mod_modules").width());

                if(config.mediaSwitch == "video"){
                    $("#voice_bg").hide();
                    $("#mtAuthorPlayer").height($(".mod_modules").height());
                    $("#mtAuthorPlayer").width($(".mod_modules").width());
                }
            }
        },
        // 是否管理
        isAdmin: function (_role) {
            if(window.MT.me){
                var role = {};
                if(_role){
                    role = _role;
                }else{
                    role = MT.me.role;
                }
                if(role === "admin" || role === "spadmin"){
                    return true;
                }else{
                    return false;
                }
            }
        },
        
        // 设置禁言
        // data.chat.enable > 0  为可以发言
        // data.chat.enable == 0 为禁言状态
        getChatAccess: function(data){
            if(data.chat){
                // 允许发言
                if(data.chat.enable > 0){
                    return false;
                }else{
                // 禁言
                    return true;
                }
            }
        },

        //当抽奖、投票,网络切换时针对安卓机隐藏摄像头
        isVideo: function(){
            var u = navigator.userAgent;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            if(isAndroid){
                if($("#tab_video").hasClass("selected")){
                    if(config.cameraStatue == "start" && config.mediaSwitch == "video"){
                        $("#mtAuthorPlayer").addClass("camerahide"); 
                        $("#mtAuthorPlayer").css("left","3000px");
                        $("#ht_camera_container").addClass("move");          
                    }else{
                        $("#ht_camera_container").removeClass("move");
                    }
                }
                /*针对中小屏*/  
                if(config.screenMode==1 || config.screenMode==2){
                    var status= $("#ht_camera_container").data("status");
                    if(config.cameraStatue === "start"){
                        var cameraIsShow= $("#tab_video").data("change");
                        if(config.isOpen){
                            $("#mtAuthorPlayer").addClass("camerahide");
                        }
                    }
                }
            }      
        },

        //当抽奖、投票,网络切换完成后时针对安卓机显示摄像头
        cameraShow: function(){
            var u = navigator.userAgent;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            if(isAndroid){
                if(plugins.isMobileStatus()=== "horizontal"){//模屏状态下
                    var switchFlag= $(".mod_ppt_wrap").data("switch");
                    if(switchFlag){
                        $("#mtAuthorPlayer").removeClass("camerahide");  
                    }        
                }  
            }
        },

        // 屏幕旋转状态
        isMobileStatus: function(){
            var that = this,
                des = that.room.getOrientation(),
                roation = that.room.getOrientationTarget(des);
            return roation;
        },

        //信息管理
        modMessage: function(flag, retval){
            var that = this,
                notify = "";
            switch(flag){
                // 发起投票
                case "vote:new":
                    notify = '通知：<em>'+retval.info.nickname+'</em> 发起了投票 <strong>'+retval.info.title+'</strong>';
                    that.chatNotify(notify);
                    break;

                // 结束投票
                case "vote:pub":
                    notify = '通知：<em>'+retval.info.nickname+'</em> 结束了投票 <strong>'+retval.info.title+'</strong>';
                    that.chatNotify(notify);
                    break;
                
                // 踢出房间
                case "member:kick":
                    notify = '通知：管理员把 <em>'+retval.nickname+'</em> 请出了房间！';
                    that.chatNotify(notify);
                    break;
            }
        },
        
        // 时间转换
        convertTimestamp: function(timestamp) {
            var d = new Date(timestamp * 1000),   // timestamp 2 milliseconds
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
                dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
                ampm = 'AM',
                time;
            time = h + ':' + min;
            return time;
        },

        /*判断是否语音还是视频*/
        voiceOrVideo: function(){
            if(config.cameraStatue === "start"){
                if($("#tab_video").hasClass("selected")){
                    if(config.mediaSwitch === "video"){
                        $("#mtAuthorPlayer").removeClass("camerahide");
                        $("#mtAuthorPlayer").css("left","0px");
                        $("#ht_camera_container").removeClass("move");
                    }else{
                        $("#mtAuthorPlayer").addClass("camerahide");
                    } 
                }
                    
            }
        },
        // 简易弹框
        popBox: function(html){
            var $tg = $("#pop_box");
            $tg.show();
            $tg.html(html);
        },
        // 滚动底部 
        scrollToBottom: function(type){
            var that = this;
            if(type === "chat"){
                $('.mod_chat_list').scrollTop($("#chat_hall").height());
            }else if(type === "question"){
                $('#question_hall').scrollTop($("#question_inner_hall").height());
            }
            return false;
        },
        // 滚动顶部
        scrollToTop: function(){
            var that = this;
            clearTimeout(that.defaults.setToptimer);
            that.defaults.setToptimer = setTimeout(function(){
                $(document).scrollTop(0);
            }, 300);
            return false;
        },
        // 公共提示标签
        showComtip: function (e, msg){
            var $t = e,
                that = this,
                pubtimer = that.pubtimer,
                $econ = $('#pop_tips');
            if(MT.getSDKMode() == 2){
                return false;
            }
            if($econ.size() == 0){
                $("body").append('<div id="pop_tips" class="mod_pub_tip"><p></p><span class="cner"></span></div>');
            }
            clearTimeout(that.pubtimer);
            if(!$t){
                return;
            }
            $econ.show();
            // 插入信息
            $econ.find("p").html(msg);
            // 隐藏
            pubtimer = setTimeout(function (argument) {
                $econ.find("p").html("");
                $econ.hide();
            }, 2000);
            // reset
            $econ.css({
                "left": $t.offset().left - $econ.width() + 40,
                "top": $t.offset().top - 35
            });
        },
        // 聊天公告
        chatNotify: function(notify){
            var $tg = $("#chat_hall");
            var msg = '<span class="notify">'+notify+'</span>';
            $tg.append(msg);
            this.scrollToBottom("chat");
        },
        // 淡出
        fadeOut: function(el, speed, flag){
            var h = 1;
            var t = setInterval(function(){
                h = h-0.1;
                $(el).css("opacity", h);
                if(h <= 0){
                    if(flag){
                        $(el).remove();
                    }else{
                        $(el).hide();
                    }
                    clearInterval(t);
                }
            }, speed);
        },
        setScrollerTop: function(){
            var $el = $("#mod_scroll_info"),
                _top = $("#nav").offset().top ;//- $el.height();
            if(MTSDK.isOrientation()){
                // TODOS...
                $el.css("top", "auto");
            }else{
                $el.css("top", _top);
            }
            return _top;
        },
        // 滚动通知
        rollNotice: function(data){
            var $tg = $("#mod_scroll_info .sc_info"),
                $el = $("#mod_scroll_info"),
                //_top = this.getScrollerTop(),
                d = data;
            clearTimeout(this.rollTime);
            if(d == "" || d.duration === 0){
                $el.hide();
                return false;
            }

            if(d.link.length == 0){
                $tg.html('<p>'+d.content+'</p>');
            }else{
                $tg.html('<p><a href="'+d.link+'" target="_blank">'+d.content+'</a></p>');
            }
            $el.addClass('showNotice').show();
        },
        
        // 关闭通知
        closeRollNotice: function(){
            $("#mod_scroll_info").removeClass('showNotice').hide();
        },

        // 插入公共广播
        renderBroadCast: function(){
            for (var i = 0; i < this.cmdBroadCast.length; i++) {
                var retval = this.cmdBroadCast[i];
                if(retval && retval.__auto == 1){
                    var notify = '公共广播：'+retval.message+";";
                    MTSDK.plugins.chatNotify(notify);
                }
            };
        },

        //送花公告
        flowerNotify: function(notify){
            var $tg = $("#chat_hall");
            var msg = '<div class="flower">'+notify+'</div>';
            $tg.append(msg);
            this.scrollToBottom("chat");    
        },
        
        // 监听自定义广播
        diyBroadcast: function(retval){
            var o = {
                message: retval.message,
                __auto: retval.__auto
            };
            var notify = '公共广播：'+retval.message+";";
                plugins.chatNotify(notify);
        },

        // CDN验证
        getCDNPath: function(res){
            if(window.TF_getStaticHost){
                return window.TF_getStaticHost(res);
            }else{
                return res;
            }
        },

        // 获取(设置)用户头像
        setAvatar: function(user){
            var that = this,
                _user = {},
                avaImgSrc = "",
                path = seajs.domain + "/open/cooperation/default/live-mobile-v2/css",
                imgSpadmin = path + "/img/spadmin.png",
                imgAdmin = path + "/img/admin.png",
                defaultAavtar = that.defaults.defaultAavtar,
                basePath = that.defaults.avaBasePath;

                // 判断是否传入role信息
                if(typeof user === "object"){
                    _user = user;
                }else if(typeof user === "string"){
                    _user.role = user;
                }

                if(_user.avatar){
                    user.avatar = that.getCDNPath(user.avatar);
                }

                // spadmin.超级管理员
                if(_user.role === "spadmin"){
                    // 管理员自定义头像
                    if(user.avatar){
                        avaImgSrc = user.avatar;
                    }else{
                        // avaImgSrc = defaultAavtar;
                        avaImgSrc = imgSpadmin;
                    }
                }
                // Admin.普通管理员
                else if(_user.role === "admin"){
                    // 管理员自定义头像
                    if(user.avatar){
                        avaImgSrc = user.avatar;
                    }else{
                        // avaImgSrc = defaultAavtar;
                        avaImgSrc = imgAdmin;
                    }
                }
                // Users.普通用户
                else{
                    // 设置avatar
                    if(user.avatar){
                        if(user.avatar.length > 0){
                            avaImgSrc = user.avatar;
                        }
                    }else{
                        avaImgSrc = defaultAavtar;
                    }
                }
                // 头像列表src
                if(this.avatarloaded){
                    if($(".avatar_"+user.uid).size() > 0){
                        $(".avatar_"+user.uid).attr("src", avaImgSrc);
                    }
                }
                return avaImgSrc;
        },

        //时间转换    
        chapterTimestamp: function(intDiff) {
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

        //Tmod模版辅助方法
        helper: function(){
            // 时间转换
            TMOD.helper("converTime", function(time){
                return plugins.second2HMS(time);
            });

            //章节时间转换
            TMOD.helper("chapterTime", function(time){
                return plugins.chapterTimestamp(time);
            });

            // 获取头像
            TMOD.helper("getAvatar", function(user){
                return plugins.setAvatar(user);
            });

             // 获取资源
            TMOD.helper("getResContent", function(data){
                return plugins.getCDNPath(data);
            });
        },

        // 初始化
        init: function(room, HTSDK){
            this.room = room;
            this._MT = HTSDK;
            this.binds();
        }
    };

    window.xx = plugins;

    // 暴露接口
    module.exports = plugins;

});

