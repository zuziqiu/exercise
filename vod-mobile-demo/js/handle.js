/**
 * 操作差异化模块
 */
"use strict";

define(function(require, exports, module){

    var config = require("./global.config"),
        plugins = require("./plugins"),
        TMOD = require("TMOD"),
        tools = require("./tools");

    module.exports = {
        
        // 导航切换差异化
        navChangeDiff: function(tab){

            tools.log("navChangeDiff ....");

             // 竖屏
            if(config.rotationType === "vertical"){
                // 模式 => [0] ---> 大屏模式
                // =========================
                if(config.screenMode == 0){
                    // 未切换，大屏差异化处理
                    if(!config.switchFlag){
                        // 切换到 video 标签打开视频
                        if(tab === "video"){
                            this.camera.cameraShow();
                        }else{
                            this.camera.cameraHide();
                        }
                    }
                    // 已切换, 切换时隐藏文档
                    else if(config.switchFlag){
                        // 切换到 video 标签打开PPT
                        if(tab === "video" && config.hasDocument){
                            this._document.show();
                            this.camera.cameraShow();
                        }else{
                            this._document.hide();
                            this.camera.cameraShow();
                        }
                    }
                }

                // 中||小
                else{
                    if(!config.switchFlag){
                        if(tab === "set"){
                            this.camera.cameraHide();
                        }else{
                            this.camera.cameraShow();
                        }
                    }else{
                        if(tab === "set"){
                            this._document.hide();
                        }else{
                            this._document.show();
                        }
                    }
                }
            }

            // 横屏
            else{
                // 未切换，大屏差异化处理
                if(!config.switchFlag){
                    // 切换到 video 标签打开视频
                    if(tab === "video"){
                        this.camera.cameraShow();
                    }else{
                        this.camera.cameraHide();
                    }
                }
                // 已切换, 切换时隐藏文档
                else if(config.switchFlag){
                    // 切换到 video 标签打开PPT
                    if(tab === "video" && config.hasDocument){
                        this._document.show();
                        this.camera.cameraShow();
                    }else{
                        this._document.hide();
                        this.camera.cameraShow();
                    }
                }
            }
        },

        // 点击开始
        liveStart: function(){

            var that = this;

            // show icon
            $("#click_play").show();

            //执行，去掉阴影层，播放按钮
            $("#click_play").on("click", function(){

                // 播放
                that.camera.__MT.play();
                
                // 注册手动点击事件
                config.manualHandle = true;

                // 开启摄像头
                // that.camera.cameraShow();

                // 提示窗口隐藏
                $(this).hide();
                $("#tab_set").show();
                $("#pop_compatible").hide();
            });
        },

        // 切换屏幕操作
        toggled: function(){

            // 切换组
            this.camera.toggled();
            this._document.toggled();

            // 所在 tab 是否可以显示摄像头
            // this.navChangeDiff();
            // 切换到聊天
            // this.nav.changeTo("first");
        },

        // 翻页操作
        setPage: function(page){

            tools.log("翻页setpage ===> " + page);

            // 保证只设置一次
            // 下课再上课重新初始化状态
            if(!config.hasDocument){
                
                // 存在文档
                config.hasDocument = true;
                if (!config.isFullScreen) {
                    // 重置渲染结构
                    this.roomViewerRebuild();
                }
            }

        },

        // 模式切换
        modeChange: function(mode){

            // 桌面分享
            if(mode.currentMode == 2){
                // 还原切换
                config.switchFlag = false;

                // 恢复模式
                this.camera.cameraHide();
                this._document.onTop();
                this._document.show();
                $("#video").hide();
            }
        },

        // 进度初始化
        initProgressPanel: function(){
            if(config.rotationType === "horizontal"){
                $("#controls").removeAttr("style");
                $("#mod_main_cover").removeAttr("style");
                $("#controls").show();
                $(".full_screen").css("bottom", "30px")
            }else{
                if(plugins.docSize){
                    setTimeout(function () {
                        $("#mod_main_cover").css("height", plugins.docSize.partOfBig.height);
                        $("#controls").css("top", plugins.docSize.panelPosition);
                        $("#controls").show();
                        $(".full_screen").css("bottom","30px")
                    }, 200);
                }
            }
        },

        // 结构渲染差异化
        roomViewerRebuild: function(){
            
            /**
             * @@ ==> 考虑三种情况
             * 只存在摄像头
             * 只存在文档
             * 摄像头 & 文档全部关闭
             **/
            var that = this;
            
            // execute for init.
            if(!that.initState){
                return false;
            }

            tools.log("Enter handle....");

            // todo 其他情况可能没想到，想到的就加上去 😡。。。
            // if(config.rotationType === "vertical"){
                
                // set vod panel
                that.initProgressPanel();

                // 开启摄像头 & 无文档(单摄像头模式)
                if(config.cameraState === "start" && config.hasDocument === false){
                    // 把摄像头 -> 置顶
                    config.switchFlag = true;
                    
                    this._document.hide();
                    this.camera.onTop();

                    $("#tab_video").hide();
                    this.nav.changeTo("chat");
                }

                // 开启摄像头 & 开启文档
                else if(config.cameraState === "start" && config.hasDocument === true){
                    
                    // 把文档 -> 置顶
                    if(config.screenLocation == 0){
                        config.switchFlag = true;
                    }else{
                        config.switchFlag = false;
                    }
                    
                    this._document.onTop();
                    this.camera.onBottom();

                    this._document.show();
                    this.camera.cameraShow();

                    // tabs
                    // 桌面分享不显示
                    if(config.currentMode == 2){
                        this.camera.cameraHide();
                        this.nav.changeTo("chat");
                    }else{
                        this.nav.changeTo("video");
                    }
                }

                // 有文档 & 关闭摄像头
                else if(config.cameraState === "stop" && config.hasDocument === true){
                    // 把文档 -> 置顶
                    config.switchFlag = false;

                    this._document.onTop();
                    this._document.show();
                    this.camera.cameraHide();

                    $("#tab_video").hide();
                    this.nav.changeTo("chat");
                }

                // 关闭摄像头 & PPT
                else if(config.cameraState === "stop" && config.hasDocument === false){
                    
                    // 把文档 -> 置顶
                    config.switchFlag = false;

                     // 一开始纯桌面分享(有课程第一帧是文档)
                    if(config.currentMode == 2){
                        this._document.show();
                    }
                    // 显示纯音频的占位图
                    else{
                        // todo...
                        this._document.hide();
                    }

                    this._document.onTop();
                    this.camera.cameraHide();

                    $("#tab_video").hide();
                }

        },

        // doc & camera 位置切换
        positionChange: function(){
            
            // 还原位置
            if(config.switchFlag){
                config.switchFlag = false;
                this.camera.onBottom();
                this._document.onTop();
                this._document.show();
            }

            // 切换位置
            else{
                config.switchFlag = true;
                this.camera.onTop();
                this._document.onBottom();
                this._document.show();
            }

            this.nav.changeTo("video");

            // 重规划页面
            // this.roomViewerRebuild();
        },
        showFullScreen: function () {
            var tpl = TMOD("full_screen", {});
            $("#mod_main_player").append(tpl);
            var v_tpl = TMOD("v_full_screen", {});
            $("#ht_camera_container").append(v_tpl);
            var arous_tpl = TMOD("arouse", {});
            $("#mod_main_player").append(arous_tpl);
            $(".full_screen").hide();
            $(".v_full_screen").hide();
        },

        // 初始化执行
        initRender: function(){

            tools.log("init render handle...");

            // 初始化切换到caht
            this.nav.changeTo("chat");

            // 房间根据模块内容切换
            // this.camera.cameraHide();
            // this.roomViewerRebuild();

            // 开始...
            this.liveStart();
            this.showFullScreen();

        },

        // 初始化
        init: function(nav, room, camera, _document, desktop){

            // init object
            this.nav = nav;
            this.camera = camera;
            this.room = room;
            this._document = _document;
            this.desktop = desktop;
            
            // 房间初始化执行
            this.initRender();
            
            // 操作初始化 
            this.initState = true;
        }
    }
});