/**
 * 海报
 */
import { h, render, Component } from 'preact'
import { globalStore } from '../states/globalStore'
import * as TYPE from '../Action/action-types'
import emitter from '../extensions/emitter'
// base
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState'
import { Page } from '../core/page'
import { hostMachine } from '../extensions/hostMachine'
export class Poster extends Component {
  // init.
  constructor() {
    super()
    this.poster = null
    this.pptImgId = 'poster-ppt-img-main'
    this.domId = 'ht-poster-ppt-loader'
    this.Page = new Page()
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
    globalStore.listen(state => state.page.currentPage, (dispatch, cur, prev) => {
      // 页码数据更新
      if (tools.isWhiteboard(cur)) {
        emitter.emit('ppt:ratio', {ratio: 0.75})
        if (globalStore.getState().page.isSend != 0) {
          this.flush(globalStore.reducerStore.getState())
        }
        // 携带平铺ppt指令
        if (globalStore.getState().WHITEBOARD[cur] && globalStore.getState().WHITEBOARD[cur].effect == 1) {
          this.poster = globalStore.getState().WHITEBOARD[cur]
        } else {
          this.poster = null
        }
      } else {
        this.poster = null
      }
    })
  }
  flush(news) {
    let currentPage = news.page.currentPage
    let subPage = news.page.currentSubPage
    let currentMode = tools.isWhiteboard(currentPage) ? 'WHITEBOARD' : 'PPT'
    let pageDrawData = news.pageDrawData[currentMode][currentPage]
    let _tpl = tools.getCmdTpl()
    let Qt = globalStore.getQt()
    let pageDataLen = Object.keys(pageDrawData || {})
    let path = null
    let operationCode = 0
    if (tools.isWhiteboard(currentPage)) {
      if (news.WHITEBOARD[currentPage] && news.WHITEBOARD[currentPage].effect == 1) {
        operationCode = 10
        path = news.WHITEBOARD[currentPage].server_path
      } else {
        path = ''
      }
    } else {
      path = news.PPT.serverPath
    }
    // console.warn(tools.color(news.whiteboard.backgroundColor))
    let cdata = {
      url: path,
      page: currentPage,
      operationCode: operationCode, // 10表示有图片模仿PPT，然后在画板铺满
      matrix: '1,0,0,1,0,0',
      color: tools.color(news.WHITEBOARD[currentPage].backgroundColor),
      idx: subPage
    }
    let ctpl = {
      st: _tpl.st,
      x: _tpl.x,
      p: currentPage,
      c: tools.objectToCdata(cdata),
      t: STATIC.PAGE,
      n: globalStore.getId(),
      hd: pageDataLen.length > 0 ? 't' : 'f'
    }
    tools.log('Poster flush setpage(WHITEBOARD) post ==>', ctpl)
    this.Page.doFlush(ctpl)
    // emitter.emit('set:page', ctpl)
    // 发送Qt
    // console.warn('news.whiteboard.backgroundColor',ctpl,news.whiteboard.backgroundColor)
    Qt.sendToQt(ctpl)
  }
  componentDidMount() {
    this.listener()
  }
  // update
  componentDidUpdate() {
    // 切换画板和翻页的时候 ratio不能被监听变化，所以要在这里更新父级容器宽度
    this.renderDom()
    // 导致死循环 updateScrollTop方法会dispatch
    // this.imgResize()
  }
  renderDom() {
    let dom = document.querySelector('#' + this.domId)
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
  imgResize(dom, extend) {
    tools.log('img resize done')
    let img = dom || document.querySelector('#' + this.pptImgId)
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
      let _parentDom = document.querySelector(`#${this.domId}`)
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
        } else {
          // 注意危险！！！top != 0 时-top附加偏移数值。常规情况进入这里的逻辑top == 0。特别注意兼容旧版直播器用960尺寸时会有一个怪异偏移值。在这里需要附加到图片上，但是涂鸦不用附加，我也是醉了。
          if (top != 0) {
            img.style['margin-top'] = (getInspectData._parent.height - img.height) / 2 - top + 'px'
          } else {
            // 此判断内图片高度不足父容器高度，所以设居中显示，canvas的top设0
            img.style['margin-top'] = (getInspectData._parent.height - img.height) / 2 + 'px'
          }
          // // canvas的top设0
          // document.querySelectorAll('canvas').forEach(function (item, index) {
          //   item.style.top = '0px'
          // })
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
  getInspectData(img) {
    let _parentDom = document.querySelector(`#${this.domId}`)
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
  // img laod
  imgOnload(img) {
    // 请求成功后清空资源重试的计时器
    hostMachine.clear()
    let dom = img.currentTarget
    if (dom) {
      let _img = dom || document.querySelector('#' + this.pptImgId)
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
      }
    }
  }
  imgOnerror(img) {
    // 资源错误重试
    let that = this,
      store = globalStore.reducerStore
    hostMachine.process({
      time: 0,
      type: 'error',
      oriUrl: img.target.src,
      callback: function (res) {
        // LIVE_SET_PAGE
        store.dispatch({
          type: TYPE.LIVE_SET_PAGE,
          payload: {
            id: that.poster.id,
            pageIndex: Number(that.poster.id),
            ret: {
              id: that.poster.id,
              effect: 1,
              backgroundColor: that.poster.backgroundColor,
              src: res,
              server_path: res
            }
          }
        })
      }
    })
    // emitter.emit('whiteboard:image:error', { url: img.target.src })
  }
  // object or array
  render() {
    // 非平铺ppt模式
    if (!this.poster) {
      return ''
    }
    // render
    return (
      <div id="talkfun-poster-ppt-loader-wrap">
        <div id={this.domId} class="poster-ppt-img-loader">
          <img id={this.pptImgId} src={this.poster.server_path} onLoad={this.imgOnload.bind(this)} onerror={this.imgOnerror.bind(this)} />
        </div>
      </div>
    )
  }
}