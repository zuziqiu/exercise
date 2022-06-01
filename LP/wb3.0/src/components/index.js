// 入口文件
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactDOM from 'react-dom';
import { Main } from './Main'
import { removeListener } from 'resize-detector'
import { STATIC } from '../states/staticState'
import { WebCommandApi } from '../extensions/WebCommandApi'
import * as tools from '../extensions/util'
import wbEmitter from '../extensions/wbEmitter'
import { globalStore } from '../states/globalStore'
import { graphicTempObject } from '../core/graphicTempObject'
import { page } from '../core/page'
import { graphic } from '../graphic'


/**
 * @param {核心组件入口} 
 */
export const MainTemplate = (Store) => {
  @observer
  class App extends Component {
    componentDidMount() {
      // 暴露状态给直播器后会收到应用数据，但是该死的mac此时外部容器clientHeight是0导致computeCanvasSize方法计算错误，所以延迟200。
      // 可恶还没查清为什么onload了外部容器还取不到clientHeight，高度还是0
      // if (window.qt) {
      // setTimeout(() => {
      this.exposeInit()
      // }, 200);
      // } else {
      //   this.exposeInit()
      // }
    }
    exposeInit() {
      console.log(`%c whiteboard Version v${globalStore.store.room.version}, debug=${globalStore.store.room.debugMode}`, `color:red;font-size:14px;font-weight:400`)
      setTimeout(() => {
        wbEmitter.emit('wb:init:ready', globalStore.getState())
      }, 200);
      let whiteboard_clearDom_callback = function () {
        if (document.querySelector(`#${Store.room.wbContainerId}`).childElementCount > 0) {
          document.querySelector(`#${Store.room.wbContainerId}`) && removeListener(document.querySelector(`#${Store.room.wbContainerId}`))
          wbEmitter.off('whiteboard:clearDom', whiteboard_clearDom_callback)
          destroyDom()
        }
      }
      // 监听destroy
      wbEmitter.on('whiteboard:clearDom', whiteboard_clearDom_callback)

      // 初始化webCommand，是接口工具
      this.WebCommandApi = new WebCommandApi(function () {
        setTimeout(() => {
          this.sendToQt({ "key": "RELOAD_COMPLETE" })
          this.sendToWebview('{"origin":"talkfun","params":"wbLoaded"}')
        }, 200);
      })
      globalStore.setCommandApi(this.WebCommandApi)

      // 初始化读取存在的数据执行
      if (globalStore.store.page.currentPage > 0) {
        // 清除文字&图片缓存的对象，缓存对象只允许第一次数据执行创建KLSS对象，use多次进入时会执行removeKlss
        graphicTempObject.clear()
        page.executePage({ PAGE: globalStore.store.page.currentPage, SUB_PAGE: globalStore.store.page.currentSubPage })
      }
      // 特殊逻辑：如果当前画笔是橡皮擦，需要在涂鸦渲染后再实例一次，目的是设置涂鸦对象的可选属性，否则刷新后擦除不了涂鸦
      if (globalStore.store.whiteboard.brushType === STATIC.ERASE) {
        // 设置橡皮擦cursor
        tools.setCursor({ 'brushType': STATIC.ERASE })
        // 实例化橡皮擦
        graphic.getBrushType({
          brush: STATIC.ERASE
        })
      }
      // setTimeout(() => {
      //   var a = '{\"n\":56,\"ap\":0,\"t\":51,\"c\":\"https:\\/\\/s2.talk-fun.com\\/2\\/doc\\/e9\\/ab\\/9a\\/9c1e544e4d0516b457618c2a52\\/|1|0|0.625,0,0,0.625,0,0|16777215|1\",\"st\":692,\"hd\":\"f\",\"x\":\"481807013\",\"p\":1}'
      //   // this.WebCommandApi.reciveFromCommand(JSON.stringify(a))
      //   page.socketUpdatePage(a)
      // }, 2000);
      // setTimeout(() => {
      //   var a = "{\"n\":58,\"ap\":0,\"t\":51,\"c\":\"https:\\/\\/s2.talk-fun.com\\/8\\/doc\\/03\\/99\\/3c\\/d9e78e966bbd7f3d1794274a33\\/|1|0|0.625,0,0,0.625,0,0|16777215|1\",\"st\":1076,\"hd\":\"f\",\"x\":\"481807013\",\"p\":1}"
      //   // this.WebCommandApi.reciveFromCommand(JSON.stringify(a))
      //   page.socketUpdatePage(a)
      // }, 4000);
      // setTimeout(() => {
      //   var a = "{\"n\":149,\"ap\":0,\"t\":51,\"c\":\"|10002|3|1,0,0,1,0,0|4800767|1\",\"st\":10091,\"hd\":\"f\",\"x\":\"464874309\",\"p\":10002}"
      //   // this.WebCommandApi.reciveFromCommand(JSON.stringify(a))
      //   page.socketUpdatePage(a)
      // }, 5000);
      // setTimeout(() => {
      //   var a = "{\"n\":150,\"ap\":1,\"t\":51,\"c\":\"https:\\/\\/s2.talk-fun.com\\/8\\/doc\\/29\\/5d\\/b1\\/8a934a6a5a5444d595422c6dc7\\/|1|0|0.625,0,0,0.625,0,0|16777215|1\",\"st\":10092,\"hd\":\"f\",\"x\":\"464874309\",\"p\":1}"
      //   // this.WebCommandApi.reciveFromCommand(JSON.stringify(a))
      //   page.socketUpdatePage(a)
      // }, 6000);

    }
    render() {
      const store = this.props.store;
      return (
        <Main data={store} />
      )
    }
  }
  let container = () => {
    if (!document.querySelector(`#${Store.room.wbContainerId}`)) {
      let _div = document.createElement('div')
      _div.id = Store.room.wbContainerId
      document.body.appendChild(_div)
    }
    let domCon = document.querySelector(`#${Store.room.wbContainerId}`)
    domCon.style.width = '100%'
    domCon.style.height = '100%'
    domCon.style.position = 'relative'
    domCon.style.background = '#dcdcdc'
    return domCon
  }
  // Render
  ReactDOM.render(<App store={Store} />, container())
  let destroyDom = () => {
    // setTimeout(() => {
    ReactDOM.unmountComponentAtNode(document.querySelector(`#${Store.room.wbContainerId}`))
    // document.querySelector(`#${Store.room.wbContainerId}`).innerHTML = ''
    // }, 0);
  }
}