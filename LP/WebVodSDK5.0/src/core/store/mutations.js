import * as TYPES from './types'
import state from './state'
import tools from '../../common/utils/tools'

const mutationsCallback = {
  // token
  [TYPES.UPDATE_TOKEN](state, payload) {
    state.token = payload
  },
  // initData
  [TYPES.UPDATE_INIT_DATA](state, payload) {
    state.global.data = payload
  },
  // 直播数据更新
  [TYPES.UPDATE_LIVE_DATA](state, payload) {
    state.global.liveData = payload
  },
  // 模式切换
  [TYPES.UPDATE_LIVE_MODE](state, payload) {
    state.global.curMode = payload
  },
  // 播放状态
  [TYPES.UPDATE_LIVE_STATUS](state, payload) {
    state.player.status = payload
  },
  // 摄像头
  [TYPES.UPDATE_CAMERA_PLAYER_DOM](state, payload) {
    return Object.assign(state.player.cameraPlayer, payload)
  },
  // 更新画板DOM
  [TYPES.UPDATE_WHITEBOARD_DOM](state, payload) {
    // state.player.whiteboard = payload
    return Object.assign(state.player.whiteboardPlayer, payload)
  },
  // 更新桌面分享/视频插播DOM
  [TYPES.UPDATE_VIDEO_PLAYER_DOM](state, payload) {
    // state.player.videoPlayer = payload
    return Object.assign(state.player.videoPlayer, payload)
  },
  // 全屏
  [TYPES.UPDATE_FULLSCREEN_STATE] (state, payload) {
  },
  // 拓展应用
  [TYPES.UPDATE_EXT_CONFIG](state, payload) {
    // return Object.assign({}, state.extConfig, payload)
    if (payload && payload.config) {
      Object.assign(state.extConfig.config, payload.config)
    }
    if (payload && payload.video) {
      Object.assign(state.extConfig.video, payload.video)
    }
    return state
  }
}

// commit
export default {
  commit(type, payload) {
    tools.debug('Commit =>', type, payload)
    if (mutationsCallback[TYPES[type]]) {
      return mutationsCallback[TYPES[type]].call(this, state, payload)
    } else {
      throw new Error(`${type} mutations 未定义,请检查...`)
    }
  }
}