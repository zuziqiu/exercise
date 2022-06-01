import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class pptAction {
  constructor(store) {
    this.store = store.ppt
  }
  dispatch(action) {
    this.ppt(this.store, action)
  }
  // ppt页数
  @action ppt(state, action) {
    switch (action.type) {
      // 更新PPT对象数据
      case TYPES.UPDATE_PPT_DATA:
        if (action.payload.data) {
          state.currentPage = action.payload.data.currentPage
          state.pages = action.payload.data.pages || state.pages // 助教有pages。学员没有pages，学员是ADD_PPT_PAGE单独添加某页
          state.path = action.payload.data.path
          state.serverPath = tools.detectProtocol(action.payload.data.serverPath)
          state.suffix = action.payload.data.suffix
        }
        break;
      // 更新单个页面数据
      case TYPES.ADD_PPT_PAGE:
        if (action.payload.page) {
          if (!state['pages'][action.payload.page]) {
            state['pages'][action.payload.page] = {}
          }
        }
        break;
      // ppt localScale (父级容器宽/图片真实宽)
      case TYPES.UPDATE_PPT_PAGE_SCALE:
        if (state.pages[action.payload.page]) {
          state.pages[action.payload.page].scale = action.payload.scale
        }
        break;
      // // ppt 实际滚动top
      // case TYPES.UPDATE_PPT_PAGE_OFFSET:
      //   if (state.pages[action.payload.page]) {
      //     state.pages[action.payload.page].offset = action.payload.offset
      //   }
      //   break;
      // PPT发送的滚动top
      case TYPES.UPDATE_PPT_PAGE_POST_TOP:
        if (state.pages[action.payload.page]) {
          // danger!!! pages是初始化监听的定义的字段。为其动态添加的key，在mobx4以下监听需要额外处理。否则不会响应监听
          state.pages[action.payload.page].postTop = action.payload.postTop
        }
        break;
      // 当前PPT是否能滚动
      case TYPES.IS_SCROLL_PPT:
        state.isScrollPPT = action.payload
        break;
      default:
        return state
    }
  }
}