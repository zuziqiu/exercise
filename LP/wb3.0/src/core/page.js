/**
 * 翻页操作
 * 初始化 & 页码更新
 * ==================
 * 核心流程
 * ==================
 * 课件 state => 渲染必要条件
 * =======================
 */
import { toJS, transaction } from 'mobx'
import { actions } from '../Action/index'
import { store } from '../states/index'
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import { graphic } from '../graphic'
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState'
import wbEmitter from '../extensions/wbEmitter'
import { PPT } from '../components/PPT'
import { graphicTempObject } from '../core/graphicTempObject'
import { hostMachine } from '../extensions/hostMachine'
import { useSchedule } from '../extensions/useSchedule'

class Page {
  constructor() {
    tools.log('Page Mode Create...')
    this.store = store
    this.actions = actions
    this.listener()
    this.on()
  }
  on() {
    // 每次PPT图片加载完都会接收到该指令。更新
    wbEmitter.on('wb:usePPT:status', ({ payload }) => {
      // status == true 表示图片onload
      if (payload.status) {
        // scheduleList一次执行一条
        if (useSchedule.useScheduleList.length > 0) {
          useSchedule.useRunSchedule()
        } else {
          // scheduleList全部执行完毕。重置running
          useSchedule.running = false
        }
      }
    })
    // 重新计算page
    wbEmitter.on('wb:page:computedPages', () => {
      this.computedPages()
    })
    // 监听画板外部传入的应用PPT指令(小班讲师或助教应用PPT)
    wbEmitter.on('wb:page:doSetPage', ({ payload, callback }) => {
      // console.warn('wb:page:doSetPage', JSON.stringify(payload))
      this.doSetPage(payload)
    })
    // 监听画板外部传入的新增白板指令(client)
    wbEmitter.on('wb:page:applyWhiteboard', ({ payload, callback }) => {
      // console.warn('wb:page:applyWhiteboard', JSON.stringify(payload))
      this.applyWhiteboard(payload, callback)
    })
    // 监听画板外部传入的翻页指令(client)
    wbEmitter.on('wb:page:clientUpdatePage', ({ payload, callback }) => {
      // console.warn('wb:page:clientUpdatePage', JSON.stringify(payload))
      this.clientUpdatePage(payload.page, callback)
    })
    // 监听画板外部传入的翻页指令(socket)（原transport方法)
    wbEmitter.on('wb:page:socketUpdatePage', ({ payload, callback }) => {
      // console.warn('wb:page:socketUpdatePage', JSON.stringify(payload))
      this.socketUpdatePage(payload.page, callback)
    })
    // 监听画板外部传入的涂鸦指令
    wbEmitter.on(TYPES.UPDATE_PAGE_DRAW_DATA, ({ payload }) => {
      // console.warn('wb:page:UPDATE_PAGE_DRAW_DATA', JSON.stringify(payload));
      ;[].concat(payload.drawData).map((data) => {
        // 图形指令code
        let brushCode = [STATIC.CURVE, STATIC.LINE, STATIC.ARROW, STATIC.ELLIPSE, STATIC.RECTANGLE, STATIC.TRIANGLE, STATIC.TEXT, STATIC.DOTTED_LINE, STATIC.IMAGE, STATIC.POINTER]
        let oData = typeof data === 'string' ? JSON.parse(data) : data

        if (Object.prototype.toString.call(oData.c) === '[object String]') {
          // Socket 指令
          let doCommand = ({ oData }) => {
            if (!oData) return
            oData.t = oData.t.toString()
            // 如果非当前页放弃渲染
            if (Number(oData.p) !== Number(globalStore.store.page.currentPage)) {
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
            globalStore.actions.dispatch('pageDrawData', {
              type: TYPES.UPDATE_PAGE_DRAW_DATA,
              payload: {
                mode: MODE,
                page: oData.p.toString(),
                data: oData
              }
            })
            // 图形渲染后会执行flush,isRefresh字段是为了判断作为接收端刷新时不允许发送出去
            graphic.getBrushType({ brush: oData.t, data: oData })
          }
          oData.cid = oData.c.split('|')[0]
          oData.t = oData.t.toString()
          // 各个涂鸦指令
          if (brushCode.indexOf(oData.t) > -1) {
            doCommand({ oData: oData })
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
                    doCommand({ oData: _item })
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
        }
      })
    })
  }
  // 状态监听，需要在这里完成
  listener() {
    // spy((event) => {
    //   if (event.type === 'action' && event.name == 'page') {
    //     tools.log(`更新模块：${event.name} \n 原有store：${JSON.stringify(event.arguments[0])} \n 供应数据：${JSON.stringify(event.arguments[1])}`)
    //   }
    // })
    // 创建画板???(画板切画板  id变化会有错误)
    globalStore.listenKeep(
      () => {
        return { whiteboardId: toJS(this.store.page.whiteboardId) }
      },
      ({ whiteboardId }) => {
        // =========================  该区块代码是切换到白板的时候重置PPT的状态 start ==============================
        // 清空PPT的资源重试计时器
        hostMachine.clear()
        // 清空临时涂鸦数据
        graphicTempObject.clear()
        // 切换到白板时初始化重置动态PPT的状态
        this.actions.dispatch('animatePPT', {
          type: TYPES.UPDATE_ANIMATION_PPT_STATE,
          payload: 'wait'
        })
        // =========================  该区块代码是切换到白板的时候重置PPT的状态 end ==============================
        new Promise((resolve) => {
          this.executeWhiteboard(whiteboardId)
          resolve()
        }).then(() => {
          this.computedPages()
        })
      }
    )
    // 计算属性，静态文档的（pptId_currentPage_currentSubPage_pptType）任一变化会更新computedPage
    // 注：动态PPT不被此计算属性发起，在Animation.js里 reaction => store.animatePPT.pptType控制
    globalStore.listenKeep(
      () => {
        return { computedPage: this.store.computedPage }
      },
      ({ computedPage }) => {
        tools.log(`更换翻页 ==> ${this.store.page.currentPage}_${this.store.page.currentSubPage}`)
        // 清空临时涂鸦数据
        graphicTempObject.clear() // ?翻subPage 可能不需要清空
        this.executePage({ PAGE: this.store.page.currentPage, SUB_PAGE: this.store.page.currentSubPage, isSend: this.store.page.isSend, ap: this.store.animatePPT.pptType })
      }
    )
    // 更换ppt
    globalStore.listenKeep(
      () => {
        return { pptId: toJS(this.store.page.pptId) }
      },
      ({ pptId }) => {
        // 动态PPT切换（静态=>动态、动态<=>动态）时触发loading提示
        if (globalStore.store.room.pptType == 1) {
          wbEmitter.emit('wb:usePPT:status', { status: false })
        }
        // 清空PPT的资源重试计时器
        hostMachine.clear()
        // 切换ppt时初始化重置动态PPT的状态
        this.actions.dispatch('animatePPT', {
          type: TYPES.UPDATE_ANIMATION_PPT_STATE,
          payload: 'wait'
        })
      }
    )
    // 切换PPT成功？
    globalStore.listenKeep(
      () => {
        return { status: toJS(this.store.page.status) }
      },
      ({ status }) => {
        if (status == 'done') {
          graphicTempObject.clear()
          // this.computedPages()
          // 加载完课件后。强制重置running，让schedule重新开始
          useSchedule.running = false
          // PPT加载完后对直播器暴露状态
          let webCommand = globalStore.getCommandApi()
          webCommand && webCommand && webCommand.sendToQt({ key: 'load:ppt:status', status: true })
          // PPT加载完后对app暴露状态
          window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.jsToOcWithPrams &&
            window.webkit.messageHandlers.jsToOcWithPrams.postMessage('{"origin":"talkfun","params":"pptLoaded"}')
          window.android && window.android.JsToJavaInterface('{"origin":"talkfun","params":"pptLoaded"}')
        }
      }
    )
  }
  // 直播器方法，分发页数操作
  setPageDispatcher(targetData) {
    // pageIndex表明是发起端
    if (targetData.data.pageIndex) {
      let actionData = {
        type: targetData.key,
        payload: Object.assign({ isSend: targetData.isSend }, targetData.data)
      }
      if (typeof targetData.data.ret == 'object') {
        targetData.data.ret.isSend = targetData.isSend
      }
      // 发起端画板指令
      if (tools.isWhiteboard(targetData.data.pageIndex)) {
        transaction(() => {
          // 更新 -> wbProperty 公共数据
          this.actions.dispatch('wbProperty', {
            type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
            payload: targetData.data.ret.backgroundColor
          })
          this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], actionData)
        })
      } else {
        // 应用PPT，发起端和接收端指令相同，同一处理
        let setPageData = this.store.room.setPageData
        if (targetData.data.id != this.store.page.pptId) {
          this.doSetPage(actionData)
        } else {
          // 动<==>静，同一个PPT的动静模式互相切换
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
            // 应用动态PPT type: LIVE_SET_PAGE
            this.doSetPage(actionData)
          } else {
            // 应用PPT翻页 type: LIVE_SET_PAGE
            this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], actionData)
          }
        }
      }
    }
    // p表明是接收端，接收端的应用PPT情况在pageIndex的判断中进行（特殊处理，直播器传来的指令是发起端的格式）
    else if (targetData.data.p) {
      // 接收端画板指令,重新组装
      let o = tools.CdataToObject(targetData.data.c, targetData.data.t)
      // if (o.path) {
      //   o.path = o.path.replace(/\/+$/, '')
      // }
      // 接收端画板应用
      if (tools.isWhiteboard(targetData.data.p)) {
        transaction(() => {
          // 更新 -> wbProperty 公共数据
          this.actions.dispatch('wbProperty', {
            type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
            payload: tools.color(o.color)
          })
          let _payload = {
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
          // 10操作码表示有图片需要模仿PPT，拉满画板
          if (o.code == 10) {
            _payload.ret.backgroundColor = '#ffffff'
            _payload.ret.effect = 1
            _payload.ret.server_path = o.path
            _payload.ret.src = o.path
            _payload.ret.isSend = 0
          }
          this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
            type: TYPES.LIVE_SET_PAGE,
            payload: _payload
          })
        })
      } else {
        transaction(() => {
          let resData = null
          // serverPath相同
          if (o.path == this.store.ppt.serverPath) {
            // 动<==>静，同一个PPT（serverPath相同）的动静模式互相切换
            if (targetData.data.ap && targetData.data.ap !== this.store.animatePPT.pptType) {
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
          } else {
            // serverPath变化时应用新的PPT
            // 创建一页新数据
            resData = {
              suffix: '.jpg',
              serverPath: o.path,
              path: o.path,
              pages: {}
            }
            resData.pages[o.page] = {}
            this.updatePPTData({
              ret: resData
            })
          }
          // 接收端PPT翻页
          // new Promise((reslove) => {
          this.addPPTPage(targetData.data.p) // 更新 => state.ppt.pages[1,2,3...]
          this.addPPTDraw(targetData.data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]
          let _martrc = o.martrc.split(',')
          // 记这一页的滚动记录
          globalStore.actions.dispatch('ppt', {
            type: TYPES.UPDATE_PPT_PAGE_POST_TOP,
            payload: {
              page: targetData.data.p,
              postTop: _martrc[5]
            }
          })
          // 先更新pptType(区分动态还是静态)
          if (typeof targetData.data.ap != 'undefined') {
            this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
              type: TYPES.UPDATE_PPT_TYPE,
              payload: targetData.data.ap
            })
          }
          //   reslove()
          // }).then(() => {
          let _state = this.store,
            _id = _state.page.pptId,
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
          // 应用ppt翻页 type: LIVE_SET_PAGE
          this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], actionData)
        })
      }
    }
  }
  // 外部应用一个文档数据（直播器和小班的应用文档）
  doSetPage(action) {
    // PPT ID 更换
    let that = this
    if (this.store.page.pptId != action.payload.id || action.payload.ap !== this.store.animatePPT.pptType) {
      tools.log('[S]更换PPT课件 ==>', action.payload.id)
      // 发送清空涂鸦的指令
      that.clear(action)
      setTimeout(() => {
        // 重置翻动过的PPT页数
        transaction(() => {
          this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
            type: TYPES.UPDATE_PPT_TYPE,
            payload: action.payload.ret && action.payload.ret.html5 ? 1 : 0
          })
          this.actions.dispatch('page', {
            type: TYPES.UPDATE_WHITEBOARD_PAGE,
            payload: {
              operation: 'clearPPT'
            }
          })
          // 应用文档的状态更新，以后翻页在listen中不再监听page的文档id变化（画板id还会监听）,改为监听‘status’
          transaction(() => {
            this.actions.dispatch(['animatePPT', 'page'], {
              type: TYPES.SWITCH_PAGE_STATUS,
              payload: {
                status: 'wait'
              }
            })
            transaction(() => {
              // 操作 => set:page
              // LIVE_SET_PAGE
              this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
                type: action.type,
                payload: action.payload
              })
              transaction(() => {
                // 更新PPT和pptDrawData两个数据模块
                that.updatePPTData(that.store.room.setPageData)
                transaction(() => {
                  // 更新分页结构
                  that.updatePageData({
                    pages: that.store.room.setPageData.ret.pages,
                    currentPage: action.payload.pageIndex || 1,
                    subPage: action.payload.subIndex || 1
                  })
                  transaction(() => {
                    // 更新PPT数据之后先更新滚动高度再渲染
                    let pptInfoResource = that.store.pptInfoResource
                    // 一定要判断变量是否存在（共用一套画板的新版直播器没有这个变量）
                    if (pptInfoResource.scrollInfo && pptInfoResource.scrollInfo.postTop) {
                      let currentPage = that.store.page.currentPage
                      this.actions.dispatch('ppt', {
                        type: TYPES.UPDATE_PPT_PAGE_POST_TOP,
                        payload: {
                          page: currentPage,
                          postTop: pptInfoResource.scrollInfo.postTop
                        }
                      })
                      // 变量值转换完之后置空
                      this.actions.dispatch('pptInfoResource', {
                        type: TYPES.PPT_SCROLL_POST_TOP_INFO,
                        payload: {
                          scrollInfo: {
                            postTop: null
                          }
                        }
                      })
                    }
                    that.computedPages()
                    transaction(() => {
                      // ？渲染当前页存在重复。在listen中监听翻页已处理
                      // that.renderPage()
                      // 应用文档的状态更新，以后翻页在listen中不再监听page的文档id变化（画板id还会监听）,改为监听‘status’
                      this.actions.dispatch(['animatePPT', 'page'], {
                        type: TYPES.SWITCH_PAGE_STATUS,
                        payload: {
                          status: 'done'
                        }
                      })
                    })
                  })
                })
              })
            })
          })
        })
        // 延迟500毫秒是因为切换PPT会发送PPT指令，在此之前先发送10002，两条指令间隔太短，网络转发之后可能会顺序错误
      }, 500)
    }
    return Promise.resolve()
  }
  // 小班client的翻页在此更新数据，触发响应
  clientUpdatePage(data, callback) {
    new Promise(() => {
      if (tools.isWhiteboard(data.pageIndex)) {
        data.id = globalStore.store.page.whiteboardId
      } else {
        data.id = globalStore.store.ppt.path
      }
      data.pageAmount = globalStore.store.page.pageAmount
      this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
        type: TYPES.LIVE_SET_PAGE,
        payload: data
      })
    }).then(() => {
      // 这里执行回调是因为助教获取涂鸦数组长度去判断是否请求数据，小班的助教端也可以翻页，可能后进页面没有老师的涂鸦
      if (callback) {
        let curPage = globalStore.store.page.currentPage
        let mode = tools.getMode(curPage)
        let curPageData = globalStore.store.pageDrawData[mode][curPage]
        let cmdFlushData = []
        if (curPageData) {
          let cmdKeys = Object.keys(curPageData)
          cmdKeys.map((k) => {
            let o = {
              x: curPageData[k].x,
              t: parseInt(curPageData[k].t, 10),
              p: parseInt(curPageData[k].p, 10),
              c: curPageData[k].c
            }
            cmdFlushData.push(JSON.stringify(o))
          })
        }
        callback({
          drawData: cmdFlushData
        })
      }
    })
  }
  // 小班socket的翻页在此更新数据，触发响应（原transport方法)
  socketUpdatePage(data, callback) {
    /**
     * id, page, subpage 拿到这些数据操作本地翻页
     * TODO...
     */
    // data = '{"hd":"t","x":"10254359","st":7261.856,"t":51,"p":10002,"c":"|10002|0|1,0,0,1,0,0|23356|1","n":140}
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    new Promise((resolve, reject) => {
      // 翻页操作
      if (data.t == STATIC.PAGE) {
        let o = tools.CdataToObject(data.c, data.t)
        if (o.path) {
          // 所有地址都先经过hostGroup的PPT域名组第一个替换
          let hostGroup = globalStore.store.sourceReLoad.hostGroup
          if (hostGroup.length > 0) {
            let targetHost = o.path.split('/')[2]
            for (let g in hostGroup) {
              if (hostGroup[g].includes(targetHost)) {
                o.path = o.path.replace(targetHost, hostGroup[g][0])
              }
            }
          }
          // 去掉地址最后一个斜杠
          o.path = o.path.replace(/\/+$/, '')
        }
        // Whiteboard
        // pageDrawDataLength字段是为了给小班sdk翻页的时候判断要不要请求command数据
        if (tools.isWhiteboard(data.p)) {
          // 当翻动ppt的时候先收到3操作码的画板，此时也调用loading遮盖画板，还会处理useSchedule的run
          if (tools.CdataToObject(data.c, data.t).code == 3) {
            wbEmitter.emit('wb:usePPT:status', { status: false })
            return false
          }
          transaction(() => {
            // 更新 -> wbProperty 公共数据
            this.actions.dispatch('wbProperty', {
              type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
              payload: tools.color(o.color)
            })
            // 更新 -> WHITEBOARD 列表数据
            this.actions.dispatch('whiteboard', {
              type: TYPES.UPDATE_WHITEBOARD_DATA,
              payload: {
                data: {
                  id: data.p,
                  backgroundColor: tools.color(o.color)
                }
              }
            })
            let _payload = {
              id: data.p.toString(),
              pageIndex: data.p,
              subIndex: 1,
              pageAmount: 1,
              handlerXid: data.x,
              ret: {
                backgroundColor: tools.color(o.color)
              }
            }
            // 10操作码表示有图片需要模仿PPT，拉满画板
            if (o.code == 10) {
              _payload.ret.backgroundColor = '#ffffff'
              _payload.ret.effect = 1
              _payload.ret.server_path = o.path
              _payload.ret.src = o.path
              _payload.ret.isSend = 0
            }
            this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
              type: TYPES.LIVE_SET_PAGE,
              payload: _payload
            })
          })
        }
        // PPT
        // socket 返回值没有 ppt-id 所以只能用 path 路径 作为唯一id判断
        else {
          transaction(() => {
            let resData = null
            if (o.path !== this.store.ppt.path || data.ap !== this.store.animatePPT.pptType) {
              // 每次回调对比 state.ppt.path 是否跟 cmd.path 一致?
              resData = {
                suffix: '.jpg',
                serverPath: o.path,
                path: o.path
                // pages: {
                //   "1": {} // 助教会在这里被篡改了页数，所以不传入pages
                // }
              }
              this.updatePPTData({
                ret: resData
              })
              this.addPPTPage(data.p) // 更新 => state.ppt.pages[1,2,3...]
              this.addPPTDraw(data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]

              // 只清除文字的缓存对象，图片有异步，如果清除图片的话会造成2张同ID图片都渲染
              graphicTempObject.clear('textList')
              // 翻页
              // 接收处理滚动课件
              // if (o.code === '0' || o.code === '5' || o.code === '6') {
              //   this.pptScroll(o)
              // }
              if (typeof data.ap != 'undefined') {
                this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
                  type: TYPES.UPDATE_PPT_TYPE,
                  payload: data.ap
                })
              }
            } else {
              graphicTempObject.clear()
              // 翻页数据保持
              this.addPPTPage(data.p) // 更新 => state.ppt.pages[1,2,3...]
              this.addPPTDraw(data.p) // 更新 => state.pageDrawData.PPT[1,2,3...]
            }
            if (o.code === '0' || o.code === '5' || o.code === '6') {
              let _martrc = o.martrc.split(',')
              // 这里存储的是接收到的scale
              globalStore.actions.dispatch('ppt', {
                type: TYPES.UPDATE_PPT_PAGE_SCALE,
                payload: {
                  page: data.p,
                  scale: _martrc[0]
                }
              })
              // 设置发送的top(图片未加载完时也把数据存储，在PPT.js imgOnload重新检测进行滚动)
              // 记录PPT滚动的位置UPDATE_PPT_PAGE_POST_TOP
              // 这里存储的是接收到的postTop
              globalStore.actions.dispatch('ppt', {
                type: TYPES.UPDATE_PPT_PAGE_POST_TOP,
                payload: {
                  page: data.p,
                  postTop: _martrc[5]
                }
              })
            }
            // 翻页数据保持
            this.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
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
        }
        tools.log('socketUpdatePage setPage done, next step...')
      }
      // sdk切换PPT的时候也会请求当前页涂鸦数据，但是服务器清理有延时，此时callback会请求上一个ppt的涂鸦数据，所以限制切换ppt就不执行callback
      resolve()
    }).then(() => {
      if (callback) {
        let curPage = globalStore.store.page.currentPage
        let mode = tools.getMode(curPage)
        let curPageData = globalStore.store.pageDrawData[mode][curPage]
        let cmdFlushData = []
        if (curPageData) {
          let cmdKeys = Object.keys(curPageData)
          cmdKeys.map((k) => {
            let o = {
              x: curPageData[k].x,
              t: parseInt(curPageData[k].t, 10),
              p: parseInt(curPageData[k].p, 10),
              c: curPageData[k].c
            }
            cmdFlushData.push(JSON.stringify(o))
          })
        }
        callback({
          drawData: cmdFlushData
        })
      }
    })
  }
  // 应用画板
  applyWhiteboard(payload, callback) {
    // 素材区新增画板
    // let id = null
    // if (payload.curID) {
    //   id = payload.curID + 1
    // } else {
    //   // 没有传入id时，取到当前白板数组的最后一块白板，没有取到白板时赋值默认10002白板
    //   id = Object.keys(globalStore.store.whiteboard).pop() || 10002
    // }
    let id = payload.curID || 10002
    let ret = globalStore.store.whiteboard[id]
      ? { backgroundColor: globalStore.store.whiteboard[id].backgroundColor }
      : payload.ret || {
          backgroundColor: '#EEEEEE'
        }
    // 利用LIVE_SET_PAGE更新page等数据模块
    globalStore.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
      type: 'LIVE_SET_PAGE',
      payload: {
        id: id,
        pageIndex: id,
        subIndex: 1,
        handlerXid: payload.handlerXid || globalStore.store.room.curUser ? globalStore.store.room.curUser.xid : `xid${new Date().getTime()}`, //操作id
        ret: ret
      }
    })
  }
  // 添加白板的数据容器 & 更新store.whiteboard Background
  executeWhiteboard(whiteboardId) {
    tools.log('FIRE ==>', STATIC.WHITEBOARD, whiteboardId)
    let MODE = tools.isWhiteboard(whiteboardId) ? STATIC.WHITEBOARD : STATIC.PPT
    let pageData = this.store.pageDrawData[MODE][whiteboardId]
    // 新增 -> pageDrawData
    if (!pageData) {
      this.actions.dispatch('pageDrawData', {
        type: TYPES.ADD_DRAW_WHITEBOARD,
        payload: {
          data: {
            id: whiteboardId
          }
        }
      })
    }
    let WhiteboardData = this.store.whiteboard[whiteboardId],
      BC = null
    // 存在该id的白板
    if (WhiteboardData) {
      // 存在该id的白板，颜色优先取回自身
      BC = WhiteboardData.backgroundColor ? WhiteboardData.backgroundColor : globalStore.store.room.ret ? globalStore.store.room.ret.backgroundColor : STATIC.WHITEBOARD_DEFAULT_BGCOLOR // STATIC.WHITEBOARD_DEFAULT_BGCOLOR == #EEEEEE
    } else {
      // 不存在该id的白板，颜色优先取画板属性
      BC = globalStore.store.wbProperty.backgroundColor
      this.actions.dispatch('whiteboard', {
        type: TYPES.UPDATE_WHITEBOARD_DATA,
        payload: {
          data: {
            id: whiteboardId,
            // 背景颜色可能来自客户端/初始化默认
            backgroundColor: BC
          }
        }
      })
    }
  }
  // 使用当前页
  // 建立当前页数据
  // PPT & whiteboard
  /**
   * 翻页参数说明
   * @param {分页/主页} PAGE
   * @param {子页} SUB_PAGE
   * @param {是否强制清空当前涂鸦} isClear
   * @param {应用该页后是否发送数据} isSend
   * =======================
   */
  executePage({ PAGE, SUB_PAGE, isClear, isSend = 1 }) {
    if (!PAGE) {
      return
    }
    let that = this
    useSchedule.useAddSchedule(function () {
      PAGE = PAGE.toString()
      SUB_PAGE = (SUB_PAGE || 1).toString()
      // 如果当前页面涂鸦数据,执行渲染
      let MODE = tools.isWhiteboard(PAGE) ? STATIC.WHITEBOARD : STATIC.PPT
      let pageDrawData = that.store.pageDrawData[MODE][PAGE]
      // let curPage = that.store.page.currentPage
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
        wbEmitter.emit('wb:usePPT:status', { status: true })
      }
    })
    if (!useSchedule.running) {
      useSchedule.running = true
      useSchedule.useRunSchedule()
    }
  }
  // 渲染
  render(cdatas) {
    let _c = Object.keys(cdatas)
    new Promise((resolve) => {
      _c.map((item) => {
        let _item = cdatas[item]
        graphic.getBrushType({
          brush: _item.t,
          data: _item
        })
      })
      resolve()
    }).then(() => {
      // 特殊逻辑：如果当前画笔是橡皮擦，需要在涂鸦渲染后再实例一次，目的是设置涂鸦对象的可选属性，否则刷新后擦除不了涂鸦
      if (this.store.wbProperty.brushType === STATIC.ERASE) {
        // 设置橡皮擦cursor
        tools.setCursor({ brushType: STATIC.ERASE })
        // 实例化橡皮擦
        graphic.getBrushType({
          brush: STATIC.ERASE
        })
      }
    })
  }
  pptScroll(o, delay = 500) {
    setTimeout(() => {
      let img = document.querySelector('#ppt-img-main')
      let ppt = new PPT()
      let martrc = o.martrc.split(',')
      let receivePostTop = martrc[5]
      let postTop = receivePostTop
      if (!this.store.ppt.serverPath) {
        // 这里存储的是临时postTop(图片还没加载完的时候用作中转复制给state.ppt.pages更新postTop)
        this.actions.dispatch('pptInfoResource', {
          type: TYPES.PPT_SCROLL_POST_TOP_INFO,
          payload: {
            scrollInfo: {
              postTop: postTop
            }
          }
        })
      } else if (tools.deleteProtocol(o.path) !== tools.deleteProtocol(this.store.ppt.serverPath)) {
        // 这里存储的是临时postTop(图片还没加载完的时候用作中转复制给state.ppt.pages更新postTop)
        this.actions.dispatch('pptInfoResource', {
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
      let scrollTop = (postTop * localScale) / receivePostScale // 800宽度窗口滚动100，本质为800与页面图片的父容器宽度比
      let interval = (100 * localScale) / receivePostScale
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
    }, delay)
  }
  // 翻页清空涂鸦
  clear(action) {
    // isSend == 1表示本地发起，所以在切换文档前先发送一次10002，isSend == 0表示接收端，不需要发送。没有isSend表示网页端，需要发送
    if (action.payload.isSend != 0) {
      new Promise((resolve) => {
        // 小班在外层判断xid,是是自己才会发送下一步then的10002。
        // if (this.store.room.curUser && this.store.room.curUser.xid) {
        //   this.actions.dispatch('room', {
        //     type: TYPES.UPDATE_ROOM_HANDLER_XID,
        //     payload: this.store.room.curUser.xid
        //   })
        // }
        if (action.payload.handlerXid) {
          this.actions.dispatch('room', {
            type: TYPES.UPDATE_ROOM_HANDLER_XID,
            payload: action.payload.handlerXid
          })
        }
        resolve()
      }).then(() => {
        let _tpl = tools.getCmdTpl()
        // c数据的第三位操作码为3表示清理所有PPT的涂鸦，重新load word或ppt时调用
        let cmdTpl = {
          st: _tpl.st,
          x: _tpl.x,
          p: this.store.room.pageBase,
          c: `|${this.store.room.pageBase}|3|1,0,0,1,0,0|${tools.color(this.store.wbProperty.backgroundColor || '#EEEEEE')}|1`,
          t: STATIC.PAGE,
          n: globalStore.getId(),
          hd: 'f'
        }
        tools.log('Do clear Post... ==>', cmdTpl)

        let webCommand = globalStore.getCommandApi()
        webCommand && webCommand.sendToQt(cmdTpl)
        // 发送操作（发给小班的）
        tools.log('page doFlush ==>', cmdTpl)
        wbEmitter.emit('set:page', cmdTpl)
      })
    }
  }
  // 封装指令
  flush(PAGE, SUB_PAGE, curPageData, isEmit) {
    let _tpl = tools.getCmdTpl()
    // let webCommand = globalStore.getCommandApi()
    let state = this.store
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
      path = state.ppt.serverPath + '/'
      _postScale = state.pptInfoResource.postScale
      _postTop = state.ppt.pages[PAGE] && state.ppt.pages[PAGE].postTop ? state.ppt.pages[PAGE].postTop : 0
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
    // webCommand && webCommand.sendToQt(ctpl)
    // emit
    if (isEmit) {
      // wbEmitter.emit('set:page', ctpl)
    }
    return ctpl
  }
  // 更新页码数据
  updatePageData(pageObject, dispatch) {
    if (typeof pageObject !== 'object') {
      tools.log('非法设置翻页数据 ==>', pageObject)
      return false
    }
    // change...
    this.actions.dispatch('page', {
      type: TYPES.UPDATE_PAGE_DATA,
      payload: {
        data: pageObject
      }
    })
    return Promise.resolve()
  }
  // 合并翻页总数
  computedPages() {
    this.store = this.store
    let PAGE_PPT = this.store.pageDrawData['PPT']
    let PAGE_WHITEBOARD = this.store.pageDrawData['WHITEBOARD']
    let page_ppt = Object.keys(PAGE_PPT) || []
    let page_wb = Object.keys(PAGE_WHITEBOARD) || []
    let pageIndexs = page_wb.concat(page_ppt)
    let _pageKeys = []
    // PPT分页索引
    if (this.store.page.pages) {
      let _pages = this.store.page.pages
      Object.keys(this.store.page.pages).map((k) => {
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
    tools.log('computed pages ==>', pageIndexs, '\n', _pageKeys)
    let _pageComputed = page_wb.concat(_pageKeys)
    this.updatePageData({
      pageIndexs: pageIndexs,
      pageComputed: _pageComputed
    })
    // }
    return pageIndexs
  }
  // 接收端使用
  addPPTPage(page, data = '') {
    // add ppt page.
    if (this.store.ppt['pages']) {
      let pageData = this.store['ppt']['pages'][page]
      // 新增 -> PPT涂鸦
      if (!pageData) {
        this.actions.dispatch('ppt', {
          type: TYPES.ADD_PPT_PAGE,
          payload: {
            page: page
          }
        })
      }
    }
  }
  // 新增涂鸦对象
  addPPTDraw(PAGE) {
    // 新增 -> PPT涂鸦
    // if (!pageData) {
    this.actions.dispatch('pageDrawData', {
      type: TYPES.ADD_DRAW_PPT,
      payload: {
        data: {
          id: PAGE
        }
      }
    })
    // }
  }
  // 更新ppt数据
  updatePPTData(setData) {
    // 新增 PPT 数据
    if (setData && setData.ret) {
      this.actions.dispatch('ppt', {
        type: TYPES.UPDATE_PPT_DATA,
        payload: {
          data: setData.ret
        }
      })
      // 清空当前涂鸦对象
      this.actions.dispatch('pageDrawData', {
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
      globalStore.actions.dispatch('page', {
        type: TYPES.UPDATE_WHITEBOARD_PAGE,
        payload: {
          operation: 'clearPPT'
        }
      })
      globalStore.actions.dispatch('page', {
        type: TYPES.UPDATE_WHITEBOARD_PAGE,
        payload: {
          operation: 'clearWhiteboard'
        }
      })
    }
    globalStore.actions.dispatch('pageDrawData', {
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
}
export const page = new Page()
