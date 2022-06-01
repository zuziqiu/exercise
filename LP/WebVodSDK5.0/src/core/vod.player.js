/**
 * #### 此版本为正式版 #####
 * ##
 */

// define(function (require) {

// var map = require('@map'),
//   tools = require('@tools'),
// var log = require("./log"),
//   schedule = require('../common/utils/schedule');
// network = require('./network');
// import.
import log from './log'
import schedule from '../common/utils/schedule'
import tools from '../common/utils/tools'
import map from '../common/utils/map'
import core from './player.core'
// import whiteboard from './whiteboard'
import whiteboardPlayer from '../playerModule/whiteboardPlayer'
import video from './video'
import videoPlayer from './video.player'
import media from './mediaCore'
// import STATIC from './mt.static'
import network from '@/plugins/network/network'
import sdkStore from '@/sdkStore'
import * as actionTypes from '@/sdkStore/constants/actionTypes'
import STATIC from '@/sdkStore/states/staticState'
import cmdSchedule from '@/core/cmdSchedule'
let cameraState = sdkStore.getState().camera
sdkStore.listen(
  (state) => state.camera,
  (dispatch, nextCamera) => {
    cameraState = nextCamera
  }
)
// 根据当前播放的媒体更新主轴
sdkStore.listen(
  (state) => state.camera.currentDuration,
  (dispatch, cur, prev, state) => {
    if (state.vodStatus.seekStatus == 'done') {
      let currentTime = state.media.mediaDataArray[state.media.curMeidaIndex].st + cur
      dispatch({
        type: actionTypes.UPDATE_CURRENT_TIME,
        payload: {
          currentTime: currentTime
        }
      })
      map.get('live:duration')(currentTime, state.vodStatus.totalTime, currentTime / state.vodStatus.totalTime)
    }
  }
)

function getVideoUrl(content) {
  if (cameraState.playType === 'playback') {
    return content
  } else {
    content = content.replace('rtmp://', 'http://').split('|')
    return content[0] + '/' + content[1] + '/playlist.m3u8'
  }
}

// import Hls from 'hls.js'

// player.core 配置
core.config({
  playType: 'playback'
})

//视频配置
sdkStore.dispatch({
  type: actionTypes.UPDATE_CAMERA_CONFIG,
  payload: {
    playType: 'playback',
    pptPlayerType: 'html5'
  }
})
// video.config({
//   playType: 'playback',
//   pptPlayerType: 'html5'
// })

var player = {
  playMode: core.currentMode || '0',
  isSkip: true,
  pauseLock: false,
  currentDuration: 0,
  currentMediaPath: null,
  playDuration: 0,
  tickTimmer: null,
  playNumber: 1,
  live: null,
  videos: [],
  desktops: [],
  chatSections: [],
  commands: [],
  chapters: [],
  questions: [],
  messages: [],
  cmdStartTime: [],
  seekPageCommands: {},
  duration: 0,
  version: null,
  title: null,
  action: null,
  emotions: null,
  resizeTimer: null,
  timeRange: null,
  currentVideoUrl: '',
  currentVideoHost: '',

  // 暴露sdk
  callSdk: function (cmd, toggle) {
    // return video.callSdk(cmd, toggle)
  },
  // 内部事件监听
  on(eventName, payload) {
    let logs = `vodPlayer emit on ==> ${eventName}, ${payload}`
    if (eventName === 'vod:video:playing') {
      console.debug(logs)
    } else {
      tools.debug(logs)
    }
    switch (eventName) {
      // 视频错误
      case 'live:video:error':
        this.changeSource()
        break
      // 播放
      case 'vod:video:canplay':
        this.play()
        break
      // 离线
      case 'vod:on:offline':
        this.pause()
        map.get('vod:on:offline')()
        break
      // 在线
      case 'vod:on:online':
        this.play()
        map.get('vod:on:online')()
        break
      // video => 暂停
      case 'vod:video:pause':
        // 由播放器video抛出事件
        this.pause(true)
        break
      default:
        break
    }
  },

  // 暴露Resize
  resizePlayer: function (w, h) {
    var that = this
    if (that.resizeTimer) {
      clearTimeout(that.resizeTimer)
    }
    whiteboardPlayer.resize()
  },
  // 加载 `commands.json`
  jsonCache: {},
  jsonVersion: '',
  loadJson: function (url, callback, useCache) {
    var that = this
    //jsonurl 加上版本号
    if (url.indexOf('.json') > -1) {
      if (that.jsonVersion == '' && url.indexOf('?v=') > -1) {
        that.jsonVersion = url.split('?v=')[1].split('&')[0]
      } else if (that.jsonVersion != '' && url.indexOf('?v=') == -1) {
        url += url.indexOf('?') > -1 ? '&v=' + that.jsonVersion : '?v=' + that.jsonVersion
      }
    }
    url = tools.detectProtocol(url)
    url = network.getRetryUrl(url)
    if (useCache && player.jsonCache[url]) {
      tools.debug('load json from cache:' + url)
      callback(player.jsonCache[url])
      return true
    }
    tools.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      cache: true,
      timeout: 10000, //10s
      success: function (res) {
        if (useCache) {
          player.jsonCache[url] = res
        }
        callback(res)
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        log.errorReport({
          type: 'loadJson',
          msg: url + ',' + textStatus
        })

        tools.debug('LoadJson:====> error loading:' + url)
        tools.debug(XMLHttpRequest)
        tools.debug(textStatus)

        network.loadRetry(url, function (url) {
          that.loadJson(url, callback)
        })
      }
    })
    // }
  },

  // 配置
  config: null,

  // 设置configs
  setConfig: function (opts) {
    this.config = opts
  },

  // 执行config
  fireConfig: function () {
    var that = this

    if (!that.config) {
      return false
    }
  },
  // 画板播放器
  whiteboardCore: function (containerId, playerId, callback) {
    sdkStore.dispatch({
      type: actionTypes.UPDATE_WHITEBOARD_DOM,
      payload: {
        wrapContainer: containerId,
        playerId: playerId,
        callback: callback
      }
    })
    this.fireWhiteboard()
  },

  fireWhiteboard: function () {
    var that = this
    media.emit('ppt:player', this)
    return Promise.resolve()
  },
  // 桌面分享 + 视频插播
  mainPlayer: function (containerId, playerId, callback) {
    // clone
    core.mainContainerId = containerId
    this.containerId = containerId
    this.playerId = playerId
    this.vodCallback = callback

    sdkStore.dispatch({
      type: actionTypes.UPDATE_VIDEO_PLAYER_DOM,
      payload: {
        wrapContainer: containerId,
        playerId: playerId,
        vodCallback: callback
      }
    })

    media.emit('video:player', this)
  },
  videoplayer: function (containerId, playerId, callback) {
    // clone
    core.mainContainerId = containerId
    this.containerId = containerId
    this.playerId = playerId
    this.vodCallback = callback

    // sdkStore.dispatch({
    //   type: actionTypes.UPDATE_VIDEO_PLAYER_DOM,
    //   payload: {
    //     wrapContainer: containerId,
    //     playerId: playerId,
    //     vodCallback: callback
    //   }
    // })
    sdkStore.dispatch({
      type: actionTypes.UPDATE_VIDEO_CONTAINER_ID,
      payload: {
        containerId: containerId
      }
    })
    sdkStore.dispatch({
      type: actionTypes.UPDATE_VIDEO_PLAYER_ID,
      payload: {
        playerId: playerId
      }
    })
    media.emit('video:player', this)
  },
  // 摄像头
  camera: function (containerId, playerId, callback) {
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAYER_DOM,
      payload: {
        wrapContainer: containerId,
        playerId: playerId,
        vodCallback: callback
      }
    })
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_CONTAINER_ID,
      payload: containerId
    })
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAYER_ID,
      payload: playerId
    })
    // video.camera(containerId, playerId, callback)
  },
  getUrl: function (url) {
    if (url) {
      return url
    }
  },
  // 广播事件
  broadcastList: function (url) {
    var that = this
    that.loadJson(url, function (datalist) {
      tools.debug('广播数据===>', datalist)
      // 广播数据
      if (datalist) {
        if (tools.isInNative()) {
        } else {
          map.get('live:broadcast:list')(datalist)
        }
      }
    })
  },
  // 点播数据初始化
  vodStart: function (live) {
    var that = this
    // 复制到 => core
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_DURATION,
      payload: live.duration
    })
    // video.duration = live.duration
    core.vodPlayer = that
    // video.getCamera()
    that.live = live
    network.addHostGroup(live.hostGroup || {})

    // 如果有配置表情包
    var emotions = core.getSetting('emotions')
    if (emotions) {
      that.emotions = emotions
    }
    // 否则读取服务器默认配置
    else {
      that.emotions = live.emotions
    }

    // 创建element时配置优先级
    if (live.h5play && live.h5play == 1) {
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_CONFIG,
        payload: {
          videoPlayType: 'html5'
        }
      })
      videoPlayer.config({
        videoPlayType: 'html5'
      })
    }

    if (typeof live.videoUrl === 'string') {
      live.videoUrl = [live.videoUrl]
    }

    if (typeof live.desktopUrl === 'string') {
      live.desktopUrl = [live.desktopUrl]
    }

    tools.debug('vod url:' + live.vod)
    tools.debug('video url:' + live.videoUrl)

    // 当前时间 总时间 进度
    that.version = live.version //root.getAttribute('version');
    that.duration = live.duration //root.getAttribute('totalTime');
    that.totalTime = live.duration //root.getAttribute('totalTime');
    that.title = live.title //unescape(pages_root.getAttribute('name'));

    var videoSections = [],
      videoSourceNum = 0

    // 有medias属性
    if (live.medias) {
      var liveMedia = live.medias
      for (var v = 0, mlen = liveMedia.length; v < mlen; v++) {
        var vObj = {
          st: Math.abs(liveMedia[v].start),
          et: Math.abs(liveMedia[v].end),
          duration: liveMedia[v].end - liveMedia[v].start,
          name: liveMedia[v].name,
          snapshot: liveMedia[v].snapshot,
          url: liveMedia[v].url[0],
          allUrl: liveMedia[v].url,
          _source: liveMedia[v]
        }
        if (videoSourceNum < liveMedia[v].url.length) {
          videoSourceNum = liveMedia[v].url.length
        }
        videoSections.push(vObj)
      }
    }

    // 按 `et` 时间点排序
    // that.videoSections = tools.sortObjByKey(videoSections, "et");
    that.videoSections = videoSections
    that.videoSourceNum = videoSourceNum
    tools.debug('video sections===>', that.videoSections)
    window.__vodSections = that.videoSections

    // 合并数据传输给原生
    map.get('live:video:sections')(videoSections)
    console.log('videoSections ==>', videoSections)
    // 设置媒体资源组
    sdkStore.dispatch({
      type: actionTypes.UPDATE_MEDIA_DATA_ARRAY,
      payload: {
        mediaDataArray: videoSections
      }
    })
    // 设置第一个媒体的url
    sdkStore.dispatch({
      type: actionTypes.UPDATE_MEDIA_URL,
      payload: {
        mediaUrl: videoSections[0]?.url || null
      }
    })

    // 如果有JSON-V2版本优先加载V2版本
    that.loadJsonV2(live.commandsV3)
  },

  /**
   * 动态换标签 video <==> audio
   */
  changeMedia: function (tagName, isLock) {
    var that = this

    // 加锁切换
    that.changeMediaLock = isLock
    tools.debug('changeMedia ==> ' + tagName)

    // video || audio
    if (!tagName) {
      return false
    } else if (!tagName.match(/(video|audio)/gi)) {
      return false
    }

    // 相同情况禁止切换
    if (that.curMediaTag === tagName) {
      return false
    }

    // 暂停
    that.pause()

    // 先销毁
    // video.destroy()

    // 切换元素
    // video
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_TAG_NAME,
      payload: tagName
    })
    if (tagName === 'video') {
      // var videoTag = video.getCamera('video')
      // video.getVideojsPlayer(videoTag, function () {
      //   // that.seek(that.currentDuration);
      // })
      that.curMediaTag = tagName
    }
    // audio
    else if (tagName === 'audio') {
      // var audioTag = video.getCamera('audio')
      // video.getVideojsPlayer(audioTag, function () {
      //   // that.seek(that.currentDuration);
      // })
      that.curMediaTag = tagName
    } else {
      return false
    }
  },

  /*
   * 【切换线路】
   * 源数量vodplayer.videoSourceNum;
   * 调用vodplayer.changeSource(1)
   * 切换资源后, 后面播放资源跟随设置
   */
  nowSourceIndex: 0,
  changeSource: function (sourceIndex) {
    var that = this,
      curUrl = ''

    if (that.videoSourceNum <= 1) {
      return false
    }

    // 传入参数不存在，自动切换
    if (typeof sourceIndex === 'undefined' || sourceIndex == -1) {
      sourceIndex = that.nowSourceIndex + 1
    }
    that.nowSourceIndex = sourceIndex

    for (var i in that.videoSections) {
      if (typeof that.videoSections[i].allUrl[sourceIndex] != 'undefined') {
        that.videoSections[i].url = that.videoSections[i].allUrl[sourceIndex]
        curUrl = that.videoSections[i].allUrl[sourceIndex]
      } else {
        var _sourceIndex = that.videoSections[i].allUrl.length - 1
        that.videoSections[i].url = that.videoSections[i].allUrl[_sourceIndex]
        curUrl = that.videoSections[i].allUrl[_sourceIndex]
      }
    }

    tools.debug('正在切换媒体源 ===>' + (sourceIndex + 1) + ' =>(' + curUrl + ')')
  },
  //初始化根扰参数自动定位PPT页码开始播放
  initSeek: 0,
  getStartPage: function () {
    var _page = '-1.1',
      _kv = tools.urlHashMap()
    if (_kv.page) {
      _page = _kv.page
    }
    return _page.split('.')
  },
  // 加载JSON-V2版本
  pagesNum: 0,
  jsonUrlPath: '',
  // 加载 command.json
  loadJsonV2: function (url) {
    var that = this,
      thumbUrl,
      chapterList = [],
      snIndex = -1
    that.jsonUrlPath = url.substring(0, url.lastIndexOf('/') + 1)

    // 按Page开始时间点存储数据
    // 格式：{"100.2": {page: {object of page}, darw: {current page of draw}}}
    that.commandStore = []
    that.runningCmds = {}

    // load JSON-V2
    that.loadJson(url, function (commands) {
      // 原始分页数据
      var pages = commands.pages,
        pagesNum = 0,
        startPage = that.getStartPage(),
        _docIds = [],
        _docIndex = -1,
        _whiteboardPage = 0,
        _docMd5 = []

      // 页数
      map.get('live:pages:length')(pages.length)

      // 分页章节
      for (var i = 0, pagelength = pages.length; i < pagelength; i++) {
        // 有翻页执行下面逻辑
        if (pages[i].page) {
          var _st = pages[i].page.st
          //https兼容
          if (pages[i].page.p > 0 && pages[i].page.p < 10000) {
            pages[i].page.c = tools.detectProtocol(pages[i].page.c)
            //初始化根扰参数自动定位PPT页码开始播放
            if (!that.initSeek && startPage[0] > 0 && pages[i].page.c.indexOf('http') > -1) {
              _docMd5 = pages[i].page.c.split('/')
              if (_docMd5[7]) {
                _docIndex = _docIds.indexOf(_docMd5[7])
                if (_docIndex == -1) {
                  _docIds.push(_docMd5[7])
                  _docIndex = _docIds.indexOf(_docMd5[7])
                }
                if (_docIndex == startPage[0] - 1 && startPage[1] == pages[i].page.p) {
                  that.initSeek = pages[i].page.st
                }
              }
            }
          } else if (pages[i].page.p >= 10000) {
            if (!that.initSeek && startPage[0] == 0) {
              _whiteboardPage++
              if (startPage[1] == _whiteboardPage) {
                that.initSeek = pages[i].page.st
              }
            }
          }

          // 保持push一次
          if (_st !== snIndex) {
            if (pages[i].drawfile && pages[i].drawfile.indexOf('http') !== 0) {
              pages[i].drawfile = that.jsonUrlPath + 'draw/' + pages[i].drawfile
            }
            // 分页索引时间点
            that.cmdStartTime.push({
              st: _st,
              i: pagesNum
            })
            // 按索引时间点存储数据
            that.commandStore.push(pages[i])
            pagesNum++
          }

          //章节
          var _cmd = pages[i].page.c.split('|')
          if (pages[i].page.p > 10000) {
            thumbUrl = STATIC.URL.STATIC_HOST + '/open/cooperation/default/vod-pc/css/img/error.png'
          } else {
            thumbUrl = _cmd[0] + _cmd[1] + '_' + _cmd[5] + '_s.jpg'
          }
          chapterList.push({
            course: pages[i].page.name,
            page: pages[i].page.p,
            title: that.title,
            starttime: pages[i].page.st,
            thumb: thumbUrl
          })
        }
      }
      that.pagesNum = pagesNum
      that.runningCmds = that.commandStore

      // 广播信息
      if (typeof commands.broadcast === 'string' && commands.broadcast.length > 0) {
        that.broadcastList(commands.broadcast)
      }

      //章节切割
      that.chapters = chapterList
      if (tools.isInNative()) {
      } else {
        map.get('live:chapter:list')(chapterList)
      }

      // 2window
      window.commandStore = that.commandStore

      // save the commands
      that.commands = commands

      // 摄像头数据
      that.cameraSectionsV2 = commands.cameras

      // 重组聊天数据(load-json方式)
      if (commands.msg && commands.msg.length > 0) {
        that.chatSections = commands.msg
      }
      map.get('live:chat:slice')(that.chatSections)

      //问答
      if (typeof commands.qa != 'undefined') {
        that.qaSections = commands.qa
      }

      // 重组摄像头数据
      if (that.cameraSectionsV2) {
        var reBuildCamera = [],
          TempCamObj = {},
          camlist = that.cameraSectionsV2

        var lastCamType = null
        for (var i = 0; i < camlist.length; i++) {
          //补全
          if (lastCamType == STATIC.CMD.CAMERA_START && camlist[i].t != STATIC.CMD.CAMERA_STOP) {
            TempCamObj.type = 'camera'
            TempCamObj.et = parseFloat(camlist[i].st - 0.01)
            reBuildCamera.push(TempCamObj)
            TempCamObj = {}
            lastCamType = STATIC.CMD.CAMERA_STOP
          }

          if (camlist[i].t == STATIC.CMD.CAMERA_START) {
            TempCamObj.st = parseFloat(camlist[i].st)
            lastCamType = STATIC.CMD.CAMERA_START
          } else if (camlist[i].t == STATIC.CMD.CAMERA_STOP) {
            TempCamObj.type = 'camera'
            TempCamObj.et = parseFloat(camlist[i].st)
            reBuildCamera.push(TempCamObj)
            TempCamObj = {}
            lastCamType = STATIC.CMD.CAMERA_STOP
          }
        }
        //补全
        if (lastCamType != STATIC.CMD.CAMERA_STOP) {
          TempCamObj.type = 'camera'
          TempCamObj.et = parseFloat(999999)
          reBuildCamera.push(TempCamObj)
          TempCamObj = {}
          lastCamType = STATIC.CMD.CAMERA_STOP
        }

        that.cameraSectionsV2 = reBuildCamera
        window.cameraSection = reBuildCamera
      }

      //原生指令
      var nativeCameraSections = []
      for (var c = 0; c < that.cameraSectionsV2.length; c++) {
        var cameraObjs = {}
        cameraObjs['type'] = STATIC.CMD.CAMERA_START
        cameraObjs['time'] = that.cameraSectionsV2[c].st
        nativeCameraSections.push(cameraObjs)

        var cameraObjs = {}
        cameraObjs['type'] = STATIC.CMD.CAMERA_STOP
        cameraObjs['time'] = that.cameraSectionsV2[c].et
        nativeCameraSections.push(cameraObjs)
      }

      that.nativeCameraSections = nativeCameraSections
      tools.debug('native camera sections===>', nativeCameraSections)
      map.get('live:camera:sections')(that.cameraSectionsV2)

      // tick
      // that.tick();
      // 数据加载完毕, 开始播放
      that.startPlay()
    })
  },

  // 开始播放
  startPlay() {
    let time = this.getHistoryTime()
    tools.debug('history seek to ==>', time)
    if (time && time > 0) {
      this.seek(time)
    }
    this.play()
  },

  // 初始化
  init: function (live, callback) {
    var that = this
    // Load on init.
    if (!that.initLoad) {
      that.initLoad = true
    }

    tools.debug('vod on load init ...')

    // Clone Vars.
    that.vodLive = live
    this.duration = live.duration

    // 判断是否满足点播初始化条件
    var vodData = live
    // 未生成 medias.urls
    // if (vodData && vodData.medias && !vodData.medias[0].url) {
    //     tools.callback(callback, false)
    //     return false
    // }
    // // 成功
    // else {
    //     tools.callback(callback, vodData)
    // }

    // 按模式输出
    map.get('live:info')({
      liveid: live.id,
      title: live.title,
      duration: live.duration,
      views: live.views,
      album: live.album,
      user: live.user,
      authorAvatar: live.avatar,
      sourceData: live
    })

    // 更新总时间的sotre
    sdkStore.dispatch({
      type: actionTypes.UPDATE_TOTAL_TIME,
      payload: {
        totalTime: live.duration
      }
    })

    // 重新创建播放器
    this.swfUrl = live.swfUrl || ''

    tools.debug('vod init success ===> ', live)

    // Flash || HTML5 加载差异
    // Flash 播放器优先加载,再初始化数据
    // HTML5 直接开始初始化
    // if (tools.isMobile()) {
    that.vodStart(live)
    // 伪直播不发log统计
    if (live.vodLive && live.vodLive == 1) {
      // 当前伪直播
      that.vodLiveType = true
    } else {
      that.vodLiveType = false
      // 统计事件
      that.statsPlay()
    }

    // 初始化加载事件
    map.get('vod:load:init')()
  },
  // 点播统计
  statsPlay: function () {
    var that = this,
      live = that.vodLive,
      playState = that.action === 'start' ? 1 : 0,
      pf = ''

    var user = {}
    if (live && live.user) {
      user = live.user
    }

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
    // 统计参数(具体参考 => log.js)
    var logParams = {
      cid: live.id,
      xid: user.xid,
      rid: live.rid,
      uid: user.uid,
      pid: live.pid,
      pf: pf,
      type: core.playStatus,
      pl: playState,
      pt: 2,
      bn: cameraState.bn,
      ba: cameraState.ba,
      pn: that.playNumber,
      ctype: live.type,
      playRate: that.nowPlayRate,
      sdkVersion: process.env.SDK_VERSION,
      curTime: Math.floor(that.currentDuration * 100) / 100,
      host: that.currentVideoHost,
      srcUrl: window.encodeURIComponent(that.currentVideoUrl)
    }
    cameraState.bn = 0
    // 渠道统计
    if (that.vodLive.statsQuery) {
      that.vodLive.statsQuery.split('&').forEach(function (item, index) {
        logParams[item.split('=')[0]] = item.split('=')[1]
      })
    }
    // 发送统计
    log.play(logParams)

    // 每分钟统计一次
    if (!this.playCounter) {
      tools.debug('start stats counter...')
      this.playCounter = setInterval(() => {
        if (that.action === 'pause') {
          core.setPlayerStatus(that.action)
        }
        ++that.playNumber
        that.statsPlay()
      }, 60 * 1000)
    }
  },
  // 特殊命令过滤
  vodCommandFilter: function (command) {
    var flag = false
    // 清除PPT
    if (command && command.c) {
      var content = command.c.split('|'),
        t = command.t
      // 清除PPT涂鸦
      // 加载新的PPT,清理全部涂鸦,重新初始化
      if (t == STATIC.CMD.PAGE && content[2] == 3) {
        flag = true
      }
    } else {
      flag = false
    }
    return flag
  },
  // 点播事件分发
  dispatch: function (command) {
    if (typeof command === 'string') {
      command = JSON.parse(command)
    }
    // 批量命令
    if (command.t == STATIC.CMD.DRAW_LIST) {
      var jsonCommand
      // 移动端要进行数据迭代
      if (tools.isMobile()) {
        for (var i = 0, dlen = command.d.length; i < dlen; i++) {
          jsonCommand = command.d[i]
          player.execute(jsonCommand)
        }
      }
      //  PC端Flash直接批量处理
      else {
        jsonCommand = command
        player.execute(command)
      }
    } else {
      player.execute(command)
    }
  },
  // 指令执行
  execute: function (command) {
    if (typeof command === 'string') {
      try {
        command = JSON.parse(command)
      } catch (e) {
        return tools.debug('vod player execute command error:' + e)
      }
    }
    tools.debug('vod player execute:', command)
    // try {
    // 执行whiteboard指令集 => whiteboard.dispatch
    // if (tools.in_array(command.t, [STATIC.CMD.PAGE, STATIC.CMD.STOP, STATIC.CMD.START, STATIC.CMD.RUBBER])) {
    if (command.t == STATIC.CMD.PAGE) {
      // whiteboard.dispatch(command, true)
      // 翻页
      media.emit('live:set:page', command)
      // outter
      map.get('live:set:page')(command)
    }
    if (
      tools.in_array(command.t, [
        STATIC.CMD.ARROW,
        STATIC.CMD.DRAW,
        STATIC.CMD.GRAFFITI,
        STATIC.CMD.IMAGE,
        STATIC.CMD.CIRCLE,
        STATIC.CMD.RECTANGLE,
        STATIC.CMD.LINE,
        STATIC.CMD.DOTTED_LINE,
        STATIC.CMD.TEXT,
        STATIC.CMD.IMAGE_PRELOAD,
        STATIC.CMD.DRAW_LIST
      ])
    ) {
      if (whiteboardPlayer.whiteboardObject) {
        tools.debug('图形渲染 ==>', command)
        whiteboardPlayer.whiteboardObject.render({
          data: command
        })
      }
    }
    core.vodInitializeLoad = true
  },

  // pc指令暴露
  pcCommandExprose: function (command) {
    // 翻页
    if (command.t == STATIC.CMD.PAGE) {
      map.get('live:set:page')(command.p)
    }
  },
  // load command
  loadCommands: function (callback) {
    var that = this
    if (this.commands.length > 0) {
      callback(this.commands)
    } else {
      this.loadJson(this.live.commands, function (commands) {
        var i = 0,
          j = 0
        for (i = 0; i < commands.length; i++) {
          for (j = 0; j < commands[i].datas.length; j++) {
            if (commands[i].datas[j]) {
              if (commands[i].datas[j].t == STATIC.CMD.VIDEO_START) {
                commands[i].datas[j].c = that.live.videoUrl.shift()
              } else if (commands[i].datas[j].t == STATIC.CMD.DESKTOP_START) {
                commands[i].datas[j].c = that.live.desktopUrl.shift()
              }
            }
          }
        }
        that.commands = commands
        callback(commands)
      })
    }
  },
  parseMessage: function (message) {
    if (tools.isInNative()) {
      return message
    }
    if (this.emotions) {
      var re
      for (var e in this.emotions.maps) {
        re = new RegExp(e.replace('[', '\\[').replace(']', '\\]'), 'g')
        message = message.replace(re, '<img src="' + this.emotions.base + '/' + this.emotions.maps[e] + '" />')
      }
      for (var e in this.emotions.system) {
        re = new RegExp(e.replace('[', '\\[').replace(']', '\\]'), 'g')
        message = message.replace(re, '<img src="' + this.emotions.system[e] + '" />')
      }
    }
    return message
  },
  initPlayRate: 0,

  // 主播放方法
  play: function () {
    var that = this
    tools.debug('video loaded & ready play()', that.playMode)

    // 如果停止播放
    if (this.action === 'stop') {
      // this.seek(1);
    } else {
      // 当停止后播放
      if (core.currentMode == STATIC.MODE_EDUCATION) {
        // 更改状态为播放
        if (sdkStore.getState().camera.cameraPlayer) {
          sdkStore.dispatch({
            type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
            payload: 'playing'
          })
        } else {
          sdkStore.dispatch({
            type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
            payload: 'pause'
          })
        }

        // video.play()
      }

      // 桌面分享播放
      else if (core.currentMode == STATIC.MODE_DESKTOP) {
        // videoPlayer.play()
        // 更改状态为播放
        sdkStore.dispatch({
          type: actionTypes.UPDATE_VIDEO_PLAY_STATUS,
          payload: { playStatus: 'playing' }
        })
        // if (sdkStore.getState().video.videoPlayer) {
        //   sdkStore.dispatch({
        //     type: actionTypes.UPDATE_VIDEO_PLAY_STATUS,
        //     payload: 'playing'
        //   })
        // } else {
        //   sdkStore.dispatch({
        //     type: actionTypes.UPDATE_VIDEO_PLAY_STATUS,
        //     payload: 'pause'
        //   })
        // }
      }

      // 直播开始状态
      that.action = 'start'

      // 开始计时
      // that.tick()

      // exprose
      map.get('live:video:play')()
    }
    // 如果没有统计需要发起统计
    if (!this.playCounter) {
      this.statsPlay()
    }
    // 倍速播放
    // this.playRate(this.nowPlayRate)
    this.playRate(sdkStore.getState().vodControls.playRate.rateValue)
  },

  // 停止统计
  stopStatis() {
    tools.debug('vod on stopStatis.')
    if (this.playCounter) {
      // 发送最后一次统计
      this.statsPlay()
      clearInterval(this.playCounter)
      this.playCounter = null
    }
  },

  // 停止统计
  stopStatis() {
    tools.debug('vod on stopStatis.')
    if (this.playCounter) {
      // 发送最后一次统计
      this.statsPlay()
      clearInterval(this.playCounter)
      this.playCounter = null
    }
  },

  // 暂停
  pause: function (childOnly) {
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
      payload: 'pause'
    })
    if (this.action === 'pause') {
      return false
    }
    tools.debug('vod.player ===> pause')
    // 如果发生在自然播放不让暂停（如果暂停会导致多段错误，无法接着下一段）
    // 已暂停状态
    if (this.pauseLock) {
      return false
    }

    this.action = 'pause'
    core.playStatus = 'pause'
    // 停止计时
    this.pauseTick()
    // 停止统计
    this.stopStatis()

    // 由video播放器抛出事件 => 必须要截取(不截取死循环)
    // 循环体：video => pause => emit => this
    if (!childOnly) {
      // 课件模式暂停
      if (core.currentMode == STATIC.MODE_EDUCATION) {
        // video.pause()
      }

      // 桌面分享暂停
      else if (core.currentMode == STATIC.MODE_DESKTOP) {
        videoPlayer.pause()
      }
    }

    // exprose
    map.get('live:video:pause')()
  },
  // 停止
  stop: function () {
    tools.debug('vod call stop!')
    this.action = 'stop'
    // 停止统计
    this.stopStatis()
    this.stopTick()
    // video.stop()
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
      payload: 'pause'
    })
    videoPlayer.stop()
    this.currentDuration = 0
    this.setHistoryTime(0)
  },
  // 销毁
  destroy: function () {
    tools.debug('vod call destroy!')
    this.stopTick()
    // video.destroy()
    videoPlayer.destroy()
    whiteboardPlayer.destroy()
  },
  // 音量设置
  volume: function (volume) {
    // video.volume(volume)
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_VOLUME_VAL,
      payload: volume
    })
    videoPlayer.volume(volume)
  },
  // 按时间点查找命令
  getCommandsByDuration: function (_duration, callback) {
    var that = this,
      drawlistObjs = [], // 临时批量数据
      filterDarw = {}, // 过滤对象
      // 取最近时间(取左侧)
      closeSetPage = tools.closeSet(that.cmdStartTime, _duration)

    // 无翻页数据.
    if (!closeSetPage) {
      return false
    }

    /**
     * 查找最近分页播放
     */
    var targetPage = that.commandStore[closeSetPage.i]

    // 当前分页
    this.currentPageNumber = targetPage.page.p

    // log
    tools.debug('closeSetPage===> ' + targetPage.page.p + '#' + closeSetPage.st, targetPage)

    // 目标页
    if (targetPage) {
      that.runPageIndex = that.curPageIndex = closeSetPage.i
      // 翻页
      media.emit('live:set:page', targetPage.page)
      // outter
      map.get('live:set:page')(targetPage.page)
      targetPage.page.t = targetPage.page.t.toString()

      let fectchDraw = () => {
        // 加载draw文件
        that.loadDraw(closeSetPage.i, function (i) {
          //draw重新加载后，重新赋值
          var targetPage = that.commandStore[i]
          if (typeof targetPage.draw === 'undefined' || targetPage.draw.length == 0) {
            return false
          }

          that.curDrawIndex = 0

          // seek 到具体某个时间段数据
          var cmds = targetPage.draw
          tools.debug('过滤前指令数量===>' + cmds.length + '条')
          tools.debug('过滤前指令集===>', cmds)
          tools.debugTimeStart('drawlist')
          for (var k = 0, klen = cmds.length; k < klen; k++) {
            // 取seek最近的时间点数据播放
            if (parseInt(cmds[k].st) <= _duration) {
              that.curDrawIndex = k + 1
              // 纯桌面分享不用执行指令集
              if (that.playMode == STATIC.MODE_DESKTOP) {
                // 桌面分享不处理指令
              } else {
                that.isSkip = false
                that.isSkipTimer = null
                // 过滤
                if (cmds[k].c) {
                  var c = cmds[k].c.split('|'),
                    drawID = c[0]
                  filterDarw[drawID] = cmds[k]
                }

                // 筛选
                if (that.cmdFilter(c, cmds[k].t)) {
                  if (filterDarw[drawID]) {
                    delete filterDarw[drawID]
                  }
                }

                // 批量涂鸦 (播放器需要接收 t=31 指令 => 直接合并)
                // if (!tools.isMobile()) {
                if (cmds[k].t == STATIC.CMD.DRAW_LIST) {
                  drawlistObjs = drawlistObjs.concat(cmds[k].d)
                }
              }
            }
          }
          // 过滤后的指令
          for (var darwID in filterDarw) {
            drawlistObjs.push(JSON.stringify(filterDarw[darwID]))
          }

          tools.debug('过滤后指令数量===>' + drawlistObjs.length + '条')
          tools.debug('过滤后指令集===>', drawlistObjs)
          tools.debugTimeEnd('drawlist')

          tools.callback(callback, {
            st: _duration,
            t: STATIC.CMD.DRAW_LIST,
            c: '',
            p: targetPage.page.p,
            a: '0', //是否开启画线动画 0:关闭 / 1:开启
            d: drawlistObjs //批量画线数据
          })
        })
      }
      if (whiteboardPlayer.whiteboardObject) {
        whiteboardPlayer.whiteboardObject.setPage(targetPage.page).then(() => {
          // 翻页时清空当前页涂鸦数据
          whiteboardPlayer.whiteboardObject.clearDrawData(targetPage.page.p)
          fectchDraw()
        })
      } else {
        cmdSchedule.addSchedule({
          callback: function () {
            whiteboardPlayer.whiteboardObject.setPage(targetPage.page).then(() => {
              // 翻页时清空当前页涂鸦数据
              whiteboardPlayer.whiteboardObject.clearDrawData(targetPage.page.p)
              fectchDraw()
            })
          },
          type: 'wb'
        })
      }
    }
  },
  // 获取聊天数据
  chatLock: [],
  getMessages: function (duration) {
    var that = this

    // 提前 10s 加载后半段数据
    //duration += 10;

    //根据时间段查找分段区间
    var chatSection

    if (duration === 0) {
      //初始化的时候先加载一些数据
      if (this.chatSections.length > 0) {
        chatSection = this.chatSections[0]
      }
    } else {
      for (var i = 0; i < this.chatSections.length; i++) {
        if (this.chatSections[i].start <= duration && this.chatSections[i].end >= duration) {
          chatSection = this.chatSections[i]
          break
        }
      }
    }

    if (!chatSection) {
      return
    }

    var sectionToString = chatSection.start + '_' + chatSection.end

    // 加锁
    if (typeof that.chatLock[sectionToString] != 'undefined' && that.chatLock[sectionToString] == true) {
      return
    }

    // 非锁定
    if (!that.messages[sectionToString]) {
      that.chatLock[sectionToString] = true

      // 聊天分段回调
      var chatOnComplate = function (res) {
        tools.debug('get message:', sectionToString, res)

        // 聊天数据
        if (res.list) {
          var chatsDocs = []
          for (var m in res.list) {
            chatsDocs.push({
              xid: res.list[m].xid,
              nickname: res.list[m].nickname,
              role: res.list[m].role,
              avatar: that.getAvatar(res.list[m]),
              message: that.parseMessage(res.list[m].msg),
              starttime: res.list[m].time,
              cmd: res.list[m].cmd,
              uid: res.list[m].uid,
              timestamp: res.list[m].timestamp,
              source: res.list[m]
            })
          }
          // Load信息
          that.messages[sectionToString] = chatsDocs

          // 聊天信息
          map.get('live:message:append')(chatsDocs)
        } else {
          that.messages[sectionToString] = []
        }
      }

      // load-for-json
      if (chatSection.loc) {
        that.loadJson(chatSection.loc, function (res) {
          chatOnComplate(res)
        })
      }
    }
  },
  // 获取聊天数据
  qaLock: [],
  qa: {},
  qaSections: [],
  getQa: function (duration) {
    var that = this

    // 提前 10s 加载后半段数据
    //duration += 10;

    //根据时间段查找分段区间
    var qaSection

    if (duration === 0) {
      //初始化的时候先加载一些数据
      if (this.qaSections.length > 0) {
        qaSection = this.qaSections[0]
      }
    } else {
      for (var i = 0; i < this.qaSections.length; i++) {
        if (this.qaSections[i].start <= duration && this.qaSections[i].end >= duration) {
          qaSection = this.qaSections[i]
          break
        }
      }
    }

    if (!qaSection) {
      return
    }

    var sectionToString = qaSection.start + '_' + qaSection.end

    // 加锁
    if (typeof that.qaLock[sectionToString] != 'undefined' && that.qaLock[sectionToString] == true) {
      return
    }

    // 非锁定
    if (!that.qa[sectionToString]) {
      that.qaLock[sectionToString] = true

      // 问答分段回调
      var qaOnComplate = function (res) {
        tools.debug('get qa:', sectionToString, res)

        // 聊天数据
        if (res.list) {
          for (var m in res.list) {
            res.list[m].avatar = that.getAvatar(res.list[m])
          }
          // Load信息
          that.qa[sectionToString] = res.list

          // 聊天信息
          if (tools.isInNative()) {
          } else {
            map.get('live:questions:append')(res.list)
          }
        } else {
          that.qa[sectionToString] = []
        }
      }

      // load-for-json
      if (qaSection.loc) {
        that.loadJson(that.jsonUrlPath + 'qa/' + qaSection.loc, function (res) {
          qaOnComplate(res)
        })
      }
    }
  },
  getAvatar: function (data) {
    let that = this,
      avatar = null
    // has avatar
    if (data.a && data.xid && that.vodLive.avatarHost) {
      data.avatar = that.vodLive.avatarHost + '/avatar/' + (data.xid % 255) + '/' + (data.xid % 600) + '/' + (data.xid % 1024) + '/' + data.xid + '.jpg'
      if (typeof data.attr == 'object' && data.attr.v) {
        data.avatar += '?v=' + data.attr.v
      }
    }
    // inject to data
    if (data.avatar) {
      avatar = data.avatar
    }

    if (!avatar) {
      if (!data.role) {
        data.role = 'user'
      }
      switch (data.role) {
        case 'spadmin':
          var img = '/img/main/spadmin.png'
          break
        case 'admin':
          var img = '/img/main/admin.png'
          break
        case 'guest':
          var img = '/img/main/guest.png'
          break
        case 'user':
        default:
          var img = '/img/main/user.png'
          break
      }
      avatar = STATIC.URL.STATIC_HOST + '/open/cooperation/default/live-pc/css' + img
    }
    return avatar
  },
  // 获取问答数据
  qaLock: [],
  getQuestions: function (duration) {
    this.getQa(duration)
  },
  // 按时间点获取视频片段
  getVideoSection: function (duration) {
    var that = this,
      vsections = that.videoSections
    if (vsections) {
      for (var i = 0, vlen = vsections.length; i < vlen; i++) {
        if (vsections[i].et > duration) {
          return (that.sectionPath = {
            part: i,
            detail: vsections[i]
          })
        }
      }
    }
  },

  // 清空
  clear: function () {
    // 插入清空指令
    // var _c = '{"x":"0","t":51,"st":0,"p":0,"c":"||3|1,0,0,1,0,0|65536|1","n":0,"hd":"f"}'
    var _c = ''
    var page = this.currentPageNumber || 0
    if (page) {
      var _c = '{"st":0,"p":' + page + ',"c":"","n":0,"x":"0","t":1}'
    }
    this.execute(_c)
  },

  // 模式切换
  getModeType: function (currentMode) {
    var that = this,
      mode = {
        currentMode: '0',
        beforeMode: that.playMode
      }

    // 桌面分享
    if (currentMode === 'desktop') {
      mode.currentMode = STATIC.MODE_DESKTOP
      mode.beforeMode = STATIC.MODE_EDUCATION
    }

    // 视频
    else if (currentMode === 'video') {
      mode.currentMode = STATIC.MODE_EDUCATION
      mode.beforeMode = STATIC.MODE_DESKTOP
    }

    // 相同模式忽略
    if (that.currentModeName !== currentMode) {
      tools.debug('current mode change ===> ' + currentMode)
      // 执行切换
      core.modeChange({
        c: mode.beforeMode + '|' + mode.currentMode
      })
      // 倍速播放初始化
      if (that.nowPlayRate) {
        // that.playRate(that.nowPlayRate)
        that.playRate(sdkStore.getState().vodControls.playRate.rateValue)
      }
    }

    that.currentModeName = currentMode

    return mode
  },

  // 是否可seek
  isCanSeek: function () {
    var that = this,
      flag = true

    if (that.videoCurType === 'video') {
      if (cameraState.playStatus === 'seeking') {
        flag = false
      }
    } else if (that.videoCurType === 'desktop') {
      if (videoPlayer.playStatus === 'seeking') {
        flag = false
      }
    } else {
      flag = true
    }
    return flag
  },

  // seek
  seek: function (duration) {
    tools.debug('seeking to ==>', duration)
    tools.debugTimeStart('seek')

    // 是否可seeklive-duration
    if (!this.isCanSeek()) {
      return false
    }
    if (this.seekTimer) {
      clearTimeout(this.seekTimer)
    }
    this.seekTimer = setTimeout(() => {
      this.seekCore(duration)
    }, 30)
  },
  // 前进15秒
  forward: function () {
    let seekTime = Number(this.currentDuration) + 15
    this.seek(Math.min(seekTime, this.totalTime - 1))
  },
  // 后退15秒
  backward: function () {
    let seekTime = Number(this.currentDuration) - 15
    this.seek(Math.max(seekTime, 0))
  },
  Hls: null,
  // do seek action
  seekCore: async function (duration) {
    // duration
    duration = duration || 0
    // setting
    var that = this,
      _duration = parseInt(duration, 10),
      // //seek时间
      // currentDuration = 0,
      // //当前总时间
      // fillTime = 0,
      //时间差
      _videoDuration = parseFloat(that.duration, 10),
      //duration取整
      playMode = STATIC.MODE_EDUCATION,
      //当前模式
      beforeMode = STATIC.MODE_EDUCATION //旧模式

    // 大于总时间, 小于0
    if (_duration < 0 || _duration >= _videoDuration) {
      that.stop()
      return false
    }

    // 时间区间判断
    that.playerRange(duration)

    // 摄像头开关
    that.setCamera(_duration)

    // 置空缓存区seek
    videoPlayer.seekDuration = null
    // video.seekDuration = null
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
      payload: null
    })

    that.seekDuration = _duration
    that.isSeek = true

    // 获取当前时间范围
    var currentVideoSection = that.getVideoSection(_duration)

    // 获取当前模式
    if (!currentVideoSection) {
      return false
    }
    var modeType = that.getModeType(currentVideoSection.detail.name)

    playMode = modeType.currentMode
    beforeMode = modeType.beforeMode

    // seek视频执行: {video(), seek()};
    // var seekExecute = {
    //   video: null,
    //   seek: null
    // };

    // 教育模式处理
    if (playMode == STATIC.MODE_EDUCATION) {
      var v = currentVideoSection.detail
      // 假如传入m3u8并且媒体支持则播放m3u8
      var inspectUrl = null
      var isM3U8 = /\.m3u8/gi.test(v.allUrl[1])
      // if (config && config.techOrder == 'HLS' && !that.Hls) {
      if (isM3U8 && !that.Hls) {
        await import('hls.js').then((res) => {
          that.Hls = res.default
          // console.log('检查that.Hls', that.Hls)
        })
      }

      if (that.Hls && that.Hls.isSupported()) {
        inspectUrl = v.allUrl[1]
      } else {
        inspectUrl = v.url
      }
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_VIDEO_URL,
        payload: getVideoUrl(inspectUrl)
      })
      if (cameraState.seekDuration < 0) {
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
          payload: 0
        })
      } else {
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
          payload: _duration - v.st
        })
      }

      // video.videoDo(
      //   {
      //     t: STATIC.CMD.VIDEO_START,
      //     // c: v.url
      //     c: inspectUrl
      //   },
      //   function () {
      //     video.seek(_duration - v.st)
      //   }
      // )
    }

    // 桌面分享处理
    else if (playMode == STATIC.MODE_DESKTOP) {
      var ds = currentVideoSection.detail
      var inspectUrl = null
      var isM3U8 = /\.m3u8/gi.test(ds.allUrl[1])
      // if (config && config.techOrder == 'HLS' && !that.Hls) {
      if (isM3U8 && !that.Hls) {
        // await import ('hls.js').then(Hls => {})
        await import('hls.js').then((res) => {
          that.Hls = res.default
          // console.log('检查that.Hls', that.Hls)
        })
      }

      if (that.Hls && that.Hls.isSupported()) {
        inspectUrl = ds.allUrl[1]
      } else {
        inspectUrl = ds.url
      }
      videoPlayer.applySeek = function (params) {
        videoPlayer.seek(_duration - ds.st)
      }
      videoPlayer.start({
        t: STATIC.CMD.DESKTOP_START,
        // c: ds.url
        c: inspectUrl
      })
    }

    map.get('live:seek:begin')(_duration)
    tools.debug('live seek begin:' + _duration)

    //查找时间点
    var i = 0,
      j = 0,
      commands = that.commands.pages

    // tools.debug("seek commands ===>", commands);
    that.action = 'start'
    that.stopTick()

    // 上一个模式：教育模式
    // 当前模式：桌面分享
    if (beforeMode == STATIC.MODE_EDUCATION) {
      if (cameraState.cameraPlayer) {
        tools.debug('摄像头暂停中...')
        // video.cameraPlayer.dispose();
        // video.cameraPlayer = null;
        // video.stop()
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
          payload: 'pause'
        })
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_VIDEO_URL,
          payload: null
        })
        // video.videoUrl = null
        // video.seekDuration = 0
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
          payload: 0
        })
      }
    }
    // 上一个模式：桌面分享模式
    // 当前模式：教育直播
    else if (beforeMode == STATIC.MODE_DESKTOP) {
      if (videoPlayer.player) {
        tools.debug('桌面分享销毁')
        videoPlayer.stop()
        videoPlayer.player.dispose()
        videoPlayer.player = null
        videoPlayer.videoUrl = null
        videoPlayer.seekDuration = 0
      }
    }

    // 当前模式
    that.playMode = playMode

    // 设置当前视频对象
    that.setCurVideo(_duration, true)

    // 当前视频资源
    that.currentVideoUrl = currentVideoSection.detail.url
    that.currentVideoHost = that.currentVideoUrl.split('/')[2]

    // 当前时间计数
    // 分段video-demo:
    // 0....5....10.....15....20
    // st=5 ==> seek=15 ==> seek - st = 15-5=10
    // et-duration+current
    that.currentDuration = _duration

    //清空画板
    // whiteboard.clear(); // echo

    // 查找 & 添加任务队列 echo
    that.getCommandsByDuration(_duration, function (cmd) {
      // 执行指令分发
      that.dispatch(cmd)
    })

    // tick自动计时操作
    that.tick()
    that.isSeek = false
    // that.playRate(that.nowPlayRate)
    that.playRate(sdkStore.getState().vodControls.playRate.rateValue)

    // 暴露 live:seek:finish
    tools.debug('live seek finish:' + _duration)
    map.get('live:seek:finish')(_duration)
    tools.debugTimeEnd('seek')
  },

  // time
  getTimeDuration(time) {
    return Math.floor(time * 100) / 100
  },

  // 获取当前视频时间点
  getDuration: function (callback, timerInterval) {
    // tools.debug('time auto counter ==>', timerInterval)

    var that = this

    // 自动切换模式
    that.getModeType(that.videoCurType)

    // 验证当前媒体状态是否暂停
    // @H5统一执行 => pause 原因: 因为部分浏览器切换媒体资源的时候，会把媒体的状态设置为ended 或 playing状态, 这时时间轴会自动递增
    // 暂停逻辑?
    var isPaused = false
    // 当前点播是否暂停?
    var curPlayer = null
    if (that.videoCurType === 'video') {
      curPlayer = cameraState.cameraPlayer
    } else {
      curPlayer = videoPlayer.player
    }
    if (curPlayer && curPlayer.paused()) {
      isPaused = true
      // this.pause()
    } else {
      isPaused = false
    }
    tools.debug('current meida is paused? ===> ' + isPaused)
    tools.debug('current meida type ===> ' + that.videoCurType)
    // 安卓微信下首次播放会返回 ended 状态, 且 autoplay 属性无效
    // 第一段 => 0 / 进度时间为 => 0 / 状态为 => ended
    if (!that.isFirstPlay) {
      if ((tools.isWechat() && that.currentMediaPath === 0 && cameraState.playStatus === 'ended') || videoPlayer.playStatus === 'ended') {
        that.isFirstPlay = true
        // that.pause();
        return false
      }
    }

    // 当前视频类型
    // 单视频
    if (that.videoCurType === 'video') {
      if (cameraState.playStatus === 'playing') {
        that.currentDuration = that.partStartTime + cameraState.currentDuration
      } else if (cameraState.playStatus === 'ended' || cameraState.playStatus === 'changing') {
        that.currentDuration += timerInterval

        // that.currentDuration += that.partStartTime;
      } else if (cameraState.playStatus === 'seeking' || cameraState.playStatus === 'waiting') {
        // that.currentDuration = that.currentDuration;
      }

      // 回调函数
      tools.callback(callback, that.getTimeDuration(that.currentDuration))
    }

    // 桌面分享 & 视频插播
    else if (that.videoCurType === 'desktop') {
      // videoPlayer
      if (videoPlayer.playStatus === 'playing') {
        that.currentDuration = that.partStartTime + videoPlayer.currentDuration
      } else if (videoPlayer.playStatus === 'ended') {
        // 视频播放结束时重置videoPlayer()的时间，否则下一part还是视频时累加的videoPlayer.currentDuration是不正确的导致超过回放总时长
        videoPlayer.currentDuration = 0
        that.currentDuration += timerInterval
      } else if (videoPlayer.playStatus === 'changing') {
        // that.currentDuration = that.partStartTime;
        that.currentDuration += timerInterval
      } else if (videoPlayer.playStatus === 'seeking') {
      } else if (videoPlayer.playStatus === 'waiting') {
        // that.currentDuration = that.currentDuration;
      }

      // 回调函数
      tools.callback(callback, that.getTimeDuration(that.currentDuration))
    }

    // 其它情况
    else {
      that.currentDuration += timerInterval
      // 回调函数
      tools.callback(callback, that.getTimeDuration(that.currentDuration))
    }

    return that.currentDuration
  },

  //倍速播放
  nowPlayRate: 1.0,
  playRate: function (rate) {
    tools.debug('set playerRate ==>', rate)
    var that = this,
      _nowPlayRate = null

    // 控制rate
    if (that.videoCurType === 'video') {
      // video.playRate(rate)
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_BACK_RATE,
        payload: rate
      })
    } else if (that.videoCurType === 'desktop') {
      videoPlayer.playRate(rate)
    }

    if (rate > -1) {
      that.nowPlayRate = rate
    }

    return that.nowPlayRate
  },

  // 过滤指令
  cmdFilter: function (cmdSlice, type) {
    var _CMD = STATIC.CMD,
      isMatch = false
    /**
     * 删除以下指令
     * t = 25/15 => cmd[3] === 0
     * t ＝ 16/17/18 => cmd[1] === 0
     * t = 11 => cmd[2] === 0
     */
    var c = cmdSlice,
      t = type

    tools.debug('cmdFilter ===> ', c, t)

    // 25 || 15
    if (t == _CMD.DRAW || t == _CMD.TEXT) {
      if (c[3] == 0) {
        isMatch = true
      }
    }
    // 16 || 17 || 18
    else if (t == _CMD.CIRCLE || t == _CMD.RECTANGLE || t == _CMD.LINE) {
      if (c[1] == 0) {
        isMatch = true
      }
    }
    // 11
    else if (t == _CMD.IMAGE) {
      if (c[2] == 0) {
        isMatch = true
      }
    }
    return isMatch
  },

  // 设置视频当前段落
  setCurVideo: async function (duration, isSeek) {
    duration = duration || 0
    var that = this,
      vData = that.getVideoSection(duration)
    if (!vData) {
      return false
    }

    // 初始化设置当前播放模式
    if (vData.detail.name === 'video') {
      core.currentMode = STATIC.MODE_EDUCATION
    } else if (vData.detail.name === 'desktop') {
      core.currentMode = STATIC.MODE_DESKTOP
    }

    // 设置类型
    that.videoCurType = vData.detail.name

    // 取开始时间点
    that.partStartTime = vData.detail.st

    // 设置当前片段(0,1,2....)
    if (vData.part !== that.currentMediaPath) {
      that.currentMediaPath = vData.part //当前资源分段
      that.currentMediaSourceIndex = 0 //源选择默认选中第一个
      core.curMeidaData = vData //资源复制
      tools.debug('当前播放段落 ===> ' + vData.part)
      tools.debug('加载媒体资源 ===>' + vData.detail.duration + "'s", vData)
    }

    // 视频
    if (vData.detail.name === 'video') {
      if (that.pauseLock) {
        that.pauseLock = false
      }
      // 处理无缝视频连接, 提前 1秒 收起视频
      if (cameraState.cameraPlayer) {
        let videoTimeLeft = cameraState.cameraPlayer.duration() - cameraState.cameraPlayer.currentTime()
        // if (that.videoSections.length === (vData.part + 1)) {
        //   // return;
        // } else if (videoTimeLeft < 1) {
        //   // 不让暂停
        //   that.pauseLock = true
        //   map.get("live:source:change")(vData.part);
        // }
        if (videoTimeLeft < 1) {
          that.pauseLock = true
          map.get('live:source:change')(vData.part)
        }
      }
      // var inspectUrl = null
      var inspectUrl = vData.detail.url
      var isM3U8 = /\.m3u8/gi.test(inspectUrl)
      // if (config && config.techOrder == 'HLS' && !that.Hls) {
      if (isM3U8 && !that.Hls) {
        // await import ('hls.js').then(Hls => {})
        await import('hls.js').then((res) => {
          that.Hls = res.default
          // console.log('检查that.Hls', that.Hls)
        })
      }

      // if (that.Hls && that.Hls.isSupported()) {
      //   inspectUrl = vData.detail.url
      // } else {
      //   inspectUrl = vData.detail.url
      // }
      if (sdkStore.getState().camera.videoUrl === inspectUrl) {
        if (typeof seek !== 'undefined') {
          sdkStore.dispatch({
            type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
            payload: duration - vData.detail.st
          })
          // video.seek(duration - vData.detail.st)
        }
        return false
      }
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_VIDEO_URL,
        payload: getVideoUrl(inspectUrl)
      })
      if (cameraState.seekDuration < 0) {
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
          payload: 0
        })
      } else {
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
          payload: duration - vData.detail.st
        })
      }

      // video.videoDo(
      //   {
      //     t: STATIC.CMD.VIDEO_START,
      //     c: inspectUrl
      //   },
      //   function () {
      //     video.seek(duration - vData.detail.st)
      //   }
      // )
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_BX,
        payload: 0
      })
      // video.bx = 0
    }
    // 桌面分享
    else if (vData.detail.name === 'desktop') {
      if (that.pauseLock) {
        that.pauseLock = false
      }
      if (videoPlayer.player) {
        let desktopTimeLeft = videoPlayer.player.duration() - videoPlayer.player.currentTime()
        if (desktopTimeLeft < 1) {
          that.pauseLock = true
          map.get('live:source:change')(vData.part)
        }
      }
      // var inspectUrl = null
      var inspectUrl = vData.detail.url
      var isM3U8 = /\.m3u8/gi.test(inspectUrl)
      // if (config && config.techOrder == 'HLS' && !that.Hls) {
      if (isM3U8 && !that.Hls) {
        // await import ('hls.js').then(Hls => {})
        await import('hls.js').then((res) => {
          that.Hls = res.default
          // console.log('检查that.Hls', that.Hls)
        })
      }

      // if (that.Hls && that.Hls.isSupported()) {
      //   inspectUrl = vData.detail.allUrl[1]
      // } else {
      //   inspectUrl = vData.detail.url
      // }
      if (videoPlayer.videoUrl === inspectUrl) {
        if (typeof seek !== 'undefined') {
          videoPlayer.seek(duration - vData.detail.st)
        }
        return false
      }
      videoPlayer.applySeek = function () {
        videoPlayer.seek(duration - vData.detail.st)
      }
      videoPlayer.start({
        t: STATIC.CMD.DESKTOP_START,
        c: inspectUrl
      })
      videoPlayer.bx = 0
    }
    // }

    // 当前媒体信息
    that.vData = vData

    // 重置当前视频资源 index.
    core.currentMediaSourceIndex = 0

    // 当前视频资源
    that.currentVideoUrl = vData.detail.url
    that.currentVideoHost = that.currentVideoUrl.split('/')[2]
  },

  // 摄像头初始化状态
  cameraState: 'wait',

  // 摄像头开关判断
  setCamera: function (duration) {
    var that = this,
      cam = this.cameraSectionsV2,
      cameraState = (function () {
        var flag = 'stop'
        if (cam) {
          for (var i = 0; i < cam.length; i++) {
            var c = cam[i]
            if (duration > c.st && duration < c.et) {
              flag = 'start'
              break
            } else {
              flag = 'stop'
            }
          }
        }
        return flag
      })()
    // 开关控制
    if (cameraState === that.cameraState) {
      return false
    } else if (cameraState === 'start') {
      map.get('camera:start')()
      that.cameraState = 'start'
      // 切换 => video.
      // that.changeMedia("video");
    } else if (cameraState === 'stop') {
      map.get('camera:stop')()
      that.cameraState = 'stop'
    }
  },

  //指令执行
  //保存当前状态，因为页面里的draw还要循环重入执行，所以page可以重复进入，但不可得复执行
  runPageIndex: 0,
  //保存刚执行过的，以免重复执行
  curPageIndex: -1,
  curDrawIndex: 0,
  cmdsRun: function (duration) {
    var that = this
    console.debug('cmdruns ==> ', parseInt(duration, 10), that.runPageIndex, that.pagesNum, that.curPageIndex)
    for (var i = that.runPageIndex; i < that.pagesNum; i++) {
      if (typeof that.commandStore[i] === 'undefined') {
        break
      }
      //drawfile预加载,1分钟
      if (that.commandStore[i].page.st > duration) {
        if (that.commandStore[i].page.st - duration > 60) {
          break
        } else {
          that.loadDraw(i, function () {})
          continue
        }
      }
      // 取当前draw文件
      else if (that.commandStore[i].drawfile) {
        that.loadDraw(i, function () {})
      }

      //下次从这一页开始
      that.runPageIndex = i
      var paging = false
      if (that.curPageIndex != i) {
        that.dispatch(that.commandStore[i].page)
        that.curDrawIndex = 0
        that.curPageIndex = i
        paging = true
      }

      if (!that.commandStore[i].draw) {
        continue
      }

      var drawNum = that.commandStore[i].draw.length,
        drawBat = []

      console.debug('cmdruns page data ==> ', that.commandStore[that.curPageIndex])

      for (var j = that.curDrawIndex; j < drawNum; j++) {
        if (that.commandStore[i].draw[j].st <= duration) {
          drawBat.push(that.commandStore[i].draw[j])
          that.curDrawIndex = j + 1
        }
      }

      // 多条画
      if (drawBat.length > 1) {
        // 一次性发送批量指令(Flash内部处理, h5循环取出每条进行播放)
        //翻页的时候，批量处理
        var filterDarw = {},
          drawlistObjs = []
        for (var x in drawBat) {
          // t=31 ==> 直接渲染
          if (drawBat[x].t == 31 && drawBat[x].d) {
            this.dispatch(drawBat[x])
          } else {
            drawlistObjs.push(JSON.stringify(drawBat[x]))
          }
        }
        // var drawBatData =
        var exeData = {
          st: duration,
          t: STATIC.CMD.DRAW_LIST,
          c: '',
          p: that.commandStore[i].page.p,
          a: '0', //是否开启画线动画 0:关闭 / 1:开启
          d: drawlistObjs //批量画线数据
        }
        that.dispatch(exeData)
      }
      // 单条
      else if (drawBat.length == 1) {
        tools.debug('drawBat ==> ', drawBat[0])
        that.dispatch(drawBat[0])
      }
    }
  },

  // 时间区间播放
  // 初始化指定时间区间内播放
  // url#start=1000#end=2000
  playerRange: function (duration) {
    var that = this
    if (that.timeRangeLock) {
      return false
    }
    var hashRange = tools.urlHashMap()
    // setter
    that.timeRange = hashRange

    if (!that.timeRange) {
      tools.debug('未设置时间区间.')
      return false
    }

    // tools.debug('时间区间 ==> ', that.timeRange)

    // 小于时间点, seek到对应时间点
    if (that.timeRange.start) {
      if (duration < that.timeRange.start) {
        that.seek(that.timeRange.start)
      }
    }

    // 大于结束时间点, 暂停
    if (that.timeRange.end) {
      if (duration > that.timeRange.end) {
        that.pause()
      }
    }
    // 重置
    that.timeRangeLock = true
  },
  // 加载draw.json
  loadDraw: function (i, callback) {
    var that = this
    if (that.commandStore[i].drawfile) {
      var _drawfile = that.commandStore[i].drawfile
      delete that.commandStore[i].drawfile
      tools.debug('load draw file: ==>', _drawfile)
      that.loadJson(_drawfile, function (commands) {
        that.commandStore[i].draw = commands
        callback(i)
      })
    } else {
      callback(i)
    }
  },

  // 历史时间点
  setHistoryTime(time) {
    if (window.localStorage) {
      let data = sdkStore.getState().global.data
      let timeId = `_TF_VOD_TIME_${data.id}`
      window.localStorage.setItem(timeId, time)
    }
  },

  // 获取历史时间
  getHistoryTime() {
    var opts = sdkStore.getState().room.extConfig
    // 无配置历史播放功能
    if (!opts.config.history) {
      return 0
    }
    if (window.localStorage) {
      let data = sdkStore.getState().global.data
      let timeId = `_TF_VOD_TIME_${data.id}`
      let time = Number(window.localStorage.getItem(timeId))
      return time > 0 ? time : null
    }
    return null
  },

  // timerInterval: 0.5,
  // 主时间轴
  tick: function () {
    if (!this.videoloaded) {
      map.get('live:video:loaded')('inited')
      this.videoloaded = true
    }
    this.action = 'start'
    var that = this
    var timerInterval = 0.5
    var startPlayTime = tools.now()
    var startPlayDuration = 0
    var startPlayCheck = 1
    that.timerInterval = timerInterval
    tools.debug('js tick start ...', that.tickTimmer ? true : false)

    // 网页版本
    if (!that.tickTimmer) {
      // 开始统计
      this.statsPlay()

      // start to Tick.
      tools.debug('js on Tick ...', that.tickTimmer)
      var _isMobile = tools.isMobile()

      that.tickTimmer = setInterval(function () {
        // tools.debug('=========tick start============');
        // TODO:调整为检查是否为播放中，播放中及没有播放视频，时间自增；loading 状态，时间等待
        // video.getPlayer().paused() , videoPlayer.getPlayer().paused
        if (that.currentDuration >= that.totalTime) {
          that.stop()
          return
        }

        // logs
        console.debug(
          'currentDuration:==>' +
            that.currentDuration +
            '\n initDuration:==>' +
            schedule.initDuration +
            '\n video.playStatus:==>' +
            cameraState.playStatus +
            '\n desktop.playStatus:==>' +
            videoPlayer.playStatus +
            '\n action:==>' +
            that.action
        )

        if (that.initSeek) {
          that.currentDuration = that.initSeek
          that.initSeek = 0
          if (sdkStore.getState().vodStatus.seekStatus == 'done') {
            // 更新当前播放时间的sotre
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CURRENT_TIME,
              payload: {
                currentTime: that.currentDuration
              }
            })
          }
          map.get('live:duration')(that.currentDuration, that.duration, that.currentDuration / that.duration)
          tools.debug('initSeek =====>', that.currentDuration)
          return
        }

        // 设置历史
        that.setHistoryTime(that.currentDuration)

        // 时间轴计算
        that.getDuration(function (duration) {
          tools.debug('vod currentDuration is ==>', duration)

          // 时间区间判断
          that.playerRange(duration)

          // 计时
          if (startPlayDuration == 0) {
            startPlayDuration = duration
          }

          // 设置curduration
          core.currentDuration = duration
          schedule.initDuration = duration

          // seek防止回弹
          if (that.seekDuration > 0) {
            if (duration < that.seekDuration) {
              // 修正seek不准问题
              tools.debug('修正 ==> seekDuration 偏差值 currentDuration ==>', that.seekDuration - duration)
              if (!that.initFixSeek) {
                that.initFixSeek = true
                that.pause()
                that.seek(that.seekDuration)
                that.play()
              }
              return false
            }
          }

          // 摄像头开关
          that.setCamera(duration)

          //指令执行
          that.cmdsRun(duration)

          // 状态(非playing不允许暴露事件)
          tools.debug('tick of core.playStatus ==>', core.playStatus)
          // if (core.playStatus !== 'playing') {
          //   return false
          // }

          // 暴露
          if (core.playStatus == 'playing' || core.playStatus == 'ended') {
            if (sdkStore.getState().vodStatus.seekStatus == 'done') {
              // 更新当前播放时间的sotre
              sdkStore.dispatch({
                type: actionTypes.UPDATE_CURRENT_TIME,
                payload: {
                  currentTime: that.currentDuration
                }
              })
            }
            map.get('live:duration')(that.currentDuration, that.duration, that.currentDuration / that.duration)
          }
        }, timerInterval)

        // 设置当前视频段落
        that.setCurVideo(that.currentDuration)

        // 定时拉取聊天消息
        that.getMessages(that.currentDuration)

        // 定时拉取问题列表
        that.getQuestions(that.currentDuration)

        // 处理视频桌面分享处理
      }, timerInterval * 1000)
    }

    // 视频 desktop自动
    if (!that.isSkipTimer) {
      // that.isSkipTimer = setTimeout(function(){
      that.isSkip = true
      // }, 300);
    }
  },
  // 暂停Tick
  pauseTick: function () {
    tools.debug('vod on pauseTick.')
    clearInterval(this.tickTimmer)
    this.tickTimmer = null
  },
  // 停止Tick
  stopTick: function () {
    // 结束
    if (this.action === 'stop') {
      tools.debug('[TF-INFO] => 点播已结束 ==> ' + this.currentDuration)
      map.get('vod:stop')()
    }
    // reset-vars
    clearInterval(this.tickTimmer)
    this.tickTimmer = null
    this.currentDuration = 0
    core.currentDuration = 0
  }
}

window.__vodPlayer = player
// return player;
export default player
// });
