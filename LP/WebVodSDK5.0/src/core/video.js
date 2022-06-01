// define(function (require) {

// var tools = require('@tools'),
//   map = require('@map'),
//   core = require('./player.core');
// SDK = require('../controllers/sdk_control');
import tools from '../common/utils/tools'
import map from '../common/utils/map'
import core from './player.core'
// import mp4Blob from './mp4Blob'
import mediaCore from './mediaCore'
// import mediaEvent from './mediaEvent'
// import * as TYPES from './store/types'
// import videojs from 'video.js'

// import Hls from 'hls.js'

import sdkStore from '@/sdkStore'
import * as actionTypes from '@/sdkStore/constants/actionTypes'
import STATIC from '@/sdkStore/states/staticState'

let cameraState = sdkStore.getState().camera

// var COMMAND_CAMERA_START = 101 //摄像头启动
// var COMMAND_CAMERA_STOP = 102 //摄像头关闭
// var COMMAND_VIDEO_START = 103 //推流开始
// var COMMAND_VIDEO_STOP = 104 //推流结束

sdkStore.listen(
  (state) => state.camera,
  (dispatch, nextCamera) => {
    cameraState = nextCamera
  }
)

sdkStore.listen(
  (state) => state.vodControls.playRate.rateValue,
  (dispatch, cur, prev, state) => {
    if (video.cameraVideo) {
      console.log(12346)
    }
  }
)
sdkStore.listen(
  (state) => state.vodControls.playRate.rateValue,
  (dispatch, cur, prev, state) => {
    if (video.cameraVideo) {
      console.log(12346)
    }
  }
)
sdkStore.listen(
  (state) => state.vodControls.playRate.rateValue,
  (dispatch, cur, prev, state) => {
    if (video.cameraVideo) {
      console.log(12346)
    }
  }
)
sdkStore.listen(
  (state) => state.vodControls.playRate.rateValue,
  (dispatch, cur, prev, state) => {
    if (video.cameraVideo) {
      console.log(12346)
    }
  }
)
sdkStore.listen(
  (state) => state.vodControls.playRate.rateValue,
  (dispatch, cur, prev, state) => {
    if (video.cameraVideo) {
      console.log(98765432)
    }
  }
)

var video = {
  // sdk开发调用方法
  callSdk: function (cmd, toggle) {
    // SDK.exportCmd(cmd, toggle);
  },
  config: function (options) {
    if (typeof options === 'object') {
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_CONFIG,
        payload: options
      })
    }
  },
  // camera实例
  camera: function (containerId, playerId, callback) {
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_CONTAINER_ID,
      payload: containerId
    })
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAYER_ID,
      payload: playerId
    })
    // get camera
    var camera = cameraState.cameraPlayer
    //callback && callback(camera);
    this.cameraCallback = callback
  },
  // 获取 media 元素
  getCamera: function (flag) {
    let cameraCxt = sdkStore.getState().player

    var that = this,
      element = {}

    // has MediaObject.
    if (cameraState.cameraVideo) {
      tools.debug('Get Camera Element ==>', cameraState.cameraVideo)
      return cameraState.cameraVideo
    }

    // without Create.
    else {
      tools.debug('Createing the Camera Element ==>', cameraState.cameraPlayerId, cameraState.cameraVideo)

      // 强制音频
      if (core.isForceAudio() || flag === 'audio') {
        element = document.createElement('audio')
        element.setAttribute('preload', 'auto')
        element.className = 'camera_audio'
      }

      // 强制视频
      else if (core.isForceVideo() || flag === 'video') {
        element = document.createElement('video')
        element.setAttribute('preload', 'auto')
        element.className = 'camera_video'
      }

      // 微信
      else if (tools.isWechat()) {
        element = document.createElement('video')
        element.setAttribute('preload', 'auto')
        element.className = 'camera_wechat'

        // iPhone特殊配置
      } else if (sdkStore.getState().room.extConfig.config?.audioOnly) {
        //iphone 里面播放video会全屏，所以使用audio
        element = document.createElement('audio')
        element.className = 'ht_meida_audio'

        // iPad
      } else if (tools.isIpad()) {
        element = document.createElement('video')
        element.className = 'camera_ipad'
        element.setAttribute('preload', 'none')

        // Android
      } else if (tools.isAndroid()) {
        element = document.createElement('video')
        element.className = 'camera_android'
        element.setAttribute('preload', 'auto')
      }
      // PC or Other
      else {
        //ioswebview可以禁止全屏
        element = document.createElement('video')
        element.className = 'camera_default'
      }

      // el.
      element.id = cameraCxt.cameraPlayer.playerId

      // 设置attrs.
      mediaCore.setAttrs(element)
      mediaCore.commonEvent(element)

      element.addEventListener(
        'contextmenu',
        function (e) {
          e.preventDefault()
        },
        false
      )

      // render
      var docEl = document.getElementById(cameraCxt.cameraPlayer.wrapContainer)
      docEl.appendChild(element)

      // 设置controls
      var opts = sdkStore.getState().room.extConfig
      if (opts.config.controls) {
        mediaCore.setControls('video', docEl)
      }

      // copy.
      cameraState.cameraVideo = element
    }
    return element
  },

  // vjs camera
  getCameraPlayer: function () {
    return cameraState.cameraVideo
  },
  Hls: null,
  Videojs: null,
  // 创建 or 获取 vjs播放器
  getVideojsPlayer: async function (mediaEl, seek) {
    var that = this

    // 未创建player.
    if (!cameraState.cameraPlayer) {
      // 默认设置
      var _techObj = ['html5']
      // sources
      var _sources = core.getVideoSource(cameraState.videoUrl),
        defaultWidth = document.querySelector('#' + cameraState.cameraContainerId).clientWidth || 280

      // 未加载
      if (!mediaEl) {
        tools.debug('摄像头视频标签未定义.')
        return false
      }
      // 设置默认样式
      else {
        mediaEl.parentNode.style['width'] = '100%'
        mediaEl.parentNode.style['height'] = '100%'
      }

      // 设置视频播放器
      let cameraPlayer = null
      // mediaEvent.init(mediaEl)
      // mediaSource解码方式 => 暂时不支持
      if (mediaCore.isSupportedMp4Bblob()) {
        cameraPlayer = mediaCore.mp4BlobPlayer(mediaEl, _sources[0].src)
      } else {
        // 假如传入m3u8并且媒体支持则播放m3u8
        var isM3U8 = /\.m3u8/gi.test(_sources[0].src)
        // if (config && config.techOrder == 'HLS' && !this.Hls) {
        if (isM3U8 && !this.Hls) {
          // await import ('hls.js').then(Hls => {})
          await import('hls.js').then((res) => (this.Hls = res.default))
        }

        if (this.Hls && this.Hls.isSupported()) {
          if (!this.newHls) {
            this.newHls = new this.Hls()
          }
          this.newHls.loadSource(_sources[0].src)
          this.newHls.attachMedia(mediaEl)
          this.newHls.on(this.Hls.Events.MANIFEST_PARSED, () => {
            that.cameraCallback(mediaEl.parentElement)
          })
          this.newHls.on(this.Hls.Events.ERROR, (e, data) => {
            if (data.fatal) {
              switch (data.type) {
                case this.Hls.ErrorTypes.NETWORK_ERROR:
                  // try to recover network error
                  console.error('fatal network error encountered, try to recover')
                  that.setMeidaPlayStatus('error')
                  sdkStore.dispatch({
                    type: actionTypes.UPDATE_CAMERA_BN,
                    payload: cameraState.bn + 1
                  })
                  sdkStore.dispatch({
                    type: actionTypes.UPDATE_CAMERA_BA,
                    payload: cameraState.ba + 1
                  })
                  if (that.changeSource == 0) {
                    that.changeSource = 1
                  }
                  // 切换线路
                  mediaCore.emit('live:video:error', that.changeSource)
                  map.get('live:video:error')(data)

                  break
                case this.Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('fatal media error encountered, try to recover')
                  this.newHls.recoverMediaError()
                  break
                default:
                  // cannot recover
                  this.newHls.destroy()
                  break
              }
            }
          })
          cameraPlayer = {
            el: mediaEl,
            url: cameraState.videoUrl,
            currentTime: function (currentTime) {
              if (currentTime) {
                this.el.currentTime = Math.floor(currentTime)
              } else {
                return this.el.currentTime
              }
            },
            playbackRate: function (playbackRate) {
              if (playbackRate) {
                this.el.playbackRate = playbackRate
              } else {
                return this.el.playbackRate
              }
            },
            duration: function () {
              return this.el.duration
            },
            paused: function () {
              return this.el.paused
            },
            pause: function () {
              this.el.pause()
            },
            src: function (url) {
              if (url) {
                if (!video.newHls) {
                  video.newHls = new video.Hls()
                }
                if (Object.prototype.toString.call(url) == '[object String]') {
                  video.newHls.loadSource(url)
                  this.url = url
                } else {
                  video.newHls.loadSource(url[0].src)
                  this.url = url[0].src
                }
                video.newHls.attachMedia(this.el)
                video.newHls.on(video.Hls.Events.ERROR, (e, data) => {
                  if (data.fatal) {
                    switch (data.type) {
                      case video.Hls.ErrorTypes.NETWORK_ERROR:
                        // try to recover network error
                        console.log('fatal network error encountered, try to recover')
                        video.newHls.startLoad()
                        break
                      case video.Hls.ErrorTypes.MEDIA_ERROR:
                        console.log('fatal media error encountered, try to recover')
                        video.newHls.recoverMediaError()
                        break
                      default:
                        // cannot recover
                        video.newHls.destroy()
                        break
                    }
                  }
                })
              } else {
                return this.url
              }
            },
            dispose: function () {
              this.newHls.destroy()
            }
          }
          cameraPlayer.el.volume = cameraState.volumeVal / 100

          // volume
          // cameraPlayer.volume(that.volumeVal)
          sdkStore.dispatch({
            type: actionTypes.UPDATE_CAMERA_H5_PLAYER,
            payload: mediaEl
          })

          sdkStore.dispatch({
            type: actionTypes.UPDATE_CAMERA_PLAYER,
            payload: cameraPlayer
          })
          window.__video__ = cameraState.cameraPlayer
          cameraPlayer.el.removeAttribute('controls')
          // 点播事件
          // if (this.playType === 'playback') {

          // load data
          cameraPlayer.el.onloadeddata = function (res) {
            // 验证资源准确性
            if (!that.isChecked) {
              that.pause()
              return false
            }

            that.setMeidaPlayStatus('loadeddata')

            // event.
            map.get('live:video:loaded')('media')
            seek()
          }

          // loadedmetadata
          cameraPlayer.el.onloadedmetadata = function (res) {
            // 验证视频有效性
            core.mediaValidate(cameraState.duration, function (isPass) {
              if (isPass) {
                that.isChecked = true
              } else {
                that.isChecked = false
              }
            })
            // 1.5s之后seek到指定时间点(fix安卓切换源不会自动seek问题)
            if (cameraState.seekDuration && cameraState.seekDuration > 0) {
              tools.debug('camera seeking ===> ' + cameraState.seekDuration)
              setTimeout(() => {
                cameraPlayer.currentTime(cameraState.seekDuration)
                sdkStore.dispatch({
                  type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
                  payload: 0
                })
              }, 100)
            }
            map.get('live:video:metadata')()
          }

          // timeupdate
          var lastClearTime = 0
          cameraPlayer.el.ontimeupdate = function () {
            var curTime = cameraPlayer.currentTime()
            //断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
            var _nowTime = Math.round(new Date().getTime() / 1000)
            if (curTime <= cameraState.currentDuration) {
              that.setWaitingTimes(_nowTime)
            } else if (cameraState.bx > 0 && _nowTime - lastClearTime > 1) {
              sdkStore.dispatch({
                type: actionTypes.UPDATE_CAMERA_BX,
                payload: cameraState.bx - 1
              })
              lastClearTime = _nowTime
            }
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_CURRENT_DURATION,
              payload: curTime
            })
            // that.currentDuration = curTime
            if (curTime > 0) {
              that.setMeidaPlayStatus('playing')
            }
            map.get('live:camera:timeupdate')(curTime)
          }

          // loadstart
          cameraPlayer.el.onloadstart = function () {
            map.get('live:video:loadstart')()
          }

          // firstbufferinfo - (for pc only)
          cameraPlayer.el.onfirstbufferinfo = function () {
            var res = cameraPlayer.techGet_('firstbufferinfo')
            map.get('live:loading:info')(res)
          }

          // play.
          cameraPlayer.el.onplay = function () {
            that.setMeidaPlayStatus('play')
            map.get('live:video:playing')()
          }

          // canplay
          cameraPlayer.el.oncanplay = function () {
            // 初次加载监听 `canplay`
            map.get('live:video:canplay')()
            that.setMeidaPlayStatus('canplay')
            that.firstLoad = true
          }

          // pause
          cameraPlayer.el.onpause = function () {
            that.setMeidaPlayStatus('pause')
            map.get('live:video:pause')()
          }

          // seeking
          cameraPlayer.el.onseeking = function () {
            that.setMeidaPlayStatus('seeking')
            map.get('live:video:seeking')()
            that.isSeekFinished = false
            if (cameraPlayer.duration() == cameraPlayer.currentTime()) {
              sdkStore.dispatch({
                type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
                payload: 'ended'
              })
              core.playStatus = cameraState.playStatus
            }
          }

          // seeked
          cameraPlayer.el.onseeked = function () {
            that.setMeidaPlayStatus('seeked')
            map.get('live:seek:finish')()
            that.isSeekFinished = true
          }

          // waiting
          cameraPlayer.el.onwaiting = function () {
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_BN,
              payload: cameraState.bn + 1
            })
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_BA,
              payload: cameraState.ba + 1
            })
            that.setMeidaPlayStatus('waiting')
            map.get('live:video:waiting')()
          }

          // ended
          cameraPlayer.el.onended = function () {
            // that.currentDuration = 0
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_CURRENT_DURATION,
              payload: 0
            })
            that.setMeidaPlayStatus('ended')
            map.get('live:video:ended')()
          }

          // error  注释是因为已经在hls赋值src了才注册错误时间，错过时机了。先用hls里面的监听，这里后面再改
          // cameraPlayer.el.onerror = function (info) {
          //   that.setMeidaPlayStatus("error");
          //   that.bn += 1;
          //   that.ba += 1;
          //   if (that.changeSource == 0) {
          //     that.changeSource = 1;
          //   }
          //   // 切换线路
          //   mediaCore.emit('live:video:error', that.changeSource)
          //   map.get('live:video:error')(info);
          // };

          cameraPlayer.el.ondurationchange = function () {
            that.setMeidaPlayStatus('durationchange')
            map.get('live:video:durationchange')()
          }

          // abort
          cameraPlayer.el.onabort = function () {
            that.setMeidaPlayStatus('abort')
            map.get('live:video:abort')(this)
          }
          // }
          // 微信自动播放
          if (tools.isWechat()) {
            tools.detectiveWxJsBridge(function () {
              that.play()
            })
          }
          return cameraPlayer
        } else {
          // videojs ==> 播放
          if (!this.Videojs) {
            await import('video.js').then((res) => (this.Videojs = res.default))
          }
          cameraPlayer = this.Videojs(
            mediaEl,
            {
              techOrder: _techObj,
              sources: _sources,
              preload: true,
              width: defaultWidth,
              bigPlayButton: false,
              errorDisplay: false,
              loadingSpinner: false,
              posterImage: true,
              textTrackSettings: false,
              textTrackDisplay: false,
              controlBar: false,
              controls: false,
              autoplay: true
            },
            function () {
              // 视频加载完毕(开始播放)
              that.videoLoadState = true
              var _videoDom = this.el_.firstChild
              _videoDom.style.width = '100%'
              _videoDom.style.height = '100%'
              // 兼容暴露对象 => tech_.el_ 对象
              this.el_.tech_ = {}
              this.el_.tech_.el_ = this.el_
              sdkStore.dispatch({
                type: actionTypes.UPDATE_CAMERA_H5_PLAYER,
                payload: this.tech_.el_
              })
              that.cameraCallback(this.el_)
              // set style
              this.el_.style['width'] = '100%'
              this.el_.style['height'] = '100%'
              that.play()
              // if (typeof callback === "function") {
              //   callback();
              // }
            }
          )
          cameraPlayer.volume(cameraState.volumeVal)

          // volume
          // cameraPlayer.volume(that.volumeVal)
          // that.cameraPlayer = cameraPlayer
          sdkStore.dispatch({
            type: actionTypes.UPDATE_CAMERA_PLAYER,
            payload: cameraPlayer
          })

          window.__video__ = cameraState.cameraPlayer

          // 点播事件
          // if (this.playType === 'playback') {

          // load data
          cameraPlayer.on('loadeddata', function (res) {
            // 验证资源准确性
            if (!that.isChecked) {
              that.pause()
              return false
            }

            that.setMeidaPlayStatus('loadeddata')

            // event.
            map.get('live:video:loaded')('media')
            seek()
          })

          // loadedmetadata
          cameraPlayer.on('loadedmetadata', function (res) {
            // 验证视频有效性
            core.mediaValidate(this.duration(), function (isPass) {
              if (isPass) {
                that.isChecked = true
              } else {
                that.isChecked = false
              }
            })
            // 1.5s之后seek到指定时间点(fix安卓切换源不会自动seek问题)
            if (cameraState.seekDuration && cameraState.seekDuration > 0) {
              tools.debug('camera seeking ===> ' + cameraState.seekDuration)
              setTimeout(() => {
                cameraPlayer.currentTime(cameraState.seekDuration)
                sdkStore.dispatch({
                  type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
                  payload: 0
                })
              }, 100)
            }
            map.get('live:video:metadata')()
          })

          // timeupdate
          var lastClearTime = 0
          cameraPlayer.on('timeupdate', function () {
            var curTime = cameraPlayer.currentTime()
            //断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
            var _nowTime = Math.round(new Date().getTime() / 1000)
            if (curTime <= cameraState.currentDuration) {
              that.setWaitingTimes(_nowTime)
            } else if (cameraState.bx > 0 && _nowTime - lastClearTime > 1) {
              sdkStore.dispatch({
                type: actionTypes.UPDATE_CAMERA_BX,
                payload: cameraState.bx - 1
              })
              lastClearTime = _nowTime
            }
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_CURRENT_DURATION,
              payload: curTime
            })
            // that.currentDuration = curTime
            if (curTime > 0) {
              that.setMeidaPlayStatus('playing')
            }
            map.get('live:camera:timeupdate')(curTime)
            // if (that.seekDuration && that.seekDuration > 0) {
            //   tools.debug("camera seeking ===> " + that.seekDuration);
            //   cameraPlayer.currentTime(that.seekDuration)
            //   that.seekDuration = 0
            // }
          })

          // loadstart
          cameraPlayer.on('loadstart', function () {
            map.get('live:video:loadstart')()
          })

          // firstbufferinfo - (for pc only)
          cameraPlayer.on('firstbufferinfo', function () {
            var res = cameraPlayer.techGet_('firstbufferinfo')
            map.get('live:loading:info')(res)
          })

          // play.
          cameraPlayer.on('play', function () {
            // that.play();
            that.setMeidaPlayStatus('play')
            map.get('live:video:playing')()
          })

          // canplay
          cameraPlayer.on('canplay', function () {
            // 初次加载监听 `canplay`
            map.get('live:video:canplay')()
            that.setMeidaPlayStatus('canplay')
            that.firstLoad = true
          })

          // pause
          cameraPlayer.on('pause', function () {
            that.setMeidaPlayStatus('pause')
            map.get('live:video:pause')()
          })

          // seeking
          cameraPlayer.on('seeking', function () {
            that.setMeidaPlayStatus('seeking')
            map.get('live:video:seeking')()
            that.isSeekFinished = false
            if (cameraPlayer.duration() == cameraPlayer.currentTime()) {
              sdkStore.dispatch({
                type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
                payload: 'ended'
              })
              core.playStatus = cameraState.playStatus
            }
          })

          // seeked
          cameraPlayer.on('seeked', function () {
            that.setMeidaPlayStatus('seeked')
            map.get('live:seek:finish')()
            that.isSeekFinished = true
          })

          // waiting
          cameraPlayer.on('waiting', function () {
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_BN,
              payload: cameraState.bn + 1
            })
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_BA,
              payload: cameraState.ba + 1
            })
            that.setMeidaPlayStatus('waiting')
            map.get('live:video:waiting')()
          })

          // ended
          cameraPlayer.on('ended', function () {
            that.setMeidaPlayStatus('ended')
            map.get('live:video:ended')()
          })

          // error
          cameraPlayer.on('error', function (info) {
            that.setMeidaPlayStatus('error')
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_BN,
              payload: cameraState.bn + 1
            })
            sdkStore.dispatch({
              type: actionTypes.UPDATE_CAMERA_BA,
              payload: cameraState.ba + 1
            })
            if (that.changeSource == 0) {
              that.changeSource = 1
            }
            // 切换线路
            mediaCore.emit('live:video:error', that.changeSource)
            map.get('live:video:error')(info)
          })

          cameraPlayer.on('durationchange', function () {
            that.setMeidaPlayStatus('durationchange')
            map.get('live:video:durationchange')()
          })

          // abort
          cameraPlayer.on('abort', function () {
            that.setMeidaPlayStatus('abort')
            map.get('live:video:abort')(this)
          })
          // }
          // 微信自动播放
          if (tools.isWechat()) {
            tools.detectiveWxJsBridge(function () {
              that.play()
            })
          }
          return cameraPlayer
        }
      }
    }
    // 已创建
    else {
      // 如不是同一个源, 需切换
      if (cameraState.cameraPlayer.src() !== cameraState.videoUrl) {
        var _sources = core.getVideoSource(cameraState.videoUrl)
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
          payload: 'waiting'
        })
        if (this.Hls && this.Hls.isSupported()) {
          cameraState.cameraPlayer.src(_sources[0].src)
        } else {
          cameraState.cameraPlayer.src(_sources)
        }
      }
      // 微信自动播放
      if (tools.isWechat()) {
        tools.detectiveWxJsBridge(function () {
          that.play()
        })
      }
      seek()
      return cameraState.cameraPlayer
    }
  },

  // camera容器统一事件接收器
  setMeidaPlayStatus: function (state) {
    console.debug('video on event ==>', state, 'camera')
    // 抛出事件
    mediaCore.emit('vod:video:' + state, state)
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
      payload: state
    })
    core.playStatus = state
    map.get('vod:media:event')(state)
  },

  playRate: function (rate) {
    if (!cameraState.cameraPlayer || cameraState.cameraPlayer.techName_ == 'Flash') {
      return
    }
    return cameraState.cameraPlayer.playbackRate(rate)
  },

  // 销毁标签(videojs)
  destroy: function () {
    // 销毁 cameraVideo 对象
    if (cameraState.cameraVideo) {
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_VIDEO,
        payload: null
      })
    }
    // 销毁 videojs 元素
    if (cameraState.cameraPlayer) {
      cameraState.cameraPlayer.dispose()
      cameraState.cameraPlayer = null
    }
  },

  //注: 时间轴运行
  startDurationTimmer: function () {
    var that = this
    if (!cameraState.durationTimmer) {
      // 如果在sdk里面
      const timer = setInterval(function () {
        if (core.currentDuration > 0) {
          if (core.currentDuration >= cameraState.duration) {
            that.stopDurationTimmer()
          }
        }
      }, 200)

      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_DURATION_TIMMER,
        payload: timer
      })
    }
  },
  // 时间轴停止
  stopDurationTimmer: function () {
    if (cameraState.durationTimmer) {
      clearInterval(cameraState.durationTimmer)
      // this.durationTimmer = null
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_DURATION_TIMMER,
        payload: null
      })
    }
  },
  getVideoUrl: function (content) {
    if (cameraState.playType === 'playback') {
      return content
    } else {
      content = content.replace('rtmp://', 'http://').split('|')
      return content[0] + '/' + content[1] + '/playlist.m3u8'
    }
  },
  seek: function (duration) {
    var that = this
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_BX,
      payload: 0
    })
    tools.debug('video seek ===> ' + duration)
    // 不允许seek
    if (cameraState.seekDuration < 0) {
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
        payload: 0
      })
      return false
    }
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
      payload: duration
    })
    // that.seekDuration = duration
    var vcamera = cameraState.cameraPlayer
    if (vcamera) {
      that.play()
      cameraState.cameraPlayer.currentTime(duration)
      that.startDurationTimmer()
    }
    that.changeSource = 0
  },
  // @触发条件
  // @1 => 从vod.player触发
  // @2 => 直接点击视频控件
  playHandle: null,
  play: function () {
    var that = this
    core.elementPlay(cameraState.h5Player, (type) => {
      // 错误暂停
      if (type === 'error') {
        this.pause()
      } else {
        // 正确播放
        tools.debug('视频开始播放...')
        // core.vodPlayer.tick();
        this.startDurationTimmer()
      }
    })
    // that.setMeidaPlayStatus("playing");
  },
  pause: function () {
    var vcamera = cameraState.cameraPlayer
    if (vcamera) {
      vcamera.pause()
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'pause'
      })
    }
    this.setMeidaPlayStatus('pause')
    this.stopDurationTimmer()
    return Promise.resolve()
  },
  stop: function () {
    tools.debug('video call stop!')
    var v = cameraState.cameraPlayer
    //如果是调用pause的话
    if (v) {
      v.pause()
    }
    this.setMeidaPlayStatus('ended')
    this.stopDurationTimmer()
  },
  volume: function (volume) {
    sdkStore.dispatch({
      type: actionTypes.UPDATE_CAMERA_VOLUME_VAL,
      payload: volume
    })
    if (cameraState.cameraPlayer) {
      cameraState.cameraPlayer.volume(volume)
    }
  },
  // video视频数据
  videoDo: async function (command, seek) {
    tools.debug('videoDo', command)
    var that = this
    // 视频开始
    if (command.t == STATIC.CMD.VIDEO_START) {
      // H5播放器执行
      if (command.c.length == 0) {
        return
      }
      var videoUrl = this.getVideoUrl(command.c)
      // 相同视频
      if (cameraState.videoUrl === videoUrl) {
        seek()
        return false
      }
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_VIDEO_URL,
        payload: videoUrl
      })
      // this.videoUrl = videoUrl
      tools.debug('play video:' + videoUrl)

      var video = this.getCamera()

      // 版本优先
      var _techObj = ['html5', 'false'] //默认

      // 创建 videojs 播放器
      that.getVideojsPlayer(video, seek)
      // 执行任务队列(时间轴)
      that.startDurationTimmer()
    }
    // 停止
    else if (command.t == STATIC.CMD.VIDEO_STOP) {
      this.stop()
      seek()
    }
  },
  changeSource: 0,
  setWaitingTimes: function (_nowTime) {
    var that = this
    if (_nowTime - cameraState.waitLastTime >= 1) {
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_BN,
        payload: cameraState.bn + 1
      })
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_BA,
        payload: cameraState.ba + 1
      })

      if (cameraState.bx < 15) {
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_BX,
          payload: cameraState.bx + 1
        })
      } else {
        sdkStore.dispatch({
          type: actionTypes.UPDATE_CAMERA_BX,
          payload: 0
        })
        that.changeSource = 1
        map.get('live:video:timeout')(cameraState.bx)
      }
      sdkStore.dispatch({
        type: actionTypes.UPDATE_CAMERA_WAIT_LAST_TIME,
        payload: _nowTime
      })
    }
  },

  // 摄像头开关
  cameraDo: function (command) {
    tools.debug('cameraDo', command)
    var that = this
    // 开启摄像头
    if (command.t == STATIC.CMD.CAMERA_START) {
      var v = this.getCamera()
      v.width = cameraState.cameraWidth
      v.height = cameraState.cameraHeight
      map.get('camera:start')(v)
    }
    // 关闭摄像头
    else if (command.t == STATIC.CMD.CAMERA_STOP) {
      // Native原生
      var v = this.getCamera()
      v.width = 0
      v.height = 0
      map.get('camera:stop')(v)
    }
  }
}

window.video = video
// return video;
export default video
// });
