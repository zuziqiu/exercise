import { action } from 'mobx';
import * as TYPES from '../assets/action-types'
export class pageAction {
  constructor(store) {
    this.store = store
  }
  dispatch(action) {
    this.page(this.store.page, action)
  }

  // 页码[后期要新增画板统计]
  @action page(state, action) {
    switch (action.type) {
      // 切换PPT时的进度状态
      case TYPES.SWITCH_PAGE_STATUS:
        return Object.assign({}, state, { status: action.payload.status })
      // 翻页
      case TYPES.LIVE_SET_PAGE:
        // console.error('page....', action.payload)
        // console.error('xxxxx', state.pageComputed)
        var _index = 0
        if (state.pageComputed && state.pageComputed.length > 0) {
          if (tools.isWhiteboard(action.payload.pageIndex)) {
            _index = state.pageComputed.indexOf(action.payload.pageIndex.toString())
          } else {
            _index = state.pageComputed.indexOf(action.payload.pageIndex + '_' + action.payload.subIndex)
          }
          if (_index < 0) {
            _index = 0
          }
        }
        let _pptType = state.pptType_pptType
        if (action.payload.ret) {
          if (Object.prototype.toString.call(action.payload.ret.html5) === '[object Object]') {
            _pptType = 1
          }
          // html5传入字符串的时候表示应用静态PPT
          if (Object.prototype.toString.call(action.payload.ret.html5) === '[object String]') {
            _pptType = 0
          }
          // if (action.payload.ret.html5) {
          //   _pptType = 1
          // } else {
          //   _pptType = 0
          // }
        }
        return Object.assign({}, state, {
          pageIndex: _index,
          isSend: action.payload.isSend,
          pptType: _pptType,
          pptId: action.payload.id.toString(),
          currentPage: parseInt(action.payload.pageIndex) || state.currentPage,
          currentSubPage: parseInt(action.payload.subIndex) || state.currentSubPage
        })
      // AMOUNT
      case TYPES.UPDATE_PAGE_AMOUNT:
        let amount = parseInt(action.payload.data, 10)
        state.pageAmount = amount
        return state
      // NEXT
      case TYPES.PAGE_NEXT:
        state.pageIndex++
        if (state.pageIndex > state.pageComputed.length - 1) {
          state.pageIndex = state.pageComputed.length - 1
        }
        var _PAGE_ASSIGN = tools.pageSplit(state.pageComputed[state.pageIndex])
        return Object.assign({}, state, _PAGE_ASSIGN)
      // PREV
      case TYPES.PAGE_PREV:
        state.pageIndex--
        if (state.pageIndex <= 0) {
          state.pageIndex = 0
        }
        var _PAGE_ASSIGN = tools.pageSplit(state.pageComputed[state.pageIndex])
        return Object.assign({}, state, _PAGE_ASSIGN)
      // 更新翻动过的数据
      case TYPES.UPDATE_WHITEBOARD_PAGE:
        if (!state.whiteboardPages) {
          state.whiteboardPages = {}
        }
        if (action.payload.operation === 'update') {
          if (tools.isWhiteboard(action.payload.page)) {
            if (!state.whiteboardPages['whiteboard']) {
              state.whiteboardPages['whiteboard'] = []
            }
            if (!(state.whiteboardPages['whiteboard'].indexOf(parseInt(action.payload.page)) > -1)) {
              state.whiteboardPages['whiteboard'].push(parseInt(action.payload.page))
            }
          } else {
            if (!state.whiteboardPages['ppt']) {
              state.whiteboardPages['ppt'] = []
            }
            if (!(state.whiteboardPages['ppt'].indexOf(parseInt(action.payload.page)) > -1)) {
              state.whiteboardPages['ppt'].push(parseInt(action.payload.page))
            }
          }
        } else if (action.payload.operation === 'resetCurrentPage') {
          // 重置PPT页数
          state.currentPage = 1
          state.subPage = 1
        } else if (action.payload.operation === 'clearPPT') {
          state.whiteboardPages['ppt'] = []
        } else if (action.payload.operation === 'clearWhiteboard') {
          state.whiteboardPages['whiteboard'] = []
        }
        return state
      // USE
      case TYPES.UPDATE_PAGE_DATA:
        // update page... 
        var _index = null
        if (action.payload.data.pageComputed && action.payload.data.pageComputed.length > 0) {
          if (tools.isWhiteboard(state.currentPage)) {
            _index = action.payload.data.pageComputed.indexOf(state.currentPage.toString())
          } else {
            _index = action.payload.data.pageComputed.indexOf(state.currentPage + '_' + state.currentSubPage)
          }
          if (_index < 0) {
            _index = 0
          }
        }
        // var _index = 0
        // if (action.payload.data.pageComputed) {
        //   console.error('xxxxx', action.payload.data.pageComputed)
        //   console.error(state.currentPage, state.currentSubPage)
        //   if ()
        // }
        return Object.assign({}, state, {
          currentPage: parseInt(action.payload.data.currentPage) || state.currentPage,
          currentSubPage: parseInt(action.payload.data.subPage) || state.currentSubPage,
          pageAmount: action.payload.data.pageIndexs ? action.payload.data.pageIndexs.length : state.pageIndexs.length, //parseInt(action.payload.data.pageAmount) || state.pageAmount,
          pageIndexs: action.payload.data.pageIndexs || state.pageIndexs,
          pages: action.payload.data.pages || state.pages || {},
          pageIndex: _index || action.payload.data.pageIndex || state.pageIndex,
          pageSubIndex: action.payload.data.pageSubIndex || state.pageSubIndex,
          whiteboardPages: action.payload.data.whiteboardPages || state.whiteboardPages,
          // pptPages: action.payload.data.pptPages || state.pptPages,
          pageComputed: action.payload.data.pageComputed || state.pageComputed,
          action: action.payload.data.action || state.action
        })
      // 更改PPT类型
      case TYPES.UPDATE_PPT_TYPE:
        state.pptType = action.payload
        return state
      // 涂鸦权限
      case TYPES.UPDATE_ROOM_DRAW_ENABLE:
        state.isSend = action.payload ? 1 : 0
        return state
      default:
        return state
    }
  }
}