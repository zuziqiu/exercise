import state from './state'
/**
 * getters
 */
export default {
  // global
  getGlobal() {
    return state.global
  },
  getCurMode() {
    if (state.global.curMode == '0') {
      return 'TECH'
    } else {
      return 'DESKTOP'
    }
  },
  // 直播状态
  getLiveState () {
    return state.global.liveState
  },
  // whiteboard
  getWhiteboard () {
    return state.whiteboard
  },
  // fullscreen
  getFullScreen() {
    return state.player.isFullScreen
  },
  // loopMode
  getLoopMode () {
    return state.global.loopMode
  },
  // token
  getToken() {
    return state.token
  },
  // init data
  getInitData() {
    return state.global.data
  },
  // techorder
  getTechOrder() {
    return state.player.techOrder
  },
  // player
  getPlayer () {
    return state.player
  },
  // live data
  getLiveData () {
    return state.global.liveData
  },
  // get ext data
  getExtData () {
    return state.extConfig
  }
}