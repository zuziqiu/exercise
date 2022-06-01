/**
 * 图形公共类
 */
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState'
import { History } from '../core/history'
import emitter from '../extensions/emitter'
// parent class
export class graphicBase {
  constructor () {
    this.fabric = globalStore.fabric
    this.props = globalStore.reducerStore.getState()
    this.store = globalStore.reducerStore
    this.TYPES = TYPES
    this.tools = tools
    this.STATIC = STATIC
    this.history = new History()
  }
  // 默认设置
  defaultSetting (klssObject) {
    if (typeof (klssObject) === 'object') {
      klssObject.fill = this.store.getState().whiteboard.strokeColor
      klssObject.stroke = this.store.getState().whiteboard.strokeColor
      klssObject.strokeLineCap = this.store.getState().whiteboard.strokeLineCap
      klssObject.strokeWidth = this.store.getState().whiteboard.strokeWidth
      klssObject.selectable = false
      klssObject.selection = false
      klssObject.hasborder = false
    }
    return klssObject
  }
  // 获取drawID
  getId () {
    return globalStore.getId()
  }
  // 生成序列化模版
  cmdTpl () {
   let baseTpl = tools.getCmdTpl()
    return baseTpl
  }
  // 发送数据
  flush (cdata, ward = '', saveHistory = true) {
    // 发送到Qt
    globalStore.getQt() && globalStore.getQt().sendToQt(cdata)
    emitter.emit('draw:data', cdata)
    // tools.log('flush ==>', cdata)
    // 保存到历史数据(激光笔会传入false,它的移动轨迹不需要保存到历史)
    if (saveHistory) {
      this.history.save(cdata, ward)
    }
  }
}