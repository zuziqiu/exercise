/**
 * @author Marko
 * @date 2018/June
 * @description Reudx + Preact
 * 入口文件
 */

// Needs
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { state } from './states/baseState'
import * as Reducers from './reducer/index'
import { globalStore } from './states/globalStore'
import { MainTemplate } from './components/index'
import { WebCommandApi } from './extensions/WebCommandApi'
import emitter from './extensions/emitter'
import * as TYPES from './Action/action-types'
import { Page } from './core/page'
import * as tools from './extensions/util'
import { STATIC } from './states/staticState'
import VConsole from 'vconsole'
import { logger } from 'redux-logger'
import { graphic } from './graphic'
import { graphicTempObject } from './core/graphicTempObject'

// Import the necessary methods for saving and loading
import { save, load, clear } from "redux-localstorage-simple"
import thunk from 'redux-thunk'
// import { promises } from 'dns';
// import reduxPromiseMiddleware from 'redux-promise-middleware'

/**
 * ## 初始化配置从服务器读取 ##
 */

// Redux init.
export class WhiteBoard {
  constructor({ id, powerEnable = true, isAdmin, hostGroup = [], identifyId = '' }) {
    // this.vconsole = new VConsole()
    tools.log(id, powerEnable, isAdmin)
    this.Store = null
    this._emitter = emitter
    this.vconsole = null
    this.init(id, powerEnable, isAdmin, hostGroup, identifyId)
    this.listen()
  }
  // 入口
  init(id, powerEnable, isAdmin, hostGroup, identifyId) {
    const _reducer = combineReducers(Reducers)
    let _state = state
    // 初始化的涂鸦权限
    _state.room.powerEnable = powerEnable
    _state.room.whiteboardContainerId = '#' + id
    // 设置资源重试域名组
    _state.sourceReLoad['hostGroup'] = hostGroup
    let Store = null
    // 本地存储记录（发起者 || 管理者）
    if (isAdmin) {
      const middlewares = [save({
        namespace: "_TF_WB_" + identifyId
      }),
        thunk
      ]
      const debug = tools.getQueryStr('debug')
      if (debug === 'true') {
        state.debugMode = 'true'
        this.vconsole = new VConsole()
      }
      if (debug === 'list') {
        middlewares.push(logger);
      }
      save(_state)
      Store = createStore(_reducer, load({
        namespace: "_TF_WB_" + identifyId
      }), applyMiddleware(
        ...middlewares
      ))

      // Store = createStore(_reducer, load({ namespace: "_TF_WB_" }), applyMiddleware(
      //   save({ namespace: "_TF_WB_" }),
      //   thunk,
      //   // reduxPromiseMiddleware,
      //   logger
      // ))
    } else {
      const middlewares = [thunk]
      const envFlag = tools.getQueryStr('debug')
      if (envFlag === 'true') {
        state.debugMode = 'true'
        this.vconsole = new VConsole()
      }
      if (envFlag === 'list') {
        middlewares.push(logger);
      }
      Store = createStore(_reducer, _state, applyMiddleware(
        ...middlewares
      ))
      // Store = createStore(_reducer, _state, applyMiddleware(
      //   thunk,
      //   // reduxPromiseMiddleware,
      //   logger
      // ))
    }
    // Save store & init Components => (<Main />)
    globalStore.setStore(Store, MainTemplate, id)
    // this.vconsole = new VConsole()
    // WebCommandApi init
    this.WebCommandApi = new WebCommandApi(function () {
      this.sendToQt({ "key": "RELOAD_COMPLETE" })
    }, function () {
      this.sendToWebview('{"origin":"talkfun","params":"wbLoaded"}')
      // 执行webpSupport可以记录PPT是否支持jpeg的判断
      tools.webpSupport()
    })
    globalStore.setQt(this.WebCommandApi)
    // 监听状态
    this.Store = globalStore.reducerStore
    // page
    this.Page = new Page()
    // 更新当前用户角色
    // if (isAdmin) {
    //   this.setUser({
    //     role: 'admin'
    //   })
    // } else {
    //   this.setUser({
    //     role: 'user'
    //   })
    // }
    // 暴露画板初始化的状态
    setTimeout(() => {
      emitter.emit('whiteboard:init:ready', this.Store.getState())
      if (this.Store.getState().page.currentPage > 0) {
        // 清除文字&图片缓存的对象，缓存对象只允许第一次数据执行创建KLSS对象，use多次进入时会执行removeKlss
        graphicTempObject.clear()
        this.Page.use({ PAGE: this.Store.getState().page.currentPage, SUB_PAGE: this.Store.getState().page.currentSubPage })
      }
      // 特殊逻辑：如果当前画笔是橡皮擦，需要在涂鸦渲染后再实例一次，目的是设置涂鸦对象的可选属性，否则刷新后擦除不了涂鸦
      if (this.Store.getState().whiteboard.brushType === STATIC.ERASE) {
        // 设置橡皮擦cursor
        tools.setCursor({ 'brushType': STATIC.ERASE })
        // 实例化橡皮擦
        graphic.getBrushType({
          brush: STATIC.ERASE
        })
      }
      console.log(`whiteboard Version v${this.Store.getState().room.version}, debug=${this.Store.getState().debugMode} `)
    }, 0)
    // setTimeout(() => {
    //   var a = {ap: 1,
    //     c: "https://s2.talk-fun.com/8/doc/ff/06/86/259a991741350ffc8d280cf409/|4|0|0.625,0,0,0.625,0,0|16777215|1",
    //     hd: "f",
    //     n: 16,
    //     p: 4,
    //     st: 894.51,
    //     t: 51,
    //     x: "245128419"}
    //   // this.WebCommandApi.reciveFromCommand(JSON.stringify(a))
    //   this.Page.transport(a)
    // }, 1000);
    // setTimeout(() => {
    //   var f =  {"key": "LIVE_SET_PAGE", "data": {"id": "10003", "ret": {"backgroundColor": "#2B6846"}, "pageAmount": "1", "pageIndex": "10003", "subIndex": "1"}, "isSend": "1"}
    //   this.WebCommandApi.reciveFromCommand(f)
    // }, 1000);
    // setTimeout(() => {
    //   var b = { "key": "FIRE_DEBUG_MODE", "data": { "visible": "true" } }
    //   this.WebCommandApi.reciveFromCommand(b)
    // }, 2000)
    // setTimeout(() => {
    //   var f = { "key": "LIVE_SET_PAGE", "data": { "ret": { "backgroundColor": "#2B6846" }, "pageAmount": "1", "id": "10002", "pageIndex": "10002", "subIndex": "1" }, "isSend": "1" }
    //   this.WebCommandApi.reciveFromCommand(f)
    // }, 3000);
    // setTimeout(() => {
    //   var c = { "type": "25", "key": "WHITEBOARD_BRUSH_TYPE", "data": "" }
    //   this.WebCommandApi.reciveFromCommand(c)
    // }, 4000)
    // setTimeout(() => {
    //   var d = { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 5000);
    // setTimeout(() => {
    //   var d = { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 6000);
    // setTimeout(() => {
    //   var d = { "key": "UPDATE_ROOM_DRAW_ENABLE", "data": true }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 7000); setTimeout(() => {
    //   var d = { "type": "pptx", "key": "LIVE_SET_PAGE", "isSend": 1, "data": { "pageAmount": "10", "id": "1487741", "pageIndex": "1", "ret": { "serverPath": "https://s2.talk-fun.com/8/doc/f0/02/d1/83864e81f0af2b9ea6122a6513/", "html5": "", "currentPage": "1", "pages": { "10": { "subPage": [] }, "2": { "subPage": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"] }, "6": { "subPage": [] }, "9": { "subPage": [] }, "7": { "subPage": ["1", "2", "3", "4", "5"] }, "3": { "subPage": [] }, "5": { "subPage": [] }, "4": { "subPage": [] }, "1": { "subPage": [] }, "8": { "subPage": ["1", "2"] } }, "path": "file:///D:\\programs\\cloudLive2\\save\\doc\\f002d183864e81f0af2b9ea6122a6513", "suffix": ".jpg" }, "subIndex": "1" } }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 8000); setTimeout(() => {
    //   var d = { "type": "51", "key": "LIVE_SET_PAGE", "data": { "hd": "f", "t": 51, "ap": 0, "c": "|10002|3|1,0,0,1,0,0|23356|1", "p": 10002, "n": 10, "st": 114.26, "x": "412821861" }, "isSend": "0" }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 9000); setTimeout(() => {
    //   var d = { "type": "pdf", "key": "LIVE_SET_PAGE", "isSend": 0, "data": { "pageAmount": "4", "id": "1561355", "pageIndex": "1", "ret": { "serverPath": "https://s2.talk-fun.com/8/doc/05/4c/f4/33304af2e78823edf6cd3a108b/", "html5": "", "currentPage": "1", "pages": { "3": { "subPage": [] }, "2": { "subPage": [] }, "4": { "subPage": [] }, "1": { "subPage": [] } }, "path": "file:///D:\\programs\\cloudLive2\\save\\doc\\054cf433304af2e78823edf6cd3a108b", "suffix": ".jpg" }, "subIndex": "1" } }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 10000);
    // setTimeout(() => {
    //   var d = { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 6000); setTimeout(() => {
    //   var d = { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 6000); setTimeout(() => {
    //   var d = { "key": "WHITEBOARD_BRUSH_STROKE_COLOR", "data": "#FF4B4B" }
    //   this.WebCommandApi.reciveFromCommand(d)
    // }, 6000);
  }
  // 事件监听
  on(event, handler) {
    emitter.on(event, handler)
  }
  listen() {
    globalStore.listen(state => state.debugMode, (dispatch, cur, prev) => {
      if (this.vconsole) {
        this.vconsole.destroy()
      }
      if (cur === 'true') {
        // vConsole
        this.vconsole = new VConsole()
      }
    })
  }
  // 获取画板版本
  getVersion() {
    return this.Store.getState().room.version
  }
  // 获取当前页涂鸦数据
  getCurPageData(_type) {
    let curPage = this.Store.getState().page.currentPage
    let subPage = this.Store.getState().page.currentSubPage
    let mode = tools.getMode(curPage)
    let curPageData = this.Store.getState().pageDrawData[mode][curPage]
    // let outputObject = {}
    let cmdFlushData = []
    // if (_type && _type === 'arrayString') {
    /**
     * {
    "n": 4,
    "st": 1,
    "p": "10002",
    "c": "",
    "d": ["{\"x\":49656029,\"t\":25,\"p\":10002,\"c\":\"496578|16724821|1|1|M,586.0,0.0.0|1\"}"]
     */
    if (curPageData) {
      let cmdKeys = Object.keys(curPageData)
      cmdKeys.map(k => {
        let o = {
          x: curPageData[k].x,
          t: parseInt(curPageData[k].t, 10),
          p: parseInt(curPageData[k].p, 10),
          c: curPageData[k].c
        }
        cmdFlushData.push(JSON.stringify(o))
      })
    }
    // return JSON.stringify(cmdFlushData)
    // }
    return {
      page: this.Page.flush(curPage, subPage, curPageData, false),
      draw: cmdFlushData,
      source: curPageData,
      pageSourceObject: this.Store.getState().page
    }
  }
  // getTextFocusArray
  getTextFocusArray() {
    return tools.textFocusArray()
  }
  // 清空本地数据
  clearLoacalStore() {
    clear({
      namespace: "_TF_WB_"
    })
  }
  // 获取whiteboard的指令状态的集合(如颜色、线宽、画笔类型等)
  getWhiteboardStatus() {
    return this.Store.getState().whiteboard
  }
  // 获取WHITEBOARD页集合的数据(如10002、10003等页数及其属性)
  getWhiteBoard() {
    return this.Store.getState().WHITEBOARD
  }
  whiteboardResize() {
    this._emitter.emit('whiteboard:resize')
    this._emitter.emit('ppt:resize')
  }
  // 新增画板
  addWhiteboard(curID) {
    // 素材区新增画板
    let that = this
    let id = null
    if (curID) {
      id = curID + 1
    } else {
      // 遍历出画板最后一个ID然后新增
      Object.keys(that.getWhiteBoard()).map(function (item, index) {
        if (index === Object.keys(that.getWhiteBoard()).length - 1) {
          id = parseInt(item) + 1
        }
      })
    }
    if (!id) {
      id = 10002
    }
    // 利用LIVE_SET_PAGE更新总页数
    that.Store.dispatch({
      type: 'LIVE_SET_PAGE',
      payload: {
        id: id,
        pageIndex: id,
        subIndex: 1,
        handlerXid: that.Store.getState().room.curUser.xid, //操作id
        ret: {
          backgroundColor: '#EEEEEE'
        }
      }
    })
    // 应用当前点击的画板的下一个(此应用的画板必须在state.WHITEBOAR数据中，所以先遍历)
    setTimeout(() => {
      Object.keys(that.getWhiteBoard()).map(function (item, index) {
        if (parseInt(item) === parseInt(curID)) {
          that.Store.dispatch({
            type: 'LIVE_SET_PAGE',
            payload: {
              id: Object.keys(that.getWhiteBoard())[index + 1] || id,
              pageIndex: Object.keys(that.getWhiteBoard())[index + 1],
              subIndex: 1,
              handlerXid: that.Store.getState().room.curUser.xid, //操作id
              ret: {
                backgroundColor: '#EEEEEE'
              }
            }
          })
        }
      })
    }, 0);
    // 更新state.page的数据
    setTimeout(() => {
      that.Page.computedPages()
    }, 0)
  }
  deleteWhiteboard(id) {
    let that = this
    // 删除state.WHITEBOARD和state.pageDrawData的画板数据
    this.Store.dispatch({
      type: 'DELETE_WHITEBOARD',
      payload: {
        data: {
          id: id,
        }
      }
    })
    // 更新state.page的数据
    setTimeout(() => {
      that.Page.computedPages()
    }, 0)
  }
  // todo...需要改名称 现在有歧义
  // socket 执行setpage指令
  setPage(data) {
    return this.Page.transport(data)
  }
  // 应用文档
  useDoc(docData) {
    let actionData = {
      type: TYPES.LIVE_SET_PAGE,
      payload: docData
    }
    return this.Page.doSetPage(actionData)
  }
  // 应用分页
  usePage(index, subIndex, handlerXid) {
    // set data
    let _state = this.Store.getState()
    let _id = null
    if (tools.isWhiteboard(index)) {
      _id = _state.room.whiteboardId
    } else {
      _id = _state.PPT.path
    }
    let pageData = {
      id: _id, //课件id
      pageIndex: index, //parseInt(data.page), //子页
      subIndex: subIndex || 1, //分页
      handlerXid: handlerXid || this.Store.getState().room.curUser.xid,
      pageAmount: _state.page.pageAmount, // 课件页面总数
      ret: null
    }
    this.Store.dispatch({
      type: TYPES.LIVE_SET_PAGE,
      payload: pageData
    })
    let pageDrawDataLength = Object.keys(_state.pageDrawData.PPT[index]).length
    return Promise.resolve(pageDrawDataLength)
    // this.Page.use(index, subIndex)
  }
  // 应用图片涂鸦
  useImage(data) {
    this.Store.dispatch({
      type: TYPES.WHITEBOARD_BRUSH_DATA,
      payload: {
        src: data.pictures[0].urls[0],
        server_path: data.pictures[0].urls[0]
      }
    })
    // { type, payload.type }
    this.Store.dispatch({
      type: TYPES.WHITEBOARD_BRUSH_TYPE,
      payload: STATIC.IMAGE
    })
  }
  // 操作者ID
  setHandelrXid(xid) {
    this.Store.dispatch({
      type: TYPES.UPDATE_ROOM_HANDLER_XID,
      payload: xid
    })
    return Promise.resolve()
  }
  // 设置用户信息
  setUser(user) {
    this.Store.dispatch({
      type: TYPES.UPDATE_ROOM_CURUSER,
      payload: user
    })
  }
  // 作为中间件的方法，用于被dispatch，就是画板快捷翻页后取记录的画板颜色数据更新canvas的背景颜色
  update_WHITEBOARD_bgColor() {
    let _store = this.Store.getState()
    if (tools.isWhiteboard(_store.page.currentPage)) {
      let bgColor = _store.WHITEBOARD[_store.page.currentPage].backgroundColor
      // 更新whiteboard背景颜色
      return (dispatch) => {
        dispatch({
          type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
          payload: bgColor
        })
      }
    }
  }
  // 下一页
  next() {
    let doNext = () => {
      return (dispatch) => {
        dispatch({
          type: TYPES.PAGE_NEXT,
          paylaod: 1
        })
      }
    }
    // this.Store.dispatch({
    //   type: TYPES.UPDATE_ROOM_HANDLER_XID,
    //   payload: this.Store.getState().room.curUser.xid
    // })
    this.setHandelrXid(this.Store.getState().room.curUser.xid).then(() => {
      this.Store.dispatch(doNext())
    }).then(() => {
      // 如果是画板就需要从记录中取出当前画笔的颜色应用到canvas的背景颜色
      if (tools.isWhiteboard(this.Store.getState().page.currentPage)) {
        this.Store.dispatch(this.update_WHITEBOARD_bgColor())
      }
    })
    // this.Store.dispatch({
    //   type: TYPES.PAGE_NEXT,
    //   payload: 1
    // })
  }
  // 上一页
  prev() {
    // this.Store.dispatch({
    //   type: TYPES.PAGE_PREV,
    //   payload: 1
    // })
    let doPrev = () => {
      return (dispatch, getState) => {
        dispatch({
          type: TYPES.PAGE_PREV,
          payload: 1
        })
      }
    }
    // this.Store.dispatch({
    //   type: TYPES.UPDATE_ROOM_HANDLER_XID,
    //   payload: this.Store.getState().room.curUser.xid
    // })
    this.setHandelrXid(this.Store.getState().room.curUser.xid).then(() => {
      this.Store.dispatch(doPrev())
    }).then(() => {
      // 如果是画板就需要从记录中取出当前画笔的颜色应用到canvas的背景颜色
      if (tools.isWhiteboard(this.Store.getState().page.currentPage)) {
        this.Store.dispatch(this.update_WHITEBOARD_bgColor())
      }
    })
    // this.Store.dispatch(doPrev())
  }
  // 使用画笔
  use(type, payload) {
    graphic.use(type, payload)
  }
  // 涂鸦权限
  power({
    type,
    payload
  }) {
    this.Store.dispatch({
      type: type,
      payload: payload
    })
  }
  dispatch({
    type,
    payload
  }) {
    this.Store.dispatch({
      type: type,
      payload: payload
    })
  }
  // 保存翻动过的页数
  savePage(data) {
    globalStore.reducerStore.dispatch({
      type: TYPES.UPDATE_WHITEBOARD_PAGE,
      payload: {
        operation: data.operation,
        page: data.page
      }
    })
  }
  // 清除当前pageDrawData或当前页数据
  clearDrawData(p) {
    let MODE = null
    if (p) {
      MODE = tools.isWhiteboard(p) ? STATIC.WHITEBOARD : STATIC.PPT
    } else {
      // 下课时清空所有涂鸦数据
      MODE = 'all'
      p = 0
      // 下课时清空翻动过的页数记录
      this.Store.dispatch({
        type: TYPES.UPDATE_WHITEBOARD_PAGE,
        payload: {
          operation: 'clearPPT',
        }
      })
      this.Store.dispatch({
        type: TYPES.UPDATE_WHITEBOARD_PAGE,
        payload: {
          operation: 'clearWhiteboard',
        }
      })
    }
    this.Store.dispatch({
      type: TYPES.UPDATE_PAGE_DRAW_DATA,
      payload: {
        mode: MODE,
        page: p.toString(),
        data: {}
      }
    })
    // 删除fabric对象
    tools.removeKlss()
    // 删除缓存的操作类（因为图片文字教棍不会重复创建所以存在这里。）
    graphicTempObject.clear()
    return Promise.resolve()
  }
  // 销毁
  destroy() {
    return new Promise((resolve, reject) => {
      this.clearDrawData().then(() => {
        // clear context2D
        emitter.emit('whiteboard:removeListenResize')
        globalStore.fabric.clearContext(globalStore.fabric.contextContainer)
      }).then(() => {
        // 禁用fabric
        globalStore.fabric.dispose()
      }).then(() => {
        globalStore.destroy()
        // 置空preact（会清除相关的dom）
        emitter.emit('whiteboard:clearDom')
        resolve()
      })
    })
  }
  backward() {
    this.Store.dispatch({
      type: TYPES.WHITEBOARD_HISTORY_BACKWARE,
      payload: {
        isSend: '1'
      }
    })
  }
  forward() {
    this.Store.dispatch({
      type: TYPES.WHITEBOARD_HISTORY_FORWARE,
      payload: {
        isSend: '1'
      }
    })
  }
  // 逐条 & 批量 执行cmd指令
  execute({ data, isRefresh }) {
    // 图形指令code
    let brushCode = [STATIC.CURVE, STATIC.LINE, STATIC.ARROW, STATIC.CIRCLE, STATIC.RECTANGLE, STATIC.TEXT, STATIC.DOTTED_LINE, STATIC.IMAGE, STATIC.POINTER, STATIC.TRIANGLE]
    let oData = typeof data === 'string' ? JSON.parse(data) : data

    if (Object.prototype.toString.call(oData.c) === '[object String]') {
      oData.cid = oData.c.split('|')[0]
      oData.t = oData.t.toString()
      // 各个涂鸦指令
      if (brushCode.indexOf(oData.t) > -1) {
        this.doCommand({ oData: oData, isRefresh: isRefresh })
      }
      // 上课前的批量涂鸦
      if (parseInt(oData.t) === parseInt(STATIC.DRAW_BAT)) {
        // JSON.parse(oData.d).map((item) => {
        if (Object.prototype.toString.call(oData.d) === '[object Array]') {
          oData.d.map((item) => {
            if (item) {
              let _item = JSON.parse(item)
              if (_item.c && _item.c.length > 0) {
                _item.cid = _item.c.split('|')[0]
                _item.t = _item.t.toString()
                this.doCommand({ oData: _item, isRefresh: isRefresh })
              } else {
                _item.c = ''
              }
            }
          })
        }
      }
      // execute eraseAll
      if (oData.t === STATIC.ERASE_ALL) {
        document.querySelector('#brush_pointer') && document.querySelector('#brush_pointer').classList.add('brush_pointer_hidden')
        this.clearDrawData(oData.p)
      }
      // 下课（下课清数据涂鸦，待处理。注意考虑多端）
      // if (oData.t = 'stop') {
      //   this.clearDrawData()
      // }
    }
    // 直播结束
    // if (oData.t === 'stop') {
    //   let PPT = this.Store.getState().pageDrawData['PPT']
    //   Object.keys(PPT).map((_key) => {
    //     this.clearDrawData(_key)
    //   })
    //   let WHITEBOARD = this.Store.getState().pageDrawData['WHITEBOARD']
    //   Object.keys(WHITEBOARD).map((_key) => {
    //     this.clearDrawData(_key)
    //   })
    // }
  }
  // Socket 指令
  doCommand({ oData, isRefresh = false }) {
    if (!oData) return
    oData.t = oData.t.toString()
    // 如果非当前页放弃渲染
    if (Number(oData.p) !== Number(this.Store.getState().page.currentPage)) {
      return false
    }
    // visible为0时执行删除操作
    if (tools.CdataToObject(oData.c, oData.t).visible === '0') {
      // 图片和文字特殊处理（不执行清除对象，为了后续处理graphicTempObject）
      if (!(oData.t === STATIC.IMAGE || oData.t === STATIC.TEXT)) {
        tools.removeKlss(oData.cid)
      }
    }
    // visible为1是update data
    let MODE = tools.isWhiteboard(oData.p) ? STATIC.WHITEBOARD : STATIC.PPT
    tools.log('do draw cmd ==>', oData)
    this.Store.dispatch({
      type: TYPES.UPDATE_PAGE_DRAW_DATA,
      payload: {
        mode: MODE,
        page: oData.p.toString(),
        data: oData
      }
    })
    graphic.getBrushType({ brush: oData.t, data: oData, isRefresh: isRefresh })
  }
  // 外部调用 => 内部渲染
  render({ data, isRefresh = false }) {
    tools.log('whiteBoard execute =>', data)
    if (!data) return
    // 翻页相关
    // this.page.transport(data).then(() => {
    // 批量
    // tools.removeKlss()
    if (Object.prototype.toString.call(data) === '[object Array]') {
      data.map(item => {
        this.execute({ data: item, isRefresh: isRefresh })
      })
    }
    // 单条
    else {
      this.execute({ data: data, isRefresh: isRefresh })
    }
  }
}