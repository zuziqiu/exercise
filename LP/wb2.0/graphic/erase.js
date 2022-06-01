/**
 * Erase 删除图形
 */
import { graphicBase } from './graphicCom'
import { globalStore } from '../states/globalStore'
import { History } from '../core/history'
import { Curve } from './curve'
import emitter from '../extensions/emitter'
import { graphicTempObject } from '../core/graphicTempObject'
export class Erase extends graphicBase {
  constructor({ data, isClearAll }) {
    super()
    // 清空全部涂鸦
    if (isClearAll) {
      // 切换brush，否则死循环
      this.store.dispatch({
        type: this.TYPES.WHITEBOARD_BRUSH_TYPE,
        payload: "erase"
      })
      this.tools.removeKlss()
      this.flush({
        "x": this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : '',
        "st": "",
        "c": "",
        "n": "",
        "p": this.store.getState().page.currentPage,
        "t": 1
      }, 'eraseAll')
      // 擦除全部时强制重置当前聚焦的文字（假如有）
      graphicTempObject.currentFocusTextId = ''
    }
    // 单条清除(初始化选择的Klss)
    else {
      this.initSelectKlss()
    }
  }
  // To learn => http://fabricjs.com/v2-breaking-changes-2
  initSelectKlss() {
    // 选中全部klss
    let klss = this.fabric.getObjects()
    // 返回一个对象（相当于传入klss的合集的对象）
    let klssObj = new fabric.ActiveSelection(klss, {
      canvas: this.fabric
    })
    // klssObj.selectable = false
    this.fabric.setActiveObject(klssObj) // 聚焦到该对象，一次性设置可选状态，相当于临时改变selectable（注意：打印该属性时看不到改变）,失焦后恢复selectable原状态
    this.fabric.discardActiveObject(klssObj) // 释放当前活动对象
    // set klss object selectable
    this.tools.disableKlssSelectable(klssObj, true)
    // set static canvas
    this.fabric.set({
      selectable: false,
      selection: false,
      hasControls: false,
      hasRotatingPoint: false,
      hasBorders: false
    })
    // this.fabric.renderAll()
    klss.map((k) => {
      this.modifySelector(k)
    })
    // render
    this.fabric.requestRenderAll() //?
    this.fabric.renderAll()
  }
  // 选中klss
  modifySelector(klss) {
    this.tools.disableKlssSelectable(klss)
  }
  toCdata(klss, type) {
    let c = []
    let whiteboard = this.store.getState().whiteboard
    let cdata = {}
    // 转换klss => cdata
    if (klss.tid === this.STATIC.CURVE) {
      //{"c":"d6|16711680|6|1|M,461.6,558,L,461.6,559,C,486.2,584.7,490.3,592.9,L,494.4,601.1|1"}
      let _pathData = klss.path
      let curve = new Curve({})
      cdata.postCdata = {
        // nid: klss.id,
        id: klss.id,
        color: 0,
        strokeWidth: 0,
        visible: 0,
        pathData: 'M,0,0,L,0,0',
        opacity: 0
      }
      cdata.saveCdata = {
        id: klss.id,//"d" + klss.nid,
        color: klss.hex,
        strokeWidth: whiteboard.strokeWidth,
        visible: 0,
        pathData: curve.serialize(_pathData),
        opacity: whiteboard.strokeOpacity
      }
      // return this.tools.objectToCdata(cdata)
    } else if (klss.tid === this.STATIC.LINE || klss.tid === this.STATIC.DOTTED_LINE) {
      cdata.postCdata = {
        id: klss.id,
        visible: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        strokeWidth: 0,
        color: 0,
        opacity: 0
      }
      cdata.saveCdata = {
        id: klss.id,
        visible: 0,
        x1: klss.x1.toFixed(0),
        y1: klss.y1.toFixed(0),
        x2: klss.x2.toFixed(0),
        y2: klss.y2.toFixed(0),
        strokeWidth: whiteboard.strokeWidth,
        color: klss.hex,
        opacity: whiteboard.strokeOpacity
      }
    } else if (klss.tid === this.STATIC.RECTANGLE || klss.tid === this.STATIC.CIRCLE || this.STATIC.TRIANGLE) {
      cdata.postCdata = {
        id: klss.id,
        visible: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        strokeWidth: 0,
        color: 0,
        opacity: 0
      }
      cdata.saveCdata = {
        id: klss.id,
        visible: 0,
        x1: klss.left.toFixed(0),
        y1: klss.top.toFixed(0),
        x2: (klss.left + klss.width).toFixed(0),
        y2: (klss.top + klss.height).toFixed(0),
        strokeWidth: whiteboard.strokeWidth,
        color: klss.hex,
        opacity: whiteboard.strokeOpacity
      }
    } else if (klss.tid === this.STATIC.IMAGE) {
      // id: image.id,
      // src: image.getSrc(),
      // visible: image.visible ? 1 : 0,
      // optType: image.optType,
      // matrix: '1,0,0,1,' + image.left.toFixed(2) + ',' + image.top.toFixed(2)
      cdata.postCdata = {
        id: klss.id,
        src: klss.getSrc(),
        visible: 0,
        optType: 1,
        matrix: '1,0,0,1,' + klss.left.toFixed(2) + ',' + klss.top.toFixed(2)
      }
      cdata.saveCdata = {
        id: klss.id,
        src: klss.getSrc(),
        visible: 0,
        optType: 1,
        matrix: '1,0,0,1,' + klss.left.toFixed(2) + ',' + klss.top.toFixed(2)
      }
    } else if (klss.tid === this.STATIC.TEXT) {
      cdata.postCdata = {
        id: klss.id,
        text: escape(klss.text),
        color: 0,
        fontSize: klss.fontSize,
        visible: 0,
        optType: klss.optType,
        matrix: '1,0,0,1,' + klss.left + ',' + klss.top,
        isEncode: 0
      }
      cdata.saveCdata = {
        id: klss.id,
        text: escape(klss.text),
        color: klss.hex,
        fontSize: klss.fontSize,
        visible: 0,
        optType: klss.optType,
        matrix: '1,0,0,1,' + klss.left + ',' + klss.top,
        isEncode: 0
      }
    }
    if (type === 'post') {
      return this.tools.objectToCdata(cdata.postCdata)
    }
    if (type === 'save') {
      return this.tools.objectToCdata(cdata.saveCdata)
    }
  }
  // 序列化数据
  toSerializable(klss, type) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = klss.nid || baseTpl.n
    cmd.cid = klss.id
    cmd.hd = baseTpl.hd
    cmd.p = this.store.getState().page.currentPage || baseTpl.p
    cmd.t = klss.tid
    cmd.tid = klss.tid
    cmd.klss = klss
    cmd._type = klss.type
    cmd.c = this.toCdata(klss, type)
    return cmd
  }
  // curUser
  curUser(xid) {
    let _curUser = this.store.getState().room.curUser
    // curUser 为null时即为纯画板
    if (!this.store.getState().room.curUser) return true
    if (_curUser.role === 'admin' || _curUser.role === 'spadmin' || _curUser.role === "jiabin") {
      return true
    } else if (_curUser.role === 'user' && parseInt(xid) === parseInt(_curUser.xid)) {
      return true
    }
  }
  // 选中
  onSelectionCreated(data) {
    // ## 必须选中ID才能删除
    if (data.target && data.target.id) {
      if (this.curUser(data.target.xid)) {
        this.tools.log('Delete ==>', data)
        this.tools.setKlssVisiable(data.target.id, false)
        // 发送到服务器的数据，各类清0
        let postCdata = this.toSerializable(data.target, 'post')
        // 保存到本地的数据用于回退，保持各类数据
        let saveCdata = this.toSerializable(data.target, 'save')
        // 释放当前活动对象(如果不释放的话，下次的select:create的监听极大概率不会触发)
        this.fabric.discardActiveObject(data.target) // discardActiveObject()取消当前选中对象 
        // this.tools.removeKlss(data.target.id, data.target.type)
        this.fabric.renderAll()
        let Qt = globalStore.getQt()
        Qt.sendToQt(postCdata)
        let history = new History()
        history.save(saveCdata)
        emitter.emit('draw:data', postCdata)
      }
    }
  }
  // down
  mouseDown(data) {
  }
  // 选中后
  mouseUp(data) {
  }
}