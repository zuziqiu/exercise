// 语音模块{自由，主席，麦序，举手}
(function(win){

    var cloudVoice = {
        // 默认语音模式
        vmode: -1,
        // 语音云音量
        vCloudVolume: {
            input: 50,
            output: 50
        },
        // 房间模式
        roomCurrentMode: 0,
        // 语音title标记
        sign: {
            // 语音云
            CLOUD_OPEN: "语音云打开",
            // 麦序
            QUEUE_MIC_CONTROL: "控麦",
            QUEUE_MIC_OPEN: "开麦",
            QUEUE_MIC_FORBID: "禁麦",
            QUEUE_MIC_ENABLE: "放麦",
            QUEUE_MIC_LOOT: "抢麦",
            QUEUE_MIC_LEAVE: "下麦",
            // 举手
            HAND_MIC_UP: "我要举手",
            HAND_MIC_LEAVE: "取消举手",
            HAND_MIC_CLEAR: "清空列表",
            HAND_MIC_REMOVE: "移除",
            HAND_MIC_ALLOW: "允许",
            
            // 语音同步标记
            MODE_STATE: false,
            VOICE_STATE: false
        },
        // 语音模式
        voiceMatchSync: function(type, data){
            var that = this;
            if(type === "mode"){
                that.roomCurrentMode = data;
                that.sign.MODE_STATE = true;
            }else if(type === "voice"){
                that.sign.VOICE_STATE = true;
            }
            // 异步加载后进入语音调度逻辑
            if(that.sign.MODE_STATE && that.sign.VOICE_STATE){
                that.vCloudModeDispatch(that.roomCurrentMode);
            }
        },
        // 客户端模式切换(语音云与桌面分享并存规则调整)
        // @2: 桌面分享模式，关闭学生端PPT播放器声音, 需判断已开启语音云 
        // @1: 视频插播模式，关闭学生端语音云声音
        vCloudModeDispatch: function(mode){
            // 语音云初始化完成后
            if(this.vCloudSuccess){
                var mode = Math.floor(mode),
                    that = this;
                // 桌面分享
                if(mode === 2){
                    HTSDK.room.setVolume(0);
                    that.setVcloudVolume("input", 90);
                    that.setVcloudVolume("output", 90);
                    // that.switchVoiceMode(that.vmode);
                }
                // 视频插播
                else if(mode === 1){
                    that.setVcloudVolume("input", 0);
                    that.setVcloudVolume("output", 0);
                    HTSDK.room.setVolume(0.8);
                    // that.switchVoiceMode(1);
                }
                // 课件
                else{
                    that.setVcloudVolume("input", 90);
                    that.setVcloudVolume("output", 90);
                    HTSDK.room.setVolume(0);
                    // that.switchVoiceMode(that.vmode);
                }
            }
        },
        // 语音云启动步骤
        steps: function(step, times){
            var pop = $("#pop_voice_cloud"),
                cover = $("#pop_cover");
            // 只听模式
            if(step){
                $(".vc_tips").fadeIn(200);
            }
            // 强制模式
            else{
                // 启动次数
                if(times){
                    times = parseInt(times, 10);
                }else{
                    times = 0;
                }
                pop.find(".step").hide();
                
                // 成功启动一次
                if(times > 0){
                    pop.find(".step_v1").show();
                    pop.find(".top_hd .default").removeClass().addClass("listen");
                }
                // 只听模式
                else if(times < 0){
                    pop.find(".step_v5").show();
                }
                // 默认模式
                else{
                    pop.find(".step_v3").show();
                }
                cover.fadeIn(200);
                pop.fadeIn(200);
            }
        },
        // 语音云启动成功
        vCloudDone: function(){
            this.vCloudSuccess = true;
            $(".vc_control").fadeIn(200);
        },
        // 设置语音云音量(客户端)
        setVolume: function(type, volume){
            switch(type){
                // 麦克风
                case "input":
                    $("#input_slide").slider({
                        value: volume
                    });
                    break;
                // 扬声器
                case "output":
                    $("#output_slide").slider({
                        value: volume
                    });
                    break;
            }
        },
        // 切换模式 取到模式的值
        switchVoiceMode: function(_mode, handle){

            // 选中当前
            _mode = parseInt(_mode, 10);
            if(_mode === this.vmode){
                return false;
            }
            // 语音标题
            var that = this,
                modeTitle = ["自由", "主席", "麦序", "举手"];
                $(".cur_mode").html(modeTitle[_mode]);
            // 语音切换提示
            if(handle){
                HTSDK.tools.chatNotify('你把语音模式切换为 ['+modeTitle[_mode]+'] 模式');
            }else{
                if(this.vmodeChange > 0){
                    HTSDK.tools.chatNotify('管理员把语音模式切换为 ['+modeTitle[_mode]+'] 模式');
                }
            }

            // 切换模式结构
            var $voiceHd = $(".mod_voice_hd"),
                $voiceBd = $(".tab_voice_state"),
                // 初始化
                $vfree = $voiceBd.find(".vfree"),
                $vchair = $voiceBd.find(".vchair"),
                $vqueue = $voiceBd.find(".vqueue"),
                $vhand = $voiceBd.find(".vhand"),
                // 数据
                $queue = $voiceHd.find(".queue"),
                $hand = $voiceHd.find(".hand"),
                $free = $voiceHd.find(".freedom"),
                $chairman = $voiceHd.find(".chairman"),
                $mode = _mode;

            // 重设View
            that.resetViews($mode);

            switch ($mode){
                // 自由模式
                case 0:
                    $free.show();
                    $vfree.show();
                    that.caseVoiceMode($mode);
                    break;
                // 主席模式
                case 1:
                    $chairman.show();
                    $vchair.hide();
                    that.caseVoiceMode($mode);
                    break;
                // 麦序
                case 2:
                    $vqueue.show();
                    $queue.show();
                    that.caseVoiceMode($mode);
                    break;
                // 举手
                case 3:
                    $vhand.show();
                    $hand.show();
                    that.caseVoiceMode($mode);
                    break;
            };
            // 触发事件改变
            if(handle){
                that._HT.emit("voice:mode:change", _mode, function(ret){
                    // TODO...
                });
            }
            // set cur vmode
            this.vmodeChange = 1;
            this.vmode = _mode;
        },

        //xin - 抽离一个方法，解决切换模式的类转换
        caseVoiceMode:function(_vmd){
            //xin 成员面板
            var $modList = $("#mod_member_list .role_user");
            if(_vmd == 0){
                //xin -自由
                $("#mod_member_list .role_spadmin").find('p').addClass('voice_enable');
                $("#mod_member_list .role_admin").find('p').addClass('voice_enable');
                $modList.find("p").each(function(i, e) {
                    var voGrant = $(e).data("voice");
                        if( voGrant == 1){
                            $(e).addClass("voice_disable");
                        }else{
                            $(e).attr("class","voice_enable");
                        }
                });

            }
            if(_vmd == 1){
                //xin -主席
                $("#mod_member_list .role_spadmin").find('p').addClass('voice_enable');
                $("#mod_member_list .role_admin").find('p').addClass('voice_enable');
                    $modList.find("p").each(function(i, e){
                    var voGrant = $(e).data("voice");
                        if( voGrant == 1){
                            $(e).addClass("voice_disable");
                        }else{
                            $(e).attr("class","default");
                        }
                    });
            }
            if(_vmd == 2 || _vmd == 3){
                $("#mod_member_list .role_spadmin").find('p').addClass('voice_enable');
                $("#mod_member_list .role_admin").find('p').addClass('voice_enable');
                //xin -麦序 ,举手
                $modList.find("p").each(function(i, e){
                    var voGrant = $(e).data("voice");
                        if( voGrant == 1){
                            $(e).addClass("voice_disable");
                        }else{
                            $(e).attr("class","default");
                        }
                });
            }
        },

        //xin -取到mode 值初始化学生面板的语音标志样式
        resetStuViews:function(_mode){
                //自由模式
                if( _mode === 0){
                    $("#mod_member_list li").find("p").addClass("voice_enable");
                    $("#mod_member_list .role_admin").find('p').addClass("default");
                    $("#mod_member_list .role_spadmin").find('p').addClass("default");
                }
                //主席模式
                if( _mode == 1 || _mode ==2 || _mode == 3){
                    $("#mod_member_list .role_spadmin").find("p").addClass("voice_enable");
                    $("#mod_member_list .role_admin").find("p").addClass("voice_enable");
                    $("#mod_member_list .role_user").find("p").addClass("default");
                }
        },

        // 重置界面
        resetViews: function(mode){
            var that = this,
                $voice = $('.mod_voice_hd .voice'),
                $voiceHd = $(".mod_voice_hd"),
                $voiceBd = $(".tab_voice_state");

            $voiceHd.find(".voice").hide();
            $voiceBd.find("span").hide();
            $voiceBd.show();

            // 举手重置
            $voice.find(".rahand").html(that.sign.HAND_MIC_UP).removeClass("cur");
            if(MTSDK.admin.isAdmin() && mode == 3){
                $(".cls_hands").show();
            }
            
            // 麦序
            $voice.find(".select_mic .mic").removeClass("cur");
            // $voice.find(".mic_operation").html(that.sign.QUEUE_MIC_FORBID);
            // $voice.find(".mic_control").html(that.sign.QUEUE_MIC_CONTROL);
            $voice.find(".mic_knock").html(that.sign.QUEUE_MIC_LOOT);
        },
        // 改变用户权限
        // voice{
        //    enable: 0/1  {0: 默认状态, 1: 允许}
        //    grant:  0/1  {0: 正常状态, 1: 被禁}
        // }
        setVoicePower: function(xid, voice){

            // voice aceess
            var isME = (MT.me.xid == xid);

            // clear
            var $u = $("#voice_user_"+xid).find(".default");
            // 可说话
            if(voice.enable > 0){
                $u.addClass("voice_enable");
                if(isME){
                    $(".mod_voice_access_allow").fadeIn(100);
                    $(".mod_voice_access_forbid").hide();
                }
            }
            // 默认不能说话
            else{
                $u.removeClass("voice_disable");
                $u.removeClass("voice_enable");
                if(isME){
                    $(".mod_voice_access_allow").hide();
                    $(".mod_voice_access_forbid").show();
                }
            }

            // 强制(被禁)
            if(voice.grant > 0){
                $u.addClass("voice_disable");
                if(isME){
                    $(".mod_voice_access_allow").hide();
                    $(".mod_voice_access_forbid").show();
                }
            }

            // 管理权限
            if(MTSDK.admin.isAdmin()){
                $(".mod_voice_access_forbid").hide();
                $(".mod_voice_access_allow").fadeIn(100);
                return false;
            }
        },
        // 列表权限
        // voice{
        //    enable: 0/1  {0: 默认状态, 1: 允许}
        //    grant:  0/1  {0: 正常状态, 1: 被禁}
        // }
        getVoicePower: function(voice){
            var voiceCls = "";
            if(voice){
                if(voice.enable > 0){
                    voiceCls = "voice_enable";
                }else if(voice.grant > 0){
                    voiceCls = "voice_disable";
                }
            }
            return voiceCls;
        },
        // 全局
        voiceGlobal: {
            _parent: cloudVoice,
            // 语音禁言
            forbidVoice: function(user){
                HTSDK.tools.chatNotify(user.nickname+' 已被管理员禁止语音说话。');
                HTSDK.voice.setVoicePower(user.xid, user.voice);
            },
            // 允许语音说话
            allowVoice: function(user){
                HTSDK.tools.chatNotify(user.nickname+' 已被管理员允许语音说话。');
                HTSDK.voice.setVoicePower(user.xid, user.voice);
            }
        },
        // 谁在说话
        whoSpeaking: function(list){
            var vmode = HTSDK.voice.vmode;
            $("#voice_list li em").removeClass("speaking");
            // 自由模式添加用户
            if(vmode === 0){
                if(list.length > 0){
                    var l = {list: list},
                        speaklist = template("tpl_voice_who_speaking", l);
                    $("#voice_list").html(speaklist);
                    $(".vfree").hide();
                    //xin - 成员语音跳动效果
                    $("#user_"+list[0].xid).find("p").addClass('speaking');
                }else{        
                    $(".vfree").show();
                    $("#voice_list").html("");
                    //xin
                    $("#mod_member_list li p").removeClass('speaking');
                }
            }

            //xin -处理用户停止说话的状态
            if( vmode === 1 || vmode === 2 || vmode === 3){
                $("#mod_member_list li p").removeClass('speaking');
            }

            //xin  -改变当前状态
            for (var i = list.length - 1; i >= 0; i--) {
                if($("#voice_user_"+list[i].xid).size() > 0){
                    $("#voice_user_"+list[i].xid).find(".default").addClass("speaking");
                    //处理其他模式下的说话状态
                    $("#user_"+list[i].xid).find(".voice_enable").addClass('speaking');
                }
            };
        },
        // 主席
        voiceChairman: {
            render: function(list){
                var _l = {
                    list: list
                };
                var _tpls = template("tpl_voice_chairman_list", _l);
                $("#voice_list").html(_tpls);
                $(".vchair").hide();
            },
            init: function(list){
                if(list.length > 0){
                    this.render(list);
                }
            }
        },
        // 麦序
        voiceQueue: {
            isInit: false,
            _parent: cloudVoice,
            _vqhandel: 0,
            // 初始化
            init: function(data){
                if(!this.isInit){
                    //this.isInit = true;
                    this.control(data);
                }
            },
            // 加入
            join: function(user){
                if(user.code == 0){
                    var _user = template("tpl_voice_queue_join_one", user);
                    $("#voice_list").append(_user);
                    //xin -抢麦
                    $("#user_"+user.data.xid).find("p").addClass("voice_enable");
                }else{
                    alert(user.msg);
                }
            },
            change: function(list){
                this._parent.voice.queuelist = list;
                if(list.length > 0){
                    $(".tab_voice_state .vqueue").hide();
                }else{
                    $(".tab_voice_state .vqueue").show();
                }
            },
            // 离开
            leave: function(user){
                if(user.data){
                    $("#voice_user_"+user.data.xid).remove();
                    //xin -下麦
                    $("#user_"+user.data.xid).find("p").removeClass("voice_enable");
                    if(user.data.xid == MT.me.xid){
                        $(".mic_knock").html(this._parent.voice.sign.QUEUE_MIC_LOOT).removeClass("cur");
                    }
                }
            },
            // 清空
            clear: function(){
                // todo..
                $(".mic_knock").html(this._parent.voice.sign.QUEUE_MIC_LOOT).removeClass("cur");
                $(".tab_voice_state .vqueue").show();
                HTSDK.tools.chatNotify("管理员清空了麦序列表。");
            },
            // 控制
            control: function(retval){
                var that = this,
                    sign = that._parent.voice.sign,
                    sortAction = "",
                    actionHtml = "",
                    action = retval.action,
                    memberState = retval.memberState;
                // 筛选
                switch(action){
                    case "start":
                        sortAction = action;
                        HTSDK.tools.chatNotify("管理员放麦, 麦序首位可以说话。");
                        if(retval.data){
                            if(retval.data[MT.me.xid]){
                                $("#user_"+MT.me.xid).find("p").addClass("voice_enable"); 
                            }   
                        }
                        break;
                    case "wait":
                        sortAction = action;
                        break;
                    case "pause":
                        sortAction = action;
                        if(retval.current && retval.current.voice.enable === 1){
                            //系统消息
                            HTSDK.tools.chatNotify("管理员控麦。");
                            /*$("#user_"+retval.current.xid).find("p").addClass("voice_enable");*/
                        }else{
                            if(retval.current){
                                $("#user_"+retval.current.xid).find("p").removeClass("voice_enable");
                            }
                            
                            HTSDK.tools.chatNotify("管理员控麦，首位麦序上的人暂时不能说话。");
                        /* $("#user_"+retval.current.xid).find("p").removeClass("voice_enable");*/

                        }
                        break;
                    case "open":
                        memberState = action;
                        HTSDK.tools.chatNotify("管理员将频道设置为开启抢麦，可以点击抢麦按钮排队发言。");
                        break;
                    case "close":
                        memberState = action;
                        HTSDK.tools.chatNotify("管理员将频道设置为禁止抢麦，暂时无法抢麦。");
                        break;
                };

                // 已禁(控麦, 放麦) [start:放麦 pause:控麦 / close:禁麦 open:开麦]
                if(sortAction){
                    //控麦、放麦
                    if(sortAction === "start" || sortAction === "wait"){
                        $(".mic_operation").html(sign.QUEUE_MIC_CONTROL).removeClass("cur");
                    }else{
                        $(".mic_operation").html(sign.QUEUE_MIC_ENABLE).addClass("cur");
                    }
                }

                // 已关(开麦, 禁麦)
                if(memberState){
                    if(memberState === "close"){
                        $(".mic_control").html(sign.QUEUE_MIC_OPEN).addClass("cur");
                    }else if(memberState === "open"){
                        $(".mic_control").html(sign.QUEUE_MIC_FORBID).removeClass("cur");
                    }
                }

                // todo...
                that._vqhandel = 0;
            },
            // 列表
            list: function(list){
                var _l = {
                    list: list
                }
                var _list = template("tpl_voice_queue_list", _l);
                $("#voice_list").html(_list);
            },
            // 重置
            reset: function(rlist){
                var _l = {
                    list: rlist
                }
                var _list = template("tpl_voice_queue_list", _l);
                $("#voice_list").html(_list);
            },
            // 删除
            emitRemove: function(xid, callback){
                var _HT = this._parent.voice._HT;
                if (window.confirm("你确定要移除该用户？")) {
                    _HT.emit('voice:queue:leave', xid, function(retval){
                        if(typeof callback === "function"){
                            callback(retval);
                        }
                    });
                }
            },
            // 清空
            emitClear: function(callback){
                var _HT = this._parent.voice._HT;
                if (window.confirm("你确定要清空麦序列表？")) {
                    _HT.emit('voice:queue:clear', function(retval){
                        if(typeof callback === "function"){
                            callback(retval);
                        }
                    });
                }
            },
            // 加一倍时间
            emitAddtime: function(xid, callback){
                var _HT = this._parent.voice._HT;
                _HT.emit('voice:queue:time', {xid: xid, times: 1}, function(retval){
                    if(typeof callback === "function"){
                        callback(retval);
                    }
                });
            }
        },
        // 举手
        voiceHand: {
            _parent: cloudVoice,
            resetView: function(){
                var size = $("#voice_list").find("li").size();
                if(size === 0){
                    $(".vhand").show();
                }
            },
            join: function(user){
                var _user = template("tpl_voice_hand_join_one", user);
                $("#voice_list").append(_user);
            },
            change: function(list){
                if(list){
                    if(list.length > 0){
                        $(".tab_voice_state .vhand").hide();
                    }else{
                        $(".tab_voice_state .vhand").show();
                    }
                }
            },
            leave: function(user){
                var that = this;
                var sign = that._parent.voice.sign;
                if(user.data){
                    $("#voice_user_"+user.data.xid).remove();
                    if(MT.me.xid == user.data.xid){
                        $(".rahand").removeClass("holding").html(sign.HAND_MIC_UP);
                    }
                    that.resetView();
                }
            },
            _remove: function(user){
                var that = this;
                var sign = this._parent.voice.sign;
                if(user.data){
                    $("#voice_user_"+user.data.xid).remove();
                    if(MT.me.xid == user.data.xid){
                        $(".rahand").removeClass("holding").html(sign.HAND_MIC_UP);
                    }
                    that.resetView();
                }
            },
            clear: function(){
                var that = this;
                var sign = this._parent.voice.sign;
                $(".rahand").removeClass("holding").html(sign.HAND_MIC_UP);
                that.resetView();
                HTSDK.tools.chatNotify("管理员清空了举手列表。");
            },
            reset: function(hlist){
                if(hlist){
                    if(hlist.length > 0){
                        $(".tab_voice_state .vhand").hide();
                    }
                    var _l = {
                        list: hlist
                    }
                    var _list = template("tpl_voice_hand_list", _l);
                    $("#voice_list").html(_list);
                }
            },
            allow: function(user){
                $("#voice_user_"+user.data.xid).find(".operation").addClass("allow");
                //xin -举手
                $("#user_"+user.data.xid).find("p").addClass("p").addClass("voice_enable");

                //liangh -举手
                $("#user_"+user.data.xid).find("p").addClass("voice_enable");
            },
            forbid: function(user){
                $("#voice_user_"+user.data.xid).find(".operation").removeClass("allow");
                //xin -取消举手
                $("#user_"+user.data.xid).find("p").addClass("p").removeClass("voice_enable");

                //liangh 取消举手
                //liangh -举手
                $("#user_"+user.data.xid).find("p").removeClass("voice_enable");
            }
        },
        setMode: function(mode){
            this.vmode = mode;
        },
        getMode: function(){
            return this.vmode;
        },
        getVoiceMenu: function(index){
            var opList = "";
            
            if(index === 0){
                opList += '<li><a data-op="addtime">加一倍时间</a></li>';
            }else{
                opList += '<li><a class="disable" data-op="none" href="javascript:void(0);">加一倍时间</a></li>';
            }

            /*var up = '<li><a data-op="up">上移</a></li>', 
                upHun = '<li><a class="disable" data-op="none" href="javascript:void(0);">上移</a></li>',

                down = '<li><a data-op="down">下移</a></li>',
                downHun = '<li><a class="disable" data-op="none" href="javascript:void(0);">下移</a></li>',

                top = '<li><a data-op="top">调整到2号</a></li>',
                topHun = '<li><a class="disable" data-op="none" href="javascript:void(0);">调整到2号</a></li>';

            if(index > 1){
                opList += up;
            }else{
                opList += upHun;
            }

            if(index > 0 && index < (this.queueSortLength-1)){
                opList += down;
            }else{
                opList += downHun;
            }

            if(index > 1){
                opList += top;
            }else{
                opList += topHun;
            }*/

            opList += '<li><a data-op="out">从麦序中移除</a></li>';
            opList += '<li><a data-op="clear">清空麦序</a></li>';

            // <li data-op="add_time">加一倍时间</li>
            // <li data-op="turn_up">上移</li>
            // <li data-op="trun_down">下移</li>
            // <li data-op="move_to_second">移到2号位置</li>
            // <li data-op="remove">移除</li>
            // <li data-op="clear">清空列表</li>
            // <li data-op="disable">禁止说话</li>

            return opList;
        },
        // [管理]语音操作菜单
        voiceMenu: function(target){
            var curVmode = this.getMode(),
                that = this,
                $parent = $(target),
                index = $parent.index();

            var renHtml = {
                html: that.getVoiceMenu(index)
            };

            $parent.off();

            if(curVmode !== 2){
                return false;
            }

            // toggle
            $parent.on("mouseout", function(){
                that.timer = setTimeout(function(){
                    $("body").popboxCloseAll();
                    $parent.removeClass("active");
                }, 200);
            });
            $parent.on("mouseover", function(){
                clearTimeout(that.timer);
            });

            // pop menu
            $parent.popBox({
                position: 'left',
                content: template("tpl_voice_pop_menu", renHtml),
                callback: function(){
                    var top = $parent.offset().top;
                    $(".admin_list").css({
                        top: top + 10
                    });
                    $(".admin_list").on("mouseover", function(){
                        clearTimeout(that.timer);
                    });
                    // 语音操作
                    if($(".pop_side_operation").hasClass("voice")){
                        $(".pop_side_operation").on("click", "li", function(){
                            that.voiceOperation(this, $parent);
                        });
                    }
                }
            });
        },
        // [管理]语音权限操作
        voiceOperation: function(target, parent){
            var curVmode = this.getMode(),
                that = this,
                $li = $(target),
                xid = parent.data("xid"),
                op = $li.find("a").data("op"),
                index = parent.index();

            // 操作
            switch(op){
                // 增加时间
                case "addtime":
                    that.voiceQueue.emitAddtime(xid, function(){
                        $("body").popboxCloseAll();
                    });
                    break;
                // 剔除
                case "out":
                    that.voiceQueue.emitRemove(xid, function(){
                        $("body").popboxCloseAll();
                    });
                    break;
                // 清空
                case "clear":
                    that.voiceQueue.emitClear(function(){
                        $("body").popboxCloseAll();
                    });
                    break;
            };

        },
        // 设置语音云音量(type volume)
        setVcloudVolume: function(type, volume){
            var _HT = this._HT;
            if(type === "input"){
                _HT.get("voice:set:input:volume", function(callback){
                    callback(volume, function(){
                        // todo...
                    });
                });
            }else if(type === "output"){
                _HT.get("voice:set:output:volume", function(callback){
                    callback(volume, function(){
                        // todo...
                    });
                });
            }
        },
        // 事件绑定
        bindEvents: function(){
            var that = this,
                isVoiceFree = false,
                $voicePop = $("#pop_voice_cloud"),
                _HT = that._HT;

            //下拉选择
            $(".cur_mode").on("click",function(){
                if($(this).hasClass("admin")){
                    $(".select_mode").toggle();
                }
            });

            // 语音权限管理
            $("#voice_list").on("click", "li", function(){
                if(!MTSDK.admin.isAdmin()){
                    return false;
                }
                that.voiceMenu(this);
            });

            // 启动语音云
            $voicePop.find(".voice_lanuch").on("click", function(){
                
                _HT.get("open:voice", function(){
                    $voicePop.find(".step").hide();
                    $voicePop.find(".step_v2").show();
                });
            });

            // 启动只听模式
            $voicePop.find(".voice_lanuch_rtmp").on("click", function(){
                _HT.get("voice:set:listen", function(){
                    $voicePop.hide();
                    $("#pop_cover").hide();
                    $(".mod_voice_control .vc_tips").fadeIn(100);
                });
            });

            // 关闭弹窗
            $voicePop.find(".voice_cls_btn").on("click", function(){
                $voicePop.hide();
                $("#pop_cover").hide();
                $(".mod_voice_control .vc_tips").fadeIn(100);
                // 关闭后默认进入只听模式
                _HT.get("voice:set:listen",function(){
                    // todo...
                });
            });

            //只听模式
            $voicePop.find(".only_listen").on("click", function(){
                $voicePop.hide();
                $("#pop_cover").hide();
                $(".mod_voice_control .vc_tips").fadeIn(100);
                // 关闭后默认进入只听模式
                _HT.get("voice:set:listen",function(){
                    // todo...
                });
            });

            // 下载语音云
            $voicePop.find(".voice_down").on("click", function(){
                //$voicePop.hide();
                $voicePop.find(".step").hide();
                $voicePop.find(".step_v4").show();
                $voicePop.find(".top_hd .default").removeClass().addClass("down");
            });

            // 语音云提示弹窗
            $(".vc_tips_txt em").on("click", function(){
                HTSDK.voice.steps(false);
            });

            // 切换语音模式
            $(".voice_selector").on("click", "li", function(){
                var $title = $(this).data("title"),
                    $mode = $(this).data("mode");
                // 模式
                $(".cur_mode").html($title);
                $(".select_mode").toggle();
                that.switchVoiceMode($mode, true);
                that.setMode($mode);
            });

            // 点击操作举手 
            $(".vhand .up").on("click", function(){
                $(".rahand").click();
            });
            //抢麦
            $(".vqueue .up").on("click", function(){
                $(".mic_knock").click();
            });
            

            // 模式隐藏
            $("body").on("click", function(e) {
                // body...
                if(!$(e.target).hasClass("cur_mode")){
                    $(".select_mode").hide();
                }
            });

            // ==== @语音云控件 ====
            // Shift按下
            $(window).on("keydown", function(e){
                if(e.keyCode == 16){
                    _HT.get("voice:speaker:press", function(){
                        $(".shift_say").html("松开结束").addClass("cur");
                    });
                }
            });
            // Shift弹起
            $(window).on("keyup", function(e){
                if(e.keyCode == 16){
                    _HT.get("voice:speaker:bounce", function(){
                        $(".shift_say").html("按住说话").removeClass("cur");
                    });
                }
            });

            // shift说话[切换自由]
            $(".shift_say").on("click",function(){
                $(this).hide();
                // 开启自由说话
                _HT.get("voice:free", function(ret){
                    $(".free_speak").show();
                });
            });

            // 自由[切换shift]
            $(".free_speak").on("click",function(){
                $(this).hide();
                // 开启shift说话
                _HT.get("voice:close", function(ret){
                    $(".shift_say").show();
                });
            });

            // 设置
            $(".mod_voice_control .setting").on("click", function(){
                _HT.get("voice:setting", function(){
                    // done
                });
            });

            /**
             * 麦序事件绑定
             */
            // 禁，控，抢
            // 抢麦
            var $queueMic = $(".select_mic");
            $queueMic.on("click", ".mic_knock", function(){
                var $that = $(this);
                // 10s 后才能操作
                if($that.hasClass("locking")){
                    return false;
                }
                // 下
                if($(this).hasClass("cur")){
                    _HT.emit("voice:queue:leave", "", function(user){
                        // todo...
                        MT.tools.debug("离开麦序");
                        $that.html(that.sign.QUEUE_MIC_LOOT).removeClass("cur");
                        that.voiceQueue.leave(user);
                    });
                }else{
                    // 10s 解锁
                    $that.addClass("locking");
                    setTimeout(function(){
                        $that.removeClass("locking");
                    }, 10000);
                    // 抢
                    _HT.emit("voice:queue:join", function(ret){
                        // todo...
                        MT.tools.debug("加入麦序");
                        if(ret.code == 0){
                            that.voiceQueue.join(ret);
                            $that.html(that.sign.QUEUE_MIC_LEAVE).addClass("cur");
                        }else{
                            alert(ret.msg);
                        }
                    });
                }
            });

            // 禁麦 & 开麦
            $queueMic.on("click", ".mic_control", function(){
                var $that = $(this);
                if($(this).hasClass("cur")){
                    // 开
                    _HT.emit("voice:queue:control", "open", function(ret){
                        // todo...
                        $that.html(that.sign.QUEUE_MIC_FORBID).removeClass("cur");
                    });
                }else{
                    // 禁
                    _HT.emit("voice:queue:control", "close", function(){
                        // todo...
                        $that.html(that.sign.QUEUE_MIC_OPEN).addClass("cur");
                    });
                }
            });

            // 控麦 & 放麦
            $queueMic.on("click", ".mic_operation", function(){
                var $that = $(this);
                if($(this).hasClass("cur")){
                    // 控
                    _HT.emit("voice:queue:control", "start", function(ret){
                        $that.html(that.sign.QUEUE_MIC_CONTROL).removeClass("cur");
                    });
                    
                }else{
                    // 放
                    _HT.emit("voice:queue:control", "pause", function(){
                        $that.html(that.sign.QUEUE_MIC_ENABLE).addClass("cur");
                    });
                }
            });

            /**
             * 举手事件绑定
             */
            $(".rahand").on("click", function(){
                // 放下
                if($(this).hasClass("holding")){
                    _HT.emit("voice:hand:leave", function(ret){
                        // alert(ret);
                    });
                    $(this).html(that.sign.HAND_MIC_UP).removeClass("holding");
                }else{
                    // 举手
                    _HT.emit("voice:hand:up", function(ret){
                        // alert(ret)
                    });
                    $(this).html(that.sign.HAND_MIC_LEAVE).addClass("holding");
                }
            });

            // 清空举手
            $(".cls_hands").on("click", function(){
                // 清空举手队列
                MTSDK.admin.adminDo.clearVoiceHands(_HT, function(){
                    $("#voice_list").html("");
                });
            });

            $("#voice_list").on("click", ".operation", function(){
                var isAdmin = MTSDK.admin.isAdmin($(this).data("role"));
                if(isAdmin || !MTSDK.admin.isAdmin()){
                    return false;
                }
                var $that = $(this),
                    xid = $(this).data("xid");
                if($(this).hasClass("allow")){
                    _HT.emit('voice:hand:forbid', xid, function(retval){
                        $that.removeClass("allow");
                    });
                }else{
                    _HT.emit('voice:hand:allow', xid, function(retval){
                        $that.addClass("allow");
                    });
                }
            });

            // 伴奏[切换]
            $(".accomp").on("click",function(){
                var $me = $(this);
                // 关闭伴奏
                if($me.hasClass("active")){
                    _HT.get("voice:accompany:stop", function(){
                        $me.removeClass("active");
                        $me.html("音乐伴奏");
                    });
                }
                // 开启伴奏
                else{
                    _HT.get("voice:accompany:open", function(){
                        $me.addClass("active");
                        $me.html("伴奏开启");
                    });
                }
            });


            // 输入 & 输出音量
            var $input = $(".mod_voice_control .input"),
                $output = $(".mod_voice_control .output");

            // 麦音量显示
            $input.on("mouseover",function(){
                $("#mic_click").show();
            });
            // 麦音量隐藏
            $input.on("mouseout",function(){
                $("#mic_click").hide();
            });

            // 输出音量显示
            $output.on("mouseover",function(){
                $("#volunm_click").show();
            });
            // 输出音量隐藏
            $output.on("mouseout",function(){
                $("#volunm_click").hide();
            });

            // get:vCloudVolume
            // 音量toggle
            // Input Volume
            $input.on("click", function(e){
                // 开启
                if($(this).hasClass("mute")){
                    $(this).removeClass("mute");
                    $("#input_slide").slider({
                        value: that.vCloudVolume.input
                    });
                    that.setVcloudVolume("input", that.vCloudVolume.input);
                }
                // 静音
                else{
                    $(this).addClass("mute");
                    that.vCloudVolume.input = $("#input_slide").slider("value");
                    $("#input_slide").slider({
                        value: 0
                    });
                    that.setVcloudVolume("input", 0);
                }
            });
            // Output Volume
            $output.on("click", function(e){
                // 开启
                if($(this).hasClass("mute")){
                    $(this).removeClass("mute");
                    $("#output_slide").slider({
                        value: that.vCloudVolume.output
                    });
                    that.setVcloudVolume("output", that.vCloudVolume.output);
                }
                // 静音
                else{
                    $(this).addClass("mute");
                    that.vCloudVolume.output = $("#output_slide").slider("value");
                    $("#output_slide").slider({
                        value: 0
                    });
                    that.setVcloudVolume("output", 0);
                }
            });
            
            // 麦克风音量控制
            $("#input_slide").slider({
                orientation: "vertical",
                range: "max",
                min: 0,
                max: 100,
                step: 1,
                animate: true,
                value: 50,
                stop: function(e, res){
                    var volume = res.value;
                    if(volume === 0){
                        $(".mod_voice_control .input").addClass("mute");
                    }else{
                        $(".mod_voice_control .input").removeClass("mute");
                    }
                    _HT.get("voice:set:input:volume", function(callback){
                        callback(volume, function(){
                            // todo...
                        });
                    });
                }
                /*slide: function(e, res){
                    var volume = res.value;
                    _HT.get("voice:set:input:volume", function(callback){
                        callback(volume, function(){
                            // todo...
                        });
                    });
                }*/
            });

            // 扬声器音量控制
            $("#output_slide").slider({
                orientation: "vertical",
                range: "max",
                min: 0,
                max: 100,
                step: 1,
                animate: true,
                value: 50,
                stop: function(e, res){
                    var volume = res.value;
                    if(volume === 0){
                        $(".mod_voice_control .output").addClass("mute");
                    }else{
                        $(".mod_voice_control .output").removeClass("mute");
                    }
                    _HT.get("voice:set:output:volume", function(callback){
                        callback(volume, function(){
                            // todo...
                        });
                    });
                }
            });
        },
        // 渲染
        render: function(){
            //$(".one_voice_funbtn").hide();
            $("#mod_col_right").addClass("has_voice");
            var tplVoice = template("tpl_mod_voice");
            $("#mod_col_right").prepend(tplVoice);
            $(".mod_voice_control").fadeIn(100);
            $("body").append(template("tpl_voice_cloud_pop"));
            // 模块渲染完成
            this.renderAll = true;
        },

        // 注入消息
        assign: function(){
            var _that = this;
            for(var o in this){
                this[o]._parent = {
                    voice:{
                        sign: _that.sign
                    }
                };
            }
        },

        // 入口
        init: function(type){
            
            this.assign();

            // 1: 强语音模式
            // 2: 弱互动
            // 3: 自由模式
            var type = type;
            if(type == 1){
                if(this.renderAll){
                    return false;
                }
                this.render();
            }
        }
    };

    // expose
    var HTSDK = win.HTSDK || {};
    HTSDK.voice = cloudVoice;

})(window);


