/**
 * 房间模式2
 * 针对中小摄像头开关渲染
 */
"use strict";

define(function(require, exports, module){
	
    var config = require("./global.config"),
        camera = require("./camera"),
        PPT = require("./ppt"),
        tools = require("./tools"),
        plugins = require("./plugins");

    var modeView2 = {

        room: null,

        // 记录 [摄像头 & PPT 区域] 尺寸
        initSize: {
            ppt: {
                width: 0,
                height: 0
            },
            camera: {
                width: 0,
                height: 0
            }
        },
        
        // ⚠️初始化中小摄像头竖屏
        vertical: function() {
            
            var that = this;

            $("#voice_bg").remove();
            $("#tab_video").hide();

            // 缩放
            var scale = 0.5;

            // 中屏
            if(config.screenMode == 1){
                 scale = 0.5;
            }
            // 小屏
            else if(config.screenMode == 2){
                 scale = 0.3;
            }

            // PPT设置
            var pptCon = {
				width: $("#mod_ppt").width(),
				height: $("#mod_ppt").height()
			};
            PPT.resize(pptCon.width, pptCon.height);

            // 初始化必须给 `camera` 设置宽高
            var cw = ($(window).width() * scale),
                ch = cw * 0.75;
            camera.resizeWidth = cw;
            camera.resizeHeight = ch;

            // 初始化set-size
            that.initSize.ppt.width = pptCon.width;
            that.initSize.ppt.height = pptCon.height;
            that.initSize.camera.width = cw;
            that.initSize.camera.height = ch;

            // room-mode-view2
            tools.debug("room-mode-view2 => ", that);

            // 初始化摄像头位置
            that.setPosition();
            
            // 如果用户关闭摄像头
            if(config.cameraStatue === "start"){
                // resize
                camera.resize(cw, ch);
            }

            // menu reload
            that.room.initNav();

            // change to 'chat'
            that.room.changeTab("chat");
        },

        // 设置position
        setPosition: function(){

            var offset = $("#mod_menu").offset(),
                _top = (offset.top) + ($("#mod_menu").height()) + 1; // with border.

            // 是否初始化切换
            // changed.
            if(config.switchFlag){
                // PPT.
                $(PPT.container).css({
                    top: _top
                });
                $(PPT.container).addClass("mode_2_toggled");
                // cam.
                $(camera.cameraWrap).removeClass("mode_2_toggled");
            }

            // normal
            else{
                // camera.
                $(camera.cameraWrap).css({
                    top: _top
                });
                $(camera.cameraWrap).addClass("mode_2_toggled");
                // ppt.
                $(PPT.container).removeClass("mode_2_toggled");
            }
        },

        // 摄像头操作
        cameraState: function(state){
            if(state === "start"){
				this.room.changeTab("chat");
			}
        },

        // 竖屏切换
        verticalToggle: function(){
			
            var that = this;

			// cons.
			var pptCon = {
				width: 0,//$(PPT.container).width(),
				height: 0//$(PPT.container).height()
			};
			var camCon = {
				width: 0,//$(camera.cameraWrap).width(),
				height: 0//$(camera.cameraWrap).height()
			};

            // 设置宽高
            that.clearStyle();

			// 已切换
			if(config.switchFlag){
				
                // mark.
				$(camera.cameraWrap).removeClass("cameravs");
                $(PPT.container).removeClass("pptvs");
				PPT.show();

                // resize
                camCon.width = that.initSize.ppt.width;
                camCon.height = that.initSize.ppt.height;
                pptCon.width = that.initSize.camera.width;
                pptCon.height = that.initSize.camera.height;

                // flag
                config.switchFlag = false;

			}
			// 未切换
			else{
                // mark.
				$(camera.cameraWrap).addClass("cameravs");
                $(PPT.container).addClass("pptvs");

                // resize
                pptCon.width = that.initSize.ppt.width;
                pptCon.height = that.initSize.ppt.height;
                camCon.width = that.initSize.camera.width;
                camCon.height = that.initSize.camera.height;

				// flag
                config.switchFlag = true;
			}

            // 设置位置
            that.setPosition();

            // camera => PPT || PPT <= camera
            PPT.resize(camCon.width, camCon.height);
			camera.resize(pptCon.width, pptCon.height);

			// 选择后切到 chat.
			that.room.changeTab("chat");
		},

        // switch.
        tabSwitch: function(type){
            // PPT.show();
            // 如果用户关闭摄像头
            if(config.cameraStatue === "stop"){
                return false;
            }
            // 开启摄像头
            if(config.cameraStatue === "start"){
                // 设置 && 没切换 => 把摄像头隐藏
                if(type === "set"){
                    // 切换到 `set` 选项隐藏摄像头
                    if(!config.switchFlag){
                        camera.cameraHide();
                    }
                    // 如果ppt切换到右下, 隐藏PPT
                    else{
                        PPT.hide();
                    }
                }else{
                    camera.cameraShow();
                    // ?
                    if(config.switchFlag){
                        PPT.show();
                    }
                    // PPT.show();
                }
            }
        },

        // 手动开关视频操作
        manualToggle: function(){
            var that = this;

            // 需视频开启后操作
			if(config.cameraStatue === "start"){
                // 切换区域后
                if(config.switchFlag){
                    if(config.manualClose){
                        PPT.hide();
                    }else{
                        PPT.show();
                        that.room.changeTab("chat");
                    }
                }
                
                // 正常模式
                else{
                    if(config.manualClose){
                        camera.cameraHide();
                    }else{
                        camera.cameraShow();
                        that.room.changeTab("chat");
                    }
                }
            }
        },

        //摄像头在上时清除样式
        clearStyle: function(){
            var that = this;
            $(PPT.container).removeAttr("style");
            $(camera.cameraWrap).removeAttr("style");
            $(".section_wrap").removeClass('horizontal');
            $("body").removeClass("landscape");
        },

        init: function(room){
            this.room = room;
        }

    }
    module.exports = modeView2;
});