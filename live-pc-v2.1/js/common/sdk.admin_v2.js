"use strict";
/**!
 * Dependent on Talk-Fun JS-SDK Library v1.0.2
 * http://www.talk-fun.com/
 * 
 * @copyright: [2015, Talk-Fun]
 * @version: [v1.2.1]
 * @author: [Marko]
 * @description: [助教管理功能]
 * @API: http://open.talk-fun.com/open/doc/sdk.js.html
 * @模版采用Tmod模版
 */
//typeof define !== "undefined" define()else window.
//
/**
 * [MTSDK 欢拓SDK拓展]
 * @type {Object}
 */
var MTSDK = window.MTSDK || {};

window.protocol = window.location.protocol+"//";
/**
 * {MTSDK.admin}域 - 助教管理操作
 */
 //一起作业网
var voteList = ["11386"]
   window.voteTitle = "投票";
   window.choiceTitle = "投";
if(voteList.indexOf(window.partner_id)>-1){
    voteTitle = "答题";
    choiceTitle = "选";
}
MTSDK.admin = {
    // 是否开启debug
    /*isDebug: (window.location.href.indexOf("sdkVersion=test") > -1) ? true : false,*/
    // 测试案例方法
    /*fortest: function(){
        if(this.isDebug){
            $(".it8").removeClass("hidden");   
            // $(xxx).show();
        }
    },*/
    CODE_SUCCESS: 0,
    
    // 主域名
    host: "open.talk-fun.com",

	// 是否管理
	isAdmin: function (_role) {
        if(window.MT.me){
    		var role = {};
    		if(_role){
    			role = _role;
    		}else{
    			role = MT.me.role;
    		}
    		if(role === "admin" || role === "spadmin"){
    			return true;
    		}else{
    			return false;
    		}
        }
	},

	// 加载模版
	loadTemplate: function(callback){
		var that = this,
			divTplLoader = document.createElement("div"),
			divAdminBox = document.createElement("div");
		
		// create admin-template loader container
		divTplLoader.id = "template_admin_loader";
		divTplLoader.className = "hidden";
		document.body.appendChild(divTplLoader);

		// create admin-box container
		divAdminBox.id = "admin_pop_box";
		divAdminBox.className = "mod_admin_pop_box hidden";
		document.body.appendChild(divAdminBox);
		// load ad.tpl
		$("#template_admin_loader").load(window.tpl_mod_admin_url, null, function(){
    		that.adminTplLoaded = true;
    		if(typeof callback === "function"){
    			callback();
    		}
    	});
	},

	// 助教提示
	titleTips: function(){
		$(".mod_question .qus").html("提问区 <em>(助教回答后学生端可见)</em>");
		$(".mod_chat .chat").html('聊天区 <em class="temp_user">在线('+$("#online_count").html()+')</em>');
	},

	// 初始化(总入口)
	init: function(_MT){ 
		var that = this,
			admin = this.isAdmin();

        if(_MT){
            this._MT = _MT;
        }
		if(admin){
			this.titleTips();
			this.loadTemplate(function(){
				that.adminBox.init();
				that.operation.init();
			});
            // 测试案例
            /*that.fortest();*/
		}
	}
};

// core执行
MTSDK.admin.core = {
    filter: function(type){
        if(type){
            type = parseInt(type);
        }
        switch(type){
            // 预加载
            case 1111:
                return true;
                break;
            // 画线
            case 25:
                return true;
                break;
        }
    },
    // 命令切割
    slice: function(data){

        if(!data){
            return false;
        }
        var cmds = data;
        if(typeof data === "string"){
            cmds = JSON.parse(data);
        }

        var contents = cmds.c || "",
            page = cmds.p || 0,
            type = cmds.t || 0,
            parts = contents.split("|");

        var isMatch = this.filter(type);

        if(isMatch){
            return false;
        }

        var count = 0;
        if(MTSDK.admin.adminBox.pptPreViewData){
            count = MTSDK.admin.adminBox.pptPreViewData.count;
        }

        // 取最后保存数据
        this.latestPptObj = {
            curPath: parts[5],//子页
            parts: parts,
            count: count,
            page: page
        };

        return {
            count: count,
            parts: parts, 
            page: page
        };
    },
    // 白板
    isWhiteBoard: function(page){
        if(page > 10000){
            return true;
        }else{
            return false;
        }
    },
    // 获取ppt对象
    getpptUrl: function(cmd){

        this.slice(cmd);

        var sliceParts = this.latestPptObj,
            pptObj = {};
        
        if(!sliceParts){
            return false;
        }

        // 返回ppt对象
        if(this.isWhiteBoard(sliceParts.page)){
            return false;
        }else{
            var isUrl = sliceParts.parts[0].match(/http|https|ftp/ig);
            if(isUrl){

                //解决黑板切到ppt时点预览出错
                if(!sliceParts.parts[5]){
                    sliceParts.parts[5] = "1";
                }
                pptObj = {
                    curPath: sliceParts.parts[5],
                    page: sliceParts.page,
                    pptUrl: sliceParts.parts[0]
                };
            }else{
                // 获取最近一个ppt
                pptObj = this.latestPptObj;
            }
            this.pptObj = pptObj;
            return pptObj;
        }
    }
};

// 执行
MTSDK.admin.adminDo = {  
    disableUsers : [],//禁言的用户
    privateUsers : {},//存储学生对象
    banUserXids : {},//禁言用户xid;
    //私聊
    privateChat: function(xid){
        var that = this;
        if(that.privateUsers[xid]){//如果学生存在
           $(".private_chat").show();
           MTSDK.privateChat.setstyle(xid);
        }else{//不存在
            that.privateUsers[xid] =xid;
            var xids=[];
            xids.push(xid);
            MTSDK.privateChat._create(xids,xid); 
        }       
    },

    //查看详情
    detail: function(xid, target, callback){
        var that = this,
            lis = "";
        if(xid){
            $('#detail_cont').remove();
            var __target = {};
            if(target){
                __target = MTSDK.admin.operation.$target = $(target);
            }else{
                __target = MTSDK.admin.operation.$target;
            }
            MT.getDetail(xid, function(ret){
                if(ret.data){
                    for (var i in ret.data) {
                        lis += "<li>"+i+"："+ret.data[i]+"</li>";
                    }
                    //$("#tpl_detail_con").append(lis);
                    var tpl_detail_con = template("tpl_detail_con", ret.data);
                    if($('#detail_cont').size()>0){
                        return false;
                    }else{
                        $("body").append(tpl_detail_con);
                        if(__target.context.className == "manager"){
                            $('#detail_cont').css("top", __target.offset().top-20);
                            $('#detail_cont').css("left", __target.offset().left-40);
                        }else if(__target.context.className == "cp"){
                            $('#detail_cont').css("top", __target.offset().top+20);
                            $('#detail_cont').css("left", __target.offset().left-100);
                        }else{
                            $('#detail_cont').css("top", __target.offset().top+20);
                            $('#detail_cont').css("left", __target.offset().left);
                        }
                        
                    }
                    //关闭
                    if($('#detail_cont').size()>0){
                        $('.detail_close').on('click', function(){
                            $('#detail_cont').remove();
                        });
                    }
                }
            });
        }
    },
    
	// 踢出房间
	kick: function(xid, _MT){
        if(_MT){
            var _MT  = _MT;
        }else{
            _MT = MTSDK.admin._MT;
        }
		MT.tools.debug('pop menu -> click memberKick for xid : ' + xid);
        if (window.confirm("你确定要踢此用户出房间？")) {
            _MT.emit('member:kick', xid, function(retval){
                MT.tools.debug('socket emit callback : memberKick');
                $("#user_"+xid).remove();
            });
        }
	},
    // 清空举手队列
    clearVoiceHands: function(_MT, callback){
        MT.tools.debug("voice:hand:clear");
        if(window.confirm("确定要清空举手列表吗？")){
            _MT.emit('voice:hand:clear',function(retval){
                callback(retval);
            });
        }
        return false;
    },
    // 允许语音说话
    venable: function (xid, _MT, callback) {
        MT.tools.debug('pop menu -> click voiceEnable  for xid : '+xid); 
        _MT.emit('voice:power:allow', xid, function(retval){
            callback(retval);
        });
    },
    // 禁止语音说话
    vdisable: function (xid, _MT, callback) {
        MT.tools.debug('pop menu -> click voiceEnable  for xid : '+xid); 
        _MT.emit('voice:power:forbid', xid, function(retval){
            callback(retval);
        });
    },
	// 发言权限
	chatAccess: function(xid, _MT){
        var that = this;
        if(_MT){
            var _MT  = _MT;
        }else{
            _MT = MTSDK.admin._MT;
        }
        var that = this;
        if (window.confirm("你确定要禁止此用户发言？")) {
    		_MT.emit("chat:disable", xid, function(retval){
                that.disableChat(xid);
                that.disableUsers.push(retval);  
    		});
        }
	},

    //禁止发言
    disableChat: function(xid){
        var that = this;
        var  banUserXids =  JSON.parse(sessionStorage.getItem("banUserXids"));
        if(banUserXids){
            MTSDK.admin.adminDo.banUserXids = banUserXids;
        }
        //存储被禁言的用户xid集合
        if(!MTSDK.admin.adminDo.banUserXids[xid]){
            MTSDK.admin.adminDo.banUserXids[xid] = xid;
            sessionStorage.setItem("banUserXids",JSON.stringify(MTSDK.admin.adminDo.banUserXids));
        }
        
        MT.tools.debug('socket emit callback : memberChat:disable');
        $("#user_"+xid).find('.grant').addClass('ban');
        $(".xid_"+xid).find(".grant").addClass("ban");
        $(".ban_" +xid).show();
        $("#member_"+xid).data("chat","0"); 
    },
};




// 操作
MTSDK.admin.operation = {
	hvTimer: null,
	// 目标
	target: $("body"),
	// 事件列表
	events: [
		// 弹窗菜单
		{"mouseover": [".pop_side_operation li", "toggleAdMenu"]},
		{"mouseout": [".pop_side_operation li", "toggleAdMenu"]},
		// 在线用户
		{"click": ["#member_list li", "showMenu"]},
		{"mouseover": ["#member_list li", "toggleAdMenu"]},
		{"mouseout": ["#member_list li", "toggleAdMenu"]},
		// 聊天区操作
		{"click": ["#chat_hall .uinfo", "showMenu"]},
		{"mouseover": ["#chat_hall .uinfo", "toggleAdMenu"]},
	],
	// 检查权限
	checkAccess: function(xid){
		// todo...
	},
    // 特殊指令处理(聊天 )
    specialCmd: function(cmd){
        if(cmd){
            switch(cmd){
                case "admin:reload":
                    window.location.reload();
                    return true;
                    break;
                defalut:
                    break;
            }
        }
    },
    // 设置禁言
    // data.chat.enable > 0  为可以发言
    // data.chat.enable == 0 为禁言状态
    getChatAccess: function(data){
        if(data.chat){
            // 允许发言
            if(data.chat.enable > 0){
                return false;
            }else{
            // 禁言
                return true;
            }
        }
    },
	// 弹出菜单hover-toggle
	toggleAdMenu: function(e){
		if(e.type === "mouseover"){
			clearTimeout(MTSDK.admin.operation.hvTimer);
		}else if(e.type === "mouseout"){
			/*MTSDK.admin.operation.hvTimer = setTimeout(function(){
				// $(this).popboxCloseAll();
			}, 300);*/
		}
	},
	// 设置权限
	setAccess: function(key, xid){
		switch(key){
			// 禁言
			case "chat:disable":
				$.cookie(key+":"+xid, "true", {expires: 1});
				break;
			// 解禁
			case "chat:enable":
				$.removeCookie(key+":"+xid);
				break;
		}
	},
	// 获取权限
	getAccess: function(key, xid){
		var isSet = $.cookie(key+":"+xid);
		if(isSet === "true"){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * Admin.管理菜单
	 * 目标元素必须包含属性{ data-xid, data-role }
	 * 例：<span data-xid="123456" data-role="admin">...</span>
	 */
	showMenu: function(){
		var that = MTSDK.admin.operation,
			$item = $(this);
        that.$target = $(this);
		// 是否管理员
		if(MTSDK.admin.isAdmin($item.data("role"))){
			return false;
		}
		// 弹窗
		$(this).popBox({
			top: 12,
			left: 140,
			content: template("tpl_admin_pop_menu"), // _root/tpl_admin
			callback: function(){
				// 踢出房
				$(".pop_side_operation").find("li").on("click", function(){
					var key = $(this).data("op"),
						user = {
							xid: $item.data("xid"),
							role: $item.data("role")
						};
					// 操作导航
					that.operationNav(key, user);
					$(this).popboxCloseAll();
				});
			}
		});
	},
	// 管理功能
	operationNav: function(key, user, xid){
        var that = this;
		var adminDo = MTSDK.admin.adminDo;
		switch(key){
            //私聊
            case "privateChat":      
                adminDo.privateChat(user.xid);
                break;
			// 踢出房间
			case "kick":
				adminDo.kick(user.xid);
				break;
			// 禁止发言
			case "chatAccess":
				adminDo.chatAccess(user.xid);
				break;
            // 禁止语音说话
            case "voiceDisable":
                adminDo.voiceAccess(user.xid);
                break;
            //查看详情
            case "detail":
            adminDo.detail(user.xid);
            break;   
            //解禁
            case "enableGag":
            MTSDK.admin.adminBox.userEnableGag();
            break;
		};
	},
	// 事件绑定
	bindEvents: function(){
		var that = this;
		MT.tools.bindEvent(that.target, that, that.events);
	},
	// 绑定操作
	init: function(){
		this.bindEvents();
	}
};

// 管理盒子
MTSDK.admin.adminBox = {
    // base link
    pptPreViewUrl: protocol + MTSDK.admin.host + "/live/document.php", //ppt预览
    lotteryUrl: protocol + MTSDK.admin.host + '/live/lottery.php', //抽奖
	voteUrl: protocol+ MTSDK.admin.host + '/live/vote.php', //投票
    noticeUrl: protocol + MTSDK.admin.host + '/live/interaction.php', //信息类
    broadCastUrl: protocol + MTSDK.admin.host + '/live/broadcast.php', //公共广播
    gagListUrl: protocol + MTSDK.admin.host + '/live/member.php',//禁言列表
    userListUrl: protocol + MTSDK.admin.host +'/live/userlist.php',//用户列表

	// 目标
	target: $("body"),

    voteTimeUpdate: null,

    isGag: false, //是否解禁

    banIds: [],//解禁id

    //0表示不抽取已中奖人 1表示抽取已中奖人
    isDelvedWinners: 0,   

    //要抽取的人数，默认1个
    lotteryNum: 1,

    //抽奖提示
    lotteryTips:"当前抽奖没人在线!",

    isClickSearch: false, //是否点了搜索

    //抽奖的状态
    lotteryState: 0,

    lotteryFlag: false,
	// 事件列表
	events: [
		// 打开应用
		{"click": [".wp_list li", "AppBoxRouter"]},
		{"click": ["#adminbox", "showAdminBox"]},
		// 返回
		{"click": ["#ht_admin_box .op_btn .back", "backHomePop"]},
		// 公告
		{"click": ["#mody_note_btn", "noticePost"]},
		// 滚动通知
		{"click": ["#mody_roll_btn", "postRollNotice"]},
		// 投票
        /*{"click": [".mod_lanuch_vote .vo_list li", "getVoteDetail"]},*/
      /*  {"click": ["#post_vote", "launchVote"]},*/
        /*{"click": ["#ht_admin_box .vote_form .confirm", "postVote"]},*/
        /*{"click": ["#ht_admin_box .vote_form .vo_opto .add", "addVoteOption"]},
        {"click": ["#ht_admin_box .vote_form .vo_opto .reduce", "reduceVoteOption"]},
        {"click": ["#ht_admin_box .vote_form .vo_model label input", "voteType"]},
        {"keyup": ["#ht_admin_box .vote_form .vo_model .limit .ipt", "mutipleLimt"]},
        {"click": ["#ht_admin_box .lun_voting .post_tool .reload", "voteReload"]},
        {"click": ["#ht_admin_box .lun_voting .vote_btn", "voteEnd"]},*/
        {"click": ["#ht_admin_box .cls", "closeBox"]},
        // 抽奖
        {"click": ["#ht_admin_box .mod_lottery .lo_btn.active", "emitLottery"]},
        {"click": ["#ht_admin_box .mod_lottery .lo_btn.stop", "stopLottery"]},
        {"click": ["#ht_admin_box #repate_winners .check_box", "isCheckLotteryer"]},
        {"keyup": ["#ht_admin_box .lottery_num", "lotteryerLimit"]},
        // 公共广播
        {"click": ["#post_pub_note", "broadcastPost"]},

        //解除禁言
         {"click": ["#gag_list li .list_right span", "enableGag"]},

         //用户搜索
         {"click": [".search_input i", "userSearch"]},


         //用户管理列表
         {"click": ["#user_list .glmenu", "showUserBox"]},
         //显示搜索菜单
         {"click": [".user_search .search_title", "searchMenu"]},

         //刷新
         {"click": [".mod_user_list .reload_list", "userList"]},

         {"click": [".mod_user_list .user_back", "userList"]},

         //查看全部
         {"click": [".mod_members .detail_all", "detailList"]},
	],

    // 点击查看全部跳转到用户列表
    detailList: function(){
        MTSDK.admin.adminBox.showAdminBox();
        MTSDK.admin.adminBox.popUserList();
    },

    //显示搜索下拉框
    searchMenu: function(){
        $(".search_select").show();
        $(".search_select").on("click","li",function(){
            $(".user_search .search_title").data("op",$(this).data("op"));
            $(".user_search .search_title").html($(this).text());
            $(".search_select").hide();
        });
        //点击其它地方将下拉框关闭
        $(window).on("click",function(e){
            if(e.target.className!= "search_title"){
                $(".search_select").hide();
            }
        })
    },

    //解除禁言
    enableGag: function(xid){
    	var xid =  $(this).data("xid"),
            that = this;
        MTSDK.admin.adminBox.commEnableGag(xid);

    },

    //公共解禁
    commEnableGag: function(xid){
        var _MT = MTSDK.admin._MT,
            that = this;
        _MT.emit("chat:enable", xid, function(retval){
            MT.tools.debug('socket emit callback : memberChat:enable');
            if(retval.code == 0){
                //将解禁的用户从对象中删除掉
                that.cancelBan(xid);
                MTSDK.admin.adminBox.isGag = true;
                MTSDK.admin.adminBox.banIds = xid;
            }
        });
    },

    //解除禁言
    cancelBan: function(xid){
        var  banUserXids =  JSON.parse(sessionStorage.getItem("banUserXids"));
        delete banUserXids[xid];
        sessionStorage.setItem("banUserXids",JSON.stringify(banUserXids));
        $("#li_"+xid).remove();
        $("#user_"+xid).find(".grant").removeClass("ban");
        $(".xid_"+xid).find(".grant").removeClass("ban");
        $("#user_"+xid).find(".grant").data("chat","1");
        $("#gag_total").html($("#gag_list li").length);
        $(".ban_"+xid).hide();
    },

    //用户列表解除禁言
    userEnableGag: function(){
        var xid = $(".admin_list .gagStatus").data("xid");
        var _MT = MTSDK.admin._MT;
        _MT.emit("chat:enable", xid, function(retval){
            MT.tools.debug('socket emit callback : memberChat:enable');
            $("#member_"+xid).data("chat","1"); 
            if(retval.code == 0){
                $("#user_"+xid).find(".grant").removeClass("ban");
                $(".xid_"+xid).find(".grant").removeClass("ban");
                $("#user_"+xid).find(".grant").data("chat","1");
                $("#gag_total").html($("#gag_list li").length);
                $(".ban_"+xid).hide();
                MTSDK.admin.adminBox.isGag = true;
                MTSDK.admin.adminBox.banIds = xid;
            }
        });

    },

	// 显示管理盒子
	showAdminBox: function(){
		var $box = $('#admin_pop_box');
		$box.find('.cmod').hide();
        $box.find('.cmvt').hide();
        $box.find('.mod_apps').show();
        $box.find('.lun_vote').show();
		$box.show();
        //测试用
        /*MTSDK.admin.fortest();*/
    },
    tipTimers: {}, // 缓存定时器
    tipThrottleTime: 5, // X秒 节流X秒
    /**
     * @param {String} evtName 某操作的唯一标志
     * @param {String | Number} throttleTime 节流时间
     */
    customCallBack: function (evtName, throttleTime) {
        var that = this
        // 如果传入该值，根据该值修改限制时间
        if (throttleTime) {
            that.tipThrottleTime = throttleTime
        }
        // 多个操作分开计时 (多个定时器)
        // 判断是第一次,如果该属性不存在，则把该属性赋值为true
        if (!that.hasOwnProperty(evtName)) {
            that[evtName] = true
        }
        // 如果该属性值为 false 
        if (!that[evtName]) {
            // 初始化弱提示框
            that.customTips.init(evtName)
            // 判断是否初始化了弱提示框
            if (that.customTips.isInit(evtName)) {
                // getCountdownPoint(evtName) 获取对应唯一标志的弱提示框里的倒计时插入点
                // that.tipTimers[evtName].throttleTime 倒计时时间
                that.customTips.getCountdownPoint(evtName).html(that.tipTimers[evtName].throttleTime)
            }
            return false
        }
        // 赋值该属性值为 false
        that[evtName] = false
        // 如果没有某唯一标志对应的对象，则为它创建一个空对象
        if (!that.tipTimers[evtName]) {
            that.tipTimers[evtName] = {}
            // example:
            // that.tipTimers[evtName] = {
            //     throttleTime: that.tipThrottleTime
            //     [evtName]: setInterval(function () {
            //     }, 1000)
            // }
        }
        // 为某唯一标志对象的倒计时字段赋值
        that.tipTimers[evtName].throttleTime = that.tipThrottleTime
        // 如果没有某唯一标志对应的定时器,则为它创建一个定时器
        if (!that.tipTimers[evtName][evtName]) {
            // 判断是否初始化
            if (that.customTips.isInit(evtName)) {
                // getCountdownPoint(evtName) 获取对应唯一标志的弱提示框里的倒计时插入点
                // that.tipTimers[evtName].throttleTime 倒计时时间
                that.customTips.getCountdownPoint(evtName).html(that.tipTimers[evtName].throttleTime)
            }
            that.tipTimers[evtName][evtName] = setInterval(function () {
                that.tipTimers[evtName].throttleTime --
                // 判断是否初始化
                if (that.customTips.isInit(evtName)) {
                // getCountdownPoint(evtName) 获取对应唯一标志的弱提示框里的倒计时插入点
                // that.tipTimers[evtName].throttleTime 对应唯一标志的倒计时时间
                    that.customTips.getCountdownPoint(evtName).html(that.tipTimers[evtName].throttleTime)
                }
                // console.log(that.tipTimers[evtName].throttleTime)
                if (that.tipTimers[evtName].throttleTime <= 0) {
                    // 倒计时完毕
                    // 初始化数据，清除定时器
                    that[evtName] = true
                    that.tipTimers[evtName].throttleTime = 5
                    clearInterval(that.tipTimers[evtName][evtName])
                    that.tipTimers[evtName][evtName] = null
                }
            }, 1000)
        }
        // 多个操作统一计时 (单个定时器)
        // if (that.tipTimer) {
        //     that.customTips.init(that.tipThrottleTime)
        //     return false
        // }
        // that.tipTimer = setInterval(function () {
        //     that.tipThrottleTime -- 
        //     if (that.customTips.isInit()) {
        //         that.customTips.getCountdownPoint().html(that.tipThrottleTime)
        //     }
        //     console.log(that.tipThrottleTime)
        //     if (that.tipThrottleTime <= 0) {
        //         if (that.customTips.isInit()) {
        //             that.customTips.getOutermostDom().hide()
        //         }
        //         that.tipThrottleTime = 15
        //         clearInterval(that.tipTimer)
        //         that.tipTimer = null
        //     }
        // }, 1000)
        return true
    },
    // IIFE（自执行函数） 
    /**
     * @return {Object} 
     */
    customTips: function (countDown) {
        /*  操作太过频繁的弱提示 */
        var countDown = countDown || 2, // 弱提示自动消失时间
            tplObj = {}, // 缓存获取过的弱提示模板,(每个操作的弱提示都有一个单独的模板)
            countdownPointObj = {}, // 缓存倒计时插入点
            isInitFlagObj = {}, // 缓存每个模板是初始化成功的状态
            isShowObj = {}, // 弱提示是否已经显示
            timers = {}  //  缓存每个操作的弱提示的定时器对象
        // 创建模板
        function createTpl (evtName) {
            var str = '<div class="custom-tips '+ evtName +'">' +
                    '<span class="custom-tips-item custom-tips-item-first">请在当前操作<span class="custom-tips-countdown">-</span>秒后重试</span>' +
                '</div>'
            return str
        }
        // 显隐
        function timeToHideTpl (evtName) {
            if (!isShowObj[evtName]) {
                tplObj[evtName].show()
            }
            if (!timers[evtName]) {
                timers[evtName] = setTimeout(function () {
                    tplObj[evtName].hide()
                    isShowObj[evtName] = false
                    clearTimeout(timers[evtName])
                    timers[evtName] = null
                }, countDown * 1000)
            }
        }
        function getCountdownPoint (evtName) {
            if (!countdownPointObj[evtName]) {
                return countdownPointObj[evtName] = $('.' + evtName + ' .custom-tips-countdown')
            }
            return countdownPointObj[evtName]
        }
        function getOutermostDom (evtName) {
            if (!tplObj[evtName]) {
                return tplObj[evtName] = $('.' + evtName)
            }
            return tplObj[evtName]
        }
        // 插入dom中
        function init (evtName) {
            if (!tplObj[evtName]) {
                var str = createTpl(evtName)
                $('#admin_pop_box').append(str)
                tplObj[evtName] = $('.' + evtName)
                tplObj[evtName].show()
                isInitFlagObj[evtName] = true
            }
            timeToHideTpl(evtName)
        }
        function isInit (evtName) {
            return !!isInitFlagObj[evtName]
        }
        return {
            init: init,
            isInit: isInit,
            getCountdownPoint: getCountdownPoint, // 获取插入点 jquery/zepto对象
            getOutermostDom: getOutermostDom // 获取模板最外层DOM jquery/zepto对象
        }
    }(),
	// 通知&公告(加载)
	getNotifies: function(){
        //getDatalist
        var that = this,
            metadata = '',
            dataList = {};
        //post
        metadata+='action=getNotice';
        $.ajax({
            type: 'POST',
            data: metadata,
            url: that.noticeUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MTSDK.admin.CODE_SUCCESS){
                    that.setNotifies(ret);
                }
            }
        });
    },
    // 通知&公告(插入)
    setNotifies: function(ret){
    	if(ret.notice){
    		// 公告
    		$("#notify_con .note_area").val(ret.notice.content);
    	}
    	if(ret.roll){
	    	// 滚动通知
	    	var $rc = $('#roll_con');
	    	$rc.find('.note_area').val(ret.roll.content);
	        $rc.find('.note_link').val(ret.roll.link);
			// 滚动是否过期
	        if(ret.roll.expire == 1){
	            $rc.find('.exped').addClass('y').html('已过期!');
	        }else{
	            $rc.find('.exped').removeClass('y').html('进行中!');
	        }
	        $rc.find('.exped').show();
	        // 选中当前时间
	        $rc.find('.end_time option').each(function(i, e){
	            if($(this).val() == ret.roll.duration){
	                $(e).attr('selected', true);
	            }
	        });
    	}
    },
	// 返回Home菜单
	backHomePop: function(){
		var that = MTSDK.admin.adminBox,
            $box = $('#ht_admin_box'),
            back = function(){
                $box.find('.cmod').hide();
                $box.find('.cmvt').hide();
                $box.find('.mod_apps').show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
                $box.find('.lun_vote').show();
                $(".gag_pop").hide();
            };
        try{
            var $target = $(this) || {},
                $history = $target.data("history");
            //return;
            if($history == "1"){
                that.getVoteList();
                // 返回投票
                return false;
            }else{
                back();
            }
        }catch(err){}
        back();
        clearInterval(MTSDK.admin.vote.voteTimeUpdate);  
        clearInterval(MTSDK.admin.callName.defaluts.recordTimer);
        clearInterval(MTSDK.admin.callName.defaluts.callBackRequest); 
        $("#vote_img").attr("src","");
        MTSDK.admin.vote.defaluts.imgUrl = "";  
	},
	// 关闭主盒子
	closeBox: function(){
        clearInterval(MTSDK.admin.callName.defaluts.recordTimer);
        clearInterval(MTSDK.admin.vote.voteTimeUpdate);  
        $("#vote_img").attr("src","");
        MTSDK.admin.vote.defaluts.imgUrl = ""; 
		$("#admin_pop_box").hide();
        $(".gag_pop").remove();
	},
	// 隐藏子盒子
	hidePop: function(){
		$("#ht_admin_box").find(".cmod").hide();
	},

	/**
	 * 公告
	 */
	noticeInit: function(){
		$("#admin_pop_box .mod_notice").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
	},
	noticePost: function(){
		// 参数
		var param = {
            action: "notice", 
            content: $("#notify_con .note_area").val()
        };
		//getDatalist
        var that = MTSDK.admin.adminBox,
        	$ncon = $("#notify_con"),
            metadata = '',
            dataList = {},
            msg = encodeURIComponent(param.content);
        //post
        metadata+='action='+param.action+'&content='+msg+"&access_token="+window.access_token;
        $.ajax({
            type: 'POST',
            data: metadata,
            url: that.noticeUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MTSDK.admin.CODE_SUCCESS){
                    $ncon.find('.tips').show();
			        setTimeout(function(){
			            $ncon.find('.tips').hide();
			        },1500);
                }
            }
        });
	},

	/**
	 * 滚动通知
	 */
	rollNoticeInit: function(){
		$("#admin_pop_box .mod_roll_notice").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
	},
	postRollNotice: function(){
		var that = MTSDK.admin.adminBox,
            $con = $('#roll_con'),
            $textarea = $con.find('.note_area'),
            $link = $con.find('.note_link'),
            $endTime = 600;
        //时间选择
        $endTime = $con.find('.end_time option:selected').val();
        //滚动是否过期
        if($endTime == 0){
            $con.find('.exped').addClass('y').html('已过期!');
        }else{
            $con.find('.exped').removeClass('y').html('进行中!');
        }
        // 请求参数   
        var param = {
            "action" : "roll",
            "content": $textarea.val(),
            "link"   : $link.val(),
            "duration": $endTime
        };
        // getDatalist
        var metadata = '',
            dataList = {},
            msg = encodeURIComponent(param.content);
        // post
        metadata+='action='+param.action+'&link='+param.link+'&duration='+param.duration+'&content='+msg+'&access_token='+window.access_token;
        $.ajax({
            type: 'POST',
            data: metadata,
            url: that.noticeUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MTSDK.admin.CODE_SUCCESS){
                    $con.find('.tips').show();
			        setTimeout(function(){
			            $con.find('.tips').hide();
			        },1500);
                }
            }
        });
    },
	// 设置投票(数据列表)
	setVoteList: function(ret){
		var voteList = template("tpl_get_votelist", ret);
		$(".mod_lanuch_vote .cmvt").hide();
		$("#box_loading").hide();
		$("#admin_pop_box .mod_lanuch_vote").show();
		$("#admin_pop_box .lun_vote .vo_list").html(voteList);
		$("#admin_pop_box .lun_vote").show();
		$("#ht_admin_box .mbox_hd .back").data("history", 0);
	},

    /**
     * 课件管理
     */
    resFileInit: function(){
    	$("#ht_admin_box .mod_apps").show();
    	MTSDK.admin.adminBox.fileManager();
    },
    // fileManager
    fileManager: function(){
		var frameUrl = protocol+"open.talk-fun.com/live/document.php?act=list&access_token="+window.access_token;
		// create files iframe
		var iframe = document.createElement("iframe");
		iframe.src = frameUrl;
		iframe.id = "upframe";
		iframe.width = "100%";
		iframe.height = "100%";
		iframe.className = "upload_frame";
		var popFrame = template("tpl_upload_file");
		$("body").append('<div id="pop_upload" data-move="move_flag"></div>');
		$("#pop_upload").show().append(popFrame);
		$("#frame_box").append(iframe);
	},

    /**
     * 抽奖
     */
    lotteryInit: function(){
    	$("#ht_admin_box").find(".cmod").hide();
    	$("#ht_admin_box .mod_lottery").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
    	MTSDK.admin.adminBox.getLottery();
    },
    // 抽取中奖人
    postLottery: function(flag){
        var that = MTSDK.admin.adminBox,
            access_token = window.access_token;
        that.lotteryNum = $(".lottery_num").val();   
        var metadata = 'act='+flag+'&lotteryNum='+that.lotteryNum+'&isDelvedWinners='+that.isDelvedWinners+'&access_token='+access_token;  
        $.ajax({
            type: 'GET',
            data: metadata,
            url: that.lotteryUrl,
            dataType: "jsonp",
            success: function(ret){
                that.lotteryTips= ret.msg;
                that.lotteryState = ret.code;
                that.lotteryCodeState(flag);

                if(ret.code === MTSDK.admin.CODE_SUCCESS){
                    if(ret.data === false){
                        return false;
                    }
                    that.lotteryStopCallback(ret);
                    return false;
                }else{
                    that.lotteryTips = ret.msg;
                    that.lotteryStopCallback(ret);
                }
            }
        });
    },

    //抽奖的状态
    lotteryCodeState: function(flag){    
        var that = this;
        //上课的情况下
        if(MT.getLiveState()!= "wait" && that.lotteryState==0){
            if(flag == "start"){
                that.lotteryFlag = true;
                var $tg = $(".lun_lottery .active");
                $tg.val("抽中奖人").removeClass("active").addClass("loting");
                $(".lotip").show();
                setTimeout(function(){
                    $tg.val("抽中奖人").removeClass("loting active").addClass("stop");
                },1500);
                window.sessionStorage.setItem("lottery", "start");
            }else{
                that.lotteryFlag = false;
                $(".start_lottery_btn .stop").val("开始摇奖").removeClass("stop").addClass("active");
                window.sessionStorage.setItem("lottery", "stop");
            }
               
        } 
    },

    // 抽奖回调
    lotteryStopCallback: function(ret){
        var d = ret.data,
            that = MTSDK.admin.adminBox,
            i = 0,
            $cmd = $('#ht_admin_box'),
            $list = $cmd.find("#lottery_list ul"),
            $li = '';
        var nicknames = that.lotteryWinners(d);    
        if(d.length > 0){
            $li += '<li><p>中奖人：<strong>'+nicknames+'</strong></p><div class="t_u"><span>'+d[i].launch_nickname+'('+d[i].time+')</span></div></li>';
        }else{
            //操作结束
            $(".lun_lottery").popBox({
                title:"",
                width: 200,
	            height: 83,
	            left: 130,
	            top: 110,
                disclose: true,
                overlay: true,
                content: '<div class="mod_pop_ct"><div class="d_hd">提示</div><div class="d_bd"><p>'+that.lotteryTips+'</p></div></div>',
                callback: function(){
                    setTimeout(function(){
                        $('body').popboxCloseAll();
                        $(".lotip").hide();
                    }, 1500);
                }

            });
            $(".lun_lottery").find(".lo_btn").html("开始摇奖").addClass("active");
            return false;
        }
        setTimeout(function(){
            $list.prepend($li);
            $(".lotip").hide();
            $(".lun_lottery").find(".lo_btn").html("开始摇奖").addClass("active");
        }, 200);
    },

    // 发起
    emitLottery: function(){
    	var that = MTSDK.admin.adminBox;
        if($(".lottery_num").val() == ""){
            $(".lottery_tips").show();
            setTimeout(function(){
                $(".lottery_tips").hide();
            },2000);
            return;
        }
        if(!MTSDK.admin.adminBox.customCallBack('lotterStartFlag')) {
            return false
        }
        that.postLottery("start");

       /* $(this).html("抽中奖人").removeClass("active").addClass("loting");
        var $tg = $(this);
        $(".lotip").show();
        setTimeout(function(){
            $tg.html("抽中奖人").removeClass("loting active").addClass("stop");
        }, 1500);
        window.sessionStorage.setItem("lottery", "start");*/
    },
    // 停止
    stopLottery: function(){
        var that = MTSDK.admin.adminBox;
        if (!MTSDK.admin.adminBox.customCallBack('lotteryStop')) {
            return false
        }
        that.postLottery("stop");
        $(".lotip").hide();
        $(this).html("开始摇奖").removeClass("stop").addClass("active");
        window.sessionStorage.setItem("lottery", "stop");
    },

        /*是否勾重复抽取中奖人*/
    isCheckLotteryer: function(callback){
        var that = MTSDK.admin.adminBox;
        if(that.lotteryFlag){
            return;
        }
        if($(this).hasClass("checked")){
            $(this).removeClass("checked");
            that.isDelvedWinners = 1;  
        }else{
            $(this).addClass("checked");   
            that.isDelvedWinners = 0;  
        }
    },

    /*抽取中奖人的个数限制*/
    lotteryerLimit: function(){
        var num =  $(".lottery_num").val();
        var patrn =  /^([1-9]||10)$/ig;
        if(!patrn.test(num)) {
            if(num>10){
                 $(".lottery_num").val("10");
            }else{
                 $(".lottery_num").val("1");
            }
            
        }
    },

    // 获取抽奖列表
    getLottery: function(){
    	var that = MTSDK.admin.adminBox;
        $.ajax({
            type: 'GET',
            data: 'act=history&access_token='+window.access_token,
            url: that.lotteryUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MTSDK.admin.CODE_SUCCESS){
                    that.setLottery(ret);
                }
            }
        });
    },

    //所有中奖人
    lotteryWinners: function(ret){
        var d= ret,
            winners= '';//中奖人
        for(var i = 0;i<d.length;i++){
            if(i==(d.length-1)){
                winners+= d[i].nickname;
            }else{
                winners+= d[i].nickname+"、";
            }
            
        }; 
        return winners;
    },

    // 渲染抽奖列表
    setLottery: function(ret){
        var that = this;
        var nicknames = that.lotteryWinners(ret);
    	var lotterylist = template("tpl_lottery_list", ret);
    	$("#lottery_list").html(lotterylist);
    },

    /**
     * 自定义广播(公共广播信息，可持久显示)
     */
    diyBroadcastInit: function(){
        var that = this;
        $("#ht_admin_box").find(".cmod").hide();
        $("#ht_admin_box .mod_broadcast").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
        //that.getBroadVals();
    },

    //用户列表界面
    popUserList: function(){
        var that = this;
        $("#ht_admin_box").find(".cmod").hide();
        $("#ht_admin_box .mod_user_list").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
        that.userList();
    },
    // 取值
    getBroadVals: function(){
        var vals = {
            message: $.trim($(".mod_broadcast .pub_note_area").val()),
            __auto: $(".mod_broadcast .is_keep").is(":checked") ? "1" : "0"
        };
        return vals;
    },
    // post广播
    broadcastPost: function(){
        var vals = MTSDK.admin.adminBox.getBroadVals();
        if(!MTSDK.admin.adminBox.customCallBack('broadcastFlag')) {
            return false
        }
        if(vals.message.length > 0){
            $.ajax({
                method: "GET",
                url: MTSDK.admin.adminBox.broadCastUrl,
                data: {
                    access_token: window.access_token,
                    act: "send",
                    __auto: vals.__auto,
                    message: encodeURIComponent(vals.message)
                },
                success: function(ret){
                    if(ret.code == 0){
                        $(".mod_broadcast .tips").show();
                        setTimeout(function(){
                            $(".mod_broadcast .tips").hide();
                        }, 1500);
                    }
                }
            });
        }
    },

    /*用户列表*/
    userList: function(){
        $("#user_list").empty(); 
        $(".search_input input").val(""); 
        var that = this;
        $.ajax({
            type: 'GET',
            data: 'access_token='+window.access_token+'&act=info',
            url: MTSDK.admin.adminBox.userListUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret){
                    if(ret.code == 0){
                        MTSDK.admin.adminBox.isClickSearch = false;
                        var userTmp= template("tpl_user_list",ret); 
                        $("#user_list").append(userTmp);
                        pagination.page.userInit(ret.total); 
                        $(".user_back").hide();
                    }
                }    
                
            }
        });
    },

    //显示用户列表中管理弹框
    showUserBox: function(){
        var xid = $(this).data("xid");
        var that = this;
        var pleft = $(this).offset().left-65,
            ptop =  $(this).offset().top+10;
            var chat = $("#member_"+xid).data("chat");    
        $(this).popBox({
            /*top: ptop,
            left: pleft,*/
            content: template("tpl_user_pop_menu"), //tpl_admin
            callback: function(){
                $(".mod_popbox_con").css({
                     left: pleft,
                     top: ptop
                });
                 $(".admin_list").css({
                     left: pleft,
                     top: ptop
                });

                
                // 解绑事件
                $("#ht_pop_box").off();
                $(".pop_side_operation").off();
                if(chat== 0){//解除禁言
                    //将解禁的用户从对象中删除掉
                    var  banUserXids =  JSON.parse(sessionStorage.getItem("banUserXids"));
                    delete banUserXids[xid];
                    sessionStorage.setItem("banUserXids",JSON.stringify(banUserXids));
                    $(".admin_list .gagStatus").html("解除禁言");  
                    $(".admin_list .gagStatus").data("op","enableGag"); 
                }else{//禁止发言
                    var  banUserXids =  JSON.parse(sessionStorage.getItem("banUserXids"));
                    if(banUserXids){
                        MTSDK.admin.adminDo.banUserXids = banUserXids;
                    }
                    //存储被禁言的用户xid集合
                    if(!MTSDK.admin.adminDo.banUserXids[xid]){
                        MTSDK.admin.adminDo.banUserXids[xid] = xid;
                        sessionStorage.setItem("banUserXids",JSON.stringify(MTSDK.admin.adminDo.banUserXids));
                    }
                    $(".admin_list .gagStatus").html("禁止发言"); 
                    $(".admin_list .gagStatus").data("op","chatAccess"); 
                }
                $(".admin_list .gagStatus").data("xid",xid);
                // 踢出房
                $(".pop_side_operation").find("li").on("click", function(){
                    var key = $(this).data("op"),
                        user = {
                            xid: xid
                        };
                    // 操作导航
                    MTSDK.admin.operation.operationNav(key, user);
                    $(this).popboxCloseAll();
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
    },

    //用户搜索
    userSearch: function(){
        var that = this;
        var str = "";
        var val = $(".search_input input").val();
        var op = $(".user_search .search_title").data("op");
        if(op == 0){//通过用名搜索
            str= '&name='+encodeURIComponent(val); 
        }else{//通过用户ID搜索
            str= '&uid='+encodeURIComponent(val) 
        }
        $.ajax({
            type: 'GET',
            data: 'access_token='+window.access_token+'&act=info'+str,
            url: MTSDK.admin.adminBox.userListUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret){
                    if(val != ""){
                       $(".user_back").show();
                    }  
                    if(ret.code == '-1'){
                        $("#user_list").html("<p class='result_msg'>没有找到此用户，请检查用户名或用户ID是否正确！</p>");
                        return;
                    }
                    if(ret.code == 0){
                        $("#user_list").empty();
                        MTSDK.admin.adminBox.isClickSearch = true;
                        var userTmp= template("tpl_user_list",ret); 
                        $("#user_list").append(userTmp);
                        pagination.page.userInit(ret.total);
                    }
                }    
                
            }
        });
    },
    //禁言列表
    gagManagerList: function(){
    	var that = MTSDK.admin.adminBox;
    	var that = this;
        $(".gag_pop").remove();
        var gagTpl = template("gag_mod_pop");
        $("#ht_admin_box").append(gagTpl);
        $(".gag_pop").css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
        var gagList = "";
        $.ajax({
            type: 'GET',
            data: 'access_token='+window.access_token+'&act=disableList',
            url: that.gagListUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret){
                   if(ret.code == 0){
                        $("#gag_total").html(ret.total);
                        for(var i = 0; i < ret.data.length; i++){
                            // 读取模版
                            gagList += that.gagUsers(ret.data[i], i);

                          }
                        $("#gag_list").append(gagList);
                    } 
                }    
                
            }
        });

    },

    thirdPage : function(){
        var that = this,
            ifr = document.createElement('iframe'),
            url;
        if(!this.isLoadThirdIframe) {
            this.isLoadThirdIframe = true;
            ifr.style.width = '100%';
            ifr.style.height = '100%';
            ifr.style.border = 'none';
            ifr.onload = function(){
                
            }
            try{
                url = JSON.parse(window.thirdPage).url
                if(!url) {
                    return false;
                }
            }catch(err){
                // throw err;
                console.error('thirdPage格式错误')
                return false;
            }
            ifr.src = url;
            ifr.name = 'third_page';
            ifr.id = 'thirdPageIframe';
            $('#ht_admin_box #mbox_bd').append(ifr);
        }
        $("#ht_admin_box").find(".cmod").hide();
        $("#ht_admin_box .mod_third_page").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
    },

    // 禁言列表模板
    gagUsers: function(ret,i){
        var d = ret;
        // data
        var data = {
            d: ret
        };
        var gagTpl = template("tpl_gag_list", data);
        return gagTpl;
    },

    questionEvents: function(res){
        var that = this;
        switch(res.type){
            // 其他助教回复中
            case 'question:update':
                that.updateQuestionStatus(res);
                break;
            // 问答列表初始化
            // case 'question:initialization':
            //     that.question_rander(res);
            //     break;
        }
    },

    addAsk: function(res){
        var d = res,
            tpl = '';

        d.time = HTSDK.tools.convertTimestamp(d.time);
        tpl += template("question_management_content", d);
        if($(".question_management_content").children().first().length>0){
            $(tpl).insertBefore($(".question_management_content").children().first());
        }else{
            $(".question_management_content").append(tpl);
        }
        $('#question_post_detail').val('');
    },

    addReply: function(res){
        var d = res,
            tpl = "",
            repData = {
                d: d,
                time: HTSDK.tools.convertTimestamp(d.time),
                avatar: HTSDK.room.setAvatar(d),
            },
            tpl = template("mod_ques_answer", repData),
            id = "#queManage_"+ res.replyId,
            status_id = "#status_"+ res.replyId;

        $(status_id).addClass('hidden');
        $(id).find(".u_say").append(tpl);
        // 重置状态
        $("#question_post_detail").attr("placeholder", "请输入文字...");
        $(".comfirm_question_post").attr("data-rid", "0");
        $(".comfirm_question_post").attr("data-type", "ask");
        $("#question_post_detail").removeAttr("data-rid");
    },
    updateQuestionStatus: function(res){
        if(res){
            if(res.inputing){
                // 来自socket的数据判断如果是从助教自身发出的信息不执行
                if(res._xid == MT.me.xid){
                    return
                }
                var id = "#status_" + res.rid;
                $(id).addClass("replaying").text("回复中");
                // 已经有助教回复过
                if($(id).hasClass('replied')){
                    $(id).removeClass('hidden');
                }
            }
            if(!res.inputing){
                var id = "#status_" + res.rid,
                    parent_id = "#queManage_" +res.rid;
                if($(parent_id).find(".replier").length>0){
                    $(id).addClass('hidden');
                }
                else{
                    $(id).removeClass("replaying").text("未回复");
                    // 已经有助教回复过
                    if($(id).hasClass('replied')){
                        $(id).addClass('hidden');
                    }
                }
            }
        }
    },
    // question_rander: function(res){
    //     var _data = res.data,
    //         i= "",
    //         tpl= "";
    //     for(i in _data){
    //         var questionData= {
    //             avatar: _data[i].avatar,
    //             chat: _data[i].chat,
    //             content: _data[i].content,
    //             course_id: _data[i].course_id,
    //             gid: _data[i].gid,
    //             liveid: _data[i].liveid,
    //             nickname: _data[i].nickname,
    //             qid: _data[i].qid,
    //             replies: _data[i].replies,
    //             replyId: _data[i].replyId,
    //             role: _data[i].role,
    //             sn: _data[i].sn,
    //             status: _data[i].status,
    //             time: HTSDK.tools.convertTimestamp(_data[i].time),
    //             uid: _data[i].uid,
    //             xid: _data[i].xid
    //         }
    //         if(_data[i].answer){
    //             questionData.answer = [];
    //             _data[i].answer.forEach(function(item, index){
    //                 var item_data = "",
    //                     j= "",
    //                     answer_data= {};
    //                 for(j in item){
    //                     answer_data[j]= item[j]
    //                 }
    //                 answer_data.time = HTSDK.tools.convertTimestamp(answer_data.time),
    //                 questionData.answer.push(answer_data)
    //             })
    //         }
    //         tpl += template("question_management_content", questionData);
    //     }
    //     $(".question_management_content").html(tpl);
    // },
    // 问答管理
    questionManagement: function(_page){
        var that = this;
        $(".question_management").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
        // 实时反馈该助教正在"回复中"的状态让其他助教获取
        var _MT = MTSDK.admin._MT;
        $("#question_post_detail").on("focus", function(){
            var rid = $(this).attr("data-rid");
            if(typeof rid != 'undefined'){
                _MT.emit('sys:bro', {cmd:'question:update', args:{"type": "question:update", 'inputing': true, "rid": rid, "_role": MT.me.role, "_xid": MT.me.xid}}, function(){

                });
            }
        });
        $("#question_post_detail").on("blur", function(){
            var rid = $(this).attr("data-rid");
            if(typeof rid != 'undefined'){
                _MT.emit('sys:bro', {cmd:'question:update', args:{"type": "question:update", 'inputing': false, "rid": rid}}, function(){

                });
            }
        });

        // textarea 输入时改变发送按钮的颜色状态
        $("#question_post_detail").on("input", function(){
            if($(this).val().length > 0){
                $(".comfirm_question_post").addClass('active')
            }else{
                $(".comfirm_question_post").removeClass('active')
            }
        });

        $.ajax({
            type: 'GET',
            data: {
                //通用别的接口，其实不需要传时间，写死
                start_duration: 0,
                end_duration: 86400,
                // 有用字段
                access_token: window.access_token,
                page: _page?_page:1,
                rows: 8
            },
            url: '//open.talk-fun.com/live/questions.php',
            dataType: "jsonp",
            success: function(response){
                if(response.code === 0){
                    if(response.count > 8){
                        $(".quest_page").removeClass('hidden');
                    }
                    this.res = response;
                    pagination.page.question_rander.call(this);
                    pagination.page.questionPageInit.call(this);
                }
            }
        });
    },

	// 盒子路由(app管理)
	AppBoxRouter: function(){
        var that = MTSDK.admin.adminBox,
            pid = $(this).data("pid");
        that.hidePop();
        //选择应用
        switch(pid){
        	// 投票
            case "vote":
                MTSDK.admin.vote.voteInit();
                break;
            // 公告
            case "notice":
                that.noticeInit();
                break;
            // 滚动通知
            case "pubroll":
                that.rollNoticeInit();
                break;
            // 抽奖
            case "lottery":
                that.lotteryInit();
                break;
            // 课件管理
            case "resfile":
                that.resFileInit();
                break;
            // 自定义广播
            case "diy_broadcast":
                that.diyBroadcastInit();
                break;
            //禁言管理
            case "gag_manager":
                that.gagManagerList();
                break;  
            //用户管理
            case "user_list":
                 that.popUserList();
                 break;
            //签到管理
            case "sign":
                MTSDK.admin.callName.init();
                break;
            case "third_page":
                that.thirdPage();
                // alert('dfsfs')
                break;
            case "question_management":
                that.questionManagement();
                break;
        }
        clearInterval(MTSDK.admin.callName.defaluts.callBackRequest);
        clearInterval(MTSDK.admin.callName.defaluts.recordTimer);
        MTSDK.admin.callName.defaluts.isRefreshCallList = false;
    },
    // ppt预览
    pptPreView: function(cmd, callback){
        var that = this,
            pptObj = MTSDK.admin.core.getpptUrl(cmd);
        that.pptObj = pptObj;

        //如果不是管理员的身份禁止发请求
        if(MT.me.role!= "admin" && MT.me.role != "spadmin"){
            return;
        }
        if(pptObj){
            if(that.pptUrl === pptObj.pptUrl){
                if(typeof callback === "function"){
                    pptObj.count = that.pptCount;
                    callback(pptObj);
                }
                return false;
            }
            that.pptUrl = pptObj.pptUrl;

            var datas = {
                act: "preview",
                access_token: window.access_token,
                url: pptObj.pptUrl
            }
            $.ajax({
                type: "GET",
                url: that.pptPreViewUrl,
                data: datas,
                dataType: "jsonp",
                success: function(retval){
                    if(typeof callback === "function" && retval.code == 0){
                        that.pptPreViewData = retval;
                        that.pptCount = retval.count;
                        pptObj.count = retval.count;
                        callback(pptObj);
                    }else{
                        return retval;
                    }
                }
            })
        }else{
            callback(false);
        }
    },
    // ppt模块渲染
    pptPreViewRender: function(callback){
        var that = this;
        if($("#ppt_preview_frame").size() > 0){
            var iframe = $("#ppt_preview_frame").get(0);
            callback(that.pptObj);
            if(that.pptObj){
                iframe.contentWindow.bridge(that.pptPreViewData, that.pptObj);
            }
            return false;
        }
        var frameUrl = protocol+"open.talk-fun.com/open/cooperation/common/plugins/ppt-preview/pptIframe.html";
        // create pptpreview iframe
        var iframe = document.createElement("iframe");
        iframe.src = frameUrl;
        iframe.id = "ppt_preview_frame";
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.className = "ppt_preview_frame";
        var popFrame = template("tpl_upload_file");
        $("#mod_ppt_preview").append(iframe);
        iframe.onload = function(){
            iframe.contentWindow.bridge(that.pptPreViewData, that.pptObj);
            if(callback){
                callback(that.pptObj);
            }
        }
    },
	// 事件绑定
	bindEvents: function(){
		var that = this;
		MT.tools.bindEvent(that.target, that, that.events);
	},
	// 渲染管理盒子
	renderAdminBox: function(){
        var ret = {};
        // 判断合作方ID(暂定部分合作商开放问答列表)
        if(window.partner_id == 20 || window.partner_id == 11625){
            ret.isShowQuestionBox = true;
        }
        else{
            ret.isShowQuestionBox = false;
        }

        ret.voteTitle = voteTitle;
		$("#admin_pop_box").html(template("tpl_admin_box",ret));
        //一起作业网隐藏抽奖和用户列表图标
        if(window.partner_id == "11386"){
            $(".it4").hide();
            $(".it8").hide();
        }
        
        // 大街s
        if(window.partner_id === "11265"){
            $(".it8").hide();
        }

        //尚德
        if(window.partner_id == "27"){
            $(".it9").hide();
        }
        if(MT.me.role === "admin"){
            $("#emit_chat_txt").attr("placeholder","请输入文字或粘贴截图发送聊天...");
        }


		$(".op_tools").append('<li id="adminbox" class="admin_box" title="助教管理">助教管理</li>');
		/*if(window.location.href.indexOf("admin") > 0){
			$(".op_tools").append('<li id="adminbox" class="admin_box" title="助教管理"></li>');
		}*/


        // if(window.thirdPage) {
        //     var url ;
        //     try {
        //         if(JSON.parse(window.thirdPage).url) {
        //             $('.third_page').show()
        //         }
        //     }catch(err) {
        //         console.error('thirdPage格式错误');
        //         return false;
        //     }
        // }


	},

	init: function(){
		this.getNotifies();
		this.renderAdminBox();
		this.bindEvents();
        MTSDK.admin.vote.bindEvents();
	}
};



//投票模块
MTSDK.admin.vote = {
    voteUrl: protocol + window.location.host+'/live/vote.php', //投票

    //用于判断投票的状态
    voteState: "start",//开始,end为结束

    // 目标
    target: $("body"),

    voteTimeUpdate: null,

    isLoad: false,

    type : 0,

    isUploadSuc: false,//上传是否成功

    typeLoad: false,

    voteType: "text_vote",//text_vote为文字投票，image_vote为图片投票

    defaluts:{
        baseIndex: 2,
        minSize: 2,
        maxSize: 10,
        imgUrl:"", //图片的url地址
        flag: false,
        checked: true,//公布结果前复选框是否选中false为不选中，true为选中
        curVote: {}, //当前投票对象
        opAry: [],//当前选项
        pubNum: 1,//0不公布，1公布结果，2公布答案和结果
        voteLetter: ["A","B","C","D","E","F","G","H","I","J"],
    },

    //投票初始化
    voteInit: function(){
        var that = this;
        MTSDK.admin.vote.getVoteList();
        $("#box_loading").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
    },


    bindEvents: function(){
        var that = this,
            _event = 'click', 
            $htAdminBox= $("#ht_admin_box");

            //跳转到发起投票界面
            $("#post_vote").on(_event,function(){
                that.launchVote();
            })

            //发起投票
            $htAdminBox.on(_event,".vote_form .confirm",function(){
                that.postVote();
            });

            //增加选项
            $htAdminBox.on(_event,".vote_form .vo_opto .add",function(){
                that.addVoteOption();
            });


            //删除选项
            $htAdminBox.on(_event,".vote_form .vo_opto .reduce",function(){
                that.reduceVoteOption();
            });

            //投票限制
            $htAdminBox.on(_event,".vote_form .selectMode label input",function(){
                that.voteTypeLimit($(this));
            });

            //
            $htAdminBox.on("blur",".vote_form .selectMode .limit .ipt",function(){
                that.mutipleLimt($(this));
            });

            //刷新
            $htAdminBox.on(_event,".lun_voting .post_tool .reload",function(){
                that.voteReload();
            });

            //查看详情
             $htAdminBox.on(_event,".mod_lanuch_vote .vo_list li",function(){
                that.$this = $(this);
                that.getVoteDetail();
            });


            //

            //结束投票 
            $htAdminBox.on(_event,".lun_voting .vote_btn",function(){
                that.voteEnd();
            });    

            //勾选复选框
            $htAdminBox.on(_event,"#vote_item_list .check_box",function(){
                that.checkVote($(this)); 
            });

            //显示投票结果
            $htAdminBox.on(_event,".vote_bottom a",function(){
                var vid = $(this).data("vid");
                that.getVoteResultDetail(vid);
            }); 


            //是否公布结果复选框是否选中
            $htAdminBox.on("click",".pub_check",function(){
                that.isChecked($(this));
            });
             //下拉框展开收缩
             $htAdminBox.on("click",".pub_input i",function(){
                that.toggleMneu();      
            });

            //选择要显示的项
            $htAdminBox.on("click",".pub_list li",function(){
                that.isPubvote($(this));
               
            });

            //勾选投票选项
            /*$htAdminBox.on('click','#select_items .check_box', function(event) {
                that.checkVote($(this));
            });*/
            

    },


    //获取投票结果
    getVoteResultDetail: function(vid){
        var _HT = HTSDK.room._HT,
            that = this;
        // 获取投票
        _HT.plugins("vote").getVoteDetail(vid,function(retval){

            retval.info.me_role = MT.me.role;
            that.showResultVote(retval);
        });
    },
    //投票结果显示
    showResultVote: function(ret){
        var that = this;
        ret.letter = this.defaluts.voteLetter;
        ret.voteTitle = voteTitle;

        that.switchWord(ret);
        var _tpl_showGetvote = template("show_vote_getvote", ret);
        HTSDK.plugins.popBox(_tpl_showGetvote);
    },

     //是否公布结果复选框是否选中
    isChecked: function($this){
        var that = this;
        if($this.hasClass("checked")){
            $this.removeClass("checked");
            that.defaluts.checked = false;
            that.defaluts.pubNum  = 0;
        }else{
            $this.addClass("checked");
            that.defaluts.pubNum  = 1;
            that.defaluts.checked = true;
        }     
    },

    //下拉框展开收缩
    toggleMneu: function(){
        var that = this;
        if(that.defaluts.flag){
            $(".pub_list").hide();
            that.defaluts.flag = false;
        }else{
            $(".pub_list").show();
            that.defaluts.flag = true;
        }
    },

    // 是否公开投票结果
    isPubvote: function($this){        
        var val = $this.data("val"),
            that = this;
        $("#pub_result").data("val",val);
        $("#pub_result").html($this.html());
        $(".pub_list").hide();
        if(that.defaluts.checked){
            that.defaluts.pubNum = val;
        }    

        that.defaluts.flag = false;
    },



    // 获取投票
    getVoteList: function(){
        //getDatalist
        var that = MTSDK.admin.vote,
            dataList = {};
        $.ajax({
            type: 'GET',
            data: 'access_token='+window.access_token+'&action=getVoteEvent',
            url: that.voteUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MT.CODE.SUCCESS){
                    that.setVoteList(ret);
                }
            }
        });
    },


    voteReload: function(){
        var vid = MTSDK.admin.adminBox.vid;;
        $("#box_loading").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
        MTSDK.admin.vote.getVoteDetail(vid);
    },


    // 设置投票(数据列表)
    setVoteList: function(ret){
        ret.voteTitle = voteTitle;
        var voteList = template("tpl_get_votelist", ret);
        $(".mod_lanuch_vote .cmvt").hide();
        $("#box_loading").hide();
        $("#admin_pop_box .mod_lanuch_vote").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
        $("#admin_pop_box .lun_vote .vo_list").html(voteList);
        $("#admin_pop_box .lun_vote").show();
        $("#ht_admin_box .mbox_hd .back").data("history", 0);
    },


    // 发起投票
    launchVote: function(){
        var that  =  this;
        $(".mod_lanuch_vote .cmvt").hide();
        $(".mod_lanuch_vote .lun_post").show();
        $(".lun_post .tare").removeClass("img_vote");
        $(".lun_post .uploader").addClass("hidden");
        $("#vote_link").html("上传图片"+voteTitle);
        $("#vote_link").data("type","image_vote");
        that.defaluts.imgUrl = 'text_vote';

        $("#ht_admin_box .mbox_hd .back").data("history", "1");
        that.clearStyle();
        that.radioValue();
        /*that.checkVote();*/
        if(!that.typeLoad){
            that.typeLoad = true;
            that.selectVoteType();
        }   
        
    },

   clearStyle: function(){
        $("#vote_item_list input").val("");
        $(".vo_theme textarea").val("");
        $("#vote_item_list .checked").removeClass("checked");
        /*$("#ht_admin_box input[type='radio']:eq(1)").attr('checked','');
        $("#ht_admin_box input[type='radio']:eq(0)").attr('checked','checked');*/
    }, 

    // 投票模式(限制)
    voteTypeLimit: function($this) {
        // TODO...
        var _target = $this,
            $lmget = $('#ht_admin_box .limit'),
            $optional = $('#ht_admin_box .limit .ipt'),
            limit = parseInt(_target.val(), 10);
        //mutiple
        if(limit == 1){
            $lmget.show();
            $optional.val(2);
            $optional.attr('disabled', false);
        }
        //single
        else{
            $lmget.hide();
            $optional.attr('disabled','disabled');
            $optional.val(1);
        }
    },
    // 极值
    mutipleLimt: function($this){
        var _ts = MTSDK.admin.vote,
            $target = $this,
            _tsVal = parseInt($target.val(), 10) || 2,
            _maxSize = _ts.defaluts.baseIndex+1;
        if(_tsVal > _maxSize){
            _tsVal = _maxSize;
        }else if(_tsVal < _ts.defaluts.minSize){
            _tsVal = _ts.defaluts.minSize;
        }
        $target.val(_tsVal);
    },


    // 发起投票(检查)
    postVote: function(){
        var that = MTSDK.admin.vote,
            optModel = {},
            param2json = '',
            anserjson = '',
            title = '',
            $cmd = $('#ht_admin_box'),
            $target = $cmd.find('.lun_post'),
            $iptel = $('#vote_item_list').find('input'),
            iptLen = $iptel.size();

        var isValidate = that.validatePostVote();
        //验证表单
        if(isValidate){
            // 节流，防止多次重复点击
            if(!MTSDK.admin.adminBox.customCallBack('voteFlag')) {
                return false
            }
            $("#box_loading").show().css({"left":HTSDK.movePop.defaults.box_position["left"],"top":HTSDK.movePop.defaults.box_position["top"]});
            //to-JsonString
            var xStr = '';
            for (var i = 0; i < iptLen; i++) {
                // opArray.push('"'+i+'":"'+$iptel.eq(i).val()+'"');
                if((iptLen-1) != i){
                    xStr += '"'+i+'":"'+$iptel.eq(i).val()+'",';
                }else{
                    xStr += '"'+i+'":"'+$iptel.eq(i).val()+'"';
                }
            };


            var answer =  that.getAnswer();
            if(that.voteType == "text_vote"){
                that.defaluts.imgUrl = "";
            }
            //url-Encode
            param2json = encodeURIComponent('{'+xStr+'}');
            anserjson = encodeURIComponent(answer);
            title = encodeURIComponent($target.find('.tare').val());
            //param
            optModel = {
                "title": title,
                "optional": $target.find('.limit input').val(),
                "options": param2json,
                "imageUrl" : that.defaluts.imgUrl,
                "answer" : anserjson
            };
            that.postVoteForm(optModel);
             //5秒刷新一次投票列表
            /*that.voteTimeUpdate = setInterval(function(){
               MTSDK.admin.vote.voteReload();
            },5000);*/
        }
    },

    // 验证投票表单
    validatePostVote: function(){
        var that = MTSDK.admin.vote,
            $cmd = $('#ht_admin_box'),
            $target = $cmd.find('.lun_post'),
            titleArea = parseInt($.trim($target.find('.tare').val()).length, 10),
            validateFlag = false;
        //title area
        if(titleArea === 0){
            $target.find('.tare').addClass('empty');
        }else{
            $target.find('.tare').removeClass('empty');
        }
        //验证表单
        if(titleArea > 0){
            validateFlag = true;
        }else{
            validateFlag = false;
        }
        //validate the input
        return validateFlag;
    },

    // 提交投票表单
    postVoteForm: function(optData){
        var that = MTSDK.admin.vote,
            opt = optData,
            dataList = {};
        $.ajax({
            type: 'GET',
            data: 'access_token='+window.access_token+'&action=addVoteEvent&title='+opt.title+'&type=1&optional='+opt.optional+'&op='+opt.options+"&imageUrl="+opt.imageUrl+"&answer="+opt.answer,
            url: that.voteUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MT.CODE.SUCCESS){
                    var vid = ret.vid;
                    //_ts.getVdetail(vid);
                    that.getVoteDetail(vid);
                }
            }
        });
    },


    // 获取投票详细
    getVoteDetail: function(_vid){
        //getDatalist
        var that = MTSDK.admin.vote,
             vid = 0;     
        if(_vid){
            vid = _vid;
        }else{
            vid = that.$this.data("vid");
        }   
        that.vid = vid;
        $.ajax({
            type: 'GET',
            data: 'access_token='+window.access_token+'&action=getVoteList&vid='+vid,
            url: that.voteUrl,
            dataType: "jsonp",
            success: function(ret){
                if(ret.code === MT.CODE.SUCCESS){
                    that.setVoteDetail(ret);
                    clearInterval(that.voteTimeUpdate);
                    if(ret.info.status == 1){
                        that.voteTimeUpdate = setInterval(function(){
                            that.getVoteDetail(ret.info.vid);
                        },5000);
                    }
                    
                   /* pagination.page.init(ret.total,vid);*///分页控件初始化
                }
            }
        });
    },


      //投票选项将数字转成大写字母
   /* getLetter: function(index){
        var voteLetter = ["A","B","C","D","E","F","G","H","I","J"];
        var letter = parseInt(index) - 1;
        return voteLetter[letter];
    },*/


      //投票选项将数字转成大写字母
    getLetter: function(index){
        var voteLetter = ["A","B","C","D","E","F","G","H","I","J"];
        var letter = parseInt(index) - 1;
        var vote_str = "";
        //liang
        for (var i = 0;i<index.length;i++) {
            if(index.length == 1 || index.length == i+1){
                vote_str +=voteLetter[index[i]-1];
            }else{
                vote_str +=voteLetter[index[i]-1]+"、";
            }
        }

        return vote_str;
    },

    setVoteDetail: function(ret){
        var that = this;
        //增加序号
        for (var i = 0; i < ret.statsList.length; i++) {
            ret.statsList[i].number = MTSDK.admin.vote.defaluts.voteLetter[i];

        }
        for(var i = 0; i< ret.user.length;i++){

            ret.user[i].option = that.getLetter(ret.user[i].option);
        }


        that.switchWord(ret);
        ret.user = ret.user.slice(0,6);
        ret.voteTitle = voteTitle;
        ret.choiceTitle = choiceTitle;
        var tplVoteDetail = template("tpl_vote_detail", ret); 
        $("#box_loading").hide();
        $(".mod_lanuch_vote .cmvt").hide();
        $("#ht_admin_box .mbox_hd .back").data("history", "1");
        $("#vote_detail").html(tplVoteDetail).show();  
        if(that.defaluts.checked){
            $("#ht_admin_box .pub_check").addClass("checked");
        }
        if(ret.info.imageUrl.length == 0){
            $("#ht_admin_box .vote_img").addClass("hidden");
            $("#ht_admin_box .chart_detail").removeClass("voting");
        }
    },



    //将数字转化成字母
    switchWord: function(ret){
        var answer = ret.info.answer.split(",");
        ret.info.rightAnswer = "";
        if(ret.info.answer.length > 0){
            for(var i = 0; i< answer.length;i++){
                if(answer.length == 1){
                     ret.info.rightAnswer = MTSDK.admin.vote.defaluts.voteLetter[answer[i]];
                }else if(answer.length>1){
                     ret.info.rightAnswer +=MTSDK.admin.vote.defaluts.voteLetter[answer[i]]+"、"; 

                }     
            }
        }else{
            ret.info.rightAnswer = "";
        }
        if(answer.length>1){
           ret.info.rightAnswer =  ret.info.rightAnswer.substr(0,ret.info.rightAnswer.length-1);
        }
    },


    voteEnd: function(){
        var that = MTSDK.admin.vote,
            vid = that.vid;
           /* isPubShow = that.isPubvote();*/
       /* clearInterval(that.voteTimeUpdate);  */
        //操作结束
        $("#ht_admin_box .mod_lanuch_vote").popBox({
            id: "end_vote_con",
            position: "",
            width: 200,
            height: 83,
            left: 130,
            top: 110,
            content: '<div class="mod_pop_ct"><div class="d_hd">提示</div><div class="d_bd"><p>确定结束本次投票？</p><div class="btns"><span class="sure">确定</span><span class="cancel">取消</span></div></div></div>',
            _binds: function(){
                var $id = $('.mod_popbox_con');
                //confirm
                $id.find('.cancel').on('click', function(){
                    $('body').popboxCloseAll();
                });
                //cancel
                $id.find('.sure').on('click', function(){
                    $id.find('.btns').html('操作中...');
                    MTSDK.admin.vote.voteState = "end";
                    that.postEndVote(vid);
                    clearInterval(MTSDK.admin.vote.voteTimeUpdate);  
                    $('body').popboxCloseAll();
                });
            },
            callback: function(){
                this._binds();
            }
        });
    },
    // 结束投票请求
    postEndVote: function(vid){
        var that = MTSDK.admin.vote,
            //opt = optData,
            isPub = 0,
            dataList = {};
            $.ajax({
                type: 'GET',
                data: 'access_token='+window.access_token+'&action=endVoteEvent&vid='+vid+'&publicVote='+that.defaluts.pubNum,
                url: that.voteUrl,
                dataType: "jsonp",
                success: function(ret){
                    if(ret.code === MT.CODE.SUCCESS){
                            that.setVoteDetail(ret);    
                    }
                }
            });
        
    },
    
    //获取正确答案选项值
    getAnswer: function(){
        var size = $("#vote_item_list .checked").size(),
            $checked = $("#vote_item_list .checked"),
            answer = [];  
        //有勾选正确答案    
        if(size > 0){
            $checked.each(function(){
                var id = $(this).attr("id").split("_")[1];
                answer.push(id-1);
                /*answer +='"'+(id-1)+'":"'+$("#voteid_"+id).val()+'",';  */  
            })
           /* answer = answer.substr(0,answer.length-1); */
        } 

        return answer;
    },

    // 增加选项f
    addVoteOption: function(){
        var _ts = MTSDK.admin.vote,
            $cmd = $('#ht_admin_box'),
            $target = $('#vote_item_list'),
            input = '';
        _ts.defaluts.baseIndex += 1;
        var index = _ts.defaluts.baseIndex+1;
        var letter = _ts.defaluts.voteLetter[_ts.defaluts.baseIndex];
        input += '<li><label>选项'+letter+':</label><div id="check_'+index+'" class="check_box"></div><div class="item_input"><input type="text" "/></div></li>';
        $target.append(input);
        _ts.opBtnToggle();
    },
    //减少选项
    reduceVoteOption: function(){
        var _ts = MTSDK.admin.vote,
            $cmd = $('#ht_admin_box'),
            $target = $('#vote_item_list'),
            $mutiEl = $cmd.find('.lun_post .limit .ipt'),
            $mutiVal = parseInt($mutiEl.val(), 10),
            $elen = ($target.find('input').length)-1;
        _ts.defaluts.baseIndex -= 1;
        $target.find('li').eq($elen).remove();
        // 不允许大于当前选项总数
        if($mutiVal > _ts.defaluts.baseIndex){
            $mutiEl.val(_ts.defaluts.baseIndex+1);
        }
        _ts.opBtnToggle();
    },
    // 统计选项
    opBtnToggle: function(){
        var _ts = MTSDK.admin.vote,
            $addbtn = $('#ht_admin_box .vote_form .vo_opto .add'),
            $reduce = $('#ht_admin_box .vote_form .vo_opto .reduce'),
            _inputItems = parseInt(_ts.defaluts.baseIndex+1, 10);
        if(_inputItems > 2 && _inputItems < _ts.defaluts.maxSize){
            $reduce.show();
            $addbtn.show();
            return;
        }else if(_inputItems <= 2){
            $reduce.hide();
            return;
        }else if(_inputItems === _ts.defaluts.maxSize){
            $addbtn.hide();
            return;
        }
    },


    //获取单选多选的值
    radioValue: function(){
        $(".selectMode").on("click","label input",function(){
             MTSDK.admin.vote.type = $(this).val(); 
             if($(this).val() == 0){
                $("#vote_item_list .check_box").removeClass("checked");
             } 
        });
    },

    //勾选投票选项
    checkVote: function($this){
        var that = this;
         /*$("#vote_item_list").on('click','.check_box', function(event) {  */
            var type = MTSDK.admin.vote.type;
            //单选限制
            if(type == 0){
                /**/
                //取消勾选
                if($this.hasClass("checked")){
                    $this.removeClass("checked");
                }
                //勾选
                else{
                    $("#vote_item_list .check_box").removeClass("checked");
                    $this.addClass("checked");
                }
            }
            //多选限制
            else if(type == 1){
                //取消勾选
                if($this.hasClass("checked")){
                    $this.removeClass("checked");
                }
                //勾选
                else{
                    var option_num = $(".limit .ipt").val(); 
                    var checked_num = $("#vote_item_list .checked").size();
                    //勾选的不能超过设置的选项
                    if(option_num > checked_num){
                        $this.addClass("checked");
                    }   
                }   


            }
        /*}); */
    },

    //选择投票类型，默认文字投票 
    selectVoteType: function(){
        var that = this,
            vote_type = "text_vote";
        $("#vote_link").on("click",function(){
            var type =  $(this).data("type");
            //图片投票
            if(type === "image_vote"){
                $(".lun_post .tare").addClass("img_vote");
                $(".lun_post .uploader").removeClass("hidden");
                $("#vote_img").attr("src","");
                vote_type = "text_vote";
                $(this).html("输入文字"+voteTitle);
                $(".webuploader-pick").html("上传图片");
                that.voteType = "image_vote";
                if(!MTSDK.admin.vote.isLoad){
                    that.initUploader();
                    MTSDK.admin.vote.isLoad = true;
                }
                
            }
            //文字投票
            else if(type === "text_vote"){
                $(".lun_post .tare").removeClass("img_vote");
                $(".lun_post .uploader").addClass("hidden");
                vote_type = "image_vote";
                that.voteType = "text_vote";
                $(this).html("上传图片"+voteTitle);
            }
            type =  $(this).data("type",vote_type);
        });

    },

    // 初始化Web Uploader
    initUploader: function(){
        var that = this;
        var uploader = WebUploader.create({

            // 选完文件后，是否自动上传。
            auto: true,

            // swf文件路径
            swf:'js/webuploader/Uploader.swf',

            // 文件接收服务端。
            server: protocol+'open.talk-fun.com/live/vote.php?action=uploadPic',

            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#filePicker',

             // 去重
            duplicate: true,

            method: "post",
            fileVal: "image",
            formData: {"access_token": window.access_token},

            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'jpg,png',
                mimeTypes: 'image/*'
            },

            thumb: {
                width: "80px",

                height: "60px",

                allowMagnify: false
            },

            compress: false,
        });

        uploader.on( 'beforeFileQueued', function( file ) {
            if(file.ext.toUpperCase()!="JPG" && file.ext.toUpperCase()!="PNG"){
                $("#msg_tips").html("请上传格式为jpg、png的图片");
                $("#msg_tips").removeClass("suc");
            }else{
                $("#msg_tips").html("上传中..."); 
                $(".webuploader-pick").html("上传中...");
                $("#msg_tips").html("");
                $(".webuploader-pick").addClass("load");
            }
        });
        //上传成功
        uploader.on( 'uploadSuccess', function( file,data) {
            $( '#'+file.id ).find('p.state').text('已上传');
            if(data.code == 0){
                that.defaluts.isUploadSuc = true;
                $("#msg_tips").html("上传中..."); 
                $(".webuploader-pick").html("上传中...");
                $("#msg_tips").html("");
                $(".webuploader-pick").addClass("load");
                that.defaluts.imgUrl = data.data.url;
                $("#vote_img").attr("src",data.data.url);
            }else if(data.code == 30){
                that.defaluts.isUploadSuc = false;
                $("#msg_tips").html("请上传2M以内，格式为JPG/PNG的图片");
                setTimeout(function(){
                    $("#msg_tips").html("");
                },2000);

            }else if(data.code == -1){
                that.defaluts.isUploadSuc= false;
                $("#msg_tips").removeClass("suc");
                $("#msg_tips").html(data.msg);
                setTimeout(function(){
                    $("#msg_tips").html("");
                },2000);

            }
        });
        //上传出错
        uploader.on( 'uploadError', function( file ) {
            $( '#'+file.id ).find('p.state').text('上传出错');
            $("#msg_tips").html("上传出错"); 
            that.defaluts.isUploadSuc = false;
            setTimeout(function(){
                $("#msg_tips").html("");
                $("#msg_tips").removeClass("suc");
            },2000);
        });
        //上传完成
        uploader.on( 'uploadComplete', function( file,data) {
           /* $("#msg_tips").html("上传完成");*/
            setTimeout(function(){
                if(that.defaluts.isUploadSuc){
                    $("#msg_tips").addClass("suc");
                    $("#msg_tips").html("上传完成");
                    $(".webuploader-pick").html("更改图片");
                }else{
                    $("#msg_tips").html("上传失败");
                    $(".webuploader-pick").html("上传图片");
                    $("#msg_tips").removeClass("suc");
                } 
                setTimeout(function(){
                    $("#msg_tips").html("");
                },2000);
                $(".webuploader-pick").removeClass("load");
            },1000);  
            $( '#'+file.id ).find('.progress').fadeOut();
            
        });
    },
}


// 网络选择
MTSDK.admin.chooseNetwork = {

    id: 1,//记先择的线路

    checkedKey: {},//运营商

    curretnKey: {},//确定

    initData:{},//初始化列表数据

    netObj : {},

    //渲染
    renderNetwork: function(){
        var that = this;
        if($("#net_cont").size() > 0){
            $('#net_cont').show();
            this.netWorkSelect();
            return false;
        }else{
            $("body").append(template("tpl_network_con"));
            this.netWorkSelect();
        }
    },
    //网络选择
    netWorkSelect: function(){
        var isLoad = false,
            that = this,
            $network = $(".network"),
            $netcont = $('#net_cont'),
            $netsel = $('.network_select'),
            $sure = $('.pop_foot .sure'),
            $cancel = $('.cancel'),
            $netclose = $('#net_close');
            //显示，获取网络运营商
            $netcont.show();
            if(isLoad){
                return false;
            }
            var lis = "";
            var isBuffer = null;
            // 获取运营商 & buffer
            MT.network.getOperators(function(ret){
                var data = ret.data || ret,
                    network = ret.network,
                    buffer = ret.buffer;
                isBuffer = buffer;
                if(!data){
                    return false;
                }
                for(var i=0 ; i<ret.data.length;i++){


                    if(ret.data[i].cur ==1){
                        that.initData = ret.data[i];
                        that.id = i+1;
                        that.netObj = ret.data[that.id-1];
                    }
                }
                that.netObj.route = that.id;

                var basePath = protocol+"static-1.talk-fun.com/open/cooperation/common/static/network/";

                that.netObj.basePath = basePath;
                 // 首次
                if($(".choice_net span").size() === 0){
                    //线路列表渲染
                    var routeListTmp = template("tpl_route_list",ret);
                    $(".choice_net").append(routeListTmp);  
                    var count = ret.data.length;
                    $(".choice_net").css({
                        width: count*80
                    })   

                    //网络运营商列渲染
                    var netListTmp = template("tpl_network_list",that.netObj);  
                    $('#net_sel').append(netListTmp);

                    $(".well_txt").parent().addClass("checked");

                }else{
                    if(that.curretnKey.id){
                        $("#net_sel").html("");
                        //网络运营商列渲染
                        var netListTmp = template("tpl_network_list",that.curretnKey.netObj); 
                        $('#net_sel').append(netListTmp);

                        $(".choice_net .route").removeClass("cur");
                        $("#buffer_mode span").removeClass("cur");
                        $("#buffer_"+that.curretnKey.buffer).addClass("cur");

                        $("#net_sel li").removeClass("checked");
                        $("#"+that.curretnKey.id+"").addClass("cur");
                        $("#"+that.curretnKey.key+"").addClass("checked");
                    }else{
                        $("#net_sel").html("");
                        $(".choice_net .route").removeClass("cur");
                        $("#route_"+that.netObj.route).addClass("cur");
                        //$("#buffer_mode span").removeClass("cur").eq(1).addClass("cur");
                        /*$("#net_sel li").eq(0).addClass("checked"); */  

                        var netListTmp = template("tpl_network_list",that.initData);  
                        $('#net_sel').append(netListTmp);
                        $(".well_txt").parent().addClass("checked");
                    }
                }
                
                //线路选择              
                $(".choice_net").on("click",".route",function(){
                    $(".choice_net .route").removeClass("cur");
                    $(this).addClass("cur");
                    $("#net_sel").empty();
                    that.id = $(this).attr("id").split("_")[1];
                    var sourceName = $(this).data("sourcename");
                    for(var i=0;i<ret.data.length;i++){
                        if(sourceName == ret.data[i].sourceName){
                            that.netObj = ret.data[i]
                            that.netObj.basePath = basePath;
                            that.netObj.route = that.id;
                        }
                    }
                    var netListTmp = template("tpl_network_list",that.netObj);  
                    $('#net_sel').append(netListTmp);

                    if(that.curretnKey.id){
                        $("#net_sel li").removeClass("checked");
                        $("#"+that.curretnKey.key+"").addClass("checked"); 
                    }else{
                        if($(this).index() != 0){
                            $("#net_sel li").removeClass("checked");
                        }
                    }

                });  

                // Buffer模式
                if(buffer){
                    buffer = buffer.buffer;
                    // buffer模式
                  /*  $('#net_sel').after('<div id="buffer_mode" class="buffer_mode"><p class="buffer_explain"></p><span data-buffer="0" data-explain="网速快可选择极速模式，优质体验">极速模式</span><span data-buffer="1" data-explain="网速慢可选择兼容模式，流畅观看">兼容模式</span></ul>');*/

                    // buffer模式选择
                  /*  $("#buffer_mode").find("span").each(function(i, e){
                        if($(e).data("buffer") == buffer){
                            $(e).addClass("cur");
                        }
                    });*/

                    // ip信息
                    var ipTpl = "<p>你的网络运营商<em>"+network.isp+"</em>IP<em>"+network.ip+"</em></p>";
                    $("#net_sel").after('<div class="mod_selfip_info">'+ipTpl+'</div>');
                }

                isLoad = true;
            }, 2);
            // $('.well_txt').parent().addClass('checked');
            var keyDefault = "auto",
                retVal = "1",
                __index = "0",
                buffer = "1", //默认为"1"
                _indexVal = "0";
            
            // 缓冲buffer
            $netcont.on("click", "#buffer_mode span", function(){
                buffer = $(this).data("buffer");
                $netcont.find("#buffer_mode span").removeClass("cur");
                $(this).addClass("cur");
            });

            // 提示tips
            $netcont.on("mouseenter mouseleave", "#buffer_mode span", function(e){
                var _explain = $(this).data("explain"),
                    $target = $(".buffer_explain");
                if(e.type === "mouseenter"){
                    $target.show().html(_explain);
                }else{
                    $target.hide().html("");
                }
            });

            //选择
            $netsel.on('click','li',function(){
                var index = $(this).index();
                    $(this).addClass("checked").siblings().removeClass("checked").addClass("unchecked");
                    keyDefault = $(this).data("key");
                    __index = $(this).index();
                    that.checkedKey[that.id]=  $(this).attr("id");
            });
            //确认选择
            $sure.on('click',function(){
                var obj = {
                    type: keyDefault,
                    buffer: buffer,
                    sourceName: $("#net_cont .cur").data("sourcename"),
                };

                if(!$("#net_sel li").hasClass("checked")){
                    $(".pop_foot .tip").show();
                    setTimeout(function(){
                        $(".pop_foot .tip").hide();
                    },5000);
                    return;
                }
                if(!isBuffer){
                    obj = keyDefault;
                }

                MT.network.setOperator(obj, function(ret){
                    if(ret === 0){
                        $netcont.hide();
                        retVal = "0";
                        _indexVal = __index;

                        if($("#net_sel .checked").attr("id")){
                            that.curretnKey.id = $(".choice_net .cur").attr("id");
                            that.curretnKey.key = $("#net_sel .checked").attr("id");
                            that.curretnKey.netObj = that.netObj;
                        }  
                        that.curretnKey.buffer = $("#buffer_mode .cur").data("buffer"); 
                    }
                });
            });
            //关闭
            $netclose.on('click',function(){
                $netcont.hide();    
                if(retVal == 1 ){
                   /* $netsel.find('li').removeClass("checked").eq(0).addClass("checked");*/
                }
                if(retVal == 0){
                    $netsel.find("li").eq(_indexVal).addClass("checked").siblings().removeClass("checked");
                }
            });
            $cancel.on('click',function(){
                $netcont.hide();
            });
    },
    //入口
    init:function(){
        //网络选择
        this.renderNetwork();
    }
};

//关键字
MTSDK.admin.bindKeywork = {
    //技术客服
    dragQdrop: function(){ 
    var _move=false;
    //鼠标离控件左上角的相对位置 
    var _x, 
        _y;
        $(".pop_top").mousedown(function(e){ 
            _move = true; 
            _x = e.pageX-parseInt($(".pop_qq").css("left")); 
            _y = e.pageY-parseInt($(".pop_qq").css("top")); 
        }); 
        $(document).mousemove(function(e){
            if(_move){ 
                var x = e.pageX-_x;//移动时鼠标位置计算控件左上角的绝对位置 
                var y = e.pageY-_y; 
                    $(".pop_qq").css({top:y,left:x});//控件新位置 
                    } 
                }).mouseup(function(){ 
                _move = false; 
            }); 
    },
    //解决方案窗口拖动
    dragAndDrop:function(){
    var _move=false;
    //鼠标离控件左上角的相对位置 
    var _x, 
        _y;
        $(".plan_top").mousedown(function(e){ 
            _move = true; 
            _x = e.pageX-parseInt($(".pop_plan").css("left")); 
            _y = e.pageY-parseInt($(".pop_plan").css("top")); 
        }); 
        $(document).mousemove(function(e){
            if(_move){ 
                var x = e.pageX-_x;//移动时鼠标位置计算控件左上角的绝对位置 
                var y = e.pageY-_y; 
                    $(".pop_plan").css({top:y,left:x});//控件新位置 
                    } 
                }).mouseup(function(){ 
                _move = false; 
            }); g
    },
    //渲染reder
    rederKey:function(){
        var ret = {};
        if($('.keyword_cont').size() > 0){
            return false;
        }else{
            //关键字提醒
            $("#mode_chat_post").append(template("tpl_prompt_con"));
            
            //defalut _模板
            $("#mod_chat_post").append(template("tpl_prompt_con"));

            ret.url = qaUrl;
            //解决方法
            $("body").append(template("tpl_solve_con",ret));
        }
    },
    //关键字查询绑定
    targetKey: function(key){
        var $quesTxt = key,
            flag = false;
        var regx = /卡|断断续续|看不到|看不清|听不清|画面|延迟/g;
            if(regx.test($quesTxt)){
                flag = true;
            }
        return flag;
    },
    renderTargetKey: function(){
        if(!MTSDK.admin.isAdmin()){
            $('.keyword_cont').show();
            setTimeout(function(){
                $('.keyword_cont').hide();
            },15000);
        }
    },
    keywordEvent:function(){
        var $no_btn = $('.no_btn'),
            $pop_QQ = $('.pop_QQ'),
            $pop_plan = $('.pop_plan'),
            $refresh = $('#refresh'),
            $kw_close = $('.kw_close'),        
            $clear_brower = $('#clear_brower'),
            $keyword_cont = $('.keyword_cont'),
            $yesBtn = $('.keyword_cont .yes_btn'),
            $plan_qq = $('.pop_plan #plan_qq'),
            $plan_close = $('.pop_plan_close'),
            $qq_close = $('.pop_qq_close'),
            $plan_net = $('.pop_plan #plan_network');

            //开启解决方案
            $yesBtn.on('click',function(){
                $pop_plan.show();
                $('.keyword_cont').hide();
                MTSDK.admin.bindKeywork.dragAndDrop();
            });

            //开启选择网络
            $plan_net.on('click',function(){
                $('.network').trigger("click");
                $('.tools_toggle_network').trigger('click');
            });

            //开启联系技术QQ支持
            $plan_qq.on('click',function(){
                $('.pop_qq').show();
                MTSDK.admin.bindKeywork.dragQdrop();
            });

            //开启刷新
            $refresh.on('click',function(){
                location.reload();
            });

            //关闭
            $plan_close.on('click',function(){
                $('.pop_plan').hide();
            });

            $qq_close.on('click',function(){
                $('.pop_qq').hide();
            });

            $kw_close.on('click',function(){
                $('.keyword_cont').hide();
            });
            $no_btn.on('click',function(){
                $('.keyword_cont').hide();
            });
    },

    init:function(){
        this.rederKey();
        this.keywordEvent();
    }
};

// 评分系统
MTSDK.admin.score = {
    //课程评分
    setScore : function(){
        var minScore = [0, 0, 0];
        var EC_SUCCESS = 0;
        var _ts = this,
            scoreAry = [],
            $roomPop = $('.pop_score_con'),
            $scorePop = $roomPop.find('.sc_bd'),
            $scoreClose = $roomPop.find('.pop_score_con .cls_btn'),
            $target = $('#mod_score_rule'),
            $stoTeacher = $scorePop.find('.speak_to_teacher'),
            $scroreTip = $scorePop.find('.pop_sc_tip'),
            $popVoice = $('#pop_voice_v2');

        //cancle bind event
        $scoreClose.off('click');
        $scorePop.find('.post_from').off('click');
        $stoTeacher.val('');

        //pop hide
        var popHide = function(){
            $roomPop.hide();
            //$roomCover.hide();
            $scorePop.hide();
            $popVoice.hide();
            $scroreTip.hide();
        };
        //first hide 
        //$scroreTip.hide();
        //$roomPop.show();
        //$roomCover.show();
        //$scorePop.show();

        //scoreShowTips
        var scoreShowTips = function(tips){
            var len = tips.length;
            for (var i = 0; i < len; i++) {
                if(tips[i] === 0){
                    $target.find('dl').eq(i).find('.tip').show();
                }else{
                    $target.find('dl').eq(i).find('.tip').hide();
                }
            };
        };

        //set Score binds
        $target.find('dl').each(function(i, el){
            //cur el index
            var theCurIndex = i;
            //set init
            $(this).find('.cur_start').hide();
            $(this).find('.cur_start').css('width',1+'%');
            //cur score value
            scoreAry[theCurIndex] = 0;
            //countDown the minScore
            //set the curStart bar
            $(el).find('.start_cover').hover(function(e){
                $(this).find('.cur_start').hide();
            },function(e){
                $(this).find('.cur_start').show();
            });
            //hover star
            $(el).find('.score_lv').hover(function(){
                var index = $(this).index();
                //pop_detail text
                var pop_detail = [];
                pop_detail[0] = [
                    '照本宣科',
                    '简单无趣',
                    '传统朴实',
                    '活泼生动',
                    '丰富多彩'
                ];
                pop_detail[1] = [
                    '脱离实际',
                    '教条刻板',
                    '深入浅出',
                    '注重启发',
                    '开拓思维'
                ];
                pop_detail[2] = [
                    '浪费时间',
                    '听不太懂',
                    '普普通通',
                    '学有所得',
                    '太棒了！获益匪浅，思考良多'
                ];
                
                //设置文案
                $(el).find('.tip').html(pop_detail[theCurIndex][index-1]);

                //each start effect
                $(el).find('.score_lv').each(function(item, e){
                    if(index > item){
                        $(e).addClass('cur');
                    }
                });
            },function(){
                var index = $(this).index();
                //each star effect
                $(el).find('.score_lv').each(function(item, e){
                    if(index > item){
                        $(e).removeClass('cur');
                        if( !$(e).find('.cur_start').hasClass('them')){
                            $(e).parents().find('.tip').html("");
                        }
                    }
                });
            });

            //click & choose the score
            $(el).find('.score_lv').on('click' ,function(){
                //param
                var scoreNum = $(this).data('score'),
                    sid = $(this).parent().data('sid'),
                    index = $(this).index();
                //precent
                var precent = parseInt(scoreNum*20);
                $(el).find('.cur_start').css('width', precent+'%');
                $(el).find('.cur_start').addClass('them');
                //set the postScore value @rule:30 30 80
                if(sid < 3){
                    scoreAry[theCurIndex] = scoreNum*6;
                }else{
                    scoreAry[theCurIndex] = scoreNum*8;
                }

                //set the tips
                //$target.find('dl').eq(theCurIndex).find('.tip').hide();
                //minScore = scoreAry[0]+scoreAry[1]+scoreAry[2];
                minScore[theCurIndex] = 1;

            });
        });
        
        //post the score
        $scorePop.find('.post_from').on('click', function(){
            var lessScore = (minScore[0]+minScore[1]+minScore[2]);
            if(lessScore < 3){
                scoreShowTips(minScore);
                return false;
            }else{
                //is the score model enable
                //send post
                var speak_tech_textarea = encodeURIComponent($.trim($stoTeacher.val())),
                    $tip = $('.pop_score_con .pop_sc_tip'),
                    //param
                    metadata = 'access_token='+access_token+'&contentScore='+scoreAry[0]+'&methodScore='+scoreAry[1]+'&effectScore='+scoreAry[2]+'&msg='+speak_tech_textarea;
                $.ajax({
                    type: 'GET',
                    url: protocol+'open.talk-fun.com/live/score.php',
                    data: metadata,
                    dataType: 'jsonp',
                    success: function(ret){
                        if(typeof ret !== "undefined"){
                            // ret.code = 0;
                            $tip.show();
                            $tip.find('.ico_tip').removeClass();
                            // ret.code = 0;
                            if(ret.code === EC_SUCCESS){
                                $tip.find('span').addClass('suc');
                                $tip.find('p').html('评分成功!');
                                $tip.find('.resc').hide();
                                setTimeout(function(){
                                    //popHide();
                                    $(".pop_score_con").hide();
                                    $(".pop_sc_tip").hide();
                                },1500);
                            }else if(ret.code == -1){
                                $tip.find('span').addClass('fail');
                                $tip.find('p').html(ret.msg);
                            }else if(ret.code == 12000){
                                $tip.find('span').addClass('fail');
                                $tip.find('p').html(ret.msg);
                                $tip.find('.resc').hide();
                                setTimeout(function(){
                                    //popHide();
                                    $(".pop_score_con").hide();
                                },1500);
                            }else{
                                $tip.find('span').addClass('fail');
                                $tip.find('p').html(ret.msg);
                                $tip.find('.resc').show();
                                $tip.find('.resc').on('click', function(){
                                    $tip.hide();
                                });
                            }
                        }
                    }
                });
            }
        });
    },

    //入口
    init: function(){
        var that = this;
        //that.bindEvents();
        that.setScore();
    } 
};


//点名
MTSDK.admin.callName = {
    singUrl: '//open.talk-fun.com/live/sign.php', //发起点名接口

    defaluts: {
        launch_duration: 60, //发起的时长
        isLoad : false,//用于判断只初始化一次
        iscallend: true,//用于判断点名是否结束
        timer: null,
        page: 1, //默认为1页
        total: 0,//总条数
        signId : "",//签名id
        tepIsLoad: false,
        isRefreshCallList: false,
        callBackRequest: null,
        recordTimer: null,
        isPaginationInit: false
    },

    /*
    *@type 请求类型
    *@jsonData 请求参数
    *@requrl 请求url
    *@callback 回调函数
    */
    //公共ajax请求
    ajaxRequest: function(type,jsonData,requrl,callback){
        $.ajax({
            url: requrl,
            method: type,
            data: jsonData,
            dataType: "jsonp",
            success: function(data){
                if(data.code == 0){
                    callback(data);
                }  
            },
            error: function(){

            }
        })
    },

    //显示点名弹框
    showCallPop: function(callback){
        var that = this;
        $(".tpl_call_pop").show();
        $(".tpl_call_pop").remove();
        //只初始化一次
        if(!that.defaluts.isLoad){
            var callTemp = template("tpl_call_name");
            $("#ht_admin_box").append(callTemp);
            if(MT.getLiveState() === "start"){
                $("#call_list").empty();
                $(".call_btn").removeClass("disabled");
            }else{
                $(".call_btn").addClass("disabled");
            }
            that.defaluts.isLoad = true;
            that.getCallRecord();
            //回调
            callback(this);
        }
    },


    //签到列表分页
    callDetailPagination:function(total,status){
        var that = this;
        if(total == undefined){
            $("#usersign_pagination").hide();
        }
        var pageCount =  Math.ceil(total/8);
        if(pageCount == 1|| total == 0){
            $("#usersign_pagination").hide();
        }else{
            $("#usersign_pagination").show();
        }

        if(!that.defaluts.isPaginationInit){   
            $("#usersign_pagination").createPage({
                pageCount: pageCount,
                current:1,
                backFn:function(p){
                    that.defaluts.page = p;
                    $("#call_list").empty();
                    that.callDetail();
                }
            });    
            that.defaluts.isPaginationInit = true;
        }  

        //5秒钟刷新一次
        if(status === "start" && that.defaluts.isPaginationInit){
            if(MTSDK.admin.callName.defaluts.isRefreshCallList){
                clearInterval(MTSDK.admin.callName.defaluts.callBackRequest);
                MTSDK.admin.callName.defaluts.callBackRequest = setInterval(function () {
                    that.callDetail();
                }, 5000);
            }else{
                clearInterval(MTSDK.admin.callName.defaluts.callBackRequest); 
            }
        }  
    },


    //渲染点名记录
    callDetail: function($this){
        var id = "",
            that = this;
        if($this){
            id = $this.data("id");
            that.defaluts.signId = id;
        }       
        //请求参数
        var jsonData = {
            access_token: window.access_token,
            action: "getSignList",
            signId: that.defaluts.signId,
            rows: 8,
            page: that.defaluts.page,
            total: that.defaluts.total
        }
        that.ajaxRequest("get",jsonData,that.singUrl,that.callDetailSuccess);
        
    },

    //渲染用户签到列表
    renderCallDetailTemp: function(data){
        var that = this;
        if(!that.defaluts.tepIsLoad){
            $(".tpl_detail_pop").remove();
            var callDetailTpl = template("tpl_call_detail",data);  
            $("#ht_admin_box").append(callDetailTpl);
            that.defaluts.tepIsLoad = true;
        }

        $("#call_detail_top").empty();
        var callDetailTopTpl = template("call_detail_top_temp",data);  
        $("#call_detail_top").append(callDetailTopTpl);

        $(".tpl_call_pop").hide(); 
        $(".tpl_detail_pop").show();

        var signListTpl = template("user_sign_list",data);  
        $("#ul_list").html(signListTpl);
    },

    //选择发起的时长
    launchDuration: function($this){
        var that = MTSDK.admin.callName,
            time = $this.data("time");
        that.defaluts.launch_duration = time;
        $("body #roll_time").html($this.html());

    },
    //发起点名
    launchCall: function(data){

        //下课的情况下禁用发点名按钮
        if($(".call_btn").hasClass("disabled")){
            return;
        }

        var that = this;
        //请求参数
        var jsonData = {
            access_token: window.access_token,
            action: "addSign",
            duration: that.defaluts.launch_duration
        }

        if(that.defaluts.iscallend){
            if(!MTSDK.admin.adminBox.customCallBack('callFlag')) {
                return false
            }
            that.isDisabledBtn("send");
            that.ajaxRequest("get",jsonData,that.singUrl,that.launchCallSuccess);
        }
        
    },

    //将发起点名btn置灰
    isDisabledBtn: function(status){
        var that = this;
        //发起状态
        if(status == "send"){
            $(".call_btn").addClass("disabled");
            that.defaluts.iscallend = false;
        }
        //结束状态
        else if(status == "end"){
            $(".call_btn").removeClass("disabled");
            that.defaluts.iscallend = true;
        }    
    },
    //请求获取点名记录
    getCallRecord: function(){
        var that = this;
        //请求参数
        var jsonData = {
            access_token: window.access_token,
            action: "listSign"
        }
        that.ajaxRequest("get",jsonData,that.singUrl,that.getCallRecordSuccess);

    },

    //成功获取点名签到记录并渲染模板
    getCallRecordSuccess: function(data){
        var callRecordTemp = "",
            that = MTSDK.admin.callName;
        $("#call_list").empty();
        if(data.data){
            for(var i =0;i<data.data.length;i++){
                callRecordTemp += template("call_list_record",that.returnData(data.data[i]));
            }  

            $("#call_list").empty();
            $("#call_list").append(callRecordTemp);

            if(data.data[0]){
                if(data.data[0].status == "start"){
                    clearInterval(MTSDK.admin.callName.defaluts.recordTimer);
                    that.isDisabledBtn("send");
                    that.defaluts.recordTimer = setTimeout(function(){
                        that.getCallRecord();                       
                    },5000);
                    /*clearInterval(MTSDK.admin.callName.defaluts.recordTimer);*/
                }
            } 
           
        }
    },

    //发起点名成功
    launchCallSuccess: function(data){
        var that = MTSDK.admin.callName;
        if(data.code == 0){
            that.getCallRecord();
        }else{
            $("#errmsg").html(data.msg);
            setTimeout(function(){
               $("#errmsg").html("");
            },5000);
        }
    },

    //获取用户签到列表成功
    callDetailSuccess: function(data){
        var that = MTSDK.admin.callName;
        that.renderCallDetailTemp(data);
        that.defaluts.total = data.total;
        that.callDetailPagination(data.total,data.data.signInfo.status);
    },

    //从点名中到结束的设置
    callEndSet: function(duration){
        var that = this;  
        that.defaluts.iscallend = true;
        $(".call_btn").removeClass("disabled");
        clearInterval(MTSDK.admin.callName.timer);
    },

    //点名倒计时
    callCountDown: function(duration){
        var second = duration*60,
            that = MTSDK.admin.callName;
        clearInterval(that.timer);    
        that.timer = setInterval(function(){
            second--;
            if(second == 0){ 
                var $this = $(".call_ing .call_status");
                that.callEnd($this);
                that.callEndSet(duration);
                that.getCallRecord();
                clearInterval(that.timer);
                return;
            }
            $("#call_start .status_text").removeClass("hidden");
            $("#call_start .cdtime").html("倒计时"+second+"s(进行中)");
        },1000);
        return second;
    },

    //返回单条点名签到记录data对象
    returnData: function(dataObj){
        var data ={
            d: dataObj
        }
        return data;
    },
    //点名结束
    callEnd: function($this){
       var callXid = $this.data("id"),
           that = this;
       //请求参数
        var jsonData = {
            access_token: window.access_token,
            action: "endSign",
            signId: callXid
        }
        that.ajaxRequest("get",jsonData,that.singUrl,that.callEndSuccess);
    },

    //点名结束请求成功
    callEndSuccess: function(data){
        var that = MTSDK.admin.callName;
        if(data.code == 0){
            $(".call_tip_pop").hide();
            that.callEndSet();
            that.getCallRecord();
        }     
    },
    //确认点名结束
    confirmEnd: function($this){
        var tipTemp = template("call_tip_temple");
        $("body").append(tipTemp);
        $(".call_tip_pop .confirm_btn").data("id",$this.data('id'));
    },


      //聊天区通知
    showNotice: function(data,state){
        var notify = "";
        if(state === "start"){
            notify = '管理员 <em>'+data.data.nickname+'</em> 在 '+data.data.time+'  开始点名';
        }else{
            notify = '点名结束, 签到人数 <em>'+data.data.signTotal+' </em>人/点名人数<em> '+data.data.total+" </em>人"+'</em>';
        } 
         HTSDK.tools.chatNotify(notify);
    },

    //事件绑定
    bindEvents: function(){
        var that = MTSDK.admin.callName;
        //设置点名时间下拉框显示
        $(".call_time").on("click",function(){
            $("#call_time_select").toggle();     
        });
        //鼠标经过时样式
        $("#call_time_select").on('mousemove', 'li', function(event) {
            $("#call_time_select li").removeClass("current");
            $(this).addClass('current');   
        });

        //点击详情
        $("body").on('click','.signed_num a',function(){
            that.defaluts.total = 0;
             that.callDetail($(this));
             MTSDK.admin.callName.defaluts.isRefreshCallList = true;
             clearInterval(MTSDK.admin.callName.defaluts.recordTimer);
        });

        //关闭
        $("body").on('click',".close_pop",function(){
            $(".call_pop").hide();
            MTSDK.admin.callName.defaluts.isRefreshCallList = false;
            clearInterval(MTSDK.admin.callName.defaluts.callBackRequest);
        });

        //返回
        $("#ht_admin_box").on('click',".op_btn .goback",function(){
            $(".tpl_detail_pop").hide();
            $(".tpl_call_pop").show();
            that.getCallRecord();
            MTSDK.admin.callName.defaluts.isRefreshCallList = false;
            clearInterval(MTSDK.admin.callName.defaluts.callBackRequest);
        });

        //选择发起点名的时长
        $("#call_time_select").on("click","li",function(){
            that.launchDuration($(this));
        });

        //发起点名
        $(".call_btn").on("click",function(){
            that.launchCall();
        });

        //点名显示确认框
        $("body").on("click","#call_start .call_status",function(){
            that.confirmEnd($(this));
            /*that.callEnd($(this));*/
        });

        //点名结束
        $("body").on("click",".call_tip_pop .confirm_btn",function(){
            that.callEnd($(this));
        });

        //关闭结束确认框
        $("body").on("click",".call_tip_pop .close",function(){
            $(".call_tip_pop").hide();
        });

        //点名结束
        $("body").on("click",".call_tip_pop .cancel_btn",function(){
            $(".call_tip_pop").hide();
        });
    },

    //初始化
    init:function(){
        var that = this; 
        that.defaluts.isLoad = false;
        that.showCallPop(that.bindEvents);
    }
}










