import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'
export class animatePPTAction {
  constructor(store) {
    this.store = store.animatePPT
  }
  dispatch(action) {
    this.animatePPT(this.store, action)
  }
  // 动态PPT
  @action animatePPT(state, action) {
    switch (action.type) {
      // setpage 更新基础信息
      case TYPES.LIVE_SET_PAGE:
        // 判断白板，动态PPT会被销毁，必须重置状态，否之重新加载成功的时候状态没有变化
        if (tools.isWhiteboard(action.payload.pageIndex)) {
          state.state = 'wait'
        } else {
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
            }
          } else {
            var _index = 0
            if (state.pageComputed && state.pageComputed.length > 0) {
              // if (tools.isWhiteboard(action.payload.pageIndex)) {
              //   _index = state.pageComputed.indexOf(action.payload.pageIndex.toString())
              // } else {
              _index = state.pageComputed.indexOf(action.payload.pageIndex + '_' + action.payload.subIndex)
              // }
              // if (_index < 0) {
              //   _index = 0
              // }
            }
            state.pageIndex = _index
          }
        }
        break;
      // 更新 ppt 状态
      case TYPES.UPDATE_ANIMATION_PPT_STATE:
        state.state = action.payload
        break;
      // 更新url地址
      case TYPES.UPDATE_ANIMATION_PPT_URL:
        state.h5PPTUrl = null
        break;
      // 更新ifr ==> 数据
      case TYPES.UPDATE_ANIMATION_PPT_DATA:
        let pptObj = action.payload
        state.state = pptObj.state
        state.pageComputed = pptObj.pagesAry
        state.curPage = pptObj.curPage
        state.curStep = pptObj.curStep
        state.pageAmount = pptObj.pagesAry.length
        state.stepTotal = pptObj.curPageSteps
        break;
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
        break;
      // NEXT
      case TYPES.PAGE_NEXT:
        if (state.pptType) {
          state.pageIndex++
          let total = state.pageComputed.length - 1
          if (state.pageIndex >= total) {
            state.pageIndex = total
          }
        }
        break;
      // PREV
      case TYPES.PAGE_PREV:
        if (state.pptType) {
          state.pageIndex--
          if (state.pageIndex <= 0) {
            state.pageIndex = 0
          }
        }
        break;
      // 更改PPT类型
      case TYPES.UPDATE_PPT_TYPE:
        state.pptType = action.payload
        break;
      // 更新PPT pageIndex
      // case TYPES.UPDATE_PPT_PAGEINDEX:
        // state.pageIndex = action.payload.pageIndex
      default:
        state = state
    }
  }
}