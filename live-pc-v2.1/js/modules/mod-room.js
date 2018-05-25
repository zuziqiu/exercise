/**
 * room 房间控制核心
 */
(function(win){
	
	// 房间
	var room = {
	    liveTimer: null,
	    defaults: {
	        avaBasePath: "",
	        currentMode: 0, //默认课件模式
	        tipTime: null,
	        state: "wait", //wait:未开始,start:开始,out:超时
	        live_status: 'wait',
	        d_time: 0,//距上课的时间  
	        out_time: 0,//超出的时间  
	        total_time: 0,//课程总时间
	        defaultAavtar: protocol +"static-1.talk-fun.com/open/cooperation/default/live-pc/css/img/main/user.png",
	        assistantAavtar: protocol +"static-1.talk-fun.com/open/cms_v2/css/common/portraits/admin_4.png"
	    },
	    roomSet: [],
	    // SDK: _HT对象 
	    _HT: null,
	    // getSDK.fun
	    getSDK: function(){
	        return this._HT;
	    },
	    // 调试模式
	    isDebug: function(){
	        var flag = (window.location.href.indexOf("sdkVersion=test")) > -1 ? true : false;
	        return flag;
	    },

	    //头像url支持https
	    detectProtocol: function(url){
	        return url.replace('http://', window.location.protocol + "//");
	    },

	    //分组
	    isGroups: function(gid){
	        if(MT.me.gid && gid != 0){
	            if(MT.me.gid == gid){
	                return true;
	            }else{
	                return false;
	            }
	        }else{
	            return true;
	        }
	    },

	    //课程进度
	    classState: function(course){
	        var that = this;
	        that.defaults.d_time = course.start_time-course.srvTime;//距上课时间
	        that.defaults.out_time =course.srvTime - course.end_time;//超出时间
	        that.defaults.total_time = course.end_time - course.start_time;//课程总时间
	        //显示进度条和倒计时
	        $(".live_distance").show();
	        $("#live_progress").show();

	        //进入房间 未开始 距离上课时间还有多久srvTime
	        if(that.defaults.d_time>0){
	            that.defaults.state = "wait";
	            $("#live_distance_title").html("距离课程开始还有:");
	            $("#distance_time").addClass("wait");
	            HTSDK.tools.setTimer(that.defaults.d_time);
	        }
	        //进入房间已开始 服务器计算当前已上课多久
	        else if(that.defaults.d_time<= 0 && that.defaults.out_time<=0){
	            that.defaults.state = "start";
	            HTSDK.tools.setTimer(course.end_time-course.srvTime);
	            $("#live_distance_title").html("距离课程结束还有:");
	        }

	        //上课结束拖堂 显示超出时间
	        else if(that.defaults.out_time>0){
	            that.defaults.state = "out";
	            HTSDK.tools.setTimer(that.defaults.out_time);
	            if($("#distance_time").html().length>0 && MT.getLiveState() =="start"){
	                $("#live_distance_title").html("课程已超时:");
	                $("#live_progress").show();
	            }else{
	                $("#live_progress").hide();
	            }
	            
	            $("#distance_time").addClass("out");
	            if(MT.getLiveState() != "start"){
	                window.clearInterval(HTSDK.room.liveTimer);
	            }
	        }
	    },

		
	    //上课的进条
	    liveProgress: function(){

	        //进度条总宽度
	        var that = this;
	        //直播末到时间
	        if(HTSDK.room.defaults.state === "wait"){
	            that.liveWait();
	        }
	        //直播已开始        
	        else if(HTSDK.room.defaults.state === "start"){
	            that.liveStart(); 
	        }
	        //直播超时
	        else if(HTSDK.room.defaults.state === "out"){
	            that.liveOut();
	        }

	    },


	    //等待直播
	    liveWait: function(){
	    	$("#distance_time").addClass("wait");
	       //当前时间和开始时间相等
	        if(HTSDK.room.courseMsg.srvTime-HTSDK.room.courseMsg.start_time == 0){
	        	setTimeout(function(){
	        		HTSDK.room.defaults.state = "start";
		            window.clearInterval(HTSDK.room.liveTimer);
		            var end = HTSDK.room.courseMsg.end_time - HTSDK.room.courseMsg.start_time;
		            HTSDK.tools.setTimer(end);
	        	},1000);   
	        }
	    },


	    //直播中
	    liveStart: function(){
	    	var that = this;	
	    	$("#distance_time").removeClass("wait");
	        //算出从直播开始到当前所走的时间
	        var p = (HTSDK.room.courseMsg.srvTime-HTSDK.room.courseMsg.start_time)/that.defaults.total_time;
	        var live_precent = p*100+"%";
	        $("#live_distance_title").html("距离课程结束还有:");
	        //课程进度百分比
	        $("#pro_percent").width(live_precent);
	        var outTime =  HTSDK.room.courseMsg.srvTime - HTSDK.room.courseMsg.end_time;
	        if(outTime >= 0){
	        	setTimeout(function(){
	        		if(MT.getLiveState() === "start"){
	                    HTSDK.tools.setTimer(outTime);
	                    HTSDK.room.defaults.state = "out"; 
		            }
	        	},1000);      
	        }
	    },

	    //直播超时
	    liveOut: function(){
	    	//超时时间
	        $("#live_distance_title").html("课程已超时:"); 
	        $("#pro_percent").width("100%");
	        $("#distance_time").addClass("out");
	    },

	    // 是否管理员
	    isAdmin: function(role){
	        var _role = role || MT.me.role;
	        if(_role){
	            if(_role === "admin" || _role === "spadmin"){
	                return true;
	            }else{
	                return false;
	            }
	        }
	    },
	    //房间模块设置
	    roomSetMsg: [],
	    //课程信息
	    courseMsg: [],
	    //网络状态
	    oneStyle : true,
	    // set volume
	    setVolume: function(volume){
	        HTSDK.player.setVolume(volume);
	        HTSDK.liveCamera.setVolume(volume);
	    },
	    //loding
	    loading: function(){
	        var defaults = 0;
	        var max = -780;
	        var loadTimer = setInterval(function(){
	            $('#mod_mask').animate({
	                "background-position-y": defaults
	            }, 0, function(){
	                defaults -= 60;
	                if(defaults === max){
	                    $('#mod_mask').stop();
	                    defaults = 0;
	                    $("#mod_mask").css('background-position-y',"0");
	                }
	            }); 
	        },60);        
	    },

	    // CDN验证
	    getCDNPath: function(res){
	        if(window.TF_getStaticHost){
	            return window.TF_getStaticHost(res);
	        }else{
	            return res;
	        }
	    },

	    // 问答列表助教头像错误绑定
	    assistantImgError: function(img){
	        // 获取CDN资源
	        var src = this.getCDNPath(this.defaults.assistantAavtar);
	        img.src = src;
	    },

	    // 图片错误绑定
	    imgError: function(img){
	        // 获取CDN资源
	        var src = this.getCDNPath(this.defaults.defaultAavtar);
	        img.src = src;
	    },

	    // 获取(设置)用户头像
	    setAvatar: function(user){
	        var that = this,
	            _user = {},
	            avaImgSrc = "",
	            path = protocol + window.TALKFUN_STATIC_HOST + "/open/cooperation/default/live-pc/css",
	            imgSpadmin = path + "/img/main/spadmin.png",
	            imgAdmin = path + "/img/main/admin.png",
	            imgHonorguest = path+"/img/main/guest.png",
	            defaultAavtar = that.defaults.defaultAavtar,
	            basePath = that.defaults.avaBasePath;
	        
	        // 替换path
	        path = this.getCDNPath(path);
	        defaultAavtar = this.getCDNPath(defaultAavtar);

	        // 判断是否传入role信息
	        if(typeof user === "object"){
	            _user = user;
	        }
	        
	        // 有头像
	        if(_user.avatar){
	            _user.avatar = this.getCDNPath(_user.avatar);
	            avaImgSrc = _user.avatar;
	        }else{
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
	            /*// honorguest.嘉宾
	            else if(_user.role === "honorguest"){
	                // 管理员自定义头像
	                if(user.avatar){
	                    avaImgSrc = user.avatar;
	                }else{
	                    avaImgSrc = imgHonorguest;
	                }
	            }*/
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
	        }
	        // 头像列表src
	        if(this.avatarloaded){
	            if($(".avatar_"+user.uid).size() > 0){
	                $(".avatar_"+user.uid).attr("src", avaImgSrc);
	            }
	        }
	        avaImgSrc= that.detectProtocol(avaImgSrc);
	        
	        return avaImgSrc;
	    },
	    // 管理员渲染
	    // 嘉宾身份判断
	    adminRender: function(){
	        var isAdmin = (MT.me.role === "admin" || MT.me.role === "spadmin"),
	            vip = MT.me.role === "honorguest";
	        if(isAdmin){
	            //$('.ppt_preview').show();
	            $(".voice_selector .cur_mode").addClass("admin");
	            //抽奖 #管理盒子
	            $('.admin_box').show();
	            //$('.adminSpeak').show();
	        }/*else if(vip){
	            // todo...
	            // 添加一个按钮
	            // 看下语音云初始化模式
	            $('.guestSpeak').show();
	        }*/
	        else{
	            $(".mic_control").remove();
	            $(".mic_operation").remove();
	            $(".cls_hands").remove();
	            $('.ppt_preview').remove();
	        }
	        $(".select_mic").fadeIn(100);
	    },
	    // 清除信息
	    clearHall: function(){
	        $("#mod_ques_scroller").html("");
	    },
	    // 直播状态改变
	    liveChange: function(action, title){
	        var _title = title || MT.title,
	            _lvTxt = null,
	            that = this,
	            action = MT.getLiveState() || action,
				$preview = $("#mod_live_preview");   

	        // 鲜花初始化
	        HTSDK.plugins.flower.init();
	        HTSDK.room.live_status = action;
			HTSDK.view.currentMode = 0;
			
			// 清空flash-layer
			$("#mod_swf_holder").remove();

	        if(action === "start"){
	            $("#call_list").empty();
	            $(".call_btn").removeClass("disabled");
	             // 清除课程预告倒计时
	            if(HTSDK.classPreview.timer){
	                window.clearInterval(HTSDK.classPreview.timer);
	            }
	        }else{

	            $(".call_btn").addClass("disabled");
	            $(".switch_preview").hide();
	            if(action === "stop"){
	                $("#call_start").removeClass("call_ing").addClass("call_end");
	                $(".status_text").hide();
	                $("#countdown").html($(".call_time span").html());
	                clearInterval(MTSDK.admin.callName.timer);

	            }
	        }
	        // start
	        if(action === "start"){
	            $preview.removeClass('end_play_v2');
	            $preview.removeClass('init_type');
	            $preview.fadeOut(100);
	            $("#lv_state").hide();
	            $(".tools_toggle_network").removeClass("hidden");
	            clearInterval(HTSDK.room.tipTime);
	            $("#live_title").html(_title).fadeIn(100);
	            $("#live_title").fadeIn(100)
	            this.liveDuration();
	            $('.tools_toggle_netprompt').show();
	            // 加载问答
				console.log(HTSDK.modQuestion.defaults.quesRender)
	            if(!HTSDK.modQuestion.defaults.quesRender){
	                //that.clearHall();
	                HTSDK.modQuestion.getQuestionList();
	            }

	            that.stopEmptyRecord('start');
	            // 上课后清除计时器
	            // that.liveStopkick(action);

	        }
	        // wait
	        else if(action === "wait"){
	            _lvTxt = "未开始";
	            //非课程
	            if(!HTSDK.classPreview.isClass){
	                $preview.fadeIn(100);
	            }
	            $(".tools_toggle_network").addClass("hidden");
	            $('.tools_toggle_netprompt').hide();
	            $("#live_title").hide().html(_lvTxt);
	            $("#lv_state").show().html(_lvTxt);
	            $("#ques_load_more").hide();
	            this.liveDuration(-1);
	            $preview.removeClass('end_play_v2').addClass('init_type')
	            // Wait暂不处理
	            // that.liveStopkick(action);

	        }
	        // stop
	        else if(action === "stop"){
	            _lvTxt = "已结束";
	            that.stopEmptyRecord('stop');
	            $(".tools_toggle_network").addClass("hidden");
	            //去掉添加的ppt图片
	            $preview.removeAttr("style").removeClass('has_diy');
	            $preview.removeClass('init_type').addClass('end_play_v2')
	            $("#lv_state").show().html(_lvTxt);
	            $("#live_title").hide().html(_lvTxt);
	            this.liveDuration(-1);
	            $('.tools_toggle_netprompt').hide();
	            $("#ques_load_more").hide();
	            //ppt 预览
	            $('.ppt_preview').hide();
	            //小班主播状态停止后
	            HTSDK.liveCamera.liveStatus("stop");
	            /*if( MT.tools.in_array(window.partner_id, whiteList)){
	                if( window.modules_config.mod_score.enable == "1"){
	                    $(".pop_score_con").show();
	                }
	            }*/
	            //评分
	            var _mod_score = HTSDK.modules.get("mod_score").enable,
	                _mod_score_is = HTSDK.modules.get('mod_score').config.visible.enable;
	            if(_mod_score == "1" && _mod_score_is == "1"){
	                $(".pop_score_con").show();
	            }
	        }else if( action === "wait" || action === "start"){
	            //当是等待或者开始的时候
	            /*if( MT.tools.in_array(window.partner_id, whiteList)){
	                if( window.modules_config.mod_score.enable == "1"){
	                    $(".pop_score_con").hide();
	                }
	            }*/
	            var _mod_score_is = HTSDK.modules.get('mod_score').config.visible.enable;
	            if(_mod_score_is == "1"){
	                $(".pop_score_con").hide();
	            }
	        }
	    },

	    // 半小时后清空聊天问答记录
	    _recordTime: null,
	    stopEmptyRecord: function(style){
	        var total = 1800 * 1000,
	            that = this;
	        // 上课
	        if(style === "start"){
	            if(that._recordTime){
	                clearTimeout(that._recordTime) ;
	            }
	        }
	        // 下课
	        else if(style === "stop"){
	            that._recordTime = setTimeout(function(){
	                $('#mod_chat_hall').html('');
	                $('#mod_questions_con').html('');
	            }, total);
	        }
	    },

	    // 广播指令
	    instructionBroadcast: function(msg){
	        // todo
	    },
	    
	    //课程不一致踢出
	    isCourseSame : function(){
	        //window.location.href = 'http://open.talk-fun.com/error.html?var=4';
	    },

	    //ppt 显示
	    pptShowSet : function(msg){
	        HTSDK.view.currentMode =  msg;
	        if(MTSDK.admin.isAdmin()){
	            if( msg == 2 ){
	                $('.ppt_preview').hide();
	            }else {
	                if(HTSDK.footer.pptIsShow) {
	                    $('.ppt_preview').show();
	                }
	            }
	        }
	    },
	    //课程结束错误
	    courseError : function(data) {
	        var msg = data.msg || '该课程已结束，请重新选择...';
	        /*$('.mask_pic').addClass('cs_er');*/
	        $("#left_mask .mask_con").remove();
	        /*$('#mod_mask').addClass('course_error').find('em').text(msg);*/
	    },

	    // 下课后1小时, 所有人自动退出房间
	    // 再次上课清除计时器
	    _kictTime: null,
	    liveStopkick : function(action){
	        var expDuration = 3600 * 1000,
	            that = this;
	        // that._kictTime = null;
	        // 上课
	        if(action === "start"){
	            if(that._kictTime){
	                clearTimeout(that._kictTime);
	            }
	        }
	        // 下课
	        else if(action === "stop"){
	             that._kictTime = setTimeout(function(){
	                //window.location.href = 'http://open.talk-fun.com/error.html?var=1&from=PC';
	            }, expDuration);
	        }
	    },
	    // 设置当前直播时间
	    liveDuration: function(_time){
	        var second = _time || MT.liveDuration,
	            time = 0,
	            $tg = $("#live_time"),
	            timer = null;
	        clearInterval(this.dtimer);
	        if(typeof second !== "undefined" && second >= 0){
	            this.dtimer = setInterval(function(){
	                time = MT.tools.formatTime(second);
	                $tg.html("已直播 "+time+" 分钟");
	                second += 1;
	            }, 1000);
	        }else{
	            MT.liveDuration = -1;
	            $tg.html("");
	            return false;
	        }
	    },
	    // 检测是否安装Flash
	    checkFlash: function(){
	        var check = HTSDK.tools.SDKTOOLS.flashChecker(),
	            $wrap = $(".mod_main_player_wp");
	        if(check.flash){
	            return;
	        }else{
	            $wrap.append('<p class="no_flash">直播课堂需要FLASH支持, 请<a target="_blank" href="http://www.adobe.com/go/getflashplayer">下载安装或点击"允许插件"</a></p>');
	        }
	    },

	    //直播页加载超过15s提示
	    loadTime: function(){
	        var time = 0;
	        HTSDK.room.tipTime = setInterval(function(){
	            time++;
	            if(time > 15){
	                var tipMsg = '<div class="tipMsg"><p>FLASH已过期，可<a href="https://get.adobe.com/cn/flashplayer/?no_redirect">升级Flash</a>或更换<a href="http://browser.qq.com/?adtag=SEM1">QQ浏览器</a>观看</p></div>';
	                $("body").append(tipMsg);
	                $(".tipMsg").fadeIn(1000);
	                clearInterval(HTSDK.room.tipTime);
	            }
	        },1000);
	    },

	    // 已创建房间.(SDK:_HT 对象创建完成)
	    SDKReady: function(){
	        // admin 加载器
	        MTSDK.admin.init(this._HT);
	        HTSDK.plugins.isGlobalLoad = true;
	        HTSDK.plugins.renderBroadCast();
	    },

	    roomLoaded: false,
	    
	    // 获取sdk
	    getSdk: function(){
	        return this._HT;
	    },
	    //弹幕按钮
	    danmakuSwitch : function(type){
	        
	        var danmak = $('#danmaku_opt');

	        if(type === '1'){
	            danmak.show();
	        }else {
	            danmak.hide();
	        }
	    },
	    // 房间加载完成执行
	    roomLoadSucess: function(_HT){
	        if(!this.roomLoaded){
	            this._HT = _HT;
				HTSDK.voice._HT = _HT;

	            if(HTSDK.privateChat){
	                HTSDK.privateChat.HT = _HT;
				}

				// 三级合作方
				// var arr = [20, 11254, 11429, 11408];
				// 助教隐藏设置按钮
				if (HTSDK.room._HT.getMtData().user.role === "admin") {
					$("#set_vote").hide();
				}

	            this.SDKReady();
	            HTSDK.controller.onRoomLoaded();
	            this.roomLoaded = true;
	            
	            // 模块设置渲染执行入口
	            if(HTSDK.live){
	                HTSDK.live.init();
	            }

	            // 语音云模块绑定
	            HTSDK.voice.bindEvents();
	            
	            //小班初始化
	            HTSDK.liveCamera.onExecute();

	            // 网络状态
	            HTSDK.room.networkStatus(0,0);
	            
	            //替换
	            HTSDK.room.replaceName();
	            //iframe
	            //测试
	            /* if(window.thirdPage){
	                var _thirdPage = JSON.parse(window.thirdPage);
	                if(_thirdPage.url){
	                    var _iframeHtml = '<iframe src="'+_thirdPage.url+'" id="liveIframe-third"></iframe>';
	                    $('body').append(_iframeHtml);
	                }
	            } */
	            //15s提示未加载弹框
	            if(MT.getLiveState() === "start"){
	                 HTSDK.room.loadTime();
	            }  
	        }
	    },

	    //超过半小时半小时状态
	    popStateTimer: null,
	    popStatus: function(status){
	        var that = this;
	        var time  = 1800 * 1000;
	            if( status == "stop" || status == "wait" ){
	                if( $("#show_status_layer").size() < 1 ){
	                    var tpl = template("pop_status_layer");
	                        $("body").append(tpl);
	                    }
	            }
	            if( status == "stop" ||  status == "wait"){
	                that.popStateTimer = setTimeout(function(){
	                    $("#show_status_layer").show();
	                    $("#mod_member_list").html("");
	                }, time);
	                $(".status_sure").on("click",function(){
	                    that.closeWindow();
	                });
	            }
	            if( status == "start"){
	                if(that.popStateTimer){
	                    clearTimeout(that.popStateTimer);
	                }
	                $("#show_status_layer").hide();
	            }
	    },

	    //页面关闭或者跳转方法
	    closeWindow: function(){
	        var userAgent = navigator.userAgent;
	        if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("WebKit") != -1) {
	            window.location.replace("about:blank");
	            window.close(); 
	        }else{
	            window.opener = null;
	            window.open("", "_self");
	            window.close();
	        }
	    },

	    //域名白名单
	    vipUrl: function(){
	        var arr = ['zeyoit','talk-fun'];
	        var objStr = window.document.domain.split(".")[1];

	        var i = arr.length; 

	        while(i--) {  
	            if (arr[i] === objStr) {  
	                return true;  
	            }  
	        }  
	        return false;  
	    },

	    // 加载模版
	    loadTemplate: function(callback){
	        var that = this;
	        // 优先加载
	        (function(win){
	            // 模版加载...
	            var cross = window.location.href.indexOf("cross") > 0,
	                tplSource = "";
	            if(that.vipUrl()){  
	                tplSource = window.TF_getStaticHost(window.coreTpl);
	            }else{
	                tplSource = "tpl/modules.html";
	            }

	            if(cross){
	            	tplSource = tplSource.replace(/static-[0-9]/, "open");
	            }

	            $("#template_loader").load(tplSource, null, function(){
	                HTSDK.room.templateLoad = true;
	                if(typeof callback === "function"){
						callback(this);
	                    // 暖场
	                    if(HTSDK.videoprivew){
	                    	HTSDK.videoprivew.defaults.isTmepLoadEnd = true;
	                	}
	                    // 私聊初始化
	                    if(HTSDK.privateChat){
	                        HTSDK.privateChat.init();
	                    }
	                }
	            });
	        })(window);
	    },

	    //网络状态
	    networkStatus: function(speed,type){
	        /**
	         * == status ===
	         * @0: 正常
	         * @1: 一般
	         * @2: 卡顿
	         */
	        var $prompt = $('.tools_toggle_netprompt .focus_pro'),
	            curClass = "tools_toggle_netprompt",
	            netSpeed = $('.net_speed');
	        // fortest
	        var isDebug = HTSDK.tools.SDKTOOLS.isShowDebug();
	        if(isDebug){
	            $("#live_tools").find(".tools_toggle_netprompt").show();
	        }
	        if(typeof speed === "undefined"){
	            speed = 0;
	        }
	        //加载完第一次隐藏
	        if(HTSDK.room.oneStyle){
	            netSpeed.hide();
	            $prompt.css('width','62px');
	            HTSDK.room.oneStyle = false;
	        }else {
	            netSpeed.show();
	            $prompt.css('width','120px');
	        }
	            
	        if(speed < 1024){
	            netSpeed.text(speed + 'KB/s');
	        }else {
	            netSpeed.text(Math.floor(speed / 1024)+'MB/s');
	        }

	        if(type == 1){
	            $prompt.find('.pro_font').text('网络一般');
	            curClass = 'tools_toggle_netprompt'+' delay';
	            $prompt.parent().attr('class',curClass);
	        }else if(type == 2){
	            $prompt.find('.pro_font').text('网络较差');
	            curClass = 'tools_toggle_netprompt'+' verydelay';
	            $prompt.parent().attr('class',curClass);
	        }else {
	            $prompt.find('.pro_font').text('网络良好');
	            curClass = "tools_toggle_netprompt";
	            $prompt.parent().attr('class',curClass);
	        }
	    },

	    //匹配房间主讲人
	    replaceName: function(){
	        if(MT.tools.in_array(window.partner_id, zhiPin)){
	            $(".show_adchat span").html("只看主讲人的聊天");
	        }
	    },

	    // getter
	    roomGetter: function(){
	    	var info = "当前JS-SDK版本号:" + window.sdkVersion +"\n";
	    	info += "当前直播页版本:" + "v2.0";

	    	if(window.location.href.indexOf("getVersion=true") > -1){
	    		alert(info);
	    	}
		},
		//离开直播间二次提示
		beforeUnload : function(){
			$('#mod_col_main').on('click', '#mod_leave_room', function (e) {
				var goOut = win.confirm("确认要离开当前直播页吗？");
				if (!goOut){
					e.preventDefault();
				}
			})
		},
		

	    // 初始化执行
	    init: function () {
			var that = this;
	        this.loadTemplate(function(tpl){
	            
	            // DOM加载结构 & 绑定模块
	            HTSDK.view.init(function(){
	                HTSDK.cmd();
	            });

	            // 关键字查询
	            MTSDK.admin.bindKeywork.init();
				HTSDK.controller.initModules();
				
				// 离开直播间提示
				that.beforeUnload();
	        });
	        this.roomGetter();
	    }
	};
	
	// 暴露
	var HTSDK = win.HTSDK || {};
	HTSDK.room = room;

})(window);
