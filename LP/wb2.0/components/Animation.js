/**
 * 课件模式（PPT图片模块
 */
import { h, render, Component } from 'preact'
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import emitter from '../extensions/emitter'
// base
import * as tools from '../extensions/util'
// import { STATIC } from '../states/staticState'
export class Animation extends Component {
  // init.
  constructor() {
    super()
    this.on()
    this.listener()
    this.iframeListener()
    this.state.isAnimationMode = false
    this.state = {
      pptUrl: null
    }
  }
  // 监听emit
  on() {

  }
  // 发送到ppt-ifr
  send(data) {
    let connector = document.querySelector('#talkfun-pptconnector-ifr')
    if (data) {
      let _data = JSON.stringify(data)
      if (connector) {
        connector.contentWindow.postMessage(_data, '*')
      }
    }
  }
  // 监听store
  listener() {
    // 动态PPT
    globalStore.listen(state => state.animatePPT.pptType, (dispatch, cur, prev) => {
      this.state.isAnimationMode = !!Number(cur)
      // if (!this.state.isAnimationMode) {
      //   // 初始化重置状态
      //   globalStore.reducerStore.dispatch({
      //     type: TYPES.UPDATE_PPT_STATE,
      //     payload: 'wait'
      //   })
      // }
      let PAGE = globalStore.getState().page.currentPage,
        SUB_PAGE = globalStore.getState().page.currentSubPage;
      tools.renderPPT({ PAGE: PAGE, SUB_PAGE: SUB_PAGE, isSend: 1, ap: cur })
    })
    // // 大页切换
    // globalStore.listen(state => state.animatePPT.curPage, (dispatch, cur, prev) => {
    //   if (cur > 0) {
    //     if (this.props.pageObj) {
    //       this.props.pageObj.use(cur, 1)
    //     }
    //   }
    // })
    // 当前页切换
    globalStore.listen(state => state.animatePPT.pageIndex, (dispatch, cur, prev) => {
      tools.log('change ap page ==>', cur)
      if (cur > -1) {
        let pageComputed = globalStore.getState().animatePPT['pageComputed']
        let curPageObj = tools.pageSplit(pageComputed[cur])
        // 翻页
        if (curPageObj) {
          this.gotoPage(curPageObj.currentPage, curPageObj.currentSubPage)
        }
      }
    })
    // 更换PPT
    globalStore.listen(state => state.animatePPT.h5PPTUrl, (dispatch, cur, prev) => {
      if (cur) {
        // 切换动态PPT前初始化重置状态
        globalStore.reducerStore.dispatch({
          type: TYPES.UPDATE_PPT_STATE,
          payload: 'wait'
        })
        this.state.pptUrl = cur
      }
    })
    // 加载完成(初始化)
    globalStore.listen(state => state.animatePPT.state, (dispatch, cur, prev) => {
      // console.error(cur)
      if (cur === 'init') {
        let page = this.props.data.page
        // console.warn(page)
        this.gotoPage(page.currentPage, page.currentSubPage)
      }
      if (cur === 'loaded') {
        // console.warn('ppt data==>', cur.curPage, cur.curStep)
        let ppt = this.props.data.animatePPT
        // console.warn(this.props)
        // if (ppt.pageComputed.length > 0) {
        //   let p = tools.pageSplit(ppt.pageComputed[ppt.pageIndex])
        //   this.gotoPage(3, 1)
        // }
      }
      // if (cur === 'init') {
      //   let ppt = this.props.data.animatePPT
      //   if (ppt.pageComputed.length > 0) {
      //     let _page = ppt.curPage + '_' + ppt.curStep
      //     let p = tools.pageSplit(_page)
      //     this.gotoPage(p.currentPage, p.currentSubPage)
      //   }
      // }
    })
  }
  // 跳转到某页
  gotoPage(page, step) {
    this.send({
      action: 'goto',
      page: (page - 1) < 0 ? 0 : page - 1,
      step: (step - 1) < 0 ? 0 : step - 1
    })
  }
  componentWillMount() {
    // 初始化重置状态
    globalStore.reducerStore.dispatch({
      type: TYPES.UPDATE_PPT_STATE,
      payload: 'wait'
    })
    // globalStore.reducerStore.dispatch({
    //   type: TYPES.UPDATE_PPT_TYPE,
    //   payload: 0
    // })
  }
  componentDidMount() {
    this.getStart()
  }
  // 初始化调用
  getStart() {
    let store = globalStore.reducerStore.getState()
    if (store.animatePPT.pptType == 1) {
      this.state.isAnimationMode = true
    } else {
      this.state.isAnimationMode = false
    }
    let ppt = this.props.data.animatePPT
    this.state.pptUrl = ppt.h5PPTUrl
  }
  // 更新PPT数据
  updatePageData(data) {
    // if (data && data.name === 'TALKFUN_PPT_INTERACTION' && data.state === 'init') {
    //   // 更新PPT类型
    //   globalStore.reducerStore.dispatch({
    //     type: TYPES.UPDATE_PPT_TYPE,
    //     payload: 1
    //   })
    //   let _realPage = data
    //   _realPage.curPage = globalStore.getState().page.currentPage
    //   _realPage.curStep = globalStore.getState().page.currentSubPage

    //   // 更新初始化动态PPT数据
    //   globalStore.reducerStore.dispatch({
    //     type: TYPES.UPDATE_PPT_ANIMATION_DATA,
    //     payload: _realPage
    //   })
    // }
    if (data && data.name === 'TALKFUN_PPT_INTERACTION' && data.state === 'init') {
      // 更新PPT类型
      globalStore.reducerStore.dispatch({
        type: TYPES.UPDATE_PPT_TYPE,
        payload: 1
      })
      // 更新数据
      // 初始化加载时使用静态的curPage、currentSubPage合并到动态数据的结构中
      globalStore.reducerStore.dispatch({
        type: TYPES.UPDATE_PPT_ANIMATION_DATA,
        payload: Object.assign(data, {
          curPage: globalStore.reducerStore.getState().page.currentPage - 1,
          curStep: globalStore.reducerStore.getState().page.currentSubPage - 1
        })
      })
    }
  }
  onerror(iframe) {
    // 加载失败时切换回静态PPT
    globalStore.reducerStore.dispatch({
      type: TYPES.UPDATE_PPT_TYPE,
      payload: 0
    })
    emitter.emit('whiteboard:image:error', { url: iframe.target.src })
  }
  // iframe 监听
  iframeListener() {
    window.addEventListener("message", res => {
      let _data = null
      if (typeof res.data == 'string' && res.data != 'undefined') {
        _data = JSON.parse(res.data)
      } else {
        _data = res.data
      }
      if (_data) {
        this.updatePageData(_data)
      }
    }, false);
  }
  // object or array
  render() {
    // this.getStart()
    // 非动画模式
    if (!this.state.isAnimationMode) {
      return ''
    } else {
      let store = globalStore.reducerStore.getState()
      if (tools.isWhiteboard(store.page.currentPage)) {
        return ''
      }
    }
    // render
    let wrapStyle = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: '20',
      top: 0,
      left: 0
    }
    let iframeStyle = {
      width: '100%',
      height: '100%',
      border: 'none'
    }
    if (this.state.pptUrl) {
      return (
        <div style={wrapStyle} id="talkfun-animation-wrap">
          <iframe onerror={this.onerror.bind(this)} id="talkfun-pptconnector-ifr" style={iframeStyle} crossOrigin src={this.state.pptUrl}></iframe>
        </div>
      )
    }
  }
}