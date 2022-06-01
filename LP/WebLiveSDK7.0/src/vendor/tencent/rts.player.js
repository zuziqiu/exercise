/**
 * @summary Flv.js 使用
 */

import tools from'../../utils/tools'
import cmdSchedule from '../../core/cmdSchedule'
import mediaCore from '../../core/mediaControler'
import {tSdk} from './t-sdk.js'
import { eventStore } from '../../eventStore/index';

// rts-player
var rtsPlayer = {
  curVdom: null,
  curStream: null,
  videoPlayer: null,
  sdk: new tSdk(),
  client: null,
  containerId: '',
  info: {

  },
  getVideoEl() {
  },
  volume (range) {
  },
  getInfo (info) {
    this.info = info
  },
  // 初始化
  init: function () {
    let that = this
    if (that.client) return
    that.client = that.sdk.createPlayer()
    if (that.containerId) {
      that.client.setRenderView({elementID: that.containerId})
    }
    let url = `room://sdkappid=${that.info.appID}&roomid=${that.info.channel}&userid=${that.info.xid}&usersig=${that.info.channelKey}`
    that.client .startPlay(url).then(() => {
      console.log('player | startPlay | ok');
    }).catch((error) => {
      console.error('player | startPlay | failed', error);
    })
  },
  // 监听 core 事件
  on(eventName, payload) {
    tools.debug('Rtsplayer emit on ==>', eventName, '=>', payload)
    // let player = Store.getters('getPlayer')
    let player = sdkStore.media.player
    // 摄像头
    if (eventName === 'camera:player') {
      // 非课件模式 ==> 不允许创建
      let curMode = sdkStore.room.curMode
      if (curMode != 0) {
        return false
      }
      const vdom = mediaCore.getVideoDom('camera')
      const sourceList = mediaCore.getMediaList()
      // if (!sourceList || !vdom) {
      //   return false
      // }
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
      const sourceList = mediaCore.getMediaList()
      const vdom = mediaCore.getVideoDom('video')
      if (!sourceList || !vdom) {
        return false
      }
      this.init(sourceList, vdom)
      tools.callback(player['video'].callback, vdom)
    }
    // Media-Reload
    if (eventName === 'media:change') {
      // 切换让VIDEO播放, 某些浏览器会暂停
      this.play(true)
    }
    // 销毁
    if (eventName === 'media:destroy') {
      // return
      this.destroy()
    }
  },
  // reload
  reload(stream) {
    tools.debug('Rtsplayer on reload...')
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
  camera () {
    // 播放视频容器保存当前上下文
    this.containerId = arguments[0] || arguments[1]
  },
  // is
  isSupported() {
    // return false
    // return this.sdk.checkCompatibilityRts()
  },
  // rts info
  flvEvent: function (player) {
    var that = this
    // media info.
    player.on(flvjs.Events.MEDIA_INFO, function (res) {
      tools.debug('rts media info ==>', res)
      if (res.disposeTime) {
        cmdSchedule.setDisposeTime(parseFloat(res.disposeTime))
      }
    })
    // script_arrived data
    var before = tools.now()
    player.on(flvjs.Events.SCRIPTDATA_ARRIVED, function (res) {
      var now = tools.now()
      tools.debug('收到时间差', now - before)
      if (now - before < 4) {
        before = tools.now()
        return
      }
      before = tools.now()
      var video = that.videoPlayer
      if (res.disposeTime) {
        if (video && video.buffered) {
          let timeObj = {
            disposeTime: Number(res.disposeTime),
            buffered: video.buffered.end(0),
            curTime: video.currentTime
          }
          cmdSchedule.setDelayTime(timeObj)
        }
      }
    })
    // error.
    player.on(flvjs.Events.ERROR, function (res) {
      tools.debug('rts on error ==>', res)
      // 重新设置cdn流地址
      mediaCore.onError('flvplayer').then((sourceList) => {
        tools.debug('cur stream ==>', sourceList.rts)
        that.destroy().then(() => {
          setTimeout(() => {
            that.init(sourceList, mediaCore.curPlayerDom)
          }, 1500)
        })
      })
      eventStore.get('live:camera:error',{
        code: -1,
        src: player.src
      })
    })
  },
  // 播放
  play: function () {
    if(this.info.appID) {
      let url = `room://sdkappid=${that.info.appID}&roomid=${that.info.channel}&userid=${that.info.xid}&usersig=${that.info.channelKey}`
      that.client .startPlay(url).then(() => {
        console.log('player | startPlay | ok');
      }).catch((error) => {
        console.error('player | startPlay | failed', error);
      })
      return Promise.resolve()
    } else {
      // return Promise.reject()
    }
  },
  // 创建playertr
  createPlayer: function (type, vdom) {
    // tools.debug('rts player create ==>', this.videoPlayer)
    // // 纯视频播放器
    // if (type === 'video' && !this.videoPlayer) {
    //   var defaultConf = {
    //     // base
    //     enableStashBuffer: true,
    //     isLive: true,
    //     enableWorker: true,
    //     fixAudioTimestampGap: false,
    //     stashInitialSize: 128,
    //     // buffer
    //     lazyLoad: true,
    //     lazyLoadMaxDuration: 3,
    //     lazyLoadRecoverDuration: 3,
    //     autoCleanupSourceBuffer: true,
    //     autoCleanupMaxBackwardDuration: 1.5,
    //     autoCleanupMinBackwardDuration: 0.8
    //   }
    //   var serverConf = state.global.data.flvConfig
    //   // 默认使用服务器配置
    //   var config = serverConf || defaultConf
    //   tools.debug('Flv config ==>', config)
    //   // this.flvUrl = this.flvUrl.replace(/http:|https:/, 'wss:')
    //   tools.debug('FLVJS-VERSION ==>', flvjs)
    //   var videoPlayer = flvjs.createPlayer({
    //     type: 'rts',
    //     isLive: true,
    //     hasVideo: true,
    //     url: this.flvUrl
    //   }, config)
    //   this.videoPlayer = videoPlayer
    //   this.flvEvent(videoPlayer)
    //   videoPlayer.attachMediaElement(vdom)
    //   this.curVdom = vdom
    //   this.play()
    // }
  },
  // 获取 rts 地址
  getFlvUrl: function (stream) {
  },
  // 销毁
  destroy: function (type) {
    tools.debug('## rtsplayer do destroy ##')
    let that = this
    if (this.videoPlayer) {
      if (!type){
        mediaCore.removeControls(this.curVdom.parentNode)
      }
      this.videoPlayer.pause()
      this.videoPlayer.unload()
      this.videoPlayer.detachMediaElement()
      this.videoPlayer.destroy()
      this.videoPlayer = null
      this.curVdom = null
      this.flvUrl = null
    }
    if (that.client) {
      that.client.leave(() => {
        that.client = null
        tools.debug('rtsplayer leave success...')
      }, (err) => {
        tools.warn('rtsplayer leave error...', err)
      })
    }
    return Promise.resolve()
  }
}
// window.__rts = rtsPlayer
// return flvPlayer
export default rtsPlayer
// })