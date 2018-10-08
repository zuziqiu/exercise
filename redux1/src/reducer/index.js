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
import * as TYPES from '../../Action/action-types'
import * as tools from '../extensions/util'
// state
const _STATE = baseData.state
// 画板属性
export const whiteboard = (state = baseData.state.whiteboard, action) => {
  switch (action.type) {
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
    // 发生翻页更改PPT
    // case TYPES.LIVE_SET_PAGE:
    // // case TYPES.PAGE_NEXT:
    // // case TYPES.PAGE_PREV:
    //   console.error(action.payload)
    //   // var PAGE = action
    //   let PAGE = action.payload.currentPage
    //   let SUB_PAGE = action.payload.currentPage
    //   if (tools.getMode(PAGE) === STATIC.PPT) {
    //     let IMG_URL = tools.getPPTImg(PAGE, SUB_PAGE)
    //     // 切换到当前课件图片
    //     if (IMG_URL) {
    //       return Object.assign({}, state, {
    //         img: IMG_URL
    //       })
    //     }
    //   }
    default:
      return state
  }
}
// 房间管理
export const room = (state = _STATE.room, action) => {
  switch (action.type) {
    // 翻页
    case TYPES.LIVE_SET_PAGE:
      let _setPageData = Object.assign({}, state, {
        setPageData: action.payload || state.setPageData
      })
      if (tools.isWhiteboard(action.payload.pageIndex)) {
        // console.warn(STATIC.WHITEBOARD, action.payload.id.toString())
        _setPageData.whiteboardId = action.payload.id.toString()
      } else {
        // console.warn(STATIC.PPT, action.payload.id.toString())
        _setPageData.pptId = action.payload.id.toString()
      }
      return _setPageData
    // 更新模式
    case TYPES.UPDATE_ROOM_MODE:
      state.mode = action.payload
    // return state
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
    case TYPES.UPDATE_PPT_DATA:
      if (action.payload.data) {
        state = action.payload.data
      }
      return state
    default:
      return state
  }
}
// PPT数据更新
export const WHITEBOARD = (state = _STATE.WHITEBOARD, action) => {
  switch (action.type) {
    case TYPES.UPDATE_WHITEBOARD_DATA:
      if (action.payload.data) {
        state[action.payload.data.id.toString()] = action.payload.data
      }
      return state
    default:
      return state
  }
}
// 历史操作
export const history = (state = _STATE.history, action) => {
  switch (action.type) {
    // 创建数据结构
    case TYPES.WHITEBOARD_HISTORY_ADD_BRANCH:
      if(!action.payload.mode) {
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
      state[action.payload.mode][action.payload.currentPage]['forward'].push(action.payload.data)
      console.error("state forstate=======>", state)
      return state
    // 真实后退
    case TYPES.WHITEBOARD_HISTORY_BACKWARE_ACTION:
      state[action.payload.mode][action.payload.currentPage]['backward'].push(action.payload.data)
      console.error("state backstate======>",state)
      return state
    // 清空当前历史分支
    case TYPES.WHITEBOARD_HISTORY_CLEAN_ACTION:
      if (state[action.payload.mode]) {
        if (state[action.payload.mode][action.payload.currentPage]) {
          state[action.payload.mode][action.payload.currentPage] = {}
          state[action.payload.mode][action.payload.currentPage]['forward'] = []
          state[action.payload.mode][action.payload.currentPage]['backward'] = []
          console.error("state cleanstate======>",state)
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
      if (state.whiteboard[action.payload.id]) {
        delete state[STATIC.WHITEBOARD][action.payload.data.id.toString()]
      }
      return Object.assign({}, state)
    // 新增PPT => { 1: {}, 2: {} ...}
    case TYPES.ADD_DRAW_PPT:
      // let _page = {}
      // _page[action.payload.id] = action.payload
      state[STATIC.PPT][action.payload.data.id.toString()] = {}
      return Object.assign({}, state)
    // 更新当前页涂鸦数据
    case TYPES.UPDATE_PAGE_DRAW_DATA:
      // WHITEBOARD[画板]
      if (action.payload.mode === STATIC.WHITEBOARD) {
        // if (!state[STATIC.WHITEBOARD][action.payload.page]) {
        //   // state[STATIC.WHITEBOARD][action.payload.page] = {}
        // }
        // console.error("============---------==",action.payload.data)
        if(!action.payload.data.cid){
          state[STATIC.WHITEBOARD][action.payload.page] = {}
        } else {
          // if(action.payload.data.t === '19'){
          //   action.payload.data.t = action.payload.data.tid
          // }
          state[STATIC.WHITEBOARD][action.payload.page][action.payload.data.cid] = action.payload.data
        }
      } 
      // PPT[课件]
      else if (action.payload.mode === STATIC.PPT) {
        // if (!state[STATIC.PPT][action.payload.page]) {
        //   state[STATIC.PPT][action.payload.page] = {}
        // }
        if (action.payload.type && action.payload.type === "UPDATE") {
          state[STATIC.PPT] = action.payload.data
        } else {
          if (action.payload.scale) {
            state[STATIC.PPT][action.payload.page]['scale'] = action.payload.scale
          } else {
            if (!action.payload.data.cid) {
              state[STATIC.PPT][action.payload.page] = {}
            } else {
              state[STATIC.PPT][action.payload.page][action.payload.data.cid] = action.payload.data
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
      return Object.assign({}, state, {
        pageIndex: _index,
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
      state.pageIndex ++
      if (state.pageIndex > state.pageComputed.length - 1) {
        state.pageIndex = state.pageComputed.length - 1
      }
      var _PAGE_ASSIGN = tools.pageSplit(state.pageComputed[state.pageIndex])
      return Object.assign({}, state, _PAGE_ASSIGN)
    // PREV
    case TYPES.PAGE_PREV:
      state.pageIndex --
      if (state.pageIndex < 0) {
        state.pageIndex = 0
      }
      var _PAGE_ASSIGN = tools.pageSplit(state.pageComputed[state.pageIndex])
      return Object.assign({}, state, _PAGE_ASSIGN)
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
        pageAmount: state.pageIndexs.length,//parseInt(action.payload.data.pageAmount) || state.pageAmount,
        pageIndexs: action.payload.data.pageIndexs || state.pageIndexs,
        pages: action.payload.data.pages || state.pages || {},
        pageIndex: _index || action.payload.data.pageIndex || state.pageIndex,
        pageSubIndex: action.payload.data.pageSubIndex || state.pageSubIndex,
        whiteboardPages: action.payload.data.whiteboardPages || state.whiteboardPages,
        // pptPages: action.payload.data.pptPages || state.pptPages,
        pageComputed: action.payload.data.pageComputed || state.pageComputed,
        action: action.payload.data.action || state.action
      })
    default:
      return state
  }
}
// 操作类
export const operation = (state = baseData.state.operation, action) => {
  switch (action.type) {
    case TYPES.WHITEBOARD_BRUSH_OPERATE:
      var _op = {}
      if (action.payload === STATIC.ERASE) {
        return Object.assign(_op, state, {
          earse: true
        })
      }
      else if (action.payload === STATIC.ERASE_ALL) {
        return Object.assign(_op, state, {
          earseAll: true
        })
      }
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
    default:
      return state
  }
}
// ### end ###
