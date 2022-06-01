/**
 * Circle 圆
 * @数据结构参考以下链接
 * https://gitlab.talk-fun.com/website-backend/api-docs/blob/master/client/client-cmd-template.md#%E7%9B%B4%E7%BA%BF-18
 */
import { graphicBase } from './graphicCom'
import { globalStore } from '../states/globalStore'
import { STATIC } from '../states/staticState'
import { graphicTempObject } from '../core/graphicTempObject'
import { addListener } from 'resize-detector'
import emitter from '../extensions/emitter'
export class Pointer extends graphicBase {
  constructor(data) {
    super()
    this.onPress = false
    // move获取的点都会push到该数据(初始化默认x=0, y=0)
    this.pointArray = [{ x: 0, y: 0 }]
    this.Pointer = {}
    this.containOffset = null
    this.renderShape(data)
  }
  renderShape(objData) {
    if (!this.containOffset) {
      this.containOffset = {
        offsetWidth: document.querySelector('.canvas-container').offsetWidth,
        offsetHeight: document.querySelector('.canvas-container').offsetHeight
      }
    }
    if (objData.data) {
      let _data = Object.assign({}, objData.data)
      _data.c = this.tools.CdataToObject(_data.c, _data.t)
      if (!(Object.keys(graphicTempObject.pointerList).includes(_data.c.id))) {
        this.createPointer(_data)
      }
      this.pointArray.push(this.toPointer(_data.c))
      this.timingFetchPoint({ isSend: false })
      // this.setPointer(this.toPointer(_data.c))
      // // 记录当前id的激光笔最后一次操作
      // graphicTempObject.pointerList[_data.c.id] = Object.assign({}, objData.data)
    } else {
      this.createPointer()
      super.getId()
      // graphicTempObject.pointerList[this.Pointer.id] = this.toSerializable(this.Pointer, [0, 0])
      // console.warn(graphicTempObject.pointerList)
    }
  }
  createPointer(data) {
    if (document.querySelector('#brush_pointer')) {
      document.querySelector('#brush_pointer').classList.remove('brush_pointer_hidden')
      this.Pointer.klss = document.querySelector('#brush_pointer')
    } else {
      this.Pointer.klss = document.createElement('i')
    }
    this.Pointer.klss.id = 'brush_pointer'
    document.querySelector('.canvas-container').appendChild(this.Pointer.klss)
    if (data) {
      this.Pointer.id = data.c.id
      this.Pointer.nid = data.n
      this.Pointer.xid = data.x ? parseInt(data.x) : data.xid
      this.Pointer.tid = STATIC.POINTER
    } else {
      let curUserId = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : 'me'
      this.Pointer.nid = this.store.getState().drawId
      this.Pointer.xid = this.store.getState().room.curUser ? this.store.getState().room.curUser.xid : ''
      this.Pointer.id = curUserId + '_' + new Date().getTime() + '_' + 'p' + this.store.getState().drawId
      this.Pointer.cid = this.store.getState().drawId
    }
  }
  timingFetchPoint({ isSend = true }) {
    let that = this
    // 每100毫秒取出全部数据
    if (that.pointArray.length > 0) {
      if (!that.timer) {
        that.timer = setInterval(() => {
          // 移动点多的时候每2个点取后一个
          if (that.pointArray.length > 2) {
            let _pointArray = that.pointArray.splice(0, 2)
            that.setPointer(_pointArray[1])
            isSend && that.flush([_pointArray[1].x, _pointArray[1].y])
          } else {
            // if (that.pointArray.length > 0) {
            //   let _pointArray = that.pointArray.splice(0, 1)
            //   // console.warn('123', _pointArray)
            //   that.setPointer(_pointArray[0])
            //   isSend && that.flush([_pointArray[0].x, _pointArray[0].y])
            // }
          }
        }, 50)
      }
    }
  }
  setPointer(data) {
    this.Pointer.klss.style.transform = `translate3d(${
      (data.x * this.containOffset.offsetWidth / STATIC.WHITEBOARD_BASE_WIDTH).toFixed(3) + 'px, ' + (data.y * this.containOffset.offsetHeight / STATIC.WHITEBOARD_BASE_HEIGHT).toFixed(3) + 'px, '} 0px)`;
  }
  // 发送数据
  flush(data) {
    let cdata = this.toSerializable(this.Pointer, data)
    super.flush(cdata, '', false)
  }
  // 默认设置
  defaultSetting(Pointer) {
    return super.defaultSetting(Pointer)
  }
  toPointer(cdata) {
    return {
      x: cdata.pointArr.split(',')[1],
      y: cdata.pointArr.split(',')[3]
    }
  }
  // 产出｀c｀数据
  toCdata(pointer, _pointArray) {
    let c = []
    let whiteboard = this.store.getState().whiteboard
    let cdata = {
      id: pointer.id,
      point: this.serializePoint(_pointArray)
    }
    Object.keys(cdata).map((key) => {
      c.push(cdata[key])
    })
    return c.join('|')
  }
  serializePoint(_pointArray) {
    let p = []
    p = p.concat(['x', _pointArray[0], 'y', _pointArray[1]])
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
    cmd.p = this.store.getState().page.currentPage || baseTpl.p
    cmd.t = STATIC.POINTER
    cmd.c = this.toCdata(klss, _pointArray)
    cmd._type = 'pointer'
    cmd.klss = klss.klss
    return cmd
  }
  // 切换画笔类型之前的brushType会传到此处做beforcSwitch
  beforceSwitchType(brushType) {
    if (brushType == STATIC.POINTER) {
      // 激光笔被切走后清除定时器
      clearInterval(this.timer)
      this.timer = null
      // 隐藏激光笔dom
      document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
    }
  }
  // down
  mouseDown(data) {
  }
  // move
  mouseMove(data) {
    let p = data.pointer
    this.pointArray.push({
      x: p.x,
      y: p.y
    })
    this.timingFetchPoint({ isSend: true })
  }
  // up
  mouseUp() {
    // this.splitInterval()
    // this.flush(this.Pointer)
    // super.getId()
    // this.onPress = false
    // this.Pointer = null
  }
  mouseOut() {
    // 鼠标离开canvas，清空计时器

  }
}
