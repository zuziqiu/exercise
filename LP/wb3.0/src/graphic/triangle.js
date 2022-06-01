/**
 * Triangle 三角形
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'

export class Triangle extends graphicBase {
  constructor({ data }) {
    super()
    this.onPress = false
    if (data) {
      this.render(data)
    }
  }
  // 发送数据
  flush(data) {
    let cdata = this.toSerializable(data)
    this.tools.log('triangle flush...', cdata)
    super.flush(cdata)
  }
  // 默认设置
  defaultSetting(triangle) {
    super.defaultSetting(triangle)
  }
  // 产出'c'数据
  toCdata(triangle) {
    let wbProperty = this.store.wbProperty
    let cdata = {
      id: triangle.id,
      visible: triangle.visible ? 1 : 0,
      x1: triangle.left.toFixed(0),
      y1: triangle.top.toFixed(0),
      x2: triangle.lastX.toFixed(0),
      y2: triangle.lastY.toFixed(0),
      strokeWidth: wbProperty.strokeWidth,
      color: this.tools.color(wbProperty.strokeColor),
      opacity: wbProperty.strokeOpacity
    }
    return this.tools.objectToCdata(cdata)
  }
  // 序列化数据
  toSerializable(klss) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = klss.nid || baseTpl.n
    cmd.cid = klss.id
    cmd.hd = baseTpl.hd
    cmd.p = this.store.page.currentPage || baseTpl.p
    cmd.t = STATIC.TRIANGLE
    cmd.c = this.toCdata(klss)
    cmd._type = 'triangle'
    cmd.klss = klss
    return cmd
  }
  // 建立
  createKlss(data) {
    this.tools.log('data==>', data)
    this.Triangle = new fabric.Triangle()
    // fabric object set attribute
    this.defaultSetting(this.Triangle)
    this.Triangle.set({
      fill: 'rgba(0,0,0,0)',
      originX: 'center',
      originY: 'center'
    })
    // data ==> 从pageData中取回对象渲染
    if (data) {
      this.Triangle.set({
        left: parseInt(data.c.x1),
        top: parseInt(data.c.y1),
        width: Math.abs(parseInt(data.c.x2) - parseInt(data.c.x1)) * 2,
        height: Math.abs(parseInt(data.c.y2) - parseInt(data.c.y1)) * 2,
        id: data.c.id,
        nid: data.n,
        xid: data.x ? parseInt(data.x) : data.xid,
        stroke: this.tools.color(data.c.color),
        strokeWidth: parseInt(data.c.strokeWidth),
        hex: data.klss && data.klss.hex ? data.klss.hex : data.c.color,
        opacity: data.c.opacity,
        visible: data.c.visible == '0' ? false : true,
        tid: STATIC.TRIANGLE
      })
    } else {
      // mouseDown 取数据渲染
      let curUserId = this.store.room.curUser?.xid || 'me'
      this.Triangle.set({
        width: 1,
        height: 1,
        id: `${curUserId}_${new Date().getTime()}_a${this.store.room.drawId}`,
        nid: this.store.room.drawId,
        xid: this.store.room.curUser?.xid || '',
        hex: this.tools.color(this.store.wbProperty.strokeColor),
        opacity: this.store.wbProperty.strokeOpacity,
        tid: STATIC.TRIANGLE
      })
    }
    this.fabric.add(this.Triangle)
  }
  // 渲染
  render(data) {
    let renderData = Object.assign({}, data)
    renderData.c = this.tools.CdataToObject(data.c, data.t)
    this.createKlss(renderData)
  }
  // down
  mouseDown(data) {
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
  mouseMove(data) {
    if (this.onPress) {
      let p = data.pointer
      this.Triangle.set({ left: this.firstPoint.X })
      this.Triangle.set({ top: this.firstPoint.Y })
      this.Triangle.set({ lastX: p.x })
      this.Triangle.set({ lastY: p.y })
      this.Triangle.set({ width: Math.abs(this.firstPoint.X - p.x) * 2 })
      this.Triangle.set({ height: Math.abs(this.firstPoint.Y - p.y) * 2 })
      this.fabric.renderAll()
    }
  }
  // up
  mouseUp() {
    // px >= 10
    if (this.Triangle.width >= 10 || this.Triangle.height >= 10) {
      this.flush(this.Triangle)
      super.getId()
    } else {
      this.tools.removeKlss(this.Triangle.id)
    }
    this.onPress = false
    this.Triangle = null
  }
}
