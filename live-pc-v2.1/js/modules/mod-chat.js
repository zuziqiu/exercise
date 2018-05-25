/**
 * 聊天模块
 */
(function(win){
    // 聊天区
    var modChat = {
        // 默认值
        defaults: {
            curTab: 0, //当前tab的指针 0/1...
            chatCount: 0, //聊天计数
            showAdminonly: false, //只看老师聊天
            maxChatSize: 150, //聊天区信息限制
            sendTimeLimit: 2000, //聊天时间限制
            canSend: true, //是否可发送信息
            flag: false,
            gagStatue: 0, //全体禁言状态 0 解禁 1 禁言
            isScreenShot: false
        },
        gagListUrl: protocol + window.location.host+'/live/member.php',//禁言列表
        // 目标元素
        $target: $("#mod_col_right"),
        
        // 事件绑定
        bindEvents: function(){
            var that = this,
                $tab = that.$target.find(".tab_change li"),
                $emitChat = $("#emit_chat_txt"),
                $postChatBtn = $("#post_chat_btn"),
                $emotionBtn = that.$target.find(".emotion_btn"),
                $allGag = $(".all_gag"),
                $popEmo = $("#pop_emotis"),
                $chatHall = $("#mod_chat_hall"),
                $chatScroll = $("#mod_chat_scroller"),
                $showAdmin = $(".show_adchat"),
                $notify = $("#mod_notify_con"),
                $chatTarget = $(".mod_chat_post textarea");

            var _robotend = true;
            //全部禁言
            $allGag.on("click",function(){
                var status = 0;
                if($(this).hasClass("gag")){
                    $(this).removeClass("gag");
                    $("#pop_tip").html("点击开启全体禁言");
                    status = 0;
                     window.sessionStorage.setItem("status",status);
                    //解除所有用户发言
                    HTSDK.room._HT.emit("chat:disable:all",status,function(retval){});
                }else{
                     var $alertPop = alertPop({
                        'title': '禁言提示',
                        'confirmBtn': true,
                        'cancleBtn': true,
                        'msg': "确定开启全体禁言吗？（管理/助教不受限制）",
                        'maskLayer': false
                    });
                    $alertPop.confirm(function () {
                        $(this).addClass("gag");
                        $("#pop_tip").html("点击关闭全体禁言");
                        status = 1;
                        window.sessionStorage.setItem("status",status);
                        //禁止所有用户发言
                        HTSDK.room._HT.emit("chat:disable:all",status,function(retval){});
                    });    
                }
            });

            //截图关闭
            $("body").on("click",'.clip_close',function () {
                $(".htdialog_clip_con").hide();
                $("#pop_layer").hide();
            }); 


            //鼠标移上去显示提示
            $allGag.on("mouseover",function(){
                $("#pop_tip").show();
            });

            $allGag.on("mouseout",function(){
                $("#pop_tip").hide();
            });

            //终端浮动显示
            $chatHall.on("mouseover",'.chat_terminal',function(){
                var that = $(this),
                    xid = $(this).parents('.chat_list').attr('data-xid'),
                    msg = $(this).parents('.chat_list').find('.term_msg');

                if(msg.text().length == 0){
                    MT.getDetail(xid, function(ret){
                        if(ret.data){
                            msg.text(ret.data.os);
                        }
                    });
                }
                msg.show();
            });

            $chatHall.on("mouseout",'.chat_terminal',function(){
                var msg = $(this).parents('.chat_list').find('.term_msg');
                msg.hide();
            });

            // 聊天禁止滚动
            $chatScroll.scroll(function(){
                var scTop = (this.scrollHeight - $(this).scrollTop()) - $(this).height();
                if(scTop > 100){
                    that.chatScrollLock = true;
                }else{
                    that.chatScrollLock = false;
                }
            });

            // 清屏
            $chatScroll.on("mouseover", function(){
                $("#clear_chat").show();
            });

            $chatScroll.on("mouseout", function(){
                $("#clear_chat").hide();
            });

            $("#clear_chat").on("click", function(){
                $chatHall.html("");
            });
            
            // 聊天区tab切换
            $tab.on("click", function(){
                var $num = $(".tab_change .numbers");
                var index = $(this).index();
                // 如果当前选中“聊天:0”新信息隐藏
                if(index === 0){
                    $num.hide();
                    that.defaults.chatCount = 0;
                    HTSDK.tools.scrollToBottom("chat");
                }else{
                    
                    // Get online users on emit.
                    HTSDK.modOnlines.getOnlines(function(list){

                        // 真实用户
                        HTSDK.modOnlines.renderList(list);

                        // 设置特殊用户
                        if(_robotend){
                            _robotend = false;
                            HTSDK.modOnlines.setRobotlist();
                        }

                    });
                    
                    var _MT = HTSDK.room._HT; 
                }
                if(index === that.defaults.curTab){
                    return false;
                }
                var $tabBox = that.$target.find('.chat_tab_box');
                $tab.removeClass("current").eq(index).addClass("current");
                $tabBox.hide().eq(index).fadeIn(100);
                that.defaults.curTab = index;
            });

            // 表情绑定
            $emotionBtn.on("click", function(){
                var flag = HTSDK.modChat.userAllGag();
                if(flag){
                    that.showEmoti(this);
                }
                
            });
            $popEmo.on("click", "li", function(){
                that.bindEmotiEvents(this);
            });
            $(window).on('click', function(e){
                if($(e.target).hasClass("emoticon") || $(e.target).hasClass("emotion_btn")){
                    return false
                }else{
                $('#pop_emotis').removeClass("show");

                };
            });

            // 发送聊天(回车事件)
            $emitChat.on("keydown", function(e){
                if(e.keyCode === 13){
                    that.emitChat();
                    e.preventDefault();
                    return false;
                }
            });

            // 粘贴(截图预览)
            $emitChat.on("paste", function(event){
                // 非管理
                if(MTSDK.admin.isAdmin()){
                    MT.chat.onpaste(event, function(photo){
                        var _photo = {
                            _imgUrl: photo
                        };
                        var _tplPhoto = template("tpl_clipboard_con", _photo);
                        $("body").append(_tplPhoto);
                        $("#pop_layer").show();
                    });
                }
            });
            // 发送截图
            $("body").on("click", "#clip_btns a", function(e){ 
                var $clipBox = $("#mod_clip_con");
                // 取消
                if($(this).hasClass("btn_default")){
                    $clipBox.remove();
                    $("#pop_layer").hide();
                }
                // 发送
                if($(this).hasClass("btn_primary")){
                    $("#clip_btns").html("发送中...");
                    MT.chat.postClipPhoto(function(ret){
                        if(ret.code == 0){  
                            var _msg = "[IMG]"+ret.data.url+"[/IMG]";
                            HTSDK.room._HT.emit("chat:send", {msg: _msg}, function(retval){
                                if(retval.code === 0){
                                    that.onChat(retval.data);
                                    $clipBox.remove();
                                    $("#pop_layer").hide();
                                }
                            });
                        }else{
                            alert(ret.data.msg);
                        }
                    });
                }
            });
            // 聊天区预览
            $chatScroll.on("click", ".clip", function(){
                // 大图
                MT.chat.showImageFullSize(this.src, function(src){
                    var imgEl = {clipurl: '<img src="'+src+'" />'};
                        $("body").append(template("tpl_clip_preview", imgEl));
                });
            });
            // 关闭截图
            $("body").on("click", "#cls_clip", function(){
                $("#mod_show_clip").remove();
            });

            // 发送按钮
            $postChatBtn.on("click", function(){
                /*var flag = HTSDK.modChat.userAllGag();
                if(flag){*/
                    that.emitChat();
                /*} */
            });

            // 绑定获取焦点事件
            $chatTarget.on("focus", function(event) {
                if($(this).val().length > 0){
                    $postChatBtn.addClass("active");
                }else{
                    $postChatBtn.removeClass("active");
                }
            });

            // 绑定失去焦点事件
            $chatTarget.on("blur", function(event) {
                if($(this).val().length > 0){
                    $postChatBtn.addClass("active");
                }else{
                    $postChatBtn.removeClass("active");
                }
            });

            // 键盘弹起
            $chatTarget.on("keyup", function (e) {
                if($(this).val().length > 0){
                    $postChatBtn.addClass("active");
                }else{
                    $postChatBtn.removeClass("active");
                }
            });

            // 只看老师发言
            $showAdmin.on("click", function(e){
                if($(this).hasClass("cur")){
                    $(this).removeClass("cur");
                    that.defaults.showAdminonly = false;
                    that.showAdminChat("all");
                }else{
                    $(this).addClass("cur");
                    that.defaults.showAdminonly = true;
                    that.showAdminChat(0);
                }
            });

            // 公告操作
            $notify.on("click", function(e) {
                var className = e.target.className,
                    $that = $(e.target);
                if(className === "close_notice"){
                    $(".notice_bg").slideUp(200, function(){
                        $("#mod_chat_hall").removeClass('has_notice');
                    });
                }else if(className.indexOf("more") >= 0){
                    if($that.hasClass("open")){
                        $that.removeClass("open").html("显示全部");
                        $(".notify_con").removeClass("detail");
                    }else{
                        $that.addClass("open").html("收起");
                        $(".notify_con").addClass("detail");
                    }
                }
            });
            
        },


        //聊天列表
        chatList: function (dataList) {
            var tmpList = "",
                that =  this;
            for (var i = 0; i< dataList.length; i++) {
                tmpList += that.renderChat(dataList[i]);
            }
            $("#mod_chat_hall").append(tmpList);

        },


        //下课默认关闭全体禁言
        closeAllGag: function() {
            $(".all_gag").removeClass("gag");
        },

        initChatGag: function(){
            var that = this;
            //刷新后禁言的状态
            var st = window.sessionStorage.getItem("status");
            if(st){
                that.defaults.gagStatue = st;
                if(st == 0){
                    $(".all_gag").removeClass("gag");
                    $("#pop_tip").html("点击开启全体禁言");
                
                }else{
                    $("#pop_tip").html("点击关闭全体禁言");
                    if(MT.me.role != "admin"){
                        $(".all_gag").addClass("gag");
                        $("#emit_chat_txt").attr("disabled","disabled");
                        $("#emit_chat_txt").attr("placeholder","目前是禁言模式，暂时不能发言哦...");
                        return;
                    }else{
                        $(".all_gag").addClass("gag");
                    }
                }
            };
        },
        
        //禁言列表
        gagList: function(){
            var that = this;
            $.ajax({
                type: 'GET',
                data: 'access_token='+window.access_token+'&act=disableList',
                url: that.gagListUrl,
                dataType: "jsonp",
                success: function(ret){
                    if(ret && ret.code){
                        if(ret.code == 0){
                            for(var i =0; i< ret.data.length;i++){
                                if(MT.me.role !="user"){
                                    $("#user_"+ ret.data[i].xid).find('.grant').addClass('ban');
                                }
                        }   
                        }
                    }
                }
            });
        },

        // 只看老师发言
        showAdminChat: function(type){
            var $chatHall = $("#mod_chat_hall");
            if(type === "all"){
                HTSDK.modChat.showAdminonly = false;
                $chatHall.find(".chat_list").show();
                HTSDK.tools.scrollToBottom("chat");
            }else{
                HTSDK.modChat.showAdminonly = true;
                $chatHall.find(".chat_list").hide();
                $chatHall.find('.chat_list').each(function(i, e){
                    if($(e).hasClass("admin") || $(e).hasClass("spadmin") || $(e).hasClass("self_admin")){
                        $(e).show();
                    }
                });
            }
        },
        // 检查聊天DOM数据
        checkChatSize: function(){
            var chatSize = $("#mod_chat_hall > div").size();
            if(chatSize > this.defaults.maxChatSize){
                $("#mod_chat_hall > div").eq(0).remove();
            }
            //处理聊天区管理功能
            if(MT.me.role === "user" || MT.me.role === "guest"){
                if($('.chat_list').hasClass("user") || $('.chat_list').hasClass("guest")){
                    $(".cp").hide();
                }
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

        // 显示表情
        showEmoti: function(e){
            var $t = $(e),
                that = this,
                _li = '',
                _ul = '',
                $eitems = $('#eitem'),
                $econ = $('#pop_emotis');
            // reset
            $econ.css({
                "left": $t.offset().left - 9,
                "top": $t.offset().top - 78
            });
            if($econ.hasClass("show")){
                $econ.removeClass("show");
            }else{
                $econ.addClass("show");
            }
            //items
            if($eitems.find("li").size() > 0){
                return false;
            }
            //插入表情库
            var $emtg = $('#pop_emotis'),
                face = window.HT_EMOTIONS_PACKAGE;
            for (var emoti in face) {
                face[emoti] = HTSDK.room.getCDNPath(face[emoti]);
                _li += '<li data-eid="'+emoti+'"><img src="'+face[emoti]+'"/></li>';
            };
            $eitems.append(_li);
            $econ.addClass("show");
            setTimeout(function(){
                that.eisShow = true;
            },1000);
        },
        // 绑定表情事件
        bindEmotiEvents: function(emo){
            var that = this,
                $tg = $(emo);
            //UBB2string
            var _val = $tg.data('eid'),
                _el = document.getElementById("emit_chat_txt");
            MT.tools.insertPosition(_el, _val);
            $("#pop_emotis").removeClass("show");
            $(_el).focus();
        },
        // 渲染截图聊天
        renderClipChat: function(ret){
            var img = '<img src="'+ret.data.url+'" />';
            return img;
        },
        // 渲染聊天信息
        renderChat: function(ret){
            // process...
            var that = this,
                d = ret,
                status = " "+d.role,
                isMe = d.xid === MT.me.xid,
                isHide = "block",
                avatar = HTSDK.room.setAvatar(d),
                chatMsg = "",
                isSuper = HTSDK.room.isAdmin(d.role),
                renderMsg = "",
                tpl = '',
                terminal = '';

            //终端
            if( d.term == 5){
                terminal = 'mac' ;
            }else if(d.term == 4 || d.term == 6 || d.term == 2){
                terminal = 'mb' ;
            }else if(d.term == 8){
                terminal = 'ipad' ;
            }
            
            //助教老师才显示
            if(MT.me.role !== "admin" && MT.me.role !== "spadmin"){
                terminal = "hidden";
            }

            // 自己
            if(isMe){
                if(d.role !== "admin" && d.role !== "spadmin"){
                    status = " self";
                }else{
                    status = " self_"+d.role;
                }
                terminal = "hidden";

            }else{
                status = " "+d.role;
            }

            // 是否显示聊天
            if(!isSuper && that.defaults.showAdminonly){
                isHide = "none";
            }
            // 表情替换{表情包 key: value, 聊天内容}
    	  	// renderMsg = HTSDK.tools.ubb2img(window.HT_EMOTIONS_PACKAGE, d.msg);
            var reg = /\[[a-z]+\]/g,
            	regx =  /\[IMG\](.*?)\[\/IMG\]/;
            if(regx.test(d.msg)){
                modChat.defaults.isScreenShot = true;
            }
            if(reg.test(d.msg)){
                renderMsg =  HTSDK.tools.ubb2img(window.HT_EMOTIONS_PACKAGE, d.msg);
                modChat.defaults.isScreenShot = false;
            }else{
                if(!modChat.defaults.isScreenShot){
                    renderMsg = HTSDK.tools.textUrlLink(d.msg); 
                }else{
                    renderMsg =  d.msg;
                }
            }

            // 管理员发送操作
            if(d.role === "admin" || d.role === "spadmin"){
                // UBB图片替换
                chatMsg = MT.chat.toHTML(renderMsg);
                //chatMsg = HTSDK.tools.text2link(renderMsg);
            }else{
                chatMsg = renderMsg;
            }

            // 替换CDN
            chatMsg = HTSDK.room.getCDNPath(chatMsg);

            // 是否显示管理员工具
            var _isShowTools = false,
                meRole = HTSDK.room._HT.getMtData().user.role;

            if(MTSDK.admin.isAdmin(d.role)){
                _isShowTools = false;
            }else{
                if(MT.me.role !="admin" && MT.me.role !="spadmin"){
                    _isShowTools = false;
                }else{
                    _isShowTools = true;
                }
            }
            // 模版数据
            var chatData = {
                isShow: isHide,
                d: d,
                isShowPrivate:HTSDK.privateChat.isShowPrivate(d.xid,d.role),
                time: HTSDK.tools.convertTimestamp(d.time),
                avatar: avatar,
                status: status,
                isShowTools: _isShowTools,
                chatMsg: chatMsg,
                terminal:terminal
            };
            // render
            if(HTSDK.room.templateLoad){
                tpl = template("tpl_append_chat", chatData);
            }
            // exports
            return tpl;
        },

        //全体解禁、全体禁言
        allDisbleChat: function(retval){
            if(MT.me.role == "admin"){
                return;
            }
            var $chatCon = $("#emit_chat_txt"),
                that = this;   
            //禁言
            if(retval.status == 1){
                $chatCon.attr("disabled","disabled");
                $chatCon.val("");
                $chatCon.attr("placeholder","目前是禁言模式，暂时不能发言哦...");
            }
            //解禁
            else if(retval.status == 0){
                $chatCon.removeAttr("disabled");
                if(MT.me.role === "admin"){
                    $chatCon.attr("placeholder","请输入文字或粘贴截图发送聊天...");
                }else{
                    $chatCon.attr("placeholder","请输入文字...");
                }
                
            }
            that.defaults.gagStatue = retval.status;
            window.sessionStorage.setItem("status",retval.status);
        },

        //禁言通知
        gagNotice: function(retval){
            var notify = '';
            if(retval.status == 1){
                notify = '全体禁言已开启！（仅管理员可发言）';
                $(".all_gag").addClass("gag");
            }else{
                notify = '全体禁言已关闭！（全体用户可自由发言）';
                $(".all_gag").removeClass("gag");
            }
            if(HTSDK.modChat.defaults.flag){
                HTSDK.modChat.defaults.flag = false;
                return;
            }
        
            HTSDK.tools.chatNotify(notify);
        },


        //全体禁言普通用户不准发言、送花、发送表情
        userAllGag: function(){
            var that = this;
            if(MT.me.role != "admin" && that.defaults.gagStatue == 1){
                return false;
            }else{
                return true;
            }
        },

        // 发送聊天
        emitChat: function(){
            var that = this,
                _HT = HTSDK.room._HT,
                tools = HTSDK.tools,
                action = MT.getLiveState(),
                $chat = $('#mod_chat_post'),
                $chatCon = $("#emit_chat_txt"),
                $chatVal = $.trim($chatCon.val()),
                $btnCloseUlist = $(".btn_close_list"),
                $chatHall = $('#mod_chat_hall');

            // filter emoji
            $chatVal = that.filterEmoji($chatVal);

            // check-FAQ
            var isMathKey = MTSDK.admin.bindKeywork.targetKey($chatVal);
            if(isMathKey){
                MTSDK.admin.bindKeywork.renderTargetKey();
            }

            //课程是否允许课前课后聊天
            if( action != "start" && !HTSDK.live._classChat() && !MTSDK.admin.isAdmin()){
                HTSDK.tools.showComtip($chatCon, "没有上课...");
                return false;
            }

            // 禁止为空
            if($chatVal.length === 0){
                HTSDK.tools.showComtip($chatCon, "请输入内容...");
                return false;
            }
            // 过滤回车
            $chatCon.val($chatVal.replace(/\r/g, ""));
            // 检查字数
            if(tools.charLength($chatVal) > 150){
                tools.showComtip($chatCon, "不能超过150个字符");
                return false;
            }
            // 发表时间限制
            if(!this.defaults.canSend){
                tools.showComtip($chatCon, "请在2秒后发言...");
                return false;
            }
            // clear content
            $chatCon.focus();

            // send chat post
            _HT.emit("chat:send", {msg: $chatVal}, function(retval){
                if(retval.code === 0){
                    var chatRender = that.onChat(retval.data);
                    that.defaults.canSend = false;
                    $chatCon.val("");
                    setTimeout(function(){
                        that.defaults.canSend = true;
                    }, that.defaults.sendTimeLimit);
                    //$btnCloseUlist.click();
                }else{
                    tools.showComtip($chatCon, retval.msg);
                }
            });
        },
        // 接收聊天信息
        onChat: function(ret, type){
            // 截取聊天信息
            var that = this,
                $chatHall = $("#mod_chat_hall"),
                _tpl = "";


            // filter emoji
            ret.msg = that.filterEmoji(ret.msg);

            
            // match cmd.
            if(MTSDK.admin.isAdmin(ret.role)){
                var isShoot = MTSDK.admin.operation.specialCmd(ret.msg);
                if(isShoot){
                    return false;
                }
            }
            // 插入聊天(公共方法)
            var appendChat = function(){
                var chatRender = that.renderChat(ret);
                //分组,只看老师和自己一组的聊天信息
                if(HTSDK.room.isGroups(ret.gid)){
                    $chatHall.append(chatRender);    
                }            
                // 聊天区显示被禁言图标
                if(ret.chat.enable == 0){
                    if(MT.me.role == "user" ||MT.me.role == "guest"){
                        $(".ban_"+ret.xid).hide();
                    }else{
                        $(".ban_"+ret.xid).show();
                    }
                
                }

                // 统计未读信息
                if(HTSDK.room.isGroups(ret.gid)){
                    that.checkNew();
                }
                // 滚动底部
                HTSDK.tools.scrollToBottom("chat");
                // 检查DOM
                that.checkChatSize();
            };
            
            // 关键词
            var isMathKeys = MTSDK.admin.bindKeywork.targetKey(ret.msg);

            // 是否屏蔽发言
            var isChatDisable = MTSDK.admin.operation.getChatAccess(ret);
            
            // 管理员不做任何屏蔽
            if(MTSDK.admin.isAdmin(ret.role) || MTSDK.admin.isAdmin()){
                appendChat();
            }else{
                // 屏蔽关键词 || 禁止发言
                if(isMathKeys || isChatDisable){
                    if(ret.xid == MT.me.xid){
                        appendChat();
                    }
                }else{
                    appendChat();
                }
            }
        },
        // 聊天区未读信息
        checkNew: function(){
            var $num = $(".tab_change .numbers");
            if(this.defaults.curTab != 0){
                this.defaults.chatCount += 1;
                $num.show();
                $num.html(this.defaults.chatCount);
            }else{
                this.defaults.chatCount = 0;
                $num.hide();
            }
        },
        // 发送聊天信息
        chat_content:function(ret){
            var that = this,
            $chat_list = $("#chat_list"),
            chatRender = template("chat_content", ret);
        },
        init: function(){
            this.bindEvents();
        }
    };

    // 暴露
    var HTSDK = window.HTSDK || {};
    HTSDK.modChat = modChat;

})(window);