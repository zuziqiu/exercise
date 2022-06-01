/**
 * Line 直线
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
export class Line extends graphicBase {
  constructor ({data}) {
    super()
    this.onPress = false
    this.Line = null
    if(data){
      this.render(data)
    }
  }
  // 发送数据
  flush (data) {
    let cdata = this.toSerializable(data)
    this.tools.log('line flush...', cdata)
    super.flush(cdata)
  }
  // 默认设置
  defaultSetting (line) {
    super.defaultSetting(line)
  }
  // 产出'c'数据
  toCdata (line) {
    let wbProperty = this.store.wbProperty
    let cdata = {
      id: line.id,
      visible: line.visible ? 1 : 0,
      x1: line.x1.toFixed(0),
      y1: line.y1.toFixed(0),
      x2: line.x2.toFixed(0),
      y2: line.y2.toFixed(0),
      strokeWidth: wbProperty.strokeWidth,
      color: this.tools.color(wbProperty.strokeColor),
      opacity: wbProperty.strokeOpacity
    }
    return this.tools.objectToCdata(cdata)
  }
  // 序列化数据
  toSerializable (klss) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = klss.nid || baseTpl.n
    cmd.cid = klss.id
    cmd.hd = baseTpl.hd
    cmd.p = this.store.page.currentPage || baseTpl.p
    cmd.t = STATIC.LINE
    cmd.c = this.toCdata(klss)
    cmd._type = 'line'
    cmd.klss = klss
    return cmd
  }
  // 建立
  createKlss (data) {
    this.tools.log("data==>", data)
    this.Line = new fabric.Line()

    // fabric object set attribute
    let Line = this.defaultSetting(this.Line)
    // data ==> 从pageData中取回对象渲染
    if(data){
      this.Line.set({
        x1: parseInt(data.c.x1),
        y1: parseInt(data.c.y1),
        x2: parseInt(data.c.x2),
        y2: parseInt(data.c.y2),
        id: data.c.id,
        nid: data.n,
        xid: data.x ? parseInt(data.x) : data.xid,
        stroke: this.tools.color(data.c.color),
        strokeWidth: parseInt(data.c.strokeWidth),
        hex: data.klss && data.klss.hex ? data.klss.hex : data.c.color,
        opacity: data.c.opacity,
        visible: data.c.visible == '0'?false:true,
        tid: STATIC.LINE
      })
    } else {
      // mouseDown 取数据渲染
      let curUserId = this.store.room.curUser ? this.store.room.curUser.xid : 'me'
      this.Line.set({
        x1: this.firstPoint.X,
        y1: this.firstPoint.Y,
        x2: this.firstPoint.X,
        y2: this.firstPoint.Y,
        id: curUserId + '_' + new Date().getTime()  + '_' + 'l' + this.store.room.drawId,
        nid: this.store.room.drawId,
        xid: this.store.room.curUser ? this.store.room.curUser.xid : '',
        hex: this.tools.color(this.store.wbProperty.strokeColor),
        opacity: this.store.wbProperty.strokeOpacity,
        tid: STATIC.LINE
      })
    }
    this.fabric.add(this.Line)
  }
  // 渲染
  render (data) {
    let renderData = Object.assign({}, data)
    renderData.c = this.tools.CdataToObject(data.c, data.t)
    this.createKlss(renderData)
  }
  // down
  mouseDown (data) {
    if (!this.onPress) {
      let p = data.pointer
      this.firstPoint = {}
      this.firstPoint.X = p.x
      this.firstPoint.Y = p.y
      this.createKlss()
      this.onPress = true
    }
  }
  // move
  mouseMove (data) {
    if (this.onPress) {
      let p = data.pointer
      this.Line.set({
        x2: p.x,
        y2: p.y
      })
      this.fabric.renderAll()
    }
  }
  mouseUp () {
    let _line = this.Line
    if (Math.abs(_line.y2 - _line.y1) > 10 || Math.abs(_line.x2 - _line.x1) > 10) {
      this.flush(_line)
      super.getId()
    } else {
      this.tools.removeKlss(_line.id)
    }
    this.onPress = false
    this.Line = null
  }
}
