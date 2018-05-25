/**
 * @name camera.js
 * @note  视频模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD");
        config = require("./global.config"),
        plugins = require("./plugins");
        
    // 视频模块
    var modCamera = {
        __MT: null,
        cameraLoad: false,
        camera: null,//摄像头对象
        initStatue: false,
         
        //添加摄像头对象
        appendCamera: function(){
            //只允许进入一次
            if(!this.cameraLoad){
                this.cameraLoad = true;
            }
            $("#load_tips").hide();
        },
        // 获取&设置-摄像头
        setCamera: function(camera){
            this.camera = camera;
            $("#ht_camera_container").append(camera);
        },

        // 摄像头重置
        restCamera: function(){
            if(config.mediaSwitch == "video"){
                $("#mtAuthorPlayer").removeClass("camerahide");
                $("#ht_camera_container").removeClass("move");
                if(config.switchFlag){
                    $("#mtAuthorPlayer").css({
                        width: $("#mod_ppt").width(),
                        height: $("#mod_ppt").height()
                    });
                }else{
                    $("#mtAuthorPlayer").css({
                        width: $(".mod_modules").width(),
                        height: $(".mod_modules").height()
                    });
                }
            }else{
                $("#mtAuthorPlayer").css({
                    width: 1,
                    height: 1
                });
            }
        },

        cameraShow: function(){
            // todo...
        },

        // 摄像头重置
        onCameraResize: function(){
            // alert(200);
        },

        // 设置摄像头容器尺寸
        setCameraSize: function(w, h){
            var that = this;
            if(that.camera){
                $(that.camera).css({
                    width: w,
                    height: h
                });
            }
        },

        // 隐藏camera
        cameraHide: function(fource){
            // 如果兼容模式, 不执行
            if(!fource){
                if(config.isCompatible){
                    return false;
                }
            }
            var that = this;
            $(that.camera).css({
                display: "block",
                width: 1,
                height: 1,
                position: "absolute",
                "z-index": 1000,
                left: 0,
            });
        },

        // 点击播放
        liveStart: function(e){
            var screenLocation =  window.screenLocation;
            if(!this.addPlayEvent){
                //执行，去掉阴影层，播放按钮
                $("#click_play").on("click",function(){
                    $(this).hide();
                    modCamera.doliveStart();
                    modCamera.__MT.play();
                    if(config.cameraStatue == "stop"){
                        setTimeout(function(){
                            plugins.videoHide();
                        },50);
                       
                    }    
                });
                this.addPlayEvent = true;
            }
            $("#click_play").show();
        },

        //当视频区域在下边时
        videoBottom: function(){
            var userAgent =  navigator.userAgent;
            var uaApp = navigator.userAgent.toLowerCase();
            var screenLocation =  window.screenLocation;
            //猎豹浏览器的情况下
            if( screenLocation == "1"){
                // todo...
            }
        },

        doliveStart: function(){
            $(".mod_room_compatiable").hide();
        },
        
        //大屏模式下显示语音背景图，其它隐藏
        isShowVoicebg: function(){
            if(window.screenMode== 0){//大屏模式
                var switchFlag= $(".mod_ppt_wrap").data("switch");  
                $("#voice_bg").show();
                if(switchFlag){
                    $("#ht_camera_container").width($("#mod_ppt").width());
                    $("#ht_camera_container").height($("#mod_ppt").height());
                }else{
                    $("#ht_camera_container").width($(".mod_modules").width());
                    $("#ht_camera_container").height($(".mod_modules").height());
                }
            
            }else{//中小屏模式
                if(plugins.isMobileStatus()=== "vertical"){
                    $("#voice_bg").hide();
                    $(".online_total").css("top",5);
                }        
            } 
        },


        //设备判断
        whatSet: function(status){
             var sUserAgent = navigator.userAgent.toLowerCase();
             config.cameraStatue = status; 
            //iphone
            if($("#mtAuthorPlayer").hasClass("camera_iphone")){
                $("#mtAuthorPlayer").hide();
                plugins.currentTable("音频");
                modCamera.isShowVoicebg();
            }   
            else if($("#mtAuthorPlayer").hasClass("camera_wechat") && sUserAgent.match(/iphone os/i) == "iphone os"){ 
                if(config.cameraStatue != "start"){
                    $("#mtAuthorPlayer").addClass("wechatIphone");
                    modCamera.isShowVoicebg();
                    plugins.currentTable("音频");
                }else{
                    $("#mtAuthorPlayer").removeClass("wechatIphone");
                    $("#mtAuthorPlayer").removeClass("camerahide");
                    modCamera.diffRestSize();      
                    //  横屏切换
                    if (plugins.isMobileStatus()=== "horizontal"){
                        $("#mtAuthorPlayer").height("auto"); 
                    }            
                    $("#voice_bg").hide();
                    plugins.currentTable("视频");
                } 
                
            }  
            else if($("#mtAuthorPlayer").hasClass("camera_ipad")){
                if(status=== "stop"){
                    $("#mtAuthorPlayer").addClass("wechatIphone");
                    plugins.currentTable("音频");
                }else{
                    $("#mtAuthorPlayer").removeClass("wechatIphone");
                    $("#mtAuthorPlayer").removeClass("camerahide");
                    $("#mtAuthorPlayer").width($("#ht_camera_container").width());
                    if (plugins.isMobileStatus()=== "vertical") {    
                        $("#mtAuthorPlayer").height($("#ht_camera_container").height()); 
                        if(window.screenMode== 1 || window.screenMode== 2){
                            $(".online_total").css("top",$("#ht_camera_container").height()+5);
                        }                            
                    }
                    //  横屏切换
                    if (plugins.isMobileStatus()=== "horizontal"){
                        $("#mtAuthorPlayer").height("auto"); 
                    } 
                    plugins.currentTable("视频");
                    $("#voice_bg").hide();
                }    
            }
            //安卓
            else{
                if(config.cameraStatue != "start"){
                    modCamera.cameraHide(); 
                    $(".online_total").css("top","5px");

                    $("#set .video_status").hide();
                    $("#set .screen_change").hide();
                    plugins.currentTable("音频");
                }else{
                    $("#mtAuthorPlayer").removeClass("camerahide");
                    $("#ht_camera_container").removeClass("move");
                    $("#set .video_status").show();
                    $("#set .screen_change").show();

                    if (plugins.isMobileStatus()=== "vertical") {    
                        
                        // 高度
                        if(!config.isCompatible){
                            $("#mtAuthorPlayer").height($("#ht_camera_container").height());
                        }

                        if(window.screenMode == 1 || window.screenMode == 2){
                            $(".online_total").css("top",$("#ht_camera_container").height()+5);
                        }                            
                    } 
                    //  横屏切换
                    if (plugins.isMobileStatus()=== "horizontal"){
                        $("#mtAuthorPlayer").height("auto"); 
                    } 
                    
                    // 宽度
                    if(!config.isCompatible){
                        $("#mtAuthorPlayer").width($("#ht_camera_container").width());
                    }else{
                        if(config.cameraStatue === "start"){
                             $("#mtAuthorPlayer").css({
                                "width": "100%"
                             })
                        }
                    }

                    plugins.currentTable("视频");
                    $("#voice_bg").hide();

                }
            }

            //大屏模式下如果摄像头开启
            if(window.screenMode == 0){
                $(".ht_nav_list li").removeClass("selected");
                if(config.cameraStatue == "start"){
                    $("#tab_video").addClass("selected");   
                    $("#chat").hide();
                    $("#ht_camera_container").removeClass("move");  
                    plugins.switchFirstTab();
                    if(!$("#tab_video").hasClass("selected")){
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }
                }else{ 
                    $("#tab_chat").addClass("selected");    
                    $("#chat").show();    
                    $("#ht_camera_container").removeClass("move");
                    $("#voice_bg").hide(); 
                    if(config.isCompatible){
                        return false;
                    }

                }
            }else{
                if(plugins.isMobileStatus()=== "horizontal"){
                    if(config.cameraStatue == "start"){
                        $("#tab_video").show();
                        $("#mod_menu_head li").removeClass("selected");
                        $("#tab_video").addClass("selected");
                        $("mtAuthorPlayer").removeClass("camerahide");
                        $(".h_opration").addClass("hidden");
                        $("#chat").hide();
                        $("#ask").hide();
                    }else{
                        if($("#tab_video").hasClass("selected")){
                            $("#mod_menu_head li").removeClass("selected");
                            $("#tab_chat").addClass("selected"); 
                            $("#chat").show();
                        }
                        $(".h_opration").removeClass("hidden");
                        $("mtAuthorPlayer").addClass("camerahide");
                        $("#tab_video").hide();
                    }
                }else{
                    if($("#tab_set").hasClass("selected")){
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }
                }       
            };
        },                                                 
        
        //针对不同的摄像头大小作相应的尺寸调整
        diffRestSize: function(){
            if(config.screenMode == 0){
                $("#mtAuthorPlayer").width($("#ht_camera_container").width());
                $("#mtAuthorPlayer").height($("#ht_camera_container").height());
            }else{
                var cw = "50%"; 
                if(config.screenMode == 1){
                    cw = "50%";
                }else if(config.screenMode == 2){
                    cw = "30%";
                }

                if(config.screenLocation == 1 && plugins.isMobileStatus() == "vertical"){
                    $("#ht_camera_container").css("width",cw);
                    $("#ht_camera_container").css("top",$("#mod_ppt").height()+36);
                    $("#ht_camera_container").height($("#ht_camera_container").width()*0.75);
                    $("#mtAuthorPlayer").height($("#ht_camera_container").width()*0.75);
                    $("#mtAuthorPlayer").width($("#ht_camera_container").width());
                }            
                if(plugins.isMobileStatus() == "vertical"){
                    $(".online_total").css("top",$("#mtAuthorPlayer").height()+5);
                }          
            }
        },


        init: function(HTSDK){
            this.videoBottom();         
            modCamera.__MT= HTSDK; 
            //modCamera.liveStart();
        }
    };
    // 暴露接口
    module.exports = modCamera;
});

