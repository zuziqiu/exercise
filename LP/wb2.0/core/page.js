/**
 * 翻页操作
 * 初始化 & 页码更新
 * ==================
 * 核心流程
 * ==================
 * 课件 state => 渲染必要条件
 * =======================
 *  PPT 对象
 *  room 对象
 *  page 对象
 *  pageDrawData 对象
 */
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import { graphic } from '../graphic'
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState'
import emitter from '../extensions/emitter'
import { PPT } from '../components/PPT-v2'
import { graphicTempObject } from '../core/graphicTempObject'
import * as demos from '../assets/demoData'
import { hostMachine } from '../extensions/hostMachine'
import { useSchedule } from '../extensions/useSchedule'

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
    this.listen()
    this.on()
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
  // ===========================================================
  // ======================= STR----DEMO =======================
  // ===========================================================
  demoPull(data) {
    // let ran = [/*DATA_22,DATA_WB_2, DATA_WB,DATA_PPT_2,*/ DATA_PPT_4_3, DATA_16_9,DATA_DOC_1]
    let _dd = ''
    if (data == 'PPT') {
      _dd = demos.DATA_16_9
    }
    if (data == 'PDF') {
      _dd = demos.DATA_DOC_1
    }
    if (data == 'Animation') {
      _dd = demos.DATA_ANIMATION_PPT
    }
    let actionData = {
      type: TYPES.LIVE_SET_PAGE,
      payload: _dd
    }
    this.doSetPage(actionData)
  }
  // ===========================================================
  // ======================= END----DEMO =======================
  // ===========================================================
  // 状态监听，需要在这里完成
  listen() {
    // page => 更换
    globalStore.listen(state => state.page, (dispatch, cur, prev) => {
      // 更换PPT
      if (cur.pptId !== prev.pptId) {
        if (tools.isWhiteboard(cur.currentPage)) {
          // 清空PPT的资源重试计时器
          hostMachine.clear()
          // 清空临时涂鸦数据
          graphicTempObject.clear()
          // 切换到白板时初始化重置动态PPT的状态
          globalStore.reducerStore.dispatch({
            type: TYPES.UPDATE_PPT_STATE,
            payload: 'wait'
          })
          this.use({ PAGE: cur.currentPage, SUB_PAGE: cur.currentSubPage, isSend: cur.isSend })
          return
        }
      }
      // 更换课件(doSetPage步骤状态发生变化)
      if (cur.status !== prev.status) {
        // 表示应用新的课件完成（store.PPT已经更新）
        if (cur.status == 'done') {
          graphicTempObject.clear()
          // 加载完课件后。强制重置running，让schedule重新开始
          useSchedule.running = false
          this.use({ PAGE: cur.currentPage, SUB_PAGE: cur.currentSubPage, isClear: true, isSend: cur.isSend })
          // PPT加载完后对直播器暴露状态
          let Qt = globalStore.getQt()
          Qt && Qt.sendToQt({ key: 'load:ppt:status', status: true })
          // PPT加载完后对app暴露状态
          window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsToOcWithPrams && window.webkit.messageHandlers.jsToOcWithPrams.postMessage('{"origin":"talkfun","params":"pptLoaded"}');
          window.android && window.android.JsToJavaInterface('{"origin":"talkfun","params":"pptLoaded"}');
        }
        return
      }
      // 页码数据更新
      if ((cur.currentPage + '_' + cur.currentSubPage) !== (prev.currentPage + '_' + prev.currentSubPage)) {
        tools.log('更换翻页 ==>', cur.currentPage + ', ' + cur.currentSubPage)
        // 清空临时涂鸦数据
        graphicTempObject.clear() // ?翻subPage 可能不需要清空
        this.use({ PAGE: cur.currentPage, SUB_PAGE: cur.currentSubPage, isSend: cur.isSend })
      }
    })
  }
  // 直播器方法，分发页数操作
  setPageDispatcher(targetData) {
    // pageIndex表明是发起端
    if (targetData.data.pageIndex) {
      let actionData = {
        type: targetData.key,
        payload: Object.assign({ isSend: targetData.isSend }, targetData.data),
      }
      // 发起端画板指令
      if (tools.isWhiteboard(targetData.data.pageIndex)) {
        // 更新 -> 画板颜色属性
        this.store.dispatch({
          type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
          payload: targetData.data.ret.backgroundColor
        })
        this.store.dispatch(actionData)
      } else {
        // 应用PPT，发起端和接收端指令相同，同一处理
        let setPageData = globalStore.reducerStore.getState().room.setPageData
        if (targetData.data.id != globalStore.reducerStore.getState().room.pptId) {
          this.doSetPage(actionData)
        } else {
          // 动<==>静，同一个PPT的动静模式互相切换
          // if (actionData.payload.ret && globalStore.reducerStore.getState().room.setPageData.ret && Object.prototype.toString.call(actionData.payload.ret.html5) !== Object.prototype.toString.call(globalStore.reducerStore.getState().room.setPageData.ret.html5)) {
          //   this.doSetPage(actionData)
          let inspect = function () {
            if (actionData.payload.ret) {
              if (typeof actionData.payload.ret == typeof setPageData.ret) {
                if (typeof actionData.payload.ret.html5 == typeof setPageData.ret.html5) {
                  return false
                } else {
                  return true
                }
              } else {
                return true
              }
            } else {
              return false
            }
          }
          if (inspect()) {
            this.doSetPage(actionData)
          } else {
            // 应用PPT翻页
            this.store.dispatch(actionData)
          }
        }
      }
    } else
      // p表明是接收端，接收端的应用PPT情况在pageIndex的判断中进行（特殊处理，直播器传来的指令是发起端的格式）
      if (targetData.data.p) {
        // 接收端画板指令,重新组装
        let o = tools.CdataToObject(targetData.data.c, targetData.data.t)
        // if (o.path) {
        //   o.path = o.path.replace(/\/+$/, '')
        // }
        // 接收端画板应用
        if (tools.isWhiteboard(targetData.data.p)) {
          let actionData = {
            type: TYPES.LIVE_SET_PAGE,
            payload: {
              id: targetData.data.p.toString(),
              pageIndex: targetData.data.p,
              subIndex: 1,
              pageAmount: 1,
              handlerXid: targetData.data.x,
              color: o.color,
              ret: {
                backgroundColor: tools.color(o.color)
              },
              isSend: targetData.isSend
            }
          }
          // 海报
          if (o.code == 10) {
            actionData.payload.ret.effect = 1
            actionData.payload.ret.backgroundColor = 'rgba(0, 0, 0, 0)'
            actionData.payload.ret.server_path = o.path
            actionData.payload.ret.src = o.path
          }
          this.store.dispatch(actionData)
        } else {
          let resData = null
          if (o.path !== this.store.getState().PPT.path) {
            // 创建一页新数据
            resData = {
              suffix: '.jpg',
              serverPath: o.path,
              path: o.path,
              pages: Object.assign({}, this.store.getState().PPT.pages) // 需要合并原本的数据，原本没有pages数据时才是空对象
            }
            resData.pages[o.page] = {}
            this.updatePPTData({
              ret: resData
            })
          } else
            // 动<==>静，同一个PPT的动静模式互相切换
            if (targetData.data.ap && targetData.data.ap !== this.store.getState().animatePPT.pptType) {
              // 创建一页新数据
              resData = {
                suffix: '.jpg',
                serverPath: o.path,
                path: o.path,
                pages: {} // 动<==>静，同一个PPT的动静模式互相切换的时候清空PPT页数和涂鸦页数
              }
              resData.pages[o.page] = {}
              this.updatePPTData({
                ret: resData
              })
            }

          // 接收端PPT翻页
          // 先更新pptType(区分动态还是静态)
          new Promise((reslove) => {
            this.addPPTPage(targetData.data.p) // 更新 => state.PPT.pages[1,2,3...]
            this.addPPTDraw(targetData.data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]
            if (typeof targetData.data.ap != 'undefined') {
              this.store.dispatch({
                type: TYPES.UPDATE_PPT_TYPE,
                payload: targetData.data.ap
              })
            }
            reslove()
          }).then(() => {
            let _state = this.store.getState(),
              _id = _state.room.pptId,
              actionData = {
                type: TYPES.LIVE_SET_PAGE,
                payload: {
                  id: _id, //课件id
                  pageIndex: targetData.data.p, //parseInt(data.page), //子页
                  subIndex: o.subIndex || 1, //分页
                  // handlerXid: handlerXid || this.Store.getState().room.curUser.xid,
                  pageAmount: _state.page.pageAmount, // 课件页面总数
                  ret: resData,
                  isSend: targetData.isSend
                }
              }
            this.store.dispatch(actionData)
          })
          if (o.code === '0' || o.code === '5' || o.code === '6') {
            this.pptScroll(o, 0) // @o 表示指令， @0表示延迟执行的时间
          }
        }
      }
  }
  // 异步调用 SET_PAGE 
  // 外部应用一个文档数据
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
  // 传输(socket)数据，到达Page操作
  transport(data) {
    // data = '{"hd":"t","x":"10254359","st":7261.856,"t":51,"p":10002,"c":"|10002|0|1,0,0,1,0,0|23356|1","n":140}
    // if (data.x) {
    //   // 本人操作排除
    //   if (this.store.getState().room.curUser.xid == data.x) {
    //     tools.log('## Exclude do!')
    //     return false
    //   }
    // }
    /**
     * ⚠️ 管理员排除操作，直接拿本地数据读取
     * id, page, subpage 拿到这些数据操作本地翻页
     * TODO...
     */
    // return new Promise((resolve, reject) => {
    if (typeof (data) === 'string') {
      data = JSON.parse(data)
    }
    // 翻页操作
    let pageDrawDataLength = 0
    if (data.t == STATIC.PAGE) {
      let o = tools.CdataToObject(data.c, data.t)
      if (o.path) {
        // 所有地址都先经过hostGroup的PPT域名组第一个替换
        let sourceReLoad = globalStore.reducerStore.getState().sourceReLoad
        let targetHost = o.path.split('/')[2];
        // 如果已经遍历过就存在tryGroup，后面直接取出，不需要再遍历
        if (sourceReLoad.tryGroup.length > 0) {
          o.path = o.path.replace(targetHost, sourceReLoad.tryGroup[0])
        } else {
          // 如果还没有遍历过就判断有长度再遍历
          if (sourceReLoad.hostGroup.length > 0) {
            for (let g in sourceReLoad.hostGroup) {
              if (sourceReLoad.hostGroup[g].includes(targetHost)) {
                o.path = o.path.replace(targetHost, sourceReLoad.hostGroup[g][0])
              }
            }
          }
        }
        // 去掉地址最后一个斜杠
        o.path = o.path.replace(/\/+$/, '')
      }
      // Whiteboard
      // pageDrawDataLength字段是为了给小班sdk翻页的时候判断要不要请求command数据
      if (tools.isWhiteboard(data.p)) {
        // 当翻动ppt的时候先收到3操作码的画板，此时也调用loading遮盖画板
        if (tools.CdataToObject(data.c, data.t).code == 3) {
          emitter.emit('load:whiteboard:status', { status: false })
        }
        let action = {
          type: TYPES.LIVE_SET_PAGE,
          payload: {
            id: data.p.toString(),
            pageIndex: data.p,
            subIndex: 1,
            pageAmount: 1,
            handlerXid: data.x,
            ret: {
              backgroundColor: tools.color(o.color)
            }
          }
        }
        // 10操作码表示有图片需要模仿PPT，拉满画板
        if (o.code == 10) {
          action.payload.ret.backgroundColor = "rgba(0, 0, 0, 0)"
          action.payload.ret.effect = 1
          action.payload.ret.server_path = o.path
          action.payload.ret.src = o.path
        }
        this.store.dispatch(action)
        // 更新 -> whiteboard 公共数据
        this.store.dispatch({
          type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
          payload: o.code == 10 ? "rgba(0, 0, 0, 0)" : tools.color(o.color)
        })
        // 更新 -> WHITEBOARD 列表数据
        // this.store.dispatch({
        //   type: TYPES.UPDATE_WHITEBOARD_DATA,
        //   payload: {
        //     data: {
        //       id: data.p,
        //       backgroundColor: tools.color(o.color)
        //     }
        //   }
        // })
        // pageDrawDataLength字段是为了给小班sdk翻页的时候判断要不要请求command数据
        if (this.store.getState().pageDrawData.WHITEBOARD[data.p]) {
          pageDrawDataLength = Object.keys(this.store.getState().pageDrawData.WHITEBOARD[data.p]).length
        }
      }
      // PPT
      // socket 返回值没有 ppt-id 所以只能用 path 路径 作为唯一id判断
      else {
        // pageDrawDataLength字段是为了给小班sdk翻页的时候判断要不要请求command数据
        if (this.store.getState().pageDrawData.PPT[data.p]) {
          pageDrawDataLength = Object.keys(this.store.getState().pageDrawData.PPT[data.p]).length
        }
        // 管理员只做本地翻页
        if (tools.isAdmin()) {
          graphicTempObject.clear()
          this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
          // 接收处理滚动课件
          if (o.code === '0' || o.code === '5' || o.code === '6') {
            this.pptScroll(o)
          }
          // }
          // })
          // this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
          // // 接收处理滚动课件
          // if (o.code === '0' || o.code === '5' || o.code === '6') {
          //   this.pptScroll(o)
          // }
          // pageDrawDataLength字段是为了给小班sdk翻页的时候判断要不要请求command数据
          return Promise.resolve(pageDrawDataLength)
        }
        // ppt: {分页： {子页}}，这里判断分页相同时(画板公用page.currentPage，所以要再这里被筛选掉)
        if (data.p == this.store.getState().page.currentPage) {
          // 这里判断PPT的path不同时，即PPT切换了 || 同一个PPT下的动静模式切换了
          if (o.path !== this.store.getState().PPT.path || data.ap !== this.store.getState().animatePPT.pptType) {
            new Promise((resolve, reject) => {
              // 
              // 更新 state.PPT[serverpath,path...] 对象
              // 每次回调对比 state.PPT.path 是否跟 cmd.path 一致?
              // 不同数据
              let resData = {
                suffix: '.jpg',
                serverPath: o.path,
                path: o.path,
                pages: {
                  "1": {}
                }
              }
              this.updatePPTData({
                ret: resData
              })
              new Promise((reslove) => {
                if (typeof data.ap != 'undefined') {
                  this.store.dispatch({
                    type: TYPES.UPDATE_PPT_TYPE,
                    payload: data.ap
                  })
                }
                reslove()
              }).then(() => {
                // 翻页数据保持
                this.store.dispatch({
                  type: TYPES.LIVE_SET_PAGE,
                  payload: {
                    id: o.path,
                    pageIndex: data.p,
                    subIndex: o.subIndex,
                    pageAmount: 1,
                    handlerXid: data.x,
                    ret: resData
                  }
                })
              })
              resolve()
            }).then(() => {
              this.addPPTPage(data.p) // 更新 => state.PPT.pages[1,2,3...]
              this.addPPTDraw(data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]
            }).then(() => {
              // 只清楚文字的缓存对象，图片有异步，如果清除图片的话会造成2张同ID图片都渲染
              graphicTempObject.clear('textList')
              // 翻页
              this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
              // 接收处理滚动课件
              if (o.code === '0' || o.code === '5' || o.code === '6') {
                this.pptScroll(o)
              }
            })
          } else {
            graphicTempObject.clear()
            // 翻页数据保持
            // 如果是动态PPT时，无法直接use，通过更新pageIndex，让Animation.js监听执行动态PPT翻页
            if (data.ap == 1) {
              this.store.dispatch({
                type: TYPES.LIVE_SET_PAGE,
                payload: {
                  id: o.path,
                  pageIndex: data.p,
                  subIndex: o.subIndex,
                  pageAmount: 1,
                  handlerXid: data.x,
                  ret: null
                }
              })
            } else {
              // 如果id、分页、子页都不变，就直接判断滚动，不需要再use
              if (o.subIndex == this.store.getState().page.currentSubPage) {
                if (o.code === '0' || o.code === '5' || o.code === '6') {
                  this.pptScroll(o)
                }
              } else {
                this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
                if (o.code === '0' || o.code === '5' || o.code === '6') {
                  this.pptScroll(o)
                }
              }
            }
          }
        }
        // ppt: {分页： {子页}}，这里判断分页不相同时(画板公用page.currentPage，所以要再这里被筛选掉)
        else {
          new Promise((resolve, reject) => {
            // 
            // 更新 state.PPT[serverpath,path...] 对象
            // 每次回调对比 state.PPT.path 是否跟 cmd.path 一致?
            let resData = null
            if (o.path !== this.store.getState().PPT.path || data.ap !== this.store.getState().animatePPT.pptType) {
              // 创建一页新数据
              resData = {
                suffix: '.jpg',
                serverPath: o.path,
                path: o.path,
                pages: {
                  "1": {}
                }
              }
              this.updatePPTData({
                ret: resData
              })
            }

            new Promise((reslove) => {
              if (typeof data.ap != 'undefined') {
                this.store.dispatch({
                  type: TYPES.UPDATE_PPT_TYPE,
                  payload: data.ap
                })
              }
              reslove()
            }).then(() => {
              // 翻页数据保持
              this.store.dispatch({
                type: TYPES.LIVE_SET_PAGE,
                payload: {
                  id: o.path,
                  pageIndex: data.p,
                  subIndex: o.subIndex,
                  pageAmount: 1,
                  handlerXid: data.x,
                  ret: resData
                }
              })
            })
            resolve()
          }).then(() => {
            this.addPPTPage(data.p) // 更新 => state.PPT.pages[1,2,3...]
            this.addPPTDraw(data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]
          }).then(() => {
            // 只清除文字的缓存对象，图片有异步，如果清除图片的话会造成2张同ID图片都渲染
            graphicTempObject.clear('textList')
            // 翻页
            this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
            // 接收处理滚动课件
            if (o.code === '0' || o.code === '5' || o.code === '6') {
              this.pptScroll(o)
            }
          })
        }
        // // 当前页切换
        // if (data.p == this.store.getState().page.currentPage) {
        //   graphicTempObject.clear()
        //   this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
        //   if (o.code === '0' || o.code === '5' || o.code === '6') {
        //     this.pptScroll(o)
        //   }
        // }
        // // 新翻页
        // else {
        //   new Promise((resolve, reject) => {
        //     // 
        //     // 更新 state.PPT[serverpath,path...] 对象
        //     // 每次回调对比 state.PPT.path 是否跟 cmd.path 一致?
        //     // console.error(o.path, this.store.getState().PPT.path)
        //     // 不同数据
        //     let resData = null
        //     if (o.path !== this.store.getState().PPT.path) {
        //       // 创建一页新数据
        //       resData = {
        //         suffix: '.jpg',
        //         serverPath: o.path,
        //         path: o.path,
        //         pages: {
        //           "1": {}
        //         }
        //       }
        //       this.updatePPTData({
        //         ret: resData
        //       })
        //     }
        //     // 翻页数据保持
        //     this.store.dispatch({
        //       type: TYPES.LIVE_SET_PAGE,
        //       payload: {
        //         id: o.path,
        //         pageIndex: data.p,
        //         subIndex: o.subIndex,
        //         pageAmount: 1,
        //         handlerXid: data.x,
        //         ret: resData
        //       }
        //     })
        //     resolve()
        //   }).then(() => {
        //     this.addPPTPage(data.p) // 更新 => state.PPT.pages[1,2,3...]
        //     this.addPPTDraw(data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]
        //   }).then(() => {
        //     // 只清楚文字的缓存对象，图片有异步，如果清除图片的话会造成2张同ID图片都渲染
        //     graphicTempObject.clear('textList')
        //     // 翻页
        //     this.use({ PAGE: o.page, SUB_PAGE: o.subIndex })
        //     // 接收处理滚动课件
        //     if (o.code === '0' || o.code === '5' || o.code === '6') {
        //       this.pptScroll(o)
        //     }
        //   })
        // }
      }
      tools.log('transport setPage done, next step...')
    }
    // pageDrawDataLength字段是为了给小班sdk翻页的时候判断要不要请求command数据
    return Promise.resolve(pageDrawDataLength)
  }
  pptScroll(o, delay = 500) {
    setTimeout(() => {
      let img = document.querySelector('#ppt-img-main')
      let ppt = new PPT()
      let martrc = o.martrc.split(',')
      let receivePostTop = martrc[5]
      let postTop = receivePostTop
      if (!globalStore.reducerStore.getState().PPT.serverPath) {
        // 这里存储的是临时postTop(图片还没加载完的时候用作中转复制给state.PPT.pages更新postTop)
        this.store.dispatch({
          type: TYPES.PPT_SCROLL_POST_TOP_INFO,
          payload: {
            scrollInfo: {
              postTop: postTop
            }
          }
        })
      } else if (tools.deleteProtocol(o.path) !== tools.deleteProtocol(globalStore.reducerStore.getState().PPT.serverPath)) {
        // 这里存储的是临时postTop(图片还没加载完的时候用作中转复制给state.PPT.pages更新postTop)
        this.store.dispatch({
          type: TYPES.PPT_SCROLL_POST_TOP_INFO,
          payload: {
            scrollInfo: {
              postTop: postTop
            }
          }
        })
      }
      // 设置发送的top(图片未加载完时也把数据存储，在PPT.js imgOnload重新检测进行滚动)
      ppt.updatePostTop(postTop)
      if (!img) {
        return false
      }
      let receivePostScale = martrc[0]
      let _parentDom = document.querySelector('#ht-ppt-loader')
      let _parent = _parentDom.getBoundingClientRect()
      let getInspectData = ppt.getInspectData(img)
      if (getInspectData.IMG_DOM.width == 0) return
      let localScale = _parent.width / getInspectData.IMG_DOM.width
      let scrollTop = postTop * localScale / receivePostScale // 800宽度窗口滚动100，本质为800与页面图片的父容器宽度比
      let interval = 100 * localScale / receivePostScale
      // 向上滚动时如果最后一次滚动的高度不够时以实际为准（即滚动到顶部）
      if (o.code === '6' && interval > Math.abs(img.offsetTop)) {
        scrollTop = 0
      }
      // 向下滚动时如果剩余高度小于从它端接收到的滚动区间，则以实际为准（即滚动到底部）
      if (o.code === '5') {
        // 剩余可以滚动的高度
        let offsetVal = img.clientHeight - document.querySelector('#ht-ppt-loader').clientHeight - Math.abs(img.offsetTop)
        if (interval > Math.abs(offsetVal)) {
          scrollTop = -(img.clientHeight - document.querySelector('#ht-ppt-loader').clientHeight)
        }
      }
      // 更新滚动的top
      ppt.updateScrollTop(img, scrollTop)
      /* 
       * 延迟500起因：适配直播器嘉宾功能useDoc内部给clear后的指令500毫秒延迟。所以小班usePage也要给500
       * 结果：小班usePage要给500，此处延迟500毫秒，否则滚动的页数不准确
       */
    }, delay);
  }
  /** ## 更新PAGE操作 ##
   * @param {*} news 返回state最新状态
   * @param {*} olds 返回state上一次状态
   * 流程：
   * =================
   * whiteoard 更新 (判断this.ID & 更新ID是否一致)
   * ppt 更新 (判断this.ID & 更新ID是否一致)
   * draw翻页更新
   * ppt更新图片
   * 历史更新
   * 涂鸦页对应更新
   */
  didUpdate(news, olds) {
    if (!news.room || !olds.room) {
      return
    }
    let newSet = news.room.setPageData
    let oldSet = olds.room.setPageData
    this.props = this.store.getState()

    // 切换Whiteboard
    if (olds.room.whiteboardId !== news.room.whiteboardId) {
      tools.log('更换WHITEBOARD ==>', newSet.pageIndex)
      new Promise((resolve) => {
        this.fireWhiteboard(newSet)
        resolve()
      }).then(() => {
        this.computedPages()
      })
    }

    // 更换操作
    if (olds.room.pptId !== news.room.pptId || olds.room.whiteboardId !== news.room.whiteboardId) {
      tools.log('page data has change ==>', this.props.page)
      this.state.pageIndex = 0
      // 计算分页
      // this.computedPages()
    }
    // 更换画板颜色


    // 缓存数据
    this.state.preProp = news
  }
  // 使用setPage翻页切换
  changeSetPage(news, olds) {
    if (!news || !olds) {
      return false
    }
    // 上下翻页操作
    if (tools.isWhiteboard(news.pageIndex) && news.pageIndex !== olds.pageIndex) {
      let _index = (news.pageIndex).toString()
      let key = this.props.page.pageIndexs.indexOf(_index)
      tools.log('changePage index=>', key)
    } else if (news.id === olds.id && news.pageIndex !== olds.pageIndex || news.pageSubIndex !== olds.pageSubIndex) {
      let _index = (news.pageIndex).toString()
      let key = this.props.page.pageIndexs.indexOf(_index)
      tools.log('changePage index=>', key)
    }
  }
  renderWHITEBOARD(newSet) {
    // 更新 -> whiteboard 公共数据
    let currentWhiteBg = this.store.getState().WHITEBOARD[newSet.pageIndex].backgroundColor
    this.store.dispatch({
      type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
      payload: newSet.ret ? newSet.ret.backgroundColor : currentWhiteBg ? currentWhiteBg : '#EEEEEE'
    })
  }
  // 
  useQueuen({ PAGE, SUB_PAGE, isClear, isSend = 1 }) {
    this.useSchlist = [{}, {}]
    this.useAddSchedule.apply(this, arguments)
  }
  // 使用当前页
  // 建立当前页数据
  // PPT & whiteboard
  /**
   * 翻页参数说明
   * @param {主页} PAGE
   * @param {子页} SUB_PAGE
   * @param {是否强制清空当前涂鸦} isClear
   * =======================
   */
  use({ PAGE, SUB_PAGE, isClear, isSend = 1 }) {
    if (!PAGE) {
      return
    }
    let that = this
    useSchedule.useAddSchedule(
      function () {
        PAGE = PAGE.toString()
        SUB_PAGE = (SUB_PAGE || 1).toString()
        // 如果当前页面涂鸦数据,执行渲染
        let MODE = tools.isWhiteboard(PAGE) ? STATIC.WHITEBOARD : STATIC.PPT
        let pageDrawData = that.store.getState().pageDrawData[MODE][PAGE]
        // let curPage = that.store.getState().page.currentPage
        tools.log('#Current Page Use => ', PAGE, SUB_PAGE, pageDrawData)
        // 清空涂鸦
        tools.removeKlss()
        // 如果当前页存在 & 有涂鸦数据 => 渲染当前页涂鸦
        if (pageDrawData && !isClear) {
          that.render(pageDrawData)
        }
        // 渲染图片
        if (MODE === STATIC.PPT) {
          tools.renderPPT({ PAGE: PAGE, SUB_PAGE: SUB_PAGE, isSend: isSend })
        } else {
          // 应用画板的时候画板滚动高度置0,防止被课件的滚动影响
          // 应用课件的高度在PPT.js中处理
          document.querySelectorAll('canvas').forEach(function (item, index) {
            item.style.top = '0px'
          })
          // 重新设置fabric的背景颜色（因为可能初始化的背景被removeKlss方法中的.fabcri.clear置空了）
          if (that.store.getState().WHITEBOARD[PAGE]) {
            globalStore.fabric.backgroundColor = that.store.getState().WHITEBOARD[PAGE].backgroundColor
            globalStore.fabric.renderAll()
          }
          emitter.emit('load:whiteboard:status', { status: true })
        }
      }
    )
    if (!useSchedule.running) {
      useSchedule.running = true
      useSchedule.useRunSchedule()
    }
  }
  // 翻页清空涂鸦
  clear(action) {
    // isSend == 1表示本地发起，所以在切换文档前先发送一次10002，isSend == 0表示接收端，不需要发送。没有isSend表示网页端，需要发送
    if (action.payload.isSend != 0) {
      new Promise(resolve => {
        // 小班在外层判断xid,是是自己才会发送下一步then的10002。吸纳更新
        if (globalStore.getState().room.curUser && globalStore.getState().room.curUser.xid) {
          this.store.dispatch({
            type: TYPES.UPDATE_ROOM_HANDLER_XID,
            payload: globalStore.getState().room.curUser.xid
          })
        }
        resolve()
      }).then(() => {
        let _tpl = tools.getCmdTpl()
        let ctpl_3 = {
          st: _tpl.st,
          x: _tpl.x,
          p: globalStore.getState().room.pageBase,
          c: `|${globalStore.getState().room.pageBase}|3|1,0,0,1,0,0|${tools.color(globalStore.getState().whiteboard.backgroundColor)}|1`,
          t: STATIC.PAGE,
          n: globalStore.getId(),
          hd: 'f'
        }
        tools.log('Do clear Post... ==>', ctpl_3)

        let Qt = globalStore.getQt()
        Qt.sendToQt(ctpl_3)
        this.doFlush(ctpl_3)
      })
    }

    // 重置翻动过的PPT页数
    this.store.dispatch({
      type: TYPES.UPDATE_WHITEBOARD_PAGE,
      payload: {
        operation: 'clearPPT',
      }
    })
    // 重置currentPage
    this.store.dispatch({
      type: TYPES.UPDATE_WHITEBOARD_PAGE,
      payload: {
        operation: 'resetCurrentPage',
      }
    })
    return Promise.resolve()
  }
  // 发送操作（发给小班的）
  doFlush(data) {
    // this.savePage(data)
    tools.log('Do flush ==>', data)
    emitter.emit('set:page', data)
  }
  // 封装指令
  flush(PAGE, SUB_PAGE, curPageData, isEmit) {
    let _tpl = tools.getCmdTpl()
    let Qt = globalStore.getQt()
    let state = this.store.getState()
    let pageDataLen = Object.keys(curPageData || {})
    let path = null
    let _postScale = null
    let _postTop = null
    // 画板
    if (tools.isWhiteboard(PAGE)) {
      path = ''
      _postScale = '1'
      _postTop = '0'
    } else {
      //课件
      path = state.PPT.serverPath + '/'
      _postScale = state.pptInfoResource.postScale
      _postTop = state.PPT.pages[PAGE] && state.PPT.pages[PAGE].postTop ? state.PPT.pages[PAGE].postTop : 0
    }
    let cdata = {
      url: path,
      page: PAGE,
      operationCode: 0,
      // matrix: _postScale + ',0,0,' + _postScale + ',0,' + _postTop,
      matrix: `${_postScale},0,0,${_postScale},0,${_postTop}`,
      // matrix: '1,0,0,1,0,0',
      color: tools.color(state.whiteboard.backgroundColor),
      idx: SUB_PAGE
    }
    let ctpl = {
      st: _tpl.st,
      x: _tpl.x,
      p: PAGE,
      c: tools.objectToCdata(cdata),
      t: STATIC.PAGE,
      n: globalStore.getId(),
      ap: state.animatePPT.pptType,
      hd: pageDataLen.length > 0 ? 't' : 'f'
    }
    tools.log('flush setPage post ==>', ctpl)
    // 发送Qt
    Qt.sendToQt(ctpl)
    // emit
    if (isEmit) {
      // emitter.emit('set:page', ctpl)
    }
    return ctpl
  }
  // 渲染
  render(cdatas) {
    let _c = (Object.keys(cdatas))
    new Promise((resolve) => {
      _c.map((item) => {
        let _item = cdatas[item]
        graphic.getBrushType({
          brush: _item.t,
          data: _item,
          // isRefresh =>是否刷新了的标志，会从小班sdk中传递到画板中（暂时不用，可以作为扩展参数）
          isRefresh: true
        })
      })
      resolve()
    }).then(() => {
      // 特殊逻辑：如果当前画笔是橡皮擦，需要在涂鸦渲染后再实例一次，目的是设置涂鸦对象的可选属性，否则刷新后擦除不了涂鸦
      if (this.store.getState().whiteboard.brushType === STATIC.ERASE) {
        // 设置橡皮擦cursor
        tools.setCursor({ 'brushType': STATIC.ERASE })
        // 实例化橡皮擦
        graphic.getBrushType({
          brush: STATIC.ERASE
        })
      }
    })
  }
  // 更新页码数据
  /**
   * {
   *  currentPage: 1
   *  subPage: 1
   *  pageAmount: 10
   * }
   */
  updatePageData(pageObject, dispatch) {
    if (typeof (pageObject) !== 'object') {
      tools.log('非法设置翻页数据 ==>', pageObject)
      return false
    }
    // change...
    this.store.dispatch({
      type: TYPES.UPDATE_PAGE_DATA,
      payload: {
        data: pageObject
      }
    })
    return Promise.resolve()
  }
  // 合并翻页总数
  computedPages() {
    this.props = this.store.getState()
    let PAGE_PPT = this.props.pageDrawData['PPT']
    let PAGE_WHITEBOARD = this.props.pageDrawData['WHITEBOARD']
    let page_ppt = Object.keys(PAGE_PPT) || []
    let page_wb = Object.keys(PAGE_WHITEBOARD) || []
    let pageIndexs = page_wb.concat(page_ppt)
    let _pageKeys = []
    // PPT分页索引
    if (this.props.page.pages) {
      let _pages = this.props.page.pages
      Object.keys(this.props.page.pages).map((k) => {
        if (_pages[k]['subPage'] && _pages[k]['subPage'].length > 0) {
          _pages[k]['subPage'].map((sk) => {
            _pageKeys.push(k + '_' + sk)
          })
        } else {
          _pageKeys.push(k + '_1')
        }
      })
    }
    // 翻页索引
    // if (this.state.pageIndexs.length !== pageIndexs.length) {
    tools.log('computed pages ==>', pageIndexs, '\n', _pageKeys)
    let _pageComputed = page_wb.concat(_pageKeys)
    this.updatePageData({
      pageIndexs: pageIndexs,
      pageComputed: _pageComputed
    })
    this.state.pageIndexs = pageIndexs
    // }
    return pageIndexs
  }
  /**
   * 渲染当前页涂鸦
   * =============
   * 不同模式清空
   * 不同页码清空
   */
  renderPage() {
    graphicTempObject.clear()
    let page = this.store.getState().page
    // if (page.currentPage !== this.state.pageIndex || page.currentSubPage !== this.state.pageSubIndex) {
    this.use({ PAGE: page.currentPage, SUB_PAGE: page.currentSubPage })
    // 每次PPT翻页时把滚动指示器重置为在顶部状态
    // if (document.querySelector('.scroll_up')) {
    //   document.querySelector('.scroll_up').classList.remove('scroll_direction')
    //   document.querySelector('.scroll_down').classList.add('scroll_direction')
    //   document.querySelectorAll('canvas').forEach(function(item, index){
    //     item.style.top = '0px'
    //   })
    // }
    // }
    this.state.pageIndex = page.currentPage
    this.state.pageSubIndex = page.currentSubPage
  }
  // 创建/更新画板涂鸦
  fireWhiteboard(newSet) {
    tools.log('FIRE ==>', STATIC.WHITEBOARD, newSet)
    // let newSet.pageIndex = setData.pageIndex
    let MODE = tools.isWhiteboard(newSet.pageIndex) ? STATIC.WHITEBOARD : STATIC.PPT
    let pageData = this.props.pageDrawData[MODE][newSet.pageIndex]
    // 新增 -> Whiteboard涂鸦
    if (!pageData) {
      this.store.dispatch({
        type: TYPES.ADD_DRAW_WHITEBOARD,
        payload: {
          data: {
            id: newSet.pageIndex
          }
        }
      })
    }
    // let WhiteboardData = this.props.WHITEBOARD[newSet.pageIndex]
    // if (!WhiteboardData) {
    //   this.store.dispatch({
    //     type: TYPES.UPDATE_WHITEBOARD_DATA,
    //     payload: {
    //       data: {
    //         id: newSet.pageIndex,
    //         // 背景颜色可能来自客户端/初始化默认
    //         backgroundColor: newSet.ret ? newSet.ret.backgroundColor : STATIC.WHITEBOARD_DEFAULT_BGCOLOR
    //       }
    //     }
    //   })
    // }
    // 渲染当前WhiteBoard颜色
    // this.renderWHITEBOARD(newSet)
  }
  // socket使用
  addPPTPage(PAGE) {
    // add ppt page.
    if (this.store.getState().PPT['pages']) {
      let pageData = this.store.getState()['PPT']['pages'][PAGE]
      // 新增 -> PPT涂鸦
      if (!pageData) {
        this.store.dispatch({
          type: TYPES.ADD_PPT_PAGE,
          payload: {
            data: PAGE
          }
        })
      }
    }
  }
  // 新增涂鸦对象
  addPPTDraw(PAGE) {
    // tools.log('FIRE ==>', STATIC.PPT)
    // let PAGE = setData.pageIndex
    // let SUB_PAGE = setData.subIndex
    // let MODE = tools.isWhiteboard(PAGE) ? STATIC.WHITEBOARD : STATIC.PPT
    let pageData = null //this.props.pageDrawData[MODE][PAGE]
    // 新增 -> PPT涂鸦
    if (!pageData) {
      this.store.dispatch({
        type: TYPES.ADD_DRAW_PPT,
        payload: {
          data: {
            id: PAGE
          }
        }
      })
    }
  }
  // 更新ppt数据
  updatePPTData(setData) {
    // 新增 PPT 数据
    if (setData && setData.ret) {
      this.store.dispatch({
        type: TYPES.UPDATE_PPT_DATA,
        payload: {
          data: setData.ret
        }
      })
      // 清空当前涂鸦对象
      this.store.dispatch({
        type: TYPES.UPDATE_PAGE_DRAW_DATA,
        payload: {
          type: 'UPDATE',
          mode: STATIC.PPT,
          data: {}
        }
      })
    }
    // 创建涂鸦对象
    // todo... 一次创建不需要循环
    if (setData.pageAmount) {
      let drawsCount = setData.pageAmount
      if (drawsCount > 0) {
        for (let k = 0; k < drawsCount; k++) {
          let PAGE = (k + 1).toString()
          this.addPPTDraw(PAGE)
        }
      }
    }
    return Promise.resolve()
  }
}