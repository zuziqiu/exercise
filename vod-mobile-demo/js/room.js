/**
 * 房间模块
 * room.js 模块作为主分发器
 * 分发到各个 mode(模式) 处理
 */
"use strict";
define(function(require, exports, module){
	
	// 别名包含整个路径
	var config = require("./global.config"),
	    tmod = require("TMOD"),
		modCamera= require("./camera"),
		SLY = require("sly"),
		set = require("./set"),
		plugins = require("./plugins"),
		question = require("./question"),
		chat =  require("./chat"),
		tools = require("./tools"),
		PPT = require("./ppt"),
		horizontal = require("./room.horizontal"),
		chapter = require("./chapter");

	//房间
	var room = {
		// load
		changeload: false,
		
		// 在线人数
		total: 0,
		
		// 初始化一次
		isinit: false,

		//直播id
		liveid: "",
		
		// 特殊用户
		robot: 0,

		//偶数时间
		oddTime: 0, //时间

		//奇数时间
		evenTime: 1, //奇数时间
		
		// 旋转
		rotationType: null,
	    
		// 直播状态
		stateChange: function(flag){
			var that = this;
			switch(flag){
				// 开始
				case "start":
				 	$("#mod_mask").hide();
	                $(".mask_bg").hide();
	                $("#mtAuthorPlayer").addClass("camerahide");
	                $("#mod_menu_head").show();
					break;
				
				// 停止
				case "stop":
				    if(typeof window.MT.title !== "undefined" && window.MT.title.length > 0){
				    	$("#live_text").html("直播已结束");
				    }
				 	$("#mod_mask").show();
				 	$("#click_play").hide();
				 	$("#voice_bg").hide();
				 	$(".mask_bg").show();
					break;
				
				// 等待
				case "wait":
				    if(typeof window.MT.title === "undefined"){
				 		$("#live_text").html("直播未开始");
				    }
				    $("#click_play").hide();
				 	$("#mask_bg").show();
				 	$("#mod_mask").show();
					break;
			}
		},

		// 暂停
		pause: function(){

		},

		// duration update
        timeUpdate: function(currentTime){
            var that = this;
			
			// 取 1.99 => 1 向上兼容
			currentTime = Math.floor(currentTime);

			// 大于 1 开始播放(某些浏览器先播放1秒然后暂停, 多数浏览器必须物理点击播放)
            if(currentTime > 0){
            	/*alert(that.vodInfo.duration);*/
				if(currentTime%2 == 1){
					room.oddTime = currentTime;
				}else{
					room.evenTime = currentTime;
				}
				//判断时间是否走动	
				if(room.oddTime === room.evenTime){
					$("#click_play").show();
					return;
				}		

				// 播放结束
                if(currentTime === that.vodInfo.duration){
					$("#click_play").show();
					return;
				}

				
				// render view.
                $("#click_play").hide();
                $(".mod_room_compatiable").hide();
                $("#btn_pp").removeClass("pause");
                $("#load_mask").hide();
                
				// 为了处理无缝开启, 打开摄像头延迟1s
                if(config.cameraStatue === "start"){
                    if(!modCamera.openTimer){
                        modCamera.openTimer = setTimeout(function(){
                            modCamera.cameraShow();
                        }, 1000);
                    }
                }
            }
        },


		// 踢出房间
		kick: function(retval) {
			// body...
			var tpl = tmod("mod_room_kick", retval);
			if(MT.me.xid == retval.xid){
				window.location.href = seajs.protocol + "open.talk-fun.com/open/maituo/mobile_error.html?var=4";
			}
			plugins.modMessage("kick", retval);
		},

		// 触发兼容模式
		launchCompatibleMode: function(){
			if(config.isCompatible){
				return false;
			}
			window.location.href += "&compatible=true";
		},

		// 自动全屏提示
		autoFullScreenPop: function(){

			// 当前在兼容模式下 || 桌面分享情况
			if(config.isCompatible || config.currentMode == 2){
				if(config.isCompatible){
					$("#room").addClass("room_compatible");
				}
				config.isShowCompatible = false;
				return false;
			}

			// 微信 || QQ浏览器 -> 进入
			if(tools.isWechat() || tools.isQQBrowser() || tools.isIos()){
				// config.isShowCompatible = false;
				var isCanRun = false;
				// 逻辑：要求系统版本在 (ios10+ || Android 5.1+) 执行以下操作
				if(tools.getPlatformInfo().partform === "android"){
					isCanRun = true;
				}else if(tools.getPlatformInfo().partform === "ios" && tools.getPlatformInfo().version > 10){
					isCanRun = true;
				}
				
				// 弹出提示窗
				if(isCanRun){
					var pop = tmod("mod_room_compatiable_mode", {});
					$(".mod_modules").append(pop);
					$(".mod_room_compatiable").find(".show_" + tools.getPlatformInfo().partform).show();
					config.isShowCompatible = true;
				}
			}
			else{
				config.isShowCompatible = false;
			}
		},

		// 重载
		reload: function(){
			if(window.location.href.indexOf("reload") > -1){
				window.location.href += "&reload=" + Math.random();
			}else{
				window.location.href += "&reload=" + Math.random();
			}
		},

		// 公共方法调用
		globalInit: function(){
			// 全屏弹窗提示
			this.autoFullScreenPop();
		},

		openPage: function(){
            var liveid = room.liveid;
            window.location.href = window.location.protocol+"//static-1.talk-fun.com/open/cooperation/launch_app/native.html?liveid="+liveid+"&access_token="+config.access_token+"&type=vod";
        },

		//bindEvend
		bindEvend: function(){

			var that = this;
			
			// 刷新
			$("body").on("touchend", ".reload", function(){
				that.reload();
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
			$("body").on("click", ".close_comptipop", function(){
				$(".mod_room_compatiable").hide();
			});

			// 开始 || 暂停
            $("#btn_pp").on("click", function(e){
				// that.HT.pause();
                if($(this).hasClass("pause")){
                    $(this).removeClass("pause");
                    that.HT.play();
					// alert("play");
                }else{
                    $(this).addClass("pause");
                    that.HT.pause();
					// alert("pause");
                }
				// e.stopPropagation();
            });

			// 播放按钮播放
			$("body").on("click", "#click_play", function(){
				$(this).hide();
				that.HT.play();
			});

			// 设置
			$("body").on("touchend", ".set_icon", function(){
				set.setup();
				$("#set").show();
				$(".set_menu").show();
				that.changeTab("set");
			});

			// 左区域收缩
			$("#left_toggle").on("click", function(e){
				horizontal.stretchToggle(this);
			});

			// menu
			$(".ht_nav_list").on("click", "li", function(){
				var statue = $("#ht_camera_container").data("status"),
					type = $(this).data("type"),
					switchState = $("#tab_video").data("change");
				that.changeTab(type);
			});

			// Sly菜单绑定
			/*that.initNav();
*/
		},

		// Sly-Menu.绑定
		initNav: function(index){
			var that = this;

			// kill.it
			$(".sideline").remove();

			var $nav = $(".ht_nav_list");

			// set kinds of width.
			$nav.width($nav.find("li:visible").length * $nav.find("li").eq(1).width());
			// Call Sly on frame
			if(!that.menu){
				var $frame = $('.find_nav_list'),
					menu = new Sly($frame, {
						horizontal: 1,
						itemNav: 'centered',
						smart: 1,
						activateOn: 'click',
						mouseDragging: 1,
						touchDragging: 1,
						releaseSwing: 1,
						scrollBy: 1,
						speed: 300,
						dragHandle: 1,
						dynamicHandle: 1,
						clickBar: 2,
					}).init();
				
				// copy.
				that.menu = menu;
			}
			// 重复执行该方法 => reload.
			else{
				that.menu.reload();
				if(index){
					that.menu.slideTo(index);
				}
			}
		},

		/**
		 * 竖屏切换影响以下几点
		 * @[toggleRender]
		 * ================
		 * 大屏切换
		 * 中小屏切换
		 * 桌面分享 / 视频插播
		 * 横屏
		 */
        toggleRender: function(){
			// 切换区域
			
			// vertical
			if(this.rotationType === "vertical"){
				this.curMode.verticalToggle();
			}
			// horizontal
			else{
				horizontal.horizontalToggle();
			}
        },

		// 设置默认切换 @[config.screenLocation]
		setDefaultToggle: function(){
			var that = this;
			// 兼容模式强制切换
			if(config.screenLocation == 0 && config.isCompatible){
				that.toggleRender();
				return false;
			}
			// 切换[0] 正常[1]
			if(config.screenLocation == 0 && config.cameraStatue === "start"){
				that.toggleRender();
			}
		},

		// 模式切换
		modeChange: function(mode){

			var that = this;

			tools.log("modechange => ", mode);
			tools.debug("config => ", config);

			// 当前模式
			config.currentMode = mode.currentMode;

			// 中小屏渲染处理
			if(config.screenMode == 1 || config.screenMode == 2){
				// 音频画面删除
				$("#voice_bg").remove();
			}

			// 桌面分享
			if(config.currentMode == 2){
				// change to chat.
				that.changeTab("chat");
				modCamera.cameraHide();
			}
			// 课件模式(普通)
			else{
				// 中小屏 => chat
				if(config.screenMode == 1 || config.screenMode == 2){
					that.changeTab("chat");
				}

				/*else if(config.screenMode == 0 && config.isCompatible){
					setTimeout(function(){
						if(config.cameraStatue == "stop"){
							$("#tab_video").hide();
						}	
				}*/
				
				// 普通模式
				else{
					// 有摄像头的情况 => video
					if(config.cameraStatue === "start"){
						that.changeTab("video");
					}
				}
			}
		},

		// TAB切换
		tabToggle: function(showFlag){
			// set modules of the tab.
			var that = this,
				tabs = ["albums", "chapter", "chat", "set", "ask", "video"],
				_index = -1,
				$nav = $(".ht_nav_list li");
			
			// 导航去除
			$nav.removeClass("selected");

			// 选中Tab
			tabs.forEach(function(key, index){
				if(key === showFlag){
					$("#"+showFlag).show().css("display", "inline-block");
					$("#tab_"+showFlag).addClass("selected");
					_index = index;
					//兼容模式下
					if(window.partner_id != "11273"){
						if(config.isCompatible){
							$("#tab_video").html("文档");
							if(key != "video"){
								 $("#mod_main_player").addClass("hidden");
								 $(".mod_ppt_wrap").addClass("hidden");
							}else{
								 $("#mod_main_player").removeClass("hidden");
								 $(".mod_ppt_wrap").removeClass("hidden");
							}
							
						}
					}
					// logic.
					that.tabSwitch(showFlag);
				}else{
					$("#"+key).hide();
				}
			});

			// SlideTo Nav item. => Sly
			if(that.menu){
				that.menu.slideTo(_index - 1);
			}
		},

		// 切换Tab, render?
		changeTab: function(target){

			var that = this;

			// 如果是jquery对象
			if(typeof target === "object"){
				var type = $(target).data("type");
				$(target).show();
				$(target).addClass('selected');
			}
			// 普通类型
			else if(typeof target === "string"){
				var type = target;
			}

			tools.debug("changeTab => ", type, that.curTab);

			// 当前tab.
			if(that.curTab === type){
				return false;
			}

			that.curTab = type;

			// Change Tab.
			switch(type){
				// 专辑
				case "albums":
					that.tabToggle(type);
					break;

				// 章节
				case "chapter":
					that.tabToggle(type);
					chapter.renderChapterList(chapter.chapterList);
					break;

				// 聊天
				case "chat":
					$("#tab_chat .c_num").hide();
					$(".h_opration").removeClass("hidden");
					chat.renderList(chat.chatList); //渲染聊天列表
					that.tabToggle(type);
					break;

				// 问答
				case "ask":
					$("#q_ask .c_num").hide();
					$("#pop_emotis").hide();
					$(".h_opration").removeClass("hidden");
					question.renderQuestion(question.questionList); //渲染问答列表
					that.tabToggle(type);
					break;	

				// 设置
				case "set":
					$(".set_menu").show();
					$("#tab_set .c_num").hide();
					set.setup(); //渲染设置按钮
					that.tabToggle(type);
					break;

				// 视频
				case "video":
					that.changeload = true;
					$(".comm_oper").hide();
					$(".h_opration").addClass("hidden");
					that.tabToggle(type);	    	
					break;	
			}
		},

		// Tab切换逻辑处理
		/**
		 * 大屏 | 是否切换
		 * 中小屏 | 是否切换
		 * 桌面分享
		 */
		tabSwitch: function(tab){

			tools.debug("switch to =>"+tab, "curMode =>"+config.currentMode, "config => ", config);
			
			var that = this;
			// 大屏幕情况, 视频默认在下方
			// 如果切换的状态下，不隐藏视频
			// PPT隐藏
			// 每个模式对应 => switchTab.
			
			// vertical.
			if(that.curMode && that.rotationType === "vertical"){
				// 桌面分享不做处理
				if(config.currentMode == 2){
					return false;
				}
				that.curMode.tabSwitch(tab);
			}
			// horizontal.
			else{
				horizontal.tabSwitch(tab);
			}
		},

		// 插入特殊用户
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
	                	//defalut:
	                    //break;
	            }
	        }
	    },

	     // 界面加载后执行
        onPlayerLoad: function(){
            /*plugins.rollNotice(window.MT.announce.roll);*/
        },

		// 加载模版
    	loadTemplate: function(callback){
    		var that = this;
	        // 优先加载
	        (function(win){
	            // 模版加载...
	            var host = seajs.domain,
					tplVersion = "v2.0", // ⚠️如模版有改动,必须修改版本号
	                tplSource = "";
	                tplSource = window.location.protocol + '//' + window.mainConfig.resHost + '/tpls/vod_template.html?' + tplVersion;
				
				// get template
	            $("#template_loader").load(tplSource, null, function(){
					
	            	room.render();
			        
					// 动态插入pop弹窗
					that.onPlayerLoad();

					// 公共事件调用类
					that.globalInit();

					// 回调
					if(typeof callback === "function"){
						callback();
					}
	            });
	        })(window);
	    },

		// tools
	    tools: window.SDK.tools,

	    // 房间模式初始化
		// 读取 @[config.screenMode] 配置
		roomModeDispatch: function(callback){
			/**
			 * 目前提供3种模式
			 * 1、上下摄像头大模式
			 * 2、摄像头中，小模式
			 */
			var that = this;

			//保证只初始化一次
			if(!room.isinit){
				that.curMode = null;

				switch(config.screenMode){
					
					// 模式 => 0
					case config.static.ROOM_MODE_0:
						require.async("./room.mode_view_1", function(mode_1){
							mode_1.init(that);
							that.curMode = mode_1;
							// 执行回调
							if(typeof callback === "function"){
								callback(that.curMode);
							}
						});
						break;
					
					// 模式 => 1
					case config.static.ROOM_MODE_1:
						require.async("./room.mode_view_2", function(mode_2){
							mode_2.init(that);
							that.curMode = mode_2;
							// 执行回调
							if(typeof callback === "function"){
								callback(that.curMode);
							}
						});
						break;
					
					// 模式 => 2
					case config.static.ROOM_MODE_2:
						require.async("./room.mode_view_2", function(mode_2){
							mode_2.init(that);
							that.curMode = mode_2;
							// 执行回调
							if(typeof callback === "function"){
								callback(that.curMode);
							}
						});
						break;

					// 模式 => 2
				    case config.static.ROOM_MODE_3:
						require.async("./room.mode_view_3", function(mode_3){
							mode_3.init(that);
							that.curMode = mode_3;
							// 执行回调
							if(typeof callback === "function"){
								callback(that.curMode);
							}
						});
						break;		

					// // 模式 => 3
					// case config.static.ROOM_MODE_3:
					// 	/*var modeView_3 = require("./room.mode_view_3");*/
					// 	that.curMode = modeView_3;
					// 	//return modeView_3;
					// 	break;
				}
				that.isinit = true;
				return that.curMode;
			}
		},

		// 手动开关视频
		manualToggle: function(){
			// // 需视频开启后操作 todo...
			// if(config.cameraStatue === "start"){
			// 	// 开启音频
			// 	if(config.manualClose){
			// 		modCamera.cameraHide();
			// 	}
			// 	// 开启视频
			// 	else{
			// 	}
			// }
			// vertical.
			if(this.rotationType === "vertical"){
				// this.changeTab("chat");
				this.curMode.manualToggle();
			}
			// horizontal.
			else{
				// this.changeTab("video");
				horizontal.manualToggle();
			}
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

         // 房间初始化监听
        addListen: function(curMode){
            
			var that = this;
			that.curMode = curMode;

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

		// 获取角度
		getOrientation: function(){
			if(window.orientation){
				return window.orientation;
			}else{
				if($(window).width() > $(window).height()){
					return 90;
				}else{
					return 0;
				}
			}
		},

		// reset.
		resetSetting: function(){
			
			//清除样式(必须优化...)
			$("body").removeClass("landscape");

			$("#mod_ppt_wrap").removeClass("setcw");
			$("#mod_ppt_wrap").removeClass("ppths");
			$("#mod_ppt_wrap").removeClass("pptvs");

			$(".section_wrap").removeClass('horizontal');
            
			$(".mod_menu").removeClass("close");
            $(".mod_menu").removeClass("open");

            $(".mod_modules").removeClass("close");
            $(".mod_modules").removeClass("open");
			$("#mod_modules").removeClass("st");
			$(".mod_ppt_wrap").removeClass("mode_2_toggled");

			$("#ht_camera_container").removeClass("moveout");
			$("#ht_camera_container").removeClass("camerahs");
			$("#ht_camera_container").removeClass("cameravs");
			$("#ht_camera_container").removeClass("mode_2_toggled");

			// remove style attr
			$(modCamera.cameraWrap).removeAttr("style");
			$(PPT.container).removeAttr("style");

			// 手动关闭初始化
			this.manualToggle();
			
			// 切换
			config.switchFlag = false;
		},

		// 摄像头状态逻辑分发
		cameraState: function(state){
			// vertical
			if(this.rotationType === "vertical"){
				this.curMode.cameraState(state);
			}
			// horizontal
			else if(this.rotationType === "horizontal"){
				horizontal.cameraState(state);
			}
		},

        //检测屏幕尺寸变化
        checkViewReset: function(){
            
			var that = this,
            	degs = that.getOrientation(),
            	type = that.getOrientationTarget(degs);

            if(type === that.rotationType){
                return false;
            }

            // 设置延迟reset
            if(that.resizeTimer){
                clearTimeout(that.resizeTimer);
            }

			// 清理操作
			that.resetSetting();

			// 初始化旋转监听
            that.resizeTimer = setTimeout(function() {
				if(type === "vertical"){
					that.curMode.vertical();
				}else if(type === "horizontal"){
					horizontal.init(that);
				}  
				that.initNav();            
            }, 100);

			// log.
			tools.debug("当前rotation => " + type);

			// set that.rotationType
			that.rotationType = type;
        }, 

		// live info.
		setLiveInfo: function(vodInfo){
			this.vodInfo = vodInfo;
			this.vodInfo.duration = parseInt(this.vodInfo.duration, 10);
		},

		// room入口
		init: function(HTSDK){
			// 避免重复加载
            if(this.initLoaded){
                return false;
            }

			var that = this;
			that.MT = window.tools;
			that.HT = HTSDK;
			// 加载模版
			that.loadTemplate(function(){
				// 初始化房间模式
				// 等待模版初始化后 && 等待mode加载完成
				that.roomModeDispatch(function(modeData){
					// log.
					tools.debug("configs => ", config);
					// orientation init.
					var degs = window.orientation,
						flag = that.getOrientationTarget(degs);
					that.addListen(modeData);
				});
			});
            this.initLoaded = true;
		}
	};
	module.exports = room;

});