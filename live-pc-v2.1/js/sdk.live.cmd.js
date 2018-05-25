"use strict";

/**
 * [HTSDK扩展对象]
 */
var HTSDK = window.HTSDK || {};

/**!
 * Dependent on TALK-FUN-JS-SDK
 * http://www.talk-fun.com/
 * 
 * @copyright: [2016, Huantuo]
 * @version: [v2.0.1]
 * @author: [Marko, Yj, Xin]
 * @description: [欢拓SDK-命令接收]
 * @API: http://open.talk-fun.com/open/doc/sdk.js.html
 * @模版采用Tmod模版
 */
// cmd执行
HTSDK.cmd = function(){
	
	/**
	 * [_HT 实例化SDK]
	 * @param {[String]} [access_token] [房间验证密钥]
	 * @type  {Object}
	 */
	var _HT = new MT.SDK.main(access_token);

	//蜗壳教育
	var pid = '11284',
	    isTrue = false;
	if(pid.indexOf(window.partner_id) > -1){
		isTrue = true;
	}


	/**
	 * [HTSDK扩展对象]
	 */
	var HTSDK = window.HTSDK || {};

	// COPY.ht
	HTSDK.room._HT = _HT;

	// 内置方法
	// 初始化
	_HT.on("core:initdata", function(data){
		// console.info(data);
		MTSDK.admin.adminBox.pptPreView(data.step2, function(retval){
			// TODO...
			HTSDK.footer.pptPreView(retval);
		});
	});

	// 翻页
	_HT.on("core:whiteboard", function(whiteboard){
		MTSDK.admin.adminBox.pptPreView(whiteboard, function(retval){
			//切换 页数
			if(retval.page && retval.page > 0){
				HTSDK.footer.pptPage = retval.page;
			}
			HTSDK.footer.pptPreView(retval);
		});
	});

	/**
	 * 服务器连接部分
	 */
	// 连接成功
	_HT.on("connect", function(retval){
		$("#logs").append('<p>服务器连接成功...</p>');
	});
	// 连接失败
	_HT.on("connect_failed", function(retval){
		$("#logs").append('<p>服务器连接失败...</p>');
	});
	// 连接错误
	_HT.on("connect_error", function(retval){
		$("#logs").append('<p>服务器连接错误...</p>');
	});

	/**
	 * ==== SDK调用部分 ====
	 */
	//监听是否有ppt
	_HT.on("live:set:page", function(retval){	
		HTSDK.view.isPPT(retval);
	});
	// 聊天
	_HT.on("chat:send", function(retval){
		HTSDK.modChat.onChat(retval);
	});

	//私聊信息接收
	_HT.on("chat:private",function(retval){
		HTSDK.privateChat.receiveChat(retval);
	});

	// 系统错误信息处理
	_HT.on("system:room:error",function(retval){
        // 被踢出
        if(retval.code == 10034){
            window.location.href = 'http://open.talk-fun.com/open/maituo/live_tip.html?var=1'
        }
        // 房间已满
        else if(retval.code == 10035 || retval.code == 10036 || retval.code == 10037){
            window.location.href = 'http://open.talk-fun.com/open/maituo/live_tip.html?var=2'
        }
	});

	//普通用户签到
	_HT.on("sign:new",function(data){
		HTSDK.userSign.showSignPop(data);
		MTSDK.admin.callName.getCallRecord();
		MTSDK.admin.callName.isDisabledBtn("send");
		MTSDK.admin.callName.showNotice(data,"start");
	})


	//结束广播
	_HT.on("sign:end",function(data){
		HTSDK.userSign.signPopHide();
		MTSDK.admin.callName.isDisabledBtn("end");
		MTSDK.admin.callName.showNotice(data,"stop");
	})

	// 小班初始化数据
	_HT.on("usercamera:init", function(retval){
		HTSDK.liveCamera.initData = retval;
	});

	// Flash播放器状态
	_HT.on('flash:player:status', function (status) {
		console.error(status)
	});

	// 房间配置
	/**
	 * room.modeType: 房间模式
	 * room.barrage: 弹幕
	 */
	_HT.on("live:room:configs", function(room){
        HTSDK.modChat.defaults.gagStatue = room.chat.disableall;
		window.sessionStorage.setItem("status",room.chat.disableall);
		HTSDK.room.roomSet = room;

		// 预加载聊天数据
		if(room.chatList && room.chatList.length > 0){
			HTSDK.modChat.chatList(room.chatList);
		}

		//弹幕1开启  0隐藏
		if(room.barrage){
			HTSDK.room.danmakuSwitch(room.barrage);
		}
		
		// @房间模式
		// @1 => 语音云 
		// @3 => 大班  
		// @5 => 小班
		HTSDK.plugins.defaults.roomTypeNumber = room.modetype;
		HTSDK.player.init(room.modetype);

		//ppt显示   0 关闭  1 开启
		HTSDK.plugins.defaults.pptForbid = room.pptDisplay;

		
		// 纯语音云模式
		HTSDK.voice.init(room.modetype);

        // 小班模式
		HTSDK.liveCamera.init(room.modetype, function(){
			/**
			 * ==== 小班模式 ====
			 */
			if(_HT.livePlayer){
				if($("#mod_live_camera").size() > 0){
					// 初始化播放器
					// @mainPlayer(@容器ID, @播放器ID, @回调函数)
					_HT.livePlayer("mod_live_camera", "ht_live_player", function(player){
						HTSDK.liveCamera.playerInit(player);
					});
				}

				// 教师开启摄像头
				_HT.on("usercamera:start", function(retval){
					HTSDK.liveCamera.cameraStart();
				});

				// 检测
				_HT.on("usercamera:start", function(retval){
					HTSDK.liveCamera.cameraStart();
				});

				// 教师关闭摄像头
				_HT.on("usercamera:stop", function(retval){
					HTSDK.liveCamera.cameraStop();
				});


				// 教师允某人上讲台
				_HT.on("usercamera:up", function(retval){
					HTSDK.liveCamera.allowUp(retval.xid, retval.nickname);
				});

				// 教师踢除某人
				_HT.on("usercamera:kick", function(retval){
					HTSDK.liveCamera.kickStu(retval.xid, retval.nickname);
				});

				//推流是否成功
				_HT.on('usercamera:push:state', function(retval) {
					
				});

				// 学生申请上
				_HT.on("usercamera:apply", function(retval){
					HTSDK.liveCamera.stuApply(retval.xid, retval.nickname);
				});

				// 学生主动下
				_HT.on("usercamera:down", function(retval){
					HTSDK.liveCamera.stuDown(retval.xid, retval.nickname);
				});

				// 学生自行取消
				_HT.on("usercamera:cancel", function(retval){
					HTSDK.liveCamera.stuCancel(retval.xid, retval.nickname);
				});
			}
		});
	});

	// 鲜花初始化
	_HT.on("flower:get:init", function(retval){
		HTSDK.plugins.flower.flowerInit(retval);
	});

	// 送花成功
	_HT.on("flower:send", function(retval){
		HTSDK.plugins.flower.sendCallback(retval);
	});

	// 鲜花总数
	_HT.on("flower:total", function(flower){
		HTSDK.plugins.flower.autoIncrease(flower);
	});

	// 获取第一朵鲜花时间
	_HT.on("flower:time:left", function(sec){
		HTSDK.plugins.flower.flowerTimeleft(sec);
	});

	// 开始抽奖
	_HT.on("lottery:start", function(retval){
		setTimeout(function(){
			HTSDK.plugins.lottery.startLottery(retval);
		}, 3000);
	});

	// 结束抽奖
	_HT.on("lottery:stop", function(retval){
		setTimeout(function(){
			HTSDK.plugins.lottery.stopLottery(retval);
		}, 3000);
	});

	// 公告
	_HT.on("announce:notice", function(retval){
		HTSDK.modSider.notify(retval);
	});
	
	//广播
	_HT.on("broadcast", function(retval){
		HTSDK.plugins.diyBroadcast(retval);
	});

	// 滚动通知
	_HT.on("announce:roll", function(retval){
		HTSDK.plugins.rollNotice(retval);
	});

	// 在线用户人数
	_HT.on('member:total', function(total){
		HTSDK.modOnlines.total(total);
	});

	// 特殊用户   [obj,obj...] [list:{},total:]
	_HT.on("live:robots:users", function (robobj) {
		if( robobj != null && robobj != undefined){
			if(robobj.length>0){
				HTSDK.modOnlines.robot = robobj;
				HTSDK.modOnlines.rbtotal = robobj.length;
			}else {
				if(robobj.list.length > 0){
					HTSDK.modOnlines.robot = robobj.list;
					HTSDK.modOnlines.rbtotal = robobj.total;
				}
			}
			
		}
	});

	// 广播设置特殊用户
	_HT.on("member:robots", function (robobj) {
		if( robobj != null && robobj != undefined){
			if(robobj.robots.length > 0){
				HTSDK.modOnlines.rbtotal = robobj.robots.length;
				HTSDK.modOnlines.broadcastSetRobot(robobj.robots);
			}else {
				HTSDK.modOnlines.rbtotal = robobj.robots.total;
				HTSDK.modOnlines.broadcastSetRobot(robobj.robots);
			}
		}
	});

	// 在线用户列表
	_HT.on("member:list", function(list){
		if(list.length > 0){
			HTSDK.modOnlines.init(list);
		}
	});

	// 用户加入
	_HT.on('member:join:other', function(retval){
		HTSDK.modOnlines.memberJoin(retval);
	});

	// 用户离开
	_HT.on('member:leave', function(user){
		HTSDK.modOnlines.memberLeave(user);
	});

	// 提问
	_HT.on("question:ask", function(retval){
		HTSDK.modQuestion.ask(retval);
	});

	// 回答
	_HT.on("question:reply", function(retval){
		HTSDK.modQuestion.reply(retval);
		MTSDK.admin.adminBox.addReply(retval);
	});

	// 删除问答
	_HT.on("question:delete", function(retval) {
		HTSDK.modQuestion._remove(retval);
	});

	// 更新回答中状态
	_HT.on("question:update", function(retval){
		MTSDK.admin.adminBox.questionEvents(retval)
	})


	// 发起投票
	_HT.on("vote:new", function(retval){
		HTSDK.plugins.vote.showVote(retval);
	});

	// 公布投票结果
	_HT.on("vote:pub", function(retval){
		HTSDK.plugins.vote.showResult(retval);	
	});

	//删除提问
	_HT.on("question:delete", function(retval){
		HTSDK.modQuestion.dealCallback('delete',retval);
	});

	//通过提问
	_HT.on("question:audit", function(retval){
		HTSDK.modQuestion.dealCallback('audit',retval);
	});

	// 强制退出
	_HT.on('member:forceout', function(retval){
		if(MT.me.xid === retval.xid){
			if(MT.me.sessionid === retval.sessionid){
	    		window.location.href = 'http://open.talk-fun.com/error.html?var=3';
			}
		}
	});

	// 踢出房间
	_HT.on('member:kick', function(retval){
		if(MT.me.xid === retval.xid){
            window.location.href = 'http://open.talk-fun.com/open/maituo/live_tip.html?var=1';
            return;
		}
		HTSDK.modOnlines.memberkick(retval);
	});

	// 禁止聊天
	_HT.on('chat:disable',function(retval){
		HTSDK.modOnlines.chatAccess("chat:disable", retval);
	});

	//允许发言
	_HT.on('chat:enable',function(retval){
		MTSDK.admin.adminBox.cancelBan(retval.xid);
		HTSDK.modOnlines.chatAccess(false,retval);
	});

	//禁止全体聊天
	_HT.on('chat:disable:all',function(retval){
	    HTSDK.modChat.allDisbleChat(retval);
	    HTSDK.modChat.gagNotice(retval);
	});

	//数据更新
	_HT.on("live:data:update",function(retval){
		HTSDK.reward.defaults.liveid = retval.liveId;
	});
	
	// 打赏
	_HT.on("live:reward", function(ret){
		HTSDK.reward.notifyReward(ret);
	});


	// * 创建主播播放器(大播放器)
	// * @mainPlayer(@容器ID, @播放器ID, @回调函数)
	_HT.mainPlayer("mod_main_player", "maituoPlayer", function(player){
		HTSDK.liveCamera.defaults.mainPlayer = player;
		HTSDK.player.setPlayer(player, function(){
			HTSDK.liveCamera.voiceHide();
		});
	});

	 // * 创建摄像头
	 // * @camera(@容器ID, @播放器ID, @回调函数)
	_HT.camera("mod_camera_player", "mtAuthorPlayer", function(camera){
		if(isTrue){
			if(MT.me.role === "guest") {
				$("#mtAuthorPlayer").remove();
			}else{
				HTSDK.player.setCamera(camera);
			}	
		}else{
			HTSDK.player.setCamera(camera);
		}
		
	});

	// 直播开始
	_HT.on("live:start", function(title){
		HTSDK.room.liveChange("start", title);
		$("#camera_play").show();
		if(HTSDK.videoprivew){
			HTSDK.videoprivew.state = "start";
	        HTSDK.videoprivew.liveState("start");
    	}

		HTSDK.classPreview.classLiveStatue("start");
	});

	// 直播停止
	_HT.on("live:stop", function(){
		HTSDK.room.liveChange("stop");
		HTSDK.modChat.defaults.flag = true;
		window.sessionStorage.setItem("status",0);
		
		if(HTSDK.videoprivew){
			HTSDK.videoprivew.state = "stop";
	        HTSDK.videoprivew.liveState("stop");
    	}

		HTSDK.modChat.closeAllGag();
		if(HTSDK.classPreview.isClass){
			HTSDK.classPreview.classLiveStatue(MT.getLiveState());
		}
	});

	// 直播未开始
	_HT.on("live:wait",function(){
		HTSDK.room.liveChange("wait");
		
		if(HTSDK.videoprivew){
			HTSDK.videoprivew.state = "wait";
       		HTSDK.videoprivew.liveState("wait");
       	}
	});

	//网络状态 
	_HT.on("network:status",function(status){
		HTSDK.room.networkStatus(status.speed,status.type);
	});

	//模式切换
	_HT.on("live:mode:change",function(curMode, beformode, nativeMode){
		HTSDK.view.switchModePrivew(curMode,nativeMode);
		HTSDK.room.pptShowSet(curMode);
		HTSDK.room.defaults.currentMode = nativeMode;
		HTSDK.voice.voiceMatchSync("mode", nativeMode);
	});

	//课程信息
	_HT.on("live:course",function(data){
		HTSDK.room.courseMsg = data;
		
		if(HTSDK.videoprivew){
			HTSDK.videoprivew.defaults.data = data;
        	HTSDK.videoprivew.init();
    	}
		HTSDK.classPreview.isClass = true;
		if(data.info){
			HTSDK.classPreview.classInt(data.info);
		}
		//针对一起作业网
		// if(partner_id == "11245" || partner_id == "11386"){
		// 	HTSDK.room.classState(data);
		// }
	});

	//房间模块设置
	_HT.on("live:room:modules",function(data){
		HTSDK.room.roomSetMsg = data;
		HTSDK.live.setModules(data);
	});

	//广播指令
	_HT.on("course:expire",function(msg){
		//HTSDK.room.instructionBroadcast(msg);
	});

	//课程进入错误
	_HT.on("live:course:access:error",function(data){
		HTSDK.room.courseError(data);	
		HTSDK.classPreview.classEnd(data);
	});

	// 摄像头开启
	_HT.on("camera:start", function(){
		HTSDK.player.cameraLayer(true);
	}); 

	// 摄像头关闭
	_HT.on("camera:stop", function(){
		HTSDK.player.cameraLayer(false);
	});

	/**
	 * Start ====== Voice Of HT.VoiceCloud =======
	 * @语音模块
	 * 4种模式切换 & 监听
	 */
	
	// 房间语音模式(现在全部设置到 live:room:configs)
	// _HT.on("room:mode", function(type){
	// 	HTSDK.plugins.defaults.roomTypeNumber = room.modetype;
	// 	HTSDK.voice.init(room.modetype);
	// });
	
	// [voice]改变用户语音权限
	_HT.on("member:voice:power", function(xid, power){
		HTSDK.voice.setVoicePower(xid, power);
	});

	// 谁在说话
	_HT.on("voice:speaking:user", function(user){
		// HTSDK.voice.whoSpeaking(user);
	});

	// 正在说话列表
	_HT.on("voice:speaking:list", function(list){
		HTSDK.voice.whoSpeaking(list);
	});
	
	// 语音云启动成功
	_HT.on("voice:connect:success", function(){
		HTSDK.voice.vCloudDone();
		HTSDK.voice.voiceMatchSync("voice", true);
	});

	// 未开启或中断
	_HT.on("voice:disconnent", function(){
		HTSDK.voice.steps();
	});

	// 语音云音量
	_HT.on("voice:power", function(power){
		$("#voice_power em").css("width", power+"%");
	});

	// 语音云未启动
	_HT.on("voice:unlaunch", function(flag, times){
		HTSDK.voice.steps(flag, times);
	});

	// 模式切换监听
	_HT.on("voice:mode:change", function(data){
		var voiceType = data.mode;
		HTSDK.voice.switchVoiceMode(voiceType);
	});

	// [+voice]语音模式初始化
	_HT.on("voice:model:init", function(model){
		var voiceType = model;
		HTSDK.voice.switchVoiceMode(voiceType);
	});

	/**
	 * @获取语音云音量
	 * voice:volume:output  :输出设备音量
	 * voice:volume:input   :输入设备音量
	 */
	_HT.on("voice:volume:output", function(volume){
		HTSDK.voice.setVolume("output", volume);
	});

	_HT.on("voice:volume:input", function(volume){
		HTSDK.voice.setVolume("input", volume);
	});


	/**
	 * @语音权限控制
	 * voice:power:forbid  :禁止语音说话
	 * voice:power:allow   :允许语音说话
	 */
	_HT.on("voice:power:forbid", function(user){
		// 禁止语音说话
		HTSDK.voice.voiceGlobal.forbidVoice(user.data);
	});

	_HT.on("voice:power:allow", function(user){
		// 允许语音说话
		HTSDK.voice.voiceGlobal.allowVoice(user.data);
	});

	/**
	 * @主席模式
	 * voice:chairman:list  :主席用户列表
	 */
	_HT.on("voice:chairman:list", function(list){
		HTSDK.voice.voiceChairman.init(list);
	});
	
	/**
	 * @ 麦序事件
	 * voice:queue:reset    :麦序重设
	 * voice:queue:init     :麦序初始化
	 * voice:queue:list     :麦序列表
	 * voice:queue:change   :麦序列表变化
	 * voice:queue:join     :加入队列
	 * voice:queue:leave    :离开
	 * voice:queue:move     :移动
	 * voice:queue:clear    :清空
	 * voice:queue:control  :控制
	 * voice:queue:moveto   :移动到位置
	 * voice:queue:time     :队列时间
	 * voice:queue:countdown:倒计时
	 **/
	_HT.on("voice:queue:init", function(data){
		HTSDK.voice.voiceQueue.init(data);
	});

	/*_HT.on("voice:queue:list", function(list){
		HTSDK.voice.voiceQueue.list(list);
	});*/

	_HT.on("voice:queue:vlist", function(list){
		HTSDK.voice.voiceQueue.list(list);
	});

	_HT.on("voice:queue:control", function(obj){
		HTSDK.voice.voiceQueue.control(obj);
	});

	_HT.on("voice:queue:change", function(list){
		HTSDK.voice.voiceQueue.change(list);
	});

	_HT.on("voice:queue:leave", function(user){
	 	HTSDK.voice.voiceQueue.leave(user);
	});

	_HT.on("voice:queue:clear", function(user){
	 	HTSDK.voice.voiceQueue.clear(user);
	});

	_HT.on("voice:queue:join", function(user){
		HTSDK.voice.voiceQueue.join(user);
	});

	_HT.on("voice:queue:reset", function(list){
		HTSDK.voice.voiceQueue.reset(list);
	});

	_HT.on("voice:queue:countdown", function(sec){
		sec = parseInt(sec, 10);
		if(sec && sec > 0){
			$(".times_cont em").html(sec+"s");
		}else{
			$(".times_cont em").html("");
		}
	});

	 /**
	 * @ 举手事件
	 * voice:hand:reset  :举手列表初始化
	 * voice:hand:change :举手列表更改
	 * voice:hand:up     :举手
	 * voice:hand:leave  :离开
	 * voice:hand:allow  :允许
	 * voice:hand:forbid :禁止
	 * voice:hand:remove :移除
	 * voice:hand:clear  :清空
	 **/
	_HT.on("voice:hand:up", function(user){
		HTSDK.voice.voiceHand.join(user);
	});

	_HT.on("voice:hand:leave", function(user){
		HTSDK.voice.voiceHand.leave(user);
	});

	_HT.on("voice:hand:remove", function(user){
		HTSDK.voice.voiceHand._remove(user);
	});

	_HT.on("voice:hand:clear", function(){
		HTSDK.voice.voiceHand.clear();
	});

	_HT.on("voice:hand:reset", function(list){
		HTSDK.voice.voiceHand.reset(list);
	});

	_HT.on("voice:hand:allow", function(user){
		HTSDK.voice.voiceHand.allow(user);
	});

	_HT.on("voice:hand:forbid", function(user){
		HTSDK.voice.voiceHand.forbid(user);
	});

	_HT.on("voice:hand:change", function(list){
		HTSDK.voice.voiceHand.change(list);
	});
	// 语音云模块结束======> END

	//iframe
	/*_HT.on('_liveIframe:broadcast', function(cmd, args){
		HTSDK.plugins.iframe.trigger(cmd, args);
	});*/

	// Room数据 所有操作完成
	// room:init success.
	// 房间初始化完成
	_HT.on("room:init", function(cb){
		// 执行 HTSDK.init
		HTSDK.room.roomLoadSucess(_HT);
		// MTSDK.admin.init(_HT);
	});
};














