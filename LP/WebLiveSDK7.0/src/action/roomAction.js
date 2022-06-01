import { action, set } from 'mobx'
import * as TYPES from './action-types'

export class roomAction {
  constructor(store) {
    this.store = store.room
  }
  dispatch(action) {
    this.room(this.store, action)
  }
  // 问答
  @action room(state, action) {
    switch (action.type) {
      case TYPES.UPDATE_APP_HOST: {
        state.appHost = action.payload
        break
      }
      case TYPES.UPDATE_CON_STRING: {
        state.conString = action.payload
        break
      }
      case TYPES.UPDATE_HEARTBEAT_INTERVAL: {
        state.heartbeatInterval = action.payload
        break
      }
      case TYPES.UPDATE_LIVE: {
        state.live = action.payload
        break
      }
      case TYPES.UPDATE_MODULES: {
        state.modules = action.payload
        break
      }
      case TYPES.UPDATE_PLUGIN: {
        state.plugin = action.payload
        break
      }
      case TYPES.UPDATE_RTMP: {
        state.rtmp = action.payload
        break
      }
      case TYPES.UPDATE_CUR_USER: {
        state.curUser = action.payload
        break
      }
      case TYPES.UPDATE_ZHUBO: {
        state.zhubo = action.payload
        break
      }
      case TYPES.UPDATE_USER: {
        state.user = action.payload
        break
      }
      case TYPES.UPDATE_TITLE: {
        state.title = action.payload
        break
      }
      case TYPES.UPDATE_WEBSOCKET: {
        state.websocket = action.payload
        break
      }
      case TYPES.UPDATE_CAMERA_URL: {
        state.cameraUrl = action.payload
        break
      }
      case TYPES.UPDATE_SWF_URL: {
        state.swfUrl = action.payload
        break
      }
      case TYPES.UPDATE_LIVING_DURATION: {
        state.livingDuration = action.payload
        break
      }
      case TYPES.UPDATE_ANNOUNCE: {
        state.announce = action.payload
        break
      }
      case TYPES.UPDATE_FLASHVAR: {
        state.flashvar = action.payload
        break
      }
      case TYPES.UPDATE_INIT_EVENT: {
        state.initEvent = action.payload
        break
      }
      case TYPES.UPDATE_MODE_TYPE: {
        state.modeType = action.payload
        break
      }
      case TYPES.UPDATE_LIVE_PLAYER_URL: {
        state.livePlayerUrl = action.payload
        break
      }
      case TYPES.UPDATE_RES_CONFIG: {
        state.resConfig = action.payload
        break
      }
      case TYPES.UPDATE_ROBOTS: {
        state.robots = action.payload
        break
      }
      case TYPES.UPDATE_ROOM_MODULES: {
        state.roomModules = action.payload
        break
      }
      case TYPES.UPDATE_COURSE: {
        state.course = action.payload
        break
      }
      case TYPES.UPDATE_USER_CAMERA: {
        state.userCamera = action.payload
        break
      }
      case TYPES.UPDATE_EXT: {
        state.ext = action.payload
        break
      }
      case TYPES.UPDATE_ONLINE: {
        state.online = action.payload
        break
      }
      case TYPES.UPDATE_EXTENSION_CONFIG: {
        if (action.payload?.config) {
          // mobx的思想是追踪属性，不应该用state直接assign
          for (let key in action.payload.config) {
            state.extConfig.config[key] = action.payload.config[key]
          }
        }
        if (action.payload?.video) {
          for (let key in action.payload.video) {
            state.extConfig.video[key] = action.payload.video[key]
          }
        }
        break
      }
      case TYPES.UPDATE_ACCESS_TOKEN: {
        state.access_token = action.payload.access_token
        break
      }
      case TYPES.UPDATE_INIT_DATA: {
        state.initData = action.payload.initData
        break
      }
      case TYPES.UPDATE_LIVE_MODE: {
        state.curMode = action.payload.curMode
        break
      }
      case TYPES.UPDATE_LIVE_DATA: {
        state.liveData.liveId = action.payload.liveData?.liveId || 0
        state.liveData.courseId = action.payload.liveData?.courseId || 0
        break
      }
      case TYPES.UPDATE_LIVE_STATE: {
        state.liveState = action.payload.liveState
        break
      }
      // 不断流模式
      case TYPES.UPDATE_LOOP_MODE: {
        state.loopMode = action.payload.loopMode
        break
      }
      case TYPES.UPDATE_STEP_DATA: {
        if (action.payload.step) {
          if (action.payload.step == 1) {
            state.initData.action = action.payload.type
          }
          state.initData['step' + action.payload.step] = action.payload.command
        }
        break
      }
      case TYPES.UPDATE_WEBFULLSCREEN_OTHER: {
        if (action.payload.domArr) {
          console.log(state.webFullScreenOther.concat(action.payload.domArr))
          state.webFullScreenOther = state.webFullScreenOther.concat(action.payload.domArr)
        }
      }
    }
  }
}
