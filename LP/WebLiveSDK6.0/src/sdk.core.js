"use strict";
/**	
 * @ TalkFun-Web-JS-SDK
 * @ Author: Makro, Superman
 * @ Phone: 13418033692
 * @ QQ: 104257446
 * @ Copyright 2021 www.talk-fun.com Inc. All Rights Reserved.
 */
// import core packages
import STATIC from "./core/mt.static"
import Store from './core/store'
import * as TYPES from './core/store/types'
import socket from "./core/socket.init"
import room from "./core/room.init"
import tools from "./utils/tools"
import map from "./utils/map"
import member from "./core/member"
import plugins from "./plugins"
import chat from "./core/chat"
import network from "./core/network"
import question from "./core/question"
import core from "./core/player.core"
import pako from "pako"
import cmdHandle from "./core/cmd.handle"
import cmdStatis from './core/cmd.statis'
import log from './core/log'
import fires from './core/sdk.fire'
import queue from "./utils/queue"
import pptPreview from './core/pptPreview'
import manager from './core/manager'

// 合并player => 全量使用flvplayer
import player from "./core/h5.player-core" // h5.playe with Flv.
import desktop from "./core/live-desktop"
import _version from './config/version'
import flashPlayer from './core/flash.player';
import whiteboardPlayer from './core/whiteboard.player'
import media from './core/mediaCore';
// 小班播放器(推拉流)播放器[v-1.5]版本
import livePlayer from './core/live.player.1.5';

// player
tools.debug(`TF_JSSDK v${process.env.packVersion}-${new Date().getTime()}`)
tools.debug(`Build from ${process.env.GIT_PACK}`)

// 客户端 <==> 浏览器
cmdHandle.init();

// 状态监听
Store.init()
Store.commit(TYPES.UPDATE_API_DOMAIN, window.apiHost || 'https://open.talk-fun.com')


// 基础信息
var version = window.sdkVersion || process.env.packVersion
var _mtCopy = null
tools.debug('SDK-Core-Version: ' + version);
tools.debug("Current-UA ===> " + navigator.userAgent);

// 设置版本号
log.setBaseParam({
  sdkVersion: version
})

// Socket.Player
socket.player = player;

/**
 * @return MT {全局变量}
 */
const MT = {
  SYS_CODE: version,
  version: version,
  tools: tools, //工具类
  socket_connect_success: false, //socket初始化
  room_init: false, //初始化状态
  initDataObj: null,
  me: {}, //当前用户信息
  zhubo: {}, //主播信息,
  getAvatar: member.dealMemberAvatar, //头像
  client: cmdHandle, //client客户端相关
  plugins: plugins, // 外置插件
  register: map.put, // 注册事件
  private: chat.private
};

// 伪直播代理对象
// vodLive.setDelegate(player)

/**
 * @用户创建房间, 必要参数 `access_token`
 * @创建 new MT.main(access_token);
 * @允许4种类型参数 (access_token) || (access_token, callback) || (access_token, extends) || (access_token, extends, callback)
 * @返回 return SDK;
 */
MT.main = function () {

  // 读取arguments
  var that = this,
    args = arguments;

  tools.debug("Talk-Fun JS-SDK Params", tools.argumentToArray(arguments));

  // 头像工具
  this.getAvatar = member.dealMemberAvatar

  // token
  var access_token = null,
    callback = null,
    extend = null;

  // 是否实例化
  if (!this.init) {
    tools.error('实例化 MT 对象失败, 请重试!')
    map.get('system:room:error')({
      msg: '实例化 MT 对象失败, 请重试!'
    })
    return false
  }

  // 可配置参数(最多3项)
  if (args.length > 0 && args.length <= 3) {

    if (args > 3) {
      // 参数数量非法
      tools.warn('参数错误, 请传入正确参数')
      map.get('system:room:error')({
        msg: '参数错误, 请传入正确参数'
      })
      return false
    }

    // 一项参数: (access_token)
    if (args.length === 1) {
      if (typeof args[0] === "string") {
        access_token = args[0];
        that.init(access_token);
      }
    }

    // 两项参数: (access_token, callback) || (access_token, extends)
    else if (args.length === 2) {
      // ack, callback
      if (typeof args[0] === "string" && typeof args[1] === "function") {
        access_token = args[0];
        callback = args[1];
        that.init(access_token, callback);
      }
      // ack, extend-config
      else if (typeof args[0] === "string" && typeof args[1] === "object") {
        access_token = args[0];
        extend = args[1];
        // room.configs = extend;
        // core.initConfig = extend;
        Store.commit(TYPES.UPDATE_EXT_CONFIG, extend)
        that.init(access_token);
      }
    }

    // 三项参数: (access_token, extends, callback)
    else if (args.length === 3) {
      // ack, extend-config
      if (typeof args[0] === "string" && typeof args[1] === "object" && typeof args[2] === "function") {
        access_token = args[0];
        extend = args[1];
        callback = args[2];
        // room.configs = extend;
        // core.initConfig = extend;
        Store.commit(TYPES.UPDATE_EXT_CONFIG, extend)
        that.init(access_token, callback);
      }
    }
  }
  // 非法
  else {
    tools.warn('参数错误, 请传入正确token值')
    map.get('system:room:error')({
      msg: '参数错误, 请传入正确token值'
    })
  }
  // access_token
  this.access_token = access_token;
};

_mtCopy = tools.deepClone(MT)

/**
 * ## 工具类暴露 ##
 */
MT.main.prototype.getTools = function () {
  return tools
}

/**
 * @Interface for init(access_token, callback).
 * @初始化 MT.main
 * @param {access_token} String
 * @param {initCallback} Function
 * @note  {init.php 获取房间配置参数, 按返回值初始化各个模块}
 */
MT.main.prototype.init = function (access_token, callback) {
  var that = this;
  // 更新token
  Store.commit(TYPES.UPDATE_TOKEN, access_token)
  // 初始化请求 init.php
  room.init(access_token, function (resInitData) {
    tools.debug('Get Start =>', resInitData)
    if (resInitData) {
      MT.main.prototype.initDataObj = resInitData
      // 提交数据
      Store.commit(TYPES.UPDATE_INIT_DATA, resInitData)
      // 更新课程数据
      core.updateCourseData(resInitData.course || null)
      // 执行room.init
      that.serverRoom = resInitData
      that.room(resInitData, callback)
      // 初始化播放器
      player.init()
    }
  }, player)
};

/**
 * @Interface for room(retval, initcallback)
 * @依赖模块 `room.init` 由服务器返回初始化房间信息
 * @初始化房间
 * @param {retval} Object
 * @param {initcallback} Function
 */
MT.main.prototype.room = function (retval, initcallback) {
  // Seter
  var d = retval,
    that = this,
    roomInfo = MT.room = {};

  // InitData [初始化數據]
  roomInfo.initData = d.InitData;

  // appHost [主域名]
  roomInfo.appHost = d.appHost;

  // conString [语音云配置]
  roomInfo.conString = d.conString;

  // heartbeatInterval [一些数据收集请求时间]
  roomInfo.heartbeatInterval = d.heartbeatInterval;

  // live [是否直播中]
  roomInfo.live = d.live;

  // modules [模块]
  roomInfo.modules = d.modules;

  // plugin [插件]
  roomInfo.plugin = d.plugin;

  // rtmp [RTMP模式]
  roomInfo.rtmp = d.rtmp;

  // user [当前用户]
  roomInfo.curUser = member.dealMemberAvatar(d.user);

  // zhubo [主播信息]
  roomInfo.zhubo = d.zhubo;

  // 用户信息
  roomInfo.user = d.user;

  // 直播标题
  roomInfo.title = d.InitData.title;

  // websocket url [socket链接地址]
  roomInfo.websocket = d.websocket;

  // cameraUrl [摄像头地址]
  roomInfo.cameraUrl = d.cameraUrl;

  // swfUrl [主播播放器地址]
  roomInfo.swfUrl = d.swfUrl;

  // duration [当前直播时间]
  roomInfo.livingDuration = d.live.duration;

  // 滚动&通知 [普通消息通知]
  roomInfo.announce = d.announce;

  // Flashvars
  roomInfo.flashvar = d.flashvar;

  // 持久化广播事件
  roomInfo.initEvent = d.initEvent;

  // 保存access_token
  roomInfo.access_token = this.access_token;

  // modeType
  roomInfo.modeType = d.room.modetype;

  // 小班播放器路径
  roomInfo.livePlayerUrl = d.livePlayerUrl;

  //res上传接口
  roomInfo.resConfig = d.resConfig;

  // 统计
  cmdStatis.setData(d)

  // action
  if (d.InitData.action) {
    player.action = d.InitData.action;
    core.setPlayerStatus(d.InitData.action)
  }

  // 鲜花初始化数据
  if (d.flower) {
    that.plugins("flower").initFlower = d.flower;
  }

  // 机器人
  if (d.room.robotList) {
    var rblist = d.room.robotList
    member.setRobotList(rblist.list)
    roomInfo.robots = rblist;
  }

  // 模块设置
  if (d.modules) {
    roomInfo.roomModules = d.modules;
  }

  // 课程
  if (d.course) {
    roomInfo.course = d.course;
  }

  // 小班数据
  if (d.usercamera) {
    roomInfo.userCamera = d.usercamera;
    if (d.usercamera.inviteList2) {
      map.get('rtc:invite')(d.usercamera.inviteList2)
    }
    if (d.usercamera.zhujiang) {
      setTimeout(() => {
        map.get('rtc:zhujiang')(d.usercamera.zhujiang)
      }, 100)
    }
  } else {
    roomInfo.userCamera = {};
  }

  // 聊天列表
  if (d.room.chatList) {
    if (d.room.chatList && d.room.chatList.length > 0) {
      member.setAvatars(d.room.chatList)
    }
    map.get('chat:list')(d.room.chatList)
  }

  // 拓展
  roomInfo.ext = d.ext;

  // 在线人数
  if (d.room && d.room.online) {
    roomInfo.online = d.room.online;
  }

  // ====@ set room.info ==== //
  MT.room = roomInfo;

  // copy => room
  this.roomObject = d;
  this.roomInfo = roomInfo;

  // 判断socket链接情况
  // if(roomInfo.websocket && roomInfo.websocket.length === 0){
  tools.debug('房间初始化完成 ====> room:init');
  that._applyByInit(roomInfo, d);

  // 全体禁言
  if (d.room.chat) {
    if (d.room.chat.disableall > 0) {
      map.get('chat:disable:all')({
        status: d.room.chat.disableall
      })
    }
  }

  // socket inited && room inited.
  socket.init(MT.room, function (_socket) {
    tools.debug("room data ==>", MT.room);

    // 执行socket相关操作
    that._listen(_socket);
  });

  // 如果没有延迟队列 => 需执行initStep
  if (fires.queueArys.length === 0) {
    player.doStep()
  }

  // 执行sdk顺序队列
  fires.run(that)
  fires.isLoaded = true

  // 执行外部传入callback
  tools.callback(initcallback, d);
};

/**
 * [getLiveState 获取直播状态]
 * @return {[type]} [返回直播状态]
 */
MT.main.prototype.getLiveState = function () {
  var state = "wait";
  var that = this
  if (!this.firstRun) {
    if (typeof (player.action) === "string") {
      // player.action = room.room.InitData.action;
      state = player.action;
    }
    this.firstRun = true;
  } else {
    state = player.action;
  }
  tools.debug("getLiveState => " + state);
  return state;
};

/**
 * [getSDKMode 获取渲染模式]
 * @return {[type]} [返回渲染模式]
 */
MT.main.prototype.getSDKMode = function () {
  // 共3种模式 [1 / 2 / 3]
  return tools.getSDKMode();
};

/**
 * 音视频动态切换元素
 * @param obj.data: {type: "video" / "audio"}
 */
MT.main.prototype.changeMediaElement = function (obj) {
  return player.changeMediaElement(obj);
};

/**
 * 媒体播放器控制选项配置
 * @param {...}
 */
MT.main.prototype.setMediaControl = function (opts) {
  tools.debug("setting controls ==> ", opts);
  var configs = {
    // 全屏
    fullscreenButton: opts.fullscreenButton,

    // 音量
    volumeButton: opts.volumeButton
  }
  if (player.setConfig) {
    player.setConfig(configs)
  }
};

/**
 * @ 切换播放器位置
 * @ 需要重新初始化
 */
MT.main.prototype.changePosition = function (flag) {
  player.initPlayer(null);
};

// 音量(包括 桌面分享 & video)
// 0 - 1 设置
MT.main.prototype.volume = function (volume) {
  if (player.volume) {
    player.volume(volume);
  }
};

/**
 * @Interface for emitTrigger(args).
 * @注意：执行emit().时, 匹配 `eventName` 进入下列分支方法.
 * @param {args} param arguments参数
 */
MT.main.prototype.emitTrigger = function (args) {
  // tools.debug("emitTrigger===>", args);
  var eventName,
    packet,
    callback;
  // arguments
  if (args.length === 2) {
    eventName = args[0];
    callback = (typeof args[1] === "function") ? args[1] : "";
  } else if (args.length === 3) {
    eventName = args[0];
    packet = args[1];
    callback = (typeof args[2] === "function") ? args[2] : "";
  }

  // 发送client
  // this.cmdHandleEmit(eventName, packet, 2)

  // 事件切换
  switch (eventName) {
    // 提问
    case "question:ask":
      var obj = {
        action: "question",
        type: "question",
        typeId: "ask",
        filter: (packet.filter) ? packet.filter : null,
        replyId: packet.replyId || "",
        content: packet.msg,
        ext: args[1].ext
      };
      question.quesPost("ask", obj, callback);
      return true;

    // 回答
    case "question:reply":
      var obj = {
        action: "answer",
        type: "answer",
        typeId: "reply",
        replyId: packet.replyId,
        content: packet.msg
      };
      question.quesPost("reply", obj, callback);
      return true;

    // 获取问答列表
    case "question:get:list":
      question.getList(MT.room.access_token, callback);
      return true;

    // 获取问答ById
    case "question:get:part":
      question.getQuestionById(packet.qid, callback);
      return true;
    case "question:delete":
      question.allQids.del(packet.qid);
      return true;

    // 弹幕
    case "danmaku:open":
    case "danmaku:close":
      var pack = {
        eventName: eventName,
        data: packet
      };
      // chat.danmakuHandle(pack, player);
      return true;

    // 小班模式
    case "rtc:start":
      livePlayer.setUserCamera("start", callback);
      return true;
    case "rtc:stop":
      livePlayer.setUserCamera("stop", callback);
      return true;
    case "rtc:up":
      livePlayer.setUserCamera("up", packet.xid, callback);
      return true;
    case "rtc:down":
      livePlayer.setUserCamera("down", callback);
      return true;
    case "rtc:kick":
      livePlayer.setUserCamera("kick", {
        xid: packet.xid,
        broad: packet.broad || "0"
      }, callback);
      return true;
    case "rtc:apply":
      livePlayer.setUserCamera("apply", packet.xid, callback);
      return true;
      // 打开画笔权限
    case "rtc:draw:enable":
      livePlayer.setUserCamera("power", packet, callback)
      return true
      // 关闭权限
    case "rtc:draw:disable":
      livePlayer.setUserCamera("power", packet, callback)
      return true
    case "rtc:cancel":
      livePlayer.setUserCamera("cancel", callback);
      return true;
    case "rtc:clear":
      livePlayer.setUserCamera("clear", null, callback);
      return true;
      // 打开画笔权限
    case "rtc:draw:enable":
      livePlayer.setUserCamera("power", packet, callback)
      return true
      // 关闭权限
    case "rtc:draw:disable":
      livePlayer.setUserCamera("power", packet, callback)
      return true
    case "rtc:check:state":
      var pack = {
        cmd: "rtc:check:state",
        callback: callback
      };
      livePlayer.dispatch(pack);
      return true;
    case "rtc:force:out":
      livePlayer.forceOut(callback);
      return true;
    case "rtc:invite":
      livePlayer.setUserCamera("invite", packet.xid, callback);
      return true;
    case "rtc:zhujiang":
      livePlayer.setUserCamera("zhujiang", packet, callback);
      return true;
  };
};
MT.main.prototype.updateData = {}
/**
 * 执行 `Emit()` 和 `on()`方法都会执行该方法(包括服务器响应事件)
 * @param  {[cmd-zip-Object]} packet [cmd压缩包]
 * @return {[type]} [返回传输命令]
 */
MT.main.prototype.packetHandler = function (packet) {

  // 替换头像规则
  packet.args = member.dealMemberAvatar(packet.args);

  // 内部处理
  switch (packet.cmd) {

    // 白板
    case "video:whiteboard":
      // 暴露
      if (packet) {
        var command = JSON.parse(packet.args.metadata);
        map.get("core:whiteboard")(command);

        // 课程 & 直播 => 数据更新
        // var updateData = {
        //   liveId: 0,
        //   courseId: 0
        // }
        if (command.live) {
          this.updateData.liveId = command.live.liveid
        }
        if (command.liveid || command.course_id) {
          if (command.liveid) {
            this.updateData.liveId = command.liveid
          }
          if (command.course_id) {
            this.updateData.courseId = command.course_id
          }
        }
        core.updateCourseData(command)
        tools.debug('Update live data ==>', this.updateData)
        map.get('live:data:update')(this.updateData)

        // 设置课程
        if (typeof packet.args.course_id !== 'undefined') {
          room.setCourse({
            course_id: packet.args.course_id
          });
        }

        // small rtmp
        if (typeof packet.args.small_rtmp !== "undefined") {
          if (!livePlayer.zhuboSmallRtmp) {
            var me = {};
            me[packet.args.small_rtmp.xid] = packet.args.small_rtmp;
            livePlayer.zhuboSmallRtmp = me;
          }
        }

        // 播放器白板
        if (player.whiteBoardOnSocket) {
          player.whiteBoardOnSocket(packet, command);
        }
        // liveplayer
        if (livePlayer && livePlayer.whiteboard) {
          livePlayer.whiteboard(packet, command);
        }
        room.broadcastHandler(command);
      }
      // whiteboard 错误上报
      else {
        map.get("whiteboard:error")();
      }
      break;

    // 聊天
    case "chat:send":
      // 弹幕
      chat.danmaku(packet, player);
      break;

    //===========提问========
    case "question:ask":
      question.allQids.add(packet.args.qid);
      break;
    case "question:reply":
      //提问时没有广播给普通用户，回答的时候一起广播
      //所以这里把广播的问题分拆出来处理
      if (typeof packet.args.question !== 'undefined' && question.allQids.exists(packet.args.replyId) == false) {
        packet.args.question.cmd = 'question:ask';
        var questionPack = {
          cmd: "question:ask",
          "args": packet.args.question
        };
        var _package = this.packetHandler(questionPack);
        if (_package) {
          if (tools.isMobileSDK() && tools.getSDKMode() == 2) {
            window.SDK.broadcast(questionPack);
          } else {
            map.get('question:ask')(_package);
          }
        }
      }
      break;
    case "question:delete":
      question.allQids.del(packet.args.qid);
      break;

    // 伪直播转换成功
    case 'fakelive:video:converted':
      // vodLive.set({
      //   'converted': true
      // })
      break;

    // 发起投票
    case "vote:pub":
      if (packet.args.rightUser) {
        for (var r in packet.args.rightUser) {
          packet.args.rightUser[r] = member.dealMemberAvatar(packet.args.rightUser[r]);
        }
      }
      break;

    // 桌面分享
    case "video:player":
      try {
        player.controlPlayer(packet);
      } catch (err) { }
      map.get("video:player")(packet.args.action);
      break;

    // 用户离线
    case "member:leave":
      member.deleteMember(packet.args);
      break;

    // 用户加入
    case "member:join:other":
      packet.args.member = member.dealMemberAvatar(packet.args.member);
      var u = packet.args.member;
      if (u && u.uid.indexOf("client_") > -1) {
        return false;
      }
      member.addMember(packet.args);
      break;
    case "member:total":
      member.setOnlineTotal(packet.args);
      packet.args = member.getOnlineTotal();
      break;

    // 投票相关处理
    case "vote:new":
      plugins.vote.setData(packet)
      break;

    /**
     * ======== 小班 =========
     */
    case "rtc:up":
    case "rtc:down":
    case "rtc:kick":
    case "rtc:stop":
    case "rtc:apply":
    case "rtc:cancel":
    case "rtc:force:out":
    case "rtc:start":
    case "rtc:ready":
    case "rtc:invite":
    case "rtc:zhujiang":
      livePlayer.dispatch(packet);
      break;
  }
  // 默认
  return packet.args;
};

/**
 * @Interface _applyByInit(room)
 * @room初始化完成执行内部事件
 * @param {room}
 */
MT.main.prototype._applyByInit = function (_rsRoom, sourceInitData) {
  var that = this,
    _room = _rsRoom;

  // 设置全局变量(需要废弃)
  that.export2Window();

  // total
  if (that.roomObject.room.online) {
    map.get("member:total")(that.roomObject.room.online);
  }

  // 投票初始化对象
  plugins.vote.init(_room);

  // 设置`room`对象
  player.room = _room;

  // 房间模式
  map.get("room:mode:type")(_room.modeType);

  // 播放器
  map.get("mainPlayer")();

  // 摄像头
  map.get("camera")();

  // 初始化
  if (livePlayer && livePlayer.init && _room.userCamera) {
    // degelate
    livePlayer.room = _room;
    // 班课模式
    livePlayer.init(_room.userCamera);
  }

  // 房间课程设置暴露
  if (room.room) {
    map.get("live:room:configs")(room.room.room);
  }

  // 当前直播相关信息(初始化)
  if (_rsRoom.live) {
    // var liveData = {
    //   liveId: _rsRoom.live.liveid || 0,
    //   courseId: _rsRoom.user.course_id || 0
    // }
    this.updateData.liveId = _rsRoom.live.liveid || 0
    this.updateData.courseId = _rsRoom.user.course_id  || 0
    map.get("live:data:update")(this.updateData);
  }

  // 机器人
  map.get("live:robots:users")(_room.robots);

  // 初始化小班模式 `usercamera:init`
  if (_room.userCamera) {
    map.get("rtc:init")(_room.userCamera);
  }

  // initData.
  if (_room.initData) {
    map.get("core:initdata")(_room.initData);
  }

  // 模块设置
  if (_room.roomModules) {
    map.get("live:room:modules")(_room.roomModules);
  }

  // 课程
  if (_room.course) {
    map.get("live:course")(_room.course);
  }

  // 初始化签到
  if (sourceInitData.signList && sourceInitData.signList.length > 0) {
    sourceInitData.signList.forEach(item => {
      let signObj = {
        data: item || null
      }
      map.get('sign:new')(signObj)
    })
  }

  // 清晰度选择
  if (sourceInitData.definition) {
    map.get('live:definition')(sourceInitData.definition)
  }

  // 持久化广播事件
  that.broadcastEventInit(_room.initEvent);

  // 设置自己
  MT.me = _room.curUser;

  // 初始化选择网络
  network.init(room, player);

  // 房间初始化完成
  map.get("room:init")();
};

/**
 * @Interface for void:export2Window().
 * @暴露window事件
 */
MT.main.prototype.export2Window = function () {
  var room = MT.room,
    that = this;

  tools.debug('SDK => window export done...')

  // 设置全局变量 {MT}
  window.MT = {};
  window.MT.SYS_CODE = version
  // 系统代码
  window.MT.CODE = STATIC.CODE;
  // 静态资源
  window.MT.STATIC_HOST = STATIC.STATIC_HOST;
  // 自己
  window.MT.me = room.curUser;
  // 主播信息
  window.MT.zhubo = room.zhubo;
  // 直播标题
  window.MT.title = room.title;
  //额外信息
  window.MT.ext = room.ext;
  // 工具
  window.MT.tools = tools;
  // 直播状态
  window.MT.getLiveState = that.getLiveState;
  // SDK模式
  window.MT.getSDKMode = that.getSDKMode;
  // 直播时间
  window.MT.liveDuration = room.livingDuration || -1;
  // 通知&公告
  window.MT.announce = room.announce;
  // Flash调用方法
  window.MT.live = flashPlayer.windowInterface()
  //聊天
  window.MT.chat = chat;
  // 网络选择
  window.MT.network = network || {};
  // 查看详细信息
  window.MT.getDetail = member.getMemberDetail || {};
  // map
  // window.__map = map;
  //创建删除video audio
  window.MT.changeMediaElement = that.changeMediaElement;
  // map.get("room:init")();
  return MT;
};

/**
 * @获取 .MT 数据
 * @后面会陆续把window.MT删除
 */
MT.main.prototype.getMtData = function () {
  return MT.room;
};

/**
 * @MT.broadcastEventInit 持久化广播事件
 * @param {[cmds]} [初始化命令]
 * @event 监听事件：cmd:broadcast
 * @callback {MT.on("boradcast", ({message:"somecmd", __auto: "0/1"}))}
 */
MT.main.prototype.broadcastEventInit = function (cmds) {
  var that = this;
  if (typeof (cmds) !== "undefined" && cmds.length > 0) {
    for (var i = 0; i < cmds.length; i++) {
      var cmd = cmds[i]["cmd"],
        ret = cmds[i]["args"];
      that.get(cmd, ret);
      // 消息初始化操作
      cmdHandle.setting(cmd, ret);
    };
  }
};

/**
 * @MT.getModules 获取模块
 */
MT.main.prototype.getModules = function (callback) {
  if (typeof (callback) !== "undefined" && typeof (callback) === "function") {
    callback(MT.room.modules);
  }
  return MT.room.modules;
};

/**
 * @name 播放器模式切换函数
 * @note 切换播放器模式
 * @params flash / flv / hls ...
 * @callback none
 */
MT.main.prototype.playerTechOrder = function (type) {
  player.setPlayerTechOrder(type)
}

/**
 * @ destroy() 销毁对象
 */
MT.main.prototype.destroy = function () {
  // 关闭网络
  network.reset()
  // socket
  socket.destroy()
  // 视频 & 画板
  player.destroyAll()
  // 销毁
  queue.destroy()
  // MT
  if (window.MT) {
    window.MT = null
  }
  window.MT = {
    SDK: _mtCopy
  }
};

/**
 * @interface for PPTPreview
 * @MT.pptPreview 交互
 * @param {[dom]} [传入信息]
 */
MT.main.prototype.pptPreview = function (opts) {
  var baseOpt = {
    wrap: null,
    callback: null,
    next: null,
    prev: null
  }
  baseOpt = Object.assign(baseOpt, opts)
  pptPreview.init(baseOpt)
  // return Promise.resolve(wrapDom)
}

/**
 * @Interface for listen(socket)
 * @监听socket事件
 * @param {socket} Socket
 */
MT.main.prototype._listen = function (_socket) {
  var _ts = this;

  // 聊天队列注册
  queue.init('chat:send', {
    "min_run_num": 1,
    "max_queue_time": 5000,
    "max_queue_len": 1000,
    "callback": function (v) {
      packetCall(v);
    }
  });

  // on _broadcast
  var obj = {};

  // Socket:包处理
  var packetCall = function (_obj) {
    tools.debug("obj===>", _obj);
    if (typeof _obj !== "undefined") {
      // is Event in maplist

      // Trigger the Special Events
      try {
        var _ori = _obj;
        var handleRes = _ts.packetHandler(_obj);
        if (handleRes) {
          if (tools.isMobileSDK() && tools.getSDKMode() == 2) {
            _ori.args = handleRes;
            window.SDK.broadcast(_ori);
          } else {
            var onEvent = map.get(_obj.cmd);
            onEvent(handleRes);
            map.get('_liveIframe:broadcast')(_obj.cmd, handleRes);
          }
        }
      } catch (err) {
        // throw new Error("方法未定义");
        tools.debug(err);
      }
    }
  };


  // 未压缩命令
  _socket.on('_broadcast', function (packet) {
    // tools.debug('socket on : _broadcast', packet);
    // 压缩
    /*try{
    	//packet = JSON.parse(packet);
    }catch(err){
    	tools.debug("===>_broadcast Error", err);
    }*/
    // package
    tools.debug("package=====> ", packet);
    // 单条命令处理
    if (typeof packet.cmd !== 'undefined') {
      // 排除
      var obj = socket.onBroadcast(packet);
      if (obj && obj.cmd && obj.cmd == 'chat:send') {
        //for(var j=0;j<500;j++){//测试，重复500条
        queue.add(obj.cmd, obj);
        //}
      } else {
        // 调用packet
        packetCall(obj);
      }

      // 批量命令处理
    } else if (packet.length) {
      //多命令缓冲
      // [{cmd:'cmd1',args:[]},{cmd:'cmd2',args:[]}]
      for (var i = 0, l = packet.length; i < l; i++) {
        var obj = socket.onBroadcast(packet[i]);
        if (obj && obj.cmd && obj.cmd == 'chat:send') {
          queue.add(obj.cmd, obj);
        } else {
          // 调用packet
          packetCall(obj);
        }
      }
    }
  });

  // 服务器压缩命令
  _socket.on('_bro:zip', function (packet) {
    // tools.debug('socket on : _broadcast:zip', packet);
    // 压缩
    try {
      packet = pako.inflate(packet, {
        to: 'string'
      }); // json string
      packet = JSON.parse(packet);
    } catch (err) {
      tools.debug("_bor:zip ERROR====> ", err.message);
    }
    // package
    //tools.debug("package=====> ",packet);
    // 单条命令处理
    if (typeof packet.cmd !== 'undefined') {
      // 排除
      obj = socket.onBroadcast(packet);
      // 调用packet
      packetCall(obj);
      // 批量命令处理
    } else if (packet.length) {
      //多命令缓冲
      // [{cmd:'cmd1',args:[]},{cmd:'cmd2',args:[]}]
      for (var i = 0, l = packet.length; i < l; i++) {
        obj = socket.onBroadcast(packet[i]);
        packetCall(obj);
      }
    }
  });
};

// window 暴露调试
MT.main.prototype._windowDebugger = function () {
  window.__Tmedia__ = media
  window.__Tlog__ = log
  window.__Tstore__ = Store
  window.__Troom__ = room
  window.__Tsocket__ = socket
  window.__Tmap__ = map
  window.__Tplayer__ = player
  window.__member__ = member
  window.__Twb__ = whiteboardPlayer
}

/**
 * @Interface for emit(eventName, package, callback)
 * @发送socket方法
 * @param {eventName} String
 * @param {packet} Object{key: value}
 * @param {callback} Function
 */
MT.main.prototype.emit = function () {
  var that = this,
    args = arguments.length,
    param = arguments;
  tools.debug("emit===>", param, socket.connectSuc);
  // 发送命令
  if (socket.connectSuc) {

    // 处理内部指令(本地截取)
    var isSpecial = that.emitTrigger(param);
    if (isSpecial) {
      return false;
    }

    // package
    var _package = {
      cmd: param[0]
    };

    // 2项参数: ("test:Evetn", callback(ret))
    if (args === 2) {
      if (typeof param[0] === "string" && typeof param[1] === "function") {
        var eventName = param[0],
          callback = param[1];
        socket.emit(eventName, function (retval) {
          callback(retval);
          _package.args = retval;
          that.packetHandler(_package);
        });
      }
    }
    // 3项参数: ("test:Event", {param: obj} || obj, callback(ret))
    else if (args === 3) {
      if (typeof param[0] === "string" &&
        typeof param[1] !== "undefined" &&
        typeof param[2] === "function") {
        var eventName = param[0],
          packet = param[1],
          callback = param[2];
        if (eventName === 'chat:send') {
          if (packet.msg) {
            packet.msg = chat.toUBB(packet.msg);
          }
        }
        socket.emit(eventName, packet, function (retval) {
          // todo something...
          if (retval.code === STATIC.CODE.SUCCESS) {
            callback(retval);
            _package.args = retval;
            that.packetHandler(_package);
          } else {
            callback(retval);
          }
        });
      }
    } else {
      //TODO... 
      return param;
    }
  }
  // 报错
  else {
    map.get("emit:error")(STATIC.SOCKET_CONNECT_NOTE);
    // alert(STATIC.SOCKET_CONNECT_NOTE+": "+eventName);
  }
};

/**
 * @聊天模块 from chat.js
 * 删除
 * 回复
 */
MT.main.prototype.chat = {
  delete: chat.delete,
  reply: chat.reply,
  private: chat.private
};

/**
 * @Interface for on(eventName, callback).
 * @用于注册监听事件
 * @param {eventName} String
 * @param {callback} Function
 */
MT.main.prototype.on = function (eventName, callback) {
  if (typeof eventName !== "undefined" && eventName.length > 0 && typeof eventName === "string" && typeof callback !== "undefined" && typeof callback === "function") {
    // 注册事件到maplist
    map.put(eventName, callback);
    // 注册到 vodLive 队列
    // vodLive.register(eventName, callback)
  } else {
    alert(STATIC.MT_ADDMAPLIST_ERROR + ": " + eventName);
  }
};

/**
 * @Interface for get(eventName, callback).
 * @用于调用已注册事件
 * @param {eventName} String
 * @param {callback} Function
 */
MT.main.prototype.get = function (eventName, callback) {
  if (typeof eventName !== "undefined" && eventName.length > 0 && typeof eventName === "string") {
    // 调用maplist的事件
    map.get(eventName)(callback);
  } else {
    alert(STATIC.MT_ADDMAPLIST_ERROR + ": " + eventName);
  }
};

/**
 * @Interface for {pc.player.js} => player.mainPlayer(playerId, callback)
 * @PC & H5直播播放器
 * @NOTE 后期将会废弃该方法，改用 Video 替代，画板将用 Whiteboard 替代 ###
 * @param {containerId} String 播放器容器ID
 * @param {playerId} String 播放器ID
 * @param {callback} Function 播放器回调函数
 */
MT.main.prototype.mainPlayer = function (containerId, playerId, callback) {
  var args = arguments;
  fires.join('live:main:player', {
    parent: this,
    callback: function () {
      var that = this;
      // H5播放器
      player.mainPlayer(containerId, playerId, callback)
      // callback
      player.videoRun()
    }
  })
};

/**
 * @note v2.1新增 => 不断流独立模块
 * @Type Media播放器(video)
 * @param {wrapId} 播放器容器id
 */
MT.main.prototype.mediaPlayer = (wrapId, playerId, callback) => {
  fires.join('media:player', {
    parent: this,
    callback: function () {
      player.mediaPlayer(wrapId, playerId, callback)
    }
  })
}

/**
 * @note v2.0新增 => 独立课件模块
 * @Type 课件播放器(whiteboad)
 * @param {wrapId} 播放器容器id
 */
MT.main.prototype.whiteboardPlayer = (wrapId, playerId, callback) => {
  fires.join('whiteboard:player', {
    parent: whiteboardPlayer,
    callback: function () {
      player.whiteboardCore(wrapId, playerId, callback)
    }
  })
}

/**
 * @note v2.0新增 => 视频独立模块
 * @Type 桌面分享 & 视频插播 播放器
 * @param {wrapId, playerId} 容器id, 播放器id
 */
MT.main.prototype.videoPlayer = function(wrapId, playerId) {
  this.mainPlayer.apply(this, arguments)
}

/**
 * @Interface for {pc.player.js} => player.camera(playerId, callback)
 * @PC摄像头播放器
 * @param {containerId} String 播放器容器ID
 * @param {playerId} String 播放器ID
 * @param {callback} Function 播放器回调函数
 */
MT.main.prototype.camera = function (containerId, playerId, callback) {
  var args = arguments
  // 注册摄像头
  player.camera.apply(player, arguments)
  // 异步执行
  fires.join('live:camera:player', {
    parent: this,
    callback: function () {
      var that = this;
      player.cameraRun()
    }
  })
};
/**
 * @Interface for {pc.player.js} => player.mainPlayer(playerId, callback)
 * @PC & H5直播播放器
 * @param {containerId} String 播放器容器ID
 * @param {playerId} String 播放器ID
 * @param {callback} Function 播放器回调函数
 */
MT.main.prototype.livePlayer = function (containerId, playerId, callback) {

  var that = this;

  // 保存数据
  livePlayer.containerId = containerId;
  livePlayer.playerId = playerId;
  livePlayer.playerCallback = callback;

  // 主播放器回调函数
  // this.on("livePlayerCallback", callback);

  // 包含
  tools.debug("create liveplayer ...", that.isLivePlayerCanCreate, liveplayerCon);
  var liveplayerCon = document.getElementById(containerId);
};

/**
 * @Interface for member(callback)
 * @在线用户列表
 * @param {callback} Function
 */
MT.main.prototype.member = function (callback) {
  // userlist
  if (socket.connectSuc) {
    callback(member.userList);
  } else {
    return false;
  }
};

/**
 * [getQuestion 初始化获取问题列表]
 * @param  {Function} callback [回调函数]
 * @returns {[objcet]} [返回问题列表]
 */
MT.main.prototype.getQuestion = function (callback) {
  question.getList(room.getAccessToken(), callback);
};

/**
 * [cmd.handle 信息发射器(iFrame, Talkfun-Browser)等...]
 * @param 
 * @String => cmd 
 * @JSON-Object => args
 * @Demo => "cmd":"flash:check", "args":{"stat":"0"}
 * Void
 * @type 1: A=>B 单向传输; 2: A <==> B 双向传递; 3: X ==>(client) 内部处理
 */
MT.main.prototype.cmdHandleEmit = function (cmd, args, type) {
  cmdHandle.sendMsgToClient(cmd, args, type);
};

/**
 * [cmd.handle 接收iframe / py.信息
 * @param 
 * @String => cmd 
 * @JSON-Object => args
 * @Demo => "cmd":"flash:check", "args":{"stat":"0"}
 * Void
 */
MT.main.prototype.cmdHandleOn = function (cmd, callback) {
  cmdHandle.on.apply(this, arguments)
};

/**
 * [plugins 加载插件]
 * @param  {object} type [插件类型]
 * @returns {[objcet]} [返回插件方法]
 */
MT.main.prototype.plugins = function (type) {
  // [投票, 鲜花, 抽奖, 评分]
  // switch (type) {
  //   case "vote":
  //     return plugins.vote;
  //   case "flower":
  //     return plugins.flower;
  //   case "lottery":
  //     break;
  //   case "score":
  //     break;
  //   case "iframe":
  //     return plugins.iframe;
  // };
  if (plugins[type]) {
    return plugins[type]
  }
  return plugins;
};

/**
 * @playerResize 拉伸canvas[播放器]尺寸
 * @param width
 * @param height
 * 宽高
 */
MT.main.prototype.playerResize = function (width, height) {
  if (player.resize) {
    return player.resize(width, height)
  }
};

// 播放
MT.main.prototype.play = function () {
  player.play()
};

// 暂停
MT.main.prototype.pause = function () {
  player.pause()
};

// 重载
MT.main.prototype.reload = function () {
  player.reload()
}

// 线路选择
MT.main.prototype.setLine = function (key) {
  media.setLine(key)
}
MT.main.prototype.manager = manager

// exports
export default MT
