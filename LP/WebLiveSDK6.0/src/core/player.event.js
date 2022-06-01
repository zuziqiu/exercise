/**
 * ## 媒体事件操作 & 更新 ##
 * ==> 媒体质量统计数据统计 <==
 */

/**
 * 卡顿切换逻辑:
 * 1 发生过 timeout 2次+, 每次持续1秒
 * 2 再次 timeout 切换线路
 * 
 * 常规切换线路逻辑:
 * 1 播放中产生错误
 * 2 收到播放事件 => 到timeupdate周期 > 5秒
 * 3 播放中卡住 5 秒
 */
import core from './player.core'
import tools from '../utils/tools'
import map from '../utils/map'
import STATIC from './mt.static'
import sdkRoom from './room.init'
import schedule from '../utils/schedule'
import media from './mediaCore'
import store from './store'
import * as TYPES from './store/types'
export default {
  // ba => 是产生stalled 、error 都 +1 ， 
  // bn 一样，但是 bn 在单个统计周期完毕需要清 => 0
  // 质量统计
  st: 0,
  ba: 0, // 直播期间卡顿汇总
  bn: 0, // 周期卡顿次数
  bx: 0, // 错误次数
  pn: 0, // 总播放次数
  MAX_RELOAD_TIME: 20,
  PLAY_TIMEOUT_LIMIT: 5, // 5秒超时
  timeoutLock: false,
  playTimes: 0, // 播放次数
  timeoutTimes: 0, // 超时次数
  waitLastTime: 0, // 等待时间
  roomIncreaseTimer: null, //房间增量
  _roomCurrentTime: 0, // 当前房间计时(自增)
  curPlayerType: null, //当前播放类型
  startPlaying: false, // 是否开始播放

  // logger
  showLog(type, eType) {
    tools.debug(`${type} event do ==> ${eType}`)
    tools.debug(`stream-QA ==> ba-${this.ba}, bn-${this.bn}`)
  },
  // 卡顿统计增量
  logUp () {
    this.ba += 1
    this.bn += 1
  },
  // log统计逻辑 
  loggerCore (vType, payload) {
    tools.debug(`video logger type ==>`, vType, payload)
    // 本地超时卡顿
    // 视频不动 => 本地时间(竞赛)差超时
    switch (vType) {
      case 'timeout':
        // 卡顿统计一次,再次播放解锁
        if (payload > this.PLAY_TIMEOUT_LIMIT && !this.timeoutLock) {
          tools.debug('video on timeout counter...')
          this.logUp()
          core.setPlayerStatus('timeout')
          this.timeoutLock = true
        }
        break
      // 错误
      case 'error':
        this.logUp()
      case 'default':
        break
    }
  },

  // 刷新流
  reload () {
    tools.debug('playerEvent on reload...')
    if (this.curVideoDom) {
      this.curVideoDom.pause()
      this._roomCurrentTime = 0
    }
  },

  // 绑定
  bindEvent(vdom, playType) {

    tools.debug('Bind Event on v2 ==>', playType)
    this.curPlayerType = playType

    // vdom
    if (vdom) {
      this.curVideoDom = vdom
    }

    // 媒体事件绑定
    var that = this
    var el = this
    var loaderTimer = null

    // 公共事件
    core.commonEventListener(vdom)

    // loaded
    el.on("loadeddata", function () {
      // tools.debug(playType + " event do ==> loaded");
      core.setPlayerStatus('loaded')
      that.showLog(playType, 'loaded')
      map.get("live:camera:loadeddata")();
      map.get("live:video:loadeddata")();
    }, false);

    // playing
    el.on('playing', function () {
      that.showLog(playType, 'playing')
      // 统计
      that.loggerCore('playing', true)
    });

    // play
    var shakeLock = null
    el.on("play", function () {

      // 播放次数
      that.playTimes += 1;
      that.showLog(playType, 'play')
      map.get("live:camera:play")();
      map.get("live:video:play")();

      // 播放>2's获取时间修正
      if (shakeLock) {
        clearTimeout(shakeLock)
        shakeLock = null
      }
      // 是否在线
      if (window.navigator.onLine) {
        shakeLock = setTimeout(() => {
          that.getServerCurTime();
        }, 2000)
      }

      // 开始播放后, 2秒后还没产生倒计时
      if (loaderTimer) {
        clearTimeout(loaderTimer)
      }
      // 检查是否timeout
      that.timeoutChecker('play')
      that.loggerCore('play', true)
    }, false);

    // pause
    el.on("pause", function () {
      that.playTimes = 0;
      that.showLog(playType, 'pause')
      map.get("live:camera:pause")();
      map.get("live:video:pause")();
      core.setPlayerStatus('pause')
      // 暂停卡顿计算
      that.pause()
    }, false);

    // abort
    el.on("abort", function () {
      // tools.debug("camera event do ==> abort");
      that.showLog(playType, 'abort')
      map.get("live:camera:abort")();
      map.get("live:video:abort")();
      core.setPlayerStatus('abort')
      that.loggerCore('abort', true)
    }, false);

    // error
    el.on("error", function (err) {
      var code = this.error.code;
      // tools.debug("camera event do ==> error" + code);
      that.showLog(playType, `error [${code}]`)
      // that.bn += 1;
      // that.ba += 1;
      that.bx += 1;
      core.setPlayerStatus('error')
      map.get("live:camera:error")(code);
      map.get("live:video:error")(code);
      that.loggerCore('error', true)
      // 重新加载 20 次后放弃
      if (that.bn > 20) {
        return false;
      }
      // HLS-直接更换CDN(在线)
      setTimeout(() => {
          media.emit('video:on:error', this)
      }, 1500)
      // map.get('live:network:error')()
    }, false);

    // ended
    el.on("ended", function () {
      // tools.debug("camera event do ==> ended");
      that.showLog(playType, `ended`)
      map.get("live:camera:ended")();
      map.get("live:video:ended")();
      that.loggerCore('ended', true)
      media.emit('video:on:ended', this)
    }, false);

    // suspend
    el.on("suspend", function () {
      // tools.debug("camera event do ==> suspend");
      that.showLog(playType, `suspend`)
      map.get("live:camera:suspend")();
      map.get("live:video:suspend")();
      that.loggerCore('suspend', true)
    }, false);

    // stalled
    el.on("stalled", function () {
      // tools.debug("camera event do ==> stalled");
      that.showLog(playType, `stalled`)
      // that.bn += 1;
      // that.ba += 1;
      map.get("live:video:stalled")();
      core.setPlayerStatus('stalled')
      that.loggerCore('stalled', true)
    }, false);

    //waiting
    el.on("waiting", function () {
      // tools.debug("camera event do ==> waiting");
      that.showLog(playType, `waiting`)
      // that.bn += 1;
      // that.ba += 1;
      map.get("live:camera:waiting")();
      map.get("live:video:waiting")();
      core.setPlayerStatus('waiting')
      that.loggerCore('waiting', true)
    }, false);

    // timeupdate
    el.on("timeupdate", function () {
      // that.showLog(playType, `timeupdate`)
      var curTime = this.currentTime;
      tools.long('event on timeupdate', curTime)
      that.liveCurrentDuration = curTime;
      core.setPlayerStatus('playing')
      if (loaderTimer && curTime > 0) {
        clearTimeout(loaderTimer)
      }
      // 断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
      if (curTime <= that.curLastTime) {
        that.curLastTime = curTime;
      }
      // 大于0开始计时
      if (curTime > 0) {
        map.get("live:camera:timeupdate")(curTime)
        map.get("live:video:timeupdate")(curTime)
        // 计算是否timeout
        that.timeoutChecker('timeupdate')
        // 正常播放解锁
        that.timeoutLock = false
      }
      schedule.setPlayDuration(curTime)
    }, false);
  },

  // 视频事件
  cacheVideoEvents: {},
  
  // 内部事件
  cacheListenEvents: {},

  // 监听
  listen: function (event, callback) {
    if (!this.cacheListenEvents[event]) {
      this.cacheListenEvents[event] = callback
    }
  },

  // 绑定video事件
  on: function (event, handler, useCapture) {
    var _video = this.curVideoDom
    if (_video) {
      _video.addEventListener(event, handler, useCapture)
    }
    this.cacheVideoEvents[event] = {
      event: event,
      handler: handler,
      useCapture: useCapture
    }
  },

  // 取消绑定
  off: function (event) {
    var _video = this.curVideoDom
    // 单个解绑
    if (typeof (event) === 'string' && this.cacheVideoEvents[event]) {
      var o = this.cacheVideoEvents[event]
      if (_video) {
        tools.debug('remove video event ==> ' + o.event)
        _video.removeEventListener(o.event, o.handler, o.useCapture)
      }
    }
    // 全部解绑
    else if (!event && this.cacheVideoEvents) {
      var evts = this.cacheVideoEvents
      if (_video) {
        for (var k in evts) {
          var _v = evts[k]
          tools.debug('Remove video event ==> ' + _v.event)
          _video.removeEventListener(_v.event, _v.handler, _v.useCapture)
        }
      }
    }
  },

  // 超时统计
  // 房间卡顿统计计时
  // 某些浏览器x5?不准确 -> 无法返回正确事件状态
  // 逻辑：当 video -> timeupdate => 本地跑赛跑计时器 (localTime - timeupdate) 得到卡顿时长
  timeoutChecker: function (flag) {
    var that = this;
    // 正常播放不进行错误统计
    if (flag === 'timeupdate') {
      that._roomCurrentTime = that.curVideoDom.currentTime
    }
    else if (flag === 'play') {
      that._roomCurrentTime = 0
    }

    // 未直播不进行统计
    let liveState = store.getters('getLiveState')
    if (liveState !== 'start') {
      tools.debug('timeout Interval ==>', liveState)
      return false
    }

    // 正常播放
    that.timeOutTimes = false
    // 本地自增
    if (!that.startPlaying) {
      tools.debug('timeout Interval Staring...')
      that.roomIncreaseTimer = setInterval(function () {
        var localTime = that._roomCurrentTime; // 本地自增时间
        var videoTime = that.curVideoDom.currentTime || 0; // 视频自增时间
        var localDelay = localTime - videoTime // 本地视频延迟
        localDelay = Math.abs((localDelay).toFixed(2))
        that.showLog(flag, `on timeout => ${localDelay}`)
        // 5 秒没更新过 video 时间
        // 本地延迟
        if (localDelay > that.PLAY_TIMEOUT_LIMIT) {
          if (!that.timeOutTimes) {
            that.timeOutTimes = true
            // 本地播放统计异常
            that.loggerCore('timeout', localDelay)
            // 切换源
            media.emit('live:video:timeout', localDelay)
            setTimeout(() => {
              that.timeOutTimes = false
            }, 200)
          }
          // 拉流异常超过 20 分钟，自动断开直播
          let maxStreamErrorTime = 20 * 60
          if (localDelay >= maxStreamErrorTime && that.cacheListenEvents[STATIC.player.MAX_PULL_STREAM_ERROR]) {
            tools.warn('已达到最大断流时长, 请刷新页面')
            that.cacheListenEvents[STATIC.player.MAX_PULL_STREAM_ERROR](localTime)
          }
          // 如发生超时, 每 MAX_RELOAD_TIME reload() 一次
          if (localDelay > that.MAX_RELOAD_TIME) {
            media.reload()
            that._roomCurrentTime = 0
            that._roomCurrentTime = 0
          }
          // timeout-cmd
          map.get("live:camera:timeout")(localTime, videoTime)
          map.get("live:video:timeout")(localTime, videoTime)
          map.get("live:media:timeout")(localDelay) // 本地超时
        }
        // 卡顿自动递增
        that._roomCurrentTime += 1
      }, 1000);
      that.startPlaying = true;
    }
  },

  // 取服务器直播视频时间
  getServerCurTime: function () {
    let state = store.getters('getLiveState')
    tools.debug("do getServerCurTime...", state)
    // 未开播, 不需要请求
    if (state !== 'start') {
      return false
    }
    // 重新初始化时间
    tools.ajax({
      type: 'GET',
      url: STATIC.APP_HOST + '/live/info.php',
      dataType: 'jsonp',
      data: 'access_token=' + sdkRoom.getAccessToken(),
      success: function (retval) {
        // 同步时间
        if (retval.code == STATIC.CODE.SUCCESS) {
          schedule.set('playDuration', 0)
          schedule.set('initDuration', retval.data.duration)
          schedule.set('baseDuration', retval.data.duration)
          tools.debug("getServerCurTime ==> initDuration:" + retval.data.duration)
        } 
        // 已停止播放(让直播停止)
        else if (retval.code == 1202) {
          media.emit('live:on:stop', 'global')
        }
      }
    });
  },
  // 人工暂停
  pause () {
    tools.debug('Stop roomIncreaseTimer countdown...')
    if (this.roomIncreaseTimer) {
      clearInterval(this.roomIncreaseTimer)
      this.startPlaying = false
      this.roomIncreaseTimer = null
    }
  },
  // 解绑
  unBind() {
    this.off()
  },
  // 视频质量数据
  getQAData() {
    return {
      ba: this.ba,
      bn: this.bn,
      pn: this.pn,
      bx: this.bx
    }
  },
  // pn自增
  pnCount () {
    this.pn += 1
  },
  // 重置(周期状态)
  resetQA() {
    this.bn = 0
  },
  // 重置全部状态
  reset() {
    tools.debug('statis on reset...')
    this.ba = 0
    this.bn = 0
    this.bx = 0
    this.pn = 0
  },
  // 销毁
  destroy(type, callback) {
    tools.debug('Destroy on ==>', type, '| current ==>', this.curPlayerType)
    // 删除的类型需要对应 ==> 播放类型
    if (this.curPlayerType !== type) {
      return false
    }
    tools.debug('Destroy on doing...')
    var vdom = this.curVideoDom
    if (vdom && vdom.parentNode) {
      tools.debug('## player(event) on destroy! ##', vdom)
      // 解绑事件
      this.unBind()
      if (typeof callback === 'function') {
        callback()
      }
      // 删除元素Icon
      core.mdeidaOnModeChange()
      // 重置videoDom对象
      media.setVideoDom(null)
      // 删除vdom
      vdom.parentNode.removeChild(vdom)
      // 房间自增
      clearInterval(this.roomIncreaseTimer)
      this.startPlaying = false
      this.roomIncreaseTimer = null
      this.curVideoDom = null
    }
  }
}