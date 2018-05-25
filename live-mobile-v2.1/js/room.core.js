/**
 * 房间模块
 */
"use strict";

define(function(require, exports, module){
		//别名包含整个路径
	var tmod = require("TMOD"),
		zepto = require("dropload"),
		modCamera= require("./camera"), 
		set = require("./set"),
		ppt = require("./ppt"),
		plugins = require("./plugins"),
		question = require("./question");

	//房间
	var room = {

		//在线人数
		total: 0,
		// 特殊用户
		robot: 0,
	    // 直播状态
		stateChange: function(flag){
			var that = this;
			switch(flag){
				// 开始
				case "start":
				 	$("#mod_mask").hide();
	                /*$(".mask_bg").hide();*/
	                $("#mtAuthorPlayer").addClass("camerahide");
	                $("#mod_menu_head").show();
	                $("#voice_bg").show();
					modCamera.liveStart();
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
		// 踢出房间
		kick: function(retval) {
			// body...
			var tpl = tmod("mod_room_kick", retval);
			if(MT.me.xid == retval.xid){
				window.location.href = seajs.protocol + "open.talk-fun.com/open/maituo/mobile_error.html?var=4";
			}
			plugins.modMessage("kick", retval);
			//$("body").append(tpl);
		},
		//bindEvend
		bindEvend: function(){
			
			//刷新
			$("body").on("touchend", ".reload", function(){
				window.location.reload();
			});


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
					$(this).removeClass("recover");
					$(".mod_modules").addClass("open");
					$(".mod_modules").removeClass("close");
					$("#mod_menu").addClass("open");
					$("#mod_menu").removeClass("close");
					$(".h_opration .set_icon").show();
					$("#mod_main_player").removeAttr("style");
					$(".mod_ppt_wrap").removeClass("setcw");
					room.iphoneRest("close");
					/*$("#ht_camera_container").removeClass("moveout");*/
					/*alert("778888");*/
					room.isCloseSwitch(cw,ch);							
				}
				//展开
				else{ 
					$(this).addClass("recover");
					$(".mod_modules").addClass("close");
					$(".mod_modules").removeClass("open");
					$("#mod_menu").removeClass("open");
					$("#mod_menu").addClass("close");
					$(".h_opration .set_icon").hide();
					$(".mod_ppt_wrap").addClass("setcw");
					room.iphoneRest("open")
					/*$("#ht_camera_container").addClass("moveout");*/
					$("#mod_main_player").removeAttr("style");
					room.isOpenSwitch($("#room").width(),$("#room").height());	
												
				}
			})

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
						plugins.tabSwitch("chat");
						room.clickOtherTab("chat");
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
						plugins.tabSwitch("set");
						room.clickOtherTab("set");
						set.addSetTemp();//设置模显示
						break;
					case "video":
					    $("#chat").hide();
						$("#set").hide();
						$("#ask").hide(); 
						$("#pop_emotis").hide();
						$(".h_opration").addClass("hidden");
						plugins.tabSwitch("video");
						$("#ht_camera_container").removeClass("move");//恢复视频区域
						$("#mode_chat_post").removeClass("showemtion");
						room.clickOtherTab("video");			    		
				}
				
			});
		},

		//针对iphone白屏展开收缩作相应操作
		iphoneRest:function(s_statue){
			var u = navigator.userAgent;
			var switchFlag= $(".mod_ppt_wrap").data("switch");
			if(u.indexOf('iPhone') > -1){
				if($("#tab_video").hasClass("selected")){
					if(!switchFlag){
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
			var switchFlag= $(".mod_ppt_wrap").data("switch");	
			if(switchFlag){
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
			    ppt.pptReset(cw,ch);	
			}
		},

		//恢复
		isCloseSwitch: function(cw,ch){
			var switchFlag= $(".mod_ppt_wrap").data("switch");	
			if(switchFlag){
				$("#ht_camera_container").removeClass("add_bg");
				$("#ht_camera_container").height($("#room").height());
                $("#ht_camera_container").width($("#room").width()*0.7);
                $("#mtAuthorPlayer").height($("#room").height());
                $("#mtAuthorPlayer").width($("#room").width()*0.7);
                $("#mtAuthorPlayer").css("right",0);
                $(".mod_ppt_wrap").show();
                ppt.pptReset(cw*0.3, ch);
                if(!$("#tab_video").hasClass("selected")){
                	$(".mod_ppt_wrap").hide();
                }else{
                	$(".mod_ppt_wrap").show();
                }
			}else{
				$(".mod_ppt_wrap").width($("#room").width()*0.7);
				$(".mod_ppt_wrap").height($("#room").height());
				ppt.pptReset(cw*0.7,ch);	
			}
		},

		//摄像头和ppt互换位置点击其它tab
		clickOtherTab: function(type){
			var  flag= $(".mod_ppt_wrap").data("switch");
			var  status= $("#ht_camera_container").data("status");
			//切换
			if(flag){
				 if(type=== "video"){
				 	 $(".mod_ppt_wrap").show();
				 	 var $pptWrap= $(".mod_ppt_wrap");
				 	 $pptWrap.height($(".mod_modules").height());
            		 $pptWrap.width($(".mod_modules").width());
				 	 ppt.pptReset($pptWrap.width(),$pptWrap.height());
				 }else{
				 	$(".h_opration .set_icon").show();
				 	$(".mod_ppt_wrap").hide();
				 	$(".online_total").css("top",5);
				 }

				 if(window.screenMode== 2 || window.screenMode== 1){
				 	  if(type!="set"){
				 	  	 $(".mod_ppt_wrap").show();
				 	  	 $(".online_total").css("top",$(".mod_ppt_wrap").height()+5);
				 	  }
				 	  if(plugins.isMobileStatus()==="horizontal"){
				 	  		if(type=="video"){
				 	  			 $(".mod_ppt_wrap").show();
				 	  		}else{
				 	  			 $(".mod_ppt_wrap").hide();
				 	  		}
				 	  }
				 }	

			}else{
				if(type !=="video"){
					$("#mode_chat_post").removeClass("showemtion"); 		
					$(".h_opration .set_icon").show();
					var u = navigator.userAgent;
					//iphone
					if(u.indexOf('iPhone') > -1){	
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
				}
				$("#ht_camera_container").removeClass("moveout");
	            if(plugins.isMobileStatus()==="vertical"){
					if(window.screenMode== 1 || window.screenMode==2){//小屏和中屏的情况下
						if(type=== "set" || status!== "start"){
							$("#mtAuthorPlayer").addClass("camerahide");
						    $("#ht_camera_container").addClass("move");//移开视频区域
						}else{	
							if(!set.isOpenCamera){//摄像头关闭
								$("#mtAuthorPlayer").addClass("camerahide");
						    	$("#ht_camera_container").addClass("move");//移开视频区域
							}else{
								$("#ht_camera_container").removeClass("move");//移开视频区域
						    	$("#mtAuthorPlayer").removeClass("camerahide");	
							}
						   
						}
					}
					
				}else{
					if(window.screenMode== 1 || window.screenMode==2){//小屏和中屏的情况下
						if(type!=="video"){
							$(".h_opration").removeClass("hidden");
						}
						$(".online_total").css("top",5);
	            	}
				}				
			}
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
			
			/*var tpl = tmod("slide", {});
				if($(".ht_nav").size() < 1){
					$("#mod_menu_head").append(tpl);
					that.bindEvend();
				}*/
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
            plugins.rollNotice(window.MT.announce.roll);

        },

		// 加载模版
    	loadTemplate: function(callback){
    		var that = this;
	        // 优先加载
	        (function(win){
	            // 模版加载...
	            var host = window.location.href.indexOf("rye-tech.com") > 0 || window.location.href.indexOf("talk-fun.com") > 0,
	                tplSource = "";
	            if(host){
	                tplSource = seajs.protocol+'open.'+window.document.domain.split(".")[1]+'.com/open/cooperation/default/live-mobile-v2/tpls/template.html';
	            }else{
	                tplSource = "tpls/template.html";
	            }
	            $("#template_loader").load(tplSource, null, function(){
	            	room.render();
			        // 动态插入pop弹窗
					var popTips = tmod("public_tips", {});
					var lottery = tmod("mod_lottery_con", {});
					that.onPlayerLoad();
					$("body").append(popTips);
					$("body").append(lottery);
					$("#voice_bg img").attr("src",MT.zhubo.p_150);
	            });
	        })(window);
	    },
	    tools: window.SDK.tools,
		//入口
		init: function(HTSDK){
			var that = this;
				that.MT = window.tools;
				that.HT = HTSDK;
				that.loadTemplate();
		}

	};


	module.exports = room;

});