import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class historyAction {
  constructor(store) {
    this.store = store.history
  }
  dispatch(action) {
    this.history(this.store, action)
  }
  // 历史
  @action history(state, action) {
    switch (action.type) {
      // 创建数据结构
      case TYPES.HISTORY_ADD_BRANCH:
        if (!state[action.payload.mode][action.payload.page]) {
          state[action.payload.mode][action.payload.page] = {}
          state[action.payload.mode][action.payload.page]['forward'] = []
          state[action.payload.mode][action.payload.page]['backward'] = []
        }
        // 切换type 防止生命周期函数更新陷入循环
        break;
      case TYPES.HISTORY_TYPE_UPDATE:
        state.type = action.payload.status
        state.isSend = action.payload.isSend
        // 触发前进
        break;
      case TYPES.WHITEBOARD_HISTORY_FORWARE:
        state.type = 'forward'
        state.isSend = action.payload.isSend
        // 触发后退
        break;
      case TYPES.WHITEBOARD_HISTORY_BACKWARE:
        state.type = 'backward'
        state.isSend = action.payload.isSend
        break;
      // 真实前进
      case TYPES.HISTORY_FORWARE_ACTION:
        if (!state[action.payload.mode][action.payload.currentPage]) {
          state[action.payload.mode][action.payload.currentPage] = {}
          state[action.payload.mode][action.payload.currentPage]['forward'] = []
          state[action.payload.mode][action.payload.currentPage]['backward'] = []
        }
        state[action.payload.mode][action.payload.currentPage]['forward'].push(action.payload.data)
        break;
      // 真实后退
      case TYPES.HISTORY_BACKWARE_ACTION:
        state[action.payload.mode][action.payload.currentPage]['backward'].push(action.payload.data)
        break;
      // 清空当前历史分支
      case TYPES.HISTORY_CLEAN_ACTION:
        if (state[action.payload.mode]) {
          // 清除目标页的历史
          if (state[action.payload.mode][action.payload.currentPage]) {
            state[action.payload.mode][action.payload.currentPage] = {}
            state[action.payload.mode][action.payload.currentPage]['forward'] = []
            state[action.payload.mode][action.payload.currentPage]['backward'] = []
          } else {
            // 清除该模式的历史
            state[action.payload.mode] = {}
          }
        }
        // return state
        break;
      default:
        return state
    }
  }
}