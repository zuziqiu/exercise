/**
 * Circle 圆
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { STATIC } from '../states/staticState'
import { graphicTempObject } from '../core/graphicTempObject'
export class Pointer extends graphicBase {
  constructor(data) {
    super()
    this.onPress = false
    // move获取的点都会push到该数据(初始化默认x=0, y=0)
    this.pointArray = [{ x: 0, y: 0 }]
    // 计时器
    this.timer = null
    this.pointer = null
    this.renderShape(data)
  }
  renderShape(objData) {
    if (objData.data) {
      // 有图片数据时（一般作为接收端，比如刷新或者作为学员）
      let _data = Object.assign({}, objData.data)
      _data.c = this.tools.CdataToObject(_data.c, _data.t)
      // 判断此id数据是否多次接收
      if (Object.keys(graphicTempObject.pointerList).includes(_data.c.id)) {
        // 如果存在klss就更新klss属性
        let klss = this.tools.findKlssById(_data.c.id)
        if (klss) {
          this.setPointer(klss, _data)
        }
      } else {
        // 此id数据第一次接收，创建klss
        this.createKlss({
          data: _data
        })
      }
      // 记录当前id的pointer最后一次操作
      graphicTempObject.pointerList[_data.c.id] = Object.assign({}, objData.data)
    } else {
      // 无图片数据，直接创建klss(一般从本地发起)
      this.createKlss({})
      this.timingFetchPoint()
      graphicTempObject.pointerList[this.pointer.id] = this.toSerializable(this.pointer, this.pointArray)
    }
  }
  createKlss({ data }) {
    this.pointer = new fabric.Circle({
      radius: 5,
      fill: "red",
      left: 0,
      top: 0,
      selectable: false,
      selection: false,
      tid: STATIC.POINTER
    })
    // let circleSetting = this.defaultSetting(this.pointer)
    this.fabric.add(this.pointer)
    // let _pointArray = this.pointArray.splice(0, this.pointArray.length)
    // this.flush(this.pointer, _pointArray)
    if (data) {
      this.setPointer(this.pointer, data)
    } else {
      let curUserId = this.store.room.curUser ? this.store.room.curUser.xid : 'me'
      this.pointer.nid = this.store.room.drawId
      this.pointer.xid = this.store.room.curUser ? this.store.room.curUser.xid : ''
      this.pointer.hex = this.tools.color(this.store.wbProperty.strokeColor)
      this.pointer.id = curUserId + '_' + new Date().getTime() + '_' + 'c' + this.store.room.drawId
      this.pointer.cid = this.store.room.drawId
      super.getId()
    }
  }
  timingFetchPoint() {
    let that = this
    // 每100毫秒取出全部数据
    if (!that.timer) {
      that.timer = setInterval(() => {
        // 如果存在点就flush
        if (that.pointArray.length > 0) {
          let _pointArray = that.pointArray.splice(0, 1)
          this.pointer.set({
            left: Math.abs(_pointArray[0].x - (this.pointer.width / 2)),
            top: Math.abs(_pointArray[0].y - (this.pointer.width / 2))
          })
          this.fabric.renderAll()
          that.flush(that.pointer, _pointArray)
        } else {
          that.timer = null
          clearInterval(that.timer)
        }
      }, 3);
    }

  }
  // let klss = this.tools.findKlssById(_data.c.id)
  // if (klss) {
  //   this.setPointer(klss, objData.data)
  // }
  // 为每个ponit分配延迟时间 @point count / time length
  // splitInterval() {
  //   let eachTime = 1000 / window.pointArray.length
  //   window.pointArray.map((item, index) => {
  //     let currentTime = index * eachTime
  //     setTimeout(() => {
  //       this.setTeachPoint(this.pointer, item)
  //     }, currentTime);
  //   })
  // }
  setPointer(klss, data) {
    // id: data.c.id,
    // nid: data.n,
    // xid: data.x ? parseInt(data.x) : data.xid,
    // stroke: this.tools.color(data.c.color),
    // strokeWidth: parseInt(data.c.strokeWidth),
    // hex: data.klss && data.klss.hex ? data.klss.hex : data.c.color,
    // opacity: data.c.opacity,
    // visible: data.c.visible == '0'?false:true,
    // tid: STATIC.LINE
    klss.set({
      id: data.c.id,
      nid: data.n,
      xid: data.x ? parseInt(data.x) : data.xid,
      // stroke: this.tools.color(data.c.color),
      // strokeWidth: parseInt(data.c.strokeWidth),
      // hex: data.klss && data.klss.hex ? data.klss.hex : data.c.color,
      // opacity: data.c.opacity,
      // visible: data.c.visible == '0' ? false : true,
      tid: STATIC.POINTER
    })
    let p_array = data.c.pointArr.split(',')
    // let fetch_pointer = setInterval(() => {
    if (p_array.length > 0) {
      klss.set({
        left: parseInt(p_array[1]),
        top: parseInt(p_array[3])
      })
      this.fabric.renderAll()
    }
    // else {
    //   clearInterval(fetch_pointer)
    // }
    // }, 100)
  }
  // 发送数据
  flush(data, _pointArray) {
    let cdata = this.toSerializable(data, _pointArray)
    super.flush(cdata)
  }
  // 默认设置
  defaultSetting(Pointer) {
    return super.defaultSetting(Pointer)
  }
  // 产出｀c｀数据
  toCdata(pointer, _pointArray) {
    let c = []
    let wbProperty = this.store.wbProperty
    let cdata = {
      id: pointer.id,
      point: this.toPoint(_pointArray)
    }
    Object.keys(cdata).map((key) => {
      c.push(cdata[key])
    })
    return c.join('|')
  }
  toPoint(_pointArray) {
    let p = []
    _pointArray.map((item) => {
      p = p.concat(['x', item.x, 'y', item.y])
    })
    return p.join(',')
  }
  // 序列化数据
  toSerializable(klss, _pointArray) {
    let cmd = {}
    let baseTpl = super.cmdTpl()
    cmd.x = baseTpl.x
    cmd.st = baseTpl.st
    cmd.n = klss.nid || baseTpl.n
    cmd.cid = klss.id
    cmd.hd = baseTpl.hd
    cmd.p = this.store.page.currentPage || baseTpl.p
    cmd.t = STATIC.POINTER
    cmd.c = this.toCdata(klss, _pointArray)
    cmd._type = 'pointer'
    cmd.klss = klss
    return cmd
  }
  // 切换画笔类型之前的brushType会传到此处做beforcSwitch
  beforceSwitchType(brushType) {
    if (brushType == STATIC.POINTER) {
      // 教棍被切走后清除定时器
      clearInterval(this.timer)
    }
  }
  // down
  mouseDown(data) {
    // create Fabric.Circle
    if (!this.onPress) {
      let p = data.pointer
      // this.Circle = new fabric.Circle({left: p.x, top: p.y, radius: 1})
      // this.Circle.id = 'c' + this.store.room.drawId
      // this.Circle.cid = this.store.room.drawId
      // let circleSetting = this.defaultSetting(this.Circle)
      // circleSetting.fill = 'transparent'
      // this.fabric.add(this.Circle)
      this.onPress = true
      // 点击的波纹效果
      // this.pointer.setGradient('fill', {
      //   type: 'radial',
      //   x1: 5,
      //   y1: 5,
      //   x2: 5,
      //   y2: 5,
      //   r1: 1,
      //   r2: 5,
      //   colorStops: {
      //     0: 'red',
      //     1: '#d8a8af'
      //   }
      //   // dd8c8c
      // })
    }
  }
  // move
  mouseMove(data) {
    // if (this.onPress) {
    let p = data.pointer
    // 记录移动中的点
    this.pointArray.push({
      x: p.x.toFixed(2),
      y: p.y.toFixed(2)
    })
    // this.pointer.set({
    //   left: Math.abs(p.x - (this.pointer.width / 2)),
    //   top: Math.abs(p.y - (this.pointer.width / 2))
    // })
    // this.fabric.renderAll()
    // }
    this.timingFetchPoint()
  }
  // up
  mouseUp() {
    // this.splitInterval()
    // this.flush(this.pointer)
    // super.getId()
    // this.onPress = false
    // this.pointer = null
  }
  mouseOut() {
    // 鼠标离开canvas，清空计时器

  }
}
