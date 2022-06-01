import { action } from 'mobx';
import * as TYPES from './action-types'
import { STATIC } from '../states/staticState'

export class pageDrawDataAction {
  constructor(store) {
    this.store = store.pageDrawData
  }
  dispatch(action) {
    this.pageDrawData(this.store, action)
  }
  // 涂鸦
  @action pageDrawData(state, action) {
    switch (action.type) {
      // 新增画板 => { 10002: {}, 10003: {} ...}
      case TYPES.ADD_DRAW_WHITEBOARD:
        state[STATIC.WHITEBOARD][action.payload.data.id.toString()] = {}
        break;
      // 删除画板
      case TYPES.DELETE_WHITEBOARD:
        if (state[STATIC.WHITEBOARD][action.payload.data.id]) {
          delete state[STATIC.WHITEBOARD][action.payload.data.id.toString()]
        }
        break;
      // 新增PPT => { 1: {}, 2: {} ...}
      case TYPES.ADD_DRAW_PPT:
        if (!state[STATIC.PPT][action.payload.data.id.toString()]) {
          state[STATIC.PPT][action.payload.data.id.toString()] = {}
        }
        break;
      // 更新当前页涂鸦数据
      case TYPES.UPDATE_PAGE_DRAW_DATA:
        // ALL(清空所有页涂鸦数据)
        if (action.payload.mode === 'all') {
          Object.keys(state[STATIC.WHITEBOARD]).map((item) => {
            state[STATIC.WHITEBOARD][item] = {}
          })
          Object.keys(state[STATIC.PPT]).map((item) => {
            state[STATIC.PPT][item] = {}
          })
        }
        // WHITEBOARD[画板]
        else if (action.payload.mode === STATIC.WHITEBOARD) {
          if (!action.payload.data.cid) {
            state[STATIC.WHITEBOARD][action.payload.page] = {}
          } else {
            if (state[STATIC.WHITEBOARD][action.payload.page]) {
              state[STATIC.WHITEBOARD][action.payload.page][action.payload.data.cid] = action.payload.data
            } else {
              state[STATIC.WHITEBOARD][action.payload.page] = {}
              state[STATIC.WHITEBOARD][action.payload.page][action.payload.data.cid] = action.payload.data
            }
          }
        }
        // PPT[课件]
        else if (action.payload.mode === STATIC.PPT) {
          // 更新替换
          // 传入`UPDATE`, 直接重置PPT对象 ==> {}
          if (action.payload.type && action.payload.type === "UPDATE") {
            state[STATIC.PPT] = action.payload.data
          } else {
            if (action.payload.scale) {
              state[STATIC.PPT][action.payload.page]['scale'] = action.payload.scale
            } else {
              if (!action.payload.data.cid) {
                state[STATIC.PPT][action.payload.page] = {}
              } else {
                if (state[STATIC.PPT][action.payload.page]) {
                  state[STATIC.PPT][action.payload.page][action.payload.data.cid] = action.payload.data
                } else {
                  state[STATIC.PPT][action.payload.page] = {}
                  state[STATIC.PPT][action.payload.page][action.payload.data.cid] = action.payload.data
                }
              }
            }
          }
        }
        break;
      // default
      default:
        return state
    }
  }
}