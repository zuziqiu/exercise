import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createPortal } from 'react-dom'
import tools from '@/common/utils/tools'
import core from '@/core/player.core'
import mediaCore from '@/core/mediaCore'
import Hls from 'hls.js'
import VideoJs from 'video.js'
import { DEFAULT_VIDEO_JS_CONF } from './config'
import * as actionTypes from '../../sdkStore/constants/actionTypes'
import map from '@/common/utils/map'
import { videoInstanceAdatper } from './utils'
import sdkStore from '../../sdkStore'
require('../../assets/style/camera.less')
const preload = 'auto'
let className = '';

const Camera = () => {
  // const cameraState = useSelector((state) => state.camera, shallowEqual)
  const cameraState = useSelector(
    (state) => state.camera,
    (cur, prev) => {
      // 更新摄像头的cameraCurrentTime的时候强制返回true，目的是为了cameraCurrentTime不更新组件
      if (prev.currentDuration != cur.currentDuration) {
        return true
      }
    }
  )
  // const vodStatus = useSelector((state) => state.vodStatus)
  const tagName = cameraState.tagName
  const mediaState = useSelector((state) => state.media)

  const playerState = useSelector((state) => state.player)
  const dispatch = useDispatch()

  const [videoInstance, setVideoInstance] = useState(null)
  const [isSourceCheck, setIsSourceCheck] = useState(true)
  const [lastClearTime, setLastClearTime] = useState(0)
  const [hasChangeSource, setHasChangeSource] = useState(false)
  const [hasInit, setHasInit] = useState(false)
  const [theHls, setTheHls] = useState(null)

  const ref = useRef()

  // 初始化
  useEffect(() => {
    const cameraDom = ref.current
    const defaultWidth = document.querySelector('#' + cameraState.cameraContainerId).clientWidth || 280
    const sources = core.getVideoSource(mediaState.mediaUrl)
    // 初始化只执行一次
    if (!sources || hasInit) return
    setHasInit(true)
    const isM3U8 = /\.m3u8/gi.test(sources[0].src)
    let cameraPlayer
    if (mediaCore.isSupportedMp4Bblob()) {
      cameraPlayer = mediaCore.mp4BlobPlayer(cameraDom, sources[0].src)
    } else if (isM3U8 && Hls.isSupported()) {
      let newHls = theHls
      if (!theHls) {
        newHls = new Hls()
        setTheHls(newHls)
      }

      newHls.loadSource(sources[0].src)
      newHls.attachMedia(cameraDom)
      newHls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Emitter a event
      })
      newHls.on(Hls.Events.ERROR, (e, data) => {
        if (!data.fatal) return
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.error('fatal network error encountered, try to recover')
            dispatch({
              type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
              payload: 'error'
            })
            dispatch({
              type: actionTypes.UPDATE_CAMERA_BN,
              payload: cameraState.bn + 1
            })
            dispatch({
              type: actionTypes.UPDATE_CAMERA_BA,
              payload: cameraState.ba + 1
            })
            map.get('live:video:error')(data)
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('fatal media error encountered, try to recover')
            newHls.recoverMediaError()
            break
          default:
            // cannot recover
            newHls.destroy()
            break
        }
      })
      cameraPlayer = videoInstanceAdatper(cameraDom, sources[0].src, newHls)
      cameraDom.removeAttribute('controls')
    } else {
      cameraPlayer = VideoJs(
        cameraDom,
        {
          techOrder: ['html5'],
          sources: core.getVideoSource(mediaState.mediaUrl),
          width: defaultWidth,
          ...DEFAULT_VIDEO_JS_CONF
        },
        () => {
          cameraDom.play().catch((e) => {
            console.warn(e)
          })
        }
      )
      cameraPlayer.volume(cameraState.volumeVal)
    }
    setVideoInstance(cameraPlayer)

    dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAYER,
      payload: cameraPlayer
    })

    if (tools.isWechat()) {
      tools.detectiveWxJsBridge(function () {
        cameraPlayer.play()
      })
    }

    window.__video__ = cameraPlayer
  }, [mediaState.mediaUrl])

  // 监听换源
  useEffect(() => {
    if (!hasInit) return
    const sources = core.getVideoSource(mediaState.mediaUrl)
    dispatch({
      type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
      payload: 'waiting'
    })
    if (theHls) {
      theHls.loadSource(sources[0].src)
      theHls.attachMedia(videoInstance.el)
    } else {
      // video.js
      videoInstance.src(sources)
    }
  }, [mediaState.mediaUrl])

  // 监听音量变化
  useEffect(() => {
    if (!videoInstance) return
    videoInstance.volume(cameraState.volume)
  }, [cameraState.volume])

  // 监听playRate变化
  useEffect(() => {
    if (!videoInstance) return
    videoInstance.playbackRate(cameraState.playbackRate)
  }, [cameraState.playbackRate])

  // 绑定事件
  useEffect(() => {
    if (!videoInstance) return

    videoInstance.on('loadeddata', () => {
      // todo check souces valid
      if (!isSourceCheck) return videoInstance.pause()
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'loadeddata'
      })
      map.get('vod:media:event')('loadeddata')
      map.get('live:video:loaded')('media')
      dispatch({
        type: actionTypes.UPDATE_CAMERA_BX,
        payload: 0
      })
      dispatch({
        type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
        payload: 0
      })
    })

    videoInstance.on('loadedmetadata', () => {
      // 验证资源有效性
      core.mediaValidate(cameraState.duration, (isPass) => {
        setIsSourceCheck(isPass)
      })
      if (cameraState.seekDuration > 0) {
        setTimeout(() => {
          videoInstance.currentTime(cameraState.seekDuration)
          dispatch({
            type: actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN,
            payload: 0
          })
        }, 100)
      }
      map.get('live:video:metadata')()
    })

    videoInstance.on('timeupdate', () => {
      const curTime = videoInstance.currentTime()
      const nowTime = Math.round(new Date().getTime() / 1000)
      if (curTime <= cameraState.currentDuration) {
        if (nowTime - cameraState.waitLastTime >= 1) {
          dispatch({
            type: actionTypes.UPDATE_CAMERA_BN,
            payload: cameraState.bn + 1
          })
          dispatch({
            type: actionTypes.UPDATE_CAMERA_BA,
            payload: cameraState.ba + 1
          })
        }
        if (cameraState.bx < 15) {
          dispatch({
            type: actionTypes.UPDATE_CAMERA_BX,
            payload: cameraState.bx + 1
          })
        } else {
          dispatch({
            type: actionTypes.UPDATE_CAMERA_BX,
            payload: 0
          })
          setHasChangeSource(1)
          map.get('live:video:timeout')(cameraState.bx)
        }
        dispatch({
          type: actionTypes.UPDATE_CAMERA_WAIT_LAST_TIME,
          payload: nowTime
        })
      } else if (cameraState.bx > 0 && nowTime - lastClearTime) {
        dispatch({
          type: actionTypes.UPDATE_CAMERA_BX,
          payload: cameraState.bx - 1
        })
        setLastClearTime(nowTime)
      }
      dispatch({
        type: actionTypes.UPDATE_CAMERA_CURRENT_DURATION,
        payload: { currentDuration: curTime }

        // type: actionTypes.UPDATE_CURRENT_TIME,
        // payload: { currentTime: curTime }
      })
      // if (curTime > 0) {
      //   dispatch({
      //     type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
      //     payload: 'playing'
      //   })
      // }
      map.get('live:camera:timeupdate')(curTime)
    })

    videoInstance.on('loadstart', () => {
      map.get('live:video:loadstart')()
    })

    videoInstance.on('firstbufferinfo', () => {
      if (videoInstance.techGet_) {
        map.get('live:loading:info')(videoInstance.techGet_('firstbufferinfo'))
      }
    })

    videoInstance.on('play', () => {
      // dispatch({
      //   type : actionTypes.UPDATE_CAMERA_PLAY_STATUS,
      //   payload : 'play'
      // })
      map.get('live:video:playing')()
    })

    videoInstance.on('canplay', () => {
      map.get('live:video:canplay')()
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'canplay'
      })
    })
    videoInstance.on('pause', () => {
      map.get('live:video:pause')()
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'pause'
      })
    })

    videoInstance.on('seeking', () => {
      map.get('live:video:seeking')()
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'seeking'
      })
      if (videoInstance.duration() == videoInstance.currentTime()) {
        dispatch({
          type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
          payload: 'ended'
        })
        core.playStatus = cameraState.playStatus
      }
    })

    videoInstance.on('seeked', () => {
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'seeked'
      })
      map.get('live:seek:finish')()
    })

    videoInstance.on('waiting', () => {
      dispatch({
        type: actionTypes.UPDATE_CAMERA_BN,
        payload: cameraState.bn + 1
      })
      dispatch({
        type: actionTypes.UPDATE_CAMERA_BA,
        payload: cameraState.ba + 1
      })
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'waiting'
      })
      map.get('live:video:waiting')()
    })

    videoInstance.on('ended', () => {
      dispatch({
        type: actionTypes.UPDATE_CAMERA_CURRENT_DURATION,
        payload: {currentDuration: 0}
      })
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'ended'
      })
      map.get('live:video:ended')()
    })

    videoInstance.on('durationchange', () => {
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'durationchange'
      })
      map.get('live:video:durationchange')()
    })

    videoInstance.on('abort', () => {
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: 'abort'
      })
      map.get('live:video:abort')
    })
  }, [videoInstance])

  // 同步进度
  useEffect(() => {
    if (!videoInstance) return
    videoInstance.currentTime(cameraState.duration)
  }, [cameraState.duration, videoInstance])

  // 快进钩子
  useEffect(() => {
    if (!videoInstance || cameraState.seekDuration == undefined) return
    videoInstance.play()
    videoInstance.currentTime(cameraState.seekDuration)
  }, [cameraState.seekDuration, videoInstance])

  // 播放状态 hook
  useEffect(() => {
    // console.error(cameraState.playStatus, videoInstance)
    mediaCore.emit('vod:video:' + cameraState.playStatus, cameraState.playStatus)
    if (!videoInstance) return
    if (cameraState.playStatus === 'playing') {
      core.setPlayerStatus('playing')
      videoInstance.play().catch(() => {
        // 自动播放失败，则将状态改为 pause
        console.warn('camera : 自动播放失败')
        dispatch({
          type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
          payload: 'pause'
        })
      })
    } else if (cameraState.playStatus === 'pause') {
      videoInstance.pause()
      core.setPlayerStatus('pause')
    } else if (cameraState === 'end') {
      videoInstance.pause()
      // 销毁 hls
      if (theHls) {
        theHls.destroy()
      } else {
        videoInstance.dispose()
      }
    }
  }, [cameraState.playStatus, videoInstance])

  // 强制音频
  if (core.isForceAudio() || tagName === 'audio') {
    isVideo = false
    className = 'camera_wechat audio'
  } else if (core.isForceVideo() || tagName === 'video') {
    // 强制视频
    isVideo = true
    className = 'ht_meida_audio camera'
  } else if (tools.isWechat()) {
    // 微信
    className = 'camera_wechat camera'
    isVideo = true
  } else if (sdkStore.getState().room.extConfig.config?.audioOnly) {
    // iPhone特殊配置
    //iphone 里面播放video会全屏，所以使用audio
    isVideo = false
    className = 'ht_meida_audio camera'
  } else if (tools.isIpad()) {
    // iPad
    isVideo = true
    className = 'camera_ipad camera'
    preload = 'none'
  } else if (tools.isAndroid()) {
    // Android
    isVideo = true
    className = 'camera_android camera'
  } else {
    // PC or Other
    isVideo = true
    className = 'camera_default camera'
  }

  // useEffect(() => {
  //   const cameraDom = ref.current
  //   switch (vodStatus.cameraShouldDo) {
  //     case 'playing':
  //       cameraDom?.play?.().catch((err) => {
  //         console.log(`播放失败: ${err}`)
  //       })
  //       break
  //     case 'forcePlay':
  //       cameraDom?.play?.().catch((err) => {
  //         console.log(`播放失败: ${err}`)
  //       })
  //       break
  //     case 'pause':
  //       cameraDom?.pause?.()
  //       break
  //   }
  // }, [vodStatus.cameraShouldDo])
  sdkStore.listen(
    (state) => state.vodStatus.cameraShouldDo,
    (dispatch, cur) => {
      console.log(`cur=====> ${cur}`)
      const cameraDom = ref.current
      switch (cur) {
        case 'playing':
          cameraDom?.play?.().catch((err) => {
            console.log(`播放失败: ${err}`)
          })
          break
        case 'forcePlay':
          cameraDom?.play?.().catch((err) => {
            console.log(`播放失败: ${err}`)
          })
          break
        case 'pause':
          cameraDom?.pause?.()
          break
      }
    }
  )
  const getMedia = useCallback(() => {
    if (isVideo) {
      return useMemo(() => <video ref={ref} onContextMenu={(event) => event.preventDefault} className={className} preload={preload} id={playerState.cameraPlayer.playerId}></video>, [])
    } else {
      return useMemo(() => <audio ref={ref} preload={preload} onContextMenu={(event) => event.preventDefault} className={className} id={playerState.cameraPlayer.playerId}></audio>, [])
    }
  }, [])

  // document.querySelector('#mod_camera_player').innerHTML = ''

  return createPortal(getMedia(), document.getElementById(playerState.cameraPlayer.wrapContainer))
}
export default memo(Camera)
