import * as demos from '../assets/demoData'
 export class Page {
  constructor() {
    tools.log('Page Mode Create...')
    this.store = globalStore.reducerStore
    // this.state.pptId = 0
    this.props = this.store.getState()
    // this.demo()
    this.state = {
      pptId: 0,
      whiteboardId: 0,
      pageIndex: 0,
      pageSubIndex: 0,
      pageIndexs: [],
      preProp: {}
    }
    // this.listen()
    // this.on()
  }
  on() {
    // 每次PPT图片加载完都会接收到该指令。更新
    emitter.on("load:whiteboard:status", ({ status }) => {
      // status == true 表示图片onload
      if (status) {
        // scheduleList一次执行一条
        if (useSchedule.useScheduleList.length > 0) {
          useSchedule.useRunSchedule()
        }
        else {
          // scheduleList全部执行完毕。重置running
          useSchedule.running = false
        }
      }
    })
  }
  demoPull(data) {
    // let ran = [/*DATA_22,DATA_WB_2, DATA_WB,DATA_PPT_2,*/ DATA_PPT_4_3, DATA_16_9,DATA_DOC_1]
    let _dd = ''
    if (data == 'PPT') {
      _dd = demos.DATA_16_9
    }
    if (data == 'PDF') {
      _dd = demos.DATA_DOC_1
    }
    let actionData = {
      type: TYPES.LIVE_SET_PAGE,
      payload: _dd
    }
    this.doSetPage(actionData)
  }
  doSetPage(action) {
    // console.error(action)
    let _doit = (action) => {
      return (dispatch, getState) => {
        // PPT ID 更换
        if (getState().room.pptId != action.payload.id || action.payload.ap !== this.store.getState().animatePPT.pptType) {
          globalStore.reducerStore.dispatch({
            type: TYPES.UPDATE_PPT_TYPE,
            payload: action.payload.ret && action.payload.ret.html5 ? 1 : 0
          })
          tools.log('[S]更换PPT课件 ==>', action.payload.id)
          // 清空涂鸦
          return this.clear(action).then(() => {
            setTimeout(() => {
              // 应用文档的状态更新，以后翻页在listen中不再监听page的文档id变化（画板id还会监听）,改为监听‘status’
              new Promise((resolve) => {
                dispatch({
                  type: TYPES.SWITCH_PAGE_STATUS,
                  payload: {
                    status: 'wait'
                  }
                })
                resolve()
              }).then(() => {
                // 操作 => set:page
                // LIVE_SET_PAGE
                dispatch({
                  type: action.type,
                  payload: action.payload
                })
                // return Promise.reslove()
              }).then(() => {
                // 更新分页结构
                this.updatePageData({
                  pages: this.store.getState().room.setPageData.ret.pages,
                  currentPage: 1,
                  subPage: 1
                }).then(() => {
                  this.updatePPTData(this.store.getState().room.setPageData).then(() => {
                    // 更新PPT数据之后先更新滚动高度再渲染
                    let pptInfoResource = this.store.getState().pptInfoResource
                    // 一定要判断变量是否存在（共用一套画板的新版直播器没有这个变量）
                    if (pptInfoResource.scrollInfo && pptInfoResource.scrollInfo.postTop) {
                      let currentPage = this.store.getState().page.currentPage
                      this.store.dispatch({
                        type: TYPES.UPDATE_PPT_PAGE_POST_TOP,
                        payload: {
                          page: currentPage,
                          postTop: pptInfoResource.scrollInfo.postTop
                        }
                      })
                      // 变量值转换完之后置空
                      this.store.dispatch({
                        type: TYPES.PPT_SCROLL_POST_TOP_INFO,
                        payload: {
                          scrollInfo: {
                            postTop: null
                          }
                        }
                      })
                    }
                    this.computedPages()
                  }).then(() => {
                    // ？渲染当前页存在重复。在listen中监听翻页已处理
                    // this.renderPage()
                    // 应用文档的状态更新，以后翻页在listen中不再监听page的文档id变化（画板id还会监听）,改为监听‘status’
                    dispatch({
                      type: TYPES.SWITCH_PAGE_STATUS,
                      payload: {
                        status: 'done'
                      }
                    })
                  })
                })
              })
              // 延迟500毫秒是因为切换PPT会发送PPT指令，在此之前先发送10002，两条指令间隔太短，网络转发之后可能会顺序错误
            }, 500);
          })
        }
      }
    }
    this.store.dispatch(_doit(action))
    return Promise.resolve()
  }
}