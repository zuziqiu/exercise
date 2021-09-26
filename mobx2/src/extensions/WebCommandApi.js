/**
 * ## Qt组件-供客户端使用 ##
 * Javascript <===> QT <接口层>
 * ============= 双向传输格式如下 =============
 * {
 *  key: 'KEY-OF-TYPE'
 *  data: 'JSONstring to data'
 * }
 */
import { globalStore } from '../states/globalStore'
import * as tools from './util'
import * as QT from 'qwebchannel'
import { Page } from '../core/page'
import { STATIC } from '../states/staticState'
import * as TYPES from '../Action/action-types'
import { History } from '../core/history'
import { graphic } from '../graphic'
import { graphicTempObject } from '../core/graphicTempObject'

// Qt 传输
export const WebCommandApi = class Api {
  constructor(callback) {
    tools.log('Qt init start...')
    this.isQtInited = false
    // this.Page = new Page()
    // window.qqt = this
    this.history = new History()
    // window.addEventListener('load', () => {
    this.getStart(callback)
    // }, false)
    return this
  }
  // 初始化QT
  getStart(callback) {
    if (window.qt) {
      new QT.QWebChannel(qt.webChannelTransport, (channel) => {
        //Get Qt interact object
        let interactQt = channel.objects.interactObj
        this.interactQt = interactQt
        // send ...
        this.print("Init Qt Object =>" + interactQt);
        // 发送信息给Qt
        let version = globalStore.reducerStore.getState().room.version
        let info = 'init Qt javascript Engine Success!' + new Date().getTime() + ' version=' + version
        // interactQt.JSSendMessage({
        //   info: info
        // })
        // interactQt.JSSendMessage({
        //   startMessage: 'init Qt javascript Engine Success! -> ' + new Date().getTime()
        // })
        this.print(info)
        // 接收Qt信息
        interactQt.SigSendMessageToJS.connect((data) => {
          this.reciveFromCommand(data)
        })
        // create qt object done.
        this.isQtInited = true
        callback && callback.call(this)
        this.print('WHITEBOARD RELOAD_COMPLETE')
      })
    } else {
      callback && callback.call(this)
    }
  }
  // 打印
  print(msg) {
    let dom = document.querySelector('#qt-msg')
    if (dom) {
      // document.querySelector('#qt-msg').innerHTML = msg
      tools.log('### QT-MSG ###', msg)
    }
  }
  // 接收Qt数据 & 分发Qt客户Message
  reciveFromCommand(targetData) {
    // targetData = `{"data": {"t": 51, "x": "215168991", "isSend": "0", "hd": "f", "n": 9, "p": 10002, "st": 78.19, "c": "|10002|0|1,0,0,1,0,0|2844742|1"}, "type": "51", "key": "LIVE_SET_PAGE"}`

    tools.log('Recive Qt Data ===> ' + targetData)
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
      let _Page = new Page()
      _Page.setPageDispatcher(targetData)
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
                  let _item = JSON.parse(item)
                  if (_item.c && _item.c.length > 0) {
                    _item.cid = _item.c.split('|')[0]
                    _item.t = _item.t.toString()
                    // 如果非当前页放弃渲染
                    if (Number(_item.p) !== Number(globalStore.reducerStore.getState().page.currentPage)) {
                      return false
                    }
                    // 渲染数据到画板上
                    graphic.getBrushType({ brush: _item.t, data: _item, isRefresh: false })
                    // 保存到历史数据（会更新pageDrawData）
                    this.history.save(_item, '')
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
            // 切换brush，否则死循环
            globalStore.reducerStore.dispatch({
              type: TYPES.WHITEBOARD_BRUSH_TYPE,
              payload: "erase"
            })
          } else {
            globalStore.reducerStore.dispatch({
              type: targetData.key,
              payload: targetData.type.toString()
            })
          }
        }
        // 此处判断data很重要。没有数据表示是自主创建，有数据表示是来源于外部的数据（图片和文字比较特殊，自主创建也会携带data:{src, fontSize}。图片还要判断isSend,文字还要判断data中的t字段）
        else if (targetData.data) {
          if (
            // 进入这里的的涂鸦来自‘学生端’或者是‘嘉宾主播端’
            STATIC.CURVE == targetData.type ||
            STATIC.LINE == targetData.type ||
            STATIC.ARROW == targetData.type ||
            STATIC.CIRCLE == targetData.type ||
            STATIC.RECTANGLE == targetData.type ||
            STATIC.DOTTED_LINE == targetData.type
          ) {
            this.renderGraphic(targetData)
          }         // 如果是图片的笔画类型就把图片数据（src等）先存起来
          if (targetData.type == STATIC.IMAGE) {
            if (targetData.isSend == 0) {
              this.renderGraphic(targetData)
            } else {
              new Promise((resolve) => {
                globalStore.reducerStore.dispatch({
                  type: TYPES.WHITEBOARD_BRUSH_DATA,
                  payload: Object.assign(targetData.data, { isSend: targetData.isSend })
                })
                resolve()
              }).then(() => {
                globalStore.reducerStore.dispatch({
                  type: targetData.key,
                  payload: targetData.type.toString()
                })
              })
            }
          } else if (targetData.type == STATIC.TEXT) {
            // 文字类型要特殊判断。有t则是渲染涂鸦，没t就是调用画笔类型（data带着font-size，所以用t判断）
            if (targetData.data.t == 15) {
              this.renderGraphic(targetData)
            } else {
              // { type, payload.type }
              globalStore.reducerStore.dispatch({
                type: targetData.key,
                payload: targetData.type.toString()
              })
            }
          }
        } else {
          // 非31指令 && data数据体(涂鸦轨迹点)为'',才更新brushType(画笔类型，31是批量涂鸦)
          // { type, payload.type }
          globalStore.reducerStore.dispatch({
            type: targetData.key,
            payload: targetData.type.toString()
          })
        }
      }
      // 非笔画类型的数据（比如颜色线宽等）
      else {
        globalStore.reducerStore.dispatch({
          type: targetData.key,
          payload: targetData.data
        })
      }
    }
  }
  renderGraphic(targetData) {
    let data = targetData.data;
    data.cid = data.c.split('|')[0]
    data.t = data.t.toString()
    // 如果非当前页放弃渲染
    if (Number(data.p) !== Number(globalStore.reducerStore.getState().page.currentPage)) {
      return false
    }
    if (tools.CdataToObject(data.c, data.t).visible === '0') {
      // 图片和文字特殊处理（不执行清除对象，为了后续处理graphicTempObject）
      if (!(data.t === STATIC.IMAGE || data.t === STATIC.TEXT)) {
        tools.removeKlss(data.cid)
      }
    }
    // update pageDrawData from qt
    tools.log('update pageDrawData from qt')
    // 渲染数据到画板上
    graphic.getBrushType({ brush: data.t, data: data, isRefresh: false })
    // 保存到历史数据（会更新pageDrawData）
    this.history.save(data, '')
  }
  // 发送数据 => Qt
  // {
  //  type: 'KEY-OF-TYPE',
  //  data: 'json-string-data'
  // }
  sendToQt(data) {
    // String number function null undefind
    if (!this.isQtInited) {
      let _errlog = '[### Error ###] Qt is Unbuild!'
      this.print(_errlog)
      tools.log(_errlog)
      return false
    }
    if (typeof (data) === 'object') {
      data = JSON.stringify(data)
    }
    this.interactQt.JSSendMessage(data)
    this.print('Send to Qt => ' + data)
  }
  sendToWebview(data) {
    /* data = '{"origin":"talkfun","params":"wbLoaded"}'*/
    window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsToOcWithPrams && window.webkit.messageHandlers.jsToOcWithPrams.postMessage(data);
    window.android && window.android.JsToJavaInterface(data);
  }
}
