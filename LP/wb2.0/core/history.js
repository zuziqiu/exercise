/**
 * ## 历史操作相关 ##
 * =================
 * 前进
 * 后退
 * 删除
 * 保存
 */
import { globalStore } from '../states/globalStore'
import * as tools from '../extensions/util'
import * as TYPES from '../Action/action-types'
import { STATIC } from '../states/staticState'
import emitter from '../extensions/emitter'
export class History {
  // build
  constructor() {
    this.store = globalStore.reducerStore
    this.history = this.store.getState().history
    this.Qt = globalStore.getQt()
    this.pageId = ''
    this.currentPage = this.getCurPage()
    this.state = {
      pptId: 0,
      whiteboardId: 0
    }
  }
  getCurPage() {
    let state = this.store.getState()
    return state.page.currentPage
  }
  didUpdate(newer, older) {
    if (!newer.room || !older.room) {
      return
    }
    this.currentPage = this.getCurPage()
    let _ID = newer.room.setPageData.id
    let PAGE = newer.room.setPageData.pageIndex
    let PAGE_AMOUNT = newer.room.setPageData.pageAmount
    let newSet = newer.room.setPageData
    let oldSet = older.room.setPageData
    // 创建分页
    if (tools.isWhiteboard(newer.room.setPageData.pageIndex)) {
      if (this.state.whiteboardId !== _ID)
        this.updateHistory(STATIC.WHITEBOARD, PAGE)
      this.state.whiteboardId = _ID
      this.state.pptId = 0
      // console.error("创建分页==>",this.state.pptId)
    }
    // 创建批量PPT历史
    else {
      // console.error("创建批量PPT历史==>",this.state.pptId, _ID)
      // if (this.state.pptId != _ID) {
      if (newSet.ret && newSet.ret.pages && oldSet.id !== newSet.id) {
        // console.error("===============>",this.state.pptId, _ID)

        // whiteBoard ==> ppt分页时触发
        // if (old.room.setPageData.pageIndex < 10000) {
        this.clear(STATIC.PPT, PAGE)
        // }
        for (let k = 0; k < PAGE_AMOUNT; k++) {
          this.updateHistory(STATIC.PPT, k + 1)
        }
        this.state.pptId = _ID
      }
    }
    // 客户端可以在此进行触发
    if (this.store.getState().history.type === 'backware') {
      this.onBackward()
    }
    if (this.store.getState().history.type === 'forware') {
      this.onForward()
    }
  }
  updateHistory(mode, page) {
    this.store.dispatch({
      type: TYPES.WHITEBOARD_HISTORY_ADD_BRANCH,
      payload: {
        mode: mode,
        page: page//this.store.getState().room.setPageData.pageIndex
      }
    })
  }
  clear(mode, page) {
    this.store.getState().history[mode] = {}
  }
  // 保存当前页涂鸦数据
  /**
   * 注意: 保存'cdata'格式化数据
   */
  save(cdata, ward) {
    tools.log('draw save ==>', cdata)
    // return cdata
    let MODE = tools.isWhiteboard(cdata.p) ? STATIC.WHITEBOARD : STATIC.PPT
    // 保存数据
    this.store.dispatch({
      type: TYPES.UPDATE_PAGE_DRAW_DATA,
      payload: {
        mode: MODE,
        page: cdata.p.toString(),
        data: cdata
      }
    })
    // 擦除全部
    if (ward === 'eraseAll') {
      this.store.dispatch({
        type: TYPES.WHITEBOARD_HISTORY_CLEAN_ACTION,
        payload: {
          mode: MODE,
          currentPage: this.getCurPage()
        }
      })
    }
    // 前进
    if (!ward) {
      this.setForward(cdata)
    }
  }
  // 保存后退数据
  // {"key":"WHITEBOARD_HISTORY_BACKWARE","data":{"name":"c3","visible":"1","isSend":"0"}}
  // isSend = 1 发送数据给客户端
  // backward forward 同样处理方式
  setBackward(cdata) {
    // 保存后退数据
    let _mode = ''
    if (tools.isWhiteboard(this.getCurPage())) {
      _mode = STATIC.WHITEBOARD
    } else {
      _mode = STATIC.PPT
    }
    this.store.dispatch({
      type: TYPES.WHITEBOARD_HISTORY_BACKWARE_ACTION,
      payload: {
        data: cdata,
        mode: _mode,
        currentPage: this.getCurPage()
      }
    })
  }
  setForward(cdata) {
    // 保存前进数据
    let _mode = ''
    if (tools.isWhiteboard(this.getCurPage())) {
      _mode = STATIC.WHITEBOARD
    } else {
      _mode = STATIC.PPT
    }
    this.store.dispatch({
      type: TYPES.WHITEBOARD_HISTORY_FORWARE_ACTION,
      payload: {
        data: cdata,
        mode: _mode,
        currentPage: this.getCurPage()
      }
    })
  }
  // 后退动作
  onBackward() {
    if (tools.isWhiteboard(this.currentPage)) {
      this.mode = STATIC.WHITEBOARD
    } else {
      this.mode = STATIC.PPT
    }
    this.history = this.store.getState().history
    this.type = TYPES.WHITEBOARD_HISTORY_BACKWARE_ACTION
    if (this.history[this.mode][this.currentPage].forward.length > 0) {
      this.dealAction(this.type, this.setBackward)
    }
  }
  // 前进动作
  onForward() {
    // this.currentPage = this.store.getState().room.setPageData.pageIndex
    if (tools.isWhiteboard(this.currentPage)) {
      this.mode = STATIC.WHITEBOARD
    } else {
      this.mode = STATIC.PPT
    }
    this.history = this.store.getState().history
    this.type = TYPES.WHITEBOARD_HISTORY_FORWARE_ACTION
    if (this.history[this.mode][this.currentPage].backward.length > 0) {
      this.dealAction(this.type)
    }
  }
  // 动作处理
  dealAction(_type) {
    let data = null
    let actionWard = null

    // 当前页数无数据时返回
    this.currentPage = this.getCurPage()
    this.mode = ''
    if (tools.isWhiteboard(this.currentPage)) {
      this.mode = STATIC.WHITEBOARD
    } else {
      this.mode = STATIC.PPT
    }
    if (!this.history[this.mode][this.currentPage]) {
      return false
    }
    // decide data / action
    if (_type === TYPES.WHITEBOARD_HISTORY_BACKWARE_ACTION) {
      data = this.history[this.mode][this.currentPage]['forward'].splice(this.history[this.mode][this.currentPage]['forward'].length - 1)[0]
      this.setBackward(data)
      actionWard = this.history[this.mode][this.currentPage]['backward'][this.history[this.mode][this.currentPage]['backward'].length - 1]
    }
    if (_type === TYPES.WHITEBOARD_HISTORY_FORWARE_ACTION) {
      data = this.history[this.mode][this.currentPage]['backward'].splice(this.history[this.mode][this.currentPage]['backward'].length - 1)[0]
      this.setForward(data)
      actionWard = this.history[this.mode][this.currentPage]['forward'][this.history[this.mode][this.currentPage]['forward'].length - 1]
    }

    // deal klss cdata
    let operWard = ''
    actionWard.c = tools.CdataToObject(actionWard.c, actionWard.t)
    if (actionWard.c.visible === '1') {
      actionWard.c.visible = '0'
      tools.setKlssVisiable(actionWard.cid, false)
      operWard = 'back'
    } else {
      actionWard.c.visible = '1'
      tools.setKlssVisiable(actionWard.cid, true)
      operWard = 'for'
    }
    this.fabric = globalStore.fabric
    this.fabric.renderAll()
    actionWard.c = tools.objectToCdata(actionWard.c)
    this.save(actionWard, 'action')
    let klssData = Object.assign({}, actionWard)
    let backCdata = {}
    if (klssData.t === STATIC.CURVE) {
      //{"c":"d6|16711680|6|1|M,461.6,558,L,461.6,559,C,486.2,584.7,490.3,592.9,L,494.4,601.1|1"}

      // let _pathData = klssData.path
      // let curve = new Curve()
      backCdata = {
        // nid: klssData.cid,
        id: klssData.cid,
        color: 0,
        strokeWidth: 0,
        visible: 0,
        pathData: 'M,0,0,L,0,0',
        opacity: 0
      }
    } else if (klssData.t === STATIC.LINE || klssData.t === STATIC.DOTTED_LINE) {
      backCdata = {
        id: klssData.cid,
        visible: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        strokeWidth: 0,
        color: 0,
        opacity: 0
      }
    } else if (klssData.t === STATIC.RECTANGLE || klssData.t === STATIC.CIRCLE || STATIC.TRIANGLE) {
      backCdata = {
        id: klssData.cid,
        visible: 0,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        strokeWidth: 0,
        color: 0,
        opacity: 0
      }
    } else if (klssData.t === STATIC.IMAGE) {
      let _c = tools.CdataToObject(klssData.c, klssData.t)
      backCdata = {
        id: klssData.cid,
        src: 0,
        visible: 0,
        optType: 1,
        matrix: _c.matrix,
      }
    } else if (klssData.t === STATIC.TEXT) {
      let _c = tools.CdataToObject(klssData.c, klssData.t)
      backCdata = {
        id: klssData.cid,
        text: _c.text,
        color: 0,
        fontSize: _c.fontSize,
        visible: 0,
        optType: _c.optType,
        matrix: _c.matrix,
        isEncode: 0
      }
    }
    // isSend对于直播器是指操作之前的涂鸦，而不是创建新的涂鸦
    if (this.store.getState().history.isSend === '1') {
      if (operWard === 'back') {
        // 这里是撤退，需要把对象的某些属性设为0后发送出去
        klssData.c = tools.objectToCdata(backCdata)
        this.Qt && this.Qt.sendToQt(klssData)
        // 发送给小班
        emitter.emit('draw:data', klssData)
      } else {
        // 这里是前进，需要在pageDrawdata中取出真实数据发送出去
        this.Qt && this.Qt.sendToQt(actionWard)
        // 发送给小班
        emitter.emit('draw:data', actionWard)
      }
    }
    // 防止Main.js中触发进入死循环
    this.store.dispatch({
      type: TYPES.WHITEBOARD_HISTORY_TYPE_UPDATE,
      payload: {
        status: 'holding',
        isSend: ''
      }
    })
  }
}