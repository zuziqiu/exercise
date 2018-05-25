/* 
* @Author: anchen
* @Date:   2015-10-23 14:21:41
* @Last Modified by:   anchen
* @Last Modified time: 2017-02-15 18:29:33
*/

/**
 * pc-点播
 * 
 */
var HT = window.HT || {};
var __Event = "click";
// MTCMS 初始化
HT.vod = {
    // CDN验证
    getCDNPath: function(res){
        if(window.TF_getStaticHost){
            return window.TF_getStaticHost(res);
        }else{
            return res;
        }
    },
    // 初始化
   init:function() {
        var that= this;
        // this.backInfor();
        // this.logo(); 
        // this.quit();
        // //this.bottomBar();   
        // this.mationInfor();  
        // this.userApplication();
        // this.leftAndRightNone();
    },
    /*合作方logo*/
    logo:function() {
       var that= this,
            logo_info = HTSDK.modules.getlogo("mod_logo_playback");
       if(logo_info.enable == 1) {
           logo_info.logoImgUrl= that.getCDNPath(logo_info.logoImgUrl);
            var str = "<a class='logo' href='"+logo_info.logolink+"'>"+
                     "<img src='"+logo_info.logoImgUrl+"' /></a>";
            $(".head").append(str);            
       }else {
            $("#header").hide(); 
            $("#mod_col_left").addClass('logo_hide'); 
       }
    },

    /*退出*/
    quit:function(){
        var that=this;
        var quit_info = HTSDK.modules.logout("mod_logout_playback");
        if(quit_info.enable==1){
            $("#quit").show();
            $("#quit").on(__Event,function(){ 
                if(quit_info.logOutUrl.length==0){
                    window.open("about:blank","_self").close();  
                }else{
                    window.location=quit_info.logOutUrl;
                }    
            });            
        }else{
            $("#quit").hide();
            $(".line").hide();
        } 
    },

     /*底栏*/
     bottomBar: function() {
        var that= this;
        var bottom_info = HTSDK.modules.footerbar("mod_footer_playback");
        if(bottom_info.enable == 1) {
            $(".mod_footer").show();
            $(".mod_footer").css('height',bottom_info.footerHeight);
        }else {
            $(".mod_footer").hide();    
        }

     },

     /*主播信息*/
     mationInfor: function(){
        var that= this;
        var vod_info = HTSDK.modules.information("mod_zhuboinfo_playback");
        if(vod_info.mationEnable ==1){
            $("#camera_play").on("mouseover", function(e){
                if(!isChangeVideo){
                  $(".teach_infor").show();
                }
            });
             $("#camera_play").on("mouseout", function(e){
                $(".teach_infor").hide();
            });
        }else{
            $(".teach_infor").hide();
        }

     },

     /*回放信息*/
    backInfor: function() {
        var that= this;
        var vod_info = HTSDK.modules.playback("mod_playbackinfo_playback");
        if(vod_info.enable==1){//总开关开
            if(vod_info.chatEnable==0&&vod_info.qaEnable==0){  //聊天、提问关闭时
              $("#mod_col_right").hide();
              $("#room").addClass("close_right");
              $(".carousel").addClass("active");
              $(".right").hide();
            }else if(vod_info.chatEnable==1&&vod_info.qaEnable==0){ //聊天开、提问关
                 $("#chat_nav .tab_n2").hide();
                 $("#chat_nav .tab_n1").addClass("onlyone");
                 $("#chat_nav .tab_n1").removeClass("current");
            }else if(vod_info.chatEnable==0 && vod_info.qaEnable==1){ //聊天关、提问开
                $("#question_list").show();
                $("#chat_nav .tab_n1").hide();
                $("#chat_list").hide()
                $("#chat_nav .tab_n2").addClass("onlyone");
                $("#chat_nav .tab_n2").removeClass("current");
                HT.baseExecute.isLoadQuestion = 1;
            }
        }else{//总开关关
              
              $("#mod_col_right").hide();
              $("#room").addClass("close_right");
              $(".carousel").addClass("active");
              $(".right").hide();
        }
        
     },

     /*用户应用*/
     userApplication:function(){
        var that= this;
        var app_info = HTSDK.modules.application("mod_visitoraction_playback");  
        if(app_info.enable==1){//总开关开
            if(app_info.section==0){//章节关
                if($("#chapter_nav .tab_n1").hasClass('two')){
                   $("#chapter_nav .tab_n1").removeClass('two');
                   $("#chapter_nav .tab_n1").addClass('one');                                       
                }  
                $("#chapter_nav .tab_n2").hide();
                $("#chapter_list").hide() 
                $("#chapter_nav .tab_n1").addClass('current');
                $("#album_list").show();        
            }
        }else{//总开关关
              if($("#mod_col_main").hasClass('right_has')){
                 $("#mod_col_main").removeClass('right_has');  
                 $("#mod_col_main").addClass('left_none');     
              }
              $("#mod_col_left").addClass("enable");
              $(".left ").hide(); 

        }

        if($("#chapter_nav li").is(':hidden')){
           $("#chapter_nav li").addClass('onlyone');
           $("#chapter_nav li").removeClass("one");
           $("#chapter_nav li").removeClass("current"); 
        }

     },

       /*左右区域隐藏*/
    leftAndRightNone:function(){
       var app_info = HTSDK.modules.application("mod_visitoraction_playback");
       var vod_info = HTSDK.modules.playback("mod_playbackinfo_playback");
       if(vod_info.enable==1 && app_info.enable==1){  

       }else if(vod_info.enable==0 && app_info.enable==0){
              if($("#mod_col_main").hasClass('right_none')){
                 $("#mod_col_main").removeClass('right_none');  
                 $("#mod_col_main").addClass('lr_none');  
              }
              $("#mod_col_left").addClass("enable");
              $(".left ").hide();
              $("#mod_col_right").hide();
              $(".right ").hide();   
         }
     },
};

/*黑板*/
function notFind(obj){
    obj.src = "http://static-1.talk-fun.com/open/cooperation/default/vod-pc/css/img/error.png";
    $(obj).addClass('bord');
    $(obj).parent().siblings('.playing_text').html("黑板");
}

/*// init all
$(function () {
    // initial
    HT.vod.init();
});*/






