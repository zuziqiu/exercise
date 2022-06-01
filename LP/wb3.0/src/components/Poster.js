/**
 * 海报
 */
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx'
import objectFitImages from 'object-fit-images';
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import wbEmitter from '../extensions/wbEmitter'
// base
import * as tools from '../extensions/util'
// import { STATIC } from '../states/staticState'
// import { page } from '../core/page'
import { hostMachine } from '../extensions/hostMachine'
@observer
export class Poster extends PureComponent {
  // init.
  constructor() {
    super()
    this.poster = null
    this.posterImgId = 'poster-ppt-img-main'
    this.domId = 'ht-poster-ppt-loader'
    // this.on()
  }
  // 监听emit
  on() {
    wbEmitter.on(TYPES.PPT_RESIZE, () => {
      tools.log('ppt重新计算尺寸==>imgResize')
    })
  }
  // 监听store
  listener() {
    globalStore.listen(
      () => { return { currentPage: toJS(globalStore.store.page.currentPage) } },
      ({ currentPage }) => {
        // 页码数据更新
        if (tools.isWhiteboard(currentPage)) {
          wbEmitter.emit('ppt:ratio', { ratio: 0.75 })
          // 携带平铺ppt指令
          if (globalStore.store.whiteboard[currentPage] && globalStore.store.whiteboard[currentPage].effect == 1) {
            this.poster = globalStore.store.whiteboard[currentPage]
            if (globalStore.store.page.isSend != 0) {
              this.flush()
            }
          } else {
            this.poster = null
          }
        } else {
          this.poster = null
        }
      }
    )
  }
  flush() {
    let webCommand = globalStore.getCommandApi()
    let cmdTpl = tools.getFlushData({ type: 'poster', operationCode: 10 })
    // 发送Qt
    webCommand && webCommand.sendToQt(cmdTpl)
    // 发送操作（发给小班的）
    tools.log('poster doFlush ==>', cmdTpl)
    wbEmitter.emit('set:page', cmdTpl)
  }
  componentDidMount() {
    this.listener()
  }
  // getInspectData(img) {
  //   let _parentDom = document.querySelector(`#${this.domId}`)
  //   if (!_parentDom) {
  //     return false
  //   }
  //   let _parent = {
  //     width: _parentDom.clientWidth,
  //     height: _parentDom.clientHeight
  //   }
  //   let IMG_DOM = {
  //     width: img.naturalWidth,
  //     height: img.naturalHeight
  //   }
  //   let ratio = IMG_DOM.height / IMG_DOM.width
  //   this.postScale = STATIC.WHITEBOARD_BASE_WIDTH / IMG_DOM.width
  //   return {
  //     _parent: _parent,
  //     IMG_DOM: IMG_DOM,
  //     ratio: ratio,
  //   }
  // }
  // img error
  imgOnerror(img) {
    // 错误上报
    // let emitter2 = Object.create(wbEmitter)
    // emitter2.emit = (key, value) => {
    //   tools.log('emit ==>', key, value)
    //   emitter2.wbEmitter.emit(key, value)
    // }
    // emitter2.emit('wb:image:error', { url: img.target.src })
    // 资源错误重试
    let that = this
    hostMachine.process({
      time: 0,
      oriUrl: img.target.src,
      type: 'error',
      callback: function (res) {
        // LIVE_SET_PAGE
        globalStore.actions.dispatch('whiteboard', {
          type: TYPES.LIVE_SET_PAGE,
          payload: {
            id: that.poster.id,
            pageIndex: Number(that.poster.id),
            ret: {
              id: that.poster.id,
              effect: 1,
              backgroundColor: that.poster.backgroundColor,
              src: res,
              server_path: res
            }
          }
        })
      }
    })
  }
  // img laod
  imgOnload(img) {
    objectFitImages(img.currentTarget)
    globalStore.actions.dispatch('whiteboard', {
      type: TYPES.UPDATE_WHITEBOARD_DATA,
      payload: {
        data: {
          id: this.poster.id,
          ratio: img.target.naturalHeight / img.target.naturalWidth
        }
      }
    })
    wbEmitter.emit(TYPES.WHITEBOARD_RESIZE)
  }
  // init
  inspect() {
    let whiteboard = globalStore.store.whiteboard
    if (whiteboard[globalStore.store.page.currentPage] && whiteboard[globalStore.store.page.currentPage].server_path) {
      this.poster = whiteboard[globalStore.store.page.currentPage]
    } else {
      this.poster = null
    }
  }
  // object or array
  render() {
    this.inspect()
    // 非平铺ppt模式
    if (!this.poster) {
      return ''
    }
    let wrapStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    },
      imgStyle = {
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: 'contain'
      }
    // render
    return (
      <div id="talkfun-poster-ppt-loader-wrap">
        <div id={this.domId} className="poster-ppt-img-loader" style={wrapStyle}>
          <img id={this.posterImgId} src={window.qt ? this.poster.src : this.poster.server_path} style={imgStyle} onLoad={this.imgOnload.bind(this)} onError={this.imgOnerror.bind(this)} />
        </div>
      </div>
    )
  }
}