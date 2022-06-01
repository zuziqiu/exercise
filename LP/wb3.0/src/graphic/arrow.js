/**
 * mainLine 直线
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
import * as tools from '../extensions/util'
// import * as TYPES from '../Action/action-types'
export class Arrow extends graphicBase {
  constructor () {
    super()
    this.onPress = false
    this.mainLine = null
  }
  // 发送数据
  flush (data) {
  }
  // 默认设置
  defaultSetting () {
    super.defaultSetting(this.mainLine)
  }
  // 发送给远端
  toServer () {
    // todo...远程接口
  }
  // 产出｀c｀数据
  toCdata (line) {
    let c = []
    let wbProperty = this.store.wbProperty
    let cdata = {
      id: line.id,
      x1: line.x1,
      y1: line.y1,
      x2: line.x2,
      y2: line.y2,
      strokeWidth: wbProperty.strokeWidth,
      color: tools.color(wbProperty.strokeColor),
      opacity: wbProperty.strokeOpacity
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
    cmd.t = STATIC.LINE
    cmd.c = this.toCdata(data)
    return cmd
  }
  // down
  mouseDown (data) {
    // create Fabric.mainLine
    if (!this.onPress) {
      let p = data.pointer
      this.leftBranch = new fabric.Line()
      this.rightBranch = new fabric.Line()
      this.mainLine = new fabric.Line([
        400,
        400,
        p.x,
        p.y
      ])
      this.mainLine.fill = 'red'
      this.mainLine.id = 'l' + this.store.room.drawId
      this.defaultSetting()
      this.fabric.add(this.mainLine)
      this.onPress = true
    }
  }
  // move
  mouseMove (data) {
    if (this.onPress) {
      let p = data.pointer
      this.mainLine.set({
        // x2: p.x,
        // y2: p.y,
        rotate: 45
      })
      this.fabric.renderAll()
    }
  }
  // up
  mouseUp () {
    // px < 10
    let _line = this.mainLine
    if (Math.abs(_line.y2 - _line.y1) > 10 || Math.abs(_line.x2 - _line.x1) > 10) {
      this.flush(_line)
      super.getId()
    } else {
      tools.removeKlss(_line.id, _line.type)
    }
    this.onPress = false
    this.mainLine = null
  }
}
