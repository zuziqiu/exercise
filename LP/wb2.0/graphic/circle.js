/**
 * Circle 圆
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
export class Circle extends graphicBase {
  constructor () {
    super()
    this.onPress = false
  }
  // 发送数据
  flush (data) {
    let sdata = this.toSerializable(data)
  }
  // 默认设置
  defaultSetting (Circle) {
    return super.defaultSetting(Circle)
  }
  // 发送给远端
  toServer () {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata (circle) {
    let c = []
    let whiteboard = this.store.getState().whiteboard
    let cdata = {
      id: 'l1',
      visible: 1,
      x1: circle.x1,
      y1: circle.y1,
      x2: circle.x2,
      y2: circle.y2,
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
  toSerializable (data) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = baseTpl.n
    cmd.p = baseTpl.p
    cmd.t = STATIC.Circle
    cmd.c = this.toCdata(data)
    cmd._type = 'circle'
    return cmd
  }
  // down
  mouseDown (data) {
    // create Fabric.Circle
    if (!this.onPress) {
      let p = data.pointer
      this.Circle = new fabric.Circle({left: p.x, top: p.y, radius: 1})
      this.Circle.id = 'c' + this.store.getState().drawId
      this.Circle.cid = this.store.getState().drawId
      let circleSetting = this.defaultSetting(this.Circle)
      circleSetting.fill = 'transparent'
      this.fabric.add(this.Circle)
      this.onPress = true
    }
  }
  // move
  mouseMove (data) {
    if (this.onPress) {
      let p = data.pointer
      let xDistant = Math.abs(this.Circle.left - p.x)
      let yDistant = Math.abs(this.Circle.top - p.y)
      let _radius = Math.sqrt(Math.pow(xDistant, 2) + Math.pow(yDistant, 2)) /2.5
      let _angle = 0
      if (this.Circle.left - p.x > 0) {
        _angle = 180
      }
      this.Circle.set({
        radius: _radius,
        angle: _angle
      })
      this.fabric.renderAll()
    }
  }
  // up
  mouseUp () {
    this.flush(this.Circle)
    super.getId()
    this.onPress = false
    this.Circle = null
  }
}
