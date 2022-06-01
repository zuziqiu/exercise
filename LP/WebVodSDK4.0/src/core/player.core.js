import whiteboardPlayer from './whiteboard.player'
import map from "@map"
import STATIC from './mt.static'
import tools from "@tools"
import store from './store';
import media from './mediaCore'

var core = {
  playType: 'live',
  vodPlayer: null, //存储 `vodPlayer.js` 对象方法
  currentMediaSourceIndex: 0, //当前播放媒体资源
  mainContainerId: null,
  curMeidaData: null, //当前媒体详细信息
  mode: 0,
  containers: {},
  playStatus: 'wait',
  currentMode: '0', //默认模式
  // 指令常量
  COMMAND: {
    START: 'start', //直播开始
    STOP: 'stop', //直播结束
    WAIT: 'wait', //直播未开始
    GRAFFITI: 1, //清空画笔
    RUBBER: 26, // 选区擦除
    IMAGE: 11, //图片
    TEXT: 15, //文字
    CIRCLE: 16, //画圆
    RECTANGLE: 17, //矩形
    LINE: 18, //直线
    ERASER: 20, //橡皮擦
    DRAW: 25, //画画
    DRAW_LIST: 31, //批量
    PAGE: 51, //翻页
    ARROW: 19, //箭头
    DOTTED_LINE: 21, //虚线
    TRIANGLE: 22, //空心三角形
    PPTCLEAR: 3, //清空PPT画笔
    CAMERA_START: 101, //摄像头启动
    CAMERA_STOP: 102, //摄像头关闭
    VIDEO_START: 103, //推流开始
    VIDEO_STOP: 104, //推流结束
    MODE_CHANGE: 151, //模式切换
    DESKTOP_START: 201, //桌面分享开始
    DESKTOP_STOP: 202, //桌面分享结束
    DESKTOP_PAUSE: 203, //桌面分享暂停
    IMAGE_PRELOAD: 1111, //图片预加载
    LIVE_POWER_CHANGE: 161, //权限切换
    WHITEBOARD_OPEN: 221, // 画板显示
    WHITEBOARD_CLOSE: 220, // 画板隐藏
    POINTER: 1112 //TODO:教棍
  },
  constant: {
    MODE_EDUCATION: 0, //教育模式
    MODE_VIDEO: 1, //视频插播模式
    MODE_DESKTOP: 2, //桌面分享模式
    MODE_NAME: {
      0: '课件模式',
      1: '视频分享模式',
      2: '桌面分享模式'
    }
  },

  // 设置flvplayer
  setFlvPlayer: function (player) {
    if (!this.flvPlayer) {
      this.flvPlayer = player
    }
  },

  // 事件
  commonEventListener: function (videoEl) {
    // 进入全屏
    videoEl.addEventListener(
      'x5videoenterfullscreen',
      function () {
        videoEl.play()
        tools.debug('wx fullscreen enter...')
        map.get('wx:enter:fullscreen')()
      },
      false
    )
    // 退出全屏
    videoEl.addEventListener(
      'x5videoexitfullscreen',
      function () {
        videoEl.play()
        tools.debug('wx fullscreen exit...')
        map.get('wx:exit:fullscreen')()
      },
      false
    )
  },

  // 配置列表
  settingMaps: {
    // 表情包
    emotions: null //{maps = { {'ubb': 'ubb.gif}, ...}, base: 'path to url....' }
  },

  config: function (options) {
    if (typeof options === 'object') {
      if (options.playType) {
        this.playType = options.playType
      }
    }
  },

  // 设置
  setting: function (type, pack) {
    // type => 必先在配置列表里定义属性
    if (!type) {
      type = ''
    }
    // 必须有预设属性才能配置
    if (this.settingMaps.hasOwnProperty(type)) {
      this.settingMaps[type] = pack
    } else {
      tools.debug('配置非法属性 ==> ' + type)
    }
  },

  // 获取属性
  getSetting: function (type) {
    if (typeof type === 'string') {
      return this.settingMaps[type]
    }
  },

  // 初始化new传入参数
  initConfig: null,

  // 对整个container进行初始化
  initialize: function () {
    if (this.mainContainerId) {
      document.getElementById(this.mainContainerId).innerHTML = ''
    }
  },

  // 设置播放属性
  setPlayerStatus: function (action) {
    this.playStatus = action
  },

  // 强制配置音频标签
  isForceAudio: function (cameraFlag) {
    if (this.initConfig && this.initConfig.forceAudio) {
      // 如果用户开启视频, 走正常流程
      if (cameraFlag && cameraFlag === 'start') {
        return false
      }
      return true
    } else {
      return false
    }
  },

  // 强制配置视频标签
  isForceVideo: function () {
    if (this.initConfig && this.initConfig.forceVideo) {
      return true
    } else {
      return false
    }
  },

  //获取容器ID
  getContainerId: function (mode) {
    return 'mt-container-' + mode
  },

  //获取容器
  getContainer: function (mode) {
    var containerId = this.getContainerId(mode)
    var container = document.getElementById(containerId)
    var styleCon = document.querySelector('#tf-style-container')
    var wbConDom = document.getElementById(this.mainContainerId)
    if (!wbConDom) {
      return false
    }
    // style con
    if (!styleCon) {
      var style = document.createElement('style')
      style.type = 'text/css'
      style.id = 'tf-style-container'
      document.head.appendChild(style)
      styleCon = document.querySelector('#tf-style-container')
    }
    // div con
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      styleCon.sheet.addRule('#' + container.id, 'width: 100%; height: 100%; overflow: hidden;')
      if (wbConDom) {
        document.getElementById(this.mainContainerId).appendChild(container)
      }
    }
    return container
  },
  //模式切换
  modeChange: function (command, callback) {
    //{st: 8547.8, p: -1, c: "0|2", t: 151}
    var that = this,
      content = command.c.split('|'),
      beforeMode = content[0],
      currentMode = content[1],
      sourceMode = content[1]
    // beforeContainer,
    // currentContainer;

    // 原始数据
    /*if(this.baseCurrentMode == currentMode){
        return false;
    }*/
    // this.baseCurrentMode = currentMode;

    // 视频插播 === 桌面分享
    // 如果数据为 content ===> 1|1 会自动转换为 ===> 0|2
    // 后期修改
    if (beforeMode == that.constant.MODE_VIDEO) {
      beforeMode = that.constant.MODE_DESKTOP
    }
    if (currentMode == that.constant.MODE_VIDEO) {
      currentMode = that.constant.MODE_DESKTOP
    }

    this.beforeMode = beforeMode
    this.currentMode = currentMode
    // echo 取消原来的画板和桌面&视频插播的dom。这里开始做新逻辑
    let playerCtx = store.getters('getPlayer')
    let wbWp = playerCtx.whiteboardPlayer.wrapContainer
    let videoWp = playerCtx.videoPlayer.wrapContainer

    // 画板
    if (currentMode == 0) {
      if (document.querySelector('#' + wbWp)) {
        document.querySelector('#' + wbWp).style.display = 'block'
      }
      if (document.querySelector('#' + videoWp)) {
        document.querySelector('#' + videoWp).style.display = 'none'
      }
      whiteboardPlayer && whiteboardPlayer.whiteboardObject && whiteboardPlayer.whiteboardObject.whiteboardResize()
    }
    // 桌面分享/视频插播
    else {
      if (document.querySelector('#' + wbWp)) {
        document.querySelector('#' + wbWp).style.display = 'none'
      }
      if (document.querySelector('#' + videoWp)) {
        document.querySelector('#' + videoWp).style.display = 'block'
      }
    }
    // WEB切换
    map.get('live:mode:change')({
      beforeMode: beforeMode,
      currentMode: currentMode,
      sourceMode: sourceMode
    })

    callback && callback(beforeMode, currentMode)
  },

  // 获取 flv 地址格式
  getFlvVideoUrl: function (stream) {
    return STATIC.PROTOCOL + this.stream2flv(stream)
  },

  /**
   * @直播stream组装规则:(课件模式 | 桌面分享模式)
   * hls => http:// + hosts.hls + domain + / + app + / + path + / + ext.m3u8 ( query ? "?" + query : '')
   * ngb => http:// + ip + / + hosts.hls + domain + / app + / + path + ext.m3u8 + (query ? "?" + query : '')
   */
  getVideoUrl: function (mainStream) {
    var that = this,
      content = mainStream,
      urlStream = ''

    tools.debug('stream content => ', content)

    // 点播
    if (this.playType == 'playback') {
      return content
    }
    // 直播
    else {
      // m3u8地址组装
      urlStream = STATIC.PROTOCOL + that.stream2m3u8(content)

      // exports
      return urlStream
    }
  },

  // stream to m3u8
  stream2m3u8: function (content) {
    // the Ruls.
    var urlStream = ''
    // 地址组装
    urlStream = content.hosts.hls + content.domain + '/' + content.app + '/' + content.path + '/' + content.ext.m3u8 + (content.query.length > 0 ? '?' + content.query : '')
    return urlStream
  },
  // stream to flv
  stream2flv: function (content) {
    // the Ruls.
    var urlStream = ''
    // 地址组装
    urlStream = content.hosts.flv + content.domain + '/' + content.app + '/' + content.path + content.ext.flv + (content.query.length > 0 ? '?' + query : '')
    tools.debug('get flv url ==>', STATIC.PROTOCOL + urlStream)
    return urlStream
  },
  // remove play icon
  removePlayIcon: function (media) {
    var playIco = document.querySelector('#tf-xplay-icon')
    if (playIco) {
      playIco.parentNode.removeChild(playIco)
      if (media) {
        media.style.width = '100%'
        media.style.height = '100%'
      }
    }
  },
  // 播放按钮点击播放
  getPlayIcon: function (media) {
    if (document.querySelector('#tf-xplay-icon') || !media) {
      return false
    }
    let conf = store.getters('getExtData')
    if (conf && !conf.config.playIcon) {
      return false
    }
    var that = this
    var touchSupport = tools.touchSupport()
    var eventType = touchSupport ? 'touchend' : 'click'
    var el = document.createElement('div')
    el.id = 'tf-xplay-icon'
    // el node
    el.style['position'] = 'relative'
    el.style['width'] = '100%'
    el.style['height'] = '100%'
    el.style['z-index'] = '100'
    el.style['top'] = '0'
    el.style['left'] = '0'
    el.style['cursor'] = 'pointer'
    el.style.cssText += 'background-image: url(' + STATIC.player.PLAY_ICON + ');background-color: #2f2f2f;background-repeat: no-repeat; background-position: 50% 50%;'
    media.style.width = '1px'
    media.style.height = '1px'
    // parent
    if (media.parentNode) {
      media.parentNode.style['width'] = '100%'
      media.parentNode.style['height'] = '100%'
      media.parentNode.appendChild(el)
    }
    // event
    el.addEventListener(
      eventType,
      function () {
        // 播放完毕删除按钮 & 去事件
        media.play().then(function () {
          media.style.width = '100%'
          media.style.height = '100%'
          if (that.flvPlayer) {
            that.flvPlayer.play(true)
          }
        })
        el.removeEventListener(eventType, null, false)
        el.parentNode.removeChild(this)
      },
      false
    )
  },
  // video.DOM播放
  // elementPlay: function (_videoDom, callback) {
  //   if (_videoDom) {
  //     var that = this
  //     var playTarget = null
  //     // 普通错误
  //     // try {
  //     //   playTarget = _videoDom.play()
  //     // } catch (err) {
  //     //   tools.debug('[WARN]video autoplay disabled!', err)
  //     //   map.get('live:video:pause')()
  //     // }
  //     // 支持 promise
  //     if (typeof (_videoDom) !== 'undefined') {
  //       try {
  //         _videoDom.play().then(function () {
  //           // playing
  //           that.setPlayerStatus('playing')
  //           tools.debug('H5 player is playing.')
  //           map.get('live:video:onplay')()
  //           that.removePlayIcon(_videoDom)
  //           tools.callback(callback, 'play')
  //         }).catch(function (err) {
  //           // this.playStatus = "error"
  //           that.setPlayerStatus('error')
  //           tools.debug('h5 player play error! Autoplay disabled!', err)
  //           map.get('live:video:pause')()
  //           // 暂停播放且显示播放按钮
  //           that.getPlayIcon(_videoDom)
  //           tools.callback(callback, 'error')
  //         })
  //       } catch (err) {
  //         tools.debug('unSupport Promise.')
  //       }
  //     } else {
  //       _videoDom.play()
  //     }
  //   }
  // },
  // video.DOM播放
  elementPlay: function (_videoDom) {
    if (_videoDom) {
      var that = this
      var playTarget = null

      // 播放中状态
      let onPlaying = function () {
        tools.debug('H5 player is playing.')
        map.get('live:video:onplay')()
        that.setPlayerStatus('playing')
        that.removePlayIcon(_videoDom)
        return Promise.resolve('success')
      }

      // 无法播放状态
      let onError = function (err) {
        // this.playStatus = "error"
        tools.warn('h5 player play Exception! Autoplay disabled!')
        map.get('live:video:pause')()
        // media.emit('live:video:pause', 'pause')
        // 暂停播放且显示播放按钮
        that.getPlayIcon(_videoDom)
        // 海报展示
        // that.showPoster(_videoDom)
        return Promise.resolve('error')
      }

      // 普通错误
      tools.debug('vdom fire play...')
      let playObj = _videoDom.play().catch((err) => {
        tools.warn('In play() function Exception! Autoplay disabled!', err)
      })

      // 不支持播放->promise对象 || 支持Promise
      if ((playObj && playObj instanceof Promise) || (!playObj && Promise)) {
        // 播放逻辑: 如果执行了播放, video状态是暂停, 说明自动播放失败
        if (_videoDom.paused) {
          return onError()
        } else {
          return onPlaying()
        }
      }
      // 都不支持
      else {
        return null
      }
    }
  },
  // 验证媒体资源信息
  mediaValidate: function (currentMediaSourceDuration, callback) {
    if (!(this.curMeidaData && this.curMeidaData.detail)) {
      return false
    }
    /**
     * 验证规则: 如 (视频时长 - 服务器返回时长 > 10秒) 不符合规则
     * */
    var that = this,
      vilidateDuration = (Math.floor(currentMediaSourceDuration - that.curMeidaData.detail.duration) * 100) / 100

    // callback
    var _callback = typeof (callback === 'function') ? callback : function () {}

    tools.debug('验证视频时长 ===> 偏差' + vilidateDuration + '秒.')

    // 伪直播不会进行时长检查,因为播放HLS
    if (this.vodPlayer.vodLiveType) {
      _callback(true)
      return
    }

    // 验证不通过, 切换下一个资源
    if (vilidateDuration > that.vodPlayer.live.timeDiffLimit) {
      that.currentMediaSourceIndex += 1
      // 大于总数
      if (that.currentMediaSourceIndex > that.curMeidaData.detail.allUrl.length) {
        that.currentMediaSourceIndex = that.curMeidaData.detail.allUrl.length - 1
      }
      that.vodPlayer.changeSource(that.currentMediaSourceIndex)
      _callback(false)
    }
    // 验证通过
    else {
      _callback(true)
    }
  },

  // 设置视频源(m3u8 to formats)
  getVideoSource: function (url) {
    tools.debug('getVideoSource ==> ' + url)

    if (!url) {
      return false
    }

    var isM3U8 = /\.m3u8/gi.test(url)
    // set sources
    var source = []
    // m3u8
    if (isM3U8) {
      var m3u8Source = {
        type: 'application/x-mpegURL',
        src: url
      }
      source.push(m3u8Source)
    }
    // mp4 ==> "mp4", "mov", "webm", "ogv", "hts"
    else {
      var formats = ['mp4', 'mov', 'webm', 'ogv', 'hts']
      // url = url.replace(/\.mp4/ig, "{expression}");
      // sources
      for (var i = 0; i < formats.length; i++) {
        var o = {}
        var _format = formats[i]
        o.type = 'video/' + _format
        // url+formats[i];
        o.src = url.replace(/\.mp4/gi, '.' + _format)
        source.push(o)
      }
      tools.debug('vod socure ===>', source)
    }
    // exports
    return source
    // return video;
  },
  // safari 下打开摄像头视频: 可配置 room.config.safariOpenVideo
  isOpenSafariVideo: function () {
    if (this.initConfig && this.initConfig.safariOpenVideo) {
      return true
    }
    return false
  },

  // Audio创建规则
  isCreateAudio: function () {
    let isAudioOnly = store.getters('getExtData').config.audioOnly
    return isAudioOnly ? true : false
  }
}
export default core;
