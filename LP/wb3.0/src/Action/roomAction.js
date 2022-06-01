import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class roomAction {
  constructor(store) {
    this.store = store.room
  }
  dispatch(action) {
    this.room(this.store, action)
  }
  // 房间信息
  @action room(state, action) {
    switch (action.type) {
      // debug 模式
      case TYPES.FIRE_DEBUG_MODE:
        state.debugMode = action.payload.visible
        break;
      case TYPES.GIF_SWITCH:
        state.gifSwitch = action.payload.gifSwitch
        break;
      // 记录自增id
      case TYPES.DRAW_ID_INCREMENT:
        state.drawId += 1
        break;
      // 容器
      case TYPES.WHITEBOARD_CONTAINER_ID:
        state.wbContainerId = action.payload.id
        break;
      case TYPES.PAGE_BASE:
        state.pageBase = action.payload
        break;
      // 更改PPT类型
      case TYPES.UPDATE_PPT_TYPE:
        state.pptType = action.payload
        break;
      // 翻页
      case TYPES.LIVE_SET_PAGE:
        state.setPageData = action.payload || state.setPageData
        if (!tools.isWhiteboard(action.payload.pageIndex)) {
          // 设置动态PPT的标志pptType => 1;静态PPT的标志pptType => 0
          let _pptType = state.pptType
          if (action.payload.ret) {
            if (Object.prototype.toString.call(action.payload.ret.html5) === '[object Object]') {
              _pptType = 1
            }
            // html5传入字符串的时候表示应用静态PPT
            if (Object.prototype.toString.call(action.payload.ret.html5) === '[object String]') {
              _pptType = 0
            }
          }
          state.pptType = _pptType
        }
        break;
      // 更新模式
      // case TYPES.UPDATE_ROOM_MODE:
      //   state.mode = action.payload
      //   break;
      case TYPES.UPDATE_ROOM_DRAW_ENABLE:
        state.powerEnable = action.payload
        break;
      // reload 刷新涂鸦的按钮
      case TYPES.UPDATE_ROOM_RELOAD:
        state.reload = action.payload
        break;
      case TYPES.UPDATE_ROOM_CURUSER:
        state.curUser = action.payload
        break;
      case TYPES.UPDATE_ROOM_SET_TOKEN:
        state.token = action.payload
        break;
      // 更新操作者xid
      case TYPES.UPDATE_ROOM_HANDLER_XID:
        // if (state.setPageData.handlerXid) {
        state.setPageData.handlerXid = action.payload
        // }
        break;
      // Bg颜色
      case TYPES.WHITEBOARD_BACKGROUND_COLOR:
        if (!state.setPageData.ret) {
          state.setPageData.ret = {}
        }
        state.setPageData.ret.backgroundColor = action.payload
        break;
      default:
        return state
    }
  }
}