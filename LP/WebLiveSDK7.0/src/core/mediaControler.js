/**
 * ## 媒体组件相关操作 ##
 */
import tools from '../utils/tools'
import log from '../utils/log'
import { STATIC } from '../states/staticState'
import cmdSchedule from './cmdSchedule'
import liveControler from './liveControler'
import { h, render } from 'preact'

// 组件
import TControlsView from '../components/TControlsView'

// player
import flvPlayer from '../mediaPlayer/flvPlayer'
import rtsPlayer from '../mediaPlayer/rtsPlayer'
import hlsPlayer from '../mediaPlayer/hlsPlayer'
import whiteboardPlayer from '../module/whiteboardModule'
// event
import playerEvent from './playerEvent'
import { eventStore } from '../eventStore/index'
import * as TYPES from '../action/action-types'
import { sdkAction } from '../action'
import { sdkStore } from '../states'
import { sdkStoreListener } from '../states/listen'

const mediaControler = {
  // 当前播放器对象(dom)
  curPlayerDom: null,
  // 当前播放对象(player)
  curPlayerObject: null,
  // 当前资源index
  curMediaIndex: 0,
  // 当前线路
  lineIndex: 0,
  // 媒体(CDN)列表
  streams: null,
  // 当前媒体
  curStream: null,
  // 是否联网
  isOnline: true,

  // 获取视频容器
  getcurVdom() {
    if (this.curPlayerObject) {
      return this.curPlayerObject.getVideoEl()
    } else {
      return false
    }
  },
  // 设置streams
  setStreams(streams) {
    if (streams?.length > 0 && streams[0].app) {
      tools.debug('Media streams ==>', streams)
      // [DEBUG] 上线前必须要关闭 [DEBUG]
      // this.streamTest(streams)
      // [DEBUG] 上线前必须要关闭 [DEBUG]

      // streams
      this.streams = streams
      this.getCurMedia()
      this.getLines(streams)
    } else {
      tools.debug('Media streams 设置失败...')
    }
    return Promise.resolve()
  },
  // 设置前置状态
  statePreSet() {
    let data = sdkStore.room.initData

    // 模式切换
    if (data.InitData['step6']) {
      let modeData = JSON.parse(data.InitData['step6'])['c'].split('|')
      // Store.commit(TYPES.UPDATE_LIVE_MODE, modeData[1])
      sdkAction.dispatch('room', {
        type: 'UPDATE_LIVE_MODE',
        payload: {
          curMode: modeData[1]
        }
      })
    }

    // streams
    if (data.InitData['step7']) {
      let streams = JSON.parse(data.InitData['step7'])['streams']
      if (streams) {
        this.setStreams(streams)
      }
    }
  },
  // 动态更新Step
  setStep(cmdType, command) {
    if (!cmdType) {
      return false
    }
    let ctype = cmdType.toString()
    var step = null
    let cmd = null
    if (tools._typeof(command) === 'object') {
      cmd = JSON.stringify(command)
    }
    switch (ctype) {
      // step1[上下课]
      case STATIC.CMD.LIVE_START:
      case STATIC.CMD.LIVE_STOP:
        step = 1
        break
      // step4[开关摄像头]
      case STATIC.CMD.OPEN_CAMERA:
      case STATIC.CMD.CLOSE_CAMERA:
        step = 4
        break
      // step2[翻页]
      case STATIC.CMD.PAGE:
        step = 2
        break
      // step6[切换模式]
      case STATIC.CMD.MODE_CHANGE:
        step = 6
        break
      // step3[摄像头视频流]
      case STATIC.CMD.VIDEO_START:
      case STATIC.CMD.VIDEO_STOP:
        step = 3
        break
      // step7[桌面分享视频流]
      case STATIC.CMD.DESKTOP_START:
      case STATIC.CMD.DESKTOP_STOP:
        step = 7
        break
    }
    tools.debug('Update Step ==>', step, cmd)
    // 修改initData[step]
    if (step && step > -1) {
      // Store.commit(TYPES.UPDATE_STEP_DATA, {
      //   step: step,
      //   type: command && command.t || cmdType,
      //   command: cmd
      // })
      sdkAction.dispatch('room', {
        type: TYPES.UPDATE_STEP_DATA,
        payload: {
          step: step,
          type: command?.t || cmdType,
          command: cmd
        }
      })
    }
  },
  // attrs
  setVideoAttributes(video) {
    var opts = sdkStore.room.extConfig
    tools.debug('ext params ==>', opts)
    if (opts?.video && Object.keys(opts.video).length > 0) {
      let keys = Object.keys(opts.video)
      keys.forEach((item) => {
        if (item && opts.video[item]) {
          if (item === 'poster') {
            return
          }
          video.setAttribute(item, opts.video[item])
        } else {
          video.removeAttribute(item)
        }
      })
    }
  },
  // ## 测试用 ##
  streamTest(streams) {
    if (streams[0].hosts) {
      streams[0].hosts.hls = 'hlsxx'
      streams[0].hosts.flv = 'hlsxx'
      streams[1].hosts.hls = 'hlsxx988'
      streams[1].hosts.flv = 'hlsxx988'
    }
  },
  // 媒体视频切换
  mediaReplace(curMode) {
    var videopDom = document.querySelector('#talkfun-video-wrap')
    var cameraDom = document.querySelector('#talkfun-camera-wrap')
    // 判断处在哪个模式容器
    // 需要切换就调整位置
    // let playerObj = Store.getters('getPlayer')
    let playerObj = sdkStore.media.player
    let vdom = this.curPlayerObject.getVideoEl()
    let warpNodeName = null
    let wrapType = curMode == 0 ? 'camera' : 'video'
    // 获取 VIDEO 元素所在父类的ID的 ==> parentNode
    if (vdom) {
      // 这里得到 ${talkfun-(video/camera)-wrap} 父级元素
      let videoParentNodeId = vdom.parentNode.getAttribute('id')
      let videoWrapNodeId = document.querySelector('#' + videoParentNodeId).parentNode.getAttribute('id')
      warpNodeName = videoWrapNodeId
      // 更换传入ID
      vdom.setAttribute('id', playerObj[wrapType].playerId)
    }
    tools.debug('切换[DOM_Place] ==>', playerObj[wrapType].wrapContainer, warpNodeName)
    // [切换逻辑] ==> 判断父元素 DOM 是否跟外部传入的ID一致
    if (playerObj[wrapType].wrapContainer !== warpNodeName) {
      tools.replaceDom(cameraDom, videopDom)
    }
  },
  // 视频比例(桌面分享和摄像头都会用到)
  setRatio(c, t) {
    if (c) {
      let path = c.split('|')
      let ratio = 0
      let o = {
        width: 0,
        height: 0
      }
      if (t == 'desktop') {
        ratio = path[3] / path[2]
        o.width = path[2]
        o.height = path[3]
      }
      if (t == 'camera') {
        ratio = path[4] / path[3]
        o.width = path[3]
        o.height = path[4]
      }
      if (!ratio) {
        return false
      }
      eventStore.emit('live:video:ratio', {
        type: t,
        width: o.width,
        height: o.height,
        ratio: ratio
      })
    }
  },
  // 获取线路
  getLines(streams) {
    var _list = []
    if (!streams) {
      streams = this.streams
    }
    streams.forEach((item, key) => {
      if (item.host) {
        var o = {
          key: key,
          label: '线路' + (key + 1)
        }
        _list.push(o)
      }
    })
    eventStore.emit('live:network:list', _list)
    return _list || []
  },
  // 设置线路
  setLine(index) {
    // 如果没有stream则return
    if (!this.streams) return
    let indexLine = index || 0
    // indexLine = this.lineIndex += 1
    var _streams = this.getMediaList(this.streams[indexLine])
    if (this.curPlayerObject) {
      this.reload(_streams)
    }
    this.lineIndex = indexLine
  },
  // 自动切换
  autoSetLine() {
    if (!this.streams) {
      return false
    }
    if (this.lineIndex > -1) {
      this.lineIndex += 1
      if (this.lineIndex > this.streams.length - 1) {
        this.lineIndex = 0
      }
      tools.debug('Stream auto change ==>', this.lineIndex)
      this.setLine(this.lineIndex)
    }
  },
  // 媒体资源错误 => 重试
  onError(type, vdom) {
    tools.debug('视频流错误, 重试中...', type, this.curMediaIndex, this.getMediaList())
    if (!this.isOnline) {
      tools.warn('网络已断开,请重新连网后重试...')
      return Promise.reject()
    }
    // flv.js
    if (type === 'flvplayer') {
      log.res(this.getMediaList().flv, 'flv')
    }
    // hls.js
    else if (type === 'hlsplayer') {
      log.res(this.getMediaList().hls, 'm3u8')
    }
    this.curMediaIndex += 1
    if (this.curMediaIndex > this.streams.length - 1) {
      this.curMediaIndex = 0 //this.streams.length - 1
    }
    tools.debug('Retrying ==>', this.streams[this.curMediaIndex])
    // 设置新流
    return this.setCurMedia(this.curMediaIndex).then(() => {
      // 原生播放器 => 直接设置cdn数组地址
      if (vdom) {
        this.reloadNativeVideo(vdom, this.getMediaList())
      }
      return Promise.resolve(this.getMediaList())
    })
  },
  // 设置vdom
  setVideoDom(dom) {
    tools.debug('set vdom ==>', dom)
    if (this.videoDom) {
      this.videoDom = dom
    }
  },
  // 设置摄像头容器 or 视频容器
  getVideoDom(kind, warpOnly) {
    tools.debug('Create video dom from ==>', kind)
    // const player = Store.getters('getPlayer')
    const player = sdkStore.media.player
    if (!player[kind]) {
      tools.warn('未定义播放器类型, 请指定获取类型')
      return false
    }
    let vDom = player[kind]
    var docEl = document.querySelector('#' + vDom.wrapContainer)
    if (!docEl) {
      tools.debug(`[${kind}]video wrapper not found! ==> ${vDom.wrapContainer}`)
      return false
    }

    // 外层容器
    let wpDom = document.querySelector(`#talkfun-${kind}-wrap`)
    let wpDomObj = null
    if (!wpDom) {
      tools.debug(`create #talkfun-${kind}-wrap warp.`)
      let wrapContainer = document.createElement('div')
      wrapContainer.id = `talkfun-${kind}-wrap`
      wrapContainer.style['width'] = '100%'
      wrapContainer.style['height'] = '100%'
      docEl.appendChild(wrapContainer)
      wpDomObj = wrapContainer
    } else {
      wpDomObj = wpDom
    }

    // 只创建外部容器
    if (warpOnly) {
      return false
    }

    var curVideoDom = this.videoDom,
      that = this
    // 外部传输配置(禁用摄像头)
    // var role = tools.getRoom().user.role;
    // get element
    // var techOrder = Store.getters('getTechOrder')
    var techOrder = sdkStore.media.player.techOrder
    if (sdkStore.room.initData) {
      // 如果是大班低延迟并且支持rts--判断条件改成当前播放类型是否是rts
      // todo... 需要把是否支持rts的方法写到tools
      if (techOrder == 'rts' || techOrder == 'RTS') {
        // 如果是大班低延迟则不需要创建video
        rtsPlayer.camera(`talkfun-${kind}-wrap`)
        // 更新画板延迟
        cmdSchedule.set('cmdDelay', 0.5)
        // 自定义controls
        var opts = sdkStore.room.extConfig
        if (opts.config.controls) {
          this.setControls(kind, wpDomObj)
        }
        return
      }
    }
    if (!this.videoDom) {
      tools.debug('create video dom.')
      var element = document.createElement('video')
      this.videoDom = element
      //safair 浏览器
      if (tools.isWechat()) {
        element.className = 'camera_wechat'
      }
      // player id
      element.id = vDom.playerId

      // 限制自动全屏属性(某些浏览器生效)
      element.setAttribute('webkit-playsinline', 'webkit-playsinline')
      element.setAttribute('webkit-playsinline', 'true')
      element.setAttribute('playsinline', '')
      // element.setAttribute("x5-playsinline", "");
      element.setAttribute('autoplay', '')
      element.setAttribute('preload', 'auto')
      element.setAttribute('raw-controls', 'true')
      element.setAttribute('x5-video-player-type', 'h5-page')
      if (tools.isCompatible()) {
        element.setAttribute('x5-video-player-type', 'h5')
      }

      // element.removeAttribute('controls');
      element.style['width'] = '100%'
      element.style['height'] = '100%'
      element.style['display'] = 'block'

      // 公共设置
      this.setVideoAttributes(element)

      // save
      that.videoDom = element

      // 插入DOM
      wpDomObj.innerText = ''
      wpDomObj.appendChild(element)

      // 事件绑定
      playerEvent.bindEvent(element, kind)

      // that.play()
      mediaControler.elementPlay(element)

      // 微信自动播放
      tools.detectiveWxJsBridge(() => {
        // element.play()
        mediaControler.elementPlay(element)
      })

      // 自定义controls
      var opts = sdkStore.room.extConfig
      if (opts.config.controls) {
        this.setControls(kind, wpDomObj)
      }
      return element
    }
    // 已创建
    else {
      return curVideoDom
    }
  },
  // 清空视频流队列
  // [注意]：仅在直播结束执行, 直播过程中不能操作
  clearStreams() {
    // 媒体(CDN)列表
    this.streams = null
    // 当前媒体源
    this.curStream = null
  },
  // 销毁
  destroy() {
    tools.debug('Media on destroy all!')
    // 当前播放器对象(dom)
    // this.curPlayerDom = null
    // 当前播放对象(player)
    // this.curPlayerObject = null
    // 当前资源index
    this.curMediaIndex = 0
    this.removeControls()
    return Promise.resolve()
  },
  // execute执行
  on(type, payload) {
    switch (type) {
      case 'media:destroy':
        if (payload === 'global') {
          this.destroy()
        }
        break
      case 'live:stop':
        this.clearStreams()
        break
      // 断开
      case 'live:network:offline':
        this.isOnline = false
        break
      // timeout
      case 'live:video:timeout':
        this.autoSetLine()
        break
      // 在线
      case 'live:network:online':
        this.isOnline = true
        // 重新连网后,执行reload
        setTimeout(() => {
          this.reload()
        }, 1200)
        break
      default:
        break
    }
  },
  // 执行指令
  emit() {
    // 事件监听
    let player = this.curPlayerObject
    tools.debug('## mediaControler Emit ==>', Array.prototype.slice.call(arguments))
    // 视频播放器
    if (player?.on) {
      player.on.apply(player, arguments)
    }
    // 画板
    if (whiteboardPlayer) {
      whiteboardPlayer.executeEvent.apply(whiteboardPlayer, arguments)
    }
    // schedule指令同步
    cmdSchedule.on.apply(cmdSchedule, arguments)
    // h5上下文
    liveControler.on.apply(liveControler, arguments)
    // 上下文监听执行
    this.on.apply(this, arguments)
  },

  // 获取当前媒体包 => streams[index]
  setCurMedia(index) {
    this.curStream = this.streams[index]
    return Promise.resolve(this.curStream)
  },
  // 设置当前播放器
  setCurPlayer(player) {
    if (player) {
      this.curPlayerObject = player
    }
  },
  // 获取当前播放器
  getPlayer() {
    if (this.curPlayerObject) {
      return Promise.resolve(this.curPlayerObject)
    }
    return Promise.reject(false)
  },
  // 播放器对象
  setCurPlayerDom(vdom) {
    this.curPlayerDom = vdom
  },
  // 重载播放器
  reloadNativeVideo(vdom, sourceList) {
    let src = sourceList.hls
    if (vdom && src) {
      vdom.src = src
      vdom.load()
      mediaControler.elementPlay(vdom)
    }
  },
  // 重试
  reload(stream) {
    tools.debug('media on reload...')
    if (this.isOnline) {
      if (this.curPlayerObject) {
        playerEvent.reload()
        this.curPlayerObject.reload(stream)
      }
    } else {
      tools.warn('reload失败, 离线中...')
    }
  },
  // 获取当前媒体
  getCurMedia(index) {
    if (index > -1) {
      index = index
    } else {
      index = 0
    }
    return (this.curStream = this.streams[index])
  },
  // 获取step
  getStep(stepIndex) {
    let _data = sdkStore.room.initData
    if (!_data || !_data.InitData) {
      return false
    }
    var initData = _data.InitData
    return initData['step' + stepIndex]
  },
  // 获取媒体资源
  getMediaList(stream) {
    if (!stream && !this.curStream) {
      return false
    }
    let mediaList = {
      hls: tools.getVideoUrl(stream || this.curStream),
      flv: tools.getFlvVideoUrl(stream || this.curStream),
      rtmp: tools.stream2Rtmp(stream || this.curStream),
      rtmpPath: tools.stream2RtmpPath(stream || this.curStream),
      source: stream || this.curStream
    }
    tools.debug('Get media socure list ==>', mediaList)
    return mediaList
  },
  // 初始化事件触发
  initPlayer() {
    // 调用 curPlayerObject.emit() ==> 执行对应 curPlayerObject.on()
    this.emit('ppt:player')
    this.emit('camera:player')
    this.emit('video:player')
  },
  // video.DOM播放
  elementPlay: function (_videoDom) {
    if (_videoDom) {
      var that = this
      // var playTarget = null

      // 播放中状态
      let onPlaying = function () {
        tools.debug('H5 player is playing.')
        eventStore.emit('live:video:onplay')
        return Promise.resolve('success')
      }

      // 无法播放状态
      let onError = function (err) {
        tools.warn('h5 player play Exception! Autoplay disabled!')
        eventStore.emit('live:video:pause')
        mediaControler.emit('live:video:pause', 'pause')
        // 海报展示
        that.showPoster(_videoDom)
        return Promise.resolve('error')
      }

      // 普通错误
      tools.debug('vdom fire play...')
      let playObj = _videoDom.play().catch((err) => {
        onError()
        tools.warn('In play() function Exception! Autoplay disabled!', err)
      })

      // 不支持播放->promise对象 || 支持Promise
      if ((playObj && playObj instanceof Promise) || (!playObj && Promise)) {
        // 播放逻辑: 如果执行了播放, video状态是暂停, 说明自动播放失败
        if (_videoDom.paused) {
          return onError()
        } else {
          return onPlaying()
        }
      }
      // 都不支持
      else {
        return null
      }
    }
  },

  // 从 => init.streamType 获取优先加载规则
  // 注意：如果是大版低延迟需要手动修改type
  setTechOrder(setType) {
    let type = null
    // let curPlayerObject = null
    if (setType) {
      type = setType
    } else {
      const streamType = sdkStore.room.initData.streamType
      type = streamType[0]
    }
    if (sdkStore.room.initData?.room.modetype == STATIC.LOWDELAY_MODE) {
      // 如果是大班低延迟则手动修改type
      type = 'RTS'
    }
    // type = 'flv'
    if (type) {
      type = type.toLocaleUpperCase()
    }
    let otype = type === 'RTMP' ? 'FLASH' : type
    let flashChecker = tools.flashChecker()
    // 未安装Flash => flv播放
    if (otype === 'FLASH' && !flashChecker.flash) {
      tools.warn('当前浏览器不支持Flash插件,正在使用H5播放器...')
      type = 'FLV'
      otype = type
    }
    // 不支持flv => hls播放
    if (type === 'FLV') {
      if (!flvPlayer.isSupported()) {
        type = 'HLS'
        otype = type
      }
    }
    // update => techOrder
    eventStore.emit('live:tech:order', otype)
    // Store
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_TECH_ORDER,
      payload: {
        techOrder: otype
      }
    })
    tools.debug('Current TechOrder ==>', type)
    // 选择播放器
    switch (type) {
      case 'RTMP':
      case 'FLV':
        this.setCurPlayer(flvPlayer)
        break
      case 'HLS':
        this.setCurPlayer(hlsPlayer)
        break
      case 'RTS':
        this.setCurPlayer(rtsPlayer)
        break
      // 默认Flv
      default:
        setType = null
        return null
    }
    // 初始化事件
    if (setType) {
      this.initPlayer()
    }
    // curPlayerObject = this.curPlayerObject
  },
  // 媒体切换操作
  mdeidaOnModeChange: function () {
    // 删除poster
    var playPoster = document.querySelector(sdkStore.media.player.playItems.posterId)
    if (playPoster) {
      tools.debug('remove kit ==>', playPoster)
      playPoster.parentNode.removeChild(playPoster)
    }
    // 删除playicon
    var playIcon = document.querySelector(sdkStore.media.player.playItems.playerIcon)
    if (playIcon) {
      tools.debug('remove kit ==>', playIcon)
      playIcon.parentNode.removeChild(playIcon)
    }
  },
  // 自定义控制条
  setControls(type, ctrDom) {
    tools.debug('set config controls ==>', type, ctrDom)
    let dom = typeof ctrDom === 'string' ? document.querySelector('#' + ctrDom) : ctrDom || null
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
    if (!pNode) {
      tools.debug('remove all controls...')
      let list = document.querySelectorAll('.tf-x-controls')
      list.forEach((item) => {
        item.parentNode.removeChild(item)
      })
      return false
    }
    let targetNode = pNode.querySelector('.tf-x-controls')
    if (targetNode) {
      targetNode.parentNode.removeChild(targetNode)
    }
  },
  getPlayIcon(__videoDom) {
    tools.debug('Start getPlayIcon toolkit...')
    let __playerIcon = document.querySelector(sdkStore.media.player.playItems.playerIcon)
    // 已存在icon
    if (__playerIcon) {
      __playerIcon.style.display = 'block'
      return false
    }
    // 无video dom
    if (!__videoDom?.parentNode) {
      return false
    }

    // 播放按钮
    let el = document.createElement('div')
    el.id = sdkStore.media.player.playItems.playerIcon.replace('#', '')
    el.style['position'] = 'absolute'
    el.style['width'] = '100%'
    el.style['height'] = '100%'
    el.style['z-index'] = '100'
    el.style['top'] = '0'
    el.style['left'] = '0'
    el.style['zIndex'] = 100
    el.style['cursor'] = 'pointer'
    el.style.cssText += 'background-image: url(' + STATIC.player.PLAY_ICON + ');background-repeat: no-repeat; background-position: 50% 50%;'
    __videoDom.parentNode.appendChild(el)

    // // 播放海报
    // if (sdkStore.room.extConfig.video.poster) {
    //   let elPoster = document.createElement('div')
    //   elPoster.id = sdkStore.media.player.playItems.posterId.replace('#', '')
    //   elPoster.style['position'] = 'absolute'
    //   elPoster.style['width'] = '100%'
    //   elPoster.style['height'] = '100%'
    //   elPoster.style['z-index'] = '100'
    //   elPoster.style['top'] = '0'
    //   elPoster.style['left'] = '0'
    //   elPoster.style['zIndex'] = 90
    //   elPoster.style['cursor'] = 'pointer'
    //   elPoster.style.cssText += `
    //     background: url('${sdkStore.room.extConfig.video.poster}') rgba(0, 0, 0, 0.65) 50% 50% no-repeat;
    //     background-size: contain;
    //     `
    //   __videoDom.parentNode.appendChild(elPoster)
    // }

    // event
    el.addEventListener(
      'click',
      () => {
        // 播放完毕删除按钮 & 去事件
        __videoDom.play().then(function () {
          __videoDom.style.width = '100%'
          __videoDom.style.height = '100%'
        })
        el.removeEventListener('click', null, false)
        el.style.display = 'none'
        // poster隐藏
        this.hidePoster()
      },
      false
    )
    this.showPoster()
  },
  // 隐藏播放按钮
  removePlayIcon() {
    tools.debug('remove player toolkit...')
    // 如果有playicon => 隐藏
    let __playerIcon = document.querySelector(sdkStore.media.player.playItems.playerIcon)
    if (__playerIcon) {
      __playerIcon.style.display = 'none'
    }
    // 如果有poster => 隐藏
    this.hidePoster()
  },
  // 隐藏海报
  hidePoster() {
    let __posterId = document.querySelector(sdkStore.media.player.playItems.posterId)
    if (__posterId) {
      __posterId.style.display = 'none'
    }
  },
  // 显示海报
  showPoster() {
    // 配置开启了海报
    if (sdkStore.room.extConfig.video.poster) {
      // 海报已创建
      let playPoster = document.querySelector(sdkStore.media.player.playItems.posterId)
      if (playPoster) {
        playPoster.style.display = 'block'
      }
      // 海报未创建
      else {
        // 判断有无videoDom
        let __videoDom = this.getcurVdom()
        if (__videoDom?.parentNode) {
          let playPoster = document.createElement('div')
          playPoster.id = sdkStore.media.player.playItems.posterId.replace('#', '')
          playPoster.style['position'] = 'absolute'
          playPoster.style['width'] = '100%'
          playPoster.style['height'] = '100%'
          playPoster.style['z-index'] = '100'
          playPoster.style['top'] = '0'
          playPoster.style['left'] = '0'
          playPoster.style['zIndex'] = 90
          playPoster.style['cursor'] = 'pointer'
          playPoster.style.cssText += `background: url('${sdkStore.room.extConfig.video.poster || ''}') rgba(0, 0, 0, 0.65) 50% 50% no-repeat;background-size: contain;`
          __videoDom.parentNode.appendChild(playPoster)
        }
      }
    }
  },
  // 注册mobx监听数据
  listen() {
    // 监听播放按钮icon
    sdkStoreListener.listen(
      () => sdkStore.media.player.status,
      (status) => {
        // 如果video dom存在才操作icon
        let __videoDom = this.getcurVdom()
        if (__videoDom) {
          if (status == 'playing') {
            this.removePlayIcon(__videoDom)
          } else {
            this.getPlayIcon(__videoDom)
          }
        }
      }
    )
  }
}
// window.__media = media
// module.exports = media
export default mediaControler
