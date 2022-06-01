/**
 * dottedLine 虚线
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
export class DottedLine extends graphicBase {
  constructor ({data}) {
    super()
    this.onPress = false
    if(data){
      this.render(data)
    }
  }
  // 发送数据
  flush (data) {
    let sdata = this.toSerializable(data)
    super.flush(sdata)
  }
  // 默认设置
  defaultSetting () {
    super.defaultSetting(this.Line)
  }
  // 发送给远端
  toServer () {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata (line) {
    let c = []
    let whiteboard = this.store.getState().whiteboard
    let cdata = {
      id: line.id,
      visible: 1,
      x1: line.x1.toFixed(0),
      y1: line.y1.toFixed(0),
      x2: line.x2.toFixed(0),
      y2: line.y2.toFixed(0),
      strokeWidth: whiteboard.strokeWidth,
      color: this.tools.color(whiteboard.strokeColor),
      opacity: whiteboard.strokeOpacity
    }
    Object.keys(cdata).map((key) => {
      c.push(cdata[key])
    })
    return c.join('|')
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
    cmd.p = this.store.getState().page.currentPage || baseTpl.p
    cmd.t = STATIC.DOTTED_LINE
    cmd.tid = STATIC.DOTTED_LINE
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
      //实线的显示长度
      let linkPartOne = 8 + parseInt(data.c.strokeWidth);
      //虚线的显示长度
      let linkPartTwo = 2 + parseInt(data.c.strokeWidth) * 3;
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
        hex: data.klss ? data.klss.hex : data.c.color,
        opacity: data.c.opacity,
        strokeDashArray: [linkPartOne, linkPartTwo],
        visible: data.c.visible == '0'?false:true,
        tid: this.STATIC.DOTTED_LINE
      })
    } else {
      //虚线中显示的实线长度
      let linkPartOne = 8 + parseInt(this.store.getState().whiteboard.strokeWidth);
      //虚线中显示的间隔长度
      let linkPartTwo = 2 + parseInt(this.store.getState().whiteboard.strokeWidth) * 3;
      let curUserId = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : 'me'
      // mouseDown 取数据渲染
      this.Line.set({
        x1: this.firstPoint.X,
        y1: this.firstPoint.Y,
        x2: this.firstPoint.X,
        y2: this.firstPoint.Y,
        id: curUserId + '_' + new Date().getTime()  + '_' + 'd' + this.store.getState().drawId,
        nid: this.store.getState().drawId,
        xid: this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : '',
        hex: this.tools.color(this.store.getState().whiteboard.strokeColor),
        opacity: this.store.getState().whiteboard.strokeOpacity,
        strokeDashArray: [linkPartOne, linkPartTwo],
        tid: this.STATIC.DOTTED_LINE
      })
    }
    this.fabric.add(this.Line)
  }
  // 渲染
  render (data) {
    let renderData = Object.assign({}, data)
    renderData.c = this.tools.CdataToObject(data.c)
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
  // up
  mouseUp () {
    // px > 10
    if (Math.abs(this.Line.y2 - this.Line.y1) > 10 || Math.abs(this.Line.x2 - this.Line.x1) > 10) {
      this.flush(this.Line)
      super.getId()
    } else {
      this.tools.removeKlss(this.Line.id)
    }
    this.onPress = false
    this.Line = null
  }
}