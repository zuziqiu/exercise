/**
 * Ellipse 椭圆
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
export class Ellipse extends graphicBase {
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
  defaultSetting (ellipse) {
    return super.defaultSetting(ellipse)
  }
  // 发送给远端
  toServer () {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata (ellipse) {
    let c = []
    let wbProperty = this.store.wbProperty
    let cdata = {
      id: ellipse.id,
      visible: 1,
      x1: this.position.X1.toFixed(0),
      y1: this.position.Y1.toFixed(0),
      x2: this.position.X2.toFixed(0),
      y2: this.position.Y2.toFixed(0),
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
    cmd.t = STATIC.ELLIPSE
    cmd.c = this.toCdata(klss)
    cmd._type = 'ellipse'
    cmd.klss = klss
    return cmd
  }
  // 建立
  createKlss (data) {
    this.tools.log("data==>", data)
    this.Ellipse = new fabric.Ellipse()

    // fabric object set attribute
    let Ellipse = this.defaultSetting(this.Ellipse)
    Ellipse.fill = 'transparent'
    // data ==> 从pageData中取回对象渲染
    if(data){
      this.Ellipse.set({
        left: parseInt(data.c.x1),
        top: parseInt(data.c.y1),
        rx: (parseInt(data.c.x2) - parseInt(data.c.x1)) / 2,
        ry: (parseInt(data.c.y2) - parseInt(data.c.y1)) / 2,
        id: data.c.id,
        nid: data.n,
        xid: data.x ? parseInt(data.x) : data.xid,
        stroke: this.tools.color(data.c.color),
        strokeWidth: parseInt(data.c.strokeWidth),
        hex: data.klss ? data.klss.hex : data.c.color,
        opacity: data.c.opacity,
        visible: data.c.visible == '0'?false:true,
        tid: this.STATIC.ELLIPSE
      })
    } else {
      let curUserId = this.store.room.curUser ? this.store.room.curUser.xid : 'me'
      // mouseDown 取数据渲染
      this.Ellipse.set({
        left: this.firstPoint.X,
        top: this.firstPoint.Y,
        id: curUserId + '_' + new Date().getTime()  + '_' + 'c' + this.store.room.drawId,
        nid: this.store.room.drawId,
        xid: this.store.room.curUser ? this.store.room.curUser.xid : '',
        hex: this.tools.color(this.store.wbProperty.strokeColor),
        opacity: this.store.wbProperty.strokeOpacity,
        tid: this.STATIC.ELLIPSE
      })
    }
    this.fabric.add(this.Ellipse)
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
      this.position = {}
      this.firstPoint.X = this.position.X1 = this.position.X2 = p.x
      this.firstPoint.Y = this.position.Y1 = this.position.Y2 = p.y
      this.createKlss()
      this.onPress = true
    }
  }
  // move
  mouseMove (data) {
    if (this.onPress) {
      let p = data.pointer
      if (this.firstPoint.X > p.x) {
        this.position.X1 = p.x
        let offSetX = this.firstPoint.X - p.x
        this.Ellipse.set({
          left: p.x,
          rx: offSetX / 2,
        });
      } else {
        this.position.X2 = p.x
        this.Ellipse.set({
          rx: Math.abs(this.firstPoint.X - p.x)/2,
        })
      }
      if (this.firstPoint.Y > p.y) {
        this.position.Y1 = p.y
          let offSetY = this.firstPoint.Y - p.y
          this.Ellipse.set({
            top: p.y,
            ry: offSetY / 2,
          });
      } else {
        this.position.Y2 = p.y
        this.Ellipse.set({
          ry: Math.abs(this.firstPoint.Y - p.y)/2,
        })
      }
      this.fabric.renderAll()
    }
  }
  // up
  mouseUp () {
    // r >= 5
    if (this.Ellipse.rx >= 5 || this.Ellipse.ry >=5) {
      this.flush(this.Ellipse)
      super.getId()
    } else {
      this.tools.removeKlss(this.Ellipse.id)
    }
    this.onPress = false
    this.Ellipse = null
  }
}
