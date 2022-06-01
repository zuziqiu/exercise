/**
 * ## 历史操作相关 ##
 * =================
 * 前进
 * 后退
 * 删除
 * 保存
 */
import { toJS } from 'mobx'
import { actions } from '../Action/index';
import { store } from '../states/index'
import { globalStore } from '../states/globalStore'
import * as tools from '../extensions/util'
import * as TYPES from '../Action/action-types'
import { STATIC } from '../states/staticState'
import wbEmitter from '../extensions/wbEmitter'
class History {
  // build
  constructor() {
    this.webCommand = globalStore.getCommandApi()
    this.state = {
      pptId: 0,
      whiteboardId: 0
    }
    this.listener()
  }
  listener() {
    // pptId变化时创更换ppt的history字段内容（会清空上一个ppt的历史）
    globalStore.listenKeep(
      () => { return { pptId: toJS(store.page.pptId) } },
      ({ pptId }) => {
        actions.dispatch('history', {
          type: TYPES.HISTORY_CLEAN_ACTION,
          payload: {
            mode: STATIC.PPT,
          }
        })
        // 创建ppt第一页历史（ppt=>ppt时currentPage不能监听到，所以要默认创建第一页）
        actions.dispatch('history', {
          type: TYPES.HISTORY_ADD_BRANCH,
          payload: {
            mode: STATIC.PPT,
            page: 1
          }
        })
      }
    )
    // 监听翻页创建历史
    globalStore.listenKeep(
      () => { return { currentPage: toJS(store.page.currentPage) } },
      ({ currentPage }) => {
        let mode = null
        if (tools.isWhiteboard(currentPage)) {
          mode = STATIC.WHITEBOARD
        } else {
          mode = STATIC.PPT
        }
        actions.dispatch('history', {
          type: TYPES.HISTORY_ADD_BRANCH,
          payload: {
            mode: mode,
            page: currentPage
          }
        })
      }
    )
    globalStore.listenKeep(
      () => { return { type: toJS(store.history.type) } },
      ({ type }) => {
        if (type != 'holding') {
          this.dealAction(type)
        }
      }
    )

    // 白板id变化时新增新的白板的history
    // globalStore.listenKeep(
    //   () => { return { whiteboardId: toJS(store.page.whiteboardId) } },
    //   ({ whiteboardId }) => {
    //     this.updateHistory(STATIC.WHITEBOARD, whiteboardId)
    //   }
    // )
  }
  // didUpdate(newer, older) {
  //   if (!newer.room || !older.room) {
  //     return
  //   }
  //   store.page.currentPage = store.page.currentPage
  //   let _ID = newer.room.setPageData.id
  //   let PAGE = newer.room.setPageData.pageIndex
  //   let PAGE_AMOUNT = newer.room.setPageData.pageAmount
  //   let newSet = newer.room.setPageData
  //   let oldSet = older.room.setPageData
  //   // 创建分页
  //   if (tools.isWhiteboard(newer.room.setPageData.pageIndex)) {
  //     if (this.state.whiteboardId !== _ID)
  //       this.updateHistory(STATIC.WHITEBOARD, PAGE)
  //     this.state.whiteboardId = _ID
  //     this.state.pptId = 0
  //     // console.error("创建分页==>",this.state.pptId)
  //   }
  //   // 创建批量PPT历史
  //   else {
  //     // console.error("创建批量PPT历史==>",this.state.pptId, _ID)
  //     // if (this.state.pptId != _ID) {
  //     if (newSet.ret && newSet.ret.pages && oldSet.id !== newSet.id) {
  //       // console.error("===============>",this.state.pptId, _ID)

  //       // whiteBoard ==> ppt分页时触发
  //       // if (old.room.setPageData.pageIndex < 10000) {
  //       this.clear(STATIC.PPT, PAGE)
  //       // }
  //       for (let k = 0; k < PAGE_AMOUNT; k++) {
  //         this.updateHistory(STATIC.PPT, k + 1)
  //       }
  //       this.state.pptId = _ID
  //     }
  //   }
  //   // 客户端可以在此进行触发
  //   if (store.history.type === 'backware') {
  //     this.onBackward()
  //   }
  //   if (store.history.type === 'forward') {
  //     this.onForward()
  //   }
  // }
  // 保存当前页涂鸦数据
  /**
   * 注意: 保存'cdata'格式化数据
   */
  save(cdata, ward) {
    // tools.log('draw save ==>', cdata)
    // // return cdata
    // let MODE = tools.isWhiteboard(cdata.p) ? STATIC.WHITEBOARD : STATIC.PPT
    // // 保存数据
    // actions.dispatch('pageDrawData', {
    //   type: TYPES.UPDATE_PAGE_DRAW_DATA,
    //   payload: {
    //     mode: MODE,
    //     page: cdata.p.toString(),
    //     data: cdata
    //   }
    // })
    // 擦除全部
    if (ward === 'eraseAll') {
      actions.dispatch('history', {
        type: TYPES.HISTORY_CLEAN_ACTION,
        payload: {
          mode: MODE,
          currentPage: store.page.currentPage
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
    if (tools.isWhiteboard(store.page.currentPage)) {
      _mode = STATIC.WHITEBOARD
    } else {
      _mode = STATIC.PPT
    }
    actions.dispatch('history', {
      type: TYPES.HISTORY_BACKWARE_ACTION,
      payload: {
        data: cdata,
        mode: _mode,
        currentPage: store.page.currentPage
      }
    })
  }
  setForward(cdata) {
    // 保存前进数据
    let _mode = ''
    if (tools.isWhiteboard(store.page.currentPage)) {
      _mode = STATIC.WHITEBOARD
    } else {
      _mode = STATIC.PPT
    }
    actions.dispatch('history', {
      type: TYPES.HISTORY_FORWARE_ACTION,
      payload: {
        data: cdata,
        mode: _mode,
        currentPage: store.page.currentPage
      }
    })
  }
  // 前进/后退触发
  dealAction(type) {
    let actionWard = null

    // 当前页数无数据时返回
    let mode = ''
    if (tools.isWhiteboard(store.page.currentPage)) {
      mode = STATIC.WHITEBOARD
    } else {
      mode = STATIC.PPT
    }
    // 防止Main.js中触发进入死循环
    actions.dispatch('history', {
      type: TYPES.HISTORY_TYPE_UPDATE,
      payload: {
        status: 'holding',
        isSend: ''
      }
    })
    // 设置完了visible调用renderAll
    if (type === 'backward') {
      actionWard = store.history[mode][store.page.currentPage]['forward'].pop()
      if (!actionWard) return
      this.setBackward(actionWard)
    }
    if (type === 'forward') {
      actionWard = store.history[mode][store.page.currentPage]['backward'].pop()
      if (!actionWard) return
      this.setForward(actionWard)
    }
    actionWard.c = tools.CdataToObject(actionWard.c, actionWard.t)
    actionWard.c.visible = actionWard.c.visible ^ 1
    tools.setKlssVisiable(actionWard.cid, Boolean(actionWard.c.visible))
    globalStore.fabric.renderAll()

    // 存储最新的置换的历史
    actionWard.c = tools.objectToCdata(actionWard.c)
    this.save(actionWard, 'action')
    // isSend对于直播器是指操作之前的涂鸦，而不是创建新的涂鸦
    if (store.history.isSend === '1') {
      if (type === 'backward') {
        // 这里是撤退，需要把对象的某些属性设为0后发送出去
        let klssData = Object.assign({}, actionWard)
        let backCdata = this.getBackWardData(klssData)
        klssData.c = tools.objectToCdata(backCdata)
        this.webCommand && this.webCommand && webCommand.sendToQt(klssData)
        // 发送给小班
        wbEmitter.emit('draw:data', klssData)
      }
      if (type === 'forward') {
        // 这里是前进，需要在pageDrawdata中取出真实数据发送出去
        this.webCommand && this.webCommand && webCommand.sendToQt(actionWard)
        // 发送给小班
        wbEmitter.emit('draw:data', actionWard)
      }
    }
  }
  // 后退的历史要特殊处理，因为后退不是真正删除，而是隐藏=> visible = 0
  getBackWardData(klssData) {
    let backCdata = {}
    if (klssData.t === STATIC.CURVE) {
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
    } else if (klssData.t === STATIC.RECTANGLE || klssData.t === STATIC.ELLIPSE) {
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
    return backCdata
  }
}

export const history = new History()