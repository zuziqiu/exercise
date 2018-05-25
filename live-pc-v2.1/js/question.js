// 问答区
HTSDK.modQuestion = {
    $target: $("#mod_questions"),
    defaults:{
        canSend: true,
        sendTimeLimit: 180,
        showMeOnly: false,
        maxQuesSize: 500,
        setTime: null,
        quesRender: false
    },
    // 事件绑定
    bindEvents: function(){
        var that = this,
            $quesHall = $("#mod_chat_hall"),
            $queScoller = $("#mod_ques_scroller"),
            $queScHall = $("#mod_questions_con"),
            $showMebtn = $(".show_me_ques"),
            $quesBtn = $("#post_question_btn"),
            $loadMoreQuesBtn = $("#ques_load_more"),
            $dialogCont = $(".dialog_cont"),
            $postQues = $("#ques_post_txt");

        // 聊天问答滚动
        $queScHall.scroll(function(){
            var scTop = (this.scrollHeight - $(this).scrollTop()) - $(this).height();
            if(scTop > 100){
                that.quesScrollLock = true;
            }else{
                that.quesScrollLock = false;
            }
        });

        // 加载更多问答
        $loadMoreQuesBtn.on("click", function(){
            var $this = $(this);
            if($this.hasClass("lock")){
                return false;
            }
            $this.html("加载中...");
            $this.addClass("lock");
            that.getMoreQuestions(function(size){
                $this.html("加载更多");
                $this.removeClass("lock");
                if(size == 0){
                    $this.hide();
                }
            });
        });

        // 回复
        $queScoller.on("click", function(e) {
            var isAnswer = $(e.target).hasClass("answered");
            if(isAnswer){
                var $rid = $(e.target).data("rid"),
                    $nickname = $(e.target).data("nickname");
                $quesBtn.data("type", "reply");
                $quesBtn.data("rid", $rid);
                $postQues.attr("placeholder", "回答 "+$nickname+"的问题:");
                $postQues.focus();
            }else{
                $postQues.attr("placeholder", "请输入文字...");
                $quesBtn.data("rid", "0");
                $quesBtn.data("type", "ask");
            };
        });

        // 发表问题
        $postQues.on("keydown", function(e){
            if(e.keyCode === 13){
                that.emitQues();
                e.preventDefault();
                return false;
            }
        });

        $quesBtn.on("click", function () {
            that.emitQues();
        });

        // 只看自己提问
        $showMebtn.on("click", function() {
            if($(this).hasClass("cur")){
                $(this).removeClass("cur");
                that.defaults.showMeOnly = false;
                that.showMeQuesOnly("all");
            }else{
                $(this).addClass("cur");
                that.defaults.showMeOnly = true;
                that.showMeQuesOnly(MT.me.xid);
            }
        });

        // 绑定获取焦点事件
        $postQues.on("focus", function(event) {
            if($(this).val().length > 0){
                $quesBtn.addClass("active");
            }else{
                $quesBtn.removeClass("active");
            }
        });

        // 绑定失去焦点事件
        $postQues.on("blur", function(event) {
            if($(this).val().length > 0){
                $quesBtn.addClass("active");
            }else{
                $quesBtn.removeClass("active");
            }
        });

        // 键盘弹起
        $postQues.on("keyup", function (e) {
            if($(this).val().length > 0){
                $quesBtn.addClass("active");
            }else{
                $quesBtn.removeClass("active");
            }
        });

        var dataObject = {};

        //删除提问
        $queScHall.on("click", ".delect", function(){
                $(".dialog_cont .text").html("确认删除此提问？");
                $(".dialog_cont").show();

            var qid = $(this).data('id');
                dataObject.access_token = window.access_token;
                dataObject.action = 'delquestion';
                dataObject.qid = qid;
        });

        //通过提问，显示出来，
        $queScHall.on("click", ".pass", function(){
            var qid = $(this).data('id');
                dataObject.access_token = window.access_token;
                dataObject.action = 'auditqa';
                dataObject.qid = qid;

                that.answerPost(dataObject,$(this));
        });

        //管理
        $queScHall.on("click", ".manager", function(){
            var xid = $(this).data('xid');
            HTSDK.plugins._detail($(this),xid);    
            var userObj= {
                        xid: xid,
                        nickname: $(this).prev(".u_name").text(),
                        avatar: $(".avatar_"+xid).attr("src"),
                        role: $(this).data("role")       
            };
            $("#user_"+xid).data("role",$(this).data("role"));
            HTSDK.privateChat.privateUser = userObj;
            HTSDK.privateChat.nickname = $(this).prev(".u_name").text();
        });

        //确认
        $dialogCont.on("click", ".confirm", function(){
            that.answerPost(dataObject);
        });

        //取消
        $dialogCont.on("click", ".cancel", function(){
            $(".dialog_cont").hide();
        }).on("click", ".close", function(){
            $(".dialog_cont").hide();
        });

    },

    //提问时间间隔
    timeLimit: function(){
        var that = this;
        that.defaults.setTime = setInterval(function(){
            that.defaults.sendTimeLimit--;
            if(that.defaults.sendTimeLimit == "0"){
                clearInterval(that.defaults.setTime);
            }
        },1000);
    },


    //删除，审核请求
    answerPost: function(dataObject,$this){
        $.ajax({
            url: protocol +'open.talk-fun.com/live/interaction.php?',
            type: 'get',
            dataType: 'jsonp',
            data: dataObject,
            success: function(ret){
                if( ret.code == 0){
                     $(".dialog_cont").hide();
                    if( dataObject.action == "delquestion"){
                        $("#que_"+dataObject.qid).remove();
                    }
                    if( dataObject.action == "auditqa"){
                        $this.remove();
                        $("#que_"+dataObject.qid).find('.pass').addClass('all_passed').html('已通过').removeClass('pass').attr('title','此提问已公开');
                    }
                }
            }
        });
    },

    //处理返回来的广播指令
    dealCallback: function(string, ret){
        var meId = MT.me.xid,
            dealId = ret.qid,
            that = this;

            //删除
            if( string == "delete"){
                $("#que_"+dealId).remove();
            }
            //通过后的操作
            if( string == "audit"){
                if( ret.xid != meId || !$("#mod_ques_scroller").hasClass('.xid_'+ret.qid+'')){
                    if( MT.me.role != "admin" && MT.me.role != "spadmin"){
                        that.ask(ret,'audit');
                    }
                }
            }

            //通过
            if( string == "audit" && (MT.me.role == "admin" || MT.me.role == "spadmin") ){
                $("#que_"+dealId).find('.pass').addClass('all_passed').html('已通过').attr('title','此提问已公开');
                $("#que_"+dealId).show();
            }

    },

    // 检查问答DOM数据
    checkQuesSize: function(){
        var quesSize = $("#mod_ques_scroller > div").size(),
            _HT = HTSDK.room._HT;
        if(quesSize > this.defaults.maxQuesSize){
            var topQues = $("#mod_ques_scroller > div").eq(0);
            var topQid = topQues.data('qid');
            topQues.remove();
            //需要把qid从question.allQids中清除
            _HT.emit('question:delete',{qid:topQid},'');
        }
    },

    // 加载更多问答数据(取问答列表第一个qid)
    getMoreQuestions: function(callback){
        var that = this,
            topQid = $("#mod_ques_scroller").find(".ask_wrap").eq(0).data("qid"),
            _HT = HTSDK.room._HT;
        
        // 渲染数据列表
        _HT.emit("question:get:part", {qid: topQid}, function(list){
            if(list.code === 0){
                if(list.data && list.data.length !== 0){
                    that.renderQueslist(list, "question");
                    if(callback){
                        callback();
                    }
                }else{
                    if(callback){
                        callback(list.data.length);
                    }
                }
            }
        });
    },

    // 只看自己提问
    showMeQuesOnly: function(xid){
        var $quesHall = $("#mod_ques_scroller"),
            isAdmin = MTSDK.admin.isAdmin();
        // 如管理员身份全部可查看
        // 普通用户如回复数大于0显示
        if(xid === "all"){
            if(isAdmin){
                $quesHall.find(".ask_wrap").show();
            }else{
                $quesHall.find(".ask_wrap").each(function(i, e){
                    // data-replies 回复数大于0
                    var replies = parseInt($(e).data("replies"), 10);
                    if(replies > 0){
                        $(e).show();
                    }else{
                        $(e).hide();
                        $(".xid_"+MT.me.xid).show();
                        $quesHall.find(".ispass_1").show();
                    }
                    $(".role_admin").show();
                    $(".role_spadmin").show();
                });
            }
            HTSDK.tools.scrollToBottom("question");
            return false;
        }else{
            
            $quesHall.find(".ask_wrap").hide();
            $quesHall.find(".xid_"+xid).show();
        }
    },

    // 渲染问答列表
    renderQueslist: function(ret, scrollType){
        //review 0 == 未通过 1== 通过 ,
        var d = ret.data,
            tpl = "",
            avatar = "",
            isShow = "",
            curRole = MT.me.role,
            isAdmin = MTSDK.admin.isAdmin();
        // 列表
        for (var i in d) {
            var isMe = MT.me.xid == d[i].xid,
                isRetAdmin = MTSDK.admin.isAdmin(d[i].role),
                replies = parseInt(d[i].replies, 10);
                status = parseInt(d[i].status);
            avatar = HTSDK.room.setAvatar(d[i]);

            // 自己, 管理员(data), 自己是管理员
            if(isAdmin || isMe || isRetAdmin){
                isShow = "";
            }else if(replies > 0 || status == 1){
                isShow = "";
            }else{
                isShow = " hidden";
            }
            // render 数据-model
            var questionData = {
                d: d[i],
                time: HTSDK.tools.convertTimestamp(d[i].time),
                isAdmin: isAdmin,
                replies: replies,
                avatar: avatar,
                //review: review,
                isShow: isShow  
            };
            // view 
            if(HTSDK.room.isGroups(d[i].gid)){
                tpl += template("list_question", questionData);
            }
        };
        var $quesHall = $("#mod_ques_scroller");

        // 向下插入 & 滚动底部
        if(!scrollType){
            $quesHall.append(tpl);
            HTSDK.tools.scrollToBottom("question");
        }
        // 向前插入 & 滚动顶部
        else if(scrollType){
            $(tpl).prependTo($quesHall);
            HTSDK.tools.scrollToTop("question");
        }

        //如果是通过的情况下
        $("#mod_questions_con").find('.ask_wrap').each(function(index, el) {
            if($(el).data("status") == 1){
                $(el).find('.pass').addClass('all_passed').html('已通过').removeClass('pass').attr('title','此提问已公开');
            }
            if( $(el).hasClass('role_spadmin') || $(el).hasClass('role_admin')){
                $(el).find('.manager').remove();
                $(el).find('.pass').remove();
            }
        });

        //渲染是否被禁言
        if(MT.me.role == "admin" || MT.me.role == "spadmin"){
            $("#mod_questions_con").find('.grant').each(function(index, el) {
                if($(el).data("enable") == "0"){
                    $(el).addClass('ban');
                }
            });
        }
    },

    // 发表问题
    emitQues: function(){
        var $ques = $('#mod_question_post'),
            $quesCon = $("#ques_post_txt"),
            $quesVal = $.trim($quesCon.val()),
            $quesHall = $("#question_hall"),
            _HT = HTSDK.room._HT,
            action = MT.getLiveState(),
            that = this,
            type = $("#post_question_btn").data("type"),
            rid = $("#post_question_btn").data("rid"),
            _ques = HTSDK.room.roomSetMsg;

        
        if ( _ques.length == 0 || _ques.mod_beforeclass_live.enable != 1 ){
             // action
            if(action !== "start"){
                HTSDK.tools.showComtip($quesCon, "上课后才能提问哟...");
                return false;
            }
        }
        // 发表时间限制
        if(!this.defaults.canSend){

            if(MT.me.role != "admin" && MT.me.role !="spadmin"){
                HTSDK.tools.showComtip($quesCon, "请"+that.defaults.sendTimeLimit+"秒后再提问...");
                // 3分钟上后取消限制
                if(!that.defaults.canSend){
                    setTimeout(function(){
                        that.defaults.canSend = true;
                    },that.defaults.sendTimeLimit*1000);
                }
                return false;
            }
        }

        // 禁止为空
        if($quesVal.length === 0){
            HTSDK.tools.showComtip($quesCon, "请输入内容...");
            return false;
        }
        that.defaults.canSend = false;
        $quesCon.focus();
        // send chat post
        // 
        if(type === "ask"){

            _HT.emit("question:ask", {msg: $quesVal}, function(retval){
                if(retval.data && retval.data.qaSecond){
                    that.defaults.sendTimeLimit = retval.data.qaSecond;
                }else{
                    that.defaults.sendTimeLimit= 180;
                } 
                that.timeLimit();
                
                if(retval.code == 20){

                    // 重复
                    HTSDK.tools.showComtip($quesCon, "重复提问了～");
                    return false;
                }else if(retval.code == 21){

                    // 过快
                    HTSDK.tools.showComtip($quesCon, "提交过快哟～");
                    return false;
                }else if(retval.code == 0){

                    if(HTSDK.room.isAdmin()){
                        HTSDK.tools.showComtip($quesCon, "提交成功");
                    }else{
                        HTSDK.tools.showComtip($quesCon, "提问成功请等待老师回答");
                    }
                    // clear content
                    $quesCon.val(""); 
                    return false;
                }else{
                    // clear content
                    $quesCon.val("");
                    return false;
                }
            });
        }else if(type === "reply"){
            _HT.emit("question:reply", {msg: $quesVal, replyId: rid}, function(retval){
                if(retval.code !== 0){
                    HTSDK.tools.showComtip($quesCon, "提交错误哟～"+retval.code);
                }else{
                    $quesCon.val("");
                }
            });
        }

        // 3分钟后取消限制
        setTimeout(function(){
            that.defaults.canSend = true;
        }, that.defaults.sendTimeLimit*1000);
    },

    // 初始化获取问答列表
    getQuestionList: function(){
        var that = this;
        // 未上课不获取问答列表
        var action = MT.getLiveState();
        if(action !== "start"){
            return false;
        }
        $("#ques_load_more").show();
        var _HT = HTSDK.room._HT;
        // 获取问答列表
        _HT.getQuestion(function(retval){
            if(retval.code === 0 && typeof retval.data !== "undefined"){
                if(retval.count === 100){
                    $("#ques_load_more").show();
                }else{
                    $("#ques_load_more").hide();
                }
                that.questionList = retval.data;
                that.defaults.quesRender = true;
                // 渲染模版
                that.renderQueslist(retval);
            }
        });
    },

    // 删除
    _remove: function(ret){
        if(ret && ret.qid){
            $("#que_"+ret.qid).remove();
            $("#ans_"+ret.qid).remove();
        }
    },

    // 提问
    ask: function(ret,audit){
        // render 数据-model
        var d = ret,
            that = this,
            tpl = "",
            avatar = HTSDK.room.setAvatar(ret),
            isRetAdmin = MTSDK.admin.isAdmin(d.role),
            isShow = (MT.me.xid == d.xid || MTSDK.admin.isAdmin() || isRetAdmin) ? "" : "hidden",
            isAdmin = MTSDK.admin.isAdmin();

        // quesdata
        var questionData = {
            d: ret,
            time: HTSDK.tools.convertTimestamp(d.time),
            isAdmin: isAdmin,
            replies: 0,
            avatar: avatar,
            isShow: isShow
        };

        //当只看自己的提问
        if(HTSDK.modQuestion.defaults.showMeOnly && MT.me.xid != ret.xid){
            questionData.que_isShow = "hidden";
        }else{
            questionData.que_isShow = "";
        }
        // tpls
        var _tplAsk = template("mod_ques_ask", questionData);
            //分组
            if(HTSDK.room.isGroups(d.gid)){
                $("#mod_ques_scroller").append(_tplAsk);      
            }    
            HTSDK.tools.scrollToBottom("question", d.xid);
            this.checkQuesSize();

        //当提问的人是助教或老师
        if(audit && audit == "audit"){
            $("#que_"+d.qid).removeClass('hidden');
        }else{
            var isAdmin = $("#que_" + d.qid).hasClass('role_admin');
            var isSpadmin = $("#que_" + d.qid).hasClass('role_spadmin');
            if( isAdmin  || isSpadmin ){
                $("#que_" + d.qid).each(function(index, el) {
                    $(el).find('.manager').remove();
                    $(el).find('.pass').remove();
                });
            }
        }
        $("#que_"+d.qid).find('.grant').each(function(index, el) {
            if( MT.me.xid != d.xid){
                if($(el).data("enable") == "0"){
                   $(el).addClass('ban');
                }
            }
        });
    },

    // 回答
    reply: function(ret){
        var d = ret,
            tpl = "",
            $quesBtn = $("#post_question_btn"),
            $postQues = $("#ques_post_txt"),
            $reTarget = $("#que_"+d.replyId);
            // render
            var repData = {
                d: d,
                time: HTSDK.tools.convertTimestamp(d.time),
                avatar: HTSDK.room.setAvatar(d)
            };
            // render
            tpl = template("mod_ques_reply", repData);
            
            // 回答
            $reTarget.show().data("replies", "1");

            $reTarget.find(".re_list").append(tpl);

            // 如本人重置输入框
            if(d.xid === MT.me.xid){
                // reset
                $postQues.attr("placeholder", "请输入文字...");
                $quesBtn.data("rid", "0");
                $quesBtn.data("type", "ask");
                // HTSDK.tools.scrollToBottom("question", d.xid);
            }
    },

    //初始化加载
    loadTpl: function(){
        var $dialogCont = $(".dialog_cont");
        if( $dialogCont.length < 1){
            var diaLog  = template("pop_confim_dialog");
                $("#mod_questions_con").append(diaLog);
        }
    },

    init: function(){
        //加载提问区管理功能
        this.loadTpl();
        this.bindEvents();
    }
};