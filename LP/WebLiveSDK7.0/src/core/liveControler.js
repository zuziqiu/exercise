import tools from '../utils/tools'
import cmdSchedule from './cmdSchedule'
import sdkRoom from './roomModule'
import log from '../utils/log'
import mediaControler from './mediaControler'
// 三大播放器
import whiteboardPlayer from '../module/whiteboardModule'
import desktopPlayer from '../module/desktopModule'
import cameraPlayer from '../module/cameraModule'

// import pptPreview from '../extends/pptPreview'
import playerEvent from './playerEvent'
import rtsPlayer from '../mediaPlayer/rtsPlayer'
import { eventStore } from '../eventStore/index'
import { STATIC } from '../states/staticState'
import * as TYPES from '../action/action-types'
import { sdkStore } from '../states'
import { sdkAction } from '../action'
import network from '../plugins/network/network'

var width = 0
var height = 0

let liveControler = {
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
  // curLastTime: 0,
  countdownTime: 0, // 似乎是课前时间

  // 播放器
  width: width, //主播放器当前宽度(4:3)
  height: height, //主播放器当前高度(4:3)
  cameraWidth: 280, //摄像头宽度
  cameraHeight: 210, //摄像头高度

  // 播放器
  mainContainerId: null,
  mainPlayerId: null,

  // 摄像头播放器
  cameraContainerId: null,
  cameraPlayerId: null,

  pageRatio: 0.75,

  // 初始化 step 数据序列化
  doStep: function (data) {
    // Step.
    var that = this
    if (!this.steploaded) {
      let _data = sdkStore.room.initData
      tools.debug('init do step ==> data->', _data)
      var step,
        stepCount = 8
      if (!_data || !_data.InitData) {
        return false
      }
      var initData = _data.InitData
      for (var i = 1; i <= stepCount; i++) {
        step = 'step' + i
        tools.debug(`step==>[${i}] ${initData[step]}`)
        if (initData[step]) {
          that.execute(initData[step])
          eventStore.emit('ppt:player:loaded')
        }
        // 判断初始化是否存在画板
        if (i === 2) {
          var hasWhiteboard = typeof initData[step] === 'string' && initData[step].length > 0 ? true : false
          eventStore.emit('live:has:whiteboard', hasWhiteboard)
        }
        // 初始化摄像头
        if (i == 4 && !initData[step]) {
          eventStore.emit('camera:stop')
        }
      }
      this.steploaded = true
    }
  },

  // 内部事件监听
  on: async function (eventName, payload) {
    tools.debug('h5Player on event ==>', eventName, payload)
    switch (eventName) {
      // 结束直播
      case 'live:on:stop':
        this.stop()
        break
      // 超时统计
      case 'live:video:timeout':
        var qa = playerEvent.getQAData()
        var sdata = this.getStatsData(qa)
        log.play(sdata)
        // 进行一次网络测速
        let { recordSpeed } = await network.testSpeed()
        tools.debug(`${recordSpeed >= 1024 ? Math.round((recordSpeed / 1024) * 100) / 100 + 'mb' : recordSpeed + 'kb'}/s`)
        break
      default:
        break
    }
  },

  // 初始化
  init: function () {
    mediaControler.listen()
    // 提前设置拉流地址
    mediaControler.statePreSet()
    // 外部传入 => techOrder
    var opts = sdkStore.room.extConfig
    if (opts?.config?.techOrder) {
      mediaControler.setTechOrder(opts.config.techOrder)
    }
    // 读取 initData 默认值
    else {
      mediaControler.setTechOrder()
    }
    // 媒体断流超时
    playerEvent.listen(STATIC.player.MAX_PULL_STREAM_ERROR, (t) => {
      eventStore.emit('live:video:fail')
    })
    // 初始化播放器
    this.initPlayer()
  },

  // 初始化播放
  initPlayer: function () {
    let room = sdkStore.room.initData
    tools.debug('=====> H5 v2 ROOM <=======', room)
    var initData = room.InitData
    tools.debug('=====h5 player init=======', initData)

    // 直播标题
    if (initData.title) {
      this.liveTitle = initData.title
    }
    // 涂鸦任务队列(直播)
    cmdSchedule.set('delayDuration', room.cmdDelay)
    cmdSchedule.set('cmdDelay', room.cmdDelay)
    cmdSchedule.run()
    // waiting
    if (initData.action === 'wait') {
      this.wait()
      return
    }
    if (initData.action === 'stop') {
      this.stop()
      return
    }
    // start
    if (this.action === 'start') {
      cmdSchedule.set('initDuration', room.live.duration)
    }
    // 初始化step
    this.doStep()
  },

  // 更新课程数据
  updateCourseData: function (data) {
    if (!data) {
      return false
    }
    var liveData = {}
    if (data?.liveid > 0) {
      liveData.liveId = data.liveid
      sdkAction.dispatch('room', {
        type: TYPES.UPDATE_LIVE_DATA,
        payload: {
          liveData: liveData
        }
      })
    }
    if (data?.course_id > 0) {
      liveData.courseId = data.course_id
      sdkAction.dispatch('room', {
        type: TYPES.UPDATE_LIVE_DATA,
        payload: {
          liveData: liveData
        }
      })
    }
  },

  // 销毁全部
  destroyAll: function () {
    tools.debug('## Destroy All! ##')
    return new Promise((resolve, reject) => {
      mediaControler.emit('media:destroy', 'global')
      mediaControler.emit('media:destroy', 'camera')
      mediaControler.emit('media:destroy', 'video')
      mediaControler.emit('flash:destroy:all')
      // 停止统计
      this.statsStop()
      log.destroy()
      // 销毁完成 => 初始化新
      if (whiteboardPlayer.whiteboardObject) {
        whiteboardPlayer.executeEvent('ppt:destroy', (isDone) => {
          resolve(isDone)
        })
      } else {
        resolve(true)
      }
    })
  },
  // 设置声音
  volume: function (volume) {
    tools.debug('H5 Volume set ==> ', volume)
    // range 0 - 1
    if (volume > -1) {
      mediaControler.getPlayer().then((player) => {
        player.volume(volume)
      })
    }
  },
  // 比例计算
  getRatio: function (width, height) {
    var that = this
    var ratio = that.pageRatio
    var pptCon = document.querySelector('#' + this.mainContainerId)
    if (!pptCon) {
      return {
        width: width,
        height: height
      }
    }
    var w = width || pptCon.clientWidth
    var h = height || pptCon.scrollHeight
    var _w, _h
    // 大于正常比例
    if (w / h > ratio) {
      _w = h * ratio
      _h = h
    } else {
      _w = w
      _h = w / ratio
    }
    return {
      width: _w,
      height: _h
    }
  },
  // 课件播放器
  whiteboardEntry: function (containerId, playerId, callback) {
    sdkAction.dispatch('whiteboard', {
      type: TYPES.UPDATE_WHITEBOARD_DOM,
      payload: {
        whiteboard: {
          wrapContainer: containerId,
          playerId: playerId,
          callback: callback
        }
      }
    })
    whiteboardPlayer.fireWhiteboard()
  },
  // 单流播放器
  mediaPlayer: function (containerId, playerId, callback) {
    // tools.debug('init mediaPlayer =>', containerId, playerId)
    // let _dom = document.querySelector('#' + containerId)
    // if (typeof callback === "function" && _dom) {
    //   callback.call(_dom)
    // }
    // sdkAction.dispatch('media', {
    //   type: TYPES.UPDATE_MEDIA_DOM,
    //   payload: {
    //     media: {
    //       wrapContainer: containerId,
    //       playerId: playerId,
    //       callback: callback
    //     }
    //   }
    // })
    tools.debug('init mediaPlayer =>', containerId, playerId)
    this.mainContainerId = containerId
    this.playerCallback = callback
    this.playerId = playerId
    // update main player
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_VIDEO_DOM,
      payload: {
        video: {
          wrapContainer: containerId,
          playerId: playerId,
          callback: callback
        }
      }
    })
    // 创建容器
    mediaControler.getVideoDom('video', true)
  },
  // 桌面分享和视频 播放器
  mainPlayer: function (containerId, playerId, callback) {
    tools.debug('init mainPlayer =>', containerId, playerId)
    this.mainContainerId = containerId
    this.playerCallback = callback
    this.playerId = playerId
    // update main player
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_VIDEO_DOM,
      payload: {
        video: {
          wrapContainer: containerId,
          playerId: playerId,
          callback: callback
        }
      }
    })
    // 创建容器和video
    mediaControler.getVideoDom('video', true)
  },
  // 摄像头播放器
  cameraEntry: function (containerId, playerId, callback) {
    tools.debug('init Camera =>', containerId, playerId)
    this.cameraContainerId = containerId
    this.cameraPlayerId = playerId
    this.cameraCallback = callback
    // update dom
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_CAMERA_DOM,
      payload: {
        camera: {
          wrapContainer: containerId,
          playerId: playerId,
          callback: callback
        }
      }
    })
    // 只创建容器
    mediaControler.getVideoDom('camera', true)
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
    let techOrder = sdkStore.media.player.techOrder
    if (techOrder === otype) {
      return false
    }
    mediaControler.emit('player:tech:order', otype)
    // 销毁当前播放器 ==> 重新初始化
    this.destroyAll().then(() => {
      mediaControler.setTechOrder(otype)
    })
  },

  // 切换视频源(网络选择)
  changeSource: function (ret) {
    // demo format
    var that = this,
      vpath = '',
      vStream = ''

    tools.debug('source-currentMode ==> ' + sdkStore.room.curMode)

    // 通过stream返回地址(新版本)
    if (ret.curSourceStream) {
      if (sdkStore.room.curMode == STATIC.MODE_DESKTOP) {
        vStream = ret.curSourceStream
      }
      // 课件模式
      else if (sdkStore.room.curMode == STATIC.MODE_EDUCATION) {
        // vpath = that.videoStreamPath.split("|");
        vStream = ret.curSourceStream
      }
    }
    // 旧版本
    else {
      // 桌面分享
      if (sdkStore.room.curMode == STATIC.MODE_DESKTOP) {
        vpath = desktopPlayer.desktopStreamPath.split('|')
        vStream = desktopPlayer.desktopStreamPath
      }
      // 课件模式
      else if (sdkStore.room.curMode == STATIC.MODE_EDUCATION) {
        vpath = that.videoStreamPath.split('|')
        vStream = that.videoStreamPath
      }
    }

    tools.debug('stream ===> ', vpath)
    // 选择网络
    if (ret.data?.length > 0) {
      that.getNGB(vStream, ret.data)
    }
    // change to Default
    else {
      var defaultStream = this.m3u8(vStream)
      tools.debug('Change to default ==> ', defaultStream)
      that.videoUrl = defaultStream
    }
    // 当前stream信息
    that.curMeidaStream = vStream
    // 重新加载源视频
    this.mediaReload()
  },

  // NGB模式
  getNGB: function (vStream, ngbList) {
    var that = this,
      url = '',
      list = ngbList,
      length = list.length - 1,
      ran = Math.round(Math.random() * length),
      ranIp = list[ran] + '/'
    // 重组(NGB模式)
    url += STATIC.PROTOCOL + ranIp + tools.stream2m3u8(vStream)
    tools.debug('===> Change video source', url)
    that.videoUrl = url
    return url
  },

  // 重载
  reload: function () {
    mediaControler.reload()
  },

  // 线路选择
  lineSetting: function (key) {
    return mediaControler.setLine.call(media, key)
  },

  // 重载视频流
  mediaReload: function () {
    // 特殊参数放弃
    var isTest = window.location.href.match(/vreload=false/gi) || false
    if (isTest) {
      return false
    }
    var that = this
    tools.debug('重新加载视频===>' + this.videoUrl)
    // 桌面分享
    if (sdkStore.room.curMode == STATIC.MODE_DESKTOP) {
      desktopPlayer.videoUrl = this.videoUrl
      desktopPlayer.reloadDesktop()
    }
    // 课件模式
    else if (sdkStore.room.curMode == STATIC.MODE_EDUCATION) {
      that.videoEmitPlay()
    }
  },

  // safari 下打开摄像头视频: 可配置 room.config.safariOpenVideo
  isOpenSafariVideo: function () {
    if (sdkRoom.configs && sdkRoom.configs.safariOpenVideo) {
      return true
    }
    return false
  },

  // Audio创建规则
  // IOS版本 <8 创建audio
  isCreateAudio: function () {
    var that = this
    if (tools.isIphone()) {
      if (tools.isQQMobile() || that.isOpenSafariVideo() || tools.getPlatformInfo().version > 10) {
        return false
      }
      return true
    } else {
      return false
    }
  },
  // 音视频元素切换
  toggleMeidaElement: function () {
    var element = document.getElementById(this.cameraPlayerId)
    if (element) {
      document.body.removeChild(element)
    }
  },

  // 设置标签
  changeMediaElement: function (obj) {
    if (obj) {
      var element = document.getElementById(this.cameraPlayerId)
      element.parentNode.removeChild(element)
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
    var that = this
    if (that.playTimes === 1) {
      tools.debug('do resumePlay......')
      that._roomCurrentTime = 0
      target.load()
      that.elementPlay()
    }
  },

  // 设置src
  // 得到播放流 => 重新开始播放
  videoEmitPlay: function (playUrl) {
    tools.debug('play with handle ...')
    var that = this
    // 微信端
    if (tools.isWechat()) {
      // 执行播放(必须执行一次)
      that.elementPlay()
      // 微信自动播放注册
      tools.detectiveWxJsBridge(function () {
        tools.debug('Autoplay by Wechat...')
        that.elementPlay()
      })
    }
    // H5常规播放
    else {
      that.elementPlay()
    }
    this.playTimes += 1
  },
  // 触发播放
  elementPlay: function (videoDom) {
    // 播放
    if (mediaControler.curPlayerObject) {
      mediaControler.curPlayerObject.play()
    }
  },
  // play
  play: function () {
    tools.debug('<==== H5 Start Playing ====> ' + sdkStore.room.curMode)
    var that = this
    // camera播放
    if (sdkStore.room.curMode == STATIC.MODE_EDUCATION) {
      // that.videoEmitPlay()
    }
    // desktop播放
    else if (sdkStore.room.curMode == STATIC.MODE_DESKTOP) {
      desktopPlayer.play()
    }
    // 统一播放方法
    that.videoEmitPlay()
    mediaControler.emit('live:video:play', 'play')
  },
  pause: function () {
    tools.debug('<====== Pause ======>')
    // 更新播放状态
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'pause'
      }
    })
    mediaControler.emit('live:video:pause', 'pause')
  },
  // 权限切换
  livePowerChange: function (cmd) {
    mediaControler.emit('live:power:change', cmd)
    eventStore.emit('live:power:change', cmd)
  },
  // 设置直播标题
  getTitle: function (command) {
    if (command.title?.length > 0) {
      this.liveTitle = command.title
      return command.title
    }
  },

  // socket 执行 whiteBoard
  videoOrwhiteBoardOnSocket: function (packet, command) {
    if (!packet.args.metadata) {
      return
    }
    // 设置直播标题
    this.liveTitle = this.getTitle(command)
    try {
      // 广播指令
      mediaControler.emit('socket:cmd', packet.args.metadata)
      // 设置step
      mediaControler.setStep(command.t, command)

      let mediaArr = [
          // 媒体类
          STATIC.CMD.VIDEO_START,
          STATIC.CMD.VIDEO_STOP,
          STATIC.CMD.OPEN_CAMERA,
          STATIC.CMD.CLOSE_CAMERA,
          STATIC.CMD.DESKTOP_START,
          STATIC.CMD.DESKTOP_STOP,
          STATIC.CMD.MODE_CHANGE
        ],
        whiteboardArr = [
          // 翻页
          STATIC.CMD.PAGE,
          // 图形类
          STATIC.CMD.IMAGE,
          STATIC.CMD.TEXT,
          STATIC.CMD.CIRCLE,
          STATIC.CMD.RECTANGLE,
          STATIC.CMD.LINE,
          STATIC.CMD.DOTTEDLINE,
          STATIC.CMD.TRIANGLE,
          STATIC.CMD.DRAW_LIST,
          STATIC.CMD.ERASER,
          STATIC.CMD.DRAW,
          STATIC.CMD.ERASERALL,
          STATIC.CMD.ARROW,
          STATIC.CMD.POINTER
        ]
      // 一开始时直接执行
      if (command.st == 0) {
        this.execute(command)
      } else {
        /*
         * video 和 whiteboard的socket都在这个case中返回了，所以需要先进行分发
         */
        if (mediaArr.includes(command.t.toString())) {
          // 视频类指令延时执行
          command.receiveTime = tools.now()
          cmdSchedule.addSchedule(command.st, command, (command) => {
            tools.debug('cmdSchedule addexecute ==>', command)
            this.execute(command)
          })
        } else if (whiteboardArr.includes(command.t.toString())) {
          // 图形类指令延时执行
          command.receiveTime = tools.now()
          cmdSchedule.addSchedule(command.st, command, (command) => {
            tools.debug('cmdSchedule addexecute ==>', command)
            whiteboardPlayer.executeEvent('whiteboard:on:socket', command)
          })
        }
        // 其他指令直接执行
        else {
          this.execute(command)
        }
      }
    } catch (err) {
      tools.debug('[ERROR]Command parse onError ==>', err)
    }
  },

  //模式切换
  modeChange: function (command, callback) {
    var content = command.c.split('|'),
      beforeMode = content[0],
      currentMode = content[1],
      sourceMode = content[1]

    // 更新Mode
    sdkAction.dispatch('room', {
      type: 'UPDATE_LIVE_MODE',
      payload: {
        curMode: currentMode
      }
    })
    // 视频插播 === 桌面分享
    this.baseCurrentMode = currentMode
    // 如果数据为 content ===> 1|1 会自动转换为 ===> 0|2
    if (beforeMode == STATIC.MODE_VIDEO) {
      beforeMode = STATIC.MODE_DESKTOP
    }
    if (currentMode == STATIC.MODE_VIDEO) {
      currentMode = STATIC.MODE_DESKTOP
    }
    this.beforeMode = beforeMode
    this.currentMode = currentMode
    let modeData = {
      beforeMode: beforeMode,
      currentMode: currentMode,
      sourceMode: sourceMode
    }
    callback?.(beforeMode, currentMode)
    // 切换发送指令
    eventStore.emit('live:mode:change', modeData)
  },
  // 执行指令
  execute: function (command) {
    if (typeof command === 'string') {
      try {
        command = JSON.parse(command)
      } catch (e) {
        return tools.debug('h5 player execute command error:' + e)
      }
    }
    tools.debug('###### H5 player execute ===>', command.t, ' #######')
    tools.debug(command)
    // 更新state.room.liveData直播信息
    this.updateCourseData(command)
    // 初始化(开始)
    if (command.t == STATIC.CMD.LIVE_START) {
      this.start(command, this.liveTitle)
    }
    // 摄像头视频流开和关、摄像头展示、隐藏的状态
    else if ([STATIC.CMD.VIDEO_START, STATIC.CMD.VIDEO_STOP, STATIC.CMD.OPEN_CAMERA, STATIC.CMD.CLOSE_CAMERA].includes(command.t.toString())) {
      cameraPlayer.cameraExecute(command)
    }
    // 权限切换
    else if (command.t == STATIC.CMD.LIVE_POWER_CHANGE) {
      this.livePowerChange(command)
    }
    // 直播停止
    else if (command.t == STATIC.CMD.LIVE_STOP) {
      this.action = command.t
      this.stop(command.t)
    }
    // 直播模式切换
    else if (command.t == STATIC.CMD.MODE_CHANGE) {
      tools.debug('live mode change ==> ' + command.t)
      // this.modeChangeFlag = true;
      // 模式切换
      // 销毁对应媒体对象 => 创建新进的媒体对象 => 播放
      this.modeChange(command, function (beforeMode, currentMode) {
        let loopMode = sdkStore.room.loopMode
        tools.debug('Live currentMode ==> ' + currentMode, 'LoopMode ==> ', loopMode)
        // [不断流]媒体切换位置
        if (loopMode == 1) {
          mediaControler.mediaReplace(currentMode)
          mediaControler.emit('media:change', currentMode)
        }
        // [切换断流]销毁
        if (loopMode == 0) {
          // 教育模式
          if (currentMode == STATIC.MODE_EDUCATION) {
            mediaControler.emit('media:destroy', 'video')
          }
          // 桌面模式
          else {
            mediaControler.emit('media:destroy', 'camera')
          }
        }
      })
    }
    //桌面模式开始
    else if (command.t == STATIC.CMD.DESKTOP_START) {
      tools.debug('live desktop Start ==> ' + command.t)
      // 初始化桌面分享,需要执行模式切换
      // if (!this.modeChangeFlag) {
      //   var modeChangeCommand = {
      //     st: 0,
      //     p: -1,
      //     c: "0|2",
      //     t: 151
      //   };
      // }
      // 设置媒体数据
      if (command.streams) {
        mediaControler.setStreams(command.streams)
      }
      // 比例
      if (command.c) {
        mediaControler.setRatio(command.c, 'desktop')
      }
      // 开始桌面分享
      desktopPlayer.start(command)
    }
    //桌面模式暂停
    else if (command.t == STATIC.CMD.DESKTOP_PAUSE) {
      // 初始化桌面分享,需要执行模式切换
      // if (!this.modeChangeFlag) {
      //   var modeChangeCommand = {
      //     st: 0,
      //     p: -1,
      //     c: "0|2",
      //     t: 151
      //   };
      //   // core.modeChange(modeChangeCommand);
      // }
    }
    //桌面模式停止(自动切换教育模式)
    else if (command.t == STATIC.CMD.DESKTOP_STOP) {
      desktopPlayer.stop(command)
    }
    // desktop && camera 推流成功监听
    if (command.t == STATIC.CMD.VIDEO_START || command.t == STATIC.CMD.DESKTOP_START) {
      sdkAction.dispatch('room', {
        type: TYPES.UPDATE_LOOP_MODE,
        payload: {
          loopMode: command.lp || 0
        }
      })
    }
    /*
     * 画板指令都在这块
     */
    // 设置页面
    else if (command.t == STATIC.CMD.PAGE) {
      this.playerInit = true
      // whiteboardPlayer.setPage(command);
      whiteboardPlayer.executeEvent('live:set:page', command)
    }
    // 画板打开
    else if (command.t == STATIC.CMD.WHITEBOARD_OPEN) {
      eventStore.emit('whiteboard:open')
    }
    // 画板关闭
    else if (command.t == STATIC.CMD.WHITEBOARD_CLOSE) {
      eventStore.emit('whiteboard:close')
    }
    // 画板图形处理
    else if (
      [
        STATIC.CMD.ARROW,
        STATIC.CMD.DRAW,
        STATIC.CMD.ERASERALL,
        STATIC.CMD.CIRCLE,
        STATIC.CMD.IMAGE,
        STATIC.CMD.RECTANGLE,
        STATIC.CMD.LINE,
        STATIC.CMD.DOTTEDLINE,
        STATIC.CMD.TRIANGLE,
        STATIC.CMD.TEXT,
        STATIC.CMD.POINTER
      ].includes(command.t.toString())
    ) {
      whiteboardPlayer.executeEvent('page:draw:data', command)
    }
  },

  // 重置
  whiteboardResize: function (w, h) {
    whiteboardPlayer.executeEvent('whiteboard:resize')
    return this.getRatio(w, h)
  },

  // 停止
  stop: function (action) {
    this.action = action || 'stop'
    tools.debug(`Live on ${this.action}...`)
    // 更新播放状态
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'stop'
      }
    })
    cmdSchedule.stop()
    mediaControler.emit('live:stop')
    // 重置直播数据
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_LIVE_STATE,
      payload: {
        liveState: 'stop'
      }
    })
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_LIVE_DATA,
      payload: {
        liveData: 'stop'
      }
    })
    // 重置普通模式
    sdkAction.dispatch('room', {
      type: 'UPDATE_LIVE_MODE',
      payload: {
        curMode: '0'
      }
    })
    // 不断流模式
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_LOOP_MODE,
      payload: {
        loopMode: 0
      }
    })
    // 停止统计
    this.statsStop()
    this.cnState('stop')
    // cmd
    this.destroyAll()
    eventStore.emit(`live:${this.action}`)
  },
  // 未开始
  wait: function () {
    this.action = 'wait'
    eventStore.emit('live:wait')
    this.cnState('wait')
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_LIVE_STATE,
      payload: {
        liveState: 'wait'
      }
    })
  },

  // 开始
  start: function (command, title) {
    tools.debug('Live on start...')
    tools.debug('h5 live start', command)
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_LIVE_STATE,
      payload: {
        liveState: 'start'
      }
    })
    var that = this
    // start init.
    that.action = command.t
    this.action = 'start'
    if (command.t === 'start') {
      var liveData = {
        liveId: command.liveid || 0,
        courseId: command.course_id || 0
      }
      this.liveData = liveData
    }

    // liveid
    that.liveid = command.liveid || 0

    // 直播统计
    if (!that.logTimer) {
      that.logTimer = 1
      // 为了兼容rts模式下初始化拿不到rtsPlayer对象的相关方法，所以延迟1s
      // 为了兼容微信分享抓取页面导致错误统计，后端返回logTime延迟统计
      let logTime = sdkStore.room.initData.logTime
      if (logTime === 0) {
        logTime = 1000
      }
      setTimeout(() => {
        that.statsPlay()
      }, logTime)
    }

    // 暖场统计
    this.cnState('start')

    // 修正指令响应时间
    // 进入房间 下课状态 ==> 上课状态
    // 中途下课 ==> 上课状态
    if (cmdSchedule.initDuration == 0) {
      cmdSchedule.set('initDuration', 1)
    }
    // 时间轴
    cmdSchedule.run()
    // 创建画板
    mediaControler.emit('ppt:player')
    // 直播开始
    tools.debug('直播主题 ===>', title, command)
    eventStore.emit('live:start', title)
    // core.setPlayerStatus('start')
    // 更新播放状态
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'start'
      }
    })
  },
  //离上课时间倒计时
  calssTimer: function (intDiff) {
    var that = this
    that.setTimer = setInterval(function () {
      that.countdownTime = intDiff
      if (intDiff == 0) {
        clearInterval(that.setTimer)
        return
      }
      intDiff--
    }, 1000)
  },

  //暖场统计
  cnState: function (state) {
    var that = this,
      room = tools.getRoom()
    that.action = state
    if (room.course) {
      if (room.course.videoUrl.length > 0 && room.course.videoUrl !== undefined) {
        that.calssTimer(room.course.info.timeToStart)
        //课前
        if (state === 'wait') {
          if (that.countdownTime > 0) {
            that.cnPlay()
          }
          //上课中的状态
          else if (that.countdownTime == 0) {
            //上过课
            if (room.course.startLive == 1) {
              clearTimeout(that.cnTimer)
              return
            }
            //没上过课
            else if (room.course.startLive == 0) {
              that.cnPlay()
            }
          }
        }
        //下课
        else if (state === 'stop') {
          //课前
          if (that.countdownTime > 0) {
            that.cnPlay()
          }
          //到了上课时间
          else if (that.countdownTime == 0) {
            //上过课
            if (room.course.startLive == 1) {
              clearTimeout(that.cnTimer)
              return
            }
            //没上过课
            else if (room.course.startLive == 0) {
              that.cnPlay()
            }
          }
        }
        //上课
        else if (state === 'start') {
          clearTimeout(that.cnTimer)
        }
      }
    }
  },

  // 统计
  cnPlay: function () {
    var that = this,
      user = sdkStore.room.initData.user,
      pf = ''

    // 平台判断
    var ua = navigator.userAgent.toLowerCase()
    // ios
    if (ua.indexOf('ios-sdk') > -1) {
      pf = 'ios-sdk'
    }
    // android
    else if (ua.indexOf('android-sdk') > -1) {
      pf = 'android-sdk'
    }
    // html
    else {
      pf = 'html'
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
      type: sdkStore.media.player.status
    })
    that.cnTimer = setTimeout(function () {
      that.cnPlay()
    }, that.room.heartbeatInterval * 1000 || 180 * 1000)
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
  getStatsData: function (qa) {
    var that = this,
      user = sdkStore.room.initData.user,
      baseParams = {},
      pf = ''
    // 平台判断
    var ua = navigator.userAgent.toLowerCase()
    // ios
    if (ua.indexOf('ios-sdk') > -1) {
      pf = 'ios-sdk'
    }
    // android
    else if (ua.indexOf('android-sdk') > -1) {
      pf = 'android-sdk'
    }
    // html
    else {
      pf = 'html'
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
    // let courseData = sdkStore.room.liveData
    var techOrder = sdkStore.media.player.techOrder

    // 基础参数
    baseParams = {
      xid: user.xid,
      uid: user.uid,
      pid: user.partner_id,
      rid: user.roomid,
      cid: sdkStore.room.liveData.liveId,
      courseId: sdkStore.room.liveData.courseId,
      wv: sdkStore.whiteboard.version,
      wcp: sdkStore.whiteboard.curPage,
      pf: pf,
      pt: 1,
      pl: that.action === 'start' ? 1 : 0,
      cbt: 0,
      bn: o.bn,
      ba: o.ba,
      type: sdkStore.media.player.status,
      pn: o.pn
    }
    // 渠道统计
    if (sdkStore.room.initData.statsQuery) {
      sdkStore.room.initData.statsQuery.split('&').forEach(function (item, index) {
        baseParams[item.split('=')[0]] = item.split('=')[1]
      })
    }
    // Rts模式
    if ((techOrder == 'rts' || techOrder == 'RTS') && rtsPlayer.isSupported()) {
      // 是否上讲台或者说是否推流更合适
      let rtcup = 0
      // 小班模式，1v1 1 1v6 2 1v16 3 大班互动
      let small = parseInt(sdkStore.room.initData.usercamera.smallType)
      let ctype = parseInt(sdkStore.room.initData.usercamera.ctypes.default)
      let wh = sdkStore.room.initData.usercamera.rtcVideoProfile.aspectRatio.w + 'x' + sdkStore.room.initData.usercamera.rtcVideoProfile.aspectRatio.h
      let rtsParam = {
        ctype: ctype,
        rtcup: rtcup,
        small: small,
        wh
      }
      baseParams = Object.assign(rtsParam, baseParams)
    }
    return baseParams
  },
  // ## 直播核心统计 ##
  statsPlay: function (qa) {
    tools.debug('Start to statis ==>', qa ? qa.pn : 0)
    var that = this
    let baseParams = this.getStatsData(qa)
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
      that.statsPlay(qa)
      // 清空状态
      playerEvent.resetQA()
    }, that.room.heartbeatInterval * 1000 || 180 * 1000)
  }
}
window.__player = liveControler
export default liveControler
