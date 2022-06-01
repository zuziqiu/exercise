import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class whiteboardAction {
  constructor(store) {
    this.store = store.whiteboard
  }
  dispatch(action) {
    this.whiteboard(this.store, action)
  }
  // 白板页数
  @action whiteboard(state, action) {
    switch (action.type) {
      case TYPES.LIVE_SET_PAGE:
        if (action.payload) {
          if (tools.isWhiteboard(action.payload.pageIndex)) {
            // 编辑
            let target = state[action.payload.id.toString()]
            if (target) {
              if (typeof action.payload.ret == 'object') {
                // 遍历赋值,可能有不定数量key => backgroundColor || effect || server_path || src
                Object.keys(action.payload.ret).map((key) => {
                  target[key] = action.payload.ret[key]
                })
              }
              target.id = action.payload.id.toString()
            } else {
              // 创建
              state[action.payload.id.toString()] = Object.assign(action.payload.ret, { id: action.payload.id })
            }
          }
        }
        break;
      case TYPES.UPDATE_WHITEBOARD_DATA:
        if (typeof action.payload.data == 'object') {
          Object.keys(action.payload.data).map(key => {
            if (!state[action.payload.data.id.toString()]) {
              state[action.payload.data.id.toString()] = {}
            }
            state[action.payload.data.id.toString()][key] = action.payload.data[key]
          })
          // state[action.payload.data.id.toString()] = action.payload.data
        }
        break;
      case TYPES.DELETE_WHITEBOARD:
        if (state[action.payload.data.id]) {
          delete state[action.payload.data.id.toString()]
        }
        break;
      default:
        return state
    }
  }
}