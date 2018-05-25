/**
 * live.player 小班模块
 * Desc: 依赖 SDK-PC v3.1 (//static-2.talk-fun.com/open/maituo_v2/dist/live/pc/sdk-pc.3.1.min.js)
 * Author: Marko.King
 * Version. v1.5
 */

(function(win){
    // 小班模式
    var liveCamera = {

        //全局变量
        defaults:{
            player: null,
            mainPlayer: null,
            oneStatus: "", //初始化房间状态：start, stop, wait
            myState: "down", // up / down
            checkState : false,
            dataObject: []
        },

        // 播放器初始化
        playerInit: function(player){
            this.defaults.player = player;
        },

        // 设置自己在讲台状态
        setState: function(state){
            this.defaults.myState = state;
        },

        // 设置状态
        getState: function(){
            return this.defaults.myState;
        },

        // 是否自己
        isMe: function(xid){
            var meXid = HTSDK.room._HT.getMtData().user.xid;
            if(xid == meXid){
                return true;
            }else{
                return false;
            }
        },

        //隐藏主播放器的声音按钮
        voiceHide: function(){
            var player = liveCamera.defaults.mainPlayer;
            if(player){
                // 隐藏播放器音量按钮
                if (player.showVolumeBtn) {
                    player.showVolumeBtn(false);
                }
            }
        },

        //设置小班声音
        setVolume: function(volume){
            var player = this.defaults.player;
            if(player){
                // 隐藏播放器音量按钮
                if (player.cameraSetVolume) {
                    player.cameraSetVolume(volume);
                }
            }
        },

        // popbox
        popbox: function(o){
            var box = $(".pop_text"),
                $go_confim = box.find(".go_confim"),
                $downtxt = box.find(".down_text"),
                $can = box.find(".cancel"),
                txt = box.find(".apply_text");
            
            if(!o){
                return box;
            };

            box.find("div").removeAttr("style");
            box.removeClass("down");
            box.show();
            box.removeClass("pop_up");

            // fuxx
            $downtxt.hide()

            // type. => popup
            if(o.type === "pop"){
                box.addClass("pop_up");
                txt.text(o.context);
                txt.show();
            }
            
            // 普通弹窗
            else{
                // has text
                if(o.context){
                    txt.text(o.context);
                    txt.show();
                }

                // has confirm
                if(o.confirm){
                    box.addClass("down");
                    $can.show();
                    $go_confim.removeClass('go_confim').addClass('down_confim').show();
                }
                else{
                    box.removeClass("down");
                    $go_confim.removeClass('down_confim').addClass('go_confim').show();
                    $can.hide();
                }
            }

            return box;
        },

        //bindEvent
        bindEvent: function(){

            var that = this,
                $go_desk = $("#mod_col_right #go_desk"), //上讲台按钮
                $back_desk = $("#back_desk"), //下讲台按钮
                $go_confim = $(".go_confim"), //上讲台弹框确认键
                $down_confim = $(".down_confim"), //下讲台确认键
                $cancel = $(".cancel"), //弹框取消键
                $close = $(".close"), //关闭弹窗
                $appTxt = $(".apply_text"),
                $fail_close = $(".fail_close"),
                $pop_text = $(".pop_text"); //点击上讲台后弹出的提示框

            var _HT = HTSDK.room._HT,
                xid = MT.me.xid,
                role = MT.me.role;
            
            //学生自主申请上讲台
            $go_desk.on("click", function(){
                
                // 先检查设备是否正常(show div layer)
                liveCamera.openCameraState();

                // 后触发 -> check flash state
                _HT.emit("usercamera:check:state", function(retval){
                    // alert(retval);
                    retval = String(retval);
                    if(retval == "true" || retval == "false"){
                        liveCamera.openCameraState(retval);
                    }
                });
            });

            //学生自主下讲台
            $back_desk.on("click", function(){

                var txt = "";
                if(that.getState() !== "up"){
                    txt = "是否取消申请?"
                }else{
                    txt = "是否下讲台?"
                }

                //下讲台提示框
                that.popbox({
                    context: txt,
                    down: true,
                    confirm: true
                });

            });

            //上讲台确认提示框
            $pop_text .on('click', ".go_confim", function(){
                $pop_text.hide();
                $appTxt.hide();
            });

            //下讲台确认提示框 
            $pop_text.on("click", ".down_confim",function(){
                
                //上了讲台后的下讲台
                if( $(".one_connent").hasClass('show_one_camera')){
                    //下讲台指令
                    _HT.emit("usercamera:down", function(retval){

                    });

                    $go_desk.removeClass("emin");

                    $(".down_text").html("您确认离开讲台?");

                    $(".one_connent").removeClass('show_one_camera');
                }else{
                    //未得到老师允许的下讲台
                    _HT.emit("usercamera:cancel", function(){

                    });
                    $go_desk.removeClass("emin");
                }

                $(".down_text").html("是否取消申请?");

                $go_desk.show();
                $go_confim.removeClass('down_confim').addClass('go_confim');
                $pop_text.hide();
                $back_desk.hide();
            });

            //关闭提示框
            $close.on("click", function(){
                $pop_text.hide();
                $appTxt.hide();
            });

            //关闭摄像头检测失败的情况
            $fail_close.on("click", function(){
            $(".user_camera_fail").hide(); 
            $(".mod_live_camera").removeClass('show');
            });

            //失败确认
            $(".fail_sure").on("click",function(){
            $(".user_camera_fail").hide(); 
            $(".mod_live_camera").removeClass('show');
            });

            // 取消
            $cancel.on("click", function(){
                $pop_text.hide();
                $pop_text.removeClass("down");
            });

            //直接关闭声音
            $(".one_button").on("click", function(e){
                if(!$(e.target).hasClass('one_voice_con')){
                   return;
                }
                if( $(this).hasClass('one_mute')){
                    $(this).removeClass('one_mute');
                    HTSDK.room.setVolume(0.5);
                    $(".ui-slider-range-max").css("height", "50%");
                    $(".ui-corner-all").css("bottom", "50%");
                }else{
                    $(this).addClass('one_mute');
                    $(".ui-slider-range-max").css("height", "100%");
                    $(".ui-corner-all").css("bottom", 0);
                    HTSDK.room.setVolume(0);
                }
            });

            // 输入音量
            var $input = $(".mod_live_tools .one_input");

            // 麦音量显示
            $input.on("mouseover",function(){
                $(".one_mic_bg").show();
            });

            // 麦音量隐藏
            $input.on("mouseout",function(){
                $(".one_mic_bg").hide();
            });

            //小班-总音量-音量控制
            $("#one_input_slide").slider({
                orientation: "vertical",
                range: "max",
                min: 0,
                max: 100,
                step: 1,
                animate: true,
                value: 50,
                stop: function(e, res){
                    var volume = res.value;
                    HTSDK.room.setVolume(volume/100);
                    if(volume === 0){
                        $(".mod_live_tools .one_input").addClass("one_mute");
                    }else{
                        $(".mod_live_tools .one_input").removeClass("one_mute");
                    }
                }
            });

             //初始化音量设置
            setTimeout(function() {
                HTSDK.room.setVolume(0.5);
            },3000);
        },

        //用户摄像头开启是否成功
        openCameraState: function(retval){
            var that = this,
                typeStr = "",
                _HT = HTSDK.room._HT,
                xid = MT.me.xid,
                $go_confim = $(".go_confim"), //上讲台弹框确认键
                $pop_text = $(".pop_text"); //点击上讲台后弹出的提示框

            // 先显示讲台(FLASH) ⚠️让用户选择flash允许项
            if(!retval){
                $(".mod_live_camera").addClass('show');
                return false;
            }else{
                typeStr = retval.toString();
            }
            
            // 是否开关
            if(typeStr == "true"){
                //上讲台指令
                _HT.emit("usercamera:apply", {xid: xid}, function(retval){
                    // $(".apply_text").show();

                    // 不成功
                    if(retval.code != 0){
                        that.popbox({
                            context: retval.msg
                        });
                        return false;
                    }
                    // 成功申请
                    else{
                        // ### => 将执行 usercamera:apply
                        $("#go_desk").addClass("emin");
                        $(".mod_live_camera").addClass('show');
                    }
                });
            }else{
                // 错误的时候也要减低层级
                $(".mod_live_camera").removeClass('show');
                that.popbox({
                    context: "检测录音设备有异常, 上讲台失败!",
                    confirm: false
                });
                $("#back_desk").hide();
                $("#go_desk").show();
            }
        },

        //老师开启上讲台
        cameraStart: function(){
            var notify = '管理员<em>开启了讲台功能</em>，点击右上角的视频区域可申请上讲台';
            HTSDK.tools.chatNotify(notify);
            $("#mod_col_right").addClass("has_one_to_one");
            $(".one_connent").fadeIn(500);
            
            //突然关闭小班
            if($("#mod_col_right").hasClass('has_one_to_one')){
                $(".one_connent .top").show();
                $("#go_desk").show();
                $("#back_desk").hide();
            }
        },

        //老师关闭上讲台
        cameraStop: function(){
            var notify = '管理员<em>关闭了讲台功能</em>';
                HTSDK.tools.chatNotify(notify);
            $("#mod_col_right").removeClass('has_one_to_one');
            $(".one_connent").removeClass("show_one_camera").fadeOut(500);
            $(".mod_live_camera").removeClass("show");
            this.popbox().hide();
            this.setState("down");
        },

        //老师允许上讲台
        allowUp: function(xid, nickname, isOnline){

            // 自己在讲台
            if(this.isMe(xid)){
                $("#go_desk").hide();
                $("#back_desk").show();
                $(".one_connent").addClass('show_one_camera');
                $(".mod_live_camera").addClass("show");
                this.setState("up");
                this.popbox().hide();
            }

            var notify = '学员<em> '+ nickname +' </em>已被管理员允许上讲台';
            HTSDK.tools.chatNotify(notify);
        },

        //老师强制学生下讲台
        kickStu: function(xid,nickname){
            var applyList = liveCamera.defaults.dataObject;
            var that = this;
            
            if(that.isMe(xid)){
                $("#go_desk").show();
                $("#back_desk").hide();
                $("#go_desk").removeClass("emin");
                $(".one_connent").removeClass('show_one_camera');
                $(".mod_live_camera").removeClass("show");
                that.setState("down");
            }

            var notify = '学员<em> '+nickname+' </em>已被管理员请下讲台';
            HTSDK.tools.chatNotify(notify);
        },

        //学生申请上讲台
        stuApply: function(xid, nickname){

            var that = this;
            
            //广播
            var notify = '学员 <em>'+nickname+'</em> 申请上讲台';
            HTSDK.tools.chatNotify(notify);
            
            // 差异化
            var me = this.isMe(xid);

            if(me){
                $("#back_desk").show();
                $("#go_desk").hide();
                $(".mod_live_camera").addClass("show");
                
                // 检测返回true让swf层级减低
                that.setState("apply");

                // 下讲台提示框
                that.popbox({
                    context: "已请求上讲台，请等待老师确认...",
                    type: "pop"
                });
            }
        },

        //学生取消
        stuCancel: function(xid, nickname){
            //广播
            var notify = '学员 <em>'+nickname+'</em> 取消上讲台的申请';
            HTSDK.tools.chatNotify(notify);
            $(".mod_live_camera").removeClass("show");
            this.setState("down");
        },

        //学生主动下讲台
        stuDown: function(xid, nickname){
            
            // 下讲台
            if(this.isMe(xid)){
                $(".show_one_camera .top").show();
                $("#back_desk").hide();
                $("#go_desk").show();
                $(".one_connent").removeClass('show_one_camera');
                $(".has_one_to_one").removeClass('other');
                $(".mod_live_camera").removeClass('show');
            }

            //广播
            var notify = '学员 <em>'+nickname+' </em>已离开讲台';
                HTSDK.tools.chatNotify(notify);
        },

        //初始化时房间是否讲台的状态
        initStatus: function(retval){

            var that = this,
                status = retval.status || "stop",
                user = retval.user,
                upUsers = retval.upUsers,
                applyList = retval.applyList;

            that.defaults.oneStatus = retval.status;
            that.defaults.dataObject = retval.applyList;

            // 已开启小班
            if(status !== "stop"){
                $(".down_text").html("确定取消上讲台的申请吗");
                $("#mod_col_right").addClass("has_one_to_one");
                $(".one_connent").fadeIn(500);

                // 申请列表
                if(applyList && applyList.length > 0){
                    for(var i = 0; i < applyList.length; i++){
                        if(that.isMe(applyList[i].xid)){
                            that.stuApply(applyList[i].xid, applyList[i].nickname);
                        }
                    }
                }

                // 上讲台列表
                if(typeof (upUsers) === "object"){
                    // 当前用户正在上讲台
                    var onlineUser = upUsers[HTSDK.room._HT.getMtData().user.xid];
                    if(onlineUser){
                        that.setState("up");
                        that.allowUp(onlineUser.xid, onlineUser.nickname);
                    }else{
                        that.setState("down");
                    }
                }
            }
        },

        // 停止上课
        liveStatus: function(status){
            var that = this,
                _HT = HTSDK.room._HT,
                $colRight = $(".col_right_side");
            if( status == "stop"){
                //window.location.reload();
                $(".mod_live_camera").removeClass("show");
                that.popbox().hide();
                _HT.emit("usercamera:force:out", function(retval){
                    $("#back_desk").hide();
                    $("#go_desk").show();
                    $(".one_connent").removeClass('show_one_camera').hide();
                    $(".col_right_side").removeClass('has_one_to_one');
                    if( $colRight.hasClass('other')){
                        $colRight.removeClass('other');
                        $(".top").show();
                    }
                });
            }
        },

        //渲染
        oneRender: function(callback){

            $("body").addClass("mode_live_player");
            
            var tplOne = template("tpl_one_to_one");
            $("#mod_col_right").prepend(tplOne);

            // 小班模式差异化
            $(".tools_toggle_camera").hide();
            $(".one_voice_funbtn").hide();

            // callback
            if(typeof callback === "function"){
                callback();
            }
        },

        // HTSDK->运行
        onExecute: function(){
            this.bindEvent();
            this.initStatus(this.initData);
        },

        //入口
        init: function(type, callback){
            var that = this;
            var roomType = parseInt(type);
            if( roomType === 5){
                //渲染
                that.oneRender(callback);
            }
        }  
    };

    // 暴露
    var HTSDK = win.HTSDK || {};
    HTSDK.liveCamera = liveCamera;

})(window);
