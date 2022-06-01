import map from './common/utils/map'
import tools from './common/utils/tools'
import room from './core/vod.room'
import core from './core/player.core'
// ## 以后使用 vod.player 为正式版 ##
import plugins from './plugins/plugin.control'
import chat from './plugins/chat/chat'
import player from './core/vod.player'
// import fires from './core/sdk.fire'
import socket from './core/socket.init'
import cmdSchedule from './core/cmdSchedule'
// import { InitPlayProgress } from './components/InitPlayProgress'
import { ComponentEntry } from './components/ComponentEntry'
// import { InitPlayRate } from './components/PlayRate'
import sdkStore from '@/sdkStore'
import * as actionTypes from '@/sdkStore/constants/actionTypes'
import STATIC from '@/sdkStore/states/staticState'

// 初始化
var initVod = function (playbackData) {
  sdkStore.dispatch({
    type: actionTypes.UPDATE_INIT_DATA,
    payload: playbackData
  })
  socket.init(playbackData, (socket) => {
    tools.debug('socket on init...')
  })
  // 聊天数据
  chat.getList()
  // 执行sdk的schedule,加载画板
  cmdSchedule.run({ type: 'sdk' })
}
let envVersion = process.env.SDK_VERSION
let gitVersion = process.env.GIT_PACK
tools.debug('Vod Version ==>', envVersion || '3.5.9')
tools.debug('Git Version ==>', gitVersion)

var MT = {
    version: envVersion || '3.5.9',
    tools: tools
  },
  // base init.method
  playerLoaded = false,
  cameraLoaded = false,
  roomObj = null

// 播放器加载状态
var playerSync = function (type) {
  tools.debug('Media register ==>', type)
  if (type === 'camera') {
    cameraLoaded = true
  } else if (type === 'player') {
    playerLoaded = true
  }
  if (!type) {
    return cameraLoaded && playerLoaded
  }
  if (cameraLoaded && playerLoaded) {
    if (roomObj) {
      player.init(roomObj)
      return true
    }
  }
}

// 初始化 new SDK.main(args)
MT.main = function () {
  // 读取arguments
  var that = this,
    args = arguments

  tools.debug('TalkFun VOD-JS-SDK Params', args)

  // 是否实例化
  if (!this.init) {
    tools.error('实例化 MT 对象失败, 请重试!')
    map.get('system:room:error')({ msg: '实例化 MT 对象失败, 请重试!' })
    return false
  }

  var access_token = null,
    extend = {},
    callback = null

  if (args > 3) {
    // 参数数量非法
    console.error('参数传递错误')
    return false
  }

  // 可配置参数(最多3项)
  if (3 >= args.length && args.length > 0) {
    // 开启全局mobx 状态监听
    // if (eval(tools.getQueryStr('storeDebug'))) {
    //   spy((event) => {
    //     if (event.arguments) {
    //       console.log(`更新模块：${event.name} \n 供应数据：${JSON.stringify(event.arguments[1])}`)
    //     }
    //   })
    // }
    // 第一个参数是token，且是string
    if (typeof args[0] === 'string') {
      this.access_token = access_token = args[0]
    }
    // 第二个参数是扩展，且是对象
    if (typeof args[1] === 'object') {
      extend = args[1]
      // 第三个参数是callback，且是function
      if (typeof args[2] === 'function') {
        callback = args[2]
      }
    }
    // 第二个参数是callback，且是function
    else if (typeof args[1] === 'function') {
      callback = args[1]
    }

    /*
     * 获取url的扩展参数
     * extDaily 是否开启日志
     * extTestSpeed 是否开启测速
     * extControls 是否开启自定义控件
     * controls 是否开启原生控件
     * poster 是否开启海报
     * autoplay 是否开启自动播放
     */
    let urlParam = {
      config: {
        daily: eval(tools.getQueryStr('extDaily')) ?? extend?.config?.daily ?? false,
        testSpeed: eval(tools.getQueryStr('extTestSpeed')) ?? extend?.config?.testSpeed ?? false,
        controls: eval(tools.getQueryStr('extControls')) ?? extend?.config?.controls ?? false
      },
      video: {
        controls: eval(tools.getQueryStr('controls')) ?? extend?.video?.controls ?? false,
        poster: eval(tools.getQueryStr('poster')) ?? extend?.video?.poster ?? false,
        autoplay: eval(tools.getQueryStr('autoplay')) ?? extend?.video?.autoplay ?? false
      }
    }

    extend.config = Object.assign(extend.config || {}, urlParam.config)
    extend.video = Object.assign(extend.video || {}, urlParam.video)

    that.init(this.access_token, extend, callback)
  }

  // // access_token
  // this.access_token = args[0]
}

// @外部配置
// ===============
// @String: type
// @pack: Object
MT.main.prototype.setting = function (type, pack) {
  tools.debug('setting ==> ' + type, pack)
  core.setting(type, pack)
}

// 初始化init.
/* exts = {
  config: {
      techOrder: 'FLV', // 优选(FLV, FLASH, HLS)播放
      controls: true // 视频播放器导航（全屏，刷新）
  },
  // 原生视频配置属性
  video: {
      autoplay: true, // video.autoplay
      controls: false, // video.controls
      preload: 'auto', // video.preload
      poster: false, // 视频海报图
  },
  params: {
    start: 0,
    end: tryTime
  }
} */
MT.main.prototype.init = function (access_token, exts, callback) {
  var that = this
  sdkStore.dispatch({
    type: actionTypes.UPDATE_TOKEN,
    payload: {
      token: access_token
    }
  })
  sdkStore.dispatch({
    type: actionTypes.UPDATE_EXT_CONFIG,
    payload: exts
  })
  // 初始化加载...
  room.init(access_token, exts, function (roomData) {
    // fires.run(that)
    // fires.isLoaded = true
    roomObj = roomData
    // 初始化基础方法
    initVod(roomData)
    // 播放器初始化完毕
    if (playerSync()) {
      player.init(roomData)
    }
    callback && callback(roomData)
    // InitPlayProgress()
    ComponentEntry()
    // InitPlayRate()
    // 暴露js接口调用
    that.export2window(roomData)
  })
}
MT.main.prototype.setProgressStyle = function (style) {
  sdkStore.dispatch({
    type: actionTypes.UPDATE_PROGRESS_STYLE,
    payload: { ...style }
  })
}
/**
 * [getSDKMode 获取渲染模式]
 * @return {[type]} [返回渲染模式]
 */
MT.main.prototype.getSDKMode = function () {
  return tools.getSDKMode()
}

/**
 * [destroy 销毁video/desktop]
 * @return void
 */
MT.main.prototype.destroy = function () {
  player.destroy()
  // this.export2window()
  // window.MT = {
  //   SDK: resetMTObject
  // }
}

/**
 * @method [MT.jsCall.do(cmd, ext)]内部SDK调用js接口
 * @params {@String cmd 字符串命令, @String ext 拓展参数}
 * @example MT.jsCall.do("cameraShow");
 */
MT.main.prototype.export2window = function (roomData) {
  var that = this

  // exports
  window.MT = window.MT || {}

  // 暴露共享接口
  window.MT.jsCall = {
    _do: function (cmd, ext) {
      that.callSdk(cmd, ext)
    },
    do: function (cmd, ext) {
      that.callSdk(cmd, ext)
    }
  }

  // Flash Use Only
  window.MT.live = this.live
  window.MT.chat = chat
  window.MT.me = roomData.user
  window.MT.getLiveState = function () {
    return 'start'
  }
}

// Flash播放器回调函数
MT.main.prototype.live = {
  playerLoaded: function (flag) {
    player.vodSwfPlayerState = flag
    return true
  }
}

// 切换媒体Tag
MT.main.prototype.changeMedia = function (tagName) {
  player.changeMedia(tagName)
}

// 获取数据
MT.main.prototype.getMtData = function () {
  return sdkStore.getState().global.data
}

// emit => 发送
MT.main.prototype.emit = function () {
  socket.emit.apply(socket, arguments)
}

// 摄像头(Video)
MT.main.prototype.camera = function (containerId, playerId, callback) {
  player.camera(containerId, playerId, callback)
  playerSync('camera')
}

// 主播放器(PPT播放器)
MT.main.prototype.mainPlayer = function (containerId, playerId, callback) {
  var that = this
  player.mainPlayer(containerId, playerId, callback)
  playerSync('player')
}

/**
 * @note v3.0新增 => 独立课件模块
 * @Type 课件播放器(whiteboad)
 * @param {wrapId} 播放器容器id
 */
MT.main.prototype.whiteboardPlayer = (containerId, playerId, callback) => {
  // fires.join('whiteboard:player', {
  //   parent: whiteboardPlayer,
  //   callback: function () {
  //     player.whiteboardCore(containerId, playerId, callback)
  //   }
  // })
  player.whiteboardCore(containerId, playerId, callback)
}

// 获取源
MT.main.prototype.getSource = function (callback) {
  tools.callback(callback, player.videoSourceNum)
}

// 切换源 传入 @sourceIndex 值
MT.main.prototype.changeSource = function (source) {
  if (source > -1) {
    player.changeSource(source)
  }
}

// 倍速播放
MT.main.prototype.playRate = function (rate) {
  sdkStore.dispatch({
    type: actionTypes.UPDATE_RATE_VALUE,
    payload: {
      rateValue: rate
    }
  })
  // return player.playRate(rate)
}

// 获取当前状态
MT.main.prototype.getAction = function () {
  return player.action
}

// 获取问答区间
MT.main.prototype.getQuesByTimes = function (duration, space, callback) {
  player.getQuestions(duration, space, callback)
}

// 播放
MT.main.prototype.play = function () {
  tools.debug('vod on fire play')
  player.play('forcePlay')
}

// 暂停
MT.main.prototype.pause = function () {
  tools.debug('vod on fire pause')
  player.pause()
}

// 停止
MT.main.prototype.stop = function () {
  tools.debug('vod on fire stop')
  player.stop()
}

// 音量(包括 桌面分享 & video)
// 0 - 1 设置
MT.main.prototype.volume = function (volume) {
  player.volume(volume)
}

// seeking
MT.main.prototype.seek = function (duration) {
  tools.debug('vod on fire seek', duration)
  player.seek(duration)
}
// 前进
MT.main.prototype.forward = function (duration) {
  tools.debug('vod on fire forward', duration)
  player.forward(duration)
}
// 后退
MT.main.prototype.backward = function (duration) {
  tools.debug('vod on fire backward', duration)
  player.backward(duration)
}
// sdk方法
MT.main.prototype.callSdk = function (cmd, toggle) {
  return player.callSdk(cmd, toggle)
}

// sdk里
MT.main.prototype.isMobileSdk = function () {
  return false
}

/**
 * 媒体播放器控制选项配置
 * @param {...}
 */
MT.main.prototype.setMediaControl = function (opts) {
  tools.debug('set controls ==> ', opts)
  var configs = {
    // 全屏
    fullscreenButton: opts.fullscreenButton,

    // 音量
    volumeButton: opts.volumeButton
  }
  if (player.setConfig) {
    player.setConfig(configs)
  }
}

// resize内容
MT.main.prototype.playerResize = function (width, height) {
  return player.resizePlayer(width, height)
}

// 工具类
MT.main.prototype.getTools = function () {
  return tools
}

// on 事件注册
MT.main.prototype.on = function (eventName, callback) {
  if (typeof eventName !== 'undefined' && eventName.length > 0 && typeof eventName === 'string' && typeof callback !== 'undefined' && typeof callback === 'function') {
    // 注册事件到maplist
    map.put(eventName, callback)
  } else {
    alert(STATIC.SYSTEM.MT_ADDMAPLIST_ERROR + ': ' + eventName)
  }
}

/**
 * [plugins 加载插件]
 * @param  {object} type [插件类型]
 * @returns {[objcet]} [返回插件方法]
 */
MT.main.prototype.plugins = function (type) {
  // [投票, 鲜花, 抽奖, 评分]
  switch (type) {
    case 'vote':
      return plugins.vote
    case 'flower':
      return plugins.flower
    case 'lottery':
      break
    case 'score':
      break
    case 'marker':
      return plugins.marker
    case 'iframe':
      return plugins.iframe
  }
  return plugins
}

// resetMTObject = Object.assign({}, MT)

// return MT;
export default MT
// });
