import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createPortal } from 'react-dom'
import tools from '@/common/utils/tools'
import core from '@/core/player.core'
import mediaCore from '@/core/mediaCore'
import { DEFAULT_VIDEO_JS_CONF } from './config'
import * as actionTypes from '../../sdkStore/constants/actionTypes'
import map from '@/common/utils/map'
import { videoInstanceAdatper } from './utils'
import sdkStore from '../../sdkStore'
import format from './formatObj'
import PlayCover from '../PlayCover'

const preload = 'auto'
const containerStyle = {
  display: 'flex',
  width: '100%',
  height: '100%',
  position: 'relative'
}
let className = ''

const Video = () => {
  const ref = useRef()

  // 组件映射sdkStore
  const videoState = useSelector((state) => state.video) // 获取视频模块的基础属性
  const mediaState = useSelector((state) => state.media) // 获取媒体信息（包含camera、desktop）

  // 组件创建state
  const [hasInit, setHasInit] = useState(false)
  const [theHls, setTheHls] = useState(null)
  const [videoInstance, setVideoInstance] = useState(null)

  const dispatch = useDispatch()
  // 监听换源
  useEffect(async () => {
    // if (!hasInit) return
    const videoDom = ref.current
    // const sources = core.getVideoSource(mediaState.mediaUrl)

    let video = await format(videoDom, mediaState.mediaUrl)
    setVideoInstance(video)
    video.volume(0.5)
    video.play().catch((e) => {
      console.warn(`播放失败==> ${e}`)
      dispatch({
        type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
        payload: { playStatus: 'pause' }
      })
    })
    // video.src(mediaState.mediaUrl)
    // dispatch({
    //   type: actionTypes.UPDATE_CAMERA_PLAY_STATUS,
    //   payload: 'waiting'
    // })
    // if (theHls) {
    //   theHls.loadSource(sources[0].src)
    //   theHls.attachMedia(videoInstance.el)
    // } else {
    //   // video.js
    //   videoInstance.src(sources)
    // }
  }, [mediaState.mediaUrl])
  // 播放状态 hook
  useEffect(() => {
    // console.error(videoState.playStatus, videoInstance)
    if (!videoInstance) return
    core.setPlayerStatus('playing')
    videoInstance.play().catch(() => {
      // 自动播放失败，则将状态改为 pause
      console.warn('camera : 自动播放失败')
      dispatch({
        type: actionTypes.UPDATE_VIDEO_PLAY_STATUS,
        payload: { playStatus: 'pause' }
      })
    })
    if (videoState.playStatus === 'playing') {
      core.setPlayerStatus('playing')
      videoInstance.play().catch(() => {
        // 自动播放失败，则将状态改为 pause
        console.warn('camera : 自动播放失败')
        dispatch({
          type: actionTypes.UPDATE_VIDEO_PLAY_STATUS,
          payload: { playStatus: 'pause' }
        })
      })
    } else if (videoState.playStatus === 'pause') {
      videoInstance.pause()
      core.setPlayerStatus('pause')
    } else if (videoState === 'end') {
      videoInstance.pause()
      // 销毁 hls
      if (theHls) {
        // theHls.destroy()
      } else {
        videoInstance.dispose()
      }
    }
  }, [videoState.playStatus, videoInstance])
  const videoEvent = useCallback((type) => {
    switch (type) {
      case 'play':
        dispatch({
          type: actionTypes.UPDATE_VIDEO_PLAY_STATUS,
          payload: { playStatus: 'playing' }
        })
        break
    }
  }, [])
  const getMedia = () => {
    return (
      <div style={containerStyle}>
        <PlayCover videoEvent={videoEvent} />
        <video ref={ref} onContextMenu={(event) => event.preventDefault} className={className} preload={preload} id={videoState.playerId}></video>
      </div>
    )
  }

  return createPortal(getMedia(), document.getElementById(videoState.videoContainerId))
}
export default memo(Video)
