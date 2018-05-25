/**
 * @name module_video_privew.js
 * @note 暖场模块
 * @author [liangh]
 * @version [v1.0.1]
 */
(function(win){
//1、课程时间内老师点击上课，终止播放视频，课程时间内老师末点击上课，继续播放视频，直到课程时间结束
  /*2、末到课程开始时间时，老师点击上课再下课后，仍播放暖场视频
  3、在课程时间内课后再下课不播放暖场视频
  4、末到课程结束时间老师点击下课的，不播暖场视频*/
 var modBlock = "videoprivew";   

var videoprivew= {

        defaults: {
            isTmepLoadEnd: false, //模板是否已渲染完成
            data: null,
            state: 'wait',
            time: '', //离上课时间
            class_end_time: '',//离课程结束时间倒计时
        },

        navideoRender: function () {
            var that = this;
            //暖场视频为空和上课的情况下不初始化
            if(that.defaults.data.videoUrl == ""){
                return;
            }else{
                $(".layer_pop").show();
            }


            if(HTSDK.videoprivew.defaults.isTmepLoadEnd){
                 that.videoPreviewShow();
            }else{
                setTimeout(function(){
                    that.navideoRender();
                },1000);    
            }

        },

        //不同直播状态下对暖场视频的处理
        liveState: function (state) {
            var that = this;
            if(state === "wait"){
                that.liveWait();
            }else if(state === "stop"){
                if(that.defaults.time > 0){
                    that.videoPreviewShow();
                }else if(that.defaults.time == 0) {
                    if(that.defaults.data){
                        if(that.defaults.data.startLive == 1){
                            return;
                        }else if(that.defaults.data.startLive == 0){
                            that.navideoRender();
                        }
                    }
                    
                }

            }else if(state === "start"){
                that.viedoPreviewHide();
                $(".layer_pop").hide();
            }
        },

        //离上课时间倒计时
        timer: function(intDiff){
            var that = this;                 
            that.setTimer = setInterval(function(){
                that.defaults.time = intDiff;
                if(intDiff == 0){
                    clearInterval(that.setTimer);
                    return;
                }
                intDiff--;                
            },1000);
        },

        //离结束时间倒计时
        classEndTimer: function(time){
            var that = this;                 
            that.endTimer = setInterval(function(){
                if(time == 0){
                    clearInterval(that.endTimer);
                    that.viedoPreviewHide();
                    return;
                }
                time--;                
            },1000);
        },


         //末到课程开始时间时，老师点击上课再下课后，仍播放暖场视频
        liveWait: function () {
            var that = videoprivew;
            //课前的状态
            if(that.defaults.time > 0){
                that.navideoRender();
            }
            //上课中的状态
            else if (that.defaults.time == 0){
                if(that.defaults.data){
                    if(that.defaults.data.startLive == 1){
                        return;
                    }else if(that.defaults.data.startLive == 0){
                        that.navideoRender();
                    }
                }
            }
        },

        //上课的话直接去掉暖场
        viedoPreviewHide: function () {
            $("#video_contaner").remove();
            $("#emit_chat_txt").attr("placeholder","请输入文字...");
            $("#ques_post_txt").attr("placeholder","请输入文字...");
        },

        //暖场视频预告模板渲染
        videoPreviewShow: function () {
            var isDomExit = document.querySelector("#video_contaner"),
                that = videoprivew;
            if(!isDomExit){
                var cn_videoTmp = template("nc_video",that.defaults.data);
                $("#mod_player_wp").append(cn_videoTmp);
                that.navideo();
            } 
            that.defaults.isTmepLoadEnd = false;
        },

        //设置暖场视频宽高
        navideo: function () {
            var videoObj = document.getElementById("na_video");
            videoObj.play();
            videoObj.addEventListener('ended', function(){  
                videoObj.load();  
                videoObj.play();  
            }); 
            var cw = $('.mod_main_player_wp').width();
            var ch = $('.mod_main_player_wp').height();
            var top = ch-$("#na_video").height();
            $("#na_video").css({
                'width': '100%',
                'height': '100%',
            });
            $("#emit_chat_txt").attr("placeholder","直播未开始");
            $("#ques_post_txt").attr("placeholder","直播未开始");

        },   

        //初始化
        init: function(){
            var that = this;
            that.defaults.time = that.defaults.data.info.timeToStart;
            that.timer(that.defaults.data.info.timeToStart);
            that.classEndTimer(that.defaults.data.info.timeToEnd);
        }

    }

   // 暴露
    var HTSDK = window.HTSDK || {};
    HTSDK.videoprivew = videoprivew;

})(window);

