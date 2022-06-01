import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class pageAction {
  constructor(store) {
    this.store = store.page
  }
  dispatch(action) {
    this.page(this.store, action)
  }
  // 页码[后期要新增画板统计]
  @action page(state, action) {
    switch (action.type) {
      case 'UPDATE_LOCALSTORAGE':
        // Object.keys(action.payload.state).map(key => {
        //   if (state[key]) {
        //     state[key] = Object.assign(new Proxy(action.payload.state[key]))
        //     console.log(key, state[key], action.payload.state[key], '====================')
        //   }
        // })
        state = new Proxy(action.payload.state, {})
        break;
      // 切换PPT时的进度状态
      case TYPES.SWITCH_PAGE_STATUS:
        // return Object.assign({}, state, { status: action.payload.status })
        state.status = action.payload.status
        // 翻页
        break;
      case TYPES.LIVE_SET_PAGE:
        // 更新当前模式的id
        if (tools.isWhiteboard(action.payload.pageIndex)) {
          state.whiteboardId = action.payload.id.toString()
        } else {
          state.pptId = action.payload.id.toString()
        }

        // 更新page计数的pageIndex
        var _index = 0
        if (state.pageComputed && state.pageComputed.length > 0) {
          if (tools.isWhiteboard(action.payload.pageIndex)) {
            state.whiteboardId = action.payload.id.toString()
            _index = state.pageComputed.indexOf(action.payload.pageIndex.toString())
          } else {
            state.pptId = action.payload.id.toString()
            _index = state.pageComputed.indexOf(action.payload.pageIndex + '_' + action.payload.subIndex)
          }
          if (_index < 0) {
            _index = 0
          }
        }

        // 更新pptType
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
        state.pageIndex = _index
        state.isSend = action.payload.isSend
        state.pptType = _pptType
        state.currentPage = parseInt(action.payload.pageIndex) || state.currentPage
        state.currentSubPage = parseInt(action.payload.subIndex) || state.currentSubPage
        // AMOUNT
        break;
      case TYPES.UPDATE_PAGE_AMOUNT:
        // return state
        let amount = parseInt(action.payload.data, 10)
        state.pageAmount = amount
        // NEXT
        break;
      case TYPES.PAGE_NEXT:
        state.pageIndex++
        if (state.pageIndex > state.pageComputed.length - 1) {
          state.pageIndex = state.pageComputed.length - 1
        }
        var _PAGE_ASSIGN = tools.pageSplit(state.pageComputed[state.pageIndex])
        // return Object.assign({}, state, _PAGE_ASSIGN)
        state.currentPage = _PAGE_ASSIGN.currentPage
        state.currentSubPage = _PAGE_ASSIGN.currentSubPage
        if (tools.isWhiteboard(_PAGE_ASSIGN.currentPage)) {
          state.whiteboardId = _PAGE_ASSIGN.currentPage
        }
        // PREV
        break;
      case TYPES.PAGE_PREV:
        state.pageIndex--
        if (state.pageIndex <= 0) {
          state.pageIndex = 0
        }
        var _PAGE_ASSIGN = tools.pageSplit(state.pageComputed[state.pageIndex])
        state.currentPage = _PAGE_ASSIGN.currentPage
        state.currentSubPage = _PAGE_ASSIGN.currentSubPage
        if (tools.isWhiteboard(_PAGE_ASSIGN.currentPage)) {
          state.whiteboardId = _PAGE_ASSIGN.currentPage
        }
        break;
      // 更新翻动过的数据
      case TYPES.UPDATE_WHITEBOARD_PAGE:
        if (!state.turnPages) {
          state.turnPages = {}
        }
        if (action.payload.operation === 'update') {
          if (tools.isWhiteboard(action.payload.page)) {
            if (!state.turnPages['whiteboard']) {
              state.turnPages['whiteboard'] = []
            }
            if (!(state.turnPages['whiteboard'].indexOf(parseInt(action.payload.page)) > -1)) {
              state.turnPages['whiteboard'].push(parseInt(action.payload.page))
            }
          } else {
            if (!state.turnPages['ppt']) {
              state.turnPages['ppt'] = []
            }
            if (!(state.turnPages['ppt'].indexOf(parseInt(action.payload.page)) > -1)) {
              state.turnPages['ppt'].push(parseInt(action.payload.page))
            }
          }
          // } else if (action.payload.operation === 'resetCurrentPage') {
          //   // 重置PPT页数
          //   state.currentPage = 0
          //   state.currentSubPage = 0
        } else if (action.payload.operation === 'clearPPT') {
          state.turnPages['ppt'] = []
        } else if (action.payload.operation === 'clearWhiteboard') {
          state.turnPages['whiteboard'] = []
        }
        // return state
        // USE
        break;
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
        state.currentPage = parseInt(action.payload.data.currentPage) || state.currentPage
        state.currentSubPage = parseInt(action.payload.data.subPage) || state.currentSubPage
        state.pageAmount = action.payload.data.pageIndexs ? action.payload.data.pageIndexs.length : state.pageIndexs.length //parseInt(action.payload.data.pageAmount) || state.pageAmount
        state.pageIndexs = action.payload.data.pageIndexs || state.pageIndexs
        state.pages = action.payload.data.pages || state.pages || {}
        state.pageIndex = _index || action.payload.data.pageIndex || state.pageIndex
        state.pageSubIndex = action.payload.data.pageSubIndex || state.pageSubIndex
        state.turnPages = action.payload.data.turnPages || state.turnPages
        state.pageComputed = action.payload.data.pageComputed || state.pageComputed
        state.action = action.payload.data.action || state.action
        break;
      // 更改PPT类型
      case TYPES.UPDATE_PPT_TYPE:
        state.pptType = action.payload
        break;
      // 涂鸦权限
      case TYPES.UPDATE_ROOM_DRAW_ENABLE:
        state.isSend = action.payload ? 1 : 0
        break;
      // 是否支持jpeg
      case TYPES.WEBP_SUPPORT:
        state.isWebpSupport = action.payload.isWebpSupport
      default:
        return state
    }
  }
}