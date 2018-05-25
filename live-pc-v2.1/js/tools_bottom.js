// 底部工具栏
HTSDK.footer = {
    target: $(".mod_footer"),
    pptIsShow: false,
    pptPage: 1,

    isHasPPT: false,//false没有ppt,ture表示有ppt
    // 事件绑定
    bindEvents: function(){

        //网络状态hover
        var $prompt = $('.tools_toggle_netprompt .focus_pro'),
            that = this;

        $prompt.parent().hover(function(){
            $prompt.show();
        },function(){
            $prompt.hide();
        });

        var $opBtns = $("#live_tools");
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

        //助教PPT预览模块
        $opBtns.on('click','.preview_btn',function(){
            MTSDK.admin.adminBox.pptPreViewRender(function(ret){
                if(ret){
                    $('.assistant_ppt').show().css({
                        'margin-top': -$(window).height()*0.9 / 2-20+'px',
                        'margin-left': -$(window).width()*0.9 / 2-20+'px'
                    });
                    $('#pop_layer').show();
                }
            });
        });
        $(window).on("resize", function(){
            $('.assistant_ppt').css({
                'margin-top': -$(window).height()*0.9 / 2-20+'px',
                'margin-left': -$(window).width()*0.9 / 2-20+'px'
            });
        });
        $('.ass_ppt_close').on('click',function(){
            $('.assistant_ppt').hide();
            $('#pop_layer').hide();
        });

        // 网络选择
        $opBtns.on("click", ".tools_toggle_network", function(event){
            MTSDK.admin.chooseNetwork.init();
        });

        // 摄像头切换
        $opBtns.on("click", ".tools_toggle_ppt", function(event) {
            if($(this).hasClass('disable')){
                $(this).removeClass('disable');
                $(this).addClass('enable');
                HTSDK.player.togglePlayerPosition(true);
            }else{
                $(this).removeClass('enable');
                $(this).addClass('disable');
                $(".mod_main_player_wp").css("visibility","");
                HTSDK.player.togglePlayerPosition(false);
            }
        });

        // 弹幕开关
        if(window.location.href.indexOf("debug=list") > -1){
            $("#danmaku_opt").show();
        }
        $opBtns.find(".danmaku_button_wrap").on("click", function(){
            $(this).toggleClass("active");
            var actived = $(this).hasClass("active");
            var _HT = HTSDK.room._HT;
            if(actived){
                _HT.emit("danmaku:open", function(){
                    // 弹幕开
                });
            }else{
                _HT.emit("danmaku:close", function(){
                    // 弹幕关
                });
            }
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
        $("#camera_play").css({
            width: 280,
            height: 210
        });
    },
    

    //初始化是否有ppt,没有则切换
    pptSwitch: function(){
        var that = this,
            $this = $("#live_tools .tools_toggle_ppt");

        //有ppt情况下
        if(that.isHasPPT){
            $this.removeClass('enable');
            $this.addClass('disable');
            $(".mod_main_player_wp").css("visibility","");
            HTSDK.player.togglePlayerPosition(false);
        }
        //没有ppt的情况
        else{
            $this.removeClass('disable');
            $this.addClass('enable');
            HTSDK.player.togglePlayerPosition(true);
        }
        
    },
    pptNewUrl : null,
    //助教ppt页
    pptPreView: function(retval){
        var that = this;
        // null, undefied 
        if(!retval.curPath){
            this.pptIsShow = false;
            //$('.preview_num').html("");
            // $(".preview_btn").hide();
            return false;
        }else {
            this.pptIsShow = true;

            if( retval.curPath != null || retval.curPath != undefined ){
                if(retval.pptUrl != that.pptNewUrl){
                    that.pptNewUrl = retval.pptUrl; 
                }
            }
            $(".preview_btn").show();
            $(".ppt_preview").show();
            //$('.preview_num').html(retval.page+'/'+retval.count);
            $('.preview_num').html(HTSDK.footer.pptPage+'/'+retval.count);
        }
        
    },

    init: function(){
        this.bindEvents();
        /*this.pptSwitch();*/
    }
};