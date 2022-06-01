import { h, render, Component } from 'preact'
import mediaCore from '../core/mediaCore'
import tools from '../utils/tools'
import whiteboardPlayer from '../core/whiteboard.player'
import store from '../core/store'
import * as TYPES from '../core/store/types'
import cmdHandle from "../core/cmd.handle"
// import playerCore from './playerCore'
/**
 * # 控制条组件
 */
export default class TControls extends Component {
  constructor(props) {
    super()
    this.state = {
      fullDom: props.fullDom,
      tplType: props.tplType,
      isFullscreenFlag: false
    }
  }
  componentDidUpdate() {
    tools.debug('controls update...')
  }
  // did-mount
  componentDidMount() {
    this.fullScreenEvent()
  }
  // 全屏事件
  fullScreenEvent() {
    let eventChange = () => {
      if (document.fullscreenElement || document.mozFullScreenElement || document.msFullScreenElement || document.webkitFullscreenElement || null) {
        this.setState({
          isFullscreenFlag: true
        })
        store.commit(TYPES.UPDATE_FULLSCREEN_STATE, true)
      } else {
        this.setState({
          isFullscreenFlag: false
        })
        store.commit(TYPES.UPDATE_FULLSCREEN_STATE, false)
      }
    }
    // all
    document.addEventListener('fullscreenchange', () => {
      eventChange()
    }, false)
    // webkit
    document.addEventListener('webkitfullscreenchange', () => {
      eventChange();
    }, false)

    // 监听全屏
    store.listen('fullscreen', (screenFlag) => {
      this.setState({
        isFullscreenFlag: screenFlag
      })
      if (!screenFlag) {
        this.exitFullscreen()
      }
    })
  }
  // 检查是否全屏
  checkIosFullscreen() {
    // IOS特殊处理
    if (tools.isIos()) {
      let that = this
      let timer = setInterval(() => {
        let dom = this.state.fullDom
        let video = dom.querySelector('video')
        if (video && !video.webkitDisplayingFullscreen) {
          // 退出了全屏
          video.play()
          clearInterval(timer)
        }
      }, 1000)
    }
  }
  // 重新加载
  reload() {
    // 视频
    if (this.state.tplType === 'video') {
      tools.debug('video on reload...')
      mediaCore.reload()
    }
    // 画板
    else if (this.state.tplType === 'whiteboard') {
      whiteboardPlayer.getPlayer(player => {
        if (player) {
          tools.debug('whteboard on reload...')
          // player.whiteboardResize()
          // 白板resize会设置canvas矩阵
          whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.WHITEBOARD_RESIZE)
          // PPT resize会设置PPT的尺寸位置
          whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.PPT_RESIZE)
        }
      })
    }
  }
  // 退出全屏
  exitFullscreen() {
    tools.exitFullscreen()
    this.setState({
      isFullscreenFlag: false
    })
    tools.debug('exit fullscreen...')
  }
  // 全屏
  fullscreen(el) {
    // 退出全屏
    if (this.state.isFullscreenFlag) {
      this.exitFullscreen()
      cmdHandle.emit('live:on:fullscreen', false)
    }
    // 进入全屏
    else {
      if (this.state.fullDom) {
        let handleDom = this.state.fullDom
        // if (handleDom)
        if (tools.isIos()) {
          if (handleDom && handleDom.querySelector('video')) {
            handleDom = handleDom.querySelector('video')
          }
        }
        tools.fullscreen(handleDom)
        // ios
        this.checkIosFullscreen()
      }
      cmdHandle.emit('live:on:fullscreen', true)
    }
    // 进入全屏或者退出全屏，判断是画板的话都要用一次resize
    if (this.state.tplType === 'whiteboard') {
      whiteboardPlayer.getPlayer(player => {
        if (player) {
          tools.debug('whteboard on reload...')
          // player.whiteboardResize()
          // 白板resize会设置canvas矩阵
          whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.WHITEBOARD_RESIZE)
          // PPT resize会设置PPT的尺寸位置
          whiteboardPlayer.whiteboardObject.emit(whiteboardPlayer.whiteboardObject.events.PPT_RESIZE)
        }
      })
    }
  }
  // 渲染
  render(props, state) {
    let fullscreenTpl = null
    let reloadTpl = <svg t="1577087976556" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16410" width="24" height="24"><path d="M975.424746 367.758714H767.628836a48.055585 48.055585 0 1 1 0-95.888691h83.429835A415.36934 415.36934 0 1 0 927.59164 511.70299 48.055585 48.055585 0 1 1 1023.480331 511.70299a511.70299 511.70299 0 1 1-95.888691-297.677653V127.925747a48.055585 48.055585 0 1 1 95.888691 0v191.999861a48.055585 48.055585 0 0 1-48.055585 47.833106z" fill="#ffffff" p-id="16411"></path></svg>
    // 全屏icon差异化
    if (state.isFullscreenFlag) {
      fullscreenTpl = <svg t="1577104736771" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6402" width="24" height="24"><path d="M708.041567 370.800959l240.652278-240.652278-63.027978-63.027978-240.652278 240.652279v-245.56355H556.610711v396.994405h399.45004V370.800959zM67.939249 548.42526v88.402877h245.563549L75.306155 877.480416l63.027978 63.027977 240.652278-240.652278v245.563549h88.402878V548.42526z" p-id="6403" fill="#ffffff"></path></svg>
    } else {
      fullscreenTpl = <svg t="1577088691546" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17525" width="24" height="24"><path d="M793.988809 100.681055H512.409273v138.334133h181.717026L524.68745 405.179856l99.043965 97.406875L793.988809 336.422062v177.624301h140.789768V100.681055H793.988809zM500.131095 623.731415L400.268585 526.32454 230.011191 692.489209V514.046363H89.221423v413.365308h423.18785V789.896083H329.873701l170.257394-166.164668z" p-id="17526" fill="#ffffff"></path></svg>
    }
    // html ==> dom
    return (
      /**
       * ====> HTML DOM START <======
       */
      <div class="tf-player-controls">
        <div class="tf-xplayer-inner">
          {/* 刷新 */}
          <span class="tf-player-reload" onClick={this.reload.bind(this)}>
            {reloadTpl}
          </span>
          {/* 全屏 */}
          <span class="tf-player-fullscreen" onClick={this.fullscreen.bind(this)}>
            {fullscreenTpl}
          </span>
          {/* 音量 */}
          <span class="tf-player-volume"></span>
        </div>
      </div>
      // ====> HTML DOM END <======
    )
  }
}