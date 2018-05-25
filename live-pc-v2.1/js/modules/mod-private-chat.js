/**
 * @date 2016-10-25
 * @author liangh
 * @name 直播私聊
 *
 */

(function(win){

    /* globle var*/
    var __Event  = "click"; 

    //私聊模块
    var privateChat = {
        
        HT: null,

        nickname: "",//保存用户名

        privateUser: null,// 当前选中用户对象

        inforList: [],//用于保存私聊成员的信息

        privateUserXids: {},//私聊成员列表中的xids

        localData: {},//本地数据

        sessionDataBase: {},//保存在sessoinStorge的聊天数据

        xid : 0,//单个用户的xid

        msg_num: 0,//末读的聊天信息条数

        current_xid : 0,//用于标识当前的用户xid

        defaults: {
            canSend: true //是否可发送信息
        },


        //初始化
        init: function(argument) {
            var that = this;
            that.initTemplate();
            that.bindEvent();
            that.showNotice();
            that.getInfor();
            that.initGetData();
        }, 

        //初始化私聊框
        initTemplate: function(){
            var privateTmp = template("tpl_private_pop_box");
            if(privateTmp){ 
                $("body").append(privateTmp);
            }
        },

        // 初始化获取sessionData数据(仅执行一次)
        initGetData: function(){
            var that = this;   
            // init vars
            that.privateUserXids = JSON.parse(sessionStorage.getItem("privateUserXids")) || {};
            that.privateUser = JSON.parse(sessionStorage.getItem("privateUser")) || {};
            that.inforList = JSON.parse(sessionStorage.getItem("inforList")) || [];
            that.current_xid = that.privateUser.xid;
        },

        //拖拽私聊框 
        dragAndDrop:function() {
            var _move = false;
            //鼠标离控件左上角的相对位置 
            var _x,
                _y;
            $(".private_head").mousedown(function(e) { 
                _move = true;
                _x = e.pageX-parseInt($(".private_pop_box").css("left")); 
                _y = e.pageY-parseInt($(".private_pop_box").css("top")); 
            }); 
            $(document).mousemove(function(e) {
                if(_move){ 
                  var x = e.pageX-_x;//移动时鼠标位置计算控件左上角的绝对位置 
                  var y = e.pageY-_y;

                  $(".private_pop_box").css({top:y,left:x});//控件新位置   
                } 
            }).mouseup(function() { 
              _move = false; 
            }); 
        }, 

        //初始化默认选中第一个用户
        defaultSelect: function(){
             var that =  this; 
             var msg_num = sessionStorage.getItem("msg_num");
             if(parseInt(msg_num) == 0){
                var $obj = $("#chat_user_list li:first");
                that.reloadChatMsg($obj);
             }  
        },

        //显示通知信息图标
        showNotice: function(){
            var that = this;
            var msg_num = JSON.parse(sessionStorage.getItem("msg_num"));
            var inforList =JSON.parse(sessionStorage.getItem("inforList"));
            if(!inforList){
                return false;
            }
            if(inforList.length>0){
                $(".private_notice_icon").show();  
                if(parseInt(msg_num)>0){
                   $(".msg_num").show();  
                   $(".private_notice_icon").addClass("playicon");  
                }else{
                   $(".msg_num").hide();  
                } 
            }         
        },

        //事件绑定
        bindEvent: function(){
            var that = this,
                $noticeIcon = $(".private_notice_icon"),
                $privateSendInfo = $("#private_send_info"),
                $privatePopBox = $("#private_pop_box"),
                $closePop = $("body .close_pop"),
                $privatePopEmo = $("#private_pop_emotis"),
                $chatUserList =  $("#chat_user_list"),
                $emoticon = $("#private_bottom .private_emotions"),
                $privateSendBtn = $(".private_send_btn");
            //点击通知信息图标弹出私聊界面    
            $noticeIcon.on(__Event, function(){
                //普通用户与游客弹出的私聊界面
                if(MT.me.role === "user" || MT.me.role === "guest"){
                    that.userPopShow();
                }
                //管理员端弹出的私聊界面 
                else if(MT.me.role === "admin"){
                    that.adminPopShow();
                }
               that.msg_num = 0; 
               sessionStorage.setItem("msg_num",that.msg_num);
               that.isClickNoticeIcon = true;
               that.dragAndDrop();
            });

            //点击私聊的用户
            $chatUserList.on(__Event,"li",function(){
                that.selectUserChat($(this));
                that.reloadChatMsg($(this));
            });    

            // 发送聊天(回车事件)
            $privateSendInfo.on("keydown", function(e) {
                if(e.keyCode === 13){
                    that.privatePost();
                    e.preventDefault();
                    return false;
                }
            });

            // 发送聊天(点击按钮)
            $privateSendBtn.on(__Event, function(){
                that.privatePost();
            }); 

            //表情绑定
            $emoticon.on(__Event, function(){
                that.showEmoti($(this));
                that.$textarea = $("body .private_chat_info textarea");
            });

            $privatePopEmo.on(__Event, "li", function() {
                that.bindEmotiEvents(this, that.$textarea);
            });

            $(window).on(__Event, function(e){
                if($(e.target).hasClass("private_pop_emotis") || $(e.target).hasClass("private_emotions")){
                    return false
                }else{
                   $privatePopEmo.removeClass("show");
                };
            });
        },

        //显示删除私聊成员的图标
        delHideShow: function(){
            var $listLi = $("#chat_user_list li");
            $listLi.on("mouseover",function(){
               $listLi.find("i").hide();
               var  xid = $(this).data("xid");
               $("#del_"+xid).show();
            });
            $listLi.on("mouseout",function(){
               $listLi.find("i").hide();
               var  xid = $(this).data("xid");
               $("#del_"+xid).hide();
            });
        },

        //删除成员
        delMember: function(){
            var $listLi = $("#chat_user_list"),
                that = this,
                $obj =  "",
                num = $("#chat_user_list li").size(),
                xid = 0;

            $listLi.on("click", "li i", function(e){

                    e.stopPropagation();

                    // 删除元素 & reload
                    var xid = $(this).parent("li").data("xid"),
                        rmIndex = $("#u_"+xid).index();
                    
                    $("#u_"+xid).remove();

                    var countEls = $("#chat_user_list li").size(),
                        lis = $("#chat_user_list li");
                    var $curLi = null;
                    // 选中上一个元素
                    if(countEls > 0){
                        // 首个被删, 选中第一项
                        if(rmIndex === 0){
                            $curLi = lis.eq(0);
                        }
                        // 选中上一项
                        else{
                            $curLi = lis.eq(rmIndex - 1);
                        }
                        $curLi.addClass("cur");
                        $("#private_head .user_name").html($curLi.find("a span").html());
                        
                        // 重载当前选中聊天数据
                        that.reloadChatMsg($curLi);
                    }else{
                        $("#private_pop_box").hide();
                    }

                // }

                 // 删除sessionStorge中的`privateUserXids,inforList`数据
                if(that.privateUserXids[xid]){
                    delete that.privateUserXids[xid];
                }  
                for(var i = 0; i< that.inforList.length;i++){
                    if(that.inforList[i].xid == xid){
                        that.inforList.splice(i,1); 
                    }
                }
                sessionStorage.setItem("privateUserXids", JSON.stringify(that.privateUserXids));
                sessionStorage.setItem("inforList", JSON.stringify(that.inforList));      
            })

           
        },


        //点击私聊框左边栏选择与之私聊的用户
        selectUserChat: function($obj){
            var that = this;
            $("#chat_user_list li").removeClass("cur");
            var xid = $obj.data("xid");
            $("#u_"+xid).addClass("cur");
            $("#ts_"+xid).hide();
            $("#private_head .user_name").html("");
            $("#private_head .user_name").html($obj.find("a span").html());
            that.current_xid = xid;
            $("#private_chat_domain").scrollTop($("#private_chat_msg").height());
        },

         //显示表情
        showEmoti: function(e){
            var $t = $(e),
                that = this,
                _li = '',
                _ul = '';
                
            var $eitems = null,
                $econ = null;
            //区分
            if($t.hasClass("private_emotions")){
                $eitems = $('#private_eitem');
                $econ = $('#private_pop_emotis');
            }else{
                $eitems = $('#eitem');
                $econ = $('#pop_emotis');
            }
            
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
            var $emtg = $econ,
                face = window.HT_EMOTIONS_PACKAGE;
            for (var emoti in face) {
                _li += '<li data-eid="'+emoti+'"><img src="'+face[emoti]+'"/></li>';
            };
            $eitems.append(_li);
            $econ.addClass("show");
            setTimeout(function(){
                that.eisShow = true;
            },1000);
        },
              

        // 绑定表情事件
        bindEmotiEvents: function(emo,$areare){
            var that = this,
                $tg = $(emo);
            //UBB2string
            var _val = $tg.data('eid'),
                _el = $areare.get(0);
            MT.tools.insertPosition(_el, _val);     
            $("#private_pop_emotis").removeClass("show");
            $(_el).focus();
        },

        //管理员端显示私聊界面
        adminPopShow: function(){
            // console.info("22")
            var that = this,
                $privatePopBox = $("#private_pop_box");
            $privatePopBox.addClass("admin_pop");
            $(".private_notice_icon").show();
            $privatePopBox.show();
            that.privatePopClose();
            that.isRepateMember();
            that.dragAndDrop();
            that.msg_num == 0;
            $(".private_notice_icon").removeClass("playicon");
            $("#mod_chat_post .msg_num").hide();
            sessionStorage.setItem("msg_num",that.msg_num); 
        },

        //普通用户端私聊界面显示
        userPopShow: function(){
            var that = this,
                $privatePopBox = $("#private_pop_box");
            $privatePopBox.addClass("user_pop");
            $privatePopBox.show();
            that.privatePopClose();
            that.msg_num == 0;
            sessionStorage.setItem("msg_num",that.msg_num); 

            $(".private_notice_icon").removeClass("playicon");
            $("#mod_chat_post .msg_num").hide();

            that.isRepateMember();
        },

        // 点击接收 / 发起私聊
        isRepateMember: function(){
            var that = this;  
            // 发起／接收 => 通过 `that.privateUser`  => 读取当前用户数据,且保存session
            if(!that.privateUserXids[that.privateUser.xid]){
                that.privateUserXids[that.privateUser.xid] = that.privateUser.xid;
                
                that.inforList.push(that.privateUser);
                sessionStorage.setItem("privateUserXids", JSON.stringify(that.privateUserXids));
                sessionStorage.setItem("inforList", JSON.stringify(that.inforList));

                // 初始化渲染聊天用户列表
                that.renderPrivateUserList(that.privateUser);

            }else{
                that.showDialog(that.privateUser);   
            }  

            // 设置当前用户
            sessionStorage.setItem("privateUser", JSON.stringify(that.privateUser));

            // ?
            that.delHideShow();   
             
            // 关闭具体聊天窗口
            if(!that.isLoadDelMember){
                that.delMember();
                that.isLoadDelMember = true;
            }
        },

        // 初始化渲染聊天用户列表    
        renderPrivateUserList: function(res){
            var that = this,
                tmp = "",  
                avatar = ""; 
                if(res.avatar.length == 0){//默认头像
                    res.avatar = HTSDK.room.setAvatar(res);
                }
            var userData={
                d:  res
            }
            tmp = template("tpl_private_list",userData);
            $("#chat_user_list").prepend(tmp);
            $("#chat_user_list li").removeClass("cur");
            $("#private_head .user_name").html("");
            $("#private_head .user_name").html(res.nickname);
            $("#u_"+res.xid).addClass("cur"); 
            that.current_xid = res.xid;
            that.reloadChatMsg($("#u_"+res.xid));
            $("#private_chat_domain").scrollTop($("#private_chat_msg").height());
        },  
        
        //关闭私聊弹框
        privatePopClose: function(){
            var $closePop = $("body .close_pop"),
                $privatePopBox = $("#private_pop_box");  
            $closePop.on("click",function(){
                $privatePopBox.hide();
            });
        },

        //接收聊天信息
        receiveChat: function(res){
            var that = this;
             // 表情替换{表情包 key: value, 聊天内容}
            var renderMsg = HTSDK.tools.ubb2img(window.HT_EMOTIONS_PACKAGE,res.msg);
            var chatData = {
                d: res,
                xid: res.xid,
                avatar: HTSDK.room.setAvatar(res),
                privateChatMsg: renderMsg,
                me_role: MT.me.role,
                me_xid: MT.me.xid
            };

            var infor= {
                xid: res.xid,
                nickname: res.nickname,
                role: res.role,
                avatar: res.avatar
            };
            
            // 当前私聊用户
            that.privateUser = infor;

            // 当前用户xid
            that.xid = res.xid;

            $(".private_notice_icon").show();
            //私聊弹框没有显示出来的情况下
            if($("#private_pop_box").is(":hidden")){
                that.msg_num++;
                sessionStorage.setItem("msg_num",that.msg_num); 
                $("#mod_chat_post .msg_num").show();
                /*$("#mod_chat_post .msg_num").html(that.msg_num);*/
                $(".private_notice_icon").addClass("playicon");
            }else{
                var privateUserXids = that.privateUserXids;//JSON.parse(sessionStorage.getItem("privateUserXids"));
                if(!privateUserXids[res.xid]){
                    that.msg_num++;
                    $("#mod_chat_post .msg_num").show();
                    $(".private_notice_icon").addClass("playicon");
                }
            }    
            var r_xid = $("#chat_user_list .cur").data("xid");
            if(r_xid == res.xid){
                var  chatMsgTmp = template("tpl_private_chat_msg",chatData); 
                $("#private_chat_msg").append(chatMsgTmp);
            }else{
                $("#ts_"+res.xid).show();
            }    

            $("#private_chat_domain").scrollTop($("#private_chat_msg").height());
            
            // 设置及存储数据
            that.saveInfor(chatData);
        },

        //针对助教和师显示私聊    
        isShowPrivate: function(xid,role){
            if(MT.me.xid == xid || MT.me.role === "user"){
                return "hidden";
            }else if(MTSDK.admin.isAdmin(role) && MTSDK.admin.isAdmin(MT.me.role)){
                return "show";
            }else{
                return "";
            }
        },

        //加载对应的聊天信息
        reloadChatMsg: function($obj){
            $("#private_chat_msg").empty(); 
            var that = this;
            var tmp= "";

            var chatMsg = JSON.parse(sessionStorage.getItem("chatMsg"));
            var  xid = $obj.data("xid");
            if(chatMsg == null){
                return false;
            }
            var chatMsgList = chatMsg[xid];
            if(chatMsgList == undefined){
                return;
            }
            that.current_xid = xid;
            for (var i = 0; i < chatMsgList.length; i++) {
                chatMsgList[i].avatar = HTSDK.room.setAvatar(chatMsgList[i]);
                tmp+= template("tpl_private_chat_msg",chatMsgList[i]);

            }    
            $("#private_chat_msg").append(tmp); 

            $("#private_chat_domain").scrollTop($("#private_chat_msg").height());
        },



        getInfor: function(){
             var that = this;
             
             var chatMsg = JSON.parse(sessionStorage.getItem("chatMsg")); 

             that.sessionDataBase = chatMsg; 
            
             for(var key in that.sessionDataBase){

                if(!that.localData[key]){

                    that.localData[key] = []; //Array
                    that.localData[key] = that.sessionDataBase[key]; //Object
                }
             };

        },

        //存储用户的信息
        saveInfor: function(res){
            var that = this,
                xid = that.current_xid;    
            if(res.xid){
                xid = res.xid;
            }    
            if(!that.localData[xid]){
                that.localData[xid] = [];
            }
            that.localData[xid].push(res);
            
            // 设置索引
            if (!that.privateUserXids){
                that.privateUserXids = {};
            }
            // 保存 ｀inforList｀
            if(!that.privateUserXids[that.xid]){
                that.privateUserXids[that.xid] = that.privateUser.xid;
                that.inforList.push(that.privateUser);
            }
            
            // 写入 => sessionStorage
            sessionStorage.setItem("chatMsg", JSON.stringify(that.localData));
            sessionStorage.setItem("privateUserXids", JSON.stringify(that.privateUserXids));
            sessionStorage.setItem("inforList", JSON.stringify(that.inforList));
            sessionStorage.setItem("privateUser", JSON.stringify(that.privateUser));

        },
         
        //私聊用户列表模板
        memberTmp: function(data){
            var d= "";
            var userData={
                d:  data
            }
            return userData;
        },

        //显示对话框
        showDialog: function(res){
            var that = this,
                avatar = "",
                tmp = "";                                           
           //JSON.parse(sessionStorage.getItem("inforList")); 
            $("#chat_user_list").empty(); 
            that.inforList.sort();
            var inforList = that.inforList;

            for(var i = 0; i < inforList.length;i++){

                if(inforList[i].avatar.length == 0){//默认头像
                    avatar = HTSDK.room.setAvatar(inforList[i]);
                }else{
                    avatar = inforList[i].avatar;
                }
                inforList[i].avatar = avatar;
                tmp += template("tpl_private_list",that.memberTmp(inforList[i]));
            }
            
            $("#chat_user_list").append(tmp);
            $("#chat_user_list li").removeClass("cur");
            $("#u_"+res.xid).addClass("cur");
            $("#u_"+res.xid).insertBefore($("#chat_user_list li:first"));
            $("#private_head .user_name").html("");
            $("#private_head .user_name").html(res.nickname);
            HTSDK.privateChat.reloadChatMsg($("#u_"+res.xid));
           

        }, 
        //私聊信息发送
        privatePost: function(){
            var that = this,
                action = MT.getLiveState(),
                $chatCon = $("#private_send_info"),
                $chatVal = $.trim($chatCon.val());
                      
            // 禁止为空
            if($chatVal.length === 0){
                HTSDK.tools.showComtip($chatCon,"请输入内容...");
                return false;
            }

            //直播末开始禁止私聊
            if(action != "start"){
                HTSDK.tools.showComtip($chatCon,"直播尚未开启，暂时无法私聊!");
                return false;
            }

            // 过滤回车
            $chatCon.val($chatVal.replace(/\r/g, ""));
            // 检查字数
            if(HTSDK.tools.charLength($chatVal) > 150){
                HTSDK.tools.showComtip($chatCon, "不能超过150个字符");
                return false;
            }
            $chatCon.focus();
            //发送聊天信息  
            that.HT.emit("chat:private",{xid:that.current_xid, msg:$chatVal}, function(res){
                if(res.code === 0){
                    $chatCon.val("");
                    that.xid = that.current_xid;
                    that.privateChatTmp(res);           
                }else{
                    HTSDK.tools.showComtip($chatCon,res.msg);
                }
                that.defaults.canSend = false;
                setTimeout(function(){
                    that.defaults.canSend = true;
                }, that.defaults.sendTimeLimit);
            });
        },

        //发送聊天信息
        privateChatTmp: function(res){
            var that = this;
             // 表情替换{表情包 key: value, 聊天内容}
            var renderMsg = HTSDK.tools.ubb2img(window.HT_EMOTIONS_PACKAGE,res.data.msg);
            var chatData = {
                d: res.data,
                privateChatMsg: renderMsg,
                avatar: HTSDK.room.setAvatar(res.data),
                me_role: MT.me.role,
                me_xid: MT.me.xid
            }
            var tmp = template("tpl_private_chat_msg",chatData);
            $("#private_chat_msg").append(tmp);
            $("#private_chat_domain").scrollTop($("#private_chat_msg").height());
            that.saveInfor(chatData);
        }
    }

    // 暴露
    var HTSDK = win.HTSDK || {};
    HTSDK.privateChat = privateChat;

})(window);
