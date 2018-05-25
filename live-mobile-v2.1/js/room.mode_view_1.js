/**
 * 房间模块
 */
"use strict";

define(function(require, exports, module){

	var config = require("./global.config"),
	    camera = require("./camera"), // 视频模块
		horizontal = require("./room.horizontal"),
	    plugins = require("./plugins");

	var modeView = {
		isUp: true,	

		isLeft: true,

		isLoad: true,

		$cameraContainer: $("#ht_camera_container"),//包裹摄像头的外层容器

		$pptWrap: $(".mod_ppt_wrap"),//包裹PPT的容器


		//大屏摄像头在上
		cameraTop: function(params) {
			var _that = this;
            //清除样式
            _that.clearStyle();
            _that.$cameraContainer.removeClass("hvr");
            _that.$cameraContainer.removeClass("add_bg");
            _that.$cameraContainer.addClass("cameravs");
            _that.$cameraContainer.removeClass("move");
             $("#set").hide();

            //重置ppt宽高
            setTimeout(function(){
            	_that.$pptWrap.addClass("pptvs");
	            _that.$pptWrap.height($(".mod_modules").height());
	            _that.$pptWrap.width($(".mod_modules").width());

	            //重置ppt宽高
	            _that.$cameraContainer.width($("#mod_ppt").width());
	            _that.$cameraContainer.height($("#mod_ppt").height());
	            plugins.pptReset(_that.$pptWrap.width(),_that.$pptWrap.height());

	            if(config.mediaSwitch == "audio"){
	            	$("#voice_bg").show();
            	}
				// change camera state
				if(plugins.isAndroid()){
				    modeView.verticalForAndroid();					
				}else{
					$("#mtAuthorPlayer").width($("#mod_ppt").width());
	            	$("#mtAuthorPlayer").height($("#mod_ppt").height());
				}
            },100);
            
			$("#mtAuthorPlayer").css("right",0);

            $("#tab_video").html("文档");
            _that.switchVideoSelect();

            //兼容模式下
            if(config.isCompatible && modeView.isLoad){
            	modeView.isLoad = false;
             	$(".ht_nav_list li").removeClass("selected");
             	if(config.cameraStatue === "start"){
             		$("#tab_video").show();
             		$("#chat").hide();
                    $("#tab_video").addClass("selected");
             	}else{
             		$("#tab_video").hide();
             	}
            }
            
             //当前切换状态为语音模式下
            config.switchFlag = true//用于标记是否切           	
		},

		//竖屏针对android 6.0.1黑屏
		verticalForAndroid: function(){
			//摄像头切换到上面
			if(config.switchFlag){
				if(config.cameraStatue === "start"){
            		if(config.mediaSwitch == "audio"){
						camera.cameraHide();
					}else{
						// 非兼容模式设置宽高
						if(!config.isCompatible){
							$("#mtAuthorPlayer").width($("#mod_ppt").width()); 
            				$("#mtAuthorPlayer").height($("#mod_ppt").height());
						} 
					} 
				}else{
					camera.cameraHide();
				}
			}
			//摄像头切换到下面
			else{
				if(config.cameraStatue === "start"){
	            	if(config.mediaSwitch == "audio" ){
						camera.cameraHide();
					}else{
						$("#mtAuthorPlayer").width($(".mod_modules").width());
	            		$("#mtAuthorPlayer").height(ch-2);
					} 
				}else{
					camera.cameraHide();
					
				}	
			}
			
		},

		//大屏摄像头在下
		cameraBottom: function(rotaion) {
			var _that = this;
			_that.clearStyle();
			
			//清除样式
			_that.$cameraContainer.addClass("hvr");
            _that.$cameraContainer.removeClass("cameravs");
            $("#set").hide();
            $(".h_opration").addClass("hidden");

            setTimeout(function(){
            	//PPT区域设置宽高
	            _that.$pptWrap.removeClass("pptvs");
	            _that.$pptWrap.height($("#mod_ppt").height());
	            _that.$pptWrap.width($("#mod_ppt").width());

	            //摄像头设置宽高
	            /*var ch = $("#room").height()-33-$("#mod_ppt").height();
				_that.$cameraContainer.height(ch-2);
	            _that.$cameraContainer.width($(".mod_modules").width());   
	            
	            var u = navigator.userAgent,
               	    isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
				// change camera state
				if(isAndroid){
					if(config.cameraStatue === "start"){
		            	if(config.mediaSwitch == "audio" ){
							camera.cameraHide();
						}else{
							$("#mtAuthorPlayer").width($(".mod_modules").width());
		            		$("#mtAuthorPlayer").height(ch-2);
						}
					}else{
						camera.cameraHide();
					}
				}else{
					$("#mtAuthorPlayer").width($(".mod_modules").width());
		            $("#mtAuthorPlayer").height(ch-2);
				}*/
				
	            plugins.pptReset(_that.$pptWrap.width(), _that.$pptWrap.height());
	            _that.videoSelect();
	            plugins.forIphone();


            },100);     
            _that.$pptWrap.show();
            config.switchFlag = false //用于标记是否切换  

			// 重置摄像头区域
			_that.onCameraPlay();
		},

		// 摄像头在底部 => Play状态
		onCameraPlay: function(){

			// 兼容模式
			if(config.isCompatible){
				return false;
			}
			var _that = this;
			_that.setCameraSize();
		},

		// 摄像头在底部 => Pause状态
		onCameraPause: function(){
			// 如切换后不执行隐藏
			if(!config.isShowCompatible){
				return false;
			}
			if(config.switchFlag || config.isCompatible || plugins.isIos()){
				return false;
			}
			camera.cameraHide(true);
		},

		// 设置摄像头尺寸
		setCameraSize: function(){
			var _that = this;
			//摄像头设置宽高
			var ch = $("#room").height()-33-$("#mod_ppt").height();
			_that.$cameraContainer.height(ch-2);
			_that.$cameraContainer.width($(".mod_modules").width());
			
			var u = navigator.userAgent,
				isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
			
			// change camera state
			if(isAndroid){
				if(config.cameraStatue === "start"){
					if(config.mediaSwitch == "audio" ){
						camera.cameraHide();
					}else{
						if(config.switchFlag){
							_that.cameraTop();
						}{
							$("#mtAuthorPlayer").width($(".mod_modules").width());
							$("#mtAuthorPlayer").height(ch-2);
						}
					}
				}else{
					camera.cameraHide();
				}
			}else{
				$("#mtAuthorPlayer").width($(".mod_modules").width());
				$("#mtAuthorPlayer").height(ch-2);
			}
		},
		
		//摄像头没有切换上去视频tab选中的情况
		videoSelect: function(){
			var _that = this;
			if($("#tab_video").hasClass("selected")){
                $("#mtAuthorPlayer").removeClass("move");
                //摄像头开启
                if(config.cameraStatue== "start" ){
                    if(config.mediaSwitch == "audio"){//切换成音频
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }else{
                        $("#mtAuthorPlayer").removeClass("camerahide"); 
                    }
                }else{//摄像头关闭
                    $("#mtAuthorPlayer").addClass("camerahide");
                    plugins.currentTable("音频");
                }   
            }else{
            	$("#ht_camera_container").css({
                       width: 1,
                	   height: 1
                });
            }
		},

		//摄像头切换上去视频tab选中的情况
		switchVideoSelect: function(){
			var _that = this;
			if($("#tab_video").hasClass("selected")){
                if(config.cameraStatue== "start" ){
                    if(config.mediaSwitch == "audio"){
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }else{
                        $("#mtAuthorPlayer").removeClass("camerahide"); 
                    }
                }else{
                    $("#mtAuthorPlayer").addClass("camerahide");
                }
                _that.$pptWrap.show();
            }
		},
		//大屏摄像头竖屏
		vertical: function() {
			var that = this;
			if(config.currentMode == 2){//桌面分享插播
				that.cameraBottom();
			}
			//课件模式
			else{
				if(config.cameraStatue == "start"){
					if(config.switchFlag){
						that.cameraTop();
					}else{
						that.cameraBottom(true);
					}
				}else{
					that.cameraBottom();	
				}
			
			}			
		},


		 //摄像头交换位置后突然关闭摄像头情况下
        defaultLocation: function(){
            if(config.switchFlag){
                if(plugins.isMobileStatus()=== "vertical") { 
                    if(window.screenMode== 0){
                        modeView.cameraBottom();
                        $("#set .screen_change").find("i").removeClass("schange");
                        plugins.currentTable("音频");
                        /*$("#icon_change").addClass("schange");  */    
                    }/*else{
                        ppt.smallVertical();    
                    }*/
                    
                } 
                //  横屏切换
                if (plugins.isMobileStatus()=== "horizontal"){ 
                    if(window.screenMode== 0){
                        horizontal.cameraRight();  
                        $("#set .screen_change").find("i").removeClass("schange");
                        plugins.currentTable("音频");
                        /*$("#icon_change").addClass("schange"); */  
                    }/*else{
                        ppt.smallHorizontal();
                    }*/                 
                } 
                  
            }  
        },

		//清除样式
		clearStyle: function(){
			$(".section_wrap").removeClass('horizontal');
            $("body").removeClass("landscape");
            $(".mod_menu").removeClass("close");
            $(".mod_menu").removeClass("open");
            $(".mod_modules").removeClass("close");
            $(".mod_modules").removeClass("open");
		},

		//大屏摄像头模屏
		horizontal: function(params) {
			if(config.currentMode == 2){//桌面分享插播
				horizontal.cameraRight();	
			}else{
				if(config.cameraStatue == "start"){
					if(config.switchFlag){
						horizontal.cameraLeft();
					}else{
						horizontal.cameraRight();	
					}
				}else{
					horizontal.cameraRight();
				}
					
			}		
			
		},

		init: function name(params) {
				
		}
	};


	module.exports = modeView;

});