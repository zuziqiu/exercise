// import videojs from 'video.js'
import mp4Blob from './mp4Blob'
import tools from '../common/utils/tools'
// import HLS from 'hls.js'
import playerCore from './player.core'
import whiteboardPlayer from '../playerModule/whiteboardPlayer'
import videolayer from './video.player'
// 组件
import TControlsView from './components/TControlsView'
import { h, render, Component } from 'preact'
export default {
  // 事件
  emit() {
    // 画板
    if (whiteboardPlayer) {
      whiteboardPlayer.on.apply(whiteboardPlayer, arguments)
    }
    // videolayer
    if (videolayer) {
      videolayer.on.apply(videolayer, arguments)
    }
    // vodPlayer
    if (playerCore.vodPlayer) {
      playerCore.vodPlayer.on.apply(playerCore.vodPlayer, arguments)
    }
  },
  // 事件监听
  on() {

  },
  // reload
  reload () {
    // vodPlayer
    if (playerCore.vodPlayer) {
      playerCore.vodPlayer.reload()
    }
  },
  // 公共事件
  commonEvent(element) {
    var that = this
    if (element) {
      // x5退出全屏
      element.addEventListener('x5videoexitfullscreen', function () {
        // playerCore
        playerCore.elementPlay(element)
      })
      // x5进入全屏
      element.addEventListener('x5videoenterfullscreen', function () {
        // playerCore
        playerCore.elementPlay(element)
      })
      // 自动播放
      tools.detectiveWxJsBridge(function () {
        playerCore.elementPlay(element)
      })
      // 离线
      window.addEventListener('online', function () {
        that.emit('vod:on:online')
      }, false)
      window.addEventListener('offline', function () {
        that.emit('vod:on:offline')
      }, false)
    }
  },
  // 设置属性
  setAttrs(element) {
    if (element) {
      element.setAttribute("autoplay", "");
      element.setAttribute("preload", "auto");
      element.setAttribute("webkit-playsinline", "webkit-playsinline");
      element.setAttribute("playsinline", "");
      element.setAttribute('controls', 'true')
      // 禁止下载
      // element.setAttribute('controlsList', 'nodownload')
      // element.setAttribute('raw-controls', 'true')
      element.setAttribute("x5-video-player-type", "h5-page");
    }
  },
  // 自定义控制条
  setControls(type, ctrDom) {
    tools.debug('set config controls...')
    let dom = typeof ctrDom === 'object' ? ctrDom : document.querySelector('#' + ctrDom)
    if (!dom) {
      return false
    }
    let targetNode = dom.querySelector('.tf-x-controls')
    if (targetNode) {
      return false
    }
    var ctrVdom = document.createElement('div')
    ctrVdom.className = 'tf-x-controls'
    dom.appendChild(ctrVdom)
    render(<TControlsView tplType={type} fullDom={dom} />, ctrVdom)
    return Promise.resolve()
  },
  // 删除按钮
  removeControls(pNode) {
    tools.debug('remove config controls...')
    // let pNode = dom.parentNode
    let targetNode = pNode.querySelector('.tf-x-controls')
    if (targetNode) {
      targetNode.parentNode.removeChild(targetNode)
    }
  },
  isSupportedMp4Bblob () {
    return mp4Blob.checkSupported()
  },
  // hls 播放器
  hlsPlayer() {
    
  },
  // mp4 播放器
  mp4BlobPlayer() {
    return mp4Blob.init.apply(mp4Blob, arguments)
  },
  // // video player
  // videojsPlayer () {
  //   // if ()
  //   return videojs.apply(videojs, arguments)
  // }

}