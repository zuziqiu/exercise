/**
 * ## 序列化图形数据 ##
 * @description 按照当前图形分类 产出序列化数据结构
 */
import { log } from '../extensions/util'
import { Line } from "./line"
import { Curve } from './curve'
import { Rectangle } from './rectangle'
import { Erase } from './erase'
import { DottedLine } from './dottedLine'
import { Triangle } from './triangle'
import { Image } from './image'
import { Text } from './text'
import { Circle } from './circle'
import { Ellipse } from './ellipse'
import { Pointer } from './pointer-v2'
import { Arrow } from './arrow'
import { STATIC } from '../states/staticState'
import { globalStore } from '../states/globalStore'
import { graphicTempObject } from '../core/graphicTempObject'
import * as tools from '../extensions/util'
// graphic init.
export const graphic = {
  // fabric
  FabricObject: null,
  // init
  init(props) {
    this.props = props.data
  },
  // cursorType(canvas, cursorType) {
  // if (globalStore.reducerStore.getState().room.powerEnable) {
  //   canvas.defaultCursor = cursorType
  //   canvas.hoverCursor = cursorType
  // } else {
  //   canvas.defaultCursor = cursor.initial
  //   canvas.hoverCursor = cursor.initial
  // }
  // },
  // brush type
  // TODO...
  getBrushType({ brush, data, isRefresh = false, isEmpty = false, fromClick = false }) {
    log('Brush Type ==>', brush, data)
    // if (this.curBrushType === brush) {
    //   return false
    // }
    if (globalStore.getFabric()) {
      var canvas = globalStore.getFabric() || {}
    }
    if (!canvas) {
      return
    }
    this.curBrushType = brush
    switch (brush) {
      // 直线
      case STATIC.LINE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Line({
          data: data
        })
      // 箭头
      case STATIC.ARROW:
      // 曲线
      case STATIC.CURVE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Curve({
          data: data
        })
      // 矩形
      case STATIC.RECTANGLE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Rectangle({
          data: data
        })
      // 圆形
      // case 'circle' || STATIC.CIRCLE:
      // return new Circle()
      // 椭圆
      // case 'ellipse':
      case STATIC.CIRCLE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Ellipse({
          data: data
        })
      // 虚线
      case STATIC.DOTTED_LINE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new DottedLine({
          data: data
        })
      // 三角
      case STATIC.TRIANGLE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Triangle({
          data: data
        })
      // 图片
      case STATIC.IMAGE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Image({
          data: data,
          isEmpty: isEmpty,
          isRefresh: isRefresh
        })
      // 文字
      case STATIC.TEXT:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Text({
          data: data,
          fromClick: fromClick,
          isEmpty: isEmpty,
          isRefresh: isRefresh
        })
      // 激光笔
      case STATIC.POINTER:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.remove('brush_pointer_hidden')
        // 激光笔极耗性能，不能重复new
        if (Object.keys(graphicTempObject.pointerList).length > 0) {
          graphicTempObject.pointerList[Object.keys(graphicTempObject.pointerList)[0]].class.renderShape({ data: data })
          return graphicTempObject.pointerList[Object.keys(graphicTempObject.pointerList)[0]].class
        } else {
          let _pointer = new Pointer({
            data: data
          })

          // =============================开始保存激光笔临时对象================================
          graphicTempObject.set({
            id: _pointer.Pointer.id,
            data: {
              class: _pointer
            }
          })
          return _pointer
        }
      // 删除
      case STATIC.ERASE:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Erase({})
      // 全部清空
      case STATIC.ERASE_ALL:
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        return new Erase({
          data: data,
          isClearAll: true
        })
      default:
        log('type ==> ' + brush)
        return {}
    }
  },
  // 外部触发使用
  use(type, payload) {
    globalStore.reducerStore.dispatch({
      type: type,
      payload: payload
    })
  },
  // 事件绑定
  eventFire() {
    // fabric 事件...
  },
  // fabric
  setFabric(FabricObject) {
    if (FabricObject) {
      this.FabricObject = FabricObject
    }
    return FabricObject
  }
}