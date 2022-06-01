/**
 * wbEmitter 事件绑定
 */
// import Emittery from '../vendor/emittery'
import EventEmitter from 'events'
import * as tools from './util'
class wbEmitter {
  constructor() {
    this.wbEmitter = new EventEmitter()
    this.wbEmitter.setMaxListeners(100)
  }

  on(key, handler) {
    tools.log('Register ==>', key)
    this.wbEmitter.on(key, handler)
  }
  emit(key, value, callback) {
    tools.log('emit ==>', key, value)
    this.wbEmitter.emit(key, { payload: value, callback: callback })
  }
  once(key) {
    return this.wbEmitter.once(key)
  }
  off(key, callback) {
    this.wbEmitter.off(key, callback)
  }
  clear() {
    this.wbEmitter.clearListeners()
  }
}
export default new wbEmitter()