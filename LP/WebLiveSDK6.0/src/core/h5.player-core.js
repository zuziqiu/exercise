/**
 * ## h5.player.js => v2 版本携带 flv.js ##
 */
/* jshint esversion: 6 */
// define(function (require) {
import tools from "../utils/tools"
import map from "../utils/map"
import schedule from '../utils/schedule'
import STATIC from './mt.static'
import sdkRoom from './room.init'
import network from './network'
// import
import log from './log';
import media from './mediaCore'
import core from './player.core'
// import flvPlayer from './flv.player'
// import hlsPlayer from './hls.player'
import whiteboardPlayer from './whiteboard.player'
import desktop from './live-desktop'
import pptPreview from './pptPreview'
import Store from './store'
import * as TYPES from './store/types'
import playerEvent from './player.event'
import rtsPlayer from './rts.player'

//$(document).disableSelection();
var COMMAND_START = 'start'; //直播开始
var COMMAND_STOP = 'stop'; //直播结束
var COMMAND_WAIT = 'wait'; //直播未开始
// 基础
var COMMAND_GRAFFITI = 1; //涂鸦,清空画笔
var COMMAND_IMAGE = 11; //图片
var COMMAND_TEXT = 15; //文字
var COMMAND_CIRCLE = 16; //画圆
var COMMAND_ERASER = 20; //橡皮擦
var COMMAND_DRAW = 25; //画画
var COMMAND_DRAW_LIST = 31; //批量
var COMMAND_PAGE = 51; //翻页
var COMMAND_ARROW = 51; //箭头
var COMMAND_CAMERA_START = 101; //摄像头启动 
var COMMAND_CAMERA_STOP = 102; //摄像头关闭
var COMMAND_MODE_CHANGE = 151; //模式切换

//视频流
var COMMAND_DESKTOP_START = 201; //桌面分享开始     
var COMMAND_DESKTOP_STOP = 202; //桌面分享结束
var COMMAND_DESKTOP_PAUSE = 203; //桌面分享暂停
var COMMAND_VIDEO_START = 103; //推流开始
var COMMAND_VIDEO_STOP = 104; //推流结束

var COMMAND_IMAGE_PRELOAD = 1111; //TODO:图片预加载
var COMMAND_POINTER = 210; //TODO:教棍

//指令选项
var COMMAND_OPTIONS_ACTION_ADD = 1; //新增
var COMMAND_OPTIONS_ACTION_MOVE = 2; //移动

var COMMAND_OPTIONS_VISIBLE_SHOW = 1; //展示
var COMMAND_OPTIONS_VISIBLE_HIDE = 0; //隐藏

var width = 0;
var height = 0;

// load for client

let player = {
  action: 'wait',
  playerInit: false, //播放器是否完成初始化
  room: null,
  playNumber: 1,
  stream: null,
  page: 0,
  st: 0,
  ba: 0,
  bn: 0,
  bx: 0,
  waitLastTime: 0,
  _roomCurrentTime: 0,
  curLastTime: 0,
  countdownTime: 0,
  cameraVideoDom: null,
  isDisableDraws: false,

  // 当前文档
  curDocument: null,

  // 播放器
  width: width, //主播放器当前宽度(4:3)
  height: height, //主播放器当前高度(4:3)

  // PPT
  pptWidth: 1280, //基图原始的宽度
  pptHeight: 960, //基图原始的高度

  // 播放器画板(点线面通过这个比例传输)
  drawWidth: 1280,
  drawHeight: 960,

  // 比例尺
  pptRate: 0.75, //高宽比
  pptMatrix: [], //PPT(canvas)控制矩阵
  imgMatrix: [], //PPT(image)矩阵

  // 白板
  whiteBoardWidth: 800,
  whiteBoardHeight: 600,

  // 比例4:3
  ratio: 0.75,
  rwidth: 800,
  rheight: 600,
  cameraWidth: 280, //摄像头宽度
  cameraHeight: 210, //摄像头高度

  // 播放器 
  mainContainerId: null,
  mainPlayerId: null,

  // 摄像头播放器
  cameraContainerId: null,
  cameraPlayerId: null,

  pageRatio: 0.75,

  // 画布元素对象(Oject[key, obj])方式存储
  pages: {},
  commands: {},
  canvasObj: {},
  imageObj: {},
  textObj: {},
  strokeObj: {},
  circleObj: {},
  drawObj: {}, // 画板对象
  ctx: {},
  lineObj: {},
  dottedLineObj: {},
  rectangleObj: {},
  arrowObj: {}, //arrowObj[objectId] 存储3个Canvas内置对象(箭头直线,箭头两端分叉线)

  // 延迟时间
  durationTimmer: null,

  // 初始化 step 数据序列化
  doStep: function (data) {
    // Step.
    var that = this
    if (!this.steploaded) {
      let _data = Store.getters('getInitData')
      tools.debug('init do step ==> data->', _data)
      var step, stepCount = 8;
      // var _data = state.global.data
      if (!_data || !_data.InitData) {
        return false
      }
      var initData = _data.InitData
      for (var i = 1; i <= stepCount; i++) {
        step = 'step' + i;
        tools.debug(`step==>[${i}] ${initData[step]}`)
        if (initData[step]) {
          that.execute(initData[step]);
          map.get('ppt:player:loaded')()
        }
        // 判断初始化是否存在画板
        if (i === 2) {
          var hasWhiteboard = (typeof (initData[step]) === 'string' && initData[step].length > 0 ? true : false)
          map.get('live:has:whiteboard')(hasWhiteboard);
        }
        // 初始化摄像头
        if (i == 4 && !initData[step]) {
          map.get('camera:stop')()
        }
      }
      this.steploaded = true
    }
  },

  // 获取step[index]
  getStep: function (stepIndex) {
    return media.getStep(stepIndex)
  },

  // 内部事件监听
  on: function (eventName, payload) {
    tools.debug('h5Player on event ==>', eventName, payload)
    switch (eventName) {
      // 结束直播
      case 'live:on:stop':
        this.stop()
        break
      // 超时统计
      case 'live:video:timeout':
        var qa = playerEvent.getQAData()
        var sdata = this.getStatisData(qa)
        log.play(sdata)
        break
      default:
        break
    }
  },

  // 初始化
  init: function () {

    // 提前设置拉流地址
    media.statePreSet()

    // 外部传入 => techOrder
    var opts = Store.getters('getExtData')
    if (opts && opts.config && opts.config.techOrder) {
      media.setTechOrder(opts.config.techOrder)
    }
    // 读取 initData 默认值 
    else {
      media.setTechOrder()
    }

    // 媒体断流超时
    playerEvent.listen(STATIC.player.MAX_PULL_STREAM_ERROR, t => {
      map.get('live:video:fail')()
    })

    // 初始化播放器
    this.initPlayer()
  },

  // 初始化播放
  initPlayer: function () {
    const room = Store.getters('getInitData')
    var that = this
    tools.debug('=====> H5 v2 ROOM <=======', room);
    this.room = room;
    var initData = room.InitData;
    tools.debug('=====h5 player init=======', initData);

    // 直播标题
    if (initData.title) {
      this.liveTitle = initData.title;
    }
    // 涂鸦任务队列(直播)
    schedule.set('delayDuration', room.cmdDelay)
    schedule.set('cmdDelay', room.cmdDelay)
    schedule.run(core.playType)
    // waiting
    if (initData.action === 'wait') {
      this.wait();
      return;
    }
    // stop
    if (initData.action === 'stop') {
      this.stop();
      return;
    }
    // start
    if (this.action === 'start') {
      // schedule.initDuration = room.live.duration;
      schedule.set('initDuration', room.live.duration)
    }
    // 初始化step
    this.doStep()
  },

  // 执行 whiteboard
  fireWhiteboard: function () {
    var that = this
    // Flash播放器todo...
    media.emit('ppt:player', this)
    return Promise.resolve()
  },

  // 销毁全部
  destroyAll: function () {
    tools.debug('## Destroy All! ##')
    return new Promise((resolve, reject) => {
      media.emit('media:destroy', 'global')
      media.emit('media:destroy', 'camera')
      media.emit('media:destroy', 'video')
      media.emit('flash:destroy:all')
      // 停止统计
      this.statsStop()
      log.destroy()
      // 销毁完成 => 初始化新
      if (whiteboardPlayer.whiteboardObject) {
        media.emit('ppt:destroy', (isDone) => {
          resolve(isDone)
        })
      } else {
        resolve(true)
      }
    })
  },

  // 销毁
  videoPlayer: {
    destroy: function () {
      // destroy
      tools.debug('camera player destroy!')
    },
    disposeAll: function () {
      this.playerInit = false
      this.clearPageCommands()
    }
  },
  // whiteboad-v3版本
  loadWhiteboardV3: function () {
    // todo...
  },
  config: function (options) {
    if (typeof options === 'object') {
      if (options.width) {
        this.cameraWidth = parseInt(options.width);
      }
      if (options.height) {
        this.cameraHeight = parseInt(options.height);
      }
      if (options.playType) {
        this.playType = options.playType;
      }
    }
  },
  // 设置声音
  volume: function (volume) {
    tools.debug('H5 Volume set ==> ', volume)
    // range 0 - 1
    if (volume > -1) {
      media.getPlayer().then(player => {
        player.volume(volume)
      })
    }
  },
  // 比例计算
  getRatio: function (width, height) {
    var that = this;
    var ratio = that.pageRatio;
    var pptCon = document.querySelector('#' + this.mainContainerId)
    if (!pptCon) {
      return {
        width: width,
        height: height
      }
    }
    var w = width || pptCon.clientWidth;
    var h = height || pptCon.scrollHeight;
    var _w, _h;
    // 大于正常比例
    if ((w / h) > ratio) {
      _w = h * ratio;
      _h = h;
    } else {
      _w = w;
      _h = w / ratio;
    }
    return {
      width: _w,
      height: _h
    }
  },
  // sdk接口
  getSDK: function () {
    return SDK;
  },
  // 画板播放器
  whiteboardCore: function (containerId, playerId, callback) {
    // update whiteboard player
    Store.commit(TYPES.UPDATE_WHITEBOARD_DOM, {
      wrapContainer: containerId,
      playerId: playerId,
      callback: callback
    })
    // whiteboardPlayer.init()
    this.fireWhiteboard()
  },
  // 单流播放器
  mediaPlayer: function (containerId, playerId, callback) {
    tools.debug('init mediaPlayer =>', containerId, playerId)
    var that = this
    let _dom = document.querySelector('#' + containerId)
    if (typeof callback === "function" && _dom) {
      callback.call(_dom)
    }
    // update main player
    Store.commit(TYPES.UPDATE_MEDIA_DOM, {
      wrapContainer: containerId,
      playerId: playerId,
      callback: callback
    })
  },
  // 主播放器
  mainPlayer: function (containerId, playerId, callback) {
    tools.debug('init mainPlayer =>', containerId, playerId)
    var that = this
    core.mainContainerId = this.mainContainerId = containerId;
    this.playerCallback = callback;
    that.mainContainerId = containerId
    that.playerId = playerId
    let _dom = document.querySelector('#' + containerId)
    if (typeof callback === "function" && _dom) {
      // callback.call(_dom)
    }
    // update main player
    Store.commit(TYPES.UPDATE_VIDEO_DOM, {
      wrapContainer: containerId,
      playerId: playerId,
      callback: callback
    })
    // 创建容器
    media.getVideoDom('video', true)
  },
  // 摄像头播放器
  camera: function (containerId, playerId, callback) {
    tools.debug('init Camera =>', containerId, playerId)
    var that = this
    this.cameraContainerId = containerId;
    this.cameraPlayerId = playerId;
    this.cameraCallback = callback;
    // update dom
    Store.commit(TYPES.UPDATE_CAMERA_DOM, {
      wrapContainer: containerId,
      playerId: playerId,
      callback: callback
    })
    // 只创建容器
    media.getVideoDom('camera', true)
  },
  // 执行camera方法[step]
  cameraRun: function () {
    this.doCameraStep()
    media.emit('camera:player')
  },
  // 执行video方法
  videoRun: function () {
    media.emit('video:player')
  },
  // 执行step
  doCameraStep: function () {
    // 跑 => step 1,3,4,6
    var exeAry = [
      media.getStep(1),
      media.getStep(3),
      media.getStep(4),
      media.getStep(6)
    ]
    exeAry.forEach(item => {
      if (item) {
        this.dispatch(item)
      }
    })
  },

  // 切换播放器类型
  setPlayerTechOrder: function (otype) {
    let supportTypes = ['FLASH', 'FLV', 'HLS']
    otype = otype.toLocaleUpperCase()
    if (supportTypes.indexOf(otype) === -1) {
      tools.warn('请正确输入切换模式 ==>', otype)
      return false
    }
    // same order
    let techOrder = Store.getters('getTechOrder')
    if (techOrder === otype) {
      return false
    }
    media.emit('player:tech:order', otype)
    // 销毁当前播放器 ==> 重新初始化
    this.destroyAll().then(() => {
      media.setTechOrder(otype)
    })
  },

  // 切换视频源(网络选择)
  changeSource: function (ret) {

    // demo format
    var that = this,
      url = "",
      liveMediaUrl = "",
      vpath = "",
      vStream = "";

    tools.debug("source-currentMode ==> " + core.currentMode);

    // 通过stream返回地址(新版本)
    if (ret.curSourceStream) {
      if (core.currentMode == core.constant.MODE_DESKTOP) {
        vStream = ret.curSourceStream;
      }

      // 课件模式
      else if (core.currentMode == core.constant.MODE_EDUCATION) {
        // vpath = that.videoStreamPath.split("|");
        vStream = ret.curSourceStream;
      }
    }
    // 旧版本
    else {
      // 桌面分享 
      if (core.currentMode == core.constant.MODE_DESKTOP) {
        vpath = desktop.desktopStreamPath.split("|");
        vStream = desktop.desktopStreamPath;
      }

      // 课件模式
      else if (core.currentMode == core.constant.MODE_EDUCATION) {
        vpath = that.videoStreamPath.split("|");
        vStream = that.videoStreamPath;
      }
    }

    tools.debug("stream ===> ", vpath);

    // 选择网络
    if (ret.data && ret.data.length > 0) {
      that.getNGB(vStream, ret.data);
    }
    // change to Default
    else {
      var defaultStream = this.m3u8(vStream);
      tools.debug("Change to default ==> ", defaultStream);
      that.videoUrl = defaultStream;
    }

    // 当前stream信息
    that.curMeidaStream = vStream;

    // 重新加载源视频
    this.mediaReload();
  },

  // NGB模式
  getNGB: function (vStream, ngbList) {
    var that = this,
      url = "",
      list = ngbList,
      length = list.length - 1,
      ran = Math.round((Math.random() * length)),
      ranIp = list[ran] + "/";

    // 重组(NGB模式)
    url += STATIC.PROTOCOL + ranIp + core.stream2m3u8(vStream);

    // exports
    tools.debug("===> Change video source", url);
    that.videoUrl = url;
    return url;
  },

  // 重载
  reload: function () {
    media.reload()
  },

  // 线路选择
  lineSetting: function (key) {
    return media.setLine.call(media, key)
  },

  // 重载视频流
  mediaReload: function () {
    // 特殊参数放弃
    var isTest = window.location.href.match(/vreload=false/ig) || false;
    if (isTest) {
      return false;
    }
    var that = this;
    tools.debug("重新加载视频===>" + this.videoUrl);

    // 桌面分享
    if (core.currentMode == core.constant.MODE_DESKTOP) {
      desktop.videoUrl = this.videoUrl;
      desktop.reloadDesktop();
    }

    // 课件模式
    else if (core.currentMode == core.constant.MODE_EDUCATION) {
      // var camera = that.getCamera();
      that.videoEmitPlay()
    }
  },

  // safari 下打开摄像头视频: 可配置 room.config.safariOpenVideo
  isOpenSafariVideo: function () {
    if (sdkRoom.configs && sdkRoom.configs.safariOpenVideo) {
      return true;
    }
    return false;
  },

  // Audio创建规则
  // IOS版本 <8 创建audio
  isCreateAudio: function () {
    var that = this;
    return false
  },
  // 音视频元素切换
  toggleMeidaElement: function () {
    var element = document.getElementById(this.cameraPlayerId),
      that = this;
    if (element) {
      document.body.removeChild(element);
    }
  },
  // 设置&获取摄像头
  getCamera: function (type) {
    tools.warn('get camera...')
  },

  // 设置标签
  changeMediaElement: function (obj) {
    var that = this;
    //Oject.data.type ==> video / audio
    if (obj) {
      tools.debug('getCamera 6')
      var type = obj.data.type,
        mediaObject = that.getCamera();
      clearInterval(that.durationTimmer);
      mediaObject.pause();
      var element = document.getElementById(this.cameraPlayerId);
      element.parentNode.removeChild(element);
      tools.debug('getCamera 7')
      that.getCamera(type);
    }
  },

  // 播放次数计数
  // 暂停情况自动归零
  playTimes: 0,

  // 非手动暂停情况下执行该方法：
  // 退出微信重新进入
  // video.bufferd [判断?]
  // timeupdate 计数
  resumePlay: function (target) {
    var that = this;
    if (that.playTimes === 1) {
      tools.debug("do resumePlay......");
      that._roomCurrentTime = 0;
      target.load();
      that.elementPlay()
    }
  },

  // 设置 时间轴 ==> 命令
  startDurationTimmer: function () {
    var that = this;
    if (!that.durationTimmer) {
      // 原生
      // H5
      tools.debug('getCamera 1')
      var element = this.getCamera();
      that.durationTimmer = setInterval(function () {
        if (element.currentTime) {
          that.currentTime = element.currentTime;
          schedule.setPlayDuration(element.currentTime);
          map.get('live:duration')(element.currentTime, that.duration, element.currentTime / that.duration);
        }
      }, 100);
    }
  },

  // 设置src
  // 得到播放流 => 重新开始播放
  videoEmitPlay: function (playUrl) {
    tools.debug('play with handle ...')
    var that = this
    var _playUrl = playUrl || this.videoUrl
    // 微信端
    if (tools.isWechat()) {
      // 执行播放(必须执行一次)
      that.elementPlay();
      // 微信自动播放注册
      tools.detectiveWxJsBridge(function () {
        tools.debug('Autoplay by Wechat...')
        that.elementPlay();
      });
    }
    // H5常规播放
    else {
      that.elementPlay();
    }
    this.playTimes += 1;
  },
  // 触发播放
  elementPlay: function (videoDom) {
    // 播放
    if (media.curPlayerObject) {
      media.curPlayerObject.play()
    }
  },
  // play
  play: function () {
    tools.debug('<==== H5 Start Playing ====> ' + core.currentMode);
    var that = this;
    // camera播放
    if (core.currentMode == core.constant.MODE_EDUCATION) {
      // that.videoEmitPlay()
    }
    // desktop播放
    else if (core.currentMode == core.constant.MODE_DESKTOP) {
      desktop.play();
    }
    // 统一播放方法
    that.videoEmitPlay()
    media.emit('live:video:play', 'play')
  },
  pause: function () {
    tools.debug('<====== Pause ======>');
    core.setPlayerStatus('pause')
    media.emit('live:video:pause', 'pause')
  },
  // 权限切换
  livePowerChange: function (cmd) {
    this.commands = {}
    media.emit('live:power:change', cmd)
    map.get('live:power:change')(cmd)
  },
  // 设置直播标题
  getTitle: function (command) {
    if (command.title && command.title.length > 0) {
      this.liveTitle = command.title;
      return command.title;
    }
  },
  // 是否白板
  isWhiteBoard: function (page) {
    return page > 10000 ? true : false;
  },
  // socket 执行 whiteBoard
  whiteBoardOnSocket: function (packet) {
    tools.debug('Whiteboard on socket...', packet)
    var res = packet.args;
    var that = this;
    // 设置直播标题
    that.liveTitle = that.getTitle(res);
    if (!res.metadata) {
      return;
    }
    try {
      // 广播指令
      media.emit('socket:cmd', res.metadata)
      // 执行dispatch
      var command = JSON.parse(res.metadata);
      // 设置step
      media.setStep(command.t, command)
      // 当切换课件清空之前课件内容
      if (!that.isWhiteBoard(command.t) && command.t == core.COMMAND.PAGE) {
        that.clearPageCommands();
      }
      // 一开始发送指令立刻执行
      if (command.st == 0) {
        this.dispatch(command)
      }
      // todo...
      if (command.st < this.st) {
        // return;
      }
      this.st = command.st
      // [延迟]队列属性
      // ## 以下指令将会做视频同步延迟处理 ##
      if (
        // 视频类
        command.t == core.COMMAND.VIDEO_START ||
        command.t == core.COMMAND.VIDEO_STOP ||
        command.t == core.COMMAND.CAMERA_START ||
        command.t == core.COMMAND.CAMERA_STOP ||
        command.t == core.COMMAND.DESKTOP_START ||
        command.t == core.COMMAND.DESKTOP_STOP ||
        command.t == core.COMMAND.MODE_CHANGE ||
        // 图形类
        command.t == COMMAND_IMAGE ||
        command.t == COMMAND_TEXT ||
        command.t == COMMAND_CIRCLE ||
        command.t == core.COMMAND.RECTANGLE ||
        command.t == core.COMMAND.TRIANGLE ||
        command.t == core.COMMAND.LINE ||
        command.t == core.COMMAND.DOTTED_LINE ||
        command.t == COMMAND_DRAW_LIST ||
        command.t == COMMAND_ERASER ||
        command.t == COMMAND_DRAW ||
        command.t == COMMAND_GRAFFITI ||
        command.t == COMMAND_PAGE ||
        command.t == core.COMMAND.ARROW ||
        command.t == core.COMMAND.POINTER
      ) {
        command.receiveTime = tools.now();
        schedule.addSchedule(command.st, command, function (command) {
          tools.debug('schedule execute ==>', command);
          that.dispatch(command, true)
        });
      }
      // 不属于同步队列中的指令,立刻执行
      else {
        this.dispatch(command)
      }
    } catch (err) {
      tools.debug('[ERROR]Command parse onError ==>', err)
    }
  },
  // 分发指令, 命令切割
  dispatch: function (command, push) {
    tools.debug("command dispatch do ==>", command);
    try {
      if (typeof command === 'string') {
        command = JSON.parse(command);
      }
      // 批量指令
      if (command.t == COMMAND_DRAW_LIST) {
        let jsonCommand;
        for (let i = 0; i < command.d.length; i++) {
          jsonCommand = JSON.parse(command.d[i]);
          if (push) {
            this.pushCommands(command);
          }
          this.execute(jsonCommand);
        }
      }
      // 单条指令
      else {
        if (push) {
          this.pushCommands(command);
        }
        // 单条数据
        this.execute(command);
      }
    } catch (e) { }
  },
  initStorage: function () {
    this.st = 0;
    this.pages = {};
    this.commands = {};
    this.imageObj = {};
    this.textObj = {};
    this.strokeObj = {};
    this.circleObj = {};
    this.drawObj = {};
    this.canvasObj = {};
    this.ctx = {};
    // core.initialize();
  },
  // 推送指令
  pushCommands: function (command) {

    var that = this;

    // 默认
    if (tools.in_array(command.t, [
      COMMAND_IMAGE,
      COMMAND_TEXT,
      COMMAND_CIRCLE,
      COMMAND_ERASER,
      COMMAND_DRAW,
      COMMAND_GRAFFITI,
      core.COMMAND.LINE,
      core.COMMAND.DOTTED_LINE,
      core.COMMAND.RECTANGLE,
      core.COMMAND.TRIANGLE,
      core.COMMAND.RUBBER,
      core.COMMAND.ARROW
    ])) {

      // 当前页没指令
      if (!this.commands[command.p]) {
        this.commands[command.p] = [];
      }

      // 按页码插入指令
      this.commands[command.p].push(command);
    }

    // 翻页指令操作
    else if (command.t == COMMAND_PAGE) {

      // baseUrl
      var baseUrl = command.c.split('|')[0];
      if (!this.isWhiteBoard(command.p)) {

        //白板没有清空指令
        var currentPage = this.getPage(command.p);

        // 当前页
        if (currentPage) {
          var currentContent = currentPage.c.split('|');
          // 如果更换页面清空当前页指令
          if (baseUrl != currentContent[0]) {
            //更换PPT，清空当前页的指令
            this.flushCommands(command.p);
          }
        }
      }
      this.pages[command.p] = command;
    }
  },
  // 清空当前页面指令
  flushCommands: function (page) {
    if (this.commands[page]) {
      delete this.commands[page];
    }
  },

  // 指令是否在当前页(判断本页涂鸦)
  isCommandInCurrentPage: function (curPage) {
    tools.debug('page in command' + curPage, this.page)
    var curPage = parseInt(curPage);
    var thisPage = parseInt(this.page);
    return (curPage === thisPage);
  },

  // 获取当前页面指令
  getPage: function (page) {
    return this.pages[page];
  },
  // 执行指令
  execute: function (command) {
    if (typeof command === 'string') {
      try {
        command = JSON.parse(command);
      } catch (e) {
        return tools.debug('h5 player execute command error:' + e);
      }
    }
    tools.debug('###### H5 player execute ===>', command.t, ' #######')
    tools.debug(command);
    var content;
    var that = this;

    // 更新直播数据
    core.updateCourseData(command)

    // 设置title
    var _liveTitle = that.liveTitle;

    // 指令是否在当前页
    var isCanDo = false
    if (command.p) {
      // this.page = command.p
      isCanDo = that.isCommandInCurrentPage(command.p)
    }

    // 初始化(开始)
    if (command.t == COMMAND_START) {
      this.start(command, _liveTitle);
    }
    // 设置页面
    else if (command.t == COMMAND_PAGE) {
      this.setPage(command);
    }
    // 视频
    else if (command.t == COMMAND_VIDEO_START || command.t == COMMAND_VIDEO_STOP) {
      this.video(command);
    }
    // 摄像头
    else if (command.t == COMMAND_CAMERA_START || command.t == COMMAND_CAMERA_STOP) {
      this.cameraDo(command);
    }
    // ppt预加载
    else if (command.t == COMMAND_IMAGE_PRELOAD) {
      this.imagePreload(command);
    }
    // 权限切换
    else if (command.t == core.COMMAND.LIVE_POWER_CHANGE) {
      this.livePowerChange(command)
    }
    // 画板打开
    else if (command.t == core.COMMAND.WHITEBOARD_OPEN) {
      map.get('whiteboard:open')()
    }
    // 画板关闭
    else if (command.t == core.COMMAND.WHITEBOARD_CLOSE) {
      map.get('whiteboard:close')()
    }
    // 直播停止
    else if (command.t == COMMAND_STOP) {
      this.action = command.t
      this.stop(command.t);
    }
    // 直播模式切换
    else if (command.t == COMMAND_MODE_CHANGE) {
      tools.debug('live mode change ==> ' + command.t)
      this.modeChangeFlag = true;
      // 模式切换
      // 销毁对应媒体对象 => 创建新进的媒体对象 => 播放
      core.modeChange(command, function (beforeMode, currentMode) {
        let loopMode = Store.getters('getLoopMode')
        tools.debug('Live currentMode ==> ' + currentMode, 'LoopMode ==> ', loopMode)
        // [不断流]媒体切换位置
        if (loopMode == 1) {
          media.mediaReplace(currentMode)
          media.emit('media:change', currentMode)
        }
        // [切换断流]销毁
        if (loopMode == 0) {
          // 教育模式
          if (currentMode == core.constant.MODE_EDUCATION) {
            media.emit('media:destroy', 'video')
          }
          // 桌面模式
          else {
            media.emit('media:destroy', 'camera')
          }
        }
      });
    }
    //桌面模式开始
    else if (command.t == COMMAND_DESKTOP_START) {
      tools.debug('live desktop Start ==> ' + command.t)
      // 初始化桌面分享,需要执行模式切换
      if (!this.modeChangeFlag) {
        var modeChangeCommand = {
          st: 0,
          p: -1,
          c: "0|2",
          t: 151
        };
      }
      // 设置媒体数据
      if (command.streams) {
        media.setStreams(command.streams)
      }
      // 比例
      if (command.c) {
        media.setRatio(command.c, 'desktop')
      }
      // 开始桌面分享
      desktop.start(command);
    }
    //桌面模式暂停
    else if (command.t == COMMAND_DESKTOP_PAUSE) {
      // 初始化桌面分享,需要执行模式切换
      if (!this.modeChangeFlag) {
        var modeChangeCommand = {
          st: 0,
          p: -1,
          c: "0|2",
          t: 151
        };
        // core.modeChange(modeChangeCommand);
      }
    }
    //桌面模式停止(自动切换教育模式)
    else if (command.t == COMMAND_DESKTOP_STOP) {
      desktop.stop(command);
    }
    // desktop && camera 推流成功监听
    if (command.t == COMMAND_VIDEO_START || command.t == COMMAND_DESKTOP_START) {
      Store.commit(TYPES.UPDATE_LOOP_MODE, command.lp || 0)
    }
    // 图形处理
    this.graphExecute(command)
  },

  // 画板图形处理
  graphExecute: function (command) {
    // 图形处理
    var drawTarget = [
      COMMAND_ARROW,
      COMMAND_DRAW,
      COMMAND_GRAFFITI,
      COMMAND_CIRCLE,
      COMMAND_IMAGE,
      core.COMMAND.RECTANGLE,
      core.COMMAND.TRIANGLE,
      core.COMMAND.LINE,
      core.COMMAND.DOTTED_LINE,
      core.COMMAND.TEXT,
      core.COMMAND.POINTER
    ]
    // todo...
    if (drawTarget.indexOf(parseInt(command.t)) > -1) {
      if (whiteboardPlayer.whiteboardObject) {
        tools.debug('图形渲染 ==>', command)
        // whiteboardPlayer.whiteboardObject.render({
        //   data: command
        // })
        whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.UPDATE_PAGE_DRAW_DATA, { drawData: command })
      }
    }
  },

  // 重置
  resize: function (w, h) {
    if (whiteboardPlayer.whiteboardObject) {
      // whiteboardPlayer.whiteboardObject.whiteboardResize()
      // 白板resize会设置canvas矩阵
      whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.WHITEBOARD_RESIZE)
      // PPT resize会设置PPT的尺寸位置
      whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.PPT_RESIZE)
    }
    return this.getRatio(w, h)
  },

  // 停止
  stop: function (action) {
    this.action = action || "stop"
    tools.debug(`Live on ${this.action}...`)
    this.initStorage()
    // stop
    core.setPlayerStatus('stop')
    schedule.stop()
    media.emit('live:stop')
    // 重置直播数据
    Store.commit(TYPES.UPDATE_LIVE_STATE, 'stop')
    Store.commit(TYPES.UPDATE_LIVE_DATA, 'stop')
    // 重置普通模式
    Store.commit(TYPES.UPDATE_LIVE_MODE, '0')
    // 不断流模式
    Store.commit(TYPES.UPDATE_LOOP_MODE, 0)
    // 停止统计
    this.statsStop();
    this.cnState("stop")
    // cmd
    this.destroyAll()
    map.get(`live:${this.action}`)()
  },
  // 未开始
  wait: function () {
    this.action = 'wait';
    map.get("live:wait")();
    this.cnState('wait');
    Store.commit(TYPES.UPDATE_LIVE_STATE, 'wait')
  },

  // 开始
  start: function (command, title) {
    tools.debug('Live on start...')
    tools.debug('h5 live start', command);
    Store.commit(TYPES.UPDATE_LIVE_STATE, 'start')
    var that = this,
      user = this.room.user;

    // start init.
    that.action = command.t;
    that.initStorage();
    this.action = "start";

    // h5
    // get live info
    if (command.t === "start") {
      var liveData = {
        liveId: command.liveid || 0,
        courseId: command.course_id || 0
      };
      this.liveData = liveData;
    }

    // liveid
    that.liveid = command.liveid || 0;

    // 直播统计
    if (!that.logTimer) {
      that.logTimer = 1
      // 为了兼容rts模式下初始化拿不到rtsPlayer对象的相关方法，所以延迟1s
      // 为了兼容微信分享抓取页面导致错误统计，后端返回logTime延迟统计
      let logTime = Store.getters('getGlobal')['data']['logTime']
      if (logTime === 0) {
        logTime = 1000
      }
      setTimeout(() => {
        that.statsPlay();
      }, logTime)
    }

    // 暖场统计
    this.cnState("start")

    // 修正指令响应时间
    // 进入房间 下课状态 ==> 上课状态
    // 中途下课 ==> 上课状态
    if (schedule.initDuration == 0) {
      schedule.set('initDuration', 1)
    }
    // 时间轴
    schedule.run(core.playType)
    // 创建画板
    media.emit('ppt:player')
    // 直播开始
    tools.debug("直播主题 ===>", title, command);
    map.get("live:start")(title);
    core.setPlayerStatus('start')
  },
  //离上课时间倒计时
  calssTimer: function (intDiff) {
    var that = this;
    that.setTimer = setInterval(function () {
      that.countdownTime = intDiff;
      if (intDiff == 0) {
        clearInterval(that.setTimer);
        return;
      }
      intDiff--;
    }, 1000);
  },


  //暖场统计
  cnState: function (state) {
    var that = this,
      room = tools.getRoom();
    that.action = state;
    if (room.course) {
      if (room.course.videoUrl.length > 0 && room.course.videoUrl !== undefined) {
        that.calssTimer(room.course.info.timeToStart);
        //课前
        if (state === "wait") {
          if (that.countdownTime > 0) {
            that.cnPlay();
          }
          //上课中的状态
          else if (that.countdownTime == 0) {
            //上过课
            if (room.course.startLive == 1) {
              clearTimeout(that.cnTimer);
              return;
            }
            //没上过课
            else if (room.course.startLive == 0) {
              that.cnPlay();
            }
          }

        }
        //下课
        else if (state === "stop") {
          //课前
          if (that.countdownTime > 0) {
            that.cnPlay();
          }
          //到了上课时间
          else if (that.countdownTime == 0) {
            //上过课
            if (room.course.startLive == 1) {
              clearTimeout(that.cnTimer);
              return;
            }
            //没上过课
            else if (room.course.startLive == 0) {
              that.cnPlay();
            }
          }

        }
        //上课
        else if (state === "start") {
          clearTimeout(that.cnTimer);
        }
      }
    }
  },

  // 统计
  cnPlay: function () {
    var that = this,
      user = this.room.user,
      pf = "";

    // 平台判断
    var ua = navigator.userAgent.toLowerCase();
    // ios
    if (ua.indexOf("ios-sdk") > -1) {
      pf = "ios-sdk";
    }
    // android
    else if (ua.indexOf("android-sdk") > -1) {
      pf = "android-sdk";
    }
    // html
    else {
      pf = "html";
    }
    // 统计
    log.play({
      xid: user.xid,
      uid: user.uid,
      pid: user.partner_id,
      rid: user.roomid,
      cid: that.liveid,
      courseId: that.room.course.course_id,
      pf: pf,
      pt: 1,
      pl: that.action === 'start' ? 1 : 0,
      cbt: 0,
      type: core.playStatus,
    });
    that.cnTimer = setTimeout(function () {
      that.cnPlay();
    }, (that.room.heartbeatInterval) * 1000 || 180 * 1000);
  },
  // 统计结束(停止)
  statsStop: function () {
    // 基础统计
    if (this.logTimer) {
      window.clearTimeout(this.logTimer)
      this.logTimer = null
    }
    // 暖场统计
    if (this.cnTimer) {
      window.clearTimeout(this.cnTimer)
      this.cnTimer = null
    }
    // 重置参数
    playerEvent.reset()
  },
  // 获取参数
  getStatisData: function (qa) {
    var that = this,
      user = this.room.user,
      baseParams = {},
      pf = "";
    // 平台判断
    var ua = navigator.userAgent.toLowerCase();
    // ios
    if (ua.indexOf("ios-sdk") > -1) {
      pf = "ios-sdk";
    }
    // android
    else if (ua.indexOf("android-sdk") > -1) {
      pf = "android-sdk";
    }
    // html
    else {
      pf = "html";
    }
    // 质量统计
    var o = {
      bn: 0,
      ba: 0,
      pn: 0
    }
    if (qa) {
      o.ba = qa.ba
      o.bn = qa.bn
      o.pn = qa.pn
    }
    // 判断条件改成当前播放类型是否是rts
    let courseData = Store.getters('getLiveData')
    var techOrder = Store.getters('getTechOrder')
    var whiteboard = Store.getters('getWhiteboard')
    let initData = Store.getters('getInitData')
    // 基础参数
    baseParams = {
      xid: user.xid,
      uid: user.uid,
      pid: user.partner_id,
      rid: user.roomid,
      cid: courseData.liveId,
      courseId: courseData.courseId,
      wv: whiteboard.version,
      wcp: whiteboard.curPage,
      pf: pf,
      pt: 1,
      pl: that.action === 'start' ? 1 : 0,
      cbt: 0,
      bn: o.bn,
      ba: o.ba,
      type: core.playStatus,
      pn: o.pn,
    }
    // 渠道统计
    if (initData.statsQuery) {
      initData.statsQuery.split('&').forEach(function (item, index) {
        baseParams[item.split('=')[0]] = item.split('=')[1]
      })
    }
    // Rts模式
    if ((techOrder == 'rts' || techOrder == 'RTS') && rtsPlayer.isSupported()) {
      // 是否上讲台或者说是否推流更合适
      let rtcup = 0
      // 小班模式，1v1 1 1v6 2 1v16 3 大班互动
      let small = parseInt(Store.getters('getGlobal').data.usercamera.smallType)
      let ctype = parseInt(Store.getters('getGlobal').data.usercamera.ctypes.default)
      let wh = Store.getters('getGlobal').data.usercamera.rtcVideoProfile.aspectRatio.w + 'x' + Store.getters('getGlobal').data.usercamera.rtcVideoProfile.aspectRatio.h
      let rtsParam = {
        ctype: ctype,
        rtcup: rtcup,
        small: small,
        wh,
      }
      Object.assign(rtsParam, baseParams)
    }
    return baseParams
  },
  // ## 直播核心统计 ##
  statsPlay: function (qa) {
    tools.debug('Start to statis ==>', qa ? qa.pn : 0)
    var that = this
    let baseParams = this.getStatisData(qa)
    // 统计
    log.play(baseParams)
    if (that.logTimer) {
      clearTimeout(that.logTimer)
    }
    // ############## debug ################
    // that.room.heartbeatInterval = 10
    // ### debug ####
    that.logTimer = setTimeout(function () {
      // 质量统计
      // ++that.playNumber;
      playerEvent.pnCount()
      var qa = playerEvent.getQAData()
      that.statsPlay(qa);
      // 清空状态
      playerEvent.resetQA()
    }, (that.room.heartbeatInterval) * 1000 || 180 * 1000);
  },
  // 从id获取涂鸦元素
  getDrawObjectById: function (ctx, objectId) {
    if (objectId) {
      var objects = ctx.getObjects();
      for (var j = 0, olen = objects.length; j < olen; j++) {
        if (objects[j].id === objectId) {
          return objects[j];
        }
      }
    } else {
      return null;
    }
  },
  // 图形元素是否存在
  isDraw: function (ctx, objectId) {
    var foundObject = false;
    var objects = ctx.getObjects();
    for (var j = 0; j < objects.length; j++) {
      if (objects[j].id === objectId) {
        foundObject = true;
      }
    }
    return foundObject;
  },

  // 翻页清空涂鸦数据, 除了白版
  clearPageCommands: function () {
    var pages = this.pages,
      cmds = this.commands;
    for (var _p in pages) {
      if (!this.isWhiteBoard(_p)) {
        delete pages[_p];
      }
    }
    for (var _c in cmds) {
      if (!this.isWhiteBoard(_c)) {
        delete cmds[_c];
      }
    }
    tools.debug("clear Page Commands...");
  },

  // 设置每页数据渲染
  setPage: function (command) {

    tools.debug('Live set page ==>', command)

    // ctx define
    var page = command.p;
    var that = this;
    var content = command.c.split('|');

    // setpag command
    pptPreview.setCurPageCommand(content[0])

    // 清除所有涂鸦
    var isClearAllDraws = (content[2] == "3" ? true : false);

    // 设置页码
    if (page) {
      that.page = command.p; //设置当前页
      this.pages[command.p] = command;
    }

    // 翻页
    media.emit('live:set:page', command)

    // outter
    map.get("live:set:page")(command);
    // 初始化php加载指令
    that.playerInit = true;
    // 白版
    if (page) {
      tools.debug("load canvas whiteBoard...");
    }
  },
  // 加载图片
  loadImage: function (url, callback) {
    var that = this;
    if (that.imageObj[url]) {
      return callback(that.imageObj[url]);
    }
    //支持webp的，改为加载web
    tools.webpSupport(function (isWebpSupport) {
      if (isWebpSupport) {
        url = url.replace('.jpg', '.jpeg');
      }

      url = network.getRetryUrl(url);
      var img = new Image();
      img.src = url;
      img.onload = function () {
        that.imageObj[url] = img;
        callback(img);
      };
      //失败重load
      img.onerror = function () {
        network.loadRetry(url, function (_oriUrl) {
          that.loadImage(_oriUrl, callback);
        });
      }
    });
  },

  // m3u8
  m3u8: function (content) {
    // return core.getVideoUrl(content);
  },

  // 摄像头视频流成功
  video: function (command) {
    var that = this;
    tools.debug('Live Video Start ==> ' + command.t)
    tools.debug("Video Source:", command)
    // 设置比例
    if (command.c) {
      media.setRatio(command.c, 'video')
    }
    // save stream.
    this.videoStreamPath = command.stream;
    // 设置开始推流时间(摄像头)
    // schedule.LAST_LIVE_TIME = command.st
    schedule.set('LAST_LIVE_TIME', command.st)
    // video start
    if (command.t == COMMAND_VIDEO_START) {
      // 设置媒体数据
      if (command.streams) {
        media.setStreams(command.streams)
      }
      // 播放
      media.emit('camera:player')
    }
    // 停止推流
    else if (command.t == COMMAND_VIDEO_STOP) {
      tools.debug('Live Video Stop...', that.action)
      if (command.lp == 0) {
        media.emit('media:destroy', 'camera')
      }
    }
  },
  // 摄像头
  cameraDo: function (command) {
    var that = this;
    if (command.t == COMMAND_CAMERA_START) {
      tools.debug('camera start ...')
      map.get('camera:start')()
    } else if (command.t == COMMAND_CAMERA_STOP) {
      map.get('camera:stop')()
      tools.debug('camera stop ...')
    }
  }
};
// window.__player = player
export default player
