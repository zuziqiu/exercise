/**
 * HLS(m3u8) 播放
 */
// define(function (require, module) {
import tools from '../utils/tools'
import cmdSchedule from '../core/cmdSchedule'
// import
import log from '../utils/log'
import mediaControler from '../core/mediaControler'
import mediaEvent from '../core/playerEvent'
// import hls from 'hls.js'
import { sdkStore } from '../states'
// hls-player
const hlsCorePlayer = {
  hls: null,
  videoUrl: null,
  curStream: null,
  vdom: null,
  player: null,
  hlsPlayer: null,
  isNativePlayer: null,
  getVideoEl() {
    if (this.vdom) {
      return this.vdom
    }
  },
  volume(range) {
    if (this.getVideoEl()) {
      this.getVideoEl().volume = range
    }
  },
  pause() {
    if (this.getVideoEl()) {
      this.getVideoEl().pause()
    }
  },
  async init(sourceList, vdom) {
    if (sourceList) {
      // 设置src-log
      log.setBaseParam({
        srcUrl: sourceList.hls
      })
      this.curStream = sourceList
    } else {
      tools.debug('无法找到 ==> sourceList 资源...')
      return false
    }
    if (vdom) {
      this.vdom = vdom
    } else {
      tools.warn('hls.js 无法找到 vDom...')
      return false
    }
    // 不能初始化多次播放器
    if (this.hlsPlayer) {
      return false
    }
    // 固定延迟(8秒)
    cmdSchedule.set('delayDuration', 8)
    // hls解码播放(需要MediaSource支持)
    let flag = await this.isSupported()
    if (flag) {
      this.hlsPlayer = true
      tools.debug('hls.js player init =>', vdom, sourceList.hls)
      tools.debug('hls.js player load source =>', sourceList.hls)
      var HLS = new this.hls({
        maxBufferLength: 5,
        maxMaxBufferLength: 5
      })
      this.hlsPlayer = HLS
      HLS.attachMedia(vdom)
      // HLS.loadSource(sourceList.hls)
      HLS.on(this.hls.Events.MEDIA_ATTACHED, () => {
        tools.debug('Video and m3u8 are now bound together!')
        if (sourceList?.hls) {
          HLS.loadSource(sourceList.hls)
        }
        this.hlsEvent(HLS)
        this.play()
      })
    }
    // H5直接播放原生
    else {
      this.initByNative.apply(this, arguments)
    }
  },
  // 事件
  hlsEvent(HLS) {
    const EVENT = this.hls.Events
    let that = this
    HLS.on(EVENT.MANIFEST_PARSED, function (event, data) {
      tools.debug('manifest loaded, found ' + data.levels.length + ' quality level')
    })
    // buffer修正延迟
    HLS.on(EVENT.BUFFER_APPENDED, function (event, data) {
      if (that.vdom.buffered.length > 0) {
        let curTime = that.vdom.currentTime
        let buffTime = that.vdom.buffered.end(that.vdom.buffered.length - 1)
        let delay = cmdSchedule.delayDuration + (buffTime - curTime) - 1
        delay = Number(delay.toFixed(2))
        cmdSchedule.set('cmdDelay', delay)
      }
    })
    // 错误
    HLS.on(EVENT.ERROR, function (event, data) {
      if (data.fatal) {
        switch (data.type) {
          case this.hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            tools.debug('hls.js message fatal network error encountered, try to recover')
            // HLS.startLoad();
            // if (window.navigator.onLine) {
            that.onError()
            // }
            break
          case this.hls.ErrorTypes.MEDIA_ERROR:
            tools.debug('hls.js message fatal media error encountered, try to recover')
            HLS.recoverMediaError()
            break
          default:
            // on system error
            that.destroy()
            break
        }
      }
    })
  },
  // 原生播放
  initByNative: function (sourceList, vdom) {
    tools.debug('hls native player init =>', vdom)
    if (!vdom) {
      return false
    }
    // 设置固定延迟
    cmdSchedule.set('cmdDelay', 8)
    var videoUrl = sourceList.hls
    this.videoUrl = videoUrl
    this.vdom.src = videoUrl
    this.vdom.onload = function () {
      tools.debug('onload')
    }
    this.vdom.onloadeddata = function () {
      tools.debug('onloadeddata')
    }
    this.vdom.onprogress = function () {
      tools.debug('onprogress')
    }
    this.vdom.ondurationchange = function () {
      tools.debug('ondurationchange')
    }
    this.vdom.ontimeupdate = function (e) {
      tools.debug('ontimeupdate', e)
    }
    this.play()
  },
  async isSupported() {
    // 获取m3u8-minetype
    var getMineType = (mineType) => {
      var that = this
      return function (check) {
        return that.vdom.canPlayType(mineType).length > 0
      }
    }
    // 支持m3u8全部走原生版本
    let isNativeSupported = getMineType('Application/vnd.apple.mpegurl')
    if (isNativeSupported()) {
      this.isNativePlayer = true
      return false
    }
    // HLS-support() ==> 走hls.js
    else {
      this.isNativePlayer = false
      if (!this.hls) {
        // this.hls = await import(/* webpackChunkName: "hls" */ 'hls').then(hls => hls.default)
        await require(['hls'], (hls) => {
          this.hls = hls
        })
      }
      return this.hls.isSupported()
    }
  },
  // play
  async play(playOnly) {
    tools.debug('HLS on play...')
    if (this.vdom) {
      var video = this.vdom
      // hls.js-play
      let flag = await this.isSupported()
      if (flag && this.hlsPlayer) {
        mediaControler.elementPlay(video)
      } else {
        // playonly
        if (!playOnly) {
          video.src = this.videoUrl
          video.load()
        }
        setTimeout(() => {
          mediaControler.elementPlay(video)
        }, 100)
      }
    }
    return Promise.resolve()
  },
  // 切换源
  changeSource: function (source) {
    if (this.vdom) {
      this.vdom.pause()
      this.vdom.removeAttribute('src')
      this.videoUrl = source.hls
      this.vdom.load()
      this.vdom.src = this.videoUrl
      this.play()
    }
  },
  // 重新加载 || 切换线路
  reload: function (_stream) {
    var stream = _stream || this.curStream
    // hls.js 重新load
    if (this.hlsPlayer) {
      setTimeout(() => {
        this.pause()
        this.hlsPlayer.destroy()
        this.hlsPlayer = null
        this.init(stream, this.vdom)
      }, 500)
    }
    // 原生直接加载源
    else {
      if (stream) {
        this.changeSource(stream)
      } else {
        this.play()
      }
    }
  },
  // 切换资源
  onError: function () {
    tools.debug('hls on error Retring...')
    // 原生直接在方法体内替换, hls.js 操作 => reload
    mediaControler.onError('hlsplayer', this.vdom).then((sourceList) => {
      this.destroy().then(() => {
        setTimeout(() => {
          this.init(sourceList, this.vdom)
        }, 2000)
      })
    })
  },
  // 监听 core 事件
  on(eventName, payload) {
    tools.debug('HLSPlayer emit on ==>', eventName, '==>', payload)
    // let player = Store.getters('getPlayer')
    let player = sdkStore.media.player
    // 摄像头
    if (eventName === 'camera:player') {
      let curMode = sdkStore.room.curMode
      if (curMode != 0) {
        return false
      }
      const sourceList = mediaControler.getMediaList()
      const vdom = mediaControler.getVideoDom('camera')
      this.init(sourceList, vdom)
      tools.callback(player['camera'].callback, vdom)
    }
    // 视频插播 / 桌面分享
    if (eventName === 'video:player') {
      let curMode = sdkStore.room.curMode
      if (curMode == 0) {
        return false
      }
      const sourceList = mediaControler.getMediaList()
      const vdom = mediaControler.getVideoDom('video')
      this.init(sourceList, vdom)
      tools.callback(player['video'].callback, vdom)
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
    // 视频[原生事件]错误
    if (eventName === 'video:on:error') {
      // 原生事件直接切换视频源
      if (this.isNativePlayer) {
        this.onError()
      }
    }
    // 销毁
    if (eventName === 'media:destroy') {
      mediaEvent.destroy(payload, () => {
        this.destroy()
      })
    }
  },
  // event
  events: function () {
    // todo..
  },
  // 销毁
  destroy: function () {
    tools.debug('hls player on destroy...')
    if (this.hlsPlayer) {
      this.hlsPlayer.destroy()
      this.hlsPlayer = null
    }
    this.videoUrl = null
    return Promise.resolve()
  }
}
export default hlsCorePlayer
