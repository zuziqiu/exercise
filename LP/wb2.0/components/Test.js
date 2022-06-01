/**
 * Demo组件
 */
import { h, render, Component } from 'preact'
import { globalStore } from '../states/globalStore'
import * as TYPE from '../Action/action-types'
import { Page } from '../core/page'
import { History } from '../core/history'
import * as tools from '../extensions/util'
import { STATIC } from '../states/staticState';
export class Test extends Component {
  constructor() {
    super()
    this.extend = false
    this.history = new History()
  }

  page(type, data) {

    let _globalStore = globalStore.reducerStore

    if (type === 'next') {
      _globalStore.dispatch({
        type: TYPE.PAGE_NEXT,
        payload: 1
      })
    }

    if (type === 'prev') {
      _globalStore.dispatch({
        type: TYPE.PAGE_PREV,
        payload: 1
      })
    }

    if (type === 'opacity') {
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_BRUSH_OPACITY,
        payload: data
      })
    }

    if (type === 'bg') {
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_BACKGROUND_COLOR,
        payload: data
      })
    }

    if (type === 'color') {
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_BRUSH_STROKE_COLOR,
        payload: data
      })
    }

    if (type === 'width') {
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_BRUSH_STROKE_WIDTH,
        payload: data
      })
    }

    if (type === 'fontSize') {
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_BRUSH_DATA,
        payload: {
          fontSize: data
        }
      })
    }

    if (type === 'reload') {
      window.location.reload()
    }

    if (type === 'apply') {
      // window.location.reload()
      let p = new Page()
      p.demoPull(data)
    }
    // if (type === 'next' || type === 'prev') {
    //   var store = _globalStore.getState()
    //   var _k = (store.page.currentPage)
    // }

    if (type === 'page') {
      // let p = new Page()
      let _PAGE = data
      let ret = null
      // console.error(this.props.room)
      // console.error(store.room.pptId)
      let _ID = '1'
      if (tools.isWhiteboard(_PAGE)) {
        _ID = _PAGE
        ret = {
          backgroundColor: '#EEEEEE'
        }
      } else {
        _ID = this.props.room.pptId
        ret = null
      }
      _globalStore.dispatch({
        type: TYPE.LIVE_SET_PAGE,
        payload: {
          id: _ID,
          pageIndex: _PAGE,
          subIndex: 1,
          ret: ret
        }
      })
    }

    if (
      type === STATIC.LINE ||
      type === STATIC.CURVE ||
      type === STATIC.RECTANGLE ||
      type === STATIC.CIRCLE ||
      type === STATIC.CIRCLE ||
      type === STATIC.DOTTED_LINE ||
      type === STATIC.ERASE ||
      type === STATIC.ERASE_ALL ||
      type === STATIC.IMAGE ||
      type === STATIC.TEXT ||
      type === STATIC.POINTER ||
      type === STATIC.TRIANGLE
    ) {
      if (type === STATIC.IMAGE) {
        let src1 = 'https://s2.talk-fun.com/2/doc/a1/1b/7a/2d960c81e53f6cf6b1d9edc943/origin.jpg'
        let src2 = 'https://s2.talk-fun.com/2/doc/a1/1b/7a/2d960c81e53f6cf6b1d9edc943/origin.jpg'
        let ran = [src1, src2]
        let _ran = Math.round(Math.random() * (ran.length - 1))
        if (_ran > ran.length) {
          _ran = ran.length - 1
        }
        let _dd = ran[_ran]
        _globalStore.dispatch({
          type: TYPE.WHITEBOARD_BRUSH_DATA,
          payload: {
            src: _dd,
            server_path: _dd
          }
        })
      }

      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_BRUSH_TYPE,
        payload: type
      })
    }

    if (type === STATIC.BACK_WARD) {
      // this.history.onBackward()
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_HISTORY_BACKWARE,
        payload: {
          isSend: '1'
        }
      })
    }
    if (type === STATIC.FOR_WARD) {
      // this.history.onForward()
      _globalStore.dispatch({
        type: TYPE.WHITEBOARD_HISTORY_FORWARE,
        payload: {
          isSend: '1'
        }
      })
    }
  }
  shouldComponentUpdate() {
    if (this.props.debugMode === 'false') {
      // return false
    }
  }
  control(data) {
    // let _visible = {}
    // if (data && data.debugMode) {
    //   if (data.debugMode === 'true') {
    //     _visible = 'false'
    //   } else {
    //     _visible = 'true'
    //   }
    // }
    // else if (typeof data === 'string') {
    //   _visible = data
    // }
    // else {
    //   _visible = 'true'
    // }
    // console.warn(_visible)
    // let _globalStore = globalStore.reducerStore
    // _globalStore.dispatch({
    //   type: TYPE.FIRE_DEBUG_MODE,
    //   payload: {
    //     visible: _visible
    //   }
    // })
    window.location.href = '//open.talk-fun.com/open/maituo_v2/dist/client-whiteboard/debug/v2.4.8/index.html'
  }
  pageList() {

  }
  extendFun() {
    this.extend = !this.extend
    if (this.extend) {
      document.querySelector(".test_shell").className ='test_shell'
      document.querySelector('.extendTest').innerHTML = '收起面板'
    } else {
      document.querySelector(".test_shell").className ='test_shell hidden'
      document.querySelector('.extendTest').innerHTML = '展开面板'
    }
  }
  // object or array
  render(store) {
    this.props = this.props.data

    var ban_forward = '';
    var ban_backward = '';
    var currentPage = globalStore.reducerStore.getState().room.setPageData.pageIndex
    if (currentPage > 10000) {
      var mode = STATIC.WHITEBOARD
    } else {
      var mode = STATIC.PPT
    }
    if (!globalStore.reducerStore.getState().history[mode][currentPage]) {
      ban_backward = 'ban_backward'
    } else if (globalStore.reducerStore.getState().history[mode][currentPage].forward.length === 0) {
      ban_backward = 'ban_backward'
    }
    if (!globalStore.reducerStore.getState().history[mode][currentPage]) {
      ban_forward = 'ban_forward'
    } else if (!globalStore.reducerStore.getState().history[mode][currentPage].backward || globalStore.reducerStore.getState().history[mode][currentPage].backward.length === 0) {
      ban_forward = 'ban_forward'
    }

    let colors = ["#ff0000", "#fff000", "#18ffff", "#ffffff", "#00ff00", "#81511c", "#0033cc", "#000000"]
    return (
      <div class="test">
        {/* <isShowLog /> */}
        <div class="version">[版本] v{this.props.room.version}</div>
        <div class="gotoTest" onClick={this.control.bind(this, this.props)}>跳转测试版</div>
        <div class="extendTest" onClick={this.extendFun.bind(this)}>展开面板</div>
        <div class='test_shell hidden'>
          <div id="reload" onClick={this.page.bind(this, 'reload')}>Reload!</div>
          {/* 颜色 */}
          <div class="pen-color" onClick={this.fire}>
            Color:
            {colors.map((k) => {
              return (
                <span style={{ backgroundColor: k }} onClick={this.page.bind(this, 'color', k)}>
                  {k}
                </span>
              )
            })}
          </div>

          {/* 粗细 */}
          <div class="pen-color" onClick={this.fire}>
            width:
            <span onClick={this.page.bind(this, 'width', '2')}>2</span>
            <span onClick={this.page.bind(this, 'width', '4')}>4</span>
            <span onClick={this.page.bind(this, 'width', '6')}>6</span>
            <span onClick={this.page.bind(this, 'width', '8')}>8</span>
            <span onClick={this.page.bind(this, 'width', '10')}>10</span>
          </div>
          {/* 字体 */}
          <div class="pen-color" onClick={this.fire}>
            font-size:
            <span onClick={this.page.bind(this, 'fontSize', '20')}>20</span>
            <span onClick={this.page.bind(this, 'fontSize', '36')}>36</span>
            <span onClick={this.page.bind(this, 'fontSize', '48')}>48</span>
            <span onClick={this.page.bind(this, 'fontSize', '72')}>72</span>
          </div>
          {/* bg颜色 */}
          <div class="bg-color" onClick={this.fire}>
            BgColor:
            <span style={{ backgroundColor: '#000000' }} onClick={this.page.bind(this, 'bg', '#000000')}>
              #000000
            </span>
            <span style={{ backgroundColor: '#ff1100' }} onClick={this.page.bind(this, 'bg', '#ff1100')}>
              #ff1100
            </span>
            <span style={{ backgroundColor: '#ffe500' }} onClick={this.page.bind(this, 'bg', '#ffe500')}>
              #ffe500
            </span>
            <span style={{ backgroundColor: '#0080ff' }} onClick={this.page.bind(this, 'bg', '#0080ff')}>
              #0080ff
            </span>
          </div>

          {/* 上下页 */}
          <div class="bg-color">
            page:
            <span data-key="prev" onClick={this.page.bind(this, 'prev')}>
              Prev
            </span>
            <span data-key="next" onClick={this.page.bind(this, 'next')}>
              Next
            </span>
          </div>

          {/* history */}
          <div class="bg-color">
            page:
            <span data-key="prev" className={ban_backward} onClick={this.page.bind(this, 'backward')}>
              backw
            </span>
            <span data-key="next" className={ban_forward} onClick={this.page.bind(this, 'forward')}>
              forw
            </span>
          </div>

          {/* opacity */}
          <div class="bg-color">
            opacity:
            <span data-key="prev" onClick={this.page.bind(this, 'opacity', 1)}>
              1
            </span>
            <span data-key="prev" onClick={this.page.bind(this, 'opacity', 0.5)}>
              0.5
            </span>
            <span data-key="next" onClick={this.page.bind(this, 'opacity', 0.8)}>
              0.8
            </span>
          </div>

          {/* 类型 */}
          <div class="tools">
            brush-type:
            <span onClick={this.page.bind(this, STATIC.CURVE)}>Curve</span>
            <span onClick={this.page.bind(this, STATIC.LINE)}>Line</span>
            <span onClick={this.page.bind(this, STATIC.RECTANGLE)}>Rectangle</span>
            <span onClick={this.page.bind(this, STATIC.CIRCLE)}>Circle</span>
            <span onClick={this.page.bind(this, STATIC.CIRCLE)}>Ellipse</span>
            <span onClick={this.page.bind(this, STATIC.DOTTED_LINE)}>DottedLine</span>
            <span onClick={this.page.bind(this, STATIC.ARROW)}>Arrow</span>
            <span onClick={this.page.bind(this, STATIC.TEXT)}>Text</span>
            <span onClick={this.page.bind(this, STATIC.TRIANGLE)}>Triangle</span>
            <span onClick={this.page.bind(this, STATIC.POINTER)}>Pointer</span>
          </div>
          {/* 图片 */}
          <div class="tools">
            brush-image:
            <span onClick={this.page.bind(this, STATIC.IMAGE)}>Image</span>
          </div>
          {/* 橡皮擦 */}
          <div class="tools">
            coop:
            <span onClick={this.page.bind(this, '20')}>Erase</span>
            <span onClick={this.page.bind(this, '1')}>EraseAll</span>
          </div>

          {/* 文档 */}
          <div class="tools">
            mode:
            {/* <span onClick={this.page.bind(this, 'ppt')}>PPT</span> */}
            <span onClick={this.page.bind(this, 'apply', 'PPT')}>APPLY PPT</span>
            <span onClick={this.page.bind(this, 'apply', 'PDF')}>APPLY PDF</span>
            <span onClick={this.page.bind(this, 'apply', 'Animation')}>APPLY ANIMATETION PPT</span>
            {/* <span onClick={this.page.bind(this, 'whiteboard')}>WHITEBOARD</span> */}
          </div>

          {/* 白板 */}
          <div class="tools">
            page:
            <span onClick={this.page.bind(this, 'page', 10002)}>画板+1</span>
            <span onClick={this.page.bind(this, 'page', 10003)}>画板+1</span>
            <span onClick={this.page.bind(this, 'page', 10004)}>画板+1</span>
            {this.props.page.pageIndexs.map((k) => {
              return (
                <span onClick={this.page.bind(this, 'page', k)} data={k}>
                  {k}
                </span>
              )
            })}
          </div>
          {/* 动画 */}
          <div class="tools">
            pageOfAnimate:
            {this.props.animatePPT.pageComputed.map((k) => {
              return (
                <span onClick={this.page.bind(this, 'pageAnimate', k)} data={k}>
                  {k}
                </span>
              )
            })}
          </div>
          {/* qtmsg */}
          <h2 id="qt-msg"></h2>
          <h2 id="web-log"></h2>
        </div>
      </div>
    )
  }
}