import { h, render, Component } from 'preact'
import mediaControler from '../core/mediaControler'
import tools from '../utils/tools'
import whiteboardPlayer from '../module/whiteboardModule'
import cmdHandle from '../core/cmdHandle'
import * as TYPES from '../action/action-types'
import { sdkAction } from '../action'
import { sdkStore } from '../states'
import { sdkStoreListener } from '../states/listen'
import network from '../plugins/network/network'
import { daily } from '../plugins/daily/daily'
import { toJS } from 'mobx'
require('../assets/css/sdkStyle.less')
/**
 * # 控制条组件
 */
export default class TControls extends Component {
  constructor(props) {
    super()
    this.state = {
      fullDom: props.fullDom,
      tplType: props.tplType,
      isFullscreenFlag: false,
      isWebFullScreenFlag: false,
      speedTips: null,
      testSpeedStatus: 'initial'
    }
  }
  componentDidUpdate() {
    tools.debug('controls update...')
  }
  // did-mount
  componentDidMount() {
    this.fullScreenEvent()
    this.listen()
  }
  // 全屏事件
  fullScreenEvent() {
    let eventChange = () => {
      if (document.fullscreenElement || document.mozFullScreenElement || document.msFullScreenElement || document.webkitFullscreenElement || null) {
        this.setState({
          isFullscreenFlag: true
        })
        // store.commit(TYPES.UPDATE_FULLSCREEN_STATE, true)
        sdkAction.dispatch('media', {
          type: TYPES.UPDATE_FULLSCREEN_STATE,
          payload: { isFullScreen: true }
        })
      } else {
        this.setState({
          isFullscreenFlag: false
        })
        // store.commit(TYPES.UPDATE_FULLSCREEN_STATE, false)
        sdkAction.dispatch('media', {
          type: TYPES.UPDATE_FULLSCREEN_STATE,
          payload: { isFullScreen: false }
        })
      }
    }
    // all
    document.addEventListener(
      'fullscreenchange',
      () => {
        eventChange()
      },
      false
    )
    // webkit
    document.addEventListener(
      'webkitfullscreenchange',
      () => {
        eventChange()
      },
      false
    )
  }
  listen() {
    // 监听网速
    sdkStoreListener.listen(
      () => sdkStore.network.speed,
      (speed) => {}
    )
    // 监听全屏
    sdkStoreListener.listen(
      () => sdkStore.media.player.isFullScreen,
      (screenFlag) => {
        this.setState({
          isFullscreenFlag: screenFlag
        })
        if (!screenFlag) {
          this.exitFullscreen()
        }
      }
    )
    // 监听网页全屏，sdkStore.webFullScreen 是计算属性：摄像头、桌面分享/视频、课件任一的webFullScreen属性变化都会更新sdkStore.webFullScreen
    sdkStoreListener.listen(
      () => sdkStore.webFullScreen,
      (webFullScreen) => {
        if (sdkStore.isWebFullScreen) {
          Object.keys(webFullScreen).map((key) => {
            // true / false
            if (webFullScreen[key]) {
              if (key == 'whiteboard') {
                document.querySelector(`#${sdkStore[key].wrapContainer}`).classList.add('TFwebFullScreen')
              } else {
                document.querySelector(`#${sdkStore.media.player[key].wrapContainer}`).classList.add('TFwebFullScreen')
              }
            } else {
              // 除了全屏的目标元素外，其他播放器都删除全屏类名；以及加上隐藏的类名（隐藏因为view层样式混乱，暂时这样做，正确是全屏类顶起就行）
              if (key == 'whiteboard') {
                document.querySelector(`#${sdkStore[key].wrapContainer}`).classList.remove('TFwebFullScreen')
                document.querySelector(`#${sdkStore[key].wrapContainer}`).classList.add('webFullScreenOther')
              } else {
                document.querySelector(`#${sdkStore.media.player[key].wrapContainer}`).classList.remove('TFwebFullScreen')
                document.querySelector(`#${sdkStore.media.player[key].wrapContainer}`).classList.add('webFullScreenOther')
              }
            }
          })
          let domItem = toJS(sdkStore.room.webFullScreenOther)
          // 网页全屏时受置顶元素影响，除了三大播放器外，可能还会有额外记录需要强制隐藏或者释放的dom元素
          domItem.map((item) => {
            document.querySelectorAll(item).classList?.add('webFullScreenOther')
          })
        } else {
          // 所有播放器都退出了全屏（mobx多次触发了，所以要判断是否有该class的dom）
          document.querySelector('.TFwebFullScreen')?.classList.remove('TFwebFullScreen')
          document.querySelectorAll('.webFullScreenOther').forEach((item) => {
            item.classList?.remove('webFullScreenOther')
          })
        }
        // 设置state，响应更新icon
        this.setState({
          isWebFullScreenFlag: sdkStore.isWebFullScreen
        })
      }
    )
  }

  // 检查是否全屏
  checkIosFullscreen() {
    // IOS特殊处理
    if (tools.isIos()) {
      let timer = setInterval(() => {
        let dom = this.state.fullDom
        let video = dom.querySelector('video')
        if (video && !video.webkitDisplayingFullscreen) {
          // mark
          // if (!video?.webkitDisplayingFullscreen) {
          // 退出了全屏
          video.play()
          clearInterval(timer)
        }
      }, 1000)
    }
  }
  // 日志
  fetchDaily() {
    daily.fetchDaily()
  }
  // 测速
  async testSpeed() {
    if (this.state.testSpeedStatus == 'initial') {
      for (let i = 0; i < 3; i++) {
        switch (i + 1) {
          case 1:
            this.setState({
              testSpeedStatus: 'onePart'
            })
            break
          case 2:
            this.setState({
              testSpeedStatus: 'twoPart'
            })
            break
          case 3:
            this.setState({
              testSpeedStatus: 'threePart'
            })
            break
        }
        let { recordSpeed } = await network.testSpeed()
        let speedTips = `${i + 1}段均速:${recordSpeed >= 1024 ? Math.round((recordSpeed / 1024) * 100) / 100 + 'mb' : recordSpeed + 'kb'}/s`
        this.setState({
          speedTips: speedTips
        })
        if (i == 2) {
          setTimeout(() => {
            this.setState({
              speedTips: null,
              testSpeedStatus: 'initial'
            })
          }, 3000)
        }
      }
    }
  }
  // 重新加载
  reload() {
    // 视频
    if (this.state.tplType === 'video') {
      tools.debug('video on reload...')
      mediaControler.reload()
    }
    // 画板
    else if (this.state.tplType === 'whiteboard') {
      tools.debug('whteboard on reload...')
      whiteboardPlayer.executeEvent('whiteboard:resize')
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
          if (handleDom?.querySelector('video')) {
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
      tools.debug('whteboard on reload...')
      whiteboardPlayer.executeEvent('whiteboard:resize')
    }
  }
  webFullScreen(e) {
    switch (this.state.tplType) {
      case 'video':
        sdkAction.dispatch('media', {
          type: TYPES.UPDATE_VIDEO_WEB_FULLSCREEN_STATE,
          payload: {
            webFullScreen: !sdkStore.media.player.video.webFullScreen
          }
        })
        break
      case 'camera':
        sdkAction.dispatch('media', {
          type: TYPES.UPDATE_CAMERA_WEB_FULLSCREEN_STATE,
          payload: {
            webFullScreen: !sdkStore.media.player.camera.webFullScreen
          }
        })
        break
      case 'whiteboard':
        sdkAction.dispatch('whiteboard', {
          type: TYPES.UPDATE_WHITEBOARD_WEB_FULLSCREEN_STATE,
          payload: {
            webFullScreen: !sdkStore.whiteboard.webFullScreen
          }
        })
        break
      default:
        break
    }
  }
  // hover逻辑
  controlsHover(event) {
    event.stopPropagation()
    event.preventDefault()
  }
  // 渲染
  render(props, state) {
    // 测速icon
    let needle = (
      <svg xmlns="http://www.w3.org/2000/svg" id="speedNeedle" class={this.state.testSpeedStatus} width="4.764" height="9.734" viewBox="0 0 4.764 9.734">
        <g id="icon2" transform="translate(-1152.566 -2336.844)">
          <path
            id="路径_4444"
            data-name="路径 4444"
            d="M1155.377,2344.738l1.684-5.668,1.684,5.668a2.383,2.383,0,0,1,0,3.369h0a2.382,2.382,0,0,1-3.369,0h0A2.383,2.383,0,0,1,1155.377,2344.738Z"
            transform="translate(-2.113 -2.226)"
          />
        </g>
      </svg>
    )

    let disk = (
      <svg xmlns="http://www.w3.org/2000/svg" id="speedDisk" viewBox="0 0 24 20.88">
        <defs>
          <style></style>
        </defs>
        <title></title>
        <g id="图层_2" data-name="图层 2">
          <g id="图层_5" data-name="图层 5">
            <path
              class="cls-1"
              d="M19.84,20.88a1,1,0,0,1-.7-.29,1,1,0,0,1,0-1.41A10.12,10.12,0,0,0,12,2,10.12,10.12,0,0,0,4.87,19.18a1,1,0,0,1,0,1.41,1,1,0,0,1-1.42,0A12.12,12.12,0,0,1,12,0a12.12,12.12,0,0,1,8.56,20.58A1,1,0,0,1,19.84,20.88Z"
            />
          </g>
        </g>
      </svg>
    )

    // 刷新icon
    let reloadTpl = (
      <svg t="1577087976556" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16410" width="24" height="24">
        <path
          d="M975.424746 367.758714H767.628836a48.055585 48.055585 0 1 1 0-95.888691h83.429835A415.36934 415.36934 0 1 0 927.59164 511.70299 48.055585 48.055585 0 1 1 1023.480331 511.70299a511.70299 511.70299 0 1 1-95.888691-297.677653V127.925747a48.055585 48.055585 0 1 1 95.888691 0v191.999861a48.055585 48.055585 0 0 1-48.055585 47.833106z"
          p-id="16411"
        ></path>
      </svg>
    )

    // 全屏icon差异化
    let fullscreenTpl = null
    if (state.isFullscreenFlag) {
      fullscreenTpl = (
        <svg t="1577104736771" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6402" width="24" height="24">
          <path
            d="M708.041567 370.800959l240.652278-240.652278-63.027978-63.027978-240.652278 240.652279v-245.56355H556.610711v396.994405h399.45004V370.800959zM67.939249 548.42526v88.402877h245.563549L75.306155 877.480416l63.027978 63.027977 240.652278-240.652278v245.563549h88.402878V548.42526z"
            p-id="6403"
          ></path>
        </svg>
      )
    } else {
      fullscreenTpl = (
        <svg t="1577088691546" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17525" width="24" height="24">
          <path
            d="M793.988809 100.681055H512.409273v138.334133h181.717026L524.68745 405.179856l99.043965 97.406875L793.988809 336.422062v177.624301h140.789768V100.681055H793.988809zM500.131095 623.731415L400.268585 526.32454 230.011191 692.489209V514.046363H89.221423v413.365308h423.18785V789.896083H329.873701l170.257394-166.164668z"
            p-id="17526"
          ></path>
        </svg>
      )
    }

    // 网页全屏icon差异化
    let webFullScreen = null
    if (state.isWebFullScreenFlag) {
      webFullScreen = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g id="组_5983" data-name="组 5983" transform="translate(2535 731)">
            <rect id="矩形_8563" data-name="矩形 8563" width="24" height="24" transform="translate(-2535 -731)" opacity="0" />
            <path
              id="路径_4584"
              data-name="路径 4584"
              d="M98.5,453.25v-3.324a2.426,2.426,0,0,0-2.426-2.426H92.75"
              transform="translate(-2420.25 -275.75) rotate(180)"
              stroke-miterlimit="10"
              stroke-width="1.5"
            />
            <path
              id="路径_4585"
              data-name="路径 4585"
              d="M87.25,447.5H83.926a2.426,2.426,0,0,0-2.426,2.426v3.324"
              transform="translate(-2445.75 -275.75) rotate(180)"
              stroke-miterlimit="10"
              stroke-width="1.5"
            />
            <path
              id="路径_4586"
              data-name="路径 4586"
              d="M81.5,458.75v3.324a2.426,2.426,0,0,0,2.426,2.426H87.25"
              transform="translate(-2445.75 -250.25) rotate(180)"
              stroke-miterlimit="10"
              stroke-width="1.5"
            />
            <path
              id="路径_4587"
              data-name="路径 4587"
              d="M92.75,464.5h3.324a2.426,2.426,0,0,0,2.426-2.426V458.75"
              transform="translate(-2420.25 -250.25) rotate(180)"
              stroke-miterlimit="10"
              stroke-width="1.5"
            />
          </g>
        </svg>
      )
    } else {
      webFullScreen = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          {' '}
          <g id="组_5981" data-name="组 5981" transform="translate(2535 707)">
            <rect id="矩形_8563" data-name="矩形 8563" width="24" height="24" transform="translate(-2535 -707)" opacity="0" />
            <g id="组_5980" data-name="组 5980" transform="translate(-2612.5 -1150.5)">
              <g id="组_5978" data-name="组 5978">
                <path id="路径_4584" data-name="路径 4584" d="M98.5,453.25v-3.324a2.426,2.426,0,0,0-2.426-2.426H92.75" stroke-miterlimit="10" stroke-width="1.5" />
                <path id="路径_4585" data-name="路径 4585" d="M87.25,447.5H83.926a2.426,2.426,0,0,0-2.426,2.426v3.324" stroke-miterlimit="10" stroke-width="1.5" />
              </g>
              <g id="组_5979" data-name="组 5979">
                <path id="路径_4586" data-name="路径 4586" d="M81.5,458.75v3.324a2.426,2.426,0,0,0,2.426,2.426H87.25" stroke-miterlimit="10" stroke-width="1.5" />
                <path id="路径_4587" data-name="路径 4587" d="M92.75,464.5h3.324a2.426,2.426,0,0,0,2.426-2.426V458.75" stroke-miterlimit="10" stroke-width="1.5" />
              </g>
            </g>
          </g>
        </svg>
      )
    }

    // 是否开启日志
    let dailyTpl = null
    if (sdkStore.room.extConfig?.config?.daily) {
      dailyTpl = (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <g id="组_6655" data-name="组 6655" transform="translate(-6899 -11418)">
            <rect id="矩形_8422" data-name="矩形 8422" width="20" height="20" transform="translate(6899 11418)" opacity="0" />
            <path
              id="联合_118"
              data-name="联合 118"
              d="M3,19a3,3,0,0,1-3-3V3A3,3,0,0,1,3,0h9.258l.385.407L18,5.324V16a3,3,0,0,1-3,3ZM1.5,3.425v12.15a2,2,0,0,0,2,2h11a2,2,0,0,0,2-2v-9.4L11.564,1.425H3.5A2,2,0,0,0,1.5,3.425ZM4.634,13.5V12h9v1.5Zm0-5V7h6V8.5Z"
              transform="translate(6900 11419)"
            />
          </g>
        </svg>
      )
    }
    // html ==> dom
    return (
      /**
       * ====> HTML DOM START <======
       */
      <div class="tf-player-controls" onMouseEnter={this.controlsHover.bind(this)} onMouseover={this.controlsHover.bind(this)}>
        <div class="tf-xplayer-inner">
          {/* 日志 */}
          {dailyTpl ? (
            <span class="tf-player-daily tf-controls-icon" onClick={this.fetchDaily.bind(this)}>
              {dailyTpl}
            </span>
          ) : null}
          {/* 测速 */}
          {sdkStore.room.extConfig?.config?.testSpeed ? (
            <div class="tf-player-testSpeed tf-controls-icon" onClick={this.testSpeed.bind(this)}>
              {this.state.speedTips ? <p class="speed_tips">{this.state.speedTips}</p> : null}
              {needle}
              {disk}
            </div>
          ) : null}
          {/* 刷新 */}
          <span class="tf-player-reload tf-controls-icon" onClick={this.reload.bind(this)}>
            {reloadTpl}
          </span>
          {/* 全屏 */}
          <span class="tf-player-fullscreen tf-controls-icon" onClick={this.fullscreen.bind(this)}>
            {fullscreenTpl}
          </span>
          <span class="tf-player-webfullscreen tf-controls-icon" onClick={this.webFullScreen.bind(this)}>
            {webFullScreen}
          </span>
          {/* 音量 */}
          <span class="tf-player-volume tf-controls-icon"></span>
        </div>
      </div>
      // ====> HTML DOM END <======
    )
  }
}
