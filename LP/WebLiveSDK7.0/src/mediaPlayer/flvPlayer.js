import tools from '../utils/tools'
import cmdSchedule from '../core/cmdSchedule'
import log from '../utils/log'
import mediaControler from '../core/mediaControler'
import mediaEvent from '../core/playerEvent'
// import flvjs from '../vendor/flv.source-v4.2'
import { eventStore } from '../eventStore/index'
import { sdkStore } from '../states'
// flv-player
var flvPlayer = {
  curVdom: null,
  curStream: null,
  videoPlayer: null,
  flvjs: null,
  MAX_DELAY_RELOAD: 15, // 最大的
  getVideoEl() {
    if (this.curVdom) {
      return this.curVdom
    }
  },
  volume(range) {
    if (this.getVideoEl()) {
      this.getVideoEl().volume = range
    }
  },
  // 暂停
  pause() {
    tools.debug('flv on paused...')
    if (this.getVideoEl()) {
      this.getVideoEl().pause()
    }
    if (this.videoPlayer) {
      this.videoPlayer.unload()
      this.videoPlayer.pause()
    }
  },
  /**
   * 伪直播偏移修正...
   * [[100,100],[200,200],...]
   * playtime ==> [?]
   * sei + [?] = res
   */
  fixTimeOffset(res) {
    let curLiveTime = cmdSchedule.getCurLiveTime()
    // let course = Store.getters('getGlobal')['data']['course']
    let course = sdkStore.room.initData.course
    let curLastTartget = 0
    if (course?.offset?.length > 0) {
      course.offset.forEach(timeOffset => {
        if (curLiveTime >= timeOffset[0]) {
          curLastTartget = timeOffset[1]
        }
      })
      res.disposeTime = (Number(res.disposeTime) + curLastTartget).toFixed(2)
    }
    return res
  },
  // 初始化
  async init (stream, vdom) {
    tools.debug('Flv mode init =>', vdom, stream)
    // dom
    if (!vdom) {
      tools.warn('FlvPlayer 无法找到 vdom...')
      return false
    }
    // 流
    if (stream) {
      this.curStream = stream
    }
    var that = this
    this.getFlvUrl(stream).then(async() => {
      // 创建类型
      await require(['../vendor/flv.source-v4.2.js'], flvjs => {
        this.flvjs = flvjs
        this.createPlayer('video', vdom)
      })
    })
    // flvplayer
    // playerCore.setFlvPlayer(this)
  },
  // 监听 core 事件
  on(eventName, payload) {
    tools.debug('Flvplayer emit on ==>', eventName, '=>', payload)
    // let player = Store.getters('getPlayer')
    let player = sdkStore.media.player
    // 摄像头
    if (eventName === 'camera:player') {
      // 非课件模式 ==> 不允许创建
      // let curMode = Store.getters('getGlobal')['curMode']
      let curMode = sdkStore.room.curMode
      if (curMode != 0) {
        return false
      }
      const vdom = mediaControler.getVideoDom('camera')
      const sourceList = mediaControler.getMediaList()
      if (!sourceList || !vdom) {
        return false
      }
      this.init(sourceList, vdom)
      tools.callback(player['camera'].callback, vdom)
    }
    // 视频插播 / 桌面分享
    if (eventName === 'video:player') {
      let curMode = sdkStore.room.curMode
      // 非视频模式 ==> 不允许创建
      if (curMode == 0) {
        return false
      }
      const sourceList = mediaControler.getMediaList()
      const vdom = mediaControler.getVideoDom('video')
      if (!sourceList || !vdom) {
        return false
      }
      this.init(sourceList, vdom)
      if (vdom) {
        tools.callback(player['video'].callback, vdom)
      }
    }
    // Media-Reload
    if (eventName === 'media:change') {
      // 切换让VIDEO播放, 某些浏览器会暂停
      this.play(true)
    }
    // 暂停
    if (eventName === 'live:video:pause') {
      this.pause()
    }
    // 销毁
    if (eventName === 'media:destroy') {
      mediaEvent.destroy(payload, () => {
        this.destroy()
      })
    }
  },
  // reload
  reload(stream) {
    tools.debug('Flvplayer on reload...')
    var stream = stream || this.curStream
    var dom = this.curVdom
    if (this.videoPlayer) {
      this.videoPlayer.pause()
    }
    this.destroy('reload').then(() => {
      setTimeout(() => {
        this.init(stream, dom)
      }, 300)
    })
  },
  // is
  async isSupported() {
    // return false
    await require(['../vendor/flv.source-v4.2.js'], flvjs => {
      this.flvjs = flvjs
    })
    return this.flvjs.isSupported()
  },
  // flv info
  flvEvent: function (player) {
    var that = this
    // media info.
    player.on(that.flvjs.Events.MEDIA_INFO, function (res) {
      tools.debug('flv media info ==>', res)
      if (res.disposeTime) {
        cmdSchedule.setDisposeTime(parseFloat(res.disposeTime))
      }
    })
    // script_arrived data
    var before = tools.now()
    player.on(that.flvjs.Events.SCRIPTDATA_ARRIVED, function (res) {
      let disObj = null
      var getDisposeTimeObj = function (type, str) {
        if (str.indexOf('disposeTime') > -1) {
          return {
            type: type,
            disposeTime: Number(str.replace('disposeTime:', ''))
          }
        } else {
          return null
        }
      }
      // onTextData
      if (res.onTextData?.text) {
        res = getDisposeTimeObj('onTextData', res.onTextData.text)
        cmdSchedule.setDelayTime(res)
      }
      // SEI
      if (typeof res === 'string') {
        if (res.indexOf('disposeTime') > -1) {
          // 设置时间类型
          cmdSchedule.set('timeType', 'SEI')
          // 同步时间
          res = getDisposeTimeObj('SEI', res)
          // 修正多段时间点
          res = that.fixTimeOffset(res)
          // 修正延迟时间
          cmdSchedule.setDelayTime(res)
        }
      }
      // buffer修正延迟(+2's固定延迟)
      // (buffer 最新值 - 当前播放时间) ==> 视频延迟
      // [注意]: ==> 不能删除
      setTimeout(() => {
        if (that.curVdom?.buffered?.length > 0) {
          let delay = (that.curVdom.buffered.end(that.curVdom.buffered.length - 1) - that.curVdom.currentTime) + 2
          tools.debug('flv delay ==>', delay)
          // 延迟 > MAX_DELAY_RELOAD 秒刷新吧...
          // 延迟判断有可能存在异常情况
          if (delay > that.MAX_DELAY_RELOAD) {
            // that.reload()
          } else {
            let flvDelay = Number(delay.toFixed(2))
            cmdSchedule.set('cmdDelay', flvDelay)
          }
        }
      }, 150)
      if (res.type) {
        tools.debug('SCRIPTDATA_ARRIVED ==>', res)
      }
    })
    // error.
    player.on(that.flvjs.Events.ERROR, function (res) {
      tools.debug('flv on error ==>', res)
      // 重新设置cdn流地址
      mediaControler.onError('flvplayer').then((sourceList) => {
        tools.debug('cur stream ==>', sourceList.flv)
        that.getFlvUrl(sourceList)
        that.destroy('reload').then(() => {
          setTimeout(() => {
            that.init(sourceList, that.curVdom)
          }, 1500)
        })
      })
      eventStore.emit('live:camera:error', {
        code: -1,
        src: player.src
      })
    })
  },
  // 播放
  play: function (playOnly) {
    if (this.videoPlayer) {
      // 播放逻辑
      mediaControler.elementPlay(this.curVdom).then(res => {
        tools.debug('Flv on play ==>', res)
        // play only
        if (!playOnly) {
          this.videoPlayer.load()
        }
        // success
        if (res === 'success') {
          setTimeout(() => {
            this.videoPlayer.play()
          }, 100)
        }
        // pause
        else {
          this.pause()
        }
      })
    }
    return Promise.resolve()
  },
  // 创建player
  createPlayer: function (type, vdom) {
    // 纯视频播放器
    if (type === 'video' && !this.videoPlayer) {
      tools.debug('flv player create ==>', type, this.videoPlayer, vdom)
      var defaultConf = {
        // base
        enableStashBuffer: false,
        enableWorker: true,
        fixAudioTimestampGap: false,
        stashInitialSize: 128,
        // buffer
        lazyLoad: false,
        lazyLoadMaxDuration: 3,
        lazyLoadRecoverDuration: 3,
        autoCleanupSourceBuffer: true,
        autoCleanupMaxBackwardDuration: 1.5,
        autoCleanupMinBackwardDuration: 0.8
      }
      // var serverConf = state.global.data.flvConfig
      var serverConf = sdkStore.room.initData.flvConfig
      // 默认使用服务器配置
      var config = serverConf || defaultConf
      tools.debug('Flv config ==>', config)
      // this.flvUrl = this.flvUrl.replace(/http:|https:/, 'wss:')
      tools.debug('FLVJS-VERSION ==>', this.flvjs.version)
      tools.debug('FLVJS-ON-PLAY ==>', this.flvUrl)
      var videoPlayer = this.flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        hasVideo: true,
        url: this.flvUrl
      }, config)
      this.videoPlayer = videoPlayer
      this.flvEvent(videoPlayer)
      this.curVdom = this.curVdom || vdom
      videoPlayer.attachMediaElement(this.curVdom)
      this.play()
    }
  },
  // 获取 flv 地址
  getFlvUrl: function (stream) {
    tools.debug('Get Flv Stream ==>', stream)
    this.flvUrl = stream.flv
    // 设置src-log
    log.setBaseParam({
      srcUrl: stream.flv
    })
    return Promise.resolve()
  },
  // 销毁
  destroy: function (type) {
    tools.debug('## flvplayer do destroy ==>', type)
    if (this.videoPlayer) {
      if (!type) {
        if (this.curVdom) {
          // mediaControler.removeControls(this.curVdom.parentNode)
        }
      }
      this.videoPlayer.pause()
      this.videoPlayer.unload()
      this.videoPlayer.detachMediaElement()
      this.videoPlayer.destroy()
      this.videoPlayer = null
      if (!type) {
        this.curVdom = null
      }
      this.flvUrl = null
    }
    return Promise.resolve()
  }
}
export default flvPlayer