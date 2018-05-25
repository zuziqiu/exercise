/**
 * plugins 工具
 */
(function(win){
    // 插件
    var plugins = {
        // 默认
        defaults: {
            rollTime: null,
            roomTypeNumber: 0
        },
        cmdBroadCast:[],
        isGlobalLoad: false,
        // 简易弹框
        popBox: function(html){
            var that = this;
            var $tg = $("#pop_box");
            $tg.show();
            $tg.html(html);
            $("#studentVote_box,.mod_lanuch_vote,#admin_pop_box").hide();
        },
        // 简易弹框
        voteBox: function(html){
            var that = this;
            var $tg = $("#studentVote_box");
            $tg.show();
            $tg.html(html);
            $("#pop_box").hide();
            // 显示缩小底部投票按钮并将缩放的class初始化
            $(".vote_enlarge").show(function(){
                document.getElementById("studentVote_box").className="";
            });
        },
        // 事件绑定
        bindEvents: function(){
            var that = this,
                $mqcls = $(".con_notice .cls_btn"),
                $marquee = $("#marquee"),
                $popBox = $("#pop_box"),
                $studentVote = $('#studentVote_box'),
                $chat = $("#mod_chat_hall"),
                $flower = $("#mod_chat_post .flower_btn");
            // 关闭抽奖
            that.lottery.closeLottery();
            // 送鲜花
            $flower.on("click", function(e){
                var flag = HTSDK.modChat.userAllGag();
                if(flag){
                    if($(this).hasClass("disable")){
                        return false;
                    }
                    var $e = $(this);
                    that.flower.send($e); 
                }
                
            });

            // 关闭滚动
            $mqcls.on("click", function () {
                that.closeMarquee();
            });
            $marquee.hover(function (e) {
                this.stop();
            }, function (e) {
                this.start();
            });

            // 弹框绑定
            $popBox.on("click", ".cls", function(){
                $popBox.html("").hide();
                $(".vote_enlarge").hide();
            });

            // 盒子
            $("body").on("click", "#pop_upload .op_btn .cls", function(){
                $("#pop_upload").remove();
            });

            // 发表投票
            /*$popBox.on("click", ".selt_vote_option .vote_btn", function(e){
                HTSDK.plugins.vote.postVote(e);
            });*/

            // 投票选项
            /*$popBox.on("click", ".vote_selector input", function(e){
                HTSDK.plugins.vote.getOptions(e);
            });*/
            // 弹框绑定
            $studentVote.on("click", ".cls", function(){
                $studentVote.html("").hide();
                $(".vote_enlarge").hide();
            });

            // 发表投票
            $studentVote.on("click", ".selt_vote_option .vote_btn", function(e){
                HTSDK.plugins.vote.postVote(e);
            });

            // 投票选项
            $studentVote.on("click", ".vote_selector input", function(e){
                HTSDK.plugins.vote.getOptions(e);
            });

            // 投票结果
            $chat.on("click", ".getvote", function(e){
                var vid = $(this).attr('data-vid')
                HTSDK.plugins.vote.getVoteDetail(vid);
            });

            //图片投票结果详情
            $studentVote.on("click", ".vote_pic_default", function(){
                var vid = $(this).attr('data-vid')
                HTSDK.plugins.vote.getVoteDetail(vid);
            });

            //图片投票结果详情关闭
            $('body').on("click", "#vpicPic_box span", function(){
                $('#vpicPic_box').remove();
            });

            //图片投票结果详情
            $studentVote.on("click", ".view_fuil", function(){
                
                $('body').append('<div id="vpicPic_box" ><div class="pic_block"><img id="vote_pic" src="'+$studentVote.find('.left_img img').attr('src') +'" /><span></span></div></div>');
                var votePic = $('#vote_pic'),
                    vote_box = $('.pic_block');
                var winWidth = $(window).width(),
                    winHeight = $(window).height(),
                    scale = Math.min(winWidth/votePic.width(),winHeight/votePic.height(),1);
                var picWidth = votePic.width()*scale,
                    picHeight = votePic.height()*scale;

                votePic.css({
                    width: picWidth,
                    height: picHeight,
                    'margin-left': - (Math.floor(picWidth/2)),
                    'margin-top': - (Math.floor(picHeight/2))
                });
                vote_box.css({
                    width: picWidth,
                    height: picHeight,
                    'margin-left': - (Math.floor(picWidth/2)),
                    'margin-top': - (Math.floor(picHeight/2))
                });
            });

        },
        // 滚动通知
        rollNotice: function(data){
            var $tg = $("#marquee"),
                $el = $(".con_notice"),
                d = data;   
            clearTimeout(this.defaults.rollTime);
            if(d == "" || d.duration === 0){
                $el.hide();
                return false;
            }
            if(d.link.length>0){
                $tg.html('<p><a href="'+d.link+'" target="_blank">'+d.content+'</a></p>');    
            }else{
                $tg.html('<p>'+d.content+'</p>');   
            }
            
            $el.fadeIn();
            // 滚动时长
            this.defaults.rollTime = setTimeout(function(){
                $el.fadeOut(100);
            }, d.duration*1000);
        },
        //关闭滚动通知
        closeMarquee: function () {
            clearTimeout(this.defaults.rollTime);
            $(".con_notice").fadeOut(200);
        },
        // 鲜花
        flower: {
            // 是否初始化
            inited: false,
            // 初始化界面
            init: function(flag) {
                if(HTSDK.room._HT){
                    if(!this.inited){
                        // 获取鲜花
                        HTSDK.room._HT.plugins("flower").getFlower();
                        this.inited = true;
                    }
                }
                /*this.sendCallback({
                    amount: 3, 
                    nickname: "marko", 
                    xid: 2219237,
                    sendTime: 111
                });*/
            },
            // 送花
            send: function(target) {
                this.e = target;
                if(HTSDK.room.live_status != "start"){
                    HTSDK.tools.showComtip(target,"还没上课不能送花哦！");
                }else{
                    // 送花请求
                    HTSDK.room._HT.plugins("flower").sendFlower(); 
                }
                
            },
            // 送花回调
            sendCallback: function(retval) {
                var that = this,
                    $tg = $("#mod_chat_hall"),
                    _flower = {},
                    d = retval,
                    fcount = parseInt(d.amount, 10),
                    _fw = [],
                    _self = "",
                    now = new Date(),
                    terminal = '',
                    isMe = d.xid === MT.me.xid;
                //终端
                if( d.term == 5){
                    terminal = 'mac' ;
                }else if(d.term == 4 || d.term == 6 || d.term == 2){
                    terminal = 'mb' ;
                }else if(d.term == 8){
                    terminal = 'ipad' ;
                }

                if(MT.me.role == 'user'){
                    terminal = "hidden";
                }
                //items
                for (var i = 0; i < fcount; i++) {
                    _fw.push(i+1);
                };

                // self
                if(isMe){
                    _self = "self";
                    terminal = "hidden";
                }
                // 是否显示管理员工具
                var _isShowTools = false;
                if(MTSDK.admin.isAdmin()){
                    if(d.role === "admin" || d.role === "spadmin"){
                        _isShowTools = false;
                    }else{
                        _isShowTools = true;
                    }
                }

                // flower
                _flower = {
                    data: d,
                    time: HTSDK.tools.convertTimestamp(d.sendtime),
                    amount: _fw,
                    self: _self,
                    isShowPrivate:HTSDK.privateChat.isShowPrivate(d.xid,d.role),
                    isShowTools: _isShowTools,
                    isShow: HTSDK.modChat.defaults.showAdminonly ? "hidden" : "show",
                    avatar: HTSDK.room.setAvatar(d),
                    terminal: terminal
                };
                // 插入鲜花
                if(HTSDK.room.templateLoad){
                    _flower.spadmin_name = spadmin_name;
                    var tpl_flower = template("tpl_append_flower", _flower);

                    //分组,只能看到老师和自己一组的人送的鲜花
                    if(HTSDK.room.isGroups(retval.gid)){
                        $tg.append(tpl_flower);   
                    }
                    if(MT.tools.in_array(window.partner_id, zhiPin)){
                        $(".send_to").html("送给主讲人：");
                    }
                    /*if(retval.chat.enable == 1){
                        $(".ban_"+retval.xid).hide();
                    }else if(retval.chat.enable == 0 && MT.me.role !="user"){
                        $(".ban_"+retval.xid).show();
                    }*/

                    HTSDK.modChat.checkChatSize();
                    HTSDK.tools.scrollToBottom("chat");
                    // 统计未读信息
                    if(HTSDK.room.isGroups(retval.gid)){
                         HTSDK.modChat.checkNew();
                    }
                   
                }
            },
            // 剩余时间
            flowerTimeleft: function (sec) {
                this.tips(sec);
            },
            // 鲜花自增
            autoIncrease: function (flower) {
                var fw = parseInt(flower, 10);
                if(fw > 0 && fw <= 3){
                    $("#mod_chat_post .flower_btn .num").html(fw).fadeIn(100);
                }else{
                    return;
                }
            },
            // 初始化鲜花
            flowerInit: function (ret) {
                this.tips(ret);
            },
            // 提示
            tips: function(data) {
                var $tg = $("#mod_chat_post .flower_btn"),
                    $num = $tg.find(".num"),
                    d = data,
                    that = this,
                    amount = d.amount;
                // 鲜花数提示
                if(d.code === 0){
                    if(d.amount > 0){
                        $num.html(d.amount).fadeIn(200);
                    }else{
                        $num.hide();
                    }
                }else if(d.code === 15000){
                    var leftTime = d.leftTime;
                    if(leftTime > 0){
                        HTSDK.tools.showComtip(that.e, leftTime+"秒后可获一朵鲜花");
                    }
                    $num.hide();
                }else{
                    //HTSDK.showComtip(that.e, "直播未开启");
                }
            }
        },
        // 投票
        vote: {
            curVote: {}, //当前投票对象
            opAry: [],//当前选项
            voteLetter: ["A","B","C","D","E","F","G","H","I","J"],
            // 显示投票选项
            showVote: function(ret){
                this.opAry.splice(0, this.opAry.length);
                this.curVote = ret;
                ret.letter = this.voteLetter;
                ret.picVoteStyle1 = ret.info.imageUrl.length > 0 ? 'student_pic_vote' : '';
                ret.picVoteStyle2 = ret.info.imageUrl.length > 0 ? '' : 'hidden';
                ret.voteTitle = voteTitle;
                var _tpl_showVote = template("show_vote_options", ret);
                //HTSDK.plugins.voteBox(_tpl_showVote);
                if(!arguments[1]) {
                    var notify = '管理员 <em>'+ret.info.nickname+'</em> 在'+ret.info.startTime+'发起了一个'+voteTitle+'！'; 
                    HTSDK.tools.chatNotify(notify);
                }
                //普通用户投票
                if(!MTSDK.admin.isAdmin()){
                   HTSDK.plugins.voteBox(_tpl_showVote);
                }
            },

            // 自动关闭
            autoClose: function(duration){
                var $popBox = $("#studentVote_box"),
                    that = this;

                setTimeout(function(){
                    $popBox.html("").hide();
                    $(".vote_enlarge").hide();
                }, duration);
            },
            // 显示投票结果
            showResult: function(ret){
                var that = this;
                var isShow = parseInt(ret.isShow, 10);   
                ret.voteTitle = voteTitle;
                //结束关闭正在投票框
                $("#studentVote_box").hide();
                $(".vote_enlarge").hide();
                // 是否显示投票结果 
                if(parseInt(ret.info.status) !== 1 ||  ret.info.answer.length > 0){
                // if(isShow > 0 ||  ret.info.answer.length > 0){
                    ret.letter = this.voteLetter;
                    MTSDK.admin.vote.switchWord(ret);
                    //图片投票结果
                    if(MT.me.role == "user" || MT.me.role == "guest"){
                        ret.isTrueAnswer =  ret.info.answer.length > 0 ? '':'hidden';
                        ret.isPicAnswer = ret.isShow !=  0  ? '' : 'hidden';
                        if(sessionStorage.getItem(ret.info.vid)!= null){
                            ret.picSelect = sessionStorage.getItem(ret.info.vid).replace(/\"/g,"");
                            ret.isSelect = sessionStorage.getItem(ret.info.vid) ? '':'hidden';
                            ret.picSelect = ret.picSelect.split("、").sort().join("、");
                        }else{
                            ret.picSelect = "";
                            ret.isSelect="hidden";
                        }
                    }       
                    //公布结果
                    if(isShow > 0){
                        var notify = '管理员 <em>'+ret.info.nickname+'</em> 在'+ret.info.endTime+'结束了'+voteTitle+ '。<a class="getvote" data-vid="'+ret.info.vid+'">查看结果</a>';
                    }else {
                        var notify = '管理员 <em>'+ret.info.nickname+'</em> 在'+ret.info.endTime+'结束了'+voteTitle+'。';
                    }

                    HTSDK.tools.chatNotify(notify);
                    ret.info.me_role = MT.me.role;

                    // 自己的答案 & 远程的答案是否一致
                    // if (ret.info.rightAnswer === ret.picSelect) {
                    //     ret.isRightClass = 'right'
                    // } else{
                    //     ret.isRightClass = ''
                    // }

                    // 如果是管理员
                    /*if(!MTSDK.admin.isAdmin()){*/
                    if(ret.info.imageUrl.length > 0){
                        var _tpl_showResult = template("show_vote_student", ret); 
                        HTSDK.plugins.voteBox(_tpl_showResult);
                    }else {
                        var _tpl_showResult = template("show_vote_result", ret); 
                        HTSDK.plugins.popBox(_tpl_showResult);
                    }
                }
            },
            // 显示获取投票内容
            showGetVote: function(ret){
                ret.letter = this.voteLetter;
                MTSDK.admin.vote.switchWord(ret);
                 if(MT.me.role == "user" || MT.me.role == "guest"){
                //答案显示
                    ret.isAnswer = ret.info.answer.length > 0  ? '' : 'hidden';
                    if(sessionStorage.getItem(ret.info.vid)!= null){
                        ret.isMyAnswer = sessionStorage.getItem(ret.info.vid) ? '' :'hidden';
                        ret.MyAnswer = sessionStorage.getItem(ret.info.vid).replace(/\"/g,"");
                        ret.MyAnswer  = ret.MyAnswer.split("、").sort().join("、");
                    }else{
                        ret.isMyAnswer = "hidden";
                        ret.MyAnswer = "";
                    }
                }
                ret.info.me_role = MT.me.role;
                ret.voteTitle = voteTitle;

                var _tpl_showGetvote = template("show_vote_getvote", ret);
                HTSDK.plugins.popBox(_tpl_showGetvote);
            },
            // 投票TODO...
            postVote: function(el){
                var that = this,
                    opt = that.curVote;
                var _options = that.opAry.sort().toString();
                var param = {
                    vid: opt.vid,
                    options: "["+_options+"]"
                };
                var check = that.checkItems();
                var _HT = HTSDK.room._HT;
                if(check){

                    //自己选择的投票
                    var iSelected = '';

                    for(var i = 0; that.opAry.length > i ; i++){
                        iSelected += that.voteLetter[that.opAry[i]-1]+'、';
                    }

                    iSelected = iSelected.substring(0, iSelected.length-1);

                    sessionStorage.setItem($('.vote_btn').attr('data-vid'),JSON.stringify(iSelected));
                    // 发送投票

                    _HT.plugins("vote").postVote(param, function(retval){
                        HTSDK.plugins.vote.userVoteCallback(retval);   
                    });
                    this.autoClose(2000);
                }
            },
            // 获取投票详情
            getVoteDetail: function(vid){
                var _HT = HTSDK.room._HT;
                // 获取投票
                _HT.plugins("vote").getVoteDetail(vid,function(retval){
                    HTSDK.plugins.vote.showGetVote(retval);
                });
            },
            // 验证选项
            checkItems: function(){
                var that = this,
                    flag = false,
                    opt = that.curVote,
                    optional = parseInt(opt.optional, 10),
                    len = that.opAry.length;
                // 判断选项长度
                if(parseInt(optional) === 1 && len === 1){
                    flag = true;
                }else if(parseInt(optional) > 1 && len >= 1){
                    flag = true;
                }else{
                    $("#studentVote_box").find(".tips").show();
                    setTimeout(function(){
                        $("#studentVote_box").find(".tips").hide();
                    }, 1000);
                    flag = false;
                }
                return flag;
            },
            // 获取投票选项
            getOptions: function(tsEl){
                var options = "",
                    optional = this.curVote.optional,
                    $target = $(tsEl.currentTarget),
                    that = this,
                    opv = parseInt($target.val(), 10),
                    index = $target.index(),
                    flag = $target[index].checked;
                // 多选操作
                if(optional > 1){
                    if(flag){
                        //添加选项
                        that.opAry.push(opv);
                        if(that.opAry.length < optional){
                            //合并选项(多选)
                            that.opAry = $.unique(that.opAry);

                        }else if(that.opAry.length > optional){
                            //选择大于限制
                            $target.attr('checked', false);
                            that.opAry = MT.tools.without(that.opAry, opv);
                        }
                    }else{
                        that.opAry = MT.tools.without(that.opAry, opv);
                    }
                }
                // 单选操作
                else if(optional == 1){
                    //单选
                    if(flag){
                        that.opAry.splice(0, 1, opv);
                    }
                }
                return that.opAry;
            },
            // 投票回调
            userVoteCallback: function(data){
                var ret = {
                    code: data.code || 0,
                    callback: true,
                    msg: data.msg || ""
                };
                ret.voteTitle = voteTitle;
                var _tpl_voteCallback = template("show_vote_callback", ret);
                HTSDK.plugins.voteBox(_tpl_voteCallback);
                //HTSDK.plugins.popBox(_tpl_voteCallback);
            }
        },
        // 抽奖
        lottery: {
            timer: null,
            t1: null,
            t2: null,
            t3: null,
            loXids: {},//中奖客户的xid集合
            // 关闭抽奖
            closeLottery: function(){
                $(".operation").on("click", function(){
                    if($(this).hasClass("cur")){
                        return false;
                    }else{
                        // 隐藏抽奖项
                        $("#mode_lottery").fadeOut(100);
                    }
                });
            },
            // 开始抽奖(动画)
            startLottery: function(){
                if(MTSDK.admin.isAdmin()){
                    return false;
                }

                this.loXids= {};
                var $lottery = $("#mode_lottery");
                $("#lotter_title").hide();
                $lottery.fadeIn(100);
                // 抽奖模块
                var duration = 5000,
                    $it1 = $("#roller_con").find(".it_1"),
                    $it2 = $("#roller_con").find(".it_2"),
                    $it3 = $("#roller_con").find(".it_3");
                clearTimeout(this.timer);
                // 抽奖
                $("#roller_con").fadeIn(100);
                $(".award_user_info").fadeOut(100);
                $(".operation").addClass("cur");
                // 滚动速度(数字越大越快)
                var lotSpeed = [10, 10, 10],
                    that = this;
                // 动作1
                var w_1 = function(){
                    $it1.stop().animate({
                        backgroundPositionY: -252+(672*lotSpeed[0])+"px"
                    }, duration, function(){
                        setTimeout(function(){
                            $it1.removeAttr("style");
                            w_1();
                        }, 50);
                    });
                }
                w_1();
                // 动作2
                var w_2 = function(){
                    $it2.stop().animate({
                        backgroundPositionY: -252-(672*lotSpeed[1])+"px"
                    }, duration, function(){
                        setTimeout(function(){
                            $it2.removeAttr("style");
                            w_2();
                        }, 50);
                    });
                }
                w_2();
                // 动作3
                var w_3 = function(){
                    $it3.stop().animate({
                        backgroundPositionY: -252+(672*lotSpeed[2])+"px"
                    }, duration, function(){
                        setTimeout(function(){
                            $it3.removeAttr("style");
                            w_3();
                        }, 50);
                    });
                }
                w_3();
            },

            //显示序号所有中奖人
            lotteryNumWinners: function(ret){
                var d= ret.result,
                    winners= '';//中奖人   
                for(var i = 0;i<d.length;i++){
                    this.loXids[d[i].xid] = d[i].xid;
                    var num = "0"+(i+1);
                    if(i==(d.length-1)){
                        winners+=num+"."+d[i].nickname;
                    }else{

                        winners+=num+"."+d[i].nickname+"&nbsp;&nbsp;&nbsp;&nbsp;";
                    }      
                }; 
                return winners;
            },

             //所有中奖人
            lotteryWinners: function(ret){
                var d= ret.result,
                    winners= '';//中奖人   
                for(var i = 0;i<d.length;i++){
                    this.loXids[d[i].xid] = d[i].xid;
                    if(i==(d.length-1)){
                        winners+=d[i].nickname;
                    }else{
                        winners+=d[i].nickname+"、";
                    }      
                }; 
                return winners;
            },




            // 停止抽奖
            stopLottery: function(retval){
                var me = MT.me,
                    meXid = me.xid,
                    that = this,
                    names = "",
                    launch_nickname = retval.result[0].launch_nickname,
                    $lottery = $("#mode_lottery");

                    names = that.lotteryWinners(retval);  
                    //管理员
                    if(MTSDK.admin.isAdmin()){
                        var notify = '通知：'+launch_nickname+' 发起了抽奖，恭喜 <em>'+names+'</em> 中奖！';
                        HTSDK.tools.chatNotify(notify);
                        return false;
                    }

                $lottery.fadeIn(50);
                clearInterval(this.t1);
                clearInterval(this.t2);
                clearInterval(this.t3);
                // clear
                $("#roller_con").find(".it_1").stop().removeAttr("style");
                $("#roller_con").find(".it_2").stop().removeAttr("style");
                $("#roller_con").find(".it_3").stop().removeAttr("style");

                // 显示结果
                setTimeout(function(){
                    var notify = '通知：<em>'+launch_nickname+'</em> 发起了抽奖，恭喜 <em class="red">'+names+'</em> 中奖！';
                    HTSDK.tools.chatNotify(notify)
                    names = that.lotteryNumWinners(retval);  
                    if(that.loXids[meXid] === meXid){
                        // 自己中奖
                        HTSDK.plugins.lottery.renderLottery(names, true);
                    }else{
                        // 未中奖
                        HTSDK.plugins.lottery.renderLottery(names, false);
                    }
                    
                }, 200);
            },
            // 显示抽奖信息
            renderLottery: function(nickname, flag){
                // 抽奖模块
                var timer = this.timer,
                    $it1 = $("#roller_con").find(".it_1"),
                    $it2 = $("#roller_con").find(".it_2"),
                    $it3 = $("#roller_con").find(".it_3");
                $("#roller_con").fadeIn(80);
                // 停止动作恢复默认
                $it1.removeAttr("style");
                $it2.removeAttr("style");
                $it3.removeAttr("style");

                $("#loter_info").html(nickname);
                $(".operation").removeClass("cur");
                $("#roller_con").fadeOut(100);
                $(".award_user_info").fadeIn(100);
                $(".award_user_info").removeClass("me");
                
                // 除了合作商ID等于11443外，是否自己中奖。
                if(partner_id!="11443"){
                    if(flag){
                        $("#lotter_title").addClass("lotter_me");
                        $("#lotter_title").removeClass("lotter_other");
                        $("#loter_tips").html("恭喜您！");
                    }else{
                        $("#lotter_title").removeClass("lotter_me");
                        $("#lotter_title").addClass("lotter_other");
                        $("#loter_tips").html("谢谢参与！");
                    }
                }  
               
                $("#lotter_title").show();
            }
        },
       /* iframe:{
            on: function(cmd, callback){
                HTSDK.room._HT.plugins('iframe').on(cmd, callback);
            },
            trigger:function(cmd, args){
                //除plugins里监听以外的事件逻辑
                switch(cmd){
                    case "testcmd":
                        break;
                    default:
                        break;
                }
                HTSDK.room._HT.plugins('iframe').trigger(cmd, args);
            },
            call: function(cmd, args){

            }
        },*/
        // 插入公共广播
        renderBroadCast: function(){
            for (var i = 0; i < this.cmdBroadCast.length; i++) {
                var retval = this.cmdBroadCast[i];
                if(retval && retval.__auto == 1){
                    var notify = '公共广播：'+retval.message+"; ("+retval.__auto+")";
                    HTSDK.tools.chatNotify(notify);
                }
            };
        },
        // 监听自定义广播
        diyBroadcast: function(retval){
            var o = {
                message: retval.message,
                __auto: retval.__auto
            };
            // 单条插入
            if(this.isGlobalLoad){
                var notify = '公共广播：'+retval.message+"; ("+retval.__auto+")";
                HTSDK.tools.chatNotify(notify);
            }else{
                // 初始化渲染多条
                this.cmdBroadCast.push(o);
            }
        },
        
        overHover:function(){
            $('.admin_list li').mouseout(function(event) {
                $('.admin_list').remove();
            });
        },   
        //查看详情、T出房间、禁言
        popHover:function(){
            var $userLi = $('#mod_member_list');
                if(MT.me.role == "user" || MT.me.role == "guest"){
                    return false;
                }
                $userLi.on('click', 'li', function(){
                    if($(this).data('role') == "admin" || $(this).data('role') == "spadmin"){
                        return false;
                    }
                    var xid = $(this).data("xid");
                    HTSDK.privateChat.nickname = $("#nickname_"+xid).html();
                    HTSDK.plugins._detail(this, xid);
                });
                
                //针对管理员之间私聊
                $userLi.on('click', 'li .private', function(){
                    var xid =  $(this).data("xid");
                    var userObj= {
                            xid: xid,
                            nickname: $("#nickname_"+xid).text(),
                            avatar: $(".avatar_"+xid).attr("src"),
                            role: $("#user_"+xid).data("role")       
                    };
                    HTSDK.privateChat.privateUser = userObj;

                    HTSDK.privateChat.adminPopShow(xid);

                });

        },
        managerTimer: null,
        _detail:function(target,xid){
            var $that = $(target),
                that = this,
                _MT = HTSDK.room._HT;
            $that.off();
            $that.popBox({
                position: 'absolute',
                content: template("tpl_admin_pop_menu"), // _root/tpl_admin
                callback: function(){
                    var  banUserXids =  JSON.parse(sessionStorage.getItem("banUserXids"));
                    if(banUserXids){
                        if(banUserXids[xid] == xid){
                            $("#chatAccess").html("解除禁言");
                            $("#chatAccess").data("op","enableChat");
                        }else{
                            $("#chatAccess").html("禁止发言");
                            $("#chatAccess").data("op","chatAccess");
                        }
                    }
                    if($(target).hasClass("cp")){
                        $('.admin_list').css({
                            'top': $that.offset().top + 26,
                            'left': $that.offset().left-20,
                        });
                    }else{
                        $('.admin_list').css({
                            'top': $that.offset().top-10,
                            'left': $that.offset().left,
                        });
                    }
                   
                    // 解绑事件
                    $("#ht_pop_box").off();
                    $(".pop_side_operation").off();

                    if( !(HTSDK.plugins.defaults.roomTypeNumber == 1)){
                        $(".pop_side_operation .voice").hide();
                    }
                    //私聊、踢出房，禁言、查看详情
                    $(".pop_side_operation").find("li").on("click", function(){
                            //私聊
                            if($(this).data('op') == "privateChat"){
                                var userObj= {
                                        xid: xid,
                                        nickname: HTSDK.privateChat.nickname,
                                        avatar: $(".avatar_"+xid).attr("src"),
                                        role: $("#user_"+xid).data("role")
                                };
                                HTSDK.privateChat.privateUser = userObj;
                                if(xid){
                                    HTSDK.privateChat.adminPopShow(xid);
                                }else{
                                    return;
                                }
                               
                                
                            }    
                            //详情
                            if($(this).data('op') == "detail"){
                                MTSDK.admin.adminDo.detail(xid,$that);
                            }

                            //禁止聊天区发言
                            if($(this).data('op') == 'chatAccess'){
                                MTSDK.admin.adminDo.chatAccess(xid, _MT);
                                /*if($('.user_'+xid+' .ban').size() < 1){
                                     $(".user_"+xid).find('.grant').addClass('ban');
                                     $(".ban_" +xid).show();

                                     alert("6677777");
                                }*/ 
                            }

                            if($(this).data('op') == 'enableChat'){
                                MTSDK.admin.adminBox.commEnableGag(xid);
                            }


                            //T出房间
                            if($(this).data('op') == 'kick'){
                                MTSDK.admin.adminDo.kick(xid,_MT);
                            }
                            // yun xu语音
                            if($(this).data('op') == 'venable'){
                                MTSDK.admin.adminDo.venable(xid, _MT, function(ret){
                                    //HTSDK.voice
                                });
                                $("#user_"+xid).find("p").removeClass("voice_disable");
                                $("#user_"+xid).find('p').attr("data-voice",0);
                            }
                            // 禁止语音
                            if($(this).data('op') == 'vdisable'){
                                MTSDK.admin.adminDo.vdisable(xid, _MT, function(ret){
                                });
                                $("#user_"+xid).find("p").addClass("voice_disable");
                                $("#user_"+xid).find('p').attr("data-voice",1);
                            }
                            /*if($(this).data('op') == 'privateChat'){}*/
                            // 关闭
                            $that.popboxCloseAll();
                    });
                    
                    // <弹出层> 进入/离开
                    $("#ht_pop_box").on("mouseover", ".pop_side_operation", function(){
                        if(that.managerTimer){
                            clearTimeout(that.managerTimer);
                        }
                    });

                    $("#ht_pop_box").on("mouseout", ".pop_side_operation", function(){
                        var $that = this;
                        that.managerTimer = setTimeout(function(){
                            $(that).popboxCloseAll();
                        }, 200);
                    });
                }
            });
            

            // <li> 元素进入/离开
            $that.on("mouseover", function(){
                clearTimeout(that.managerTimer);
            });

            $that.on("mouseout", function(){
                that.managerTimer = setTimeout(function(){
                    $that.popboxCloseAll();
                }, 200);
            });
        },
        //聊天区admin/spadmin 管理功能
        _managerFun:function(){
            var $cp_fun = $('.mod_chat_hall');

                $cp_fun.on('click', '.cp', function(){
                    var xid = $(this).parents(".chat_list").data('xid');
                    HTSDK.plugins._detail(this,xid);
                    HTSDK.privateChat.nickname = $(this).prev().html(); 
                });


                /*私聊，助教与助教，助教与老师*/
                $cp_fun.on('click', '.private', function(){
                    var xid = $(this).data("xid");
                    var userObj= {
                        xid: xid,
                        nickname:$(this).prev().text(),
                        avatar: $(".avatar_"+xid).attr("src"),
                        role: $("#user_"+xid).data("role")
                    }    
                    HTSDK.privateChat.privateUser = userObj;
                    HTSDK.privateChat.adminPopShow(xid);
                });



        },

        //关键字匹配
        init: function(){
            this.bindEvents();
            this.popHover();
            this._managerFun();
            this.flower.init();
        }
    };



    // 暴露
    var HTSDK = win.HTSDK || {};
    HTSDK.plugins = plugins;

})(window);
