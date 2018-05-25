/**
 * @name room.horizontal
 * @author [H.Liang]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
	var config = require("./global.config"),
        camera = require("./camera"), // 视频模块
	    plugins = require("./plugins");
   
    // todo... 直接调用
    var horizontal = {
    	$cameraContainer: $("#ht_camera_container"),//包裹摄像头的外层容器


		$pptWrap: $(".mod_ppt_wrap"),//包裹PPT的容器
    	//摄像头在右边
    	cameraRight: function(){
            var _that = this;
            
            //清除样式
            horizontal.clearSyle();
            $(".mod_ppt_wrap").attr("style","");
            $(".online_total").css("top",5);
            _that.$pptWrap.removeClass("ppths");
            $("#set .screen_change").find("i").removeClass("schange");
            $("#network").hide();
            $("#pop_emotis").hide();
            $(".h_opration").addClass("hidden");
            $("#mode_chat_post").removeClass("showemtion");
            $(".mod_ppt_wrap").show(); 
            $("#ht_camera_container").removeClass("camerahs");
            $("#ht_camera_container").removeClass("add_bg");
            
            //PPT重置宽高
            _that.$pptWrap.height($("#mod_ppt").height());
            _that.$pptWrap.width($("#mod_ppt").width()); 
            _that.$pptWrap.css("left","0");

            //摄像头重置宽高
            $("#ht_camera_container").height($(".mod_modules").height());
            $("#ht_camera_container").width($(".mod_modules").width());

            if(plugins.isAndroid()){
                if(config.screenMode == 0){
                    horizontal.horizontalForAdr();
                }else if(config.screenMode == 1 || config.screenMode ==2){
                    horizontal.scHorizontalForAdr();
                }
                
            }else{
                $("#mtAuthorPlayer").height("auto");
                $("#mtAuthorPlayer").width($(".mod_modules").width());  
            }  
            plugins.pptReset($(".osimg").width(),$(".osimg").height());
            
            //用于标记是否切换
            config.switchFlag = false;

            $("#set").hide();
            if(config.screenMode == 0){
                horizontal.tabSetSelect();
                horizontal.videoRightSelect();  
            }else{
                horizontal.scVideoSelect();
            }
                 
    	},

        //模屏时摄像头在左边
        cameraLeft : function(){
            var _that = this;
            //清除样式
            _that.clearSyle();
            _that.$pptWrap.addClass("ppths");
            $("#ht_camera_container").addClass("camerahs");
            $("#ht_camera_container").removeClass("move");
            _that.$pptWrap.css("left","");
            $("#tab_video").html("文档");
             //用于标记是否切换
            config.switchFlag = true;

            setTimeout(function(){
                _that.$pptWrap.height($(".mod_modules").height());
                _that.$pptWrap.width($(".mod_modules").width());
                _that.$cameraContainer.height($("#mod_ppt").height());
                _that.$cameraContainer.width($("#mod_ppt").width());   
                //对于安卓
                if(plugins.isAndroid()){
                    horizontal.horizontalForAdr();
                }else{
                   $("#mtAuthorPlayer").height($("#mod_ppt").height());
                   $("#mtAuthorPlayer").width($("#mod_ppt").width()+2); 
                }
                
                plugins.pptReset(_that.$pptWrap.width(),_that.$pptWrap.height());
            },100);   
            $("#set").hide();
            if(config.screenMode == 0){       
                if(config.mediaSwitch == "audio"){
                    $("#voice_bg").show();
                }
                horizontal.tabSetSelect();
                horizontal.videoLeftSelect(); 
            }else{
                horizontal.scVideoSelect();
            }
        },

        //中小屏模屏默认选中视频tab
        scVideoSelect: function(){
            $("#mod_menu_head li").removeClass("selected");
            //摄像头关闭状态下隐藏视频tab
            if(config.cameraStatue != "start" || !config.isOpen){
                $("#tab_video").hide();
                $("#tab_video").removeClass("selected");
                $("#tab_chat").addClass("selected");
                $("#chat").show();             
            }else{
                $(".online_total").addClass("hidden");
                $("#tab_video").show();
                $("#tab_video").addClass("selected");
                $("#ht_camera_container").removeClass("move");
                $("#mtAuthorPlayer").removeClass("camerahide");
                if(config.switchFlag){
                    $("#chat").hide();
                    $("#ask").hide(); 
                    $(".mod_ppt_wrap").css("top","35px");
                    $(".mod_ppt_wrap").show();
                }
                  
            }
        },
    	//摄像头横屏态下摄像头在左边选中
    	videoLeftSelect: function(){
            var _that = this;
    		if($("#tab_video").hasClass("selected")){
                _that.$pptWrap.show();
                $(".h_opration").addClass("hidden");
                $("#chat").hide();
                $("#ask").hide();
                if(config.cameraStatue == "start" ){
                    if(config.mediaSwitch=== "audio"){
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }else{
                        $("#mtAuthorPlayer").removeClass("camerahide"); 
                    }
                }else{
                    $("#mtAuthorPlayer").addClass("camerahide");
                    /*$("#tab_video").html("音频");*/
                }
            }
    	},

    	//竖屏状态下选中设置菜单然后切到模屏的情况下
    	tabSetSelect: function(){
    		if($("#tab_set").hasClass("selected")){
                $("#mod_menu_head li").removeClass("selected");
                $("#tab_video").addClass("selected");
                $("#ht_camera_container").removeClass("move");
                $("#mod_menu_head li").first().addClass("selected");
                $(".h_opration").addClass("hidden");
            } 
    	},

    	//竖屏状态下选中视频菜单然后切到模屏的情况下
    	videoRightSelect: function(){
    		if($("#tab_video").hasClass("selected")){
                $(".h_opration").addClass("hidden");
                $("#chat").hide();
                $("#ask").hide();
                $("#ht_camera_container").removeClass("move");
                if(config.cameraStatue== "start" ){
                    if(config.mediaSwitch=== "audio"){
                        $("#voice_bg").show();
                        $("#mtAuthorPlayer").addClass("camerahide");
                    }else{
                        $("#ht_camera_container").removeClass("moveout");
                        $("#mtAuthorPlayer").removeClass("camerahide");
                        $("#mtAuthorPlayer").show(); 
                    }
                }else{
                    $("#mtAuthorPlayer").addClass("camerahide");
                    plugins.currentTable("音频");
                }
            }else{
                $("#ht_camera_container").css({
                    width: 1,
                    height: 1
                })
                $(".h_opration").removeClass("hidden");
                $(".h_opration .set_icon").show(); 
                //iphone 白屏而做的特殊处理
                plugins.forIphone();         
            }	
    	},

    	//清除样式
    	clearSyle: function(){
    		$(".section_wrap").addClass('horizontal');
            $("body").addClass("landscape");
            $("#chat_post_txt").attr("placeholder","");
            $(".mod_menu").removeClass("close");
            $(".mod_menu").removeClass("open");
            $("#ht_camera_container").attr("style","");
            $(".mod_modules").removeClass("close");
            $(".mod_modules").removeClass("open");  
            $(".mod_modules").removeClass("st");  
            $(".mod_ppt_wrap").removeClass("setcw");
            $("#left_toggle").removeClass("recover"); 
            $("#set").hide();
    	},

         //大屏模屏adnroid6.0.1处理
        horizontalForAdr: function(){
            if(config.switchFlag){//摄像头切换到左面
                if(config.cameraStatue === "start"){
                    if(config.mediaSwitch == "audio"){
                        camera.cameraHide();
                    }else{
                        $("#mtAuthorPlayer").height($("#mod_ppt").height());
                        $("#mtAuthorPlayer").width($("#mod_ppt").width()+2); 
                    } 
                }else{
                    camera.cameraHide();
                }

            }else{//摄像头切换到右面
                if(config.cameraStatue === "start"){           
                    if(config.mediaSwitch == "audio" ){
                        camera.cameraHide();
                    }else{
                       $("#mtAuthorPlayer").height("auto");
                       $("#mtAuthorPlayer").width($(".mod_modules").width()); 
                    } 
                }else{
                    camera.cameraHide();
                    
                }   
            }
        },

         //中小屏模屏adnroid6.0.1处理
        scHorizontalForAdr: function(){
            if(config.switchFlag){//摄像头切换到左面
                if(config.cameraStatue === "start"){
                    if(!config.isOpen){
                        camera.cameraHide();
                    }else{
                        $("#mtAuthorPlayer").height($("#mod_ppt").height());
                        $("#mtAuthorPlayer").width($("#mod_ppt").width()+2); 
                    } 
                }else{
                    camera.cameraHide();
                }

            }else{//摄像头切换到右面
                if(config.cameraStatue === "start"){           
                    if(!config.isOpen){
                        camera.cameraHide();
                    }else{
                       $("#mtAuthorPlayer").height("auto");
                       $("#mtAuthorPlayer").width($(".mod_modules").width()); 
                    } 
                }else{
                    camera.cameraHide();
                    
                }   
            }
        },


    	init: function(){
    		
    	}
    };

   


    // 暴露接口
    module.exports = horizontal;
});

