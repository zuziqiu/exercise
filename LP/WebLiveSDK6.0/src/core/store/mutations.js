import * as TYPES from './types'
import state from './state'
import tools from '../../utils/tools'

const mutationsCallback = {
  // token
  [TYPES.UPDATE_TOKEN] (state, payload) {
    state.token = payload
  },
  // 更新域名
  [TYPES.UPDATE_API_DOMAIN] (state, payload) {
    state.api.host = payload
  },
  // 画板版本
  [TYPES.UPDATE_WHITEBOARD_VERSION] (state, payload) {
    state.whiteboard.version = payload
  },
  // 画板页
  [TYPES.UPDATE_WHITEBOARD_PAGE] (state, payload) {
    state.whiteboard.curPage = payload
  },
  // 更新初始化配置
  [TYPES.UPDATE_EXT_CONFIG] (state, payload) {
    if (payload && payload.config) {
      Object.assign(state.extConfig.config, payload.config)
    }
    if (payload && payload.video) {
      Object.assign(state.extConfig.video, payload.video)
    }
    return state
  },
  // initData
  [TYPES.UPDATE_INIT_DATA] (state, payload) {
    state.global.data = payload
  },
  // fullscreen
  [TYPES.UPDATE_FULLSCREEN_STATE] (state, payload) {
    // state.player. = payload
    state.player.isFullScreen = payload
  },
  // 直播数据更新
  [TYPES.UPDATE_LIVE_DATA] (state, payload) {
    const ld = state.global.liveData
    if (payload.liveId > 0) {
      ld.liveId = payload.liveId
    }
    if (payload.courseId > 0) {
      ld.courseId = payload.courseId
    }
    if (payload === 'stop') {
      ld.liveId = 0
      ld.courseId = 0
    }
    state.global.liveData = ld
  },
  // 直播状态
  [TYPES.UPDATE_LIVE_STATE](state, payload) {
    state.global.liveState = payload
  },
  // 模式切换
  [TYPES.UPDATE_LIVE_MODE](state, payload) {
    state.global.curMode = payload
  },
  // 播放状态
  [TYPES.UPDATE_LIVE_STATUS] (state, payload) {
    state.player.status = payload
  },
  // techOrder
  [TYPES.UPDATE_TECH_ORDER] (state, payload) {
    state.player.techOrder = payload
  },
  // 更新摄像头DOM
  [TYPES.UPDATE_CAMERA_DOM] (state, payload) {
    state.player.camera = payload
  },
  // 更新视频DOM
  [TYPES.UPDATE_VIDEO_DOM] (state, payload) {
    state.player.video = payload
  },
  // 更新MEDIA-DOM
  [TYPES.UPDATE_MEDIA_DOM] (state, payload) {
    state.player.media = payload
  },
  // 更新不断流状态
  [TYPES.UPDATE_LOOP_MODE] (state, payload) {
    state.global.loopMode = payload
  },
  // 更新画板DOM
  [TYPES.UPDATE_WHITEBOARD_DOM] (state, payload) {
    state.player.whiteboard = payload
  },
  // 更新初始化STEP数据
  [TYPES.UPDATE_STEP_DATA] (state, payload) {
    if (state.global.data && state.global.data.InitData) {
      if (payload.step) {
        if (payload.step == 1) {
          state.global.data.InitData.action = payload.type
        }
        state.global.data.InitData['step' + payload.step] = payload.command
      }
    }
  }
}

// commit
export default {
  commit(type, payload) {
    tools.long('Commit =>', type, payload)
    if (mutationsCallback[TYPES[type]]) {
      return mutationsCallback[TYPES[type]].call(this, state, payload)
    } else {
      throw new Error(`${type} 未定义,请检查...`)
    }
  }
}