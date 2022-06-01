// define(function (require) {
  // import
  import Store from './store'
  import state from './store/state'
  import * as TYPES from './store/types'
  import STATIC from './mt.static'
  import map from "../utils/map"
  import tools from "../utils/tools"
  import media from './mediaCore'

  // player-core
  let Core = {
    playType: 'live',
    vodPlayer: null, //存储 `vodPlayer.js` 对象方法
    currentMediaSourceIndex: 0, //当前播放媒体资源
    mainContainerId: null,
    curMeidaData: null, //当前媒体详细信息
    mode: 0,
    containers: {},
    playItems: {
      playerIcon: '#tf-xplay-icon',
      posterId: '#tf-xplay-poster'
    },
    playStatus: "wait",
    currentMode: "0", //默认模式
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
      TRIANGLE: 22, // 三角形
      LINE: 18, //直线
      ERASER: 20, //橡皮擦
      DRAW: 25, //画画
      DRAW_LIST: 31, //批量
      PAGE: 51, //翻页
      ARROW: 19, //箭头
      DOTTED_LINE: 21, //虚线
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
      POINTER: 210, //TODO:教棍
      WHITEBOARD_OPEN: 221, // 画板显示
      WHITEBOARD_CLOSE: 220 // 画板隐藏
    },
    constant: {
      MODE_EDUCATION: 0, //教育模式
      MODE_VIDEO: 1, //视频插播模式
      MODE_DESKTOP: 2, //桌面分享模式
      MODE_NAME: {
        0: "课件模式",
        1: "视频分享模式",
        2: "桌面分享模式"
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
      videoEl.addEventListener('x5videoenterfullscreen', function () {
        videoEl.play()
        Store.commit(TYPES.UPDATE_FULLSCREEN_STATE, true)
        tools.debug('wx fullscreen enter...')
        map.get('wx:enter:fullscreen')()
      }, false)
      // 退出全屏
      videoEl.addEventListener('x5videoexitfullscreen', function () {
        videoEl.play()
        Store.commit(TYPES.UPDATE_FULLSCREEN_STATE, false)
        tools.debug('wx fullscreen exit...')
        map.get('wx:exit:fullscreen')()
      }, false)
      // 是否断网
      window.addEventListener('online', event => {
        media.emit('live:network:online', 'online')
      }, false)
      window.addEventListener('offline', event => {
        media.emit('live:network:offline', 'offline')
      }, false)
    },
    // 配置列表
    settingMaps: {
      // 表情包
      'emotions': null //{maps = { {'ubb': 'ubb.gif}, ...}, base: 'path to url....' }
    },
    config: function (options) {
      if (typeof options === 'object') {
        if (options.playType) {
          this.playType = options.playType;
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
      if (typeof (type) === 'string') {
        return this.settingMaps[type]
      }
    },
    // 初始化new传入参数
    initConfig: null,
    // 对整个container进行初始化
    initialize: function () {
      if (this.mainContainerId) {
        document.getElementById(this.mainContainerId).innerHTML = '';
      }
    },
    // 设置播放属性
    setPlayerStatus: function (action) {
      this.playStatus = action
      Store.commit(TYPES.UPDATE_LIVE_STATUS, action)
      let vdom = media.getcurVdom()
      // 是否展示播放按钮
      if (vdom) {
        if (action === 'playing') {
          this.removePlayIcon(vdom)
        } else {
          this.getPlayIcon(vdom)
        }
      }
    },
    // 强制配置音频标签
    isForceAudio: function (cameraFlag) {
      if (this.initConfig && this.initConfig.forceAudio) {
        // 如果用户开启视频, 走正常流程
        if (cameraFlag && cameraFlag === "start") {
          return false;
        }
        return true;
      } else {
        return false;
      }
    },
    // 更新课程数据
    updateCourseData: function (data) {
      if (!data) {
        return false
      }
      var liveData = {}
      if (data && data.liveid > 0){
        liveData.liveId = data.liveid
        Store.commit(TYPES.UPDATE_LIVE_DATA, liveData)
      }
      if (data && data.course_id > 0) {
        liveData.courseId = data.course_id
        Store.commit(TYPES.UPDATE_LIVE_DATA, liveData)
      }
    },
    // 强制配置视频标签
    isForceVideo: function () {
      if (this.initConfig && this.initConfig.forceVideo) {
        return true;
      } else {
        return false;
      }
    },
    //获取容器ID
    getContainerId: function (mode) {
      return 'mt-container-' + mode;
    },
    //获取容器
    getContainer: function (mode) {
      tools.debug('get Container...', mode)
      var wbConDom = document.getElementById(this.mainContainerId)
      return wbConDom;
    },
    //模式切换
    modeChange: function (command, callback) {
      //{st: 8547.8, p: -1, c: "0|2", t: 151}
      var that = this,
        content = command.c.split('|'),
        beforeMode = content[0],
        currentMode = content[1],
        sourceMode = content[1],
        beforeContainer,
        currentContainer;
      // 媒体区操作
      // this.mdeidaOnModeChange()
      // 更新Mode
      Store.commit(TYPES.UPDATE_LIVE_MODE, currentMode)
      // 视频插播 === 桌面分享
      this.baseCurrentMode = currentMode;
      // 如果数据为 content ===> 1|1 会自动转换为 ===> 0|2
      // 后期修改
      if (beforeMode == that.constant.MODE_VIDEO) {
        beforeMode = that.constant.MODE_DESKTOP;
      }
      if (currentMode == that.constant.MODE_VIDEO) {
        currentMode = that.constant.MODE_DESKTOP;
      }
      this.beforeMode = beforeMode;
      this.currentMode = currentMode;
      let modeData = {
        beforeMode: beforeMode,
        currentMode: currentMode,
        sourceMode: sourceMode
      }
      // callback
      callback && callback(beforeMode, currentMode);
      // 切换发送指令
      map.get('live:mode:change')(modeData);
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
        urlStream = "";
      tools.debug("stream content => ", content);
      // 点播
      if (this.playType == 'playback') {
        return content;
      }
      // 直播
      else {
        // m3u8地址组装
        urlStream = STATIC.PROTOCOL + that.stream2m3u8(content);
        // exports
        return urlStream;
      }
    },

    // stream to m3u8
    stream2m3u8: function (content) {
      // the Ruls.
      var urlStream = "";
      if (!content.hosts) {
        return false
      }
      // 地址组装
      urlStream = content.hosts.hls + content.domain +
        "/" + content.app +
        "/" + content.path +
        "/" + content.ext.m3u8 +
        (content.query.length > 0 ? "?" + content.query : "");
      tools.debug('get hls url ==>', STATIC.PROTOCOL + urlStream)
      return urlStream;
    },
    // stream to flv
    stream2flv: function (content) {
      // the Ruls.
      var urlStream = "";
      // 地址组装
      urlStream = content.hosts.flv + content.domain +
        "/" + content.app +
        "/" + content.path + content.ext.flv + (content.query.length > 0 ? "?" + content.query : "");
      tools.debug('get flv url ==>', STATIC.PROTOCOL + urlStream)
      return urlStream;
    },
    // stream to rtmp
    stream2Rtmp: function (content) {
      // the Ruls.
      var urlStream = "";
      // 地址组装
      urlStream = 'rtmp://' + content.hosts.rtmp + content.domain + "/" + content.app + "/" + content.path
      tools.debug('get rtmp url ==>', urlStream)
      return urlStream;
    },
    // path / id 返回(仅供flash使用)
    stream2RtmpPath: function (content) {
      // the Ruls.
      var urlStream = {
        path: 'rtmp://' + content.hosts.rtmp + content.domain + "/" + content.app + "/",
        id: content.path
      };
      // 地址组装
      // urlStream = 'rtmp://' + content.hosts.rtmp + content.domain + "/" + content.app + "/" + content.path
      tools.debug('get rtmp path ==>', urlStream)
      return urlStream;
    },
    // 播放按钮点击播放
    getPlayIcon: function (media) {
      tools.debug('Start getPlayIcon toolkit...')
      let iconDom = document.querySelector(this.playItems.playerIcon)
      // 已存在icon
      if (iconDom) {
        iconDom.style.display = 'block'
        return false
      }
      // 无video dom
      if (!media.parentNode) {
        return false
      }
      var that = this
      var touchSupport = tools.touchSupport()
      var eventType = (touchSupport ? 'touchend' : 'click')
      
      // 播放按钮
      var el = document.createElement('div')
      el.id = this.playItems.playerIcon.replace('#', '')
      el.style['position'] = 'absolute'
      el.style['width'] = '100%'
      el.style['height'] = '100%'
      el.style['z-index'] = '100'
      el.style['top'] = '0'
      el.style['left'] = '0'
      el.style['zIndex'] = 100
      el.style['cursor'] = 'pointer'
      el.style.cssText += 'background-image: url(' + STATIC.player.PLAY_ICON + ');background-repeat: no-repeat; background-position: 50% 50%;'
      media.parentNode.appendChild(el)

      // 播放海报
      let ext = Store.getters('getExtData')
      if (ext.video.poster) {
        var elPoster = document.createElement('div')
        elPoster.id = this.playItems.posterId.replace('#', '')
        elPoster.style['position'] = 'absolute'
        elPoster.style['width'] = '100%'
        elPoster.style['height'] = '100%'
        elPoster.style['z-index'] = '100'
        elPoster.style['top'] = '0'
        elPoster.style['left'] = '0'
        elPoster.style['zIndex'] = 90
        elPoster.style['cursor'] = 'pointer'
        elPoster.style.cssText += `
        background: url('${ext.video.poster}') rgba(0, 0, 0, 0.65) 50% 50% no-repeat;
        background-size: contain; 
        `
        media.parentNode.appendChild(elPoster)
      }

      // event
      el.addEventListener(eventType, function () {
        // 播放完毕删除按钮 & 去事件
        media.play().then(function () {
          media.style.width = '100%'
          media.style.height = '100%'
        })
        el.removeEventListener(eventType, null, false);
        el.style.display = 'none'
        // poster隐藏
        if (elPoster) {
          elPoster.style.display = 'none'
        }
      }, false)
    },
    // remove play icon
    removePlayIcon: function (media) {
      tools.debug('remove player toolkit...')
      // playicon => 删除
      var playIco = document.querySelector(this.playItems.playerIcon)
      if (playIco) {
        if (playIco.style.display === 'none') {
          return false
        }
        playIco.style.display = 'none'
      }
      if (media) {
        media.style.width = '100%'
        media.style.height = '100%'
      }
      // poster => 隐藏
      var playPoster = document.querySelector(this.playItems.posterId)
      if (playPoster) {
        playPoster.style.display = 'none'
      }
    },
    // 海报
    showPoster: function () {
      var playPoster = document.querySelector(this.playItems.posterId)
      if (playPoster) {
        playPoster.style.display = 'block'
      }
    },
    // 媒体切换操作
    mdeidaOnModeChange: function () {
      // 删除poster
      var playPoster = document.querySelector(this.playItems.posterId)
      if (playPoster) {
        tools.debug('remove kit ==>', playPoster)
        playPoster.parentNode.removeChild(playPoster)
      }
      // 删除playicon
      var playIcon = document.querySelector(this.playItems.playerIcon)
      if (playIcon) {
        tools.debug('remove kit ==>', playIcon)
        playIcon.parentNode.removeChild(playIcon)
      }
    },
    // 下课操作
    stop: function () {
      tools.debug('remove shortcut dom')
      var playIco = document.querySelector(this.playItems.playerIcon)
      if (playIco) {
        playIco.parentNode.removeChild(playIco)
      }
    },
    // 事件监听
    on: function (eventName, payload) {
      tools.debug('playercore on event ==>', eventName, payload)
      switch (eventName) {
        case 'media:destroy':
          if (payload && payload === 'global') {
            this.stop()
          }
          break
        default:
          break
      }
    },
    // video.DOM播放
    elementPlay: function (_videoDom) {
      if (_videoDom) {
        var that = this
        var playTarget = null

        // 播放中状态
        let onPlaying = function () {
          tools.debug('H5 player is playing.')
          map.get('live:video:onplay')()
          // that.setPlayerStatus('playing')
          // that.removePlayIcon(_videoDom)
          return Promise.resolve('success')
        }

        // 无法播放状态
        let onError = function (err) {
          // this.playStatus = "error"
          tools.warn('h5 player play Exception! Autoplay disabled!')
          map.get('live:video:pause')()
          media.emit('live:video:pause', 'pause')
          // 暂停播放且显示播放按钮
          // that.getPlayIcon(_videoDom)
          // 海报展示
          that.showPoster(_videoDom)
          return Promise.resolve('error')
        }

        // 普通错误
        tools.debug('vdom fire play...')
        let playObj = _videoDom.play().catch(err => {
          onError()
          tools.warn('In play() function Exception! Autoplay disabled!', err)
        })

        // 不支持播放->promise对象 || 支持Promise
        if (playObj && playObj instanceof Promise || !playObj && Promise ){
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
      if (!this.curMeidaData.detail) {
        return false
      }
      /**
       * 验证规则: 如 (视频时长 - 服务器返回时长 > 10秒) 不符合规则
       * */
      var that = this,
        vilidateDuration = (currentMediaSourceDuration - that.curMeidaData.detail.duration);

      // callback
      var _callback = typeof (callback === "function") ? callback : function () {};

      tools.debug("验证视频时长 ===> 偏差" + vilidateDuration + "秒.");

      // 伪直播不会进行时长检查,因为播放HLS
      if (this.vodPlayer.vodLiveType) {
        _callback(true)
        return
      }

      // 验证不通过, 切换下一个资源
      if (vilidateDuration > that.vodPlayer.live.timeDiffLimit) {
        that.currentMediaSourceIndex += 1;
        // 大于总数
        if (that.currentMediaSourceIndex > that.curMeidaData.detail.allUrl.length) {
          that.currentMediaSourceIndex = that.curMeidaData.detail.allUrl.length - 1;
        }
        that.vodPlayer.changeSource(that.currentMediaSourceIndex);
        _callback(false);
      }
      // 验证通过
      else {
        _callback(true);
      }

    },

    // 设置视频源(m3u8 to formats)
    getVideoSource: function (url) {

      tools.debug("getVideoSource ==> " + url);

      if (!url) {
        return false;
      }

      var isM3U8 = /\.m3u8/ig.test(url);
      // set sources
      var source = [];
      // m3u8
      if (isM3U8) {
        var m3u8Source = {
          type: "application/x-mpegURL",
          src: url
        };
        source.push(m3u8Source);
      }
      // mp4 ==> "mp4", "mov", "webm", "ogv", "hts"
      else {
        var formats = ["mp4", "mov", "webm", "ogv", "hts"];
        // url = url.replace(/\.mp4/ig, "{expression}");
        // sources
        for (var i = 0; i < formats.length; i++) {
          var o = {};
          var _format = formats[i];
          o.type = "video/" + _format;
          // url+formats[i];
          o.src = url.replace(/\.mp4/ig, "." + _format);
          source.push(o);
        };
        tools.debug("vod socure ===>", source);
      }
      // exports
      return source;
      // return video;
    },
    // safari 下打开摄像头视频: 可配置 room.config.safariOpenVideo
    isOpenSafariVideo: function () {
      if (this.initConfig && this.initConfig.safariOpenVideo) {
        return true;
      }
      return false;
    },

    // Audio创建规则
    isCreateAudio: function () {
      var that = this;
      if (tools.isIphone()) {
        if (tools.isQQMobile() || that.isOpenSafariVideo() || tools.getPlatformInfo().version > 10) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
  };
  // return core;
  export default Core
// }) ;