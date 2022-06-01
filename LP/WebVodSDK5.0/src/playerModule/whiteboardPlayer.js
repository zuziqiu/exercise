import media from '../core/mediaCore'
import tools from '../common/utils/tools'
// import STATIC from './mt.static'
import mediaCore from '../core/mediaCore'
import cmdSchedule from '../core/cmdSchedule'
import sdkStore from '@/sdkStore';
// import map from '../common/utils/map'
// import { h, render } from 'preact'

/**
 * 画板 ==> v2.0
 * 构建
 */
const whiteboardPlayer = {
  packUrl: null,
  whiteboardObject: null,
  loadPack: false,
  loadCommandLoack: false,
  commands: {},
  //  build
  build(wpCon, callback) {
    // const wbDom = document.querySelector('#' + wpCon)
    this.init()
  },
  // 初始化
  init() {
    let initData = sdkStore.getState().global.data;
    let config = sdkStore.getState().room.extConfig
    let wbVersion = config.whiteboardVersion || '2.6.0'
    let urlPath = location.href.match(/wbVersion=(.*?)(&|$)/)
    if (urlPath && urlPath.length > 0) {
      wbVersion = urlPath[1]
    }
    this.packUrl = tools.getStaticHost(`https://static-1.talk-fun.com/open/maituo_v2/dist/client-whiteboard/v${wbVersion}/dist/whiteboard.pack.js`)
    // }
    // Rtmp 使用flash播放，不初始化 echo
    // if (getter.getTechOrder() === 'FLASH') {
    // 已初始化
    if (this.whiteboardObject) {
      return this.whiteboardObject
    }
    tools.debug('Whiteborad on beforeCreate...')
    // 创建画板对象
    var player = sdkStore.getState().player
    const wpData = player['whiteboardPlayer']
    if (!wpData || !wpData.wrapContainer) {
      tools.warn('[PPT]课件播放器容器初始化错误...')
      return false
    }
    // 不需重复创建
    return this.load().then((wbObject) => {
      if (this.whiteboardObject) {
        return false
      }
      // mod_main_player
      tools.debug('Whiteboard SDK on init...')
      var modWhiteboad = new wbObject({
        id: wpData.wrapContainer,
        powerEnable: false,
        isAdmin: false,
        hostGroup: initData.hostGroup
      })
      // var modWhiteboad = new wbObject(wpData.wrapContainer, false, false )

      modWhiteboad.on('whiteboard:init:ready', () => {
        var opts = sdkStore.getState().room.extConfig
        if (opts.config.controls) {
          media.setControls('whiteboard', wpData.wrapContainer)
        }
      })
      modWhiteboad.setUser({
        role: 'user'
      })
      this.whiteboardObject = modWhiteboad
      this.whiteboardObject.whiteboardResize()
      // 开始跑画板加载完成前存储的命令
      cmdSchedule.run({ type: 'wb' })
      tools.callback(wpData.callback, modWhiteboad)
    })
  },
  // 加载
  load() {
    return new Promise((reslove, reject) => {
      // 直接引入对象
      if (window.WhiteBoard) {
        reslove(window.WhiteBoard)
      }
      // 创建Dom
      else {
        if (this.loadPack) {
          return false
        }
        this.loadPack = true
        var wbjs = document.createElement('script')
        wbjs.src = this.packUrl
        wbjs.addEventListener('load', () => {
          reslove(window.WhiteBoard)
        }, false)
        wbjs.addEventListener('error', () => {
          reject('load script error!')
        }, false)
        document.body.appendChild(wbjs)
      }
    })
  },
  // 播放器
  getPlayer(callback) {
    if (this.whiteboardObject) {
      if (typeof callback === 'function') {
        callback(this.whiteboardObject)
      }
    }
  },
  // 销毁
  destroy(callback) {
    // destroy...
    tools.debug('Whiteboard SDK on destroy...', sdkStore.getState().room.extConfig.config?.teacherOrder)
    // Flash模式
    if (
      sdkStore.getState().room.extConfig.config?.teacherOrder === 'FLASH') {
      if (callback) {
        callback()
      }
      return Promise.resolve()
    }
    // H5画板模式
    if (this.whiteboardObject) {
      // this.loadCommandLoack = false
      let player = sdkStore.getState().player
      const wpData = player.whiteboardPlayer
      let wpDom = document.querySelector('#' + wpData.wrapContainer)
      if (wpDom) {
        // 画板销毁后 ==> 重新创建
        this.whiteboardObject.destroy().then(() => {
          // 删除控制
          mediaCore.removeControls(wpDom)
          // 执行 
          this.whiteboardObject = null
          // window.WhiteBoard = null
          // this.loadPack = false
          if (callback) {
            callback()
          }
        })
      }
    }
  },
  // 翻页
  setPage(command) {
    // 翻页
    // media.emit('live:set:page', command)
    // // outter
    // map.get('live:set:page')(command)
    tools.debug('Whiteboard render set Page ...', command.p)
    command.t = command.t.toString()
    this.whiteboardObject.setPage(command)
    // 翻页时清空当前页涂鸦数据
    this.whiteboardObject.clearDrawData(command.p)
  },
  // 事件
  on(eventName, payload) {
    let that = this
    tools.debug('whiteboard emit on ==>', eventName, payload)
    // 创建
    if (eventName === 'ppt:player') {
      cmdSchedule.addSchedule({
        callback: function () {
          that.init()
        },
        type: 'sdk'
      })
    }
    // 销毁
    if (eventName === 'ppt:destroy') {
      this.destroy(payload)
    }
    // 翻页
    if (eventName === 'live:set:page') {
      if (that.whiteboardObject) {
        that.setPage(payload)
      } else {
        cmdSchedule.addSchedule({
          callback: function () {
            that.setPage(payload)
          },
          type: 'wb'
        });
      }
    }
  },
    // 重置
  resize() {
    if (whiteboardPlayer.whiteboardObject) {
      whiteboardPlayer.whiteboardObject.whiteboardResize()
    } else {
      console.log('请在whiteboardObject初始化后调用resize')
    }
  }
}
window.__whiteboard = whiteboardPlayer
export default whiteboardPlayer
