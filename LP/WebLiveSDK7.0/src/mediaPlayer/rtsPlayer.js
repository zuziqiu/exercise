/**
 * rtsPlayer.js 扩展类
 * 采用 rts 解码播放
 *
 * @summary Flv.js 使用
 * @author Marko.king
 *
 * Created at     : 2019-01-14 15:47:53
 * Last modified  : 2019-10-22 15:39:31
 */

import tools from '../utils/tools'
import { STATIC } from '../states/staticState'
import { sdkStore } from '../states'
// import Store from '../core/store'
import mediaControler from '../core/mediaControler'

// flv-player
var rtsPlayer = {
  curVdom: null,
  curStream: null,
  videoPlayer: null,
  sdk: null,
  client: null,
  containerId: '',
  eventBusArray: [],
  info: null,
  isInit: null,
  getVideoEl() {
  },
  volume(range) {
  },
  getInfo(access_token) {
    let that = this
    tools.ajax({
      type: 'GET',
      url: STATIC.APP_HOST + '/live/webrtc.php',
      dataType: "jsonp",
      data: {
        act: 'mediaChannelKey',
        access_token
      },
      success: function (retval) {
        that.info = retval.data
        if (that.cameraId) {
          that.camera(that.cameraId)
        }
      },
      error: function () {
        callback("error")
      }
    });
  },
  fireEvent() {
    this.eventBusArray.forEach(item => {
      tools.debug('rts event fire ==>', item)
      this.on(item.event, item.payload)
    })
  },
  saveEvent(event, payload) {
    var o = {
      event: event,
      payload: payload
    }
    tools.debug('rts save event ==>', o)
    this.eventBusArray.push(o)
  },
  // 监听 core 事件
  on(eventName, payload) {
    // 监听 core 事件
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
      const vdom = mediaControler.getVideoDom('camera')
      const sourceList = mediaControler.getMediaList()
      // if (!sourceList || !vdom) {
      //   return false
      // }
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
    if (!this.sdk) return
    this.sdk.reload(stream)
  },
  camera(id) {
    if (this.info) {
      this.loadRtcSdk(id)
      this.isInit = true
    } else {
      this.cameraId = id
    }
  },
  loadRtcSdk(id) {
    let that = this
    if (that.isInit) return
    // 判断是哪个合作商类型
    // 声网
    // if (that.info.rtcType == 'agora') {
    //   require.ensure([], function(require){
    //     var webrtc = require('../vendor/agora/rts.player')
    //     that.sdkOnInit(webrtc, id)
    //   })
    // } 
    // // 腾讯
    // else if (that.info.rtcType == 'tencent') {
    //   require.ensure([], function(require){
    //     var webrtc = require('../vendor/tencent/rts.player')
    //     that.sdkOnInit(webrtc, id)
    //   })
    // }
    // import(/* webpackChunkName: 'Agora' */ `../vendor/${that.info.rtcType}/rts.player`).then(webrtc => {
    //   that.sdkOnInit(webrtc, id)
    // })
    require.ensure([], function (require) {
      var webrtc = require(`../vendor/${that.info.rtcType}/rts.player`)
      that.sdkOnInit(webrtc, id)
    })
  },
  // todo...
  sdkOnInit(webrtc, id) {
    webrtc.default.getInfo(this.info)
    this.sdk = webrtc.default
    this.sdk.camera(id)
    this.sdk.init()
    this.fireEvent()
  },
  // is
  isSupported() {
    if (!this.sdk) return false
    return this.sdk.isSupported()
  },
  // flv info
  flvEvent: function (player) {
    if (!this.sdk) return
    this.sdk.flvEvent(player)
  },
  // 播放
  play: function () {
    if (!this.sdk) return
    this.sdk.play()
  },
  // 创建playertr
  createPlayer: function (type, vdom) {
  },
  // 获取 flv 地址
  getFlvUrl: function (stream) {
  },
  // 销毁
  destroy: function (type) {
    tools.debug('rts player on destroy...')
    this.isInit = null
    if (!this.sdk) return
    this.sdk.destroy(type)
  }
}
export default rtsPlayer