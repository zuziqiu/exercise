/**
 * 图形公共类
 */
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState'
// import { history } from '../core/history'
import wbEmitter from '../extensions/wbEmitter'
// parent class
export class graphicBase {
  constructor() {
    this.fabric = globalStore.fabric
    this.store = globalStore.store
    this.TYPES = TYPES
    this.tools = tools
    this.STATIC = STATIC
  }
  // 默认设置
  defaultSetting(klssObject) {
    if (typeof (klssObject) === 'object') {
      klssObject.fill = this.store.wbProperty.strokeColor
      klssObject.stroke = this.store.wbProperty.strokeColor
      klssObject.strokeLineCap = this.store.wbProperty.strokeLineCap
      klssObject.strokeWidth = this.store.wbProperty.strokeWidth
      klssObject.selectable = false
      klssObject.selection = false
      klssObject.hasborder = false
    }
    return klssObject
  }
  // 获取drawID
  getId() {
    return globalStore.getId()
  }
  // 生成序列化模版
  cmdTpl() {
    let baseTpl = tools.getCmdTpl()
    return baseTpl
  }
  // 发送数据
  flush(cdata, ward = '', savehistory = true) {
    // 发送到Qt
    globalStore.getCommandApi() && globalStore.getCommandApi().sendToQt(cdata)
    wbEmitter.emit('draw:data', cdata)
    // tools.log('flush ==>', cdata)
    // 保存到历史数据(激光笔会传入false,它的移动轨迹不需要保存到历史)
    if (savehistory) {
      // history.save(cdata, ward)
      tools.log('draw save ==>', cdata)
      let MODE = tools.isWhiteboard(cdata.p) ? STATIC.WHITEBOARD : STATIC.PPT
      // 保存数据
      globalStore.actions.dispatch('pageDrawData', {
        type: TYPES.UPDATE_PAGE_DRAW_DATA,
        payload: {
          mode: MODE,
          page: cdata.p.toString(),
          data: cdata
        }
      })
    }
  }
}