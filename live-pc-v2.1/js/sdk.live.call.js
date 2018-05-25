
"use strict";
// wlist
var whiteList = [];
var zhiPin = [];
var zeyao = ""; 
var yearhui = "";

//年会高清直播
var tab_name = "学生",
    spadmin_name = "老师"; 

/**
 * [HTSDK扩展对象]
 */
var HTSDK = window.HTSDK || {};

HTSDK.controller = {
    // 模块加载完成
    initModules: function(callback){
        // 模版辅助方法
        HTSDK.view.helper();
        // //模块加载
        // HTSDK.modules.init();
        // 聊天
        HTSDK.modChat.init();
        // 问答
        HTSDK.modQuestion.init();
        // 在线用户
        HTSDK.modOnlines.init();
        // 左侧
        HTSDK.modSider.init();
        // 播放器
        // HTSDK.player.init();
        // 底部工具栏
        HTSDK.footer.init();
        //评分
        HTSDK.score.init();
        //打赏
        HTSDK.reward.init();
        //移动窗口
        HTSDK.tools.dragDrop();
        // 拖拽
        HTSDK.movePop.init();
        // 缩放
        HTSDK.voteZoom.init();
        //点名功能
        HTSDK.userSign.init();

        HTSDK.modUserBox.init();
        //手机观看扫码弹框
        HTSDK.qrcode.init();
        

        // 回调
        if(callback){
            // DOM执行后
            callback();
        }
    },

    // 白名单测试
    specialProcess: function(){
        if(MT.tools.in_array(window.partner_id, whiteList) || window.partner_id == zeyao){
            $("#live_tools").find(".help").remove();
        }
    },
    
    // 房间(SDK)加载完成
    onRoomLoaded: function(){
        var MT = window.MT;

        // 公告
        HTSDK.modSider.notify(MT.announce.notice);
        
        // 问答
        HTSDK.modQuestion.getQuestionList();

    
        // set init.
        $(".live_uinfo .nickname").html(MT.me.nickname);
        HTSDK.room.liveDuration(0);
        if(MT.zhubo){
            $(".live_uinfo .roomname").html(MT.zhubo.nickname);
            HTSDK.modSider.authorCard(MT.zhubo);
        }
        
        // 插件
        HTSDK.plugins.init();
        
        // 设置默认滚动通知
        HTSDK.plugins.rollNotice(MT.announce.roll);
        
        // 管理员设置
        HTSDK.room.adminRender();
        
        // 设置工具
        HTSDK.tools.SDKTOOLS = MT.tools;
        HTSDK.room.checkFlash();


        //初始化隐藏全部禁言图标和问答滚动是否显示
        if(MT.me.role == "admin" || MT.me.role == "spadmin"){
            $("#mod_chat_post .all_gag").show();
        }  

        HTSDK.modChat.initChatGag();
        
        // 白名单特殊设置
        this.specialProcess();
    }
};




// 左侧区(摄像头, 公告)
HTSDK.modSider = {
    $target: $("#mod_col_left"),
    // 事件绑定
    bindEvents: function(){
        // 信息卡
        var hidePop = function () {
            $(".popup").hide();
        },
        timer = null;

        $(".camera_warp").on("mouseover", function() {
            clearTimeout(timer);
            
            if(HTSDK.player.defaults.toggled){
                return false;
            }
            if($('.mod_sider_top').hasClass("camera")){
                return false;
            }
            $(".popup").fadeIn(200);
        });
        $(".camera_warp").on("mouseout", function() {
            timer = setTimeout(hidePop, 300);
        });

        /*$(".mod_sider_top").on("mouseover", ".popup", function(e) {
            clearTimeout(timer);
        });
        $(".mod_sider_top").on("mouseout", ".popup", function(e) {
            //hidePop();
        });*/
    },
    // 主播信息卡
    authorCard: function(zhubo){
        if(!zhubo.intro || zhubo.intro.length === 0){
            if(MT.tools.in_array(window.partner_id, zhiPin)){
                zhubo.intro = "主讲人比较忙，暂未添加简介...";
            }else{
                if(yearhui == window.partner_id){
                    zhubo.intro = "主持人比较忙，暂未添加简介...";
                 }else{
                    zhubo.intro = "老师比较忙，暂未添加简介...";
                 }
                
            }
        }
        


        var _tplAucard = template("author_card", zhubo);
        
        $(".camera_warp", "#mod_col_left").after(_tplAucard);
    },
    // 公告
    notify: function(notify){
        var _content = "";
        if(notify.content.length === 0){
            // 无消息5秒消失
            _content = "暂无内容...";
            setTimeout(function(){
                $("#mod_chat_hall").removeClass('has_notice');
                $("#mod_notify_con").fadeOut(200);
            }, 5000);
        }else{
            _content = HTSDK.tools.textUrlLink(notify.content);
        }
        if(typeof notify.content !== "undefined"){

            $("#mod_notify_con .notify_con").html('<pre><p>'+_content+'</p></pre>');
            $("#mod_chat_hall").addClass("has_notice");
            $("#mod_notify_con").fadeIn(200);
        }
    },
    init: function(){
        this.bindEvents();
    }
};

// 结构层
HTSDK.view = {
    currentMode: 0,
    nativeMode: 1,   

    defaults: {
        isFlex: {
            left: false,
            right: false
        },
        isLoad: false,//有没有加载过
        isHasPPT: false,     
    },
    $target: $("#room"),
    bindEvents: function () {
        var that = this,
            $room = this.$target;
    },
    // 注册Tmod模版方法
    helper: function(){
        // 时间转换
        window.template.helper("converTime", function(time){
            return HTSDK.tools.convertTimestamp(time);
        });

        window.template.helper("getCountDownTime", function(duration){
            
            return MTSDK.admin.callName.callCountDown(duration);
        });

        // 获取头像
        window.template.helper("getAvatar", function(user){
            return HTSDK.room.setAvatar(user);
        });

        // 设置图片资源
        window.template.helper("getImage", function(res){
            return HTSDK.room.getCDNPath(res);
        });

        // 获取语音权限类
        window.template.helper("getVoicePower", function(voice){
            return HTSDK.voice.getVoicePower(voice);
        });

        return false;
    },
    roomView: {
        // 渲染结构
        renderModuls: function(callback){
            var ret = {};
            // fix FF Position
            HTSDK.tools.fixFirefoxProsition();
            // 左侧
            var left = template("tpl_left_side");
            $("#mod_col_left").html(left);
            
            // 右侧
            var ret = {};
            ret.url = qaUrl;
            ret.tab_name = tab_name;
            ret.spadmin_name = spadmin_name;

            var right = template("tpl_right_side",ret);
            $("#mod_col_right").html(right);

            // 中间
            var right = template("tpl_col_main",ret);
            $("#mod_col_main").html(right);

            //合作商隐藏帮助
            var arr = ['11307','11533','11536'];  
            if(arr.indexOf(window.partner_id)>-1){
                $(".help").hide();
            }
            
            //渲染
            var tplScore = template("tpl_pop_score");
            $("body").append(tplScore);

            // pop插入
            var popLottery = template("tpl_lottery_render");
            $("body").append(popLottery);

            //打赏插入
            var popReward = template("tpl_reward_content");
            $("body").append(popReward);

            //扫码弹框
            var qrcode_pop = template("qrcode_pop");
            $("body").append(qrcode_pop);

            // DOM插入完成
            if(callback && typeof callback === "function"){
                callback();
            }
        }
    },

    //是否有ppt
    isPPT: function(ret){
        if(ret){
            try{
                var jsonData = JSON.parse(ret);
                if(jsonData.p<10000){
                    HTSDK.view.isHasPPT = true;
                }
            }catch(err){
                console.info(e.message);
            }
        }
    },

    //切换到插播，桌面分享摄像头区域显示
    switchModePrivew: function(curMode,nativeMode){
        var that = this;
        //有ppt的情况下
        if(HTSDK.view.isHasPPT){
            $(".switch_preview").hide();
            return;
        }

        HTSDK.view.currentMode = curMode;
        HTSDK.view.nativeMode = nativeMode;
        //插播和桌面分享    
        if(curMode == 2){
            if(!that.defaults.isLoad){
                var temp = template("switch_preview");
                $(".section_main").append(temp);
                $(".tools_toggle_camera").hide();
                that.defaults.isLoad = true;
            }

            if(!$("#mod_col_main .left").hasClass("active")){

                $(".switch_preview").show();
            }else{
                $(".switch_preview").hide();
            }
             
            //插播
            if(nativeMode == 1){
                $(".section_main .switch_preview span").html("正在播放视频 ...");
            }
            //桌面分享
            else if(nativeMode == 2){
                $(".section_main .switch_preview span").html("正在进行桌面分享 ...");
            }
        }else{
            $(".tools_toggle_camera").show();
            $(".switch_preview").hide();
        }
    },
    init: function(callback) {
        this.roomView.renderModuls(callback);
        this.bindEvents();
    }
};


// 底部工具栏
HTSDK.footer = {
    target: $(".mod_footer"),
    pptIsShow: false,
    pptPage: 1,

    isHasPPT: false,//false没有ppt,ture表示有ppt
    // 事件绑定
    bindEvents: function(){

        //网络状态hover
        var $prompt = $('.tools_toggle_netprompt .focus_pro'),
            that = this;

        $prompt.parent().hover(function(){
            $prompt.show();
        },function(){
            $prompt.hide();
        });

        var $opBtns = $("#live_tools");

        //助教PPT预览模块
        $opBtns.on('click','.preview_btn',function(){
            MTSDK.admin.adminBox.pptPreViewRender(function(ret){
                if(ret){
                    $('.assistant_ppt').show().css({
                        'margin-top': -$(window).height()*0.9 / 2-20+'px',
                        'margin-left': -$(window).width()*0.9 / 2-20+'px'
                    });
                    $('#pop_layer').show();
                }
            });
        });
        $(window).on("resize", function(){
            $('.assistant_ppt').css({
                'margin-top': -$(window).height()*0.9 / 2-20+'px',
                'margin-left': -$(window).width()*0.9 / 2-20+'px'
            });
        });
        $('.ass_ppt_close').on('click',function(){
            $('.assistant_ppt').hide();
            $('#pop_layer').hide();
        });

        // 网络选择
        $opBtns.on("click", ".tools_toggle_network", function(event){
            MTSDK.admin.chooseNetwork.init();
        });

        // 弹幕开关
        if(window.location.href.indexOf("debug=list") > -1){
            $("#danmaku_opt").show();
        }
        $opBtns.find(".danmaku_button_wrap").on("click", function(){
            $(this).toggleClass("active");
            var actived = $(this).hasClass("active");
            var _HT = HTSDK.room._HT;
            if(actived){
                _HT.emit("danmaku:open", function(){
                    // 弹幕开
                });
            }else{
                _HT.emit("danmaku:close", function(){
                    // 弹幕关
                });
            }
        });
    },

    pptNewUrl : null,

    //助教ppt页
    pptPreView: function(retval){
        var that = this;
        // null, undefied 
        if(!retval.curPath){
            this.pptIsShow = false;
            //$('.preview_num').html("");
            // $(".preview_btn").hide();
            return false;
        }else {
            this.pptIsShow = true;

            if( retval.curPath != null || retval.curPath != undefined ){
                if(retval.pptUrl != that.pptNewUrl){
                    that.pptNewUrl = retval.pptUrl; 
                }
            }
            $(".preview_btn").show();
            $(".ppt_preview").show();
            //$('.preview_num').html(retval.page+'/'+retval.count);
            $('.preview_num').html(retval.page+'/'+retval.count);
        }
        
    },

    init: function(){
        this.bindEvents();
    }
};


// 拖拽
HTSDK.movePop = {
    //全局变量
    defaults: {
        event_obj:[],
        element_obj:null,
        box_position:{}
    },
    // 事件绑定
    bindEvent: function(){
        var that = this;
        var cls = document.querySelectorAll(".cls");
        var _boxs = document.body;
        that.setup(_boxs);
    },
    // 拖拽入口
    setup: function(_boxs) {
        var that = this;
        if(_boxs){
            that.move(_boxs);
            that.destroy(_boxs);
            return _boxs;
        }else{
            throw new Error("steup => el error");
            return null;
        }
    },
    move: function(_boxs){
        var that = this;
        var disX= 0;  
        var disY= 0; 
        var el = null;
        var move_flag = null;
        var able_flag = true;
        var marginTop = null;
        var marginLeft = null;
        // var box_position = {};
        var vote_start = document.getElementById("studentVote_box");
        var vote_end = document.getElementById("pop_box");


        if(el!=null&&el.parentNode.id=="ht_admin_box"){
        // 设置移动盒子的left & top 且助教盒子内所有弹窗同步位置
            for(var i=0;i<el.parentNode.children.length;i++){
                el.parentNode.children[i].style.left=that.defaults.box_position["left"];
                el.parentNode.children[i].style.top=that.defaults.box_position["top"];
            }
        }

        //  鼠标按下
        var binding_down = function(ev){
            // 初始化移动的盒子
            el = null;
            // 初始化移动标志
            move_flag = null;
            // 判断移动盒子&移动标志
            if(ev.target.parentNode&&ev.target.parentNode.dataset.move=="move_flag"){
                el = ev.target.parentNode;
            }else{
                if(ev.target.parentNode.parentNode&&ev.target.parentNode.parentNode.dataset.move=="move_flag"){
                    el = ev.target.parentNode.parentNode;
                }else{
                    return false; 
                }
            }

            // 清除class (移动中不允许应用过渡属性，否则延迟卡顿)
            if(el==vote_start||el==vote_end){
                el.setAttribute("class","");
            }

            var oEvent = null;
            oEvent=ev||window.event;
            disX=oEvent.clientX-el.offsetLeft;  
            disY=oEvent.clientY-el.offsetTop;
            
            //  目标绑定鼠标移动
            // ev.target.addEventListener("mousemove", binding_move);  
            document.addEventListener("mousemove", binding_move);  
            
            //  目标绑定鼠标松开
            // ev.target.addEventListener("mouseup", binding_up); 
            document.addEventListener("mouseup", binding_up); 
            return false;  
        };

        // 鼠标移动
        var binding_move = function(ev){

            // 拖拽中不允许选中页面内容
            if(able_flag){
                document.body.style.setProperty("-webkit-user-select","none","");
                document.body.style.setProperty("-moz-user-select","none","");
                document.body.style.setProperty("-ms-user-select","none","");
                document.body.style.setProperty("user-select","none","");
                able_flag = false;
            }
            // 点击目标
            that.defaults.element_obj = null;
            that.defaults.element_obj = ev.target;

            var oEvent = null;
            oEvent=ev||window.event;  
            var l=oEvent.clientX-disX;  
            var t=oEvent.clientY-disY; 

            // 限制移动盒子不能移出视窗外  
            if(l<0){
                l=0;
            }else if(
                l>document.documentElement.clientWidth-el.offsetWidth){
                l=document.documentElement.clientWidth-el.offsetWidth;  
            }  
              
            if(t<0){
                t=0;
            }else if(
                t>document.documentElement.clientHeight-el.offsetHeight){
                t=document.documentElement.clientHeight-el.offsetHeight;
            }

            // 返回移动盒子的margin-left & margin-top
            function getStyle(obj,attr){
                if(obj.currentStyle){
                return obj.currentStyle[attr];
                }
                else{
                return document.defaultView.getComputedStyle(obj,null)[attr];
                }
            }
            marginTop = null;
            marginLeft = null;
            marginTop = parseInt(getStyle(el,'marginTop').match(/[\d]+/)[0],10);
            marginLeft = parseInt(getStyle(el,'marginLeft').match(/[\d]+/)[0],10);

            // 设置移动盒子的left & top
            el.style.left=l+marginLeft+"px";
            el.style.top=t+marginTop+"px";
            // 设置助教管理预备盒子left & top
            that.defaults.box_position["left"] = "";
            that.defaults.box_position["top"] ="";
            that.defaults.box_position["left"]= l+marginLeft+"px";
            that.defaults.box_position["top"]= t+marginTop+"px";
        };

        // 鼠标松开
        var binding_up = function(ev){
            // 恢复页面允许选中功能
            document.body.style.setProperty("-webkit-user-select","text","")
            document.body.style.setProperty("-moz-user-select","text","")
            document.body.style.setProperty("-ms-user-select","text","")
            document.body.style.setProperty("user-select","text","")
            able_flag = true;                 
            // ev.target.removeEventListener("mousemove", binding_move);
            document.removeEventListener("mousemove", binding_move);
            document.removeEventListener("mouseup",binding_up)

            if(el==vote_start||el==vote_end){
                el.setAttribute("class","vote_transition");
            }
        };

        // 追加鼠标事件对象用于destroy解绑
        that.defaults.event_obj.push(binding_down,binding_move,binding_up);

        // body绑定鼠标按下
        _boxs.addEventListener("mousedown", binding_down);
    },
    destroy: function(_boxs){
        var that = this;
        var remove_lsn = function(ev_cls){

            // 点击关闭后body解绑mousedown
            if(ev_cls.target.className.split(" ")[0]=="cls"){
                _boxs.removeEventListener("mouseup",that.defaults.event_obj[0]);

                // 点击关闭后移动锚点解绑mousedowm、mousemove、mouseup
                if(that.defaults.element_obj!=null){
                    for(var i=0;i<that.defaults.event_obj.length;i++){
                        that.defaults.element_obj.removeEventListener("mouseup", that.defaults.event_obj[i]);
                        document.removeEventListener("mouseup",that.defaults.event_obj[i]);
                    }
                }
            }

            //关闭按钮后重置点击目标
            that.defaults.element_obj = null;
        }

        // body绑定鼠标按下
        _boxs.addEventListener("mousedown", remove_lsn);
    },
    init: function(){
        var that = this;
        that.bindEvent();
    }
},



// 投票窗口缩放
HTSDK.voteZoom = {
    //全局变量
    defaults: {
        event_obj:[],
        element_obj:null
    },
    // 事件绑定
    bindEvent: function(){
        var that = this;
        var _boxs = document.body;
        that.setup(_boxs);
    },
    // 缩放入口
    setup: function(_boxs) {
        var that = this;
        if(_boxs){
            that.zoom(_boxs);
            that.destroy(_boxs);
            return _boxs;
        }else{
            throw new Error("steup => el error");
            return null;
        }
    },
    zoom: function(_boxs){
        var zoom_box = "";
        var zoomFn = function(ev_down){
            // 增减类名控制缩放
            function hasClass(obj, cls) {  
                return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
            }  
              
            function addClass(obj, cls) {
                if (!hasClass(obj, cls)) obj.className += " " + cls;  
            }  
              
            function removeClass(obj, cls) {  
                if (hasClass(obj, cls)) {  
                    var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
                    obj.className = obj.className.replace(reg, ' ');  
                }  
            }  
              
            function addZoom(obj,cls){  
                if(!hasClass(obj, cls)){
                    addClass(obj, cls);
                }  
            }

            function removeZoom(obj,cls){  
                if(hasClass(obj,cls)){  
                    removeClass(obj, cls);  
                }
            }
            
            // 判断放大||缩小
            if(ev_down.target.className=="vote_narrow"){
                zoom_box = ev_down.target.parentNode.parentNode.parentNode.parentNode;
                // 增加限制样式，收起盒子
                addZoom(zoom_box,"zoomClass");
            }
            if(ev_down.target.className=="vote_enlarge"){
                if(zoom_box==""){return};
                // 初始化时添加过渡属性
                zoom_box.setAttribute("class","vote_transition");
                // 清除限制样式，弹出被收起的盒子
                removeZoom(zoom_box,"zoomClass");
            }
        }
        // body绑定鼠标按下
        _boxs.addEventListener("mousedown", zoomFn);
    },
    destroy: function(_boxs){

    },
    init: function(){
        var that = this;
        that.bindEvent();
    }
};


//手机观看扫码弹框
HTSDK.qrcode = {
    isLoad: false,
    bindEvent: function(){
        var that = this;
        $(document).on('click',function(e){
            var target = (e.target);
            //点击显示扫码弹框
            if($(target).hasClass('live_code_info')){
                if($('.qrcode_pop').hasClass('hidden')){
                    var position = $('.live_code').offset().left;

                    $('.qrcode_pop').css('left',position);
                    $('.qrcode_pop').removeClass('hidden');
                }else{
                    $('.qrcode_pop').addClass('hidden');
                }
            }else{
                $('.qrcode_pop').addClass('hidden');
                // if($('.qrcode_pop').hasClass('hidden')){

                // }else{
                //     $('.qrcode_pop').addClass('hidden');
                // }
            }

           //是否已经实例化 
           if(!that.isLoad) {
                //实例化生成二维码
                var qrcode_url = window.location.href;
                var qrcode = new QRCode('qrcode', {
                    text: qrcode_url,
                    width: 130,
                    height: 130,
                    colorDark : '#000000',
                    colorLight : '#ffffff',
                    correctLevel : QRCode.CorrectLevel.H
                });
                that.isLoad = true;
           }
        });
    },
    init:function(){
        var that = this;
        that.bindEvent();
    }
};




// 总入口
HTSDK.room.init();
