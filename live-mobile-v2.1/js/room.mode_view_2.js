/**
 * 房间模式2
 * 针对中小摄像头开关渲染
 */
"use strict";

define(function(require, exports, module){
	var config = require("./global.config"),
        horizontal = require("./room.horizontal"),
        camera = require("./camera"),
        plugins = require("./plugins");

    var modeView2 = {

        $cameraContainer: $("#ht_camera_container"),//包裹摄像头的外层容器

        $pptWrap: $(".mod_ppt_wrap"),//包裹PPT的容器
        //中小摄像头竖屏
        vertical: function() {
            var that = this; 
            $("#voice_bg").remove();
            that.verticalClearStyle();//竖屏时清除模屏的样式
            var  cw = "50%";
            //中屏
            if(config.screenMode == 1){
                 cw = "50%";
            }
            //小屏
            else if(config.screenMode == 2){
                 cw = "30%";
            }
            //桌面分享插播
            if(config.currentMode == 2){
                that.cameraBottom(cw);
            }
            // 课件模式
            else{
                if(config.cameraStatue == "start"){
                    if(config.switchFlag){
                        that.cameraTop(cw);
                    }else{
                        that.cameraBottom(cw);
                    }
                }else{
                    that.cameraBottom(cw);
                }
            
            }        
        },

        //中小屏摄像头模屏
        horizontal: function(params) {
            $("#voice_bg").remove();
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

        //中小屏摄像头在下
        cameraBottom: function(cw){

            var _that = this,
                $autoPlayer= $("#mtAuthorPlayer"); 

            _that.topClearStyle();
            _that.chatSelect();    

            //ppt设置宽高
            _that.$pptWrap.height($("#mod_ppt").height());
            _that.$pptWrap.width($("#mod_ppt").width());

            //摄像头设宽高
            _that.$cameraContainer.addClass("smallScreen");
            _that.$cameraContainer.css("width",cw);
            _that.$cameraContainer.css("top",$("#mod_ppt").height()+36);
            _that.$cameraContainer.height(_that.$cameraContainer.width()*0.75);

            if(plugins.isAndroid()){
                modeView2.verticalForAndroid();
            }else{
                $autoPlayer.height(_that.$cameraContainer.width()*0.75);
                $autoPlayer.width(_that.$cameraContainer.width());
            }
            
            $("#mtAuthorPlayer").css("right",0);
            _that.$cameraContainer.removeClass("add_bg");

            $(".h_opration").addClass("hidden");
            $("#mode_chat_post").removeClass("showemtion");
            $("#pop_emotis").hide();

            if(config.cameraStatue != "start"){
                $(".online_total").css("top","5px");
                $("#mtAuthorPlayer").addClass("camerahide");
            }else{
                $(".online_total").removeClass("hidden");
                $(".online_total").css("top",$("#mtAuthorPlayer").height()+5);
                $("#mtAuthorPlayer").removeClass("camerahide");
                $("#ht_camera_container").removeClass("move");
            }


            config.switchFlag = false;//用于标记是否切换
            plugins.pptReset($("#mod_ppt").width(),$("#mod_ppt").height());
            //切换之后跳转到聊天
            modeView2.cameraStatus();
        },
        
        //中小屏摄像头在上
        cameraTop: function(cw){
            var _that = this,
                $autoPlayer= $("#mtAuthorPlayer");  
             /*alert("4455");   */
            //重置样式
            $("#tab_video").hide();
            $(".voice_content").hide(); 
            $(".section_wrap").removeClass('horizontal');
            $("body").removeClass("landscape");
            _that.$cameraContainer.removeClass("smallScreen"); 
            _that.$cameraContainer.attr("style","");
            _that.$pptWrap.attr("style",""); 

            //ppt切换后重置

            setTimeout(function(){
                _that.$pptWrap.addClass("smallppt");
                _that.$pptWrap.css("width",cw);
                _that.$pptWrap.css("top",$("#mod_ppt").height()+36);
                _that.$pptWrap.height(_that.$pptWrap.width()*0.75);

                plugins.pptReset(_that.$pptWrap.width(),_that.$pptWrap.height());
            },500)
            

            //摄像头切换重置
            _that.$cameraContainer.css("top",0);
            $("#mtAuthorPlayer").css("right",0);
            _that.$cameraContainer.removeClass("add_bg");
            $(".online_total").css("top",_that.$pptWrap.height()+5);
            _that.$cameraContainer.height($("#mod_ppt").height());
            _that.$cameraContainer.width($("#mod_ppt").width());
            if(plugins.isAndroid()){
                modeView2.verticalForAndroid();
            }else{
               $autoPlayer.height($("#mod_ppt").height());
               $autoPlayer.width($("#mod_ppt").width());  
            }
            _that.chatSelect();
            config.switchFlag = true;//用于标记是否切换

            /*setTimeout(function(){
                plugins.pptReset(_that.$pptWrap.width(),_that.$pptWrap.height());
            },500);*/
            

            _that.$cameraContainer.removeClass("move");
            $autoPlayer.removeClass("camerahide"); 

            
        },

        onCameraPlay: function(){
            // todo...
        },

        onCameraPause: function(){
            // todo...
        },

        //摄像头的状态
        cameraStatus: function(){
            if($(".video_status i").hasClass("cvideo")){
                if(plugins.isMobileStatus()=== "horizontal"){
                    $("#mod_menu_head li").removeClass("selected");
                    $("#tab_chat").addClass("selected"); 
                    $("#tab_video").hide();
                    $(".h_opration").removeClass("hidden");
                    $("#chat").show();
                }else{
                    $(".online_total").css("top",5);       
                }
                $("#mtAuthorPlayer").addClass("camerahide");
            }           
        },

        //摄像头在上时清除样式
        topClearStyle: function(){
            var _that = this;
            $("#tab_video").hide();
            $(".voice_content").hide();      
            $("#voice_bg").remove();
            _that.$pptWrap.removeClass("smallppt");
            $(".section_wrap").removeClass('horizontal');
            $("body").removeClass("landscape");
            _that.$cameraContainer.attr("style","");
            _that.$pptWrap.attr("style","");
            $("#icon_change").removeClass("schange");
        },

        //竖屏下清除样式
        verticalClearStyle: function(){
            $(".section_wrap").removeClass('horizontal');
            $("body").removeClass("landscape");
            $(".mod_menu").removeClass("close");
            $(".mod_menu").removeClass("open");
            $(".mod_modules").removeClass("close");
            $(".mod_modules").removeClass("open");
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

         //中小屏竖屏针对android 6.0.1黑屏
        verticalForAndroid: function(){
            var _that = this,
                $autoPlayer = $("#mtAuthorPlayer");
            if(config.switchFlag){//摄像头切换到上面
                if(config.cameraStatue === "start"){
                    if(!config.isOpen){
                        camera.cameraHide();
                    }else{
                        $autoPlayer.height($("#mod_ppt").height());
                        $autoPlayer.width($("#mod_ppt").width());  
                    } 
                }else{
                    camera.cameraHide();
                }

            }else{//摄像头切换到下面
                if(config.cameraStatue === "start"){
                    if(!config.isOpen){
                        camera.cameraHide();
                    }else{
                        // 兼容处理
                        if(!config.isCompatible){
                            $autoPlayer.height(_that.$cameraContainer.width()*0.75);
                            $autoPlayer.width(_that.$cameraContainer.width());
                        }
                    } 
                }else{
                    camera.cameraHide();
                    
                }   
            }
            
        },


    }
    module.exports = modeView2;
});