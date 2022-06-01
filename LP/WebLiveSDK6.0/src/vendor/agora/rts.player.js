/**
 * @summary rts.js 使用
 * @author Marko.king
 *
 * Created at     : 2019-01-14 15:47:53
 * Last modified  : 2019-10-22 15:39:31
 */
// define(function (require, module) {

  import tools from'../../utils/tools'
  import schedule from '../../utils/schedule'
  import map from '../../utils/map'
  import mediaCore from '../../core/mediaCore'
  import Store from '../../core/store'
  import {agoraSdk} from './agora-sdk.js'
  
  // rts-player
  var rtsPlayer = {
    curVdom: null,
    curStream: null,
    videoPlayer: null,
    sdk: new agoraSdk(),
    client: null,
    containerId: '',
    timer: null,
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
      if (that.sdk.checkCompatibilityRts()) {
        // 支持rts，1、创建client和rts组件
        if (!that.info.appID || that.client) return
        that.client = that.sdk.createClient()
        that.sdk.initRts(that.client).then(() => {
          // 2、初始化client
          tools.debug('rtsplayer initRts success...')
          that.client.init(that.info.appID, () => {
            tools.debug('rtsplayer client init success...')
            // 2.1 join
            that.client.join(that.info.channelKey, that.info.channel, parseInt(that.info.xid), (uid) => {
              // 2.2 监听事件
              tools.debug('rtsplayer join success...')
              that.client.on("stream-added", function(e) {
                tools.debug('rtsplayer stream-added...')
                // 有新流add
                var stream = e.stream
                that.stream = stream
                that.client.subscribe(stream, { video: true, audio: true })
              })
              that.client.on("stream-subscribed", function(e) {
                tools.debug('rtsplayer stream-subscribed...')
                // 订阅成功
                var stream = e.stream
                that.timer = setInterval(() => {
                  stream.getStats(res => {
                    tools.debug('rtsplayer getStats...', res)
                  })
                }, 5000)
                if (that.containerId) {
                  tools.debug('rtsplayer playing in #' + that.containerId)
                  // 播放
                  stream.play(that.containerId)
                  if (stream.isPlaying()) {
                    map.get("live:camera:play")(7)
                  } else {
                    map.get("live:camera:pause")()
                  }
                }
              })
            }, (err) => {
              // 加入频道失败
              tools.warn('rtsplayer join error...', err)
            })
          }, (err) => {
            // 初始化client失败
            tools.warn('rtsplayer client init error...', err)
          })
        }, (err) => {
          // 初始化rts失败
          tools.warn('rtsplayer initRts error...', err)
        })
      } else {
        // 不支持rts
        tools.warn('rtsplayer nonsupport...')
      }
    },
    // 监听 core 事件
    on(eventName, payload) {
      tools.debug('Rtsplayer emit on ==>', eventName, '=>', payload)
      let player = Store.getters('getPlayer')
      // 摄像头
      if (eventName === 'camera:player') {
        // 非课件模式 ==> 不允许创建
        let curMode = Store.getters('getGlobal')['curMode']
        if (curMode != 0) {
          return false
        }
        const vdom = mediaCore.getVideoDom('camera')
        const sourceList = mediaCore.getMediaList()
        // if (!sourceList || !vdom) {
        //   return false
        // }
        this.init()
        tools.callback(player['camera'].callback, vdom)
      }
      // 视频插播 / 桌面分享
      if (eventName === 'video:player') {
        let curMode = Store.getters('getGlobal')['curMode']
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
      return this.sdk.checkCompatibilityRts()
    },
    // rts info
    flvEvent: function (player) {
      var that = this
      // media info.
      player.on(flvjs.Events.MEDIA_INFO, function (res) {
        tools.debug('rts media info ==>', res)
        if (res.disposeTime) {
          schedule.setDisposeTime(parseFloat(res.disposeTime))
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
            schedule.setDelayTime(timeObj)
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
        map.get('live:camera:error')({
          code: -1,
          src: player.src
        })
      })
    },
    // 播放
    play: function () {
      if(this.stream) {
        this.stream.play()
        map.get("live:camera:play")(7)
        return Promise.resolve()
      } else {
        // return Promise.reject()
        map.get("live:camera:pause")()
      }
    },
    // 创建playertr
    createPlayer: function (type, vdom) {
    },
    // 获取 rts 地址
    getFlvUrl: function (stream) {
    },
    // 销毁
    destroy: function (type) {
      tools.debug('## rtsplayer do destroy ##')
      let that = this
      // 如果已经加入频道并且初始化过流
      if (that.client && that.stream) {
        that.client.leave(() => {
          that.client = null
          clearInterval(that.timer)
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