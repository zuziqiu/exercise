/**
 * ## command组件-供客户端、app使用 ##
 * Javascript <===> QT <接口层>
 * ============= 双向传输格式如下 =============
 * {
 *  key: 'KEY-OF-TYPES'
 *  data: 'JSONstring to data'
 * }
 */
import { transaction } from 'mobx'
import wbEmitter from '../extensions/wbEmitter'
import { globalStore } from '../states/globalStore'
import * as tools from './util'
import * as QT from 'qwebchannel'
import { page } from '../core/page'
import { STATIC } from '../states/staticState'
import * as TYPES from '../Action/action-types'
import { graphicTempObject } from '../core/graphicTempObject'

// webCommand 传输
export const WebCommandApi = class Api {
  constructor(callback) {
    tools.log('webCommand init start...')
    this.isQtInited = false
    this.getStart(callback)
    return this
  }
  // 初始化QT
  getStart(callback) {
    if (window.qt) {
      new QT.QWebChannel(qt.webChannelTransport, (channel) => {
        //Get webCommand interact object
        let interactQt = channel.objects.interactObj
        this.interactQt = interactQt
        // send ...
        tools.log("Init webCommand Object =>" + interactQt);
        // 发送信息给Qt
        let version = globalStore.store.room.version
        let info = 'init webCommand javascript Engine Success!' + new Date().getTime() + ' version=' + version
        tools.log(info)
        // 接收Qt信息
        interactQt.SigSendMessageToJS.connect((data) => {
          this.reciveFromCommand(data)
        })
        // create qt object done.
        this.isQtInited = true
        callback && callback.call(this)
        tools.log('WHITEBOARD RELOAD_COMPLETE')
      })
    } else {
      callback && callback.call(this)
    }
  }
  // 接收Qt数据 & 分发Qt客户Message
  reciveFromCommand(targetData) {
    // targetData = `{"data": {"t": 51, "x": "215168991", "isSend": "0", "hd": "f", "n": 9, "p": 10002, "st": 78.19, "c": "|10002|0|1,0,0,1,0,0|2844742|1"}, "type": "51", "key": "LIVE_SET_PAGE"}`

    tools.log('Recive webCommand Data ===> ' + targetData)
    try {
      targetData = JSON.parse(targetData)
    } catch (err) {
      tools.log('jsonerror:  ' + err)
    }
    // JS ==> 通过 Store.dispatch 响应数据
    // 客户端调用刷新
    if (targetData.key === 'LIVE_RELOAD') {
      window.location.reload()
    }
    // 拦截课件的数据另行处理
    if (targetData.key === 'LIVE_SET_PAGE') {
      page.setPageDispatcher(targetData)
    } else if (targetData.key) {
      // 笔画类型（和其他数据格式（颜色线宽等）有差异）
      if (targetData.type) {
        if (targetData.type == STATIC.DRAW_BAT) {
          // 批量涂鸦数据处理（接收的数据保存渲染后不用发送出去，服务器另外发送了）
          if (targetData.data) {
            try {
              targetData.data = JSON.parse(targetData.data)
            } catch (err) {
              tools.log(err)
            }
            if (Object.prototype.toString.call(targetData.data.d) === '[object Array]') {
              targetData.data.d.map(item => {
                if (item) {
                  let cdata = JSON.parse(item)
                  if (cdata.c && cdata.c.length > 0) {
                    cdata.cid = cdata.c.split('|')[0]
                    cdata.t = cdata.t.toString()
                    // 如果非当前页放弃渲染
                    if (Number(cdata.p) !== Number(globalStore.store.page.currentPage)) {
                      return false
                    }
                    // 保存到历史数据（会更新pageDrawData）
                    // history.save(cdata, '')
                    // 渲染数据到画板上
                    wbEmitter.emit(TYPES.UPDATE_PAGE_DRAW_DATA, { drawData: cdata })
                  } else {
                    item.c = ''
                  }
                }
              })
            }
          }
        } else if (targetData.type == STATIC.ERASE_ALL) {
          // '擦除全部'的指令。（会带上不必要的data）
          // isSend == 0 表示是接收其他端的擦除全部指令。不需要重复发送，暂时先不实例化erase
          if (targetData.isSend == 0) {
            // 擦除全部渲染的图形
            tools.removeKlss()
            // 擦除全部时强制重置当前聚焦的文字（假如有）
            graphicTempObject.currentFocusTextId = ''
            // 清除当前页的pageDrawData
            globalStore.actions.dispatch('pageDrawData', {
              type: TYPES.UPDATE_PAGE_DRAW_DATA,
              payload: {
                mode: tools.isWhiteboard(targetData.data.p) ? STATIC.WHITEBOARD : STATIC.PPT,
                page: targetData.data.p.toString(),
                data: {}
              }
            })
            // 切换brush
            globalStore.actions.dispatch('wbProperty', {
              type: TYPES.WHITEBOARD_BRUSH_TYPE,
              payload: "erase"
            })
          } else {
            globalStore.actions.dispatch('wbProperty', {
              type: targetData.key,
              payload: targetData.type.toString()
            })
          }
        } else if (targetData.data) {
          // 此处判断data很重要。没有数据表示是自主创建，有数据表示是来源于外部的数据（图片和文字比较特殊，自主创建也会携带data:{src, fontSize}。图片还要判断isSend,文字还要判断data中的t字段）
          if (
            // 进入这里的的涂鸦来自‘学生端’或者是‘嘉宾主播端’
            STATIC.CURVE == targetData.type ||
            STATIC.LINE == targetData.type ||
            STATIC.ARROW == targetData.type ||
            STATIC.ELLIPSE == targetData.type ||
            STATIC.RECTANGLE == targetData.type ||
            STATIC.DOTTED_LINE == targetData.type
          ) {
            this.prepareGraphic(targetData)
          }
          if (targetData.type == STATIC.IMAGE) {
            // 处理海报，和PPT同层
            if (targetData.data.effect == 1) {
              // 如果支持jpeg的话，就把jpg转化为jpeg
              if (globalStore.store.page.isWebpSupport) {
                targetData.data.server_path = targetData.data.server_path.replace('.jpg', '.jpeg');
              }
              let wb = globalStore.store.whiteboard,
                keys = Object.keys(wb),
                lastKey = [...keys].pop(),
                target = {
                  key: "LIVE_SET_PAGE",
                  isSend: targetData.isSend,
                  data: {
                    pageIndex: wb[lastKey] ? (parseInt(wb[lastKey].id) + 1).toString() : 10002,
                    id: wb[lastKey] ? (parseInt(wb[lastKey].id) + 1).toString() : 10002,
                    ret: {
                      backgroundColor: "rgba(0, 0, 0, 0)",
                      effect: targetData.data.effect,
                      server_path: targetData.data.server_path,
                      src: targetData.data.src
                    },
                    subIndex: "1",
                    pageAmount: "1"
                  }
                }
              page.setPageDispatcher(target)
            } else {
              // 如果是图片的笔画类型就把图片数据（src等）先存起来
              if (targetData.isSend == 0) {
                this.prepareGraphic(targetData)
              } else {
                transaction(() => {
                  globalStore.actions.dispatch('wbProperty', {
                    type: TYPES.WHITEBOARD_BRUSH_DATA,
                    payload: Object.assign(targetData.data, { isSend: targetData.isSend })
                  })
                  // type: WHITEBOARD_BRUSH_TYPE
                  globalStore.actions.dispatch('wbProperty', {
                    type: targetData.key,
                    payload: targetData.type.toString()
                  })
                })
              }
            }
          } else if (targetData.type == STATIC.TEXT) {
            // 文字类型要特殊判断。有t则是渲染涂鸦，没t就是调用画笔类型（data带着font-size，所以用t判断）
            if (targetData.data.t == 15) {
              this.prepareGraphic(targetData)
            } else {
              // WHITEBOARD_BRUSH_TYPE
              globalStore.actions.dispatch('wbProperty', {
                type: targetData.key,
                payload: targetData.type.toString()
              })
            }
          }
        } else {
          // 非31指令 && data数据体(涂鸦轨迹点)为'',才更新brushType(画笔类型，31是批量涂鸦)
          // WHITEBOARD_BRUSH_TYPE
          globalStore.actions.dispatch('wbProperty', {
            type: targetData.key,
            payload: targetData.type.toString()
          })
        }
      }
      // 非笔画类型的数据（比如颜色线宽等）, mark 这里居然是大杂烩啊，必须找个时间理清有什么key经过
      else {
        globalStore.actions.dispatch(['wbProperty', 'room'], {
          type: targetData.key,
          payload: targetData.data
        })
      }
    }
  }
  prepareGraphic(targetData) {
    let cdata = targetData.data;
    cdata.cid = cdata.c.split('|')[0]
    cdata.t = cdata.t.toString()
    // 如果非当前页放弃渲染
    if (Number(cdata.p) !== Number(globalStore.store.page.currentPage)) {
      return false
    }
    if (tools.CdataToObject(cdata.c, cdata.t).visible === '0') {
      // 图片和文字特殊处理（不执行清除对象，为了后续处理graphicTempObject）
      if (!(cdata.t === STATIC.IMAGE || cdata.t === STATIC.TEXT)) {
        tools.removeKlss(cdata.cid)
      }
    }
    // update pageDrawData from qt
    tools.log('update pageDrawData from qt')
    // 保存到历史数据（会更新pageDrawData）
    // history.save(cdata, '')
    // 渲染数据到画板上
    wbEmitter.emit(TYPES.UPDATE_PAGE_DRAW_DATA, { drawData: cdata })
  }
  // 发送数据 => webCommand
  // {
  //  type: 'KEY-OF-TYPES',
  //  data: 'json-string-data'
  // }
  sendToQt(data) {
    // String number function null undefind
    if (!this.isQtInited) {
      let _errlog = '[### Error ###] webCommand is Unbuild!'
      tools.log(_errlog)
      return false
    }
    if (typeof (data) === 'object') {
      data = JSON.stringify(data)
    }
    this.interactQt.JSSendMessage(data)
    tools.log('Send to qt => ' + data)
  }
  sendToWebview(data) {
    /* data = '{"origin":"talkfun","params":"wbLoaded"}'*/
    window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsToOcWithPrams && window.webkit.messageHandlers.jsToOcWithPrams.postMessage(data);
    window.android && window.android.JsToJavaInterface(data);
  }
}
