/**
 * 课件模式（PPT图片模块
 */
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx'
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import * as tools from '../extensions/util'
@observer
export class Animation extends PureComponent {
  // init.
  constructor() {
    super()
    // this.on()
    this.listener()
    this.iframeListener()
  }
  // 监听emit
  // on() {

  // }
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
    // globalStore.listen(
    //   () => { return toJS({ pptType: globalStore.store.animatePPT.pptType }) },
    //   ({ pptType }) => {
    //     let PAGE = globalStore.store.page.currentPage,
    //       SUB_PAGE = globalStore.store.page.currentSubPage;
    //     tools.renderPPT({ PAGE: PAGE, SUB_PAGE: SUB_PAGE, isSend: 1, ap: pptType })
    //   }
    // )
    // 当前页切换
    globalStore.listen(
      () => { return toJS({ pageIndex: globalStore.store.animatePPT.pageIndex }) },
      ({ pageIndex }) => {
        tools.log('change animationPPT page ==>', pageIndex)
        if (pageIndex > -1) {
          let pageComputed = globalStore.store.animatePPT['pageComputed']
          let curPageObj = tools.pageSplit(pageComputed[pageIndex])
          // 翻页
          if (curPageObj) {
            this.gotoPage(curPageObj.currentPage, curPageObj.currentSubPage)
          }
        }
      }
    )
    // 更换PPT
    globalStore.listen(
      () => { return toJS({ h5PPTUrl: globalStore.store.animatePPT.h5PPTUrl }) },
      ({ h5PPTUrl }) => {
        if (h5PPTUrl) {
          // 切换动态PPT前初始化重置状态
          globalStore.actions.animatePPT.dispatch({
            type: TYPES.UPDATE_ANIMATION_PPT_STATE,
            payload: 'wait'
          })
        }
      }
    )
    // 加载完成(初始化)
    globalStore.listen(
      () => { return toJS({ state: globalStore.store.animatePPT.state }) },
      ({ state }) => {
        if (state === 'init') {
          let page = globalStore.store.page
          this.gotoPage(page.currentPage, page.currentSubPage)
        }
        if (state === 'loaded') {
        }
      }
    )
  }
  // 跳转到某页
  gotoPage(page, step) {
    this.send({
      action: 'goto',
      page: (page - 1) < 0 ? 0 : page - 1,
      step: (step - 1) < 0 ? 0 : step - 1
    })
  }
  // componentWillMount() {
  //   // 初始化重置状态
  //   globalStore.actions.animatePPT.dispatch({
  //     type: TYPES.UPDATE_ANIMATION_PPT_STATE,
  //     payload: 'wait'
  //   })
  // }
  componentDidMount() {
    // 初始化重置状态
    globalStore.actions.animatePPT.dispatch({
      type: TYPES.UPDATE_ANIMATION_PPT_STATE,
      payload: 'wait'
    })
  }
  // 更新PPT数据
  updatePageData(data) {
    if (data && data.name === 'TALKFUN_PPT_INTERACTION' && data.state === 'init') {
      // 更新PPT类型
      globalStore.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
        type: TYPES.UPDATE_PPT_TYPE,
        payload: 1
      })
      // 更新数据
      // 初始化加载时使用静态的curPage、currentSubPage合并到动态数据的结构中
      globalStore.actions.dispatch('animatePPT', {
        type: TYPES.UPDATE_ANIMATION_PPT_DATA,
        payload: Object.assign(data, {
          curPage: globalStore.store.page.currentPage - 1,
          curStep: globalStore.store.page.currentSubPage - 1
        })
      })
    }
  }
  onerror() {
    // 加载失败时切换回静态PPT
    globalStore.actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
      type: TYPES.UPDATE_PPT_TYPE,
      payload: 0
    })
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
  isLoadIfr() {
    let h5PPTUrl = globalStore.store.animatePPT.h5PPTUrl
    if (h5PPTUrl) {
      return true
    } else {
      return false
    }
  }
  render() {
    // 动画模式
    if (globalStore.store.animatePPT.pptType == 1) {
      // 如果是白板
      if (tools.isWhiteboard(globalStore.store.page.currentPage)) {
        return ''
      }
      // 如果无h5PPTUrl
      if (!globalStore.store.animatePPT.h5PPTUrl) {
        return ''
      }
    } else {
      return ''
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
    return (
      <div id="talkfun-animation-wrap" style={wrapStyle}>
        <iframe id="talkfun-pptconnector-ifr" src={globalStore.store.animatePPT.h5PPTUrl} onError={this.onerror.bind(this)} style={iframeStyle} crossOrigin="true"></iframe>
      </div>
    )
  }
}