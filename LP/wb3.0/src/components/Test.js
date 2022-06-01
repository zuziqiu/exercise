/**
 * Demo组件
 */
import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import { globalStore } from '../states/globalStore'
import { page } from '../core/page'
import { STATIC } from '../states/staticState'
import * as TYPES from '../Action/action-types'
import * as tools from '../extensions/util'
import * as demos from '../assets/demoData'
import * as unitTest from '../unitTest'

@observer
export class Test extends PureComponent {
  constructor() {
    super()
    this.state = {
      extendTest: false,
      extendUnit: false,
      link: ''
    }
  }
  async unit(type) {
    if (type) {
      unitTest[type].distribute()
    } else {
      for (let item in unitTest) {
        await unitTest[item].distribute()
      }
    }
  }
  page(type, data) {
    let actions = globalStore.actions

    if (type === 'next') {
      actions.dispatch(['page', 'animatePPT'], {
        type: TYPES.PAGE_NEXT,
        payload: 1
      })
    }

    if (type === 'prev') {
      actions.dispatch(['page', 'animatePPT'], {
        type: TYPES.PAGE_PREV,
        payload: 1
      })
    }

    if (type === 'opacity') {
      actions.dispatch('wbProperty', {
        type: TYPES.WHITEBOARD_BRUSH_OPACITY,
        payload: data
      })
    }

    if (type === 'bg') {
      actions.dispatch('wbProperty', {
        type: TYPES.WHITEBOARD_BACKGROUND_COLOR,
        payload: data
      })
    }

    if (type === 'color') {
      actions.dispatch('wbProperty', {
        type: TYPES.WHITEBOARD_BRUSH_STROKE_COLOR,
        payload: data
      })
    }

    if (type === 'width') {
      actions.dispatch('wbProperty', {
        type: TYPES.WHITEBOARD_BRUSH_STROKE_WIDTH,
        payload: data
      })
    }

    if (type === 'fontSize') {
      actions.dispatch('wbProperty', {
        type: TYPES.WHITEBOARD_BRUSH_DATA,
        payload: {
          fontSize: data
        }
      })
    }

    if (type === 'reload') {
      window.location.reload()
    }

    if (type === 'apply') {
      let _dd = ''
      if (data == 'PPT') {
        _dd = demos.DATA_16_9
      }
      if (data == 'PDF') {
        _dd = demos.DATA_PDF
      }
      if (data == 'DOC') {
        _dd = demos.DATA_DOC_2
      }
      if (data == 'Animation') {
        _dd = demos.DATA_ANIMATION_PPT
      }
      let actionData = {
        type: TYPES.LIVE_SET_PAGE,
        payload: _dd
      }
      page.doSetPage(actionData)
    }

    if (type === 'page') {
      if (data == 10005) {
        var _ret = {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          effect: 1,
          isSend: '1',
          server_path: 'https://s2.talk-fun.com/8/doc/97/21/64/80ee021bea6b0d566269467d6e/origin.png'
          // src: `file:///D:\programs\cloudLive2\save\pic\97216480ee021bea6b0d566269467d6e\origin.png`
        }
      } else if (data == 10006) {
        var _ret = {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          effect: 1,
          isSend: '1',
          server_path: 'https://s2.talk-fun.com/8/doc/ca/60/89/05eb743d4791daee9935effcca/origin.jpg'
          // src: `file:///D:\programs\cloudLive2\save\pic\97216480ee021bea6b0d566269467d6e\origin.png`
        }
      } else {
        var _ret = {
          backgroundColor: '#EEEEEE'
        }
      }
      actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
        type: TYPES.LIVE_SET_PAGE,
        payload: {
          id: data,
          pageIndex: data,
          subIndex: 1,
          ret: _ret
        }
      })
    }
    if (type === 'exitPage') {
      let _PAGE = data
      let ret = null
      let _ID = '1'
      if (tools.isWhiteboard(_PAGE)) {
        _ID = _PAGE
        ret = globalStore.store.whiteboard[_PAGE]
      } else {
        _ID = globalStore.store.page.pptId
        ret = null
      }
      actions.dispatch(['whiteboard', 'room', 'page', 'animatePPT'], {
        type: TYPES.LIVE_SET_PAGE,
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
      type === STATIC.ELLIPSE ||
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
        actions.dispatch('wbProperty', {
          type: TYPES.WHITEBOARD_BRUSH_DATA,
          payload: {
            src: _dd,
            server_path: _dd
          }
        })
      }

      actions.dispatch('wbProperty', {
        type: TYPES.WHITEBOARD_BRUSH_TYPE,
        payload: type
      })
    }

    // if (type === STATIC.BACK_WARD) {
    //   actions.dispatch('history', {
    //     type: TYPES.WHITEBOARD_HISTORY_BACKWARE,
    //     payload: {
    //       isSend: '1'
    //     }
    //   })
    // }
    // if (type === STATIC.FOR_WARD) {
    //   actions.dispatch('history', {
    //     type: TYPES.WHITEBOARD_HISTORY_FORWARE,
    //     payload: {
    //       isSend: '1'
    //     }
    //   })
    // }
  }
  changeLink(e) {
    this.setState({
      link: e.target.value
    })
  }
  goTo() {
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
    // let actions = globalStore.store
    // actions.dispatch({
    //   type: TYPES.FIRE_DEBUG_MODE,
    //   payload: {
    //     visible: _visible
    //   }
    // })
    window.location.href = this.state.link
  }
  extendTestFun() {
    if (this.state.extendTest) {
      this.setState({
        extendTest: !this.state.extendTest
      })
    } else {
      this.setState({
        extendTest: !this.state.extendTest,
        extendUnit: this.state.extendTest
      })
    }
  }
  extendUnitFun() {
    if (this.state.extendUnit) {
      this.setState({
        extendUnit: !this.state.extendUnit
      })
    } else {
      this.setState({
        extendUnit: !this.state.extendUnit,
        extendTest: this.state.extendUnit
      })
    }
  }
  render() {
    let test = {
      maxWidth: '80%',
      minWidth: '300px',
      padding: '5px',
      background: 'rgba(0, 0, 0, 0.5)',
      position: 'absolute',
      top: '10px',
      right: '10px',
      borderRadius: '1em',
      color: '#ffffff',
      zIndex: '200'
    }
    let itemSpan = {
      padding: '3px',
      backgroundColor: 'bisque',
      margin: '0 2px',
      color: '#808080',
      cursor: 'pointer'
    }
    let reload = {
      width: '40%',
      border: '2px solid #dcdcdc',
      cursor: 'pointer',
      background: 'greenyellow',
      color: '#000000',
      borderRadius: '5px',
      marginRight: '8px'
    }
    let colors = ['#ff0000', '#fff000', '#18ffff', '#ffffff', '#00ff00', '#81511c']
    return (
      <div style={test}>
        <div style={{ textAlign: 'right', lineHeight: '30px' }}>
          <span style={{ cursor: 'pointer', marginRight: '8px' }}>[版本] v{globalStore.store.room.version}</span>
          <span style={{ cursor: 'pointer', marginRight: '8px' }} onClick={this.extendTestFun.bind(this)}>
            {this.state.extendTest ? 'foldTest' : 'extendTest'}
          </span>
          <span style={{ cursor: 'pointer', marginRight: '8px' }} onClick={this.extendUnitFun.bind(this)}>
            {this.state.extendUnit ? 'foldUnit' : 'extendUnit'}
          </span>
        </div>
        <div style={{ textAlign: 'right', lineHeight: '30px' }}>
          <span style={reload} id="reload" onClick={this.page.bind(this, 'reload')}>
            Reload!
          </span>
          <span style={reload} onClick={this.goTo.bind(this, globalStore.store)}>
            GoTo
          </span>
          <input style={{ marginRight: '8px' }} type="text" value={this.state.link} onChange={this.changeLink.bind(this)}></input>
        </div>
        <div className="test_shell" style={{ display: this.state.extendTest ? 'block' : 'none' }}>
          {/* 颜色 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="color" onClick={this.fire}>
            color:
            {colors.map((k, index) => {
              return (
                <span style={Object.assign({}, itemSpan, { color: k, backgroundColor: 'rgba(0, 0, 0, 0.7)' })} onClick={this.page.bind(this, 'color', k)} key={index}>
                  {k}
                </span>
              )
            })}
          </div>
          {/* 粗细 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="width" onClick={this.fire}>
            brushWidth:
            <span style={itemSpan} onClick={this.page.bind(this, 'width', '2')}>
              2
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'width', '4')}>
              4
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'width', '6')}>
              6
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'width', '8')}>
              8
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'width', '10')}>
              10
            </span>
          </div>
          {/* 字体 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="fontSize" onClick={this.fire}>
            fontSize:
            <span style={itemSpan} onClick={this.page.bind(this, 'fontSize', '20')}>
              20
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'fontSize', '36')}>
              36
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'fontSize', '48')}>
              48
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'fontSize', '72')}>
              72
            </span>
          </div>
          {/* bg颜色 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="bg-color" onClick={this.fire}>
            BgColor:
            <span style={Object.assign({}, itemSpan, { backgroundColor: '#000000' })} onClick={this.page.bind(this, 'bg', '#000000')}>
              #000000
            </span>
            <span style={Object.assign({}, itemSpan, { backgroundColor: '#ff1100' })} onClick={this.page.bind(this, 'bg', '#ff1100')}>
              #ff1100
            </span>
            <span style={Object.assign({}, itemSpan, { backgroundColor: '#ffe500' })} onClick={this.page.bind(this, 'bg', '#ffe500')}>
              #ffe500
            </span>
            <span style={Object.assign({}, itemSpan, { backgroundColor: '#0080ff' })} onClick={this.page.bind(this, 'bg', '#0080ff')}>
              #0080ff
            </span>
          </div>
          {/* 上下页 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="bg-color">
            page:
            <span style={itemSpan} data-key="prev" onClick={this.page.bind(this, 'prev')}>
              Prev
            </span>
            <span style={itemSpan} data-key="next" onClick={this.page.bind(this, 'next')}>
              Next
            </span>
          </div>
          {/* history */}
          {/* <div className="bg-color">
            DrawHistory:
            <span style={itemSpan} style={{ 'color': '#fff',  'backgroundColor': '#999', 'cursor': 'auto'}} data-key="prev" className={ban_backward} onClick={this.page.bind(this, 'backward')}>backw</span>
            <span style={itemSpan} style={{ 'color': '#fff',  'backgroundColor': '#999', 'cursor': 'auto'}} data-key="next" className={ban_forward} onClick={this.page.bind(this, 'forward')}>forw</span>
          </div> */}
          {/* opacity */}
          {/* <div className="bg-color">
            opacity:
            <span style={itemSpan} data-key="prev" onClick={this.page.bind(this, 'opacity', 1)}>1</span>
            <span style={itemSpan} data-key="prev" onClick={this.page.bind(this, 'opacity', 0.5)}>0.5</span>
            <span style={itemSpan} data-key="next" onClick={this.page.bind(this, 'opacity', 0.8)}>0.8</span>
          </div> */}
          {/* 类型 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="tools">
            brush:
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.CURVE)}>
              Curve
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.LINE)}>
              Line
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.RECTANGLE)}>
              Rectangle
            </span>
            {/* <span style={itemSpan} onClick={this.page.bind(this, STATIC.ELLIPSE)}>Circle</span> */}
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.ELLIPSE)}>
              Ellipse
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.DOTTED_LINE)}>
              DottedLine
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.TRIANGLE)}>
              Triangle
            </span>
            {/* <span style={itemSpan} onClick={this.page.bind(this, STATIC.ARROW)}>Arrow</span> */}
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.TEXT)}>
              Text
            </span>
            {/* <span style={itemSpan} onClick={this.page.bind(this, STATIC.POINTER)}>Pointer</span> */}
            <span style={itemSpan} onClick={this.page.bind(this, STATIC.IMAGE)}>
              Image
            </span>
          </div>
          {/* 橡皮擦 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="tools">
            erase:
            <span style={itemSpan} onClick={this.page.bind(this, '20')}>
              Erase
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, '1')}>
              EraseAll
            </span>
          </div>
          {/* 文档 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="tools">
            document:
            {/* <span style={itemSpan} onClick={this.page.bind(this, 'ppt')}>PPT</span> */}
            <span style={itemSpan} onClick={this.page.bind(this, 'apply', 'PPT')}>
              apply PPT
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'apply', 'PDF')}>
              apply PDF
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'apply', 'DOC')}>
              apply Word
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'apply', 'Animation')}>
              apply AnimationPPT
            </span>
          </div>
          {/* 白板 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="tools">
            whiteboard:
            <span style={itemSpan} onClick={this.page.bind(this, 'page', 10002)}>
              画板10002
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'page', 10003)}>
              画板10003
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'page', 10004)}>
              画板10004
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'page', 10005)}>
              宽海报10005
            </span>
            <span style={itemSpan} onClick={this.page.bind(this, 'page', 10006)}>
              高海报10006
            </span>
          </div>
          {/* 记录页数 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }} className="tools">
            page:
            {globalStore.store.page.pageIndexs.map((k, index) => {
              return (
                <span style={itemSpan} onClick={this.page.bind(this, 'exitPage', k)} data={k} key={index}>
                  {k}
                </span>
              )
            })}
          </div>
        </div>
        <div className="unit_shell" style={{ display: this.state.extendUnit ? 'block' : 'none' }}>
          {/* 一键测试 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }}>
            <span style={itemSpan} onClick={this.unit.bind(this, '')}>
              一键测试
            </span>
          </div>
          {/* page测试是ppt和白板翻页 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }}>
            直播器测试:
            <span style={itemSpan} onClick={this.unit.bind(this, 'qtClient')}>
              直播器client
            </span>
            <span style={itemSpan} onClick={this.unit.bind(this, 'qtPassive')}>
              直播器passive
            </span>
          </div>
          {/* wb测试是白板切换 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }}>
            大班测试:
            <span style={itemSpan} onClick={this.unit.bind(this, 'bClassPassive')}>
              大班passive
            </span>
          </div>
          {/* ppt测试是ppt切换 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }}>
            小班测试:
            <span style={itemSpan} onClick={this.unit.bind(this, 'xClassClient')}>
              小班client
            </span>
            <span style={itemSpan} onClick={this.unit.bind(this, 'xClassPassive')}>
              小班passive
            </span>
          </div>
          {/* 笔画测试 */}
          <div style={{ lineHeight: '30px', overflow: 'hidden' }}>
            brush测试:
            <span style={itemSpan} onClick={this.unit.bind(this, 'graphicPassive')}>
              涂鸦passive
            </span>
          </div>
          <div style={{ overflow: 'hidden', fontSize: '14px', backgroundColor: '#ffbf00', padding: '4px', borderRadius: '6px' }}>
            注意：client端（有直播权限端）需要手动使用涂鸦进行测试，因为client端不是通过接收数据描绘涂鸦！
          </div>
        </div>
      </div>
    )
  }
}
