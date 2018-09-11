/**
 * @name set.js
 * @note  设置模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD"),
        tools = require("./tools"),
        config = require("./global.config"),
        plugins = require("./plugins");

    // 设置模块
    var set = {
        
        HT: null,
        room: null,

        // 是否加载过设置模板
        isload: false,   

        // 0 ppt模式,2、桌面分享和视频插播
        mode: 0, 

        // 默认开启,摄像头是否关闭默认开启
        isOpenCamera: true,
        isNewNotify: false,
        $target: $("#set"),

        // 绑定
        binds: function(){
            var that = this;

            //屏幕切换
            $("#set").on("click",".screen_change",function(){
                that.screenChange();
            });

            //收起
            $("#set").on("click",".toggle",function(){
                that.drawBack();
            });

            //返回
             $("#set").on("click",".back_btn",function(){
                that.backMenu();
            });

            // 开关摄像头
            $("#set").on("click",".video_status",function(){
                that.toggleMedia();
            });

            //网络选择
            $("#set").on("touchend",".net_choice",function(){
                that.netSelect();
            });
        },

        //屏幕切换
        screenChange: function(){
            var that = this;
            var $sChange = $("#set .screen_change");

            // 视频切换
            that.room.toggleRender();

            // 图标渲染
            if($sChange.find("i").hasClass("schange")){
                $sChange.find("i").removeClass("schange");
                $(".mod_ppt_wrap").data("switch",false);
                if($("#mtAuthorPlayer").hasClass("camerahide")){
                    plugins.currentTable("音频"); 
                }else{
                    plugins.currentTable("视频"); 
                }
            }else{
                // return false;
                $sChange.find("i").addClass("schange");
            }   
        },

        //收起
        drawBack: function(e){
            var that = this;
            if(config.cameraStatue === "start"){
                that.room.changeTab("video");
            }else{
                that.room.changeTab("chat");
            }
            $(".set_menu").hide();
        },

       // 加载设置配置
        setup: function(){
            var that = this;
            
            // set
            if(!that.isload){
                var setTemp = TMOD("set_mod_tmp", {});
                $("#set").append(setTemp);
                that.initRender();
                that.isload = true;
            }else{
                that.initRender();
            }

        },

        // 设置初始化渲染(mark.)
        initRender: function(){

            // 兼容模式
            if(config.isCompatible){
                $(".video_status").remove();
                $(".screen_change").remove();
            }
            
            // 配置强语音
            if(config.forceAudio){
                $(".video_status").remove();
                $(".screen_change").remove();
            }

            // 未打开摄像头
            if(config.cameraStatue === "stop"){
                $(".video_status").hide();
                /*$(".screen_change").hide();*/
            }else{
                $(".video_status").show();
                $(".screen_change").show();
            }

            // 手动关闭摄像头
            if(config.manualClose){
                $(".screen_change").hide();
            }
        },

        //摄像头 | 语音切换
        toggleMedia: function(){
            var that = this,
                $videoStatus = $("#set .video_status"),
                $cameraIcon = $videoStatus.find("i"),
                $ti = $videoStatus.find("span");

            // 开启视频
            if($cameraIcon.hasClass("cvideo")){
                $cameraIcon.removeClass("cvideo");
                $ti.html("开启音频");
                $("#tab_video").html("视频");
                $("#set .screen_change").show();
                that.HT.changeMedia("video");
                config.manualClose = false;
            }

            // 开启语音
            else{
                $cameraIcon.addClass("cvideo");
                $ti.html("开启视频");
                $("#tab_video").html("音频");
                $("#set .screen_change").hide();
                that.HT.changeMedia("audio");
                config.manualClose = true;
            }

            // 手动操作视频区域
            that.room.manualToggle();                   
        },


        //网络选择
        netSelect: function(){
            $(".mod_modules").addClass("st");
            $("#network").show();
            $("#set").find(".set_menu").hide();
            plugins.isVideo();
            var netTemp = TMOD("net_mod_temp",{}); 
            if($(".mod_network li").length == 0){
                $("#set").append(netTemp);
                plugins.isVideo();
                set.getOperator();
            }
        },

        // 运营商
        getOperator: function() {
            var lis = "";
            var that = this;
            if(this.times && this.times > 0){
                $('.network_cont').show();
                return false;
            }
            //获取源
            set.HT.getSource(function(sourceCount){
                var lis= "";
                for(var i= 0;i< sourceCount;i++){
                    lis +='<li id="route_'+i+'"data-key='+i+'><span>'+ "线路"+(i+1)+'</span></li>';
                }
                $("#select_network").append(lis);
                var key = sessionStorage.getItem("key");
                $("#route_0").addClass("clickstyle");
            });

            //选择
            $('#network_chooese').on('touchend','li', function() {
                $(this).addClass("clickstyle").siblings().removeClass("clickstyle");
                var sourceNum = $(this).data("key");
                sessionStorage.setItem("key",sourceNum);
                set.HT.changeSource(""+sourceNum+"",function(ret){
                    /*if(ret.code == 0){*/
                        $(".net_sucess").show();
                        plugins.cameraShow();//显示摄像头
                        setTimeout(function(){
                            $(".net_sucess").hide();
                            $("#network").hide();
                        },500)
                    /*}*/
                });


                $(".net_sucess").show();
                plugins.cameraShow();//显示摄像头
                setTimeout(function(){
                    $(".net_sucess").hide();
                    $("#network").hide();
                },500);
                $(".find_nav_list").css("left","0");
                $(".sideline").animate({
                    right:0
                },100);
                $(".ht_nav_list li").removeClass("selected");
                $("#tab_set").addClass("selected");
                $(".set_menu").show();
            });
        },

        //返回设置菜单栏
        backMenu: function(){
            $(".mod_modules").removeClass("st");
            $("#set").find("#mod_notice").hide();
            $("#mod_menu").show();
            $("#set").find(".set_menu").show();
            $("#set").find(".mod_network").hide(); 
            plugins.cameraShow();       
        },

        // 初始化
        init: function(HTSDK, room){
            set.HT = HTSDK;
            this.binds();
            this.room = room;
        }
    };
    // 暴露接口
    module.exports = set;
});

