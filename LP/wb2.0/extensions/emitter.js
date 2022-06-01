/**
 * emitter 事件绑定
 */
// import Emittery from '../vendor/emittery'
import EventEmitter from 'events'
import * as tools from './util'
class emitter  {
  constructor (key, handler) {
    // tools.log('Emittery init...')
    // this.emitter  = new Emittery
    this.emitter = new EventEmitter()
    this.emitter.setMaxListeners(100)
  }
  on (key, handler) {
    tools.log('Register ==>', key)
    this.emitter.on(key, handler)
  }
  emit (key, data) {
    tools.log('emit ==>', key, data)
    this.emitter.emit(key, data)
  }
  once (key) {
    return this.emitter.once(key)
  }
  off (key, handler) {
    this.emitter.off(key, handler)
  }
  clear () {
    this.emitter.clearListeners()
  }
}
export default new emitter()