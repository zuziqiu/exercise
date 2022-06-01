/**
 * ## 全局 Reducer(state) 状态管理入口
 * ## 函数要与 ./states/baseState.js 里面全部数据对应
 * Reducer 规则 
 * { 
 *  action.type, 类型参数
 *  action.payload 参数
 * }
 */
import * as baseData from '../states/baseState'
import { STATIC } from '../states/staticState'
import * as TYPES from '../Action/action-types'
import * as tools from '../extensions/util'
// state
const _STATE = baseData.state
// 画板属性
export const whiteboard = (state = baseData.state.whiteboard, action) => {
  switch (action.type) {
    // 容器
    case TYPES.WHITEBOARD_CONTAINER:
      return Object.assign({}, state, {
        container: action.payload
      })
    // 颜色
    case TYPES.WHITEBOARD_BRUSH_STROKE_COLOR:
      return Object.assign({}, state, {
        strokeColor: action.payload
      })
    // Bg颜色
    case TYPES.WHITEBOARD_BACKGROUND_COLOR:
      return Object.assign({}, state, {
        backgroundColor: action.payload
      })
    // 粗细
    case TYPES.WHITEBOARD_BRUSH_STROKE_WIDTH:
      return Object.assign({}, state, {
        strokeWidth: action.payload
      })
    // 画笔类型
    case TYPES.WHITEBOARD_BRUSH_TYPE:
      return Object.assign({}, state, {
        brushType: action.payload
      })
    // 画笔数据
    case TYPES.WHITEBOARD_BRUSH_DATA:
      let _state = Object.assign({}, state)
      // Object.keys(_state.brushData).map((item) => {
      //   if (action.payload[item]) {
      //     _state.brushData[item] = action.payload[item]
      //   }
      // })
      Object.assign(_state.brushData, action.payload)
      return Object.assign({}, state, _state)
    case TYPES.WHITEBOARD_BRUSH_OPACITY:
      return Object.assign({}, state, {
        strokeOpacity: action.payload
      })
    default:
      return state
  }
}
// 课件图片切换[setpage next prev]
export const cousewareResource = (state = baseData.state.cousewareResource, action) => {
  switch (action.type) {
    // case TYPES.DOC_IMG_CHANGE:
    case TYPES.UPDATE_DOC_IMG:
      let _img = Object.assign({}, state, {
        img: action.payload
      })
      return _img
    default:
      return state
  }
}
// 房间管理
export const room = (state = _STATE.room, action) => {
  switch (action.type) {
    // 身份
    case TYPES.PAGE_BASE:
      let _state = Object.assign({}, state)
      _state.pageBase = action.payload
      return _state
    // 更改PPT类型
    case TYPES.UPDATE_PPT_TYPE:
      state.pptType = action.payload
      return state
    // 翻页
    case TYPES.LIVE_SET_PAGE:
      let _setPageData = Object.assign({}, state, {
        setPageData: action.payload || state.setPageData
      })
      if (tools.isWhiteboard(action.payload.pageIndex)) {
        _setPageData.whiteboardId = action.payload.id.toString()
      } else {
        _setPageData.pptId = action.payload.id.toString()
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
          // if (action.payload.ret.html5) {
          //   _pptType = 1
          // } else {
          //   _pptType = 0
          // }
        }
        _setPageData.pptType = _pptType
      }
      return _setPageData
    // 更新模式
    case TYPES.UPDATE_ROOM_MODE:
      // state.mode = action.payload
      let _mode = {}
      _mode.mode = action.payload
      return Object.assign({}, state, _mode)
    case TYPES.UPDATE_ROOM_DRAW_ENABLE:
      // state.powerEnable = action.payload
      let _powerEnable = {}
      _powerEnable.powerEnable = action.payload
      return Object.assign({}, state, _powerEnable)
    case TYPES.UPDATE_ROOM_CURUSER:
      // state.curUser = action.payload
      let _curuser = {}
      _curuser.curUser = action.payload
      return Object.assign({}, state, _curuser)
    // 更新操作者xid
    case TYPES.UPDATE_ROOM_HANDLER_XID:
      // state.curUser = action.payload
      // console.error(action)
      if (state.setPageData.handlerXid) {
        // state.setPageData.handlerXid = action.payload
        let _room = state
        _room.setPageData.handlerXid = action.payload
        // console.error(Object.assign({}, state, _room))
        return Object.assign({}, state, _room)
        // console.error(state)
      }
      return state
    // Bg颜色
    case TYPES.WHITEBOARD_BACKGROUND_COLOR:
      let _room = Object.assign({}, state)
      if (!_room.setPageData.ret) {
        _room.setPageData.ret = {}
      }
      _room.ret = Object.assign(state.setPageData.ret, { backgroundColor: action.payload })
      return _room
    default:
      return state
  }
}
// 动态PPT
export const animatePPT = (state = _STATE.animatePPT, action) => {
  switch (action.type) {

    // setpage 更新基础信息
    case TYPES.LIVE_SET_PAGE:
      if (action.payload && action.payload.ret && action.payload.ret.serverPath) {
        // let _pptType = state.pptType
        if (action.payload.ret) {
          /* 
            =============================================================================================================================
            注意危险！！！！！  你必须相当自信才允许改动下面逻辑，并且在改动之后必须测试包括但不限于以下注释说明的情况，我来为你介绍一下
            ============================================================================================================================= 
          */
          // html5传入对象的时候表示应用动态PPT。（小班、客户端、app）下的直播端和观看端都有可能进入这个判断
          if (Object.prototype.toString.call(action.payload.ret.html5) === '[object Object]') {
            state.pptType = 1
            state.h5PPTUrl = tools.detectProtocol(action.payload.ret.serverPath) + '/h5/ppt.html'
          }
          // html5传入字符串的时候表示应用静态PPT
          if (Object.prototype.toString.call(action.payload.ret.html5) === '[object String]') {
            state.pptType = 0
          }
          // html5传入null的时候表示接收端处理动态PPT的翻页指令(不会携带html5字段)，会携带ap=1，ap提前在中间件更新了state.pptType
          if (Object.prototype.toString.call(action.payload.ret.html5) === '[object Undefined]') {
            if (state.pptType == 1) {
              state.h5PPTUrl = tools.detectProtocol(action.payload.ret.serverPath) + '/h5/ppt.html'
            }
          }
          // if (state.pptType == 1) {
          //   state.h5PPTUrl = tools.detectProtocol(action.payload.ret.serverPath) + '/h5/ppt.html'
          // } else {
          //   if (action.payload.ret.html5) {
          //     state.pptType = 1
          //     state.h5PPTUrl = tools.detectProtocol(action.payload.ret.serverPath) + '/h5/ppt.html'
          //   }
          //   else {
          //     state.pptType = 0
          //   }
          // }
        }
        // state.pptType = _pptType
      } else {
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
        state.pageIndex = _index
        // currentPage: parseInt(action.payload.pageIndex) || state.currentPage,
        // currentSubPage: parseInt(action.payload.subIndex) || state.currentSubPage
      }
      return state

    // 更新 ppt 状态
    case TYPES.UPDATE_PPT_STATE:
      state.state = action.payload
      return state

    // 更新url地址
    case TYPES.UPDATE_PPT_ANIMATION_URL:
      state.h5PPTUrl = null
      return state

    // 更新ifr ==> 数据
    case TYPES.UPDATE_PPT_ANIMATION_DATA:
      let pptObj = action.payload
      state.state = pptObj.state
      state.pageComputed = pptObj.pagesAry
      state.curPage = pptObj.curPage
      state.curStep = pptObj.curStep
      state.pageAmount = pptObj.pagesAry.length
      state.stepTotal = pptObj.curPageSteps
      return state

    // 更换doc ==> 重置
    case TYPES.SWITCH_PAGE_STATUS:
      if (action.payload.status === 'done') {
        state.state = 'wait'
        state.pageIndex = 0
        state.pageComputed = []
        state.curPage = 0
        state.pageAmount = 0
        state.curStep = 0
      }
      return state

    // NEXT
    case TYPES.PAGE_NEXT:
      if (state.pptType) {
        state.pageIndex++
        let total = state.pageComputed.length - 1
        if (state.pageIndex >= total) {
          state.pageIndex = total
        }
      }
      return state

    // PREV
    case TYPES.PAGE_PREV:
      if (state.pptType) {
        state.pageIndex--
        if (state.pageIndex <= 0) {
          state.pageIndex = 0
        }
      }
      return state
    // 更改PPT类型
    case TYPES.UPDATE_PPT_TYPE:
      // state.pptType = action.payload
      return Object.assign({}, state, { pptType: action.payload })
    // 更新PPT pageIndex
    case TYPES.UPDATE_PPT_PAGEINDEX:
      state.pageIndex = action.payload.pageIndex
      return state
    default:
      return state
  }
}
// 图形ID自增
export const drawId = (state = _STATE.drawId, action) => {
  switch (action.type) {
    case TYPES.DRAW_ID_INCREMENT:
      return state += 1
    default:
      return state
  }
}
// PPT数据更新
export const PPT = (state = _STATE.PPT, action) => {
  switch (action.type) {
    // 更新PPT对象数据
    case TYPES.UPDATE_PPT_DATA:
      if (action.payload.data) {
        state = Object.assign(state, action.payload.data)
      }
      return state

    // 更新单个页面数据
    case TYPES.ADD_PPT_PAGE:
      let _page = action.payload.data
      if (_page) {
        if (!state['pages'][_page]) {
          state['pages'][_page] = {}
        }
      }
      return state
    // ppt localScale (父级容器宽/图片真实宽)
    case TYPES.UPDATE_PPT_PAGE_SCALE:
      if (state.pages[action.payload.page]) {
        state.pages[action.payload.page].scale = action.payload.scale
      }
      return state
    // ppt 实际滚动top
    case TYPES.UPDATE_PPT_PAGE_OFFSET:
      if (state.pages[action.payload.page]) {
        state.pages[action.payload.page].offset = action.payload.offset
      }
      return state
    // PPT发送的滚动top
    case TYPES.UPDATE_PPT_PAGE_POST_TOP:
      if (state.pages[action.payload.page]) {
        state.pages[action.payload.page].postTop = action.payload.postTop
      }
      return state
    default:
      return state
  }
}
// PPT数据更新
export const WHITEBOARD = (state = _STATE.WHITEBOARD, action) => {
  switch (action.type) {
    case TYPES.LIVE_SET_PAGE:
      let _state = Object.assign({}, state)
      if (action.payload) {
        if (tools.isWhiteboard(action.payload.pageIndex)) {
          // 编辑
          if (_state[action.payload.id.toString()]) {
            _state[action.payload.id.toString()] = Object.assign(_state[action.payload.id.toString()], action.payload.ret)
          } else {
            // 创建
            _state[action.payload.id.toString()] = Object.assign(action.payload.ret, { id: action.payload.id })
          }
        }
      }
      return _state
    // case TYPES.UPDATE_WHITEBOARD_DATA:
    //   if (action.payload.data) {
    //     state[action.payload.data.id.toString()] = action.payload.data
    //   }
    //   return state
    case TYPES.DELETE_WHITEBOARD:
      if (state[action.payload.data.id]) {
        delete state[action.payload.data.id.toString()]
      }
      return Object.assign({}, state)
    default:
      return state
  }
}
// 历史操作
export const history = (state = _STATE.history, action) => {
  switch (action.type) {
    // 创建数据结构
    case TYPES.WHITEBOARD_HISTORY_ADD_BRANCH:
      if (!action.payload.mode) {
        return state
      }
      // 判断history是否存在当前页的历史分支
      let _state = {}
      _state[action.payload.mode] = {}
      if (!state[action.payload.mode][action.payload.page]) {
        _state[action.payload.mode][action.payload.page] = {}
        _state[action.payload.mode][action.payload.page]['forward'] = []
        _state[action.payload.mode][action.payload.page]['backward'] = []
        // let _change = Object.assign({}, state[action.payload.mode], _state[_state[action.payload.mode]])
        Object.assign(state[action.payload.mode], _state[action.payload.mode])
        return state
      }
      return state
    // 切换type 防止生命周期函数更新陷入循环
    case TYPES.WHITEBOARD_HISTORY_TYPE_UPDATE:
      return Object.assign({}, state, {
        type: action.payload.status,
        isSend: action.payload.isSend
      })
    // 触发前进
    case TYPES.WHITEBOARD_HISTORY_FORWARE:
      // console.error("forware", state, action.data)
      return Object.assign({}, state, {
        type: 'forware',
        isSend: action.payload.isSend
      })
    // 触发后退
    case TYPES.WHITEBOARD_HISTORY_BACKWARE:
      // console.error("backware", state, action.payload)
      return Object.assign({}, state, {
        type: 'backware',
        isSend: action.payload.isSend
      })
    // 真实前进
    case TYPES.WHITEBOARD_HISTORY_FORWARE_ACTION:
      if (!state[action.payload.mode][action.payload.currentPage]) {
        state[action.payload.mode][action.payload.currentPage] = {}
        state[action.payload.mode][action.payload.currentPage]['forward'] = []
        state[action.payload.mode][action.payload.currentPage]['backward'] = []
      }
      state[action.payload.mode][action.payload.currentPage]['forward'].push(action.payload.data)
      // console.error("state forstate=======>", state)
      return state
    // 真实后退
    case TYPES.WHITEBOARD_HISTORY_BACKWARE_ACTION:
      state[action.payload.mode][action.payload.currentPage]['backward'].push(action.payload.data)
      // console.error("state backstate======>",state)
      return state
    // 清空当前历史分支
    case TYPES.WHITEBOARD_HISTORY_CLEAN_ACTION:
      if (state[action.payload.mode]) {
        if (state[action.payload.mode][action.payload.currentPage]) {
          state[action.payload.mode][action.payload.currentPage] = {}
          state[action.payload.mode][action.payload.currentPage]['forward'] = []
          state[action.payload.mode][action.payload.currentPage]['backward'] = []
          // console.error("state cleanstate======>",state)
        }
      }
      return state
    default:
      return state
  }
}
// 页面涂鸦数据
export const pageDrawData = (state = baseData.state.pageDrawData, action) => {
  switch (action.type) {
    // 新增画板 => { 10002: {}, 10003: {} ...}
    case TYPES.ADD_DRAW_WHITEBOARD:
      // let _page = {}
      // _page[action.payload.id] = action.payload
      state[STATIC.WHITEBOARD][action.payload.data.id.toString()] = {}
      return Object.assign({}, state)
    // 删除画板
    case TYPES.DELETE_WHITEBOARD:
      if (state[STATIC.WHITEBOARD][action.payload.data.id]) {
        delete state[STATIC.WHITEBOARD][action.payload.data.id.toString()]
      }
      return Object.assign({}, state)
    // 新增PPT => { 1: {}, 2: {} ...}
    case TYPES.ADD_DRAW_PPT:
      if (!state[STATIC.PPT][action.payload.data.id.toString()]) {
        state[STATIC.PPT][action.payload.data.id.toString()] = {}
      }
      return Object.assign({}, state)
    // 更新当前页涂鸦数据
    case TYPES.UPDATE_PAGE_DRAW_DATA:
      // ALL(清空所有页涂鸦数据)
      if (action.payload.mode === 'all') {
        // state[STATIC.WHITEBOARD] = {}
        // state[STATIC.PPT] = {}
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
          // if(action.payload.data.t === '19'){
          //   action.payload.data.t = action.payload.data.tid
          // }
          // state[STATIC.WHITEBOARD][action.payload.page][action.payload.data.cid] = action.payload.data
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
        // if (!state[STATIC.PPT][action.payload.page]) {
        //   state[STATIC.PPT][action.payload.page] = {}
        // }
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
      return Object.assign({}, state)
    // default
    default:
      return state
  }
}
// 页码[后期要新增画板统计]
export const page = (state = baseData.state.page, action) => {
  switch (action.type) {
    case TYPES.WEBP_SUPPORT:
      return Object.assign({}, state, { isWebpSupport: action.payload.isWebpSupport })
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
      let _pptType = state.pptType
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

// todo...
// ##################### 以下代码为示例 ##########################
export const testObject = (state = baseData.state.testObject, action) => {
  switch (action.type) {
    case 'ADD':
      return state += 1
    default:
      return state
  }
}
// export const objs = (state = baseData.state.objs, action) => {
//   switch (action.type) {
//     case 'TOKEY':
//       return Object.assign({}, state, {key: state.key += action.payload})
//     case 'TOVAL':
//       return Object.assign({}, state, {key: state.val += action.payload})
//     default:
//       return state
//   }
// }
export const testArray = (state = baseData.state.testArray, action) => {
  switch (action.type) {
    case 'ADDT':
      // var _k = []
      // _k.concat(state.push(action.state))
      // state = _k
      // state = state.push(state)
      // return state = state.push(action.state)
      let _o = {
        t: action.type,
        b: action.state
      }
      state.push(_o)
      return state
    default:
      return state
  }
}
// debug模式
export const debugMode = (state = _STATE.debugMode, action) => {
  switch (action.type) {
    case TYPES.FIRE_DEBUG_MODE:
      return action.payload.visible
    default:
      return state
  }
}
// IS_SCROLL_PPT
export const isScrollPPT = (state = _STATE.isScrollPPT, action) => {
  switch (action.type) {
    case TYPES.IS_SCROLL_PPT:
      return action.payload
    default:
      return state
  }
}
// ppt图片数据
export const pptInfoResource = (state = _STATE.pptInfoResource, action) => {
  switch (action.type) {
    case TYPES.PPT_INFO_SOURCE:
      return Object.assign({}, state, action.payload.pptInfoResource)
    case TYPES.PPT_LOAD_STATUS:
      return Object.assign({}, state, action.payload.loadStatus)
    case TYPES.PPT_SCROLL_POST_TOP_INFO:
      return Object.assign({}, state, {
        scrollInfo: action.payload.scrollInfo
      })
    default:
      return state
  }
}

// // 资源重试
export const sourceReLoad = (state = _STATE.sourceReLoad, action) => {
  switch (action.type) {
    //     // case TYPES.UPDATE_ERROR_GROUP:
    //     //   // 不存在该组就创建
    //     //   if (!state.errorLoadGroup[action.payload.g]) {
    //     //     state.errorLoadGroup[action.payload.g] = []
    //     //   }
    //     //   // 不存在该域名时才push（避免重复push）
    //     //   if (state.errorLoadGroup[action.payload.g].indexOf(action.payload.host) == -1) {
    //     //     state.errorLoadGroup[action.payload.g].push(action.payload.host)
    //     //   }
    //     //   return state
    case TYPES.UPDATE_HOST_GROUP:
      return Object.assign({}, state, { hostGroup: action.payload.hostGroup })
    case TYPES.UPDATE_TRY_GROUP:
      return Object.assign({}, state, { tryGroup: action.payload.tryGroup })
    default:
      return state
  }
}
// ### end ###