/**
 * @name set.js
 * @note  设置模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD"),
        plugins = require("./plugins"), 
        config = require("./global.config"),
        camera = require("./camera"), // 视频模块
        horizontal = require("./room.horizontal"),
        modeView_1 = require("./room.mode_view_1"),
        barrager = require("./barrager"),
        moduleSetting = require("./module_setting"),
        modeView_2 = require("./room.mode_view_2");

    // 设置模块
    var set = {
        HT: null,
        //是否加载过设置模板
        isload: false,   
        isOpenCamera: true, //默认开启,摄像头是否关闭默认开启
        isNewNotify: false,
        $target: $("#set"),
        netObj: null,
        checkedKey: {},//运营商
        curretnKey: {},//确定后保存的信息
        initData:{},//初始化列表数据
        id: 1,//记先择的线路

        checkedKey: {},//运营商
        // 事件绑定
        events:[
            {"touchend" : ["#set .notice", "notice"]} ,//公告
            {"touchend" : ["#set .net_choice", "netSelect"]},//网络选择
            {"click" : ["#set .video_status", "closeCamera"]},//关闭摄像头
            {"click" : ["#set .back_btn", "backMenu"]},//返回
            {"click" : ["#set .toggle", "drawBack"]},//收起
            {"click" : ["#set .screen_change", "screenChange"]},//屏幕切换
            {"click" : ["#set .view_barrage", "openBarrager"]}//弹幕
        ],
        // 绑定
        binds: function(){
            var that = this;
            MT.tools.bindEvent(that.$target, that, that.events);
        },

        //弹幕
        openBarrager: function(){
            if($(this).find("i").hasClass("open")){
                $(this).find("i").removeClass("open");
                barrager.isOpenBarrage= false;
                $("#mod_ppt .barrage").hide();
            }else{
                $(this).find("i").addClass("open");
                barrager.isOpenBarrage = true;
                $("#mod_ppt .barrage").show();
            }  
        },
        

        //屏幕切换
        screenChange: function(){
            var that = this;
            set.firstTabSelect();
            if($(this).find("i").hasClass("schange")){
                $(this).find("i").removeClass("schange");
                config.switchFlag = false;
                if(config.mediaSwitch == "audio"){
                    plugins.currentTable("音频"); 
                }else{
                    plugins.currentTable("视频"); 
                }          
                if(plugins.isMobileStatus()=== "vertical") {
                    // 竖屏恢复 
                    set.verticalCameraDown();           
                }else if(plugins.isMobileStatus()=== "horizontal"){ 
                    //横屏恢复
                    set.horizontalCameraRight();
        
                } 
                
            }else{     
                $(this).find("i").addClass("schange");
                config.switchFlag = true;
                if(plugins.isMobileStatus()=== "vertical") {
                    // 竖屏切换
                    set.verticalCameraUP();           
                }else if(plugins.isMobileStatus()=== "horizontal"){ 
                    //横屏切换
                    set.horizontalCameraLeft();
                }
            }
        },

        //切完后默认选中视频tab
        firstTabSelect: function(){
            $("#mod_menu_head li").removeClass("selected");
            $("#mod_menu_head li").first().addClass("selected");
            $("#chat").hide();
            $("#ask").hide();
            $(".h_opration").addClass("hidden");
        },

        //竖屏状态下摄像头切到上面
        verticalCameraUP: function(){
            if(config.screenMode== 0){//大屏模式
                modeView_1.vertical();
            }else if(config.screenMode== 1){//中屏模式
                modeView_2.vertical();
            }else if(config.screenMode == 2){//小屏模式
                modeView_2.vertical();
            }
        },

        //竖屏状态下摄像头切到下面
        verticalCameraDown: function(){
            if(config.screenMode== 0){//大屏模式
                modeView_1.vertical();
            }else if(config.screenMode== 1){//中屏模式
                var cw= "50%";
                modeView_2.vertical();

            }else if(config.screenMode == 2){//小屏模式

                var cw= "30%";
                modeView_2.vertical();
            }

        },

        //横屏状态下摄像头在右边
        horizontalCameraRight: function(){
            if(config.screenMode== 0){//大屏模式
                modeView_1.horizontal();
                
            }else if(config.screenMode== 1){//中屏模式
                modeView_2.horizontal();

            }else if(config.screenMode == 2){//小屏模式
                modeView_2.horizontal();
            }

        },

        //横屏状态下摄像头在左边
        horizontalCameraLeft: function(){
            if(config.screenMode == 0){//大屏模式
                modeView_1.horizontal();
                        
            }else if(config.screenMode== 1){//中屏模式
                modeView_2.horizontal();

            }else if(config.screenMode == 2){//小屏模式
                modeView_2.horizontal();
            }
        },

        //收起
        drawBack: function(e){
           e.preventDefault();
           $(".set_menu").hide();
           $("#set").hide();
        },
       //加载设置模板
        addSetTemp: function(){
            var that = this;
            set.isSet();
            if(window.screenMode== 1 || window.screenMode== 2){
                if(!config.isOpen){
                    $(".screen_change").hide();
                }else{
                    if(config.cameraStatue== "start"){
                       $(".screen_change").show(); 
                    }else{
                       $(".screen_change").hide();
                    }
                }
            }
            if(!that.isload){ 
                var setTemp = TMOD("set_mod_tmp", {});
                $("#set").append(setTemp); 
               //摄像头的默认位置
                if(window.screenLocation == 0){
                    if(config.switchFlag){
                        $(".screen_change i").addClass("schange");
                    }else{
                        $(".screen_change i").removeClass("schange");
                    }
                }else{  
                    $(".screen_change i").removeClass("schange");
                }

                //中小屏模式
                if(window.screenMode == 1 || window.screenMode == 2){
                    set.closeIcon();
                }
                //中小屏模式
                else if(config.screenMode == 3){//单摄像头
                    $(".video_status").remove();
                    $(".screen_change").remove();
                }
                set.isSet();
                that.isload = true;
            }
            if(set.isNewNotify){
                $(".new_nt").show();
            }
        },


        //中小屏将音频图标改成关闭视频图标
        closeIcon: function(){
            $(".video_status i").addClass("c_camera");
            $(".video_status span").html("关闭视频");
        },

        //大屏模式下摄像头状态和不同设备的判断
        isSet: function(){
            var userAgent =  navigator.userAgent;
            var uaApp = navigator.userAgent.toLowerCase();
            var status = $("#ht_camera_container").data("status");

            // 兼容模式情况下差异
            if(config.isCompatible){
                $(".video_status").remove();
                $(".screen_change").remove();
            }

            //判断是否是iphone端的和摄像头关闭的情况下隐藏切换按钮
            if($("#mtAuthorPlayer").hasClass("camera_iphone") || config.cameraStatue === "stop" || config.cameraStatue === "wait"){
                if( userAgent.indexOf('Safari') > -1 && uaApp.match(/iphone os/i) == "iphone os" ){
                    $(".video_status i").addClass('cvideo');
                    config.mediaSwitch = "audio";

                    $(".video_status span").html("开启视频");
                    $("#set .video_status").hide();
                    /*$("#set .screen_change").hide();*/
                    
                    //var $this = $("#set .video_status");
                    //set.openVoice();
                }else{               
                    $("#set .video_status").hide();
                    $("#set .screen_change").hide();
                }
            }else{
                $("#set .video_status").show();
                $("#set .screen_change").show();
            }

        },

        //摄像头语音切换
        closeCamera: function(){
            var _that= this;
            var userAgent =  navigator.userAgent;
            if(config.switchFlag){
               $("#ht_camera_container").width($("#mod_ppt").width());
               $("#ht_camera_container").height($("#mod_ppt").height());
            }else{
               $("#mtAuthorPlayer").width($(".mod_modules").width());
               $("#mtAuthorPlayer").height($(".mod_modules").height());
            }     
            var uaApp = navigator.userAgent.toLowerCase(); 
            $cameraIcon = $(this).find("i");
            if(window.screenMode== 0){//大屏模式
                if($cameraIcon.hasClass("cvideo")){
                    set.openCamera($(this));
                    if(userAgent.indexOf('Safari') > -1 && uaApp.match(/iphone os/i) == "iphone os"){
                        set.ChangeMedia('video');
                    } 
                }else{
                    if(userAgent.indexOf('Safari') > -1 && uaApp.match(/iphone os/i) == "iphone os"){
                        set.ChangeMedia('audio');
                    }
                    set.openVoice($(this));  
                             
                }    
            }else{
                if($cameraIcon.hasClass("c_camera")){//关闭摄像头
                    set.closeSmallCamera($(this));  
                }else{//开启摄像头 
                    set.openSmallCamera($(this));             
                }   
            }            
        },

       //横屏切换时重置容器宽高
        restSize: function(){
            if(plugins.isMobileStatus() == "horizontal"){
                if(config.switchFlag){
                    $("#ht_camera_container").width($("#mod_ppt").width());
                }
            }
       },
        //中小模式下关闭摄像头
        closeSmallCamera: function($this){
            $(".video_status i").removeClass("c_camera").addClass("cvideo");
            $(".video_status span").html("开启视频");
            config.isOpen = false;
            plugins.videoHide();
            $(".ht_nav_list li").removeClass("selected");
            $(".online_total").css("top",5);
            $(".mod_ppt_wrap").show();
            $(".set_menu").hide();
            if(plugins.isMobileStatus()== "vertical"){
                set.vCloseSetStyle();                 
            }else{                
                set.hCloseSetStyle();                 
            }
        },

        //中小屏模式下竖屏状态关闭摄像头样式的设置
        vCloseSetStyle: function(){
            var cw = "50%";
            $("#tab_chat").addClass("selected");              
            $("#set").hide();
            $("#chat").show();
            if(config.switchFlag){
                if(config.screenMode == 1){
                    cw =  "50%";
                }else if(config.screenMode == 2){
                    cw =  "30%";
                }
                modeView_2.cameraBottom(cw);
               $("#mtAuthorPlayer").addClass("camerahide");
               $("#icon_change").removeClass("schange");
            }  
        },


        //中小屏模式下横屏状态关闭摄像头样式的设置
        hCloseSetStyle: function(){         
            if(config.switchFlag){
                    horizontal.cameraRight();
                    plugins.currentTable("视频");
                    $("#ht_camera_container").css({
                        width: 1,
                        height: 1
                    });
                    $(".online_total").css("top",5);
                    $("#tab_video").hide();
                    $("#icon_change").removeClass("schange");
                    $("#tab_chat").addClass("selected");
                    $(".h_opration").removeClass("hidden");
                    $("#chat").show();
            }else{
                $("#tab_chat").addClass("selected");  
                $("#tab_video").hide(); 
            }
        },

        //中小模式下开启摄像头
        openSmallCamera: function($this){
            $(".video_status i").addClass("c_camera").removeClass("cvideo");
            $(".video_status span").html("关闭视频");
            config.isOpen = true;
            plugins.videoShow();
            $(".ht_nav_list li").removeClass("selected");
            $(".set_menu").hide(); 
            $(".online_total").css("top",$("#ht_camera_container").height()+5);
            $(".mod_ppt_wrap").show();
            $(".h_opration").addClass("hidden");
            if(plugins.isMobileStatus()== "vertical"){                  
                set.vOpenSetStyle();
                var cw = "50%";
                if(!config.switchFlag){
                    if(config.screenMode == 1){
                        cw = "50%";
                    }else if(config.screenMode == 2){
                        cw = "30%";
                    }
                    $("#ht_camera_container").css("width",cw);
                    $("#ht_camera_container").css("top",$("#mod_ppt").height()+36);
                    $("#ht_camera_container").height($("#ht_camera_container").width()*0.75);
                    $("#mtAuthorPlayer").height($("#ht_camera_container").width()*0.75);
                    $("#mtAuthorPlayer").width($("#ht_camera_container").width());
                }
            }else{
                set.hOpenSetStyle();
            }
        },

        //中小屏模式下竖屏状态开启摄像头样式的设置
        vOpenSetStyle: function(){
            $("#tab_chat").addClass("selected");              
            $("#set").hide();
            $("#chat").show();
            $("#mtAuthorPlayer").removeClass("camerahide");
            $("#ht_camera_container").removeClass("move");
        },


        //中小屏模式下横屏状态开启摄像头样式的设置
        hOpenSetStyle: function(){
            $("#tab_video").addClass("selected");
            $("#tab_video").show();
            $(".h_opration").addClass("hidden");
            $("#chat").hide();
            $("#ask").hide();
            if(plugins.isMobileStatus() == "horizontal"){
                if(!config.switchFlag){
                    $("#ht_camera_container").css({
                        width: $(".mod_modules").width(),
                        height: $(".mod_modules").height()
                    })
                    $("#mtAuthorPlayer").css({
                        width: $(".mod_modules").width(),
                        height: "auto"
                    })
                }
            }
            
        }, 

        //开启摄像头
        openCamera: function($this){
            $("#chat").hide();
            $("#ask").hide();
            $this.find("i").removeClass("cvideo");
            config.mediaSwitch = "video";
            var sUserAgent = navigator.userAgent.toLowerCase(); 
            $(".video_status span").html("开启音频");
            $(".voice_bg").hide();
            $("#set .screen_change").show();
            if($("#mtAuthorPlayer").hasClass("camera_wechat") && sUserAgent.match(/iphone os/i) == "iphone os"){
                if(config.cameraStatue === "stop"){
                    $("#mtAuthorPlayer").addClass("wechatIphone");
                }else{
                    $("#mtAuthorPlayer").removeClass("wechatIphone");
                    $("#mtAuthorPlayer").removeClass("camerahide");     
                    set.rest(); 
                } 
            }else{
                $("#mtAuthorPlayer").removeClass("camerahide");       
                set.rest();
                $("#voice_bg").hide(); 
            }  
            set.jumpTo();
            $("#mtAuthorPlayer").removeClass("camerahide");
            $("#ht_camera_container").removeClass("move");
            plugins.currentTable("视频");    
        }, 


        //切换后重宽高
        rest: function(){
            if(plugins.isMobileStatus()=== "vertical") { 
                    if(config.switchFlag){
                        $("#mtAuthorPlayer").height($("#mod_ppt").height());
                        $("#mtAuthorPlayer").width($("#mod_ppt").width());
                    }else{
                        $("#ht_camera_container").height($(".mod_modules").height());
                        $("#ht_camera_container").width($(".mod_modules").width());
                        $("#mtAuthorPlayer").height($(".mod_modules").height());
                        $("#mtAuthorPlayer").width($(".mod_modules").width());  
                    }
                    
                } 
                //  横屏
                if(plugins.isMobileStatus()=== "horizontal"){ 
                   if(config.switchFlag){
                        $("#mtAuthorPlayer").height($("#room").height());
                        $("#mtAuthorPlayer").width($("#room").width()*0.7);      
                   }else{
                        $("#ht_camera_container").height($(".mod_modules").height());
                        $("#ht_camera_container").width($(".mod_modules").width());
                        $("#mtAuthorPlayer").height("auto");
                        $("#mtAuthorPlayer").width($(".mod_modules").width());      
                   }
                } 
        },

        //开启音频
        openVoice: function($this){
            $("#chat").hide();
            $("#ask").hide();
            $this.find("i").addClass("cvideo");
            config.mediaSwitch =  "audio";
            $(".video_status span").html("开启视频");
            $("#set .screen_change").hide();
          /*  var status = $("#ht_camera_container").data("status");*/
            var sUserAgent = navigator.userAgent.toLowerCase(); 
             //iphone手机的微信端
             if($("#mtAuthorPlayer").hasClass("camera_wechat") && sUserAgent.match(/iphone os/i) == "iphone os"){
                    if(config.cameraStatue=== "stop"){
                        $("#mtAuthorPlayer").addClass("wechatIphone");
                         $(".voice_bg").show();
                    }else{
                        $("#mtAuthorPlayer").addClass("wechatIphone");
                        $("#mtAuthorPlayer").removeClass("camerahide");  
                        
                        $(".voice_bg").show();
                        if(config.switchFlag){
                            $("#ht_camera_container").height($("#mod_ppt").height());
                            $("#ht_camera_container").width($("#mod_ppt").width()); 
                        }else{
                             $("#ht_camera_container").height($(".mod_modules").height());
                             $("#ht_camera_container").width($(".mod_modules").width());  
                        }
                            
                    } 
            }else{       
                $("#mtAuthorPlayer").removeClass("wechatIphone");
                $("#mtAuthorPlayer").addClass("camerahide");
                $("#voice_bg").show();

                if($("#mtAuthorPlayer").hasClass("camera_ipad")){
                    if(config.switchFlag){
                        $("#ht_camera_container").height($("#mod_ppt").height());
                        $("#ht_camera_container").width($("#mod_ppt").width()); 
                    }else{
                         $("#ht_camera_container").height($(".mod_modules").height());
                         $("#ht_camera_container").width($(".mod_modules").width());  
                    }
                }
            }
            set.jumpTo();
            $("#mtAuthorPlayer").addClass("camerahide");
            var isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
            //Android处理
            if(isAndroid){
                camera.cameraHide();
            } 
            $("#ht_camera_container").removeClass("move");
            plugins.currentTable("音频");
        },

        //摄像头和ppt互换位置时再切换模式
        jumpTo: function(){
            $("#mod_menu_head li").removeClass("selected");
            $("#mod_menu_head li").first().addClass("selected");
            $(".h_opration").addClass("hidden");
            $("#set").hide();
            if(config.switchFlag){
                $(".mod_ppt_wrap").show();
                $("#ht_camera_container").height($("#mod_ppt").height());
                $("#ht_camera_container").width($("#mod_ppt").width()); 
                $("#mtAuthorPlayer").height($("#mod_ppt").height());
            }else{
                $(".mod_ppt_wrap").show();
            }
        },

        //网络选择
        netSelect: function(){
            var that = this;
            $(".mod_modules").addClass("st");
            $("#network").show();
            $("#set").find(".set_menu").hide();
            plugins.isVideo();
            
            // set network-frame
            var netTemp = TMOD("net_mod_temp", {});
            set.getOperator();

            if($(".mod_network li").size() == 0){
                $("#set").append(netTemp);
                plugins.isVideo();
            }
            
        },

         //切换网络
        getOperator: function() {
            var lis = "";
            var that = this;
            MT.network.getOperators(function(ret){
              var data = ret.data;
                if(!data){
                    return false;
                }
                //线路大于1的情况下样式
                if(ret.data.length > 1){
                    $(".choice_net").addClass("lgtwo");
                }
                for(var i=0 ; i<ret.data.length;i++){
                    if(ret.data[i].cur == 1){
                        that.initData = ret.data[i];
                        that.id = (i+1);
                        that.netObj = ret.data[that.id-1];
                    }
                }

                that.netObj.route = that.id;
                //console.warn(moduleSetting.skinTemplate);
                if( moduleSetting.skinTemplate == 1){
                    var basePath = seajs.protocol + "static-1.talk-fun.com/open/maituo_v2/css/mobile/index/img/";
                }else if(moduleSetting.skinTemplate == 2){
                    var basePath = seajs.protocol + "static-1.talk-fun.com/open/maituo_v2/css/mobile/index/drakBlueSkin/"
                }
                that.netObj.basePath = basePath;

                // 网络运营商列表渲染 
                var netListTmp = TMOD("tpl_network_list", that.netObj);

                // 首次
                if($(".choice_net span").size() === 0){

                    // 线路模板渲染                    
                    var routeListTmp = TMOD("tpl_route_list", ret);
                    $(".choice_net").append(routeListTmp);     


                    // 线路选择           
                    that.switchRoute(ret,basePath);
                    $('#select_network').append(netListTmp);
                }
                // 多次
                else{
                    if(set.curretnKey.id){
                         //网络运营商列渲染
                        var netListTmp = TMOD("tpl_network_list",set.curretnKey.netObj);  
                        $('#select_network').html(netListTmp);
                        $("#select_network li").removeClass("select_hover");
                        $(".choice_net .route").removeClass("cur");
                        $("#"+set.curretnKey.id+"").addClass("cur");
                        $("#"+set.curretnKey.key+"").addClass("select_hover"); 
                    }else{
                        $("#select_network").empty();
                         $(".choice_net .route").removeClass("cur").eq(0).addClass("cur");
                        $("#select_network li").eq(0).addClass("select_hover");   
                        var netListTmp = TMOD("tpl_network_list",set.initData);  
                        $('#select_network').html(netListTmp);
                    }
                }

                //节点
                $('#select_network').find('.auto').addClass('select_hover');
                $('.network_cont').show();
                
                //选择网络
                if(!that.times){
                    that.selectNetwork(ret);
                    that.times = 1;
                }
            },2);
        },



        //切换线路
        switchRoute: function(ret,basePath){
            var that = this;
             $(".choice_net").on("touchend",".route",function(){
                $(".choice_net .route").removeClass("cur");
                $(this).addClass("cur");
                $("#select_network").empty();
                var sourceName = $(this).data("sourcename");
                that.id = $(this).attr("id").split("_")[1];
                for(var i=0;i<ret.data.length;i++){
                    if(sourceName == ret.data[i].sourceName){
                        that.netObj = ret.data[i]
                        that.netObj.basePath = basePath;
                        that.netObj.route = that.id;
                    }
                }
                var netListTmp = TMOD("tpl_network_list",that.netObj);  
                $('#select_network').append(netListTmp);
                if(set.curretnKey.id){
                    $("#select_network li").removeClass("select_hover");
                    $("#"+set.curretnKey.key+"").addClass("select_hover"); 
                }else{
                    if($(this).index() != 0){
                         $("#select_network li").removeClass("select_hover");
                    }
                }
            });
        },

        //网络运营商选择
        selectNetwork: function(ret){
            var that = this;
            $('#network_chooese').on('touchend','li', function() {
                $(".pop_cloud_background").hide();
                var keyValue = $(this).data("key");
                var net_id = $(this).attr("id");
                var obj = {
                    type: keyValue,
                    sourceName: $(".choice_net .cur").data("sourcename"),
                };

                $(this).addClass('select_hover').siblings().removeClass('select_hover');
                MT.network.setOperator(obj, function(ret){
                    if(ret.code == 0){
                        $(".net_sucess").show();
                        if(net_id){
                            that.curretnKey.id = $(".choice_net .cur").attr("id");
                            that.curretnKey.key = net_id;
                            that.curretnKey.netObj = that.netObj;
                        }
                        plugins.cameraShow();//显示摄像头
                        setTimeout(function(){
                            $(".net_sucess").hide();
                            $("#network").hide();
                            $(".mod_modules").removeClass("st");
                            //大屏情况
                            if(config.screenMode == 0 && config.mediaSwitch=="video"){
                                //切换到第一个tab
                                if(!config.switchFlag){
                                    if(config.cameraStatue == "stop"){
                                        camera.cameraHide();

                                    }else{
                                        $(".ht_nav_list li").removeClass("selected");
                                        $("#tab_video"). addClass("selected");
                                        var str = "<div class='load_tips' id='load_tips'>正在载入中...</div>";
                                        $("#ht_camera_container").append(str);
                                        $("#set").hide();
                                    }  
                                    
                                }
                            }
                        },500)
                    } 
                });
                $(".set_menu").show();
                $("#ht_camera_container").show();
            });
        },


        //初始化公告显示
        notice: function(){
            $("#set").find(".set_menu").hide();
            $("#set").find("#mod_notice").show();
            $(".new_nt").hide();
            if($(".mod_notice").size()==0){
                var noticeTemp = TMOD("notice_mod_temp",{});
                $("#set").append(noticeTemp);
                var _content = plugins.textUrlLink(MT.announce.notice.content);
                var str = "<pre><p>"+_content+"</p><pre>";
                $("#notice_content").html(str);
                set.isNewNotify= false;
            }                       
        },

        //公告显示
        noticeContent: function(retval){
            if($("#tab_set").hasClass("selected")){
                $("#tab_set .c_num").hide();
            }else{
                $("#tab_set .c_num").show();
            }
            $("#notice_content").find("p").remove();
            var _content = plugins.textUrlLink(retval.content);
            var str = "<pre><p>"+_content+"</p><pre>";
            MT.announce.notice.content= _content;
            $("#notice_content").html(str);
             set.isNewNotify= true;
              $(".new_nt").show();
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
        
        //xin safair 与IOS 的情况下，显示开启视频
        isSafariIOS: function(){
            //alert(this.isload);
        },

        //测试暴露的方法   
        ChangeMedia: function(mediaType){
            var dataObj = {
                    data:{
                        type: mediaType
                    }
            }
            this.HT.changeMediaElement(dataObj);
        },

        // 初始化
        init: function(HTSDK){
            set.HT = HTSDK;
            this.binds();
        }
    };
    // 暴露接口
    module.exports = set;
});

