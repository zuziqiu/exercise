// 直播器client单元测试数据
import { qtClientData } from "./qtClientData"
// 直播器passive单元测试数据
import { qtPassiveData } from "./qtPassiveData"
// 小班client单元测试数据
import { xClassClientData } from "./xClassClientData"
// 小班passive单元测试数据
import { xClassPassiveData } from "./xClassPassiveData"
// 大班passive单元测试数据
import { bClassPassiveData } from "./bClassPassiveData"
// 涂鸦passive单元测试数据
import { graphicPassiveData } from "./graphicPassiveData"
// 静态变量
import { STATIC } from '../states/staticState'
// TYPES => CMD 的key
import * as TYPES from '../Action/action-types'
// 全局对象
import { globalStore } from "../states/globalStore"
// core 操作页数的核心
import { page } from "../core/page"

class unitTest {
  constructor(data, callback = null) {
    this.dataList = data
    this.callback = callback
    this.unitModule = null
  }
  distribute() {
    return new Promise((resolve) => {
      let dataMechine = setInterval(() => {
        if (this.dataList.length > 0) {
          let _data = this.dataList.shift()
          console.log(`%c${this.unitModule} 单元测试指令 ==>${JSON.stringify(_data)}`, `color:red;font-size:14px;font-weight:400`)
          // 图形
          let brushCode = [STATIC.CURVE, STATIC.LINE, STATIC.ARROW, STATIC.ELLIPSE, STATIC.RECTANGLE, STATIC.TEXT, STATIC.DOTTED_LINE, STATIC.IMAGE, STATIC.POINTER, STATIC.ERASE_ALL]
          // 页数操作
          if (Array.isArray(_data)) {
            _data.map(item => {
              if (typeof item == 'string') { item = JSON.parse(item) }
              if (item.t && brushCode.includes(item.t.toString())) {
                globalStore.getEmitter().emit(TYPES.UPDATE_PAGE_DRAW_DATA, { drawData: item })
              } else {
                this.excute(item)
              }
            })
          } else {
            if (typeof _data == 'string') { _data = JSON.parse(_data) }
            if (_data.t && brushCode.includes(_data.t.toString())) {
              globalStore.getEmitter().emit(TYPES.UPDATE_PAGE_DRAW_DATA, { drawData: _data })
            } else {
              this.excute(_data)
            }
          }
        } else {
          clearInterval(dataMechine)
          dataMechine = null
          console.log(`%c${this.unitModule} 单元测试完毕`, `color:red;font-size:14px;font-weight:400`)
          resolve()
        }
      }, 1500);
    })
  }
  excute(data) {
    this.callback && this.callback(data)
  }
}

// 直播器client端应用的数据
class qtClientClass extends unitTest {
  constructor(dataList, excute) {
    super(dataList, excute)
    this.unitModule = '直播器client端'
  }
}
export const qtClient = new qtClientClass(qtClientData, globalStore.webCommand.reciveFromCommand.bind(globalStore.webCommand))

// 直播器passive端应用的数据
class qtPassiveClass extends unitTest {
  constructor(dataList, excute) {
    super(dataList, excute)
    this.unitModule = '直播器passive端'
  }
}
export const qtPassive = new qtPassiveClass(qtPassiveData, globalStore.webCommand.reciveFromCommand.bind(globalStore.webCommand))

// 大班观看端接收socket数据
class bClassPassiveClass extends unitTest {
  constructor(dataList, excute) {
    super(dataList, excute)
    this.unitModule = '大班passive端'
  }
}
export const bClassPassive = new bClassPassiveClass(bClassPassiveData, page.socketUpdatePage.bind(page))

// 小班client端应用的数据
class xClassClientClass extends unitTest {
  constructor(dataList, excute) {
    super(dataList, excute)
    this.unitModule = '小班client端'
  }
  excute(data) {
    let cmd = null
    if (data.type == TYPES.LIVE_SET_PAGE) {
      // 应用课件
      cmd = 'wb:page:doSetPage'
    } else if (data.curID) {
      // 应用画板
      cmd = 'wb:page:applyWhiteboard'
    } else if (data.page) {
      // 课件翻页
      cmd = 'wb:page:clientUpdatePage'
    } else if (data.modules) {
      cmd = null
      globalStore.wbClass.dispatch(data)
    }
    cmd && globalStore.getEmitter().emit(cmd, data)
  }
}
export const xClassClient = new xClassClientClass(xClassClientData)

// 小班passive端应用的数据数据
class xClassPassiveClass extends unitTest {
  constructor(dataList, excute) {
    super(dataList, excute)
    this.unitModule = '小班passive端'
  }
}
export const xClassPassive = new xClassPassiveClass(xClassPassiveData, page.socketUpdatePage.bind(page))

// 涂鸦passive单元测试
class graphicPassiveClass extends unitTest {
  constructor(dataList, excute) {
    super(dataList, excute)
    this.unitModule = '涂鸦passive'
  }
}
export const graphicPassive = new graphicPassiveClass(graphicPassiveData, page.socketUpdatePage.bind(page))