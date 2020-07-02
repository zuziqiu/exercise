/**
 * ## 全局 Reducer(state) 状态管理入口
 * ## 函数要与 ./states/baseState.js 里面全部数据对应
 * Reducer 规则 
 * { 
 *  action.type, 类型参数
 *  action.payload 参数
 * }
 */
import * as baseData from '../states/baseData'
// state
export const counter = (state = baseData.state.counter, action) => {
  switch (action.type) {
    case 'add':
      return state += 1
    case 'remove':
      return state -= 1
    default:
      return state
  }
}

export const prepare = (state = baseData.state.prepare, action) => {
  switch (action.type) {
    case 'prepare':
      return Object.assign({}, state)
    default:
      return state
  }
}


