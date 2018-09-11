/**
 * 房间模块
 * mode => 0
 */
"use strict";

define(function(require, exports, module){

	var config = require("./global.config"),
	    camera = require("./camera"), // 视频模块
		PPT = require("./ppt"),
		tools = require("./tools"),
		room = require("./room"),
	    plugins = require("./plugins");
	
	var modeView = {

		// Tab切换渲染(入口)
		tabSwitch: function(type){
			
			// 未打开摄像头不执行
			if(config.cameraStatue === "stop"){
				return false;
			}

			// 已切换
			if(config.switchFlag){
				if(type === "video"){
					PPT.show();
				}else{
					PPT.hide();
				}
			}

			// 未切换
			else{
				// 视频
				if(type === "video"){
					camera.cameraShow();
				}else{
					camera.cameraHide();
				}
			}
		},

		// ⚠️大屏摄像头竖屏
		vertical: function() {
			
			var that = this;
	
			// PPT区域设置宽高
			var ppt = {
				width: $("#mod_ppt").width(),
				height: $("#mod_ppt").height()
			};
			PPT.resize(ppt.width, ppt.height);

			// 摄像头设置宽高
			var csize = {
				width: $("#mod_modules").width(),
				height: $("#mod_modules").height()
			};

			// 初始化必须给 `camera` 设置宽高
			camera.resizeWidth = csize.width;
			camera.resizeHeight = csize.height;

			// 需用户打开摄像头
			if(config.cameraStatue === "start"){
				camera.resize(csize.width, csize.height);
			}else{
				room.changeTab("chat");
			}

			// // 摄像头位置[1 => down, 0 => up]
			// if(config.cameraStatue === "start" && config.screenLocation == 0){
			// 	config.switchFlag = false;
			// 	that.verticalToggle();
			// }

			// 桌面分享插播
			/*if(config.currentMode == 2){
				that.cameraBottom();
			}
			// 课件模式
			else{
				// 开启摄像头
				if(config.cameraStatue == "start"){
					// 是否配置切换
					if(config.switchFlag){
						that.cameraTop();
					}else{
						that.cameraBottom();
					}
				}else{
					that.cameraBottom();	
				}
			}*/
			
		},

		 // 手动开关视频操作
        manualToggle: function(){
            var that = this;
			// 需视频开启后操作
			if(config.cameraStatue === "start"){
				// todo...
				if(config.manualClose){
					room.changeTab("chat");
				}else{
					room.changeTab("video");
				}
			}else{
				// todo...
			}
		},

		// 摄像头开关📹
		cameraState: function(state){
			if(state === "start"){
				this.room.changeTab("video");
			}else{
				this.room.changeTab("chat");
			}
		},

		// 视频切换
		verticalToggle: function(){

			tools.debug("mode_1 -> toggled");

			var that = this;

			// cons.
			var pptCon = {
				width: $("#mod_ppt").width(),
				height: $("#mod_ppt").height()
			};
			var modsCon = {
				width: $("#mod_modules").width(),
				height: $("#mod_modules").height()
			};

			// 未切换
			if(config.switchFlag){
				config.switchFlag = false;
				// mark.
				$("#ht_camera_container").removeClass("cameravs");
				$("#mod_ppt_wrap").removeClass("pptvs");

				// resize
				PPT.resize(pptCon.width, pptCon.height);
				camera.resize(modsCon.width, modsCon.height);
				PPT.show();
			}
			// 切换
			else{
				config.switchFlag = true;
				$("#ht_camera_container").addClass("cameravs");
				$("#mod_ppt_wrap").addClass("pptvs");

				// resize
				PPT.resize(modsCon.width, modsCon.height);
				camera.resize(pptCon.width, pptCon.height);
			}
			
			// 选择后切到视频
			room.changeTab("video");
		},

		// init.
		init: function (room) {
			this.room = room;
		}
	};


	module.exports = modeView;

});