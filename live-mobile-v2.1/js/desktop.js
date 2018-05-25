/**
 * @name desktop.js
 * @note 桌面分享
 * @author [marko.hoo]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    var modeView_1 = require("./room.mode_view_1"),
        modeView_2 = require("./room.mode_view_2"),
        modeView_3 = require("./room.mode_view_3"),
    	config = require("./global.config"),	
        plugins = require("./plugins"),
        horizontal = require("./room.horizontal");


    // 聊天模块
    var desktop = {
        onPlay: function () {
            $("#click_play").hide();
        },
        changeOtherMode: function(mode){
            if(config.screenLocation == 0){
                config.switchFlag = true;
            }
            //摄像头在<下>的情况下
            if(config.screenLocation == 1 || !config.switchFlag){
                //ppt mode
                if(mode.currentMode == 0){
                      plugins.difTreatment(mode.currentMode); 
                }
                // 桌面分享和插播
                if(mode.currentMode == 2){
                      plugins.difTreatment(mode.currentMode);  
                } 

            }
            //摄像头在<上>的情况下
            else if(config.screenLocation == 0 || config.switchFlag){
                //ppt mode
                if(mode.currentMode == 0){
                      desktop.pptMode();  
                      plugins.difTreatment(mode.currentMode); 
                }
                // 桌面分享和插播
                if(mode.currentMode == 2){
                      plugins.difTreatment(mode.currentMode); 
                      desktop.desktopMode();  
                }              
            }
        },

        //课件模式
        pptMode: function(){
            //大屏模式
            if(config.screenMode == 0){
                if(plugins.isMobileStatus() == "vertical"){
                    modeView_1.cameraTop();
                }else if(plugins.isMobileStatus() === "horizontal"){
                    horizontal.cameraLeft(); 
                }
            }

            //中小屏模式
            if(config.screenMode == 1 || config.screenMode == 2){
                var cw = "50%";
                if(plugins.isMobileStatus() == "vertical"){
                    if(config.screenMode == 1){
                        cw = "50%";
                    }else{
                        cw = "30%";
                    }
                    modeView_2.cameraTop(cw);
                }else{
                    horizontal.cameraLeft(); 
                }
            }

            //单摄像头模式
            if(config.screenMode == 3){
                if(plugins.isMobileStatus() == "vertical"){
                    modeView_3.cameraTop();
                }else{
                    modeView_3.cameraLeft(); 
                }
            }
        },


        //插播和桌面分享
        desktopMode: function(){
            //大屏模式
            if(config.screenMode == 0){
                 //竖屏
                if(plugins.isMobileStatus() == "vertical"){
                    desktop.verticalBigCamera();           
                }
                //横屏
                if(plugins.isMobileStatus() == "horizontal"){
                    desktop.horizontalBigCamera();
                }
            }

            //中小屏模式
            if(config.screenMode == 1 || config.screenMode == 2){
                 //竖屏
                if(plugins.isMobileStatus() == "vertical"){
                    desktop.scVerticalCamera();           
                }
                //横屏
                if(plugins.isMobileStatus() == "horizontal"){
                    desktop.scHorizontalCamera();
                }
            }


            //单摄像头
            if(config.screenMode == 3){
                  //竖屏
                if(plugins.isMobileStatus() == "vertical"){
                    modeView_3.cameraBottom();           
                }
                //横屏
                if(plugins.isMobileStatus() == "horizontal"){
                    modeView_3.cameraRight(); 
                }

            }
                   
        },

        //大屏竖屏模式下的插播和桌面分享
	    verticalBigCamera: function(){
	        setTimeout(function(){
	            $("#mtAuthorPlayer").addClass("camerahide"); 		            
	            modeView_1.cameraBottom();
	        },200);
	    },

	    //大屏模屏模式下的插播和桌面分享
	    horizontalBigCamera: function(){
            setTimeout(function(){
                horizontal.cameraRight();
                $("#mtAuthorPlayer").addClass("camerahide");
            },200);
		}, 

        //中小屏竖屏模式下的插播和桌面分享
        scVerticalCamera: function(){
            var cw = "50%";
            setTimeout(function(){ 
                if(config.screenMode == 1){
                    cw = "50%";
                }else{
                    cw = "30%";
                }               
                modeView_2.cameraBottom(cw);
            },200);
        },

        //中小屏屏模屏模式下的插播和桌面分享
        scHorizontalCamera: function(){
            setTimeout(function(){
                horizontal.cameraRight();
                $("#mtAuthorPlayer").css({
                    width: 1,
                    height: 1
                });
            },200);
        },

    }
    // 暴露接口
    module.exports = desktop;
});

