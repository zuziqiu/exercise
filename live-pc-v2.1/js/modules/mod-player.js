/**
 * 摄像头
 * ppt播放器
 * 小班摄像头相关操作
 * 两侧收缩
 * 播放器切换
 */
(function(win){
    
    var mainPlayer = {
        
        // defines
        defaults: {
            player: null,
            camera: null,
            isShowCamera: false,
            toggled: false, //是否切换
            mode: 0, // 5=>小班  || 3=>大班
            size: {
                width: 0,
                height: 0
            },
            flexSet: {
                left: 0,
                right: 0
            }
        },

        // 设置播放器模式
        setMode: function(mode){
            this.defaults.mode = mode;
            var size = this.defaults.size;
            // 小班
            if(mode === "5"){
                size.width = 360;
                size.height = 360 * 0.75;
            }
            // 大班
            else{
                size.width = 280;
                size.height = 280 * 0.75;
            }
        },

        // 重置
        resize: function(){
            
            // des
            var camera = $("#camera_play"),
                ppt = $("mod_player_wp"),
                pptwp = $("#toggled_camera_center"),
                that = this;
            
            // 已切换
            if(that.defaults.toggled){
                var w = pptwp.width(),
                    h = pptwp.height();
                
                // that.defaults.camera.setSize(w, h);
                
                var o = that.getRatio(w, h),
                    rsLeft = (w - o.width) / 2,
                    rsTop = (h - o.height) / 2;

                this.defaults.size.width = o.width;
                this.defaults.size.height = o.height;

                // set css center
                camera.css({
                    // set => 4:3
                    width: o.width,
                    height: o.height,
                    
                    // set center
                    marginTop: rsTop,
                    marginLeft: rsLeft
                });
            }

        },

        // 事件绑定
        bindEvents: function(){

            var that = this,
                $room =  $("#room"),
                $opBtns = $("#live_tools");

            // 摄像头切换
            $opBtns.on("click", ".tools_toggle_ppt", function(event) {

                if($(this).hasClass('disable')){
                    $(this).removeClass('disable');
                    $(this).addClass('enable');
                    that.togglePlayerPosition(true);
                }else{
                    $(this).removeClass('enable');
                    $(this).addClass('disable');
                    $(".mod_main_player_wp").css("visibility","");
                    that.togglePlayerPosition(false);
                }
            });

            // 摄像开关
            $opBtns.on("click", ".tools_toggle_camera", function(event) {

                if($(this).hasClass('disable')){
                    $(this).removeClass('disable');
                    $(".mod_sider_top").removeClass('show_author');
                    if($(".mod_sider_top").hasClass("camera")){
                        $(".mod_sider_top").css("height",210);
                        $(".mod_question_wrap .mod_ques_hall").css("top",304);
                    }
                    that.cameraShow();
                    if(that.defaults.toggled){
                        that.resize();
                    }else{
                        $("#camera_play").css({
                            width: 280,
                            height: 210
                        }); 
                    }
                }else{
                    $(this).addClass('disable');
                    $(".mod_sider_top").addClass('show_author');
                    if($(".mod_sider_top").hasClass("camera")){
                        $(".mod_sider_top").css("height",0);
                        $(".mod_question_wrap .mod_ques_hall").css("top",90);
                    }
                    that.cameraHide();
                }
            });

            // 左右收缩
            $room.on("click", ".carousel", function(){
                that.toggleFlex(this);
            });
            
        },

        //摄像头区域隐藏
        cameraHide: function(){
            $("#camera_play").css({
                width: 1,
                height: 1
            }); 
        },
        //摄像头区域显示
        cameraShow: function(){
            var that = this;
            $("#camera_play").css({
                width: that.defaults.size.width,
                height: that.defaults.size.height
            });
        },

        // 左右收缩
        toggleFlex: function(el){
            var that = this,
                active = HTSDK.view.defaults.isFlex,
                $t = $(el),
                $room = $("#room"),
                $main = $("#mod_col_main"),
                $left = $("#mod_col_left"),
                $right = $("#mod_col_right"),
                $togCam = $(".toggle_carema");
            
            // left
            if($t.hasClass("left")){
                // 收起
                if($t.hasClass("active")){
                    $room.removeClass("close_left_side");
                    $t.removeClass("active");
                    $(".tools_toggle_camera").show();
                    if(HTSDK.view.currentMode == 0){
                        $(".switch_preview").hide();
                    }else{
                        $(".switch_preview").show();
                    }
                    active.left = false;
                    if(!$(".tools_toggle_camera").hasClass("disable")){
                        that.cameraShow();
                    }
                }
                // 展开
                else{
                    $room.addClass("close_left_side");
                    $t.addClass("active");
                    $(".tools_toggle_camera").hide();
                    $(".switch_preview").hide();
                    active.left = true; 
                    that.cameraHide();
                }
                $main.stop().animate({
                    left: that.defaults.flexSet.left
                }, 200, function(){
                    that.setPlayerInit();
                    that.toggleShow();
                });
            }
            // right
            else if($t.hasClass("right")){
                // 收起
                if($t.hasClass("active")){
                    $right.show();
                    $room.removeClass("close_right_side");
                    $t.removeClass("active");
                    active.right = false;
                }
                // 展开
                else{
                    $right.hide();
                    $room.addClass("close_right_side");
                    $t.addClass("active");
                    active.right = true;
                }
                $main.stop().animate({
                    right: that.defaults.flexSet.right
                }, 200, function(){
                    that.setPlayerInit();
                });
            }
            that.resize();
        },

        // PPT切换
        pptSwitch: function(){
            var that = this,
                $this = $("#live_tools .tools_toggle_ppt");

            //有ppt情况下
            if(that.isHasPPT){
                $this.removeClass('enable');
                $this.addClass('disable');
                $(".mod_main_player_wp").css("visibility","");
                that.togglePlayerPosition(false);
            }
            //没有ppt的情况
            else{
                $this.removeClass('disable');
                $this.addClass('enable');
                that.togglePlayerPosition(true);
            }  
        },

        // 清除切换
        clearToggle: function(){
            var that = this;
            $(that.defaults.player).removeAttr("style");
            $(that.defaults.camera).removeAttr("style");
        },

        // 切换位置
        togglePlayerPosition: function(flag){
            
            var that = this,
                toggleName = "toggle_video_ppt",
                camera = this.defaults.camera,
                player = this.defaults.player;

            // 已切换
            if(flag){
                that.defaults.toggled = true;
                $(".camera_warp").addClass(toggleName);
                $(".mod_main_player_wp").addClass(toggleName);
                
                var _logoData = HTSDK.modules.getlogo("mod_logo_live");
                if(_logoData.enable == "0"){
                    $("#toggled_camera_center").css('top', '32px');
                }
            }
            // 未切换
            else{
                that.defaults.toggled = false;
                $(".camera_warp").removeClass(toggleName);
                $(".mod_main_player_wp").removeClass(toggleName);
                $('.mod_main_player_wp').removeAttr("style");
                $("#camera_play").removeAttr("style");
            }

            that.resize();
            that.clearToggle();
            that.setPlayerInit();
        },

        // 摄像头层
        cameraLayer: function(flag){
            this.defaults.isShowCamera = flag;
            var that = this;
            that.isShowCamera();    
        },

        // 是否显示摄像头
        isShowCamera: function(){
            var that = this,
                $camera = $(this.defaults.camera),
                isShow = this.defaults.isShowCamera;
            if($camera){
                // 显示
                if(isShow){
                    
                    // 初始化设置
                    // $("#camera_play").css({
                    //     width: that.defaults.size.width,
                    //     height: that.defaults.size.height
                    // });
                    // console.warn(that.defaults.toggled);
                    that.resize();

                    $camera.addClass("show");
                    $(".mod_sider_top").removeClass('show_author');
                    that.cameraShow();
                }
                // 隐藏
                else{
                    $camera.removeClass("show");
                    that.cameraHide();
                }
            }
        },

        // 播放器事件绑定
        playerEvents: function(){
            var that = this,
                mainPlayer = that.defaults.player;
            // 重置高宽
            $(window).on("resize", function(){
                that.resize();
            });
            // 初始化设置
            that.setPlayerInit();
        },

        // 摄像头收缩
        toggleShow: function(){
            var that = this,
                $camera = $(that.defaults.camera),
                $player = $(that.defaults.player);
            if(that.defaults.toggled && HTSDK.view.defaults.isFlex.left){
                $player.addClass("hide");
            }else{
                $player.removeClass("hide");
            }
        },


        // 初始化设置播放器
        setPlayerInit: function(){
            var that = this,
                mainPlayer = that.defaults.player,
                el = document.getElementById("toggled_camera_center"),
                curChgObj = {},
                
                player = that.defaults.player,
                camera = that.defaults.camera;

            that.clearToggle();
            that.toggleShow();
        },

        // 获取比例
        getRatio: function(width, height){
            var _fw = width,
                _fh = height,
                ratio = 4/3, //keep ratio of 4:3;
                _w = 0,
                _h = 0;
            // 大于正常比例
            if((_fw/_fh) > ratio){
                _w = _fh*ratio;
                _h = _fh;
            }else{
                _w = _fw;
                _h = _fw/ratio;
            }
            return {
                width: _w,
                height: _h
            };
        },

        // 渲染主播播放器
        mainPlayerView: function(){
            var $el = $("#toggled_camera_center"),
                rataio = this.getRatio($el);
        },
        
        // 渲染摄像头
        cameraView: function(){
            // this.defaults.camera.setSize(280, 210);
        },

        // 声音设置
        setVolume: function(volume){
            var camera = this.defaults.camera,
                player = this.defaults.player;
            
            // 摄像头
            if(camera){
                if (camera.cameraSetVolume) {
                    camera.cameraSetVolume(volume);
                }
            }
            // 大播放器
            if(player){
                if (player.setVolume) {
                    player.setVolume(volume);
                }
            }
        },

        // 设置主播播放器
        setPlayer: function(player, callback){
            this.defaults.player = player;
            this.syncLoad();

            // 自定义设置
            if(window.location.href.indexOf("&quite") > 0){
                player.setVolume(0);
            }

            if( typeof callback === "function"){
                callback();
            }
        },
        // 设置摄像头
        setCamera: function(camera){
            this.defaults.camera = camera;
            this.isShowCamera();
            this.syncLoad();
        },
        // 异步加载
        syncLoad: function(){
            var that = this,
                defaults = this.defaults;
            if(defaults.camera && defaults.player){
                that.setPptVideoToggle(); // 渲染二分屏
                that.mainPlayerView();
                that.cameraView();
                that.playerEvents(); // 渲染初始化事件
            }
        },
        // 默认切换PPT
        setPptVideoToggle: function(){
            // window.pptDisplay 二分屏变量
            // 0: 开启二分屏模式  关闭ppt
            // 1: 关闭二分屏模式   开启
            var pptDisplay = HTSDK.plugins.defaults.pptForbid == 0,
                $toggledCamera = $("#toggled_camera_center"),
                $toggledPPT = $(".mod_main_player_wp"),
                $toggledBtn = $(".tools_toggle_ppt");
            // 是否切换 & 渲染样式
            if(pptDisplay){
                this.defaults.toggled = true;
                $(".mod_sider_top").removeClass("show_author");
                $("#room").addClass("show_video");
                $("#live_tools .tools_toggle_ppt").remove();
                $("#live_tools .tools_toggle_camera").remove();
                $(".mod_main_player_wp").addClass('toggle_video_ppt');
                $("#toggled_camera_center").addClass('toggle_video_ppt');
                $("#mod_col_main .toggle_video_ppt").addClass("ppt_hidden");
            }else{
                $("#room").addClass('close_video');
            }
            this.resize();
        },

        // 初始化操作
        initRender: function(){

            // flash init
            var swfObject = template("mod_swf_cover", {});
            $("#mod_player_wp").append(swfObject);
        },

        // 事件绑定
        init: function(type){
            this.setMode(type);
            this.bindEvents();
            this.initRender();
        }
    };

    // 暴露
    var HTSDK = win.HTSDK || {};
    HTSDK.player = mainPlayer;

})(window);
