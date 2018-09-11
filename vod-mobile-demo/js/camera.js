/**
 * @name camera.js
 * @note  视频模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    
    // 模版
    var TMOD = require("TMOD"),
        ppt = require("./ppt"),
        config = require("./global.config"),
        tools = require("./tools"),
        plugins = require("./plugins");

    // 视频模块
    var modCamera = {
        
        __MT: null,
        cameraLoad: false,
        camera: null,//摄像头对象
        cameraWrap: document.querySelector("#ht_camera_container"),

        // 初始化resize.
        resizeWidth: 0,
        resizeHeight: 0,
         
        //添加摄像头对象
        appendCamera: function(){
            //只允许进入一次
            if(!this.cameraLoad){
                this.cameraLoad = true;
            }
        },
        // 获取&设置-摄像头
        setCamera: function(camera){
            tools.debug("setCamera => ", camera);
            // video object
            if(camera){
                this.camera = camera.tech_.el_;
                this.cameraCon = camera.el_;
                this.cameraWrap = this.cameraWrap;

                // 如用户配置强制语音
                if(config.forceAudio){
                    $("#tab_video").remove();
                    this.cameraHide();
                }
                
                // 需要打开摄像头
                if(config.cameraStatue === "start"){
                    // 首次插入后，设置宽高
                    if(this.resizeWidth > 0 && this.resizeHeight > 0){
                        this.resize(this.resizeWidth, this.resizeHeight);
                    }
                }else{
                    this.cameraHide();
                }
            }
        },

        // 获取包含三个对象
        getCamera: function(){
            return {
                camera: this.camera,
                cameraCon: this.cameraCon,
                cameraWrap: this.cameraWrap
            }
        },

        // 摄像头兼容模式
        cameraCompatible: function(){
            var that = this;
            // that.cameraSetStyle("100%", "100%");
        },

        // 摄像头尺寸
        resize: function(width, height){

            var that = this;

            // 兼容模式
            if(config.isCompatible){
                that.cameraCompatible();
                return false;
            }

            // 如果用户手动关闭视频
            if(config.manualClose){
                return false;
            }

            // camera set style.
            that.cameraSetStyle(width, height);
            
        },

        // camera video 设置样式
        cameraSetStyle: function(width, height){

            var that = this;

            // todo...
            tools.debug("camera resize => ", width, height);
            
            var cmdStyle = {
                display: "block",
                width: width,
                height: height
            };

            // set seize
            $(that.camera).css(cmdStyle);
            $(that.cameraCon).css(cmdStyle);
            $(that.cameraWrap).css(cmdStyle);

            // 设置初始化宽高, 考虑异步延迟情况
            that.resizeWidth = width;
            that.resizeHeight = height;
        },

        // 隐藏摄像头(1x1)
        cameraHide: function() {
            
            tools.debug("cameraHide...");

            // 兼容模式不让摄像头隐藏
            if(config.isCompatible){
                return false;
            }

            var that = this,
                cmdStyle = {
                    display: "block",
                    width: 1,
                    height: 1,
                    position: "absolute",
                    "z-index": 1000
                };
            
            // container, cameraCon, camera 三块缩放
            if(that.camera){
                $(that.camera).css(cmdStyle);
                $(that.cameraCon).css(cmdStyle);
                $(that.cameraWrap).css(cmdStyle);
            }

            // 默认切换到 chat.
            // that.room.changeTab("chat");
        },

        // 开启摄像头
        cameraShow: function(){

            // 如果 用户手动关闭 || 强制语音 => 不开启
            if(config.manualClose || config.forceAudio){
                return false;
            }

            tools.debug("cameraShow...");

            var that = this;
            $(that.cameraCon).removeClass("camerahide");
            
            // 重置?
            that.resize(that.resizeWidth, that.resizeHeight);

            // 显示tab
            // that.room.changeTab("video");
        },

        // 摄像头暂停
        pause: function(){
            $("#click_play").show();
            $(".mod_room_compatiable").show();
            $("#btn_pp").addClass("pause");
        },

        // 等待
        waiting: function(){
            $("#load_mask").show();
            $("#btn_pp").addClass("pause");
            // $("#click_play").show();
        },

        // 视频源状态改变
        durationChange: function(){
            var that = this;

            // 切换锁
            that.openTimer = null;
            
            // 隐藏
            that.cameraHide();

            // 暂停
            that.pause();
        },

        //大屏模式下显示语音背景图，其它隐藏
        isShowVoicebg: function(){
            if(config.screenMode == 0){//大屏模式
                $("#voice_bg").show();
                $(".comm_oper").hide();
                $(".find_nav_list").css("left","0");
                $("#ht_camera_container").removeClass("move"); 
            }else{//中小屏模式
                if(plugins.isMobileStatus()=== "vertical"){
                    $("#voice_bg").hide();
                }        
            } 
        },

        // 摄像头状态
        cameraState: function(state){

            var that = this;

            /**
             * todo..配置了强制语音或切换语音模式 [state => false]
             * config.cameraStatue = false;
             */

            tools.log("摄像头状态 => " + state);

            // 记录摄像头状态
            config.cameraStatue = state;

            // 兼容模式
            if(config.isCompatible){
                // 保持切换状态
                config.switchFlag = false;
                // 切换摄像头区域
                that.room.setDefaultToggle();
                return false;
            }

            // 开启
            if(state === "start"){
                that.cameraShow();
                plugins.currentTable("视频");
            }
            // 关闭(桌面分享 || 关闭摄像头,要把PPT切换到顶部)
            else if(state === "stop"){
                that.cameraHide();
                plugins.currentTable("音频");
            }

            // 摄像头开关(模式内操作)
            that.room.cameraState(state);

            // 默认切换操作
            that.room.setDefaultToggle();

        },

        init: function(HTSDK, room){           
           modCamera.__MT = HTSDK;
           this.room = room;
        }
    };
    // 暴露接口
    module.exports = modCamera;
});

