/**
 * @name chat.js
 * @note 聊天区模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD");
    var room = require("./room");
    var plugins = require("./plugins");
    var config = require("./global.config");
    var barragerLibrary  = require("barrager");
    var barrager = require("./barrager");

    // 聊天模块
    var chat = {
        // 限制时间
        sendTimeLimit: 2000,

        // 是否可发
        canSend: true,

        modules: null,

        type : 0, //0表示聊天tab,1表示问答tab,

        chatCount: 0, //聊天计数

        gagStatue: 0,//全体禁言状态0 解禁 1 禁言

        HT: "",
        // 父容器
        $target: $("#chat"),
        // 事件绑定
        events:[
            {"click" : ["#mode_chat_post .csend", "emitChat"]}, // 发送聊天绑定
            {"keydown" : ["#chat_post_txt", "postChat"]}, //聊天
            {"keyup" : ["#chat_post_txt", "chatFocus"]}, //焦点
        /*    {"blur" : ["#chat_post_txt", "chatFocus"]}, //失去*/
            {"touchend": ["#mode_chat_post .post_con .emoticon", "showEmoti"]}, // 显示表情
            //焦点
            {"focus": ["#chat_post_txt", "onQuesFire"]},
            {"blur": ["#chat_post_txt", "onQuesFire"]}
        ],
        // 绑定
        binds: function(){
            var that = this;
            MT.tools.bindEvent(that.$target, that, that.events);
        },
        //是否显示聊天内容
        notShowChat: false,
        //聊天区未读信息
        checkNew: function(ret){
            var that = this;
            if(MT.me.xid != ret.xid && $("#tab_chat").hasClass("selected")== false){
               /* that.chatCount ++;*/
                $("#tab_chat .c_num").show();
                // 信息 > 100条 显示 "99+"
                /*if(that.chatCount > 100){
                    $(".c_num").html("99+");
                }else{
                    $(".c_num").html(that.chatCount);
                }*/
            }
                
        },

        sHeight: window.document.body.scrollHeight,
        setScrollTopTimeFlag: null,
        // hack keyboard top
        onQuesFire: function (e) {

            var that = this
                setScrollTimes = 0; 
            if (plugins.isIos()) {
                var h = $("#mode_chat_post").height();
				if (e.type === "focus") {
                    var _sTop = ((chat.sHeight / 2) + h) + 5;
					if(!plugins.getPlatformInfo().version>=11){
                        var _setScrollTop = function() {
                            // 第一次优先执行
                            window.document.body.scrollTop = _sTop;
                            
                            // 间隔 150 毫秒, 执行一次以下方法，执行5次
                            that.setScrollTopTimeFlag = setInterval(function(){
                                var _sTop = ((chat.sHeight / 2) + h) + 5;
                                window.document.body.scrollTop = _sTop;
                                setScrollTimes ++;
                                if(setScrollTimes == "5"){
                                    clearInterval(that.setScrollTopTimeFlag);
                                }
                            }, 150);
                        };

                        window.setTimeout(function () {
                            _setScrollTop()
                        }, 200);
                    }
                    else{
                        document.getElementById("mode_chat_post").style.position = "absolute";
                    }
				} else {
                    document.getElementById("mode_chat_post").style.position = "fixed";
                    $("#mode_chat_post").removeAttr("style");
                }
                
                // var h = $("#mode_chat_post").height();
                // if (e.type === "focus") {
                    
                //     var _setScrollTop = function() {
                //         // 第一次优先执行
                //         var _sTop = ((chat.sHeight / 2) + h) + 5;
                //         window.document.body.scrollTop = _sTop;
                        
                //         // 间隔 150 毫秒, 执行一次以下方法，执行5次
                //         that.setScrollTopTimeFlag = setInterval(function(){
                //             var _sTop = ((chat.sHeight / 2) + h) + 5;
                //             window.document.body.scrollTop = _sTop;
                //             setScrollTimes ++;
                //             if(setScrollTimes == "5"){
                //                 clearInterval(that.setScrollTopTimeFlag);
                //             }
                //         }, 150);
                //     };

                //     window.setTimeout(function () {
                //         _setScrollTop()
                //     }, 200);

                // } else {
                //     $("#mode_chat_post").removeAttr("style");
                // }
            }
        },

        // 过滤其他设备emoji表情
        filterEmoji: function(data){
            // Emoji-ASCII范围
            var emojiRegx = /\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|[\u2000-\u2fff]/g,
                regx = data.match(emojiRegx);
            if(regx && regx.length > 0){
                return data = data.replace(emojiRegx, "");
            }else{
                return data;
            }
        },

        //全体禁言通知
        gagNotice: function(retval){
            var notify = '';
            if(retval.status == 1){
                notify = '全体禁言已开启！（仅管理员可发言）';
            }else{
                notify = '全体禁言已关闭！（全体用户可自由发言）';
            }
           
            plugins.chatNotify(notify);
        },

        //全体解禁、全体禁言
        allDisbleChat: function(retval){
            var $chatCon = $("#chat_post_txt"),
                that = this;   

            if(MT.me.role == "admin"){
                return;
            }    
            //禁言
            if(retval.status == 1){
                $("#chat_post_txt").val("");
                $chatCon.attr("disabled","disabled");
                $chatCon.attr("placeholder","目前是锁屏模式，暂时不能发言哦...");
            }
            //解禁
            else if(retval.status == 0){
                $chatCon.removeAttr("disabled");
                $chatCon.attr("placeholder","请输入文字...");
            }
            chat.gagStatue = retval.status;
            window.sessionStorage.setItem("status",retval.status);
        },

        //全体禁言普通用户不准发言、送花、发送表情
        userAllGag: function(){
            var that = this;
            if(MT.me.role != "admin" && chat.gagStatue == 1){
                return false;
            }else{
                return true;
            }
        },


        // $发布聊天
        postChat: function(e){
            //MTSDK.modChat.chatFocus(e);
            if(e.keyCode === 13){
                chat.emitChat(e);
                // e.preventDefault();
                return false;
            }
        },
        //禁止聊天
        chatAccess: function(flag, retval){
            $(".chat_"+retval.xid).remove();
            // 是否本人
            if(MT.me.xid == retval.xid){
                //系统消息
                //MTSDK.plugins.chatNotify('通知：你已经被管理员禁言。');
            }
        },
        // 聊天焦点
        chatFocus: function(e){
            var target = $("#mode_chat_post");
            /*$("#chat_post_txt").addClass("green");*/
            //MTSDK.plugins.scrollToTop();
            $("#mode_chat_post .emoticon").show();
            if(e.currentTarget.value.length > 0){
                $("#mode_chat_post").addClass("touchsend");
                /*$(".online_total").hide();*/
                /*alert($("#mode_chat_post").attr(""));*/
                $("#mode_chat_post").removeClass("showemtion");
                $("#pop_emotis").hide();
                $("#mode_chat_post .emoticon").removeClass("emoshow"); 
                $("#mode_chat_post .flower").hide();
                $("#mode_chat_post .emoticon").hide();

                if(!$(".post_con").hasClass("hide")){
                    $("#mode_chat_post .reward_btn").hide();
                    $(".post_con").addClass("str_length");        
                }
                target.find(".csend").show();
                // target.addClass("full");
            }else{
                $("#mode_chat_post .flower").show();
                $("#mode_chat_post .emoticon").show();
                if(!$(".post_con").hasClass("hide")){
                    $("#mode_chat_post .reward_btn").show();
                    $(".post_con").removeClass("str_length"); 
                }
                target.find(".csend").hide();
                /*$("#chat_post_txt").removeClass("green");*/
                // target.removeClass("full");
            }
            target.addClass("full");
        },

        // 发送聊天
        emitChat: function(el){
            var that = chat,
                action = MT.getLiveState(),
                $chat = $('#mode_chat_post'),
                $chatCon = $chat.find("textarea"),
                $chatVal = $.trim($chatCon.val()),
                $button = $("#mode_chat_post .csend"),
                $btnCloseUlist = $(".btn_close_list"),
                $chatHall = $("#chat_hall"); 

            //内部合作方    
            if(window.partner_id  == "20" || window.partner_id == "11252"){  
                //课前
                if(action=="wait" && MT.me.role!="admin"){
                    if(chat.modules.mod_beforeclass_live){
                        var allenable = chat.modules.mod_beforeclass_live.enable;
                        var chatEnable = chat.modules.mod_beforeclass_live.config.chat.enable;
                        if(allenable=="0" ||  chatEnable == "0"){
                            plugins.showComtip($button, "还没上课喔～");
                            return  false;
                        }
                    }else{
                        plugins.showComtip($button, "还没上课喔～");
                        return  false;
                    } 

                }   
                //课后
                if(action=="stop" && MT.me.role!="admin"){

                     if(chat.modules.mod_afterclass_live){
                        var allenable = chat.modules.mod_afterclass_live.enable;
                        var chatEnable = chat.modules.mod_afterclass_live.config.chat.enable;
                        if(allenable=="0" ||  chatEnable == "0"){
                            plugins.showComtip($button, "下课了喔～");
                            return  false;
                        }
                    }else{
                        plugins.showComtip($button, "下课了喔～");
                        return  false;
                    } 

                }    
            }

            // 直播未开始
            if(action !== "start"){
               /* plugins.showComtip($button, "还没上课喔～");*/
                $('#network_icon').hide();
               /* return false;*/
            }

            // 过滤emoji表情
            $chatVal = that.filterEmoji($chatVal);

            // 发表时间限制
            if(!that.canSend){
                 plugins.showComtip($button, "请在2秒后发言...");
                // 2s后取消限制
                if(!that.canSend){
                    setTimeout(function(){
                        that.canSend = true;
                    }, that.sendTimeLimit);
                }
                return false;
            }
            // 非空
            if($chatVal.length === 0){
                plugins.showComtip($button, "请输入文字...");
                return false;
            }
            // clear content
            $chatVal = $chatVal.replace(/\r/g, "");
            that.canSend = false;
            // send chat post
            chat.HT.emit("chat:send", {msg: $chatVal}, function(retval){
                $("#mode_chat_post").removeClass("touchsend");
                if(chat.modules.mod_visitorinfo_live){
                    if (chat.modules.mod_visitorinfo_live.enable == 1) {
                        if(chat.modules.mod_visitorinfo_live.config.visitorCount.enable == 1){
                            $(".online_total").show();
                        }else{
                            $(".online_total").hide(); 
                        }
                    }else {
                        $(".online_total").hide(); 
                    }
                }else{
                   $(".online_total").show(); 
                }
                if(retval.code === 0){
                    $("#mode_chat_post .flower").show();
                    $("#mode_chat_post .emoticon").show();
                    $chatCon.val("");
                    if(!$(".post_con").hasClass("hide")){
                        $("#mode_chat_post .reward_btn").show();
                        $(".post_con").removeClass("str_length"); 
                    }
                     // 取消限制
                    that.canSend = false;
                    setTimeout(function(){
                        that.canSend = true;
                    }, that.sendTimeLimit);

                    $("#mode_chat_post").find(".csend").hide();
                    // 表情替换{表情包 key: value, 聊天内容}                 
                    var renderMsg = MT.tools.ubb2img(window.BASE_EMOTIONS_PACKAGE, retval.data.msg);
                    retval.data.time = plugins.convertTimestamp(retval.data.time);
                    retval.data.msg = renderMsg;
                    retval.data.avatar = plugins.setAvatar(retval.data);
                    retval.data.roleAlias = config.role;

                    var chatRender = TMOD("chat_msg", retval.data);
                    $chatHall.append(chatRender);    
                    plugins.scrollToBottom("chat");
                    $btnCloseUlist.click();

                     // 检查DOM
                    plugins.checkChatSize();

                    $("#mod_chat_post").removeClass("touchsend");

                    $chatCon.blur();

                    //显示弹幕 
                    barrager.showBarrager(retval.data);
                }else{
                    alert(retval.msg);
                }
                $("#mod_chat_post").removeClass("showemtion");
            });
        },
        // 接收聊天
        onChat: function(retval){
            var _ts = this,
                $chatHall = $("#chat_hall");

            //判断身份
            if(plugins.isAdmin(retval.role)){
                var isShoot = room.specialCmd(retval.msg);
                if(isShoot){
                    return false;
                }
            }

            //插入聊天
            var appendChat = function(){

                retval.time = plugins.convertTimestamp(retval.time);
                // 表情替换{表情包 key: value, 聊天内容}
                var renderMsg = MT.tools.ubb2img(window.BASE_EMOTIONS_PACKAGE, retval.msg);
                
                // 重新组装
                retval.msg = plugins.getCDNPath(renderMsg);

                retval.avatar = plugins.setAvatar(retval);

                retval.roleAlias = config.role;
                if(config.isRender){
                    var chatRender = TMOD("chat_msg", retval);
                }else{
                    return;
                }

                // 插入html
                /*if(plugins.isGroups())*/
                if(plugins.isGroups(retval.gid)){ 
                    $chatHall.append(chatRender);
                    chat.checkNew(retval);
                    barrager.showBarrager(retval);
                }
                plugins.scrollToBottom("chat");

                  // 检查DOM
                plugins.checkChatSize();
                // checknew
                // MTSDK.room.newMessageRemind(0);
            }


             // 关键词
          /*  var isMathKeys = MTSDK.admin.bindKeywork.targetKey(retval.msg);*/
       
            // 是否屏蔽发言
            var isChatDisable = plugins.getChatAccess(retval);
            // 管理员不做任何屏蔽
            if(plugins.isAdmin(retval.role) ||plugins.isAdmin()){
                appendChat();
            }else{
                // 屏蔽关键词 || 禁止发言
                if(isChatDisable){
                    if(retval.xid == MT.me.xid){
                        appendChat();
                    }
                }else{
                    appendChat();
                }
            }

        },

        //发送表情
        sendEmotion: function(_val){
            var that = chat,
                action = MT.getLiveState(),
                $chat = $('#mode_chat_post'),
                $chatCon = $chat.find("textarea"),
                $chatVal = $.trim($chatCon.val()),
                $button = $("#mode_chat_post .csend"),
                $btnCloseUlist = $(".btn_close_list"),
                $chatHall = $("#chat_hall");  

            // 直播未开始
            if(action !== "start"){
                plugins.showComtip($button, "还没上课喔～");
                $('#network_icon').hide();
                return false;
            }
            $("#mode_chat_post .emoticon").removeClass("emoshow"); 
            // 发表时间限制
            if(!that.canSend){
                plugins.showComtip($button, "请在0.5秒后发言...");
                // 2s后取消限制
                if(!that.canSend){
                    setTimeout(function(){
                        that.canSend = true;
                    },500);
                }
                return false;
            }
            // clear content
            $chatCon.val("");
            $chatVal = $chatVal.replace(/\r/g, "");
            that.canSend = false;
            // send chat post
            chat.HT.emit("chat:send", {msg: _val}, function(retval){
                $("#mode_chat_post").removeClass("touchsend");
               /* $("#pop_emotis").hide();*/
                if(retval.code === 0){
                    // 表情替换{表情包 key: value, 聊天内容}
                    $("#pop_emotis").hide();
                    $("#mode_chat_post").removeClass("showemtion");
                    var renderMsg = MT.tools.ubb2img(window.BASE_EMOTIONS_PACKAGE, retval.data.msg);

                    renderMsg = plugins.getCDNPath(renderMsg);

                    retval.data.time = plugins.convertTimestamp(retval.data.time);
                    retval.data.msg = renderMsg;
                    retval.data.avatar= plugins.setAvatar(retval.data);
                    retval.data.roleAlias = config.role;
                    
                    var chatRender = TMOD("chat_msg", retval.data);

                    $chatHall.append(chatRender);
                    plugins.scrollToBottom("chat");

                    // 检查DOM
                    plugins.checkChatSize();

                    $btnCloseUlist.click();
                }else{
                    alert(retval.msg);
                }
                // 取消限制
                that.canSend = false;
                setTimeout(function(){
                    that.canSend = true;
                },500);
            });
        },

         // 绑定表情事件
        bindEmotiEvents: function($tsEL){
            var $tg = $tsEL,
                _ts = this;
            //UBB2string
            $tg.find('li').on('touchend', function(e){
                var _val = $(this).data('eid');
                _ts.sendEmotion(_val);
            });
        },

        // 显示表情
        showEmoti: function(e){
            var $t = $(e.currentTarget),
                that = this,
                _li = '',
                _ul = '',
                $eitems = $('#eitem'),
                $econ = $('#pop_emotis'); 

            if(!chat.userAllGag()){
                return;
            }    
    
            if($(this).hasClass("emoshow")){
               $('#pop_emotis').hide();
               $("#mode_chat_post").removeClass("showemtion"); 
               $t.removeClass("emoshow");
            }else{
               $("#mode_chat_post .emoticon").addClass("emoshow"); 
               $("#mode_chat_post").addClass("showemtion");  
               if($eitems.find("li").size() > 0){
                    $econ.show();
                    return false;
                }
                //插入表情库
                var $emtg = $('#pop_emotis'),
                    face = window.BASE_EMOTIONS_PACKAGE;
                for (var emoti in face) {
                    face[emoti] = plugins.getCDNPath(face[emoti]);
                    _li += '<li data-eid="'+emoti+'"><img src="'+face[emoti]+'"/></li>';
                };
                $eitems.append(_li);
                chat.bindEmotiEvents($emtg);
                $econ.show();      
            } 
             //关闭表情框
             $(document).bind("click",function(e){ 
                    var target = $(e.target); 
                    if(target.closest("#pop_emotis").length == 0){ 
                         $('#pop_emotis').hide();
                         $("#mode_chat_post").removeClass("showemtion"); 
                         $t.removeClass("emoshow");
                    } 
            })  
        },

         //初始化全体禁言的状态
        initGagStatue: function(){
            //刷新后禁言的状态
            if(MT.me.role != "admin"){
                var st = window.sessionStorage.getItem("status");
                if(st){
                    chat.gagStatue = st;
                    if(st == 1){
                        $("#chat_post_txt").attr("disabled","disabled");
                        $("#chat_post_txt").attr("placeholder","目前是锁屏模式，暂时不能发言哦...");
                        return;
                    }
                };
            }   
        },
        // 通知
        notify: function(retval){
            var tpl = TMOD("tpl_notifyx", retval);
            var $chall = $("#chat_hall");
            if($(".cmd_notice").size() > 0){
                $(".cmd_notice").html(tpl);
                // todo...
            }else{
                $chall.append(tpl);
            }
            MTSDK.room.newMessageRemind(2);
        },
        // 初始化
        init: function(HTSDK){
            chat.HT = HTSDK;
            this.binds();
            this.initGagStatue();
        }
    };
    // 暴露接口
    module.exports = chat;
});

