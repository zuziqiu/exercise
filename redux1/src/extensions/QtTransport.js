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
import * as tools from '../extensions/util'
import * as QT from 'qwebchannel'
// Qt 传输
export const QtTransport = class Api {
  constructor () {
    tools.log('Qt init start...')
    this.isQtInited = false
    window.qqt = this
    window.addEventListener('load', () => {
      this.getStart()
    }, false)
    return this
  }
  // 初始化QT
  getStart () {
    if (!window.qt) {
      this.print('### Qt Object Error!')
      return
    }
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
        this.reciveFromQt(data)
      })
      // create qt object done.
      this.isQtInited = true
    })
  }
  // 打印
  print (msg) {
    let dom = document.querySelector('#qt-msg')
    if (dom) {
      // document.querySelector('#qt-msg').innerHTML = msg
      tools.log('### QT-MSG ###', msg)
    }
  }
  // 接收Qt数据 & 分发Qt客户Message
  reciveFromQt (targetData) {
    this.print('Recive Qt Data ===> ' + targetData)
    try {
      targetData = JSON.parse(targetData)
    } catch(err) {
      this.print(err)
    }
    // JS ==> 通过 Store.dispatch 响应数据
    // 个是 { type, payload.data }
    if (targetData.key && targetData.data) {
      globalStore.reducerStore.dispatch({
        type: targetData.key,
        payload: targetData.data
      })
    }
  }
  // 发送数据 => Qt
  // {
  //  type: 'KEY-OF-TYPE',
  //  data: 'json-string-data'
  // }
  sendToQt (data) {
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
}
