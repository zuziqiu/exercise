//课前课后预告
HTSDK.classPreview = {
    time: 0, //倒计时时间
    isLoad: true,//是否已经加载
    timer: null,//
    isClass: false,//是否是课程模式
    //课前初始化
    classInt: function(info){
        //后台是否配置图片
        var pptUrl = HTSDK.room.roomSetMsg['module_ppt_image'].config.pptImage || "";
        if(pptUrl && pptUrl.length>0){
            return;
        }
        var classTmp = template("tpl_class_info",info);
        $("#mod_player_wp").append(classTmp);
        if(info.action == "stop"){
            this.classLiveStatue(info.action);
        }else{
            this.classTimer(info.timeToStart);
        }  
    },

    //课程结束
    classEnd: function(info){
        $("#mod_mask").hide();
        if(info.data){
            info.data.nickname = "";   
        }else{
            return false;
        }  
        var classTmp = template("tpl_class_info",info.data);
        $("#mod_player_wp").append(classTmp);
        this.classLiveStatue(info.data.action);
    },
    //直播态
    classLiveStatue: function(status){
       if(status === "start"){
            $("#class_live_preview").addClass("hidden");
       }else if( status =="stop"){
            $("#class_live_preview").removeClass("hidden");
            $("#mod_mask").hide();
            $(".start_button").addClass("end");
            $(".class_end").removeClass("hidden");
            $(".class_start").addClass("hidden");
            $(".class_count_down").addClass("hidden");
       }
    },

    //是否显示课程预告
    isShowPreview: function(time){
        var leaveTime = time / 60;
        //距离课程开始半小时内进入，显示该页面
        if(leaveTime <= 30 && MT.getLiveState()!= "start"){
            this.isLoad = false;
            $("#class_live_preview").removeClass("hidden");
        }else{
            $("#class_live_preview").addClass("hidden");
            clearInterval(HTSDK.classPreview.timer);
        }
    },
    //倒计时
    classTimer:function(intDiff){
        var that = this,
            day = 0,
            hour = 0,
            minute = 0,
            second = 0;//时间默认值                   
        HTSDK.classPreview.timer = setInterval(function(){
            if(intDiff > 0){
               day = Math.floor(intDiff / (60 * 60 * 24));
               hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
               minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
               second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (hour <= 9){
                day =day;
            }
            if (hour <= 9){
                hour = '0' + hour;
            }
            if (minute <= 9){
                minute = '0' + minute;
            }
            if (second <= 9){
                second = '0' + second;
            }     
            intDiff--;

            that.isShowPreview(intDiff);
            
            if(intDiff > -1){
                $("#timeToStart").html(minute);
            }else{
                clearInterval(HTSDK.classPreview.timer);
                $("#timeToStart").html("00");
            }
            
        },1000);
    },

}