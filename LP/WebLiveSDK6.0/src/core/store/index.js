import { watch, unwatch } from 'watch-object'
import state from './state'
import mutations from './mutations'
import tools from '../../utils/tools'
import getters from './getters'
import * as TYPES from './types'
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
  state() {
    return state
  },
  // getters
  getters(type) {
    if (typeof getters[type] === 'function') {
      return getters[type]()
    } else {
      return null
    }
  },
  // commit
  commit(type, payload) {
    return mutations.commit.apply(mutations, arguments)
  },
  // 外部监听
  listen(type, callback) {
    if (type && callback) {
      this.listener[type] = callback
    }
  },
  // 监听状态
  observe() {
    // fullscreen
    watch(state.player, 'isFullScreen', (nv, ov) => {
      if (this.listener.fullscreen) {
        this.listener.fullscreen.call(null, nv, ov)
      }
    })
    // token
    watch(state, 'token', (nv, ov) => {
      if (this.listener.token) {
        this.listener.token.call(null, nv, ov)
      }
    })
    watch(state.global, 'curMode', (newv, oldv) => {
    })
    watch(state.global, 'data', (newv, oldv) => {
    })
    watch(state.player, 'status', (newv, oldv) => {
    })
  }
}

export default store

