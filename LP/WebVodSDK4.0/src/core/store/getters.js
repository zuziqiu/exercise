import state from './state'
/**
 * getters
 */
export default {
  // token
  getToken() {
    return state.token
  },
  // init data
  getInitData() {
    return state.global.data
  },
  // player
  getPlayer() {
    return state.player
  },
  getExtData () {
    return state.extConfig
  }
}