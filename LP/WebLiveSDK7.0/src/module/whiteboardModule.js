import media from '../core/mediaControler'
import liveControler from '../core/liveControler'
import tools from '../utils/tools'
import { STATIC } from '../states/staticState'
import log from '../utils/log'
import { eventStore } from '../eventStore/index'
import { sdkStore } from '../states'
import * as TYPES from '../action/action-types'
import { sdkAction } from '../action'
import { lifeCycle } from '../core/lifeCycle'

/**
 * 画板 ==> v2.0
 * 构建
 */
const whiteboardPlayer = {
  packUrl: null,
  whiteboardObject: null,
  loadPack: false,
  loadCommandLock: false,
  commands: {},
  firstLoadPage: true,
  defaultVersion: STATIC.ROOM.WHITEBOARD_VERSION,

  // 初始化
  init() {
    let initData = sdkStore.room.initData
    let extConf = sdkStore.room.extConfig
    let urlPath = location.href.match(/wbVersion=(.*?)(&|#|$)/)
    let wbVersion = null
    if (urlPath?.length > 0) {
      wbVersion = urlPath[1]
    }
    // url指定 || extconf传入 || initData || default
    let version = wbVersion || extConf.config.whiteboardVersion || initData.whiteboardVersion || this.defaultVersion
    // [## WARN ##]使用Flash播放时，不初始化H5画板
    if (sdkStore.media.player.techOrder === 'FLASH') {
      tools.debug('正在初始化Flash画板...')
      return false
    }
    // 已初始化
    if (this.whiteboardObject) {
      return this.whiteboardObject
    }
    tools.debug('Whiteborad on beforeCreate...')
    // 创建画板对象
    if (!sdkStore.whiteboard || !sdkStore.whiteboard.wrapContainer) {
      tools.debug('[PPT] Whiteboard Container ERROR...')
      return false
    }
    // 获取SDK版本
    this.packUrl = tools.getStaticHost(`https://static-1.talk-fun.com/open/maituo_v2/dist/client-whiteboard/v${version}/dist/whiteboard.pack.js${window.wHashCode ? '?' + window.wHashCode : ''}`)
    // 不需重复创建
    return this.load()
      .then(async (wbObject) => {
        tools.debug('Loaded Whiteboard Version ==>', version, this.packUrl)
        if (this.whiteboardObject) {
          return false
        }
        tools.debug('Whiteboard SDK on init...')
        // whiteboard-Object
        var modWhiteboard = await new wbObject({
          id: sdkStore.whiteboard.wrapContainer,
          powerEnable: false,
          drawPower: false,
          hostGroup: initData.hostGroup,
          isAdmin: false
        })
        // modWhiteboard.setUser({
        //   role: 'user'
        // })
        modWhiteboard.dispatch({
          modules: 'room',
          type: 'UPDATE_ROOM_CURUSER',
          payload: 'user'
        })
        // Ready
        modWhiteboard.on('wb:init:ready', (res) => {
          if (res?.room) {
            // Store.commit(TYPES.UPDATE_WHITEBOARD_VERSION, res.room.version)
            sdkAction.dispatch('whiteboard', {
              type: TYPES.UPDATE_WHITEBOARD_VERSION,
              payload: {
                version: res.room.version
              }
            })
          }
          var opts = sdkStore.room.extConfig
          // 设置controls
          if (opts.config.controls) {
            media.setControls('whiteboard', sdkStore.whiteboard.wrapContainer)
          }
          // 触发课件播放器生命周期函数
          lifeCycle.lifeControler['createdCoursewarePlayer']?.next(modWhiteboard)
          tools.callback(sdkStore.whiteboard.callback, modWhiteboard)
        })
        // set page
        modWhiteboard.on('set:page', (res) => {
          if (res?.p > 0) {
            var pageData = []
            pageData.push(res.p)
            if (res.c) {
              let c = res.c.match(/\/(.+?)\//g)
              if (c?.length > 0) {
                pageData.push(c[3].replace(/\\/g, ''))
              }
            }
            // Store.commit(TYPES.UPDATE_WHITEBOARD_PAGE, pageData.join('|'))
            sdkAction.dispatch('whiteboard', {
              type: TYPES.UPDATE_WHITEBOARD_PAGE,
              payload: {
                curPage: pageData.join('|')
              }
            })
          }
        })
        // img error
        // payload = {url: xxx, domain: url}
        modWhiteboard.on('whiteboard:image:error', (payload) => {
          tools.debug('PPT图片加载错误 ==>', payload.url)
          // 错误
          log.res(payload.url, 'image', 'error')
        })
        // img timeOut
        // payload = {url: xxx, domain: url}
        modWhiteboard.on('whiteboard:image:timeout', (payload) => {
          tools.debug('PPT图片加载超时 ==>', payload.url)
          // 错误
          log.res(payload.url, 'image', 'timeout')
        })
        // ppt ratio
        modWhiteboard.on('ppt:ratio', (payload) => {
          tools.debug('whiteboard change ratio ==>', payload.ratio)
          eventStore.emit('ppt:ratio', { ratio: payload.ratio })
        })
        this.whiteboardObject = modWhiteboard
      })
      .then(() => {
        // 跑 => step 2,6,7
        // 初始化为了渲染涂鸦
        var exeAry = [
          media.getStep(2),
          // media.getStep(6),
          media.getStep(7)
        ]
        exeAry.forEach((step) => {
          if (step) {
            liveControler.execute(step)
          }
        })
      })
      .catch((err) => {
        // 播放器初始化失败, 某些setp需要执行
        console.error('whiteboard.js load error ==>', err)
        Promise.reject('whiteboard on Reject ==>', err)
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
        wbjs.id = 'tf-wbx-pack'
        wbjs.addEventListener(
          'load',
          () => {
            reslove(window.WhiteBoard)
          },
          false
        )
        wbjs.addEventListener(
          'error',
          () => {
            reject('load script error!')
          },
          false
        )
        document.body.appendChild(wbjs)
      }
    })
  },
  // sdk传给画板的指令在这里执行（以后也要统一遵循）
  executeEvent(eventName, payload) {
    tools.debug('whiteboardPlayer emit on ==>', eventName, payload)
    // 创建
    if (eventName === 'ppt:player') {
      this.init()
    }
    // 销毁
    if (eventName === 'ppt:destroy') {
      this.destroy(payload)
    }
    // 翻页
    if (eventName === 'live:set:page') {
      this.setPage(payload)
    }
    // 权限切换
    if (eventName === 'live:power:change') {
      // 清空51原始数据
      media.setStep(51, null)
      this.destroy().then(() => {
        tools.debug('livePowerChnage success ==> reinit whiteboard...')
        setTimeout(() => {
          this.init()
        }, 300)
      })
    }
    // 涂鸦
    if (eventName === 'page:draw:data') {
      this.graphExecute(payload)
    }
    // resize
    if (eventName === 'whiteboard:resize') {
      if (this.whiteboardObject) {
        // this.whiteboardObject.whiteboardResize()
        // 白板resize会设置canvas矩阵
        this.whiteboardObject.emit(this.whiteboardObject.events.WHITEBOARD_RESIZE)
        // PPT resize会设置PPT的尺寸位置
        this.whiteboardObject.emit(this.whiteboardObject.events.PPT_RESIZE)
      }
    }
    if (eventName === 'whiteboard:on:socket') {
      this.executeCmd(payload)
    }
  },
  // 分发指令, 命令切割
  executeCmd: function (command) {
    tools.debug('command dispatch do ==>', command)
    try {
      if (typeof command === 'string') {
        command = JSON.parse(command)
      }
      // 批量指令
      if (command.t == STATIC.CMD.DRAW_LIST) {
        let jsonCommand
        for (let i = 0; i < command.d.length; i++) {
          jsonCommand = JSON.parse(command.d[i])
          liveControler.execute(jsonCommand)
        }
      }
      // 单条指令
      else {
        liveControler.execute(command)
      }
    } catch (e) {
      console.warn('catch socket画板指令')
    }
  },
  // 销毁
  destroy(callback) {
    // destroy...
    tools.debug('Whiteboard SDK on destroy...', sdkStore.media.player.techOrder)
    // Flash模式
    if (sdkStore.media.player.techOrder === 'FLASH') {
      if (callback) {
        callback()
      }
      return Promise.resolve()
    }
    // H5画板模式
    if (this.whiteboardObject) {
      this.loadCommandLock = false
      let wpDom = document.querySelector(`#${sdkStore.whiteboard.wrapContainer}`)
      if (wpDom) {
        // 画板销毁后 ==> 重新创建
        try {
          return this.whiteboardObject.destroy().then(() => {
            // 删除控制
            // mediaControler.removeControls(wpDom)
            // 执行
            this.whiteboardObject = null
            if (callback) {
              callback()
            }
          })
        } catch (err) {
          return Promise.resolve()
        }
      }
    } else {
      return Promise.resolve()
    }
  },
  // 翻页
  /**
   * @param {*} 逻辑描述
   * @returns
   * 1、首次setpage需要加载
   * 2、hd / drawlength 判断本页存在涂鸦是否需要加载command.php
   * 3、子页不加载涂鸦数据
   */
  setPage(command) {
    if (this.whiteboardObject) {
      tools.debug('Whiteboard render set Page ...', command.p)
      command.t = command.t.toString()
      let hasDraw = command.hd === 't' ? true : false
      // setpage回调
      // this.whiteboardObject.setPage(command).then(drawLength => {
      this.whiteboardObject.emit('wb:page:socketUpdatePage', { page: command }, ({ drawData }) => {
        eventStore.emit('live:set:page', command)
        // 判断当前页是否有涂鸦数据
        tools.debug(`whiteboard ${command.p} cmds => firstload: ${this.firstLoadPage}, hasDraw: ${hasDraw}, drawData: ${drawData}`)
        // 首次进入加载涂鸦
        if (!this.firstLoadPage) {
          if (drawData.length > 0 || !hasDraw) {
            return false
          }
        }
        // 非首次加载
        this.firstLoadPage = false
        // 加载翻页数据
        this.getCommands(command, (cmds) => {
          if (cmds?.length > 0) {
            cmds.forEach((item) => {
              tools.debug('run ==>', item)
              // this.whiteboardObject.render({
              //   data: item
              // })
              this.graphExecute(item)
              // this.whiteboardObject.emit(this.whiteboardObject.events.UPDATE_PAGE_DRAW_DATA, { drawData: item })
            })
          }
        })
      })
    }
  },
  // 加载指令
  getCommands: function (command, callback) {
    // 没有画板, 不加载
    if (!this.whiteboardObject || this.loadCommandLock) {
      return false
    }
    let token = sdkStore.room.access_token
    this.loadCommandLock = true
    tools.ajax({
      type: 'GET',
      url: STATIC.APP_HOST + '/live/command.php',
      dataType: 'jsonp',
      // data: 'access_token=' + sdkRoom.getAccessToken() + '&page=' + page,
      data: {
        access_token: token,
        page: command.p
      },
      success: (retval) => {
        if (retval.code == STATIC.CODE.SUCCESS) {
          tools.debug('get commands from server:', retval.data)
          callback(retval.data)
        }
        this.loadCommandLock = false
      }
    })
  },
  // 画板图形处理
  graphExecute: function (command) {
    if (this.whiteboardObject) {
      tools.debug('图形渲染 ==>', command)
      // this.whiteboardObject.render({
      //   data: command
      // })
      this.whiteboardObject.emit(this.whiteboardObject.events.UPDATE_PAGE_DRAW_DATA, { drawData: command })
    }
  },

  // 执行 whiteboard
  fireWhiteboard: function () {
    // Flash播放器todo...
    // mediaControler.emit('ppt:player', this)
    this.executeEvent('ppt:player')
    return Promise.resolve()
  }
}
export default whiteboardPlayer
