import { action } from 'mobx'
import * as TYPES from './action-types'

export class mediaAction {
  constructor(store) {
    this.store = store.media
  }
  dispatch(action) {
    this.media(this.store, action)
  }
  // 媒体[包括摄像头和桌面分享]
  @action media(state, action) {
    switch (action.type) {
      case TYPES.UPDATE_MEDIA_STATUS: {
        state.player.status = action.payload.status
        break
      }
      case TYPES.UPDATE_TECH_ORDER: {
        state.player.techOrder = action.payload.techOrder
        break
      }
      case TYPES.UPDATE_FULLSCREEN_STATE: {
        state.player.isFullScreen = action.payload.isFullScreen
        break
      }
      // 更新摄像头DOM
      case TYPES.UPDATE_CAMERA_DOM: {
        let { wrapContainer, playerId, callback } = action.payload.camera
        state.player.camera['wrapContainer'] = wrapContainer
        state.player.camera['playerId'] = playerId
        state.player.camera['callback'] = callback
        break
      }
      // 更新视频DOM
      case TYPES.UPDATE_VIDEO_DOM: {
        let { wrapContainer, playerId, callback } = action.payload.video
        state.player.video['wrapContainer'] = wrapContainer
        state.player.video['playerId'] = playerId
        state.player.video['callback'] = callback
        break
      }
      // 更新MEDIA-DOM
      case TYPES.UPDATE_MEDIA_DOM: {
        // state.player.media = action.payload.media
        let { wrapContainer, playerId, callback } = action.payload.media
        state.player.media['wrapContainer'] = wrapContainer
        state.player.media['playerId'] = playerId
        state.player.media['callback'] = callback
        break
      }
      // 更新桌面分享/视频的网页全屏状态
      case TYPES.UPDATE_VIDEO_WEB_FULLSCREEN_STATE: {
        state.player.video.webFullScreen = action.payload.webFullScreen
        break
      }
      // 更新摄像头的网页全屏状态
      case TYPES.UPDATE_CAMERA_WEB_FULLSCREEN_STATE: {
        state.player.camera.webFullScreen = action.payload.webFullScreen
        break
      }
      default:
        return state
    }
  }
}
