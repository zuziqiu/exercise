/**
 * 房间模块
 */
"use strict";

define(function(require, exports, module){
			
	var modeView3 = {

		$cameraContainer: $("#ht_camera_container"),//包裹摄像头的外层容器


		$pptWrap: $(".mod_ppt_wrap"),//包裹PPT的容器
		//单摄像头在上
		cameraTop: function(params) {
			var _that = this;

			_that.$pptWrap.hide();
            //清除样式
            _that.clearStyle();
            _that.$cameraContainer.removeClass("hvr");
            _that.$cameraContainer.removeClass("add_bg");
            _that.$cameraContainer.addClass("cameravs");
            _that.$cameraContainer.removeClass("move");
             $("#set").hide();
             $("#tab_video").remove();

            setTimeout(function(){

	            //重置摄像头宽高
	            _that.$cameraContainer.width($("#mod_ppt").width());
	            _that.$cameraContainer.height($("#mod_ppt").height());
	            $("#mtAuthorPlayer").width($("#mod_ppt").width()); 
	            $("#mtAuthorPlayer").height($("#mod_ppt").height()); 
            },100);
            $("#mtAuthorPlayer").css("right",0);
            _that.chatSelect();
             //当前切换状态为语音模式下
            config.switchFlag = true//用于标记是否切换             	
		},


		//单摄像头在下
		cameraBottom: function() {
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
	            var ch = $("#room").height()-33-$("#mod_ppt").height();
				_that.$cameraContainer.height(ch-2);
	            _that.$cameraContainer.width($(".mod_modules").width());   
	            $("#mtAuthorPlayer").width($(".mod_modules").width());
	            $("#mtAuthorPlayer").height(ch-2); 
	            plugins.pptReset(_that.$pptWrap.width(),_that.$pptWrap.height());
	            _that.videoSelect();
	            plugins.forIphone();
            },100);     
            _that.$pptWrap.show();
            config.switchFlag = false //用于标记是否切换       	

		},


		//在提问tab和设置tab没有选中的情况下默认选中聊天tab
        chatSelect: function(){
            if(!$("#q_ask").hasClass("selected") && !$("#tab_set").hasClass("selected")){
                $(".ht_nav_list li").removeClass("selected");
                $("#tab_chat").addClass("selected");
                $("#tab_chat").addClass("selected");
                $("#chat").show();
                $("#set").hide(); 
            } 
        },

        //模屏时摄像头在左边
    	cameraLeft : function(){
    		var _that = this;
    		//清除样式
    		_that.hClearSyle();
            $("#ht_camera_container").addClass("camerahs");
            var modSwitch= $("#tab_video").data("change");
            $("#ht_camera_container").removeClass("move");
            _that.$pptWrap.css("left","");
            $("#tab_video").html("文档");
             //用于标记是否切换
            config.switchFlag = true;

            setTimeout(function(){
	            $("#mtAuthorPlayer").height($("#mod_ppt").height());
	            $("#mtAuthorPlayer").width($("#mod_ppt").width()+2);
	           	_that.$cameraContainer.height($("#mod_ppt").height());
	            _that.$cameraContainer.width($("#mod_ppt").width());   
            },100);   
            $("#set").hide();
            _that.chatSelect();
    	},

    	//摄像头在右边
    	cameraRight: function(){
            var _that = this;
            //清除样式
            modeView3.hClearSyle();
            $(".mod_ppt_wrap").attr("style","");
            $(".online_total").css("top",5);
            _that.$pptWrap.removeClass("ppths");
            $("#set .screen_change").find("i").removeClass("schange");
            $("#network").hide();
            $("#pop_emotis").hide();
            $(".h_opration").addClass("hidden");
            $("#mode_chat_post").removeClass("showemtion");
            $(".mod_ppt_wrap").show(); 
            $("#ht_camera_container").removeClass("camerahs");
            $("#ht_camera_container").removeClass("add_bg");
            //PPT重置宽高
            _that.$pptWrap.height($("#mod_ppt").height());
            _that.$pptWrap.width($("#mod_ppt").width()); 
            _that.$pptWrap.css("left","0");
            //摄像头重置宽高
            $("#ht_camera_container").height($(".mod_modules").height());
            $("#ht_camera_container").width($(".mod_modules").width());
            $("#mtAuthorPlayer").height("auto");
            $("#mtAuthorPlayer").width($(".mod_modules").width());  
            plugins.pptReset($(".osimg").width(),$(".osimg").height());
            config.switchFlag = false;//用于标记是否切换
            $("#set").hide();
            modeView3.chatSelect();
    	},



    	//清除样式
    	hClearSyle: function(){
    		$(".section_wrap").addClass('horizontal');
            $("body").addClass("landscape");
            $("#chat_post_txt").attr("placeholder","");
            $(".mod_menu").removeClass("close");
            $(".mod_menu").removeClass("open");
            $("#ht_camera_container").attr("style","");
            $(".mod_modules").removeClass("close");
            $(".mod_modules").removeClass("open");  
            $(".mod_modules").removeClass("st");  
            $(".mod_ppt_wrap").removeClass("setcw");
            $("#left_toggle").removeClass("recover"); 
            $("#set").hide();
    	},



        //单摄像头竖屏
		vertical: function() {
			var that = this;	
			if(config.currentMode == 2){//桌面分享插播
				that.cameraBottom();
			}else{//课件模式
				that.cameraTop();
				
			}			
		},


		//大屏摄像头模屏
		horizontal: function(params) {
			if(config.currentMode == 2){//桌面分享插播
				modeView3.cameraRight();	
			}else{
				modeView3.cameraLeft();		
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

        onCameraPlay: function(){
            // todo...
        },

        onCameraPause: function(){
            // todo...
        }



	}


	module.exports = modeView3;

});