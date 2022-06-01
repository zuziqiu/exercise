/**
 * Rectangle 矩形
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
export class Rectangle extends graphicBase {
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
  defaultSetting (rectangle) {
    return super.defaultSetting(rectangle)
  }
  // 发送给远端
  toServer () {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata (rectangle) {
    let c = []
    let wbProperty = this.store.wbProperty
    // c: "1545127458_55289826|1|285.6|931.5|1114.4|230.1|5.6|13461961|1"
    let cdata = {
      id: rectangle.id,
      visible: 1,
      x1: rectangle.left.toFixed(0),
      y1: rectangle.top.toFixed(0),
      x2: (rectangle.left + rectangle.width).toFixed(0),
      y2: (rectangle.top + rectangle.height).toFixed(0),
      strokeWidth: wbProperty.strokeWidth,
      color: this.tools.color(wbProperty.strokeColor),
      opacity: wbProperty.strokeOpacity
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
    cmd.p = this.store.page.currentPage || baseTpl.p
    cmd.t = STATIC.RECTANGLE
    cmd.c = this.toCdata(klss)
    cmd._type = 'rect'
    cmd.klss = klss
    return cmd
  }
  // 建立
  createKlss (data) {
    this.tools.log("data==>", data)
    this.Rectangle = new fabric.Rect()

    // fabric object set attribute
    let Rectangle = this.defaultSetting(this.Rectangle)
    Rectangle.fill = 'transparent'
    // data ==> 从pageData中取回对象渲染
    if(data){
      this.Rectangle.set({
        left: parseInt(data.c.x1),
        top: parseInt(data.c.y1),
        width: Math.abs(parseInt(data.c.x2) - parseInt(data.c.x1)),
        height: Math.abs(parseInt(data.c.y2) - parseInt(data.c.y1)),
        id: data.c.id,
        nid: data.n,
        xid: data.x ? parseInt(data.x) : data.xid,
        stroke: this.tools.color(data.c.color),
        strokeWidth: parseInt(data.c.strokeWidth),
        hex: data.klss ? data.klss.hex : data.c.color,
        opacity: data.c.opacity,
        visible: data.c.visible == '0'?false:true,
        tid: this.STATIC.RECTANGLE
      })
    } else {
      let curUserId = this.store.room.curUser ? this.store.room.curUser.xid : 'me'
      // mouseDown 取数据渲染
      this.Rectangle.set({
        left: this.firstPoint.X,
        top: this.firstPoint.Y,
        id: curUserId + '_' + new Date().getTime()  + '_' + 'r' + this.store.room.drawId,
        nid: this.store.room.drawId,
        xid: this.store.room.curUser ? this.store.room.curUser.xid : '',
        hex: this.tools.color(this.store.wbProperty.strokeColor),
        opacity: this.store.wbProperty.strokeOpacity,
        tid: this.STATIC.RECTANGLE
      })
    }
    this.fabric.add(this.Rectangle)
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
      if(this.firstPoint.X>p.x){
          this.Rectangle.set({ left: Math.abs(p.x) });
      }
      if(this.firstPoint.Y>p.y){
          this.Rectangle.set({ top: Math.abs(p.y) });
      }
      this.Rectangle.set({ width: Math.abs(this.firstPoint.X- p.x) });
      this.Rectangle.set({ height: Math.abs(this.firstPoint.Y - p.y) });
      this.fabric.renderAll()
    }
  }
  // up
  mouseUp () {
    // px >= 10
    if (this.Rectangle.width >= 10 || this.Rectangle.height >=10) {
      this.flush(this.Rectangle)
      super.getId()
    } else {
      this.tools.removeKlss(this.Rectangle.id)
    }
    this.onPress = false
    this.Rectangle = null
  }
}