import { watch, unwatch } from 'watch-object'
import state from './state'
import mutations from './mutations'
import tools from '../../common/utils/tools'
import getters from './getters'
import * as TYPES from './types'
import actions from './actions'
/**
 * # 后期改为 Proxy => 
 * # 目前老版本直播器需支持 chrome 30+ 所以建议先监听一层
 */
const store = {
  listener: {}, //监听事件队列
  init() {
    tools.debug('Store init done ==>', state)
    // 监听
    this.observe()
  },
  // 外部监听
  listen(type, callback) {
    if (type && callback) {
      this.listener[type] = callback
    }
  },
  // getters
  getters(type) {
    if (typeof getters[type] === 'function') {
      return getters[type]()
    } else {
      return null
    }
  },
  // state
  state() {
    return state
  },
  //  dispatch
  dispatch(type, payload) {
    return actions.dispatch.apply(actions, arguments)
  },
  // commit
  commit(type, payload) {
    return mutations.commit.apply(mutations, arguments)
  },
  // 监听
  observe() {
    watch(state, 'token', (newv, oldv) => {
      // console.warn('token', newv) 
    })
    watch(state.global, 'curMode', (newv, oldv) => {
      // console.error('mode==>', oldv, newv)
    })
    watch(state.global, 'data', (newv, oldv) => {
      // console.warn(newv)
    })
    watch(state.player, 'status', (newv, oldv) => {
      // console.warn(oldv, newv)
    })
  }
}

window.__vstore__ = store

export default store

