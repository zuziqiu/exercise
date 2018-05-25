 /**
 * 房间模块
 */
"use strict";

define(function(require, exports, module){
	//别名包含整个路径
	var config = require("./global.config"),
	    camera = require("./camera"),
		tmod = require("TMOD"),
		vote = require("./vote"),
		set = require("./set"),
		plugins = require("./plugins"),
        reward = require("./reward"), // 打赏模块
	    class_preview =  require('./class_preview'),
		question = require("./question");
		
		
	//房间
	var room = {

		//在线人数
		total: 0,

		//isinit
		isinit: false,

		// 特殊用户
		robot: 0,

	    // 直播状态
		stateChange: function(flag){
			var that = this;
			switch(flag){
				// 开始
				case "start":
				 	$("#mod_mask").hide();
	                $("#mtAuthorPlayer").addClass("camerahide");
	                $("#mod_menu_head").show();
	                $("#voice_bg").show();
					camera.liveStart();
					break;
				// 停止
				case "stop":
				    /*if(typeof window.MT.title !== "undefined" && window.MT.title.length > 0){*/
				    $("#live_text").html("直播已结束");
				    /*} */	
				 	$("#mod_mask").show();
				 	$("#click_play").hide();
				 	$("#voice_bg").hide();
				 	$(".mask_bg").hide();
					break;
				// 等待
				case "wait":
				    /*if(typeof window.MT.title === "undefined"){*/
				 	$("#live_text").html("直播未开始");
				    /*}*/
				    $("#click_play").hide();
				 	$(".mask_bg").hide();
				 	$("#mod_mask").show();
					break;
			}
		},

		//设置身份名称
		setName: function ( modules ) {
			if( modules.mod_role_live ) {
				var spadmin_name = modules.mod_role_live.config.list.spadmin.name;
                var admin_name = modules.mod_role_live.config.list.admin.name;
                var user_name = modules.mod_role_live.config.list.user.name;
                config.role = {
                    user: user_name,
                    admin: admin_name,
                    spadmin: spadmin_name
                };
			}
		},

		// 踢出房间
		kick: function(retval) {
			// body...
			var tpl = tmod("mod_room_kick", retval);
			if(MT.me.xid == retval.xid){
				window.location.href = seajs.protocol+"open.talk-fun.com/open/maituo/mobile_error.html?var=4";
			}
			plugins.modMessage("kick", retval);
		},

		// 获取刷新URL
		reloadPage: function(){
			window.location.reload();
		},

		// 摄像头播放
		onCameraPlay: function(){
			var that = this;
			if(that.curMode){
				that.curMode.onCameraPlay();
			}
		},

		// 摄像头暂停
		onCameraPause: function(){
			var that = this;
			$("#click_play").show();
			// 兼容模式提示
			$(".mod_room_compatiable").show();
			// 暂停状态
			if(that.curMode){
				that.curMode.onCameraPause();
			}
		},

		// 视频状态
		onPlayerTimeUpdate: function(time){
			if(time > 0){
				$("#click_play").hide();
				// 兼容模式提示
				$(".mod_room_compatiable").hide();
			}
		},

		// 触发兼容模式
		launchCompatibleMode: function(){
			if(config.isCompatible){
				return false;
			}
			window.location.href += "&compatible=true";
		},


		//打开app启动页
		openPage: function(){
            var liveid = HTSDK.serverRoom.live.liveid;
            window.location.href = window.location.protocol+"//static-1.talk-fun.com/open/cooperation/launch_app/native.html?liveid="+liveid+"&access_token="+config.access_token+"&type=live";
        },

		//bindEvend
		bindEvend: function(){
			var that = this;

			//刷新
			$("body").on("touchend", ".reload", function(){
				that.reloadPage();
			});

			// 兼容模式
			$("body").on("click", ".launch_compatiable", function(){
				that.launchCompatibleMode();
			});

			 //app启动页面
            $("body").on("touchend", ".app_btn", function(){
                that.openPage();
            });

			// 兼容模式
			$("body").on("touchend", ".close_comptipop", function(){
				$(".mod_room_compatiable").hide();
			});

			// Tab切换
			$("#tab_video").on("touchend","",function(){ 
				  var change_status = $(this).data("change");
				  var status = $("#ht_camera_container").data("status");
				  if(change_status==undefined){
				  	  if(status == "start"){
				  	  	$("#mtAuthorPlayer").removeClass("camerahide");			
				  	  }else{
				  	  	$("#mtAuthorPlayer").addClass("camerahide"); 
				  	  }
				  }else if(change_status =="openvoice"){
				  		$("#mtAuthorPlayer").addClass("camerahide");
				  }else if(change_status =="openCamera"){
				  	 	$("#mtAuthorPlayer").removeClass("camerahide");
				  }
			});
			
			//设置
			$("body").on("touchend", ".set_icon", function(){
				set.addSetTemp();
				$("#set").show();
				$(".set_menu").show();
			});

			//左区域收缩
			$("#left_toggle").on("touchend", function(){
				var cw = $(".osimg").width(),
                	ch = $(".osimg").height();
				if($(this).hasClass("recover")){
					room.closeSetStyle();
					room.iphoneRest("close");
					room.isCloseSwitch(cw,ch);							
				}else{ 
					room.openSetStyle();
					room.iphoneRest("open")
					$("#mod_main_player").removeAttr("style");
					room.isOpenSwitch($("#room").width(),$("#room").height());	
												
				}
			});
			
			//加个cur 的类
			$(".ht_nav_list").on("touchend", "li", function(){
				$(this).addClass('selected').siblings().removeClass('selected');
				//liangh add 
				var type= $(this).data("type");
				switch(type){
					case "chat":
						$("#chat").show();
						$("#set").hide();
						$("#ask").hide();
						$("#tab_chat .c_num").hide();
						$(".h_opration").removeClass("hidden");
						room.clickOtherTab("chat");
						plugins.tabSwitch("chat");
						break;
					case "ask":
						$("#chat").hide();
						$("#set").hide();
						$("#ask").show();
						$("#q_ask .c_num").hide();
						question.getQuestionList();
						$("#pop_emotis").hide();
						$(".h_opration").removeClass("hidden");
						room.clickOtherTab("ask");
						plugins.tabSwitch("ask");
						break;	
				    case "set":
				    	$("#chat").hide();
						$("#set").show();
						$("#ask").hide();
						$(".set_menu").show();
						$("#pop_emotis").hide();
						$("#tab_set .c_num").hide();
						room.clickOtherTab("set");
						plugins.tabSwitch("set");
						set.addSetTemp();//设置模显示
						break;
					case "video":
					    $("#chat").hide();
						$("#set").hide();
						$("#ask").hide(); 
						$("#pop_emotis").hide();
						$(".h_opration").addClass("hidden");
						$("#ht_camera_container").removeClass("move");//恢复视频区域*/
						$("#mode_chat_post").removeClass("showemtion");
						room.clickOtherTab("video");
						plugins.tabSwitch("video");
						if(config.cameraStatue == "start"){
							if(config.mediaSwitch == "video"){
								$("#mtAuthorPlayer").removeClass("camerahide");	
							}
						}				
				}
				
			});
		},

		//展开时样式设置
		openSetStyle: function(){
			$("#left_toggle").addClass("recover");
			$(".mod_modules").addClass("close");
			$(".mod_modules").removeClass("open");
			$("#mod_menu").removeClass("open");
			$("#mod_menu").addClass("close");
			$(".h_opration .set_icon").hide();
			$(".mod_ppt_wrap").addClass("setcw");
		},

		//关闭时样式设置
		closeSetStyle: function(){
			$("#left_toggle").removeClass("recover");
			$(".mod_modules").addClass("open");
			$(".mod_modules").removeClass("close");
			$("#mod_menu").addClass("open");
			$("#mod_menu").removeClass("close");
			$(".h_opration .set_icon").show();
			$("#mod_main_player").removeAttr("style");
			$(".mod_ppt_wrap").removeClass("setcw");
		},

		//针对iphone白屏展开收缩作相应操作
		iphoneRest:function(s_statue){
			var u = navigator.userAgent;
			if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
				if($("#tab_video").hasClass("selected")){
					if(!config.switchFlag){
						if(s_statue == "close"){
							$("#ht_camera_container").css({
	                            width: $(".mod_modules").width(),
	                            height: $(".mod_modules").height()
                        	});
                        	$("#mtAuthorPlayer").css({
	                            width: $(".mod_modules").width(),
	                            height: "auto"
                        	});
						}else{
					    	$("#ht_camera_container").css({
	                            width: 1,
	                            height: 1
                        	});
                        	$("#mtAuthorPlayer").css({
	                            width: 1,
	                            height: 1
                        	});
						}
					}
					
				}
			}else{
				if(s_statue == "close"){
					$("#ht_camera_container").removeClass("moveout");
				}else{
				    $("#ht_camera_container").addClass("moveout");
				}
			}
		},

		//横屏时是否判断摄像头和ppt有切换
		isOpenSwitch: function(cw,ch){
			if(config.switchFlag){
				$("#mtAuthorPlayer").height($("#room").height());
                $("#mtAuthorPlayer").width($("#room").width()-20);
				$("#ht_camera_container").height($("#room").height());
                $("#ht_camera_container").width($("#room").width());
    			$("#mtAuthorPlayer").css("right",20);	
                $("#ht_camera_container").addClass("add_bg");
                $(".mod_ppt_wrap").hide();
			}else{
				$(".mod_ppt_wrap").width($("#room").width());
				$(".mod_ppt_wrap").height($("#room").height());
			    plugins.pptReset(cw,ch);	
			}
		},

		//恢复
		isCloseSwitch: function(cw,ch){	
			if(config.switchFlag){
				$("#ht_camera_container").removeClass("add_bg");
				$("#ht_camera_container").height($("#room").height());
                $("#ht_camera_container").width($("#room").width()*0.7);
                $("#mtAuthorPlayer").height($("#room").height());
                $("#mtAuthorPlayer").width($("#room").width()*0.7);
                $("#mtAuthorPlayer").css("right",0);
                $(".mod_ppt_wrap").show();
                plugins.pptReset(cw*0.3, ch);
                if(!$("#tab_video").hasClass("selected")){
                	$(".mod_ppt_wrap").hide();
                }else{
                	$(".mod_ppt_wrap").show();
                }
			}else{
				$(".mod_ppt_wrap").width($("#room").width()*0.7);
				$(".mod_ppt_wrap").height($("#room").height());
				plugins.pptReset(cw*0.7,ch);	
			}
		},

		//点击其它tab
		clickOtherTab: function(type){
			var _that = this,
				flag = config.switchFlag,
			    status = config.cameraStatue;
			if(plugins.isMobileStatus() == "horizontal"){
				$(".online_total").css("top",5);
			}
			//切换
			if(config.switchFlag){
				if(config.screenMode == 0){
					room.pptDownClick(type);
				}
				
				//中小屏模式
				if(config.screenMode== 1 || config.screenMode==2){
					room.scpptDownClick(type);
				}

			}else{
				//大屏模式
				if(config.screenMode == 0){
					room.pptUpClick(type);	
				}

				//中小屏模式
				if(config.screenMode== 1 || config.screenMode==2){
					room.scpptUpClick(type);
				}			
			}
		},


		//中小屏摄像头在下和PPT在上的情况下点击其它tab
		scpptUpClick: function(type){
			$(".online_total").removeClass("hidden");
			// 兼容模式
			if(config.isCompatible){
				return false;
			}
			//点击设置tab时
			if(plugins.isMobileStatus() == "vertical"){
				if(type == "set"){
					plugins.videoHide();
					if(plugins.isAndroid()){
						camera.cameraHide();	
					}
				}else{
					var cw = "50%";
					if(config.screenMode == 1){//中屏
					   cw = "50%";
					}else if(config.screenMode == 2){
					   cw = "30%";	
					}	
					if(plugins.isAndroid()){
						if(plugins.isMobileStatus() == "vertical"){
							if(config.isOpen){
								$("#ht_camera_container").css("width",cw);
								$("#mtAuthorPlayer").height($("#ht_camera_container").width()*0.75);
            					$("#mtAuthorPlayer").width($("#ht_camera_container").width());
							}else{
								camera.cameraHide();
							}
							
						}
						
					}
					//课件模式的情况下 
					if(config.currentMode == 0){

						if(config.cameraStatue == "start" && config.isOpen){
							plugins.videoShow();
						}
						
					}					
				}
			}else{
				room.pptUpClick(); 
				if(type == "video"){
					$(".h_opration").hide();
					$("#ht_camera_container").css({
	                    width:  $(".mod_modules").width(),
	                    height: "auto"
               		});
               		$("#ht_camera_container").removeClass("move");
					$("#mtAuthorPlayer").removeClass("camerahide");
				}else{
					$(".h_opration").show();
				}
			}
			
		},

		//中小屏摄像头在上时和PPT在下的情况下点击其它tab
		scpptDownClick: function(type){
			$(".online_total").removeClass("hidden");
			if(type == "set"){
				$(".mod_ppt_wrap").hide();
			}else{
				if(plugins.isMobileStatus() == "horizontal"){
					if(config.switchFlag && !$("#tab_video").hasClass("selected")){
						$(".mod_ppt_wrap").hide();
					}else{
						$(".mod_ppt_wrap").show();
					}
				}else{
					$(".mod_ppt_wrap").show();
				}
			}
		},

		//在摄像头在上和PPT下的情况下点击其它tab
		pptDownClick: function(type){
			var $pptWrap= $(".mod_ppt_wrap");
			var u = navigator.userAgent;
			if(type == "video"){
				$pptWrap.show();
				
				//重置PPT宽高
				$pptWrap.height($(".mod_modules").height());
	    		$pptWrap.width($(".mod_modules").width());
			 	plugins.pptReset($pptWrap.width(),$pptWrap.height());

			 	//大屏的情况下
				if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
					//todo...
				}else{
					if(config.screenMode == 0){
		                if(config.mediaSwitch == "audio" || config.cameraStatue != "start"){
		                   $("#mtAuthorPlayer").addClass("camerahide");
						   $("#ht_camera_container").removeClass("move");//移开视频区域
						   $(".voice_bg").show();
		                } 
	            	}
				}	
			}else{
			 	$(".h_opration .set_icon").show();
			 	$(".mod_ppt_wrap").hide();
			 	$(".online_total").css("top",5);
			}
		},

		//在摄像头在下和PPT在上的情况下点击其它tab
		pptUpClick: function(type){
			var u = navigator.userAgent;
			if(type !="video"){
				    $(".voice_bg").hide(); 
					$("#mode_chat_post").removeClass("showemtion"); 		
					$(".h_opration .set_icon").show();
					//iphone
					if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){	
						$("#ht_camera_container").css({
							width: 1,
							height: 1
						});
					}else{
						$("#mtAuthorPlayer").addClass("camerahide");
					    $("#ht_camera_container").addClass("move");//移开视频区域
					}
				    if(plugins.isMobileStatus()==="horizontal"){
				    	$(".h_opration").removeClass("hidden");
				    }
			}else{
				//大屏的情况下
				if(u.indexOf('iPhone') > -1 || u.indexOf('iPad')>-1){
					//todo...
					if(config.mediaSwitch == "audio" || config.cameraStatue != "start"){
						$(".voice_bg").show();
					}
					
				}else{
					if(config.screenMode == 0){
		                if(config.mediaSwitch == "audio" || config.cameraStatue != "start"){
		                   $("#mtAuthorPlayer").addClass("camerahide");
						   $("#ht_camera_container").removeClass("move");//移开视频区域
						   $(".voice_bg").show();
		                } 
	            	}
				}


			}
			$("#ht_camera_container").removeClass("moveout");
		},	


		//插入特殊用户
		SetRobot: function(list){ 
		    var total = room.total,
		        _nownum = 0;
		    if( list) {
		        _nownum = list;
		    }
		    var count = total + _nownum;
		    $("#total").text(count);
		},

		// 强制退出
		forceOut: function(user){
			if(MT.tools.isMobileSDK() && MT.getSDKMode() == 2){
				return user;
			}else{
				setTimeout(function () {
					window.location.href = seajs.protocol+"open.talk-fun.com/open/maituo/mobile_error.html?var=3";
				}, 400);
			}
		},

		//render
		render: function(){
			var that = this;
			that.bindEvend();
		},

		 // 特殊指令处理(聊天 )
	    specialCmd: function(cmd){
	        if(cmd){
	            switch(cmd){
	                case "admin:reload":
	                    window.location.reload();
	                    return true;
	            }
	        }
	    },

	     // 界面加载后执行
        onPlayerLoad: function(){
            plugins.rollNotice(window.MT.announce.roll);
        },

		// 加载模版
    	loadTemplate: function(callback){
    		var that = this;
	        // 优先加载
	        (function(win){
				
				// 模版加载
				var tplSource = seajs.baseConfig.templateUrl;
				
				// 加载模版依赖
	            $("#template_loader").load(tplSource, null, function(ret){
					
					room.render();
	            	config.isRender = true;
					
					// 动态插入pop弹窗
					var popTips = tmod("public_tips", {});
					var lottery = tmod("mod_lottery_con", {});
					var popReward = tmod("reward_pop",{});
					that.onPlayerLoad();
					$("body").append(popTips);
					$("body").append(lottery);
					$("body").append(popReward);
					class_preview.classIntroAsync('tplReady');
					
					//打赏初始化
					reward.init(); 
					var  str = '<div class="vote_mask_bg"></div>';
	   				$("body").append(str);
					$("#voice_bg img").attr("src", MT.zhubo.p_150);

					// 公共事件调用类
					that.globalInit();
					
					// 回调函数
					if(callback){
						callback();
					}
	            });
	        })(window);
	    },

		// 自动全屏提示
		autoFullScreenPop: function(){

			// 当前在兼容模式下 || 桌面分享情况
			if(config.isCompatible || config.currentMode == 2){
				config.isShowCompatible = false;
				return false;
			}

			// 微信 || QQ浏览器 -> 进入
			if(plugins.isWechat() || plugins.isQQBrowser() || plugins.isIos()){
				// config.isShowCompatible = false;
				var isCanRun = false;
				// 逻辑：要求系统版本在 (ios10+ || Android 5.1+) 执行以下操作
				if(plugins.getPlatformInfo().partform === "android"){
					isCanRun = true;
				}else if(plugins.getPlatformInfo().partform === "ios" && plugins.getPlatformInfo().version > 10){
					isCanRun = true;
				}
				
				// 弹出提示窗
				if(isCanRun){
					var pop = tmod("mod_room_compatiable_mode", {});
					$(".mod_modules").append(pop);
					$(".mod_room_compatiable").find(".show_"+plugins.getPlatformInfo().partform).show();
					config.isShowCompatible = true;
				}
			}
			
			// 当前处在兼容模式 || 桌面分享
			/*else if(config.isCompatible || config.currentMode == 2){
				config.isShowCompatible = false;
				return false;
			}*/
			else{
				config.isShowCompatible = false;
			}
		},

		// 公共方法调用
		globalInit: function(){
			// 全屏弹窗提示
			// this.autoFullScreenPop();
		},
		
		// tools
	    tools: null,

		// 房间模式初始化
		roomModeDispatch: function(){
			/**
			 * 目前提供3种模式
			 * 1、上下摄像头大模式
			 * 2、摄像头中，小模式
			 * 3、单摄像头模式
			 * ⚠️注意：摄像头切换同时影响ppt,桌面分享,纯音频模式
			 */
			var that = this;

			//保证只初始化一次
			if(!room.isinit){
				// 模式差异
				that.curMode = null;
				switch(config.screenMode){
					// 模式 => 1
					case config.static.ROOM_MODE_0:
						var modeView_1 = require("./room.mode_view_1");
						modeView_1.init();
						that.curMode = modeView_1;
						break;
					
					// 模式 => 2
					case config.static.ROOM_MODE_1:
						var modeView_2 = require("./room.mode_view_2");
						that.curMode = modeView_2;
						break;

				    case config.static.ROOM_MODE_2:
						var modeView_2 = require("./room.mode_view_2");
						that.curMode = modeView_2;
						break;		

					// 模式 => 3
					case config.static.ROOM_MODE_3:
						var modeView_3 = require("./room.mode_view_3");
						that.curMode = modeView_3;
						break;
				}
				that.isinit = true;

				return that.curMode;
			}else{
				return that.curMode;
			}
			
		},

        //入口
        init: function(HTSDK){
            var that = this;

            that.MT = window.tools;
			that.HT = HTSDK;
			// 兼容模式配置
    		if(config.isCompatible){
				$(".mod_modules").addClass("compat");
			}
			// 加载模版
			that.loadTemplate(function(){
				// 初始化房间模式
				that.roomModeDispatch();
			});

            // 只加载一次
            if(this.initLoaded){
                return false;
            }

            var that = this,
                degs = window.orientation;

            // It Must Be run once...
            var flag = that.getOrientationTarget(degs);
            that.addListen();

            this.initLoaded = true;          
        },

        // 屏幕旋转状态
        getOrientationTarget: function(degs){
            var o = degs || window.orientation || 0,
                flag = null;
            switch(o){
                case 0:
                case 180:
                    flag = "vertical";
                    break;
                case 90:
                case -90:
                    flag = "horizontal";
                    break;
            }
            return flag;
        },

        //监听尺寸变化
        addListen: function(){
            var that =  this;

           that.ispcResize();

            // when the page init run reset.
            this.checkViewReset();

            // Resize all Device
            window.addEventListener("orientationchange", function(){
                that.checkViewReset();
            }, false);

            window.addEventListener("resize", function(){
                that.checkViewReset();
            }, false);
        },

        //检测屏幕尺寸变化
        checkViewReset: function(){
            var that = this;
            $(".set_menu").hide();  
            var degs = window.orientation;
            var type = that.getOrientationTarget(degs);

			// rotation 一致的情况
            if(type === that.rotationType){
                return false;
            }

            // 设置延迟reset
            if(that.resizeTimer){
                clearTimeout(that.resizeTimer);
			}

			// vertical / horizontal
            that.resizeTimer = setTimeout(function() {
				if(type === "vertical"){
					that.roomModeDispatch().vertical();
				}else if(type === "horizontal"){
					that.roomModeDispatch().horizontal();	
					
				}
				config.rotation = type;
				vote.closePreview();
            }, 100);
        }, 

        //是否转屏
	    ispcResize: function(){
	    	var that = this;
	        // return true;
	        var orientation = parseInt(window.orientation, 10) || 0,
	            __width = document.body.clientWidth,
	            __height = window.screen.height;
	        if(__width > __height){
				//todo...
				that.roomModeDispatch().horizontal().cameraRight();
	        }else{
				//todo...
	        }
	    },

	    //是否显示app跳转按钮
	    isShowAppIcon: function(modules){
	    	if(modules.mod_app_watch_live){
	    		if(modules.mod_app_watch_live.enable == 1){
	    			$("#app_btn").show();
	    			$(".ht_nav").addClass("showApp");
	    		}	
	    	}
	    }
	};
	module.exports = room;
});