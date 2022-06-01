import { action } from 'mobx';
import * as TYPES from './action-types'

export class whiteboardAction {
  constructor(store) {
    this.store = store.whiteboard
  }
  dispatch(action) {
    this.whiteboard(this.store, action)
  }
  // 媒体[包括摄像头和桌面分享]
  @action whiteboard(state, action) {
    switch (action.type) {
      // 记录画板版本
      case TYPES.UPDATE_WHITEBOARD_VERSION: {
        state.version = action.payload.version
        break;
      }
      // 记录画板页
      case TYPES.UPDATE_WHITEBOARD_PAGE: {
        state.curPage = action.payload.curPage
        break;
      }
      // 更新画板DOM
      case TYPES.UPDATE_WHITEBOARD_DOM: {
        if (action.payload.whiteboard) {
          for (let key in action.payload.whiteboard)
            state[key] = action.payload.whiteboard[key]
        }
        break;
      }
      // 更新课件的网页全屏状态
      case TYPES.UPDATE_WHITEBOARD_WEB_FULLSCREEN_STATE: {
        state.webFullScreen = action.payload.webFullScreen
        break;
      }
      default:
        return state
    }
  }
}