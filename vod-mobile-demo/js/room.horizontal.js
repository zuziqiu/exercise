/**
 * @name room.horizontal
 * @author [H.Liang]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
	
    var config = require("./global.config"),
        camera = require("./camera"), // 视频模块
        tools = require("./tools"),
        PPT = require("./ppt"),
	    plugins = require("./plugins");
   
    /**
     * @读取 config. 配置
     * @房间横屏模式
     * @横屏逻辑处理集中在这个文件处理
     */
    var horizontal = {
    	
        // room
        room: null,

        // 拉伸 & 切换 need to optimize...
        stretchToggle: function(target){
            
            var that = this;
            
            // 收起
            if($(target).hasClass("recover")){
                $(target).removeClass("recover");
                
                $(".mod_modules").addClass("open");
                $(".mod_modules").removeClass("close");
                
                $("#mod_menu").addClass("open");
                $("#mod_menu").removeClass("close");
                
                $(".h_opration .set_icon").show();
                $("#mod_main_player").removeAttr("style");

                $(".mod_ppt_wrap").removeClass("setcw");
                $("#ht_camera_container").removeClass("moveout");				
            }
            // 展开
            else{
                $(target).addClass("recover");
                
                $(".mod_modules").addClass("close");
                $(".mod_modules").removeClass("open");

                $("#mod_menu").removeClass("open");
                $("#mod_menu").addClass("close");

                $(".h_opration .set_icon").hide();
                $(".mod_ppt_wrap").addClass("setcw");

                $("#ht_camera_container").addClass("moveout");
                $("#mod_main_player").removeAttr("style");			
            }

            // 是否拉伸
            if(!that.isStretch){
                that.isStretch = true;
            }else{
                that.isStretch = false;
            }

            tools.debug("horizontal stretch => " + that.isStretch);

            // 已切换视频(Video为主)
            if(config.switchFlag){
                
                // 清空
                $(camera.cameraWrap).removeAttr("style");

                // 拉伸
                if(that.isStretch){
                    camera.resize($(camera.cameraWrap).width() - 20, $(camera.cameraWrap).height()); // 20px.预留视频区域
                    // camera.cameraHide();
                    PPT.hide();
                    that.room.changeTab("chat");
                }
                // 收起
                else{
                    camera.resize($(window).width() * 0.7, $(window).height());
                    if(config.cameraStatue === "start"){
                        // camera.cameraShow();
                        PPT.show();
                        // PPT.resize();
                        PPT.resize($(PPT.container).width(), $(PPT.container).height());
                        that.room.changeTab("video");
                    }
                }
            }
            // 未切换(PPT为主)
            else{

                // 清空
                $(PPT.container).removeAttr("style");
                
                // 拉伸
                if(that.isStretch){
                    // 拉伸自身div => 100%
                    PPT.resize($(PPT.container).width(), $(PPT.container).height());
                    camera.cameraHide();
                    that.room.changeTab("chat");
                }
                // 收起
                else{
                    // 去掉拉伸类的 => 100%
                    PPT.resize($(PPT.container).width(), $(PPT.container).height());
                    if(config.cameraStatue === "start"){
                        camera.cameraShow();
                        that.room.changeTab("video");
                    }
                }
            }
        },

        // 标签切换
        tabSwitch: function(tab){
            tools.debug(tab);
            var that = this;
            // 切换后
            if(config.switchFlag){
                camera.cameraShow();
                if(tab === "video"){
                    PPT.show();
                }else{
                    PPT.hide();
                }
            }
            // 一般模式
            else{
                if(config.cameraStatue === "start"){
                    if(tab === "video"){
                        camera.cameraShow();
                    }else{
                        camera.cameraHide();
                    }
                }
            }
        },

        // 切换区域
        horizontalToggle: function(){
            // alert("todo..")

            var that = this;

            // clear.
            // this.clearSyle();

            // cons.
            var pptCon = {
                width: $("#mod_ppt").width(),
                height: $("#mod_ppt").height()
            };
            // cam.
            var camCon = {
                width: $("#mod_modules").width(),
                height: $("#mod_modules").width() * 0.75
            };

            // 已切换
			if(config.switchFlag){
				// mark.
				$(camera.cameraWrap).removeClass("camerahs");
                $(PPT.container).removeClass("ppths");
				PPT.show();

                // camera => PPT
                PPT.resize(pptCon.width, pptCon.height);
			    camera.resize(camCon.width, camCon.height);
                
                // toggle.
                config.switchFlag = false;

			}
			// 未切换
			else{
                // mark.
				$(camera.cameraWrap).addClass("camerahs");
                $(PPT.container).addClass("ppths");

                // PPT => camera
                PPT.resize(camCon.width, camCon.height);
			    camera.resize(pptCon.width, pptCon.height);

				// toggle
                config.switchFlag = true;
            }

            // change video.
            that.room.changeTab("video");
        },

        // 摄像头开关📹
		cameraState: function(state){
			if(state === "start"){
				this.room.changeTab("video");
			}else{
				this.room.changeTab("chat");
			}
		},

        // set ppt seize
        setPPT: function(){
            var pptCon = {
                width: $("#mod_ppt").width(),
                height: $("#mod_ppt").height()
            };
            // ppt.
            PPT.resize(pptCon.width, pptCon.height);
        },

        // 手动开关视频
        manualToggle: function(){
            // console.warn(config);
        },

        // global
        initSetting: function(){

            $(".section_wrap").addClass('horizontal');
            $("#tab_video").show();
            
            // 切换初始化
            if(config.cameraStatue === "start"){
                this.room.changeTab("video");
            }else{
                this.room.changeTab("chat");
            }
        },

        // 设置camera.
        setCamera: function(){
            var cam = {
                width: $("#mod_modules").width(),
                height: $("#mod_modules").width() * 0.75
            };
            
            // 设置摄像头初始化宽高
            camera.resizeWidth = cam.width;
            camera.resizeHeight = cam.height;
            
            // 需用户打开摄像头
            if(config.cameraStatue === "start"){
                camera.resize(cam.width, cam.height);
                // 切换到video.
                this.room.changeTab("video");
            }
        },

        // 渲染
        render: function(){
            
            // global setting.
            this.initSetting();

            // ppt setsize.
            this.setPPT();

            // set camera.
            this.setCamera();

            // nav.init
            this.room.initNav(1);
        },

        // 横屏初始化(处理细节)
        /**
         * @视频开关差异化
         * @默认切换tab
         * @添加渲染类
         */
    	init: function(room){

            tools.debug("room => horizontal...");

            // copy.
            this.room = room;

            // 渲染
            this.render();
    	}
    };

   


    // 暴露接口
    module.exports = horizontal;
});

