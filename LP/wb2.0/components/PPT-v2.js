/**
 * 课件模式（PPT图片模块
 */
import { h, render, Component } from 'preact'
import { globalStore } from '../states/globalStore'
import * as TYPE from '../Action/action-types'
import emitter from '../extensions/emitter'
// base
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState'
import { addListener } from 'resize-detector'
import { Page } from '../core/page'
import { hostMachine } from '../extensions/hostMachine'
export class PPT extends Component {
  // init.
  constructor() {
    super()
    this._props = null
    this.state.imgloadState = false
    this.state.isShowImg = false
    this.state.isPPTMode = false
    this.state.defaultWidth = '100'
    this.state.defaultHeight = '100'
    this.curPage = 0
    this.curSubPage = 0
    this.state.domId = 'ht-ppt-loader'
    this.state.pptImgId = 'ppt-img-main'
    this.Page = new Page()
    this.scroll_lock = true
    this.localScale = null
    // this.resizeInit = false
    this.postTop = 0
    // 虚拟dom的id数组
    this.prestrainDomId = []
    // 控制资源重试的字段
    stopRetry: false
    this.on()
  }
  // 监听emit
  on() {
    emitter.on("ppt:resize", () => {
      tools.log('ppt重新计算尺寸==>imgResize')
      // ppt的父级容器
      this.renderDom()
      // 图片resize
      this.imgResize()
    })
  }
  // 监听store
  listener() {
    // listener
    globalStore.listen(state => state.cousewareResource.img, (dispatch, cur, prev) => {
      let store = globalStore.reducerStore
      if (store.getState().room.pptType == 0 || store.getState().room.pptType == 1) {
        emitter.emit('load:whiteboard:status', { status: false })
      }
      // 预加载
      // this.prestrainImg()
      // 资源超时5S重试
      if (cur) {
        hostMachine.process({
          time: 5000,
          type: 'timeout',
          oriUrl: cur,
          callback: function (res) {
            // UPDATE_DOC_IMG
            dispatch({
              type: TYPE.UPDATE_DOC_IMG,
              payload: res
            })
          }
        })
      }
    })
    globalStore.listen(state => state.pptInfoResource.ratio, (dispatch, cur, prev) => {
      emitter.emit('ppt:resize')
      // 对外暴露PPT比例
      emitter.emit('ppt:ratio', { ratio: cur })
    })
    globalStore.listen(state => state.room, (dispatch, cur, prev) => {
      if (cur.powerEnable) {
        // 学员身份不允许滚动(没有身份时并且有涂鸦权限可以滚动，兼容新版直播器)
        if (!(globalStore.reducerStore.getState().room.curUser && globalStore.reducerStore.getState().room.curUser.role === 'user')) {
          dispatch({
            type: TYPE.IS_SCROLL_PPT,
            payload: 'true'
          })
        }
      } else {
        dispatch({
          type: TYPE.IS_SCROLL_PPT,
          payload: 'false'
        })
      }
    })
  }
  retrySchedule(img) {
    this.retryMachine()
  }
  // img error
  imgOnerror(img) {
    // 资源错误重试
    let store = globalStore.reducerStore
    hostMachine.process({
      time: 0,
      type: 'error',
      oriUrl: img.target.src,
      callback: function (res) {
        // UPDATE_DOC_IMG
        setTimeout(() => {
          store.dispatch({
            type: TYPE.UPDATE_DOC_IMG,
            payload: res
          })
        }, 500);
      }
    })
  }
  // img laod
  imgOnload(img) {
    // 请求成功后清空资源重试的计时器
    hostMachine.clear()
    let dom = img.currentTarget
    if (dom) {
      let _img = dom || document.querySelector('#' + this.state.pptImgId)
      if (img) {
        // 翻页后要发送的滚动top置0
        this.postTop = 0
        let store = globalStore.reducerStore
        // let _parent = _parentDom.getBoundingClientRect()
        let getInspectData = this.getInspectData(_img)
        let pptInfoResource = {}
        pptInfoResource.width = getInspectData.IMG_DOM.width
        pptInfoResource.height = getInspectData.IMG_DOM.height
        pptInfoResource.ratio = getInspectData.ratio
        pptInfoResource.scale = this.localScale
        pptInfoResource.postScale = this.postScale
        pptInfoResource.loaded = 'true'
        store.dispatch({
          type: TYPE.PPT_INFO_SOURCE,
          payload: {
            pptInfoResource: pptInfoResource
          }
        })
        this.naturalScale = _img.naturalHeight / _img.naturalWidth
        this.imgResize(_img, 'resizeInit')
        // 可能存在翻页回来有滚动过的情况
        let _target = img.target.src.split('?')[1]
        let isSendFromImg = 1
        if (_target) {
          isSendFromImg = _target.split('=')[1]
        }

        let currentPage = globalStore.reducerStore.getState().page.currentPage
        let pages = globalStore.reducerStore.getState().PPT.pages
        let postTop = pages[currentPage] && pages[currentPage].postTop ? pages[currentPage].postTop : '0'
        /* 
         * isSendFromImg:图片解析出来的isSend && 画板dispatch的isSend(换PPT的时候，判断该值) 
         * 当前页面可能存在 (isSendFromImg) && (state.page.isSend)对应以下的情况：
         * 1、小班应用PPT (1) && (undefined)
         * 2、直播器主播端主动应用 (1) && (1)
         * 2、直播器主播端被动应用 (0) && (0)
         * 3、直播器嘉宾端主动应用 (1) && (1)
         * 3、直播器嘉宾端被动应用 (0) && (0)
         * 特殊情况：直播器主播主动应用(isSendFromImg=1)=>被动应用=>切换画板(0)=>PPT重新渲染(isSendFromImg==1)。这个流程中isSendFromImg首先记录是1，PPT重新渲染会触发flush，所以依靠切换画板(0)的状态更新state.page.isSend=0限制发送
         */
        if (isSendFromImg != 0 && globalStore.reducerStore.getState().page.isSend != 0) {
          // 翻页的操作码发0
          this.flush(postTop, 0)
        }
        this.imgComplete()
      }
    }
  }
  // 静态图片加载完成暴露对外
  imgComplete() {
    if (globalStore.reducerStore.getState().room.pptType == 0 || globalStore.reducerStore.getState().room.pptType == 1) {
      emitter.emit('load:whiteboard:status', { status: true })
    }
  }
  // 当前页起上下两页预加载
  prestrainImg() {
    let store = globalStore.reducerStore
    let page = store.getState().page
    let curPage = page.currentPage + '_' + page.currentSubPage
    let curIndex = page.pageComputed.findIndex(item => item === curPage)
    if (page.pageComputed[curIndex - 2]) {
      let targetPage = page.pageComputed[curIndex - 2].split('_')[0]
      let targetSubpage = page.pageComputed[curIndex - 2].split('_')[1]
      this.prestrainDom(page.pptId, targetPage, targetSubpage)
    }
    if (page.pageComputed[curIndex - 1]) {
      let targetPage = page.pageComputed[curIndex - 1].split('_')[0]
      let targetSubpage = page.pageComputed[curIndex - 1].split('_')[1]
      this.prestrainDom(page.pptId, targetPage, targetSubpage)
    }
    if (page.pageComputed[curIndex + 1]) {
      let targetPage = page.pageComputed[curIndex + 1].split('_')[0]
      let targetSubpage = page.pageComputed[curIndex + 1].split('_')[1]
      this.prestrainDom(page.pptId, targetPage, targetSubpage)
    }
    if (page.pageComputed[curIndex + 2]) {
      let targetPage = page.pageComputed[curIndex + 2].split('_')[0]
      let targetSubpage = page.pageComputed[curIndex + 2].split('_')[1]
      this.prestrainDom(page.pptId, targetPage, targetSubpage)
    }
  }
  prestrainDom(id, page, subPage) {
    if (!this.prestrainDomId.includes(id + '_' + page + '_' + subPage)) {
      this.prestrainDomId.push(id + '_' + page + '_' + subPage)
      let img = document.createElement('img')
      img.src = tools.getPPTImg(page, subPage)
    }
  }
  computingScroll(direction, img) {
    // 记录PPT滚动的位置UPDATE_PPT_PAGE_POST_TOP
    let store = globalStore.reducerStore
    let curPage = store.getState().page.currentPage
    if (store.getState().PPT.pages[curPage].postTop) {
      this.postTop = parseInt(store.getState().PPT.pages[curPage].postTop)
    }
    let operationCode = null
    let scrollTop = img.offsetTop
    let baseInertval = 100
    let interval = parseInt(baseInertval * this.localScale / this.postScale) // 800宽度窗口滚动100，本质为800与页面图片的父容器宽度比
    // 课件naturalWidth在STATIC.RATIO比例中减去页面窗口高度后可以滚动的高度
    let naturalScrollHeight = img.naturalHeight * this.postScale - 600
    if (direction === 'up') {
      if (img.offsetTop < 0) {
        // 最后一次滚动的高度不够时以实际为准
        // 最后一次naturalScrollHeight不够时以实际为准
        if (interval > Math.abs(img.offsetTop)) {
          interval = Math.abs(img.offsetTop)
          baseInertval = naturalScrollHeight - Math.floor(naturalScrollHeight / 100) * 100
        } else {
          baseInertval = 100
        }
        // 本地滚动的top
        scrollTop += interval
        // 发送的top
        this.postTop += baseInertval
        operationCode = 6
        this.scroll_lock = false
      } else {
        this.scroll_lock = true
      }
    }
    if (direction === 'down') {
      if (img.clientHeight - document.querySelector('#ht-ppt-loader').clientHeight > Math.abs(img.offsetTop)) {
        // 剩余可以滚动的高度
        let offsetVal = img.clientHeight - document.querySelector('#ht-ppt-loader').clientHeight - Math.abs(img.offsetTop)
        // 最后一次滚动的高度不够时以实际为准
        if (interval > offsetVal) {
          interval = offsetVal
        }
        // 本地滚动的top
        scrollTop -= interval
        // 发送的top
        this.postTop -= baseInertval
        // 最后一次naturalScrollHeight不够时以实际为准
        if (this.postTop < -naturalScrollHeight) {
          this.postTop = -naturalScrollHeight
        }
        operationCode = 5
        this.scroll_lock = false
      } else {
        this.scroll_lock = true
      }
    }
    // 滚动不锁定时执行滚动
    if (!this.scroll_lock) {
      // 更新发送的top
      this.updatePostTop(this.postTop)
      // 更新滚动的top
      this.updateScrollTop(img, scrollTop)
      // todo set handlerxid(新版直播器没有curUser,此处需要判断兼容)
      let store = globalStore.reducerStore
      let _xid = store.getState().room.curUser ? store.getState().room.curUser.xid : null
      if (_xid) {
        store.dispatch({
          type: TYPE.UPDATE_ROOM_HANDLER_XID,
          payload: _xid
        })
      }
      this.flush(this.postTop, operationCode)
    }
  }
  // updatePostTop
  updatePostTop(postTop) {
    // 记录PPT滚动的位置UPDATE_PPT_PAGE_POST_TOP
    let store = globalStore.reducerStore
    let curPage = store.getState().page.currentPage
    // 这里存储的是会发送的postTop
    store.dispatch({
      type: TYPE.UPDATE_PPT_PAGE_POST_TOP,
      payload: {
        page: curPage,
        postTop: postTop
      }
    })
    // 这里存储的是临时postTop(图片还没加载完的时候用作中转复制给state.PPT.pages更新postTop)
    // store.dispatch({
    //   type: TYPE.PPT_SCROLL_POST_TOP_INFO,
    //   payload: {
    //     scrollInfo: {
    //       postTop: postTop
    //     }
    //   }
    // })
  }
  // updateScrollTop,滚动和翻页都必须走这里。翻页重新设置是因为可能拉伸了页面再进行翻页
  updateScrollTop(img, top) {
    // 滚动到锚点(把top分开处理是因为兼容图片高度不足的时候的情况，此时canvas还是4:3)
    let imgTop = top
    let canvasTop = top
    if (Math.round(document.querySelector('#ht-ppt-loader').clientHeight) > img.height) {
      // 注意危险！！！top != 0 时-top附加偏移数值。常规情况进入这里的逻辑top == 0。特别注意兼容旧版直播器用960尺寸时会有一个怪异偏移值。在这里需要附加到图片上，但是涂鸦不用附加，我也是醉了
      if (top && top != 0) {
        imgTop = (document.querySelector('#ht-ppt-loader').clientHeight - img.height) / 2 - top
      } else {
        imgTop = (document.querySelector('#ht-ppt-loader').clientHeight - img.height) / 2
      }
      canvasTop = 0
    }
    this.scrollToAnchor(img, imgTop, canvasTop)
    // 记录PPT滚动的位置UPDATE_PPT_PAGE_OFFSET
    let store = globalStore.reducerStore
    let curPage = store.getState().page.currentPage
    store.dispatch({
      type: TYPE.UPDATE_PPT_PAGE_OFFSET,
      payload: {
        page: curPage,
        offset: top
      }
    })
  }
  scrollToAnchor(img, imgTop, canvasTop) {
    // 记录当前的滚动位置
    // this.postTop = top
    // scroll
    img.style['margin-top'] = imgTop + 'px'
    document.querySelectorAll('canvas').forEach(function (item, index) {
      item.style.top = canvasTop + 'px'
    })
    // 计算指示器状态
    if (this.scroll_up) {
      if (parseInt(imgTop) === 0) {
        this.scroll_up.classList.remove('scroll_direction')
      } else {
        this.scroll_up.classList.add('scroll_direction')
      }
    }
    if (this.scroll_down) {
      if (img.clientHeight === document.querySelector('#ht-ppt-loader').clientHeight + Math.abs(img.offsetTop)) {
        this.scroll_down.classList.remove('scroll_direction')
      } else {
        this.scroll_down.classList.add('scroll_direction')
      }
    }
  }
  // 动态PPT和静态PPT因为计算的页数不一样，所以发送的时候要特殊判断
  getPage() {
    let _state = globalStore.reducerStore.getState()
    // if (_state.room.pptType == 1) {
    //   // 动态ppt
    //   return {
    //     page: Number(_state.page.pageIndex) + 1,
    //     subPage: 1
    //   }
    // } else {
    // 静态PPT
    return {
      page: _state.page.currentPage,
      subPage: _state.page.currentSubPage
    }
    // }
  }
  // 封装指令
  flush(distance, _operationCode) {
    let _tpl = tools.getCmdTpl()
    let Qt = globalStore.getQt()
    let state = globalStore.reducerStore.getState()
    let isTypeOfAnimatePPT = state.room.pptType
    let currentPage = state.page.currentPage
    let currentMode = tools.isWhiteboard(currentPage) ? 'WHITEBOARD' : 'PPT'
    let pageDrawData = state.pageDrawData[currentMode][currentPage]
    let pageDataLen = Object.keys(pageDrawData || {})
    let _n = state.room.setPageData.id
    let path = state.PPT.serverPath
    let _path = path.charAt(path.length - 1) === '/' ? path : path + '/'
    // let scal = 1
    this.postTop = distance ? distance : 0
    // let postTop = this.postTop
    // if (distance) {
    //   scal = this.localScale
    // } else {
    //   scal = this.postScale
    // }
    if (!_operationCode) {
      _n = globalStore.getId()
    }
    let _scale = this.postScale ? parseFloat(this.postScale).toFixed(3) : 0

    let cdata = {
      url: tools.detectProtocol(_path),
      page: this.getPage().page,
      operationCode: _operationCode ? _operationCode : 0,
      matrix: _scale + ',0,0,' + _scale + ',0,' + this.postTop,
      color: '16777215',
      idx: this.getPage().subPage
    }
    let ctpl = {
      st: _tpl.st,
      x: _tpl.x,
      p: this.getPage().page,
      c: tools.objectToCdata(cdata),
      t: STATIC.PAGE,
      n: _n,
      ap: isTypeOfAnimatePPT,
      hd: pageDataLen.length > 0 ? 't' : 'f'
    }
    // console.log('flush (PPT) setpage post ==>', ctpl)
    this.Page.doFlush(ctpl)
    // emitter.emit('set:page', ctpl)
    // 发送Qt
    Qt.sendToQt(ctpl)
  }
  // PPT滚动相关事件
  pptWheel(img) {
    let that = this
    // 滚动滑轮触发滚动PPT
    document.querySelector('#talkfun-client-whiteboard').onmousewheel = function (e) {
      if (globalStore.getState().room.powerEnable) {
        //判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta) {
          //当滑轮向上滚动时
          if (e.wheelDelta > 0) {
            that.computingScroll('up', img)
          }
          //当滑轮向下滚动时
          if (e.wheelDelta < 0) {
            that.computingScroll('down', img)
          }
        } else if (e.detail) {
          //Firefox滑轮事件
          //当滑轮向上滚动时
          if (e.detail > 0) {
            that.computingScroll('up', img)
          }
          //当滑轮向下滚动时
          if (e.detail < 0) {
            that.computingScroll('down', img)
          }
        }
      }
    };

    // 点击按钮触发滚动PPT
    document.querySelector('#talkfun-ppt-loader-wrap').onclick = function (e) {
      if (globalStore.getState().room.powerEnable) {
        if (e.target.classList.contains('scroll_up')) {
          that.computingScroll('up', img)
        }
        if (e.target.classList.contains('scroll_down')) {
          that.computingScroll('down', img)
        }
      }
    }
  }
  // init
  fire() {
    let curPage = this.props.data.page.currentPage
    if (!tools.isWhiteboard(curPage)) {
      this.state.isPPTMode = true
    } else {
      this.state.isPPTMode = false
    }
  }
  renderDom() {
    let dom = document.querySelector('#' + this.state.domId)
    let parentDom = document.querySelector(globalStore.getState().whiteboard.container)
    if (dom) {
      // let sourceWidth = window.document.body.clientWidth
      // let _width = window.document.body.clientWidth
      // let _height = window.document.body.clientWidth * STATIC.RATIO
      let sourceWidth = parentDom.clientWidth
      let _width = parentDom.clientWidth
      let _height = null
      let scrollHeight = parentDom.clientHeight //window.document.documentElement.clientHeight
      // 画板
      if (globalStore.getState().pptInfoResource.ratio > STATIC.PPT_RATIO) {
        _height = parentDom.clientWidth * STATIC.RATIO
        if (_height > scrollHeight) {
          _width = scrollHeight / STATIC.RATIO
          _height = scrollHeight
        }
      } else {
        let _container = document.querySelector('#canvas-container-inner')
        let containerData = {
          width: _container.clientWidth,
          height: _container.clientHeight
        }//_container.getBoundingClientRect()
        let _containerRatio = containerData.height / containerData.width
        if (_containerRatio > STATIC.PPT_RATIO) {
          _width = sourceWidth
          _height = sourceWidth * STATIC.RATIO
        } else {
          // 算出高度占满情况下的原4:3时候的父级盒子宽度
          let cache_width = scrollHeight / STATIC.RATIO
          // 用高度占满情况下的原4:3时候的父级盒子宽度算出16:9时候的PPT高度
          let cache_height = cache_width * STATIC.PPT_RATIO
          // 算出占满的高度与16:9时候PPT高度之比
          let cache_ratio = scrollHeight / cache_height
          _width = cache_width * cache_ratio
          _height = _width * STATIC.RATIO
        }
      }
      let _leftOffset = (sourceWidth - _width) / 2
      dom.style['width'] = _width + 'px'
      dom.style['height'] = _height + 'px'
      dom.style['margin-left'] = _leftOffset + 'px'
      dom.style['margin-top'] = (scrollHeight - _height) / 2 + 'px'
      dom.style['position'] = 'absolute'
      dom.style['top'] = '0'
      dom.style['overflow'] = 'hidden'
    }
  }
  eventTrigger() {
    let store = globalStore.getState()
    if (document.querySelector(store.room.whiteboardContainerId)) {
      addListener(document.querySelector(store.room.whiteboardContainerId), (res) => {
        // this.setDimensions(res)
        tools.log('dom resize', store.room.whiteboardContainerId)
        emitter.emit('ppt:resize')
      })
      window.addEventListener('resize', function () {
        emitter.emit('ppt:resize')
      }, false)
    }
  }
  // 取dom
  getInspectData(img) {
    let _parentDom = document.querySelector('#ht-ppt-loader')
    if (!_parentDom) {
      return false
    }
    let _parent = {
      width: _parentDom.clientWidth,
      height: _parentDom.clientHeight
    }
    // _parentDom.getBoundingClientRect()
    let IMG_DOM = {
      width: img.naturalWidth,
      height: img.naturalHeight
    }
    let ratio = IMG_DOM.height / IMG_DOM.width
    // this.postScale = STATIC.WHITEBOARD_BASE_WIDTH / IMG_DOM.width
    this.postScale = STATIC.WHITEBOARD_BASE_WIDTH / IMG_DOM.width
    return {
      _parent: _parent,
      IMG_DOM: IMG_DOM,
      ratio: ratio,
    }
  }
  imgResize(dom, extend) {
    tools.log('img resize done')
    let img = dom || document.querySelector('#' + this.state.pptImgId)
    let store = globalStore.reducerStore
    if (img) {
      let getInspectData = this.getInspectData(img)
      img.style['width'] = getInspectData._parent.width + 'px'
      img.style['height'] = getInspectData._parent.width * getInspectData.ratio + 'px'
      img.height = getInspectData._parent.width * getInspectData.ratio

      // 图片onload & resize后检查子页是否有offset,并计算定位img和canvas位置
      let currentPage = globalStore.reducerStore.getState().page.currentPage
      let pages = globalStore.reducerStore.getState().PPT.pages
      let top = pages[currentPage] && pages[currentPage].offset ? pages[currentPage].offset : '0'
      let _parentDom = document.querySelector('#ht-ppt-loader')
      let _parent = {
        width: _parentDom.clientWidth,
        height: _parentDom.clientHeight
      }
      // _parentDom.getBoundingClientRect()
      // 大于ppt宽高比例，此时应该是课件或者比例>= 4:3的PPT
      if (getInspectData.ratio >= STATIC.PPT_RATIO) {
        if (Math.round(getInspectData._parent.height) < img.height) {
          // 图片渲染完成（可以获取到图片信息）
          if (getInspectData.IMG_DOM.width) {
            if (this.localScale === null) {
              this.localScale = _parent.width / getInspectData.IMG_DOM.width
            } else {
              let MODE = tools.isWhiteboard(currentPage) ? STATIC.WHITEBOARD : STATIC.PPT
              let curPagePPT = store.getState().PPT.pages[currentPage]
              // 最新的curPagePPT在助教端会存在、在学生端不会存在
              if (curPagePPT) {
                if (curPagePPT['postTop']) {
                  // 讲师上课前PPT滚动的话，观看端要之前把接收的postTop转化为当前页面所在比例中的滚动并执行
                  // this.postScale = 800 / naturalWidth
                  // this.localScale = parentWidth / naturalWidth
                  // 以postTop = 100为例，curPagePPT['postTop'] / this.postScale ：即先算出在800容器中每滚动100所对应的真实图片滚动的高度
                  // curPagePPT['postTop'] / this.postScale * this.localScale ：除法算出真实图片滚动的高度后换算成在父级容器的页面中的滚动高度
                  top = parseInt(curPagePPT['postTop'] / this.postScale * this.localScale)
                } else {
                  if (curPagePPT['scale']) {
                    // 本地翻页把之前保存的scale和可能进行过缩放的窗口计算重新赋值top
                    top = parseInt(top / (curPagePPT['scale'] / (_parent.width / getInspectData.IMG_DOM.width)))
                  } else {
                    // postTop和scale都不存在（原始值）
                    top = '0'
                  }
                }
              } else {
                // 设置localScale前先更新top,先取curPagePPT['scale']是因为适配翻页，没有翻页时用localScale
                top = parseInt(top / (this.localScale / (_parent.width / getInspectData.IMG_DOM.width)))
              }
              // 设置localScale
              this.localScale = _parent.width / getInspectData.IMG_DOM.width
              if (curPagePPT) {
                if (!curPagePPT['scale'] || curPagePPT.scale != this.localScale) {
                  store.dispatch({
                    type: TYPE.UPDATE_PPT_PAGE_SCALE,
                    payload: {
                      mode: MODE,
                      page: currentPage,
                      scale: this.localScale
                    }
                  })
                }
              }
            }
          }
          // 学员身份不允许滚动(没有身份时并且有涂鸦权限可以滚动，兼容新版直播器)
          if (!(store.getState().room.curUser && store.getState().room.curUser.role === 'user')) {
            this.pptWheel(img);
            store.dispatch({
              type: TYPE.IS_SCROLL_PPT,
              payload: store.getState().room.powerEnable ? 'true' : 'false'
            })
            this.scroll_up = document.querySelector(".scroll_up")
            this.scroll_down = document.querySelector(".scroll_down")
          }
          // 更新滚动位置
          this.updateScrollTop(img, top)
        } else {
          // 注意危险！！！top != 0 时-top附加偏移数值。常规情况进入这里的逻辑top == 0。特别注意兼容旧版直播器用960尺寸时会有一个怪异偏移值。在这里需要附加到图片上，但是涂鸦不用附加，我也是醉了。
          if (top != 0) {
            img.style['margin-top'] = (getInspectData._parent.height - img.height) / 2 - top + 'px'
          } else {
            // 此判断内图片高度不足父容器高度，所以设居中显示，canvas的top设0
            img.style['margin-top'] = (getInspectData._parent.height - img.height) / 2 + 'px'
          }
          // canvas的top设0
          document.querySelectorAll('canvas').forEach(function (item, index) {
            item.style.top = '0px'
          })
          if (store.getState().isScrollPPT === 'true') {
            store.dispatch({
              type: TYPE.IS_SCROLL_PPT,
              payload: 'false'
            })
          }
        }
      } else {
        // 重写PPT（16:9）时图片属性和定位
        // 需要铺满图片的容器
        let container = document.querySelector('#canvas-container-inner')
        let containerData = {
          width: container.clientWidth,
          height: container.clientHeight
        }
        // container.getBoundingClientRect()
        // if (containerData.height / containerData.width > STATIC.PPT_RATIO) {
        if (containerData.height / containerData.width > getInspectData.ratio) {

          // 宽度占满容器
          img.style['width'] = containerData.width + 'px'
          img.style['height'] = containerData.width * getInspectData.ratio + 'px'
          img.height = containerData.width * getInspectData.ratio
        } else {
          // 高度占满容器
          // 宽度占满容器
          img.style['height'] = containerData.height + 'px'
          img.style['width'] = containerData.height / getInspectData.ratio + 'px'
          img.width = containerData.height / getInspectData.ratio
        }
        if (store.getState().isScrollPPT === 'true') {
          store.dispatch({
            type: TYPE.IS_SCROLL_PPT,
            payload: 'false'
          })
        }
        // 此判断内图片高度不足父容器高度，所以设居中显示，canvas的top设0
        img.style['margin-top'] = (getInspectData._parent.height - img.height) / 2 + 'px'
        // document.querySelectorAll('canvas').forEach(function(item, index){
        //   item.style.top = '0px'
        // })
      }
    }
  }
  componentWillReceiveProps() {
  }
  // mount
  componentDidMount() {
    this.listener()
    this.eventTrigger()
    this.fire()
  }
  // update
  componentDidUpdate() {
    // 切换画板和翻页的时候 ratio不能被监听变化，所以要在这里更新父级容器宽度
    this.renderDom()
    // 导致死循环 updateScrollTop方法会dispatch
    // this.imgResize()
  }
  shouldComponentUpdate() {
    // console.warn(this.props.data.page)
  }
  // pre update
  componentWillUpdate() {
    // console.warn(this.props.data)
  }
  isLoadImg() {
    let state = globalStore.reducerStore.getState()
    let img = state.cousewareResource.img
    if (img) {
      return true
    } else {
      return false
    }
  }
  // object or array
  render() {
    this.fire()
    // 非ppt模式
    if (!this.state.isPPTMode) {
      return ''
    }
    // render
    return (
      <div id="talkfun-ppt-loader-wrap">
        <div id={this.state.domId} class="ppt-img-loader">
          {this.state.imgloadState ? (<p>Loading PPT Resource...</p>) : ''}
          {this.isLoadImg() ? (
            <img id={this.state.pptImgId} src={this.props.data.cousewareResource.img} onerror={this.imgOnerror.bind(this)} onLoad={this.imgOnload.bind(this)} />
          ) : null}
        </div>
        {this.props.data.isScrollPPT == 'true' && this.props.data.room.nativeGraphic != 1 ? (
          <div class="scroll_button">
            <div class="scroll_up"></div>
            <div class="scroll_down scroll_direction"></div>
          </div>
        ) : null}
      </div>
    )
  }
}