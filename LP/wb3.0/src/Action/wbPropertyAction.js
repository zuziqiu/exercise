import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class wbPropertyAction {
  constructor(store) {
    this.store = store.wbProperty
  }
  dispatch(action) {
    this.wbProperty(this.store, action)
  }
  // 画板属性
  @action wbProperty(state, action) {
    switch (action.type) {
      // 颜色
      case TYPES.WHITEBOARD_BRUSH_STROKE_COLOR:
        state.strokeColor = action.payload
        break;
      // Bg颜色
      case TYPES.WHITEBOARD_BACKGROUND_COLOR:
        state.backgroundColor = action.payload
        break;
      // 粗细
      case TYPES.WHITEBOARD_BRUSH_STROKE_WIDTH:
        state.strokeWidth = action.payload
        break;
      // 画笔类型
      case TYPES.WHITEBOARD_BRUSH_TYPE:
        state.brushType = action.payload
        break;
      // 画笔数据
      case TYPES.WHITEBOARD_BRUSH_DATA:
        state.brushData.src = action.payload.src || state.brushData.src
        state.brushData.server_path = action.payload.server_path || state.brushData.server_path
        state.brushData.fontSize = action.payload.fontSize || state.brushData.fontSize
        break;
      case TYPES.WHITEBOARD_BRUSH_OPACITY:
        state.strokeOpacity = action.payload
        break;
      default:
        return state
    }
  }
}