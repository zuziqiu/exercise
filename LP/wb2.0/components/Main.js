/**
 * ## Main 组件
 * ## 创建Fabric对象
 * ## 画板对象
 */
import { h, render, Component } from 'preact'
// Components
import { globalStore } from '../states/globalStore'
import { Whiteboard } from './Whiteboard-v2'
import { Animation } from './Animation'
import { PPT } from './PPT-v2'
import { Poster } from './Poster'
import { Test } from './Test'
import { Page } from '../core/page'
import { History } from '../core/history'
// import VConsole from 'vconsole'
// import * as TYPE from '../Action/action-types'
// init.
export class Main extends Component {
  // construstor
  constructor() {
    super()
    this.store = globalStore.reducerStore
    this.Page = null
    this.History = null
    this.preProp = this.store.getState()
    this.pageData = null
    this.debuggerLoad = false
  }
  // mount
  componentDidMount() {
    // 新建page
    this.Page = new Page()
    this.History = new History()
    // this.Whiteboard = new Whiteboard()
  }
  shouldComponentUpdate() {
    // return false
  }
  // update
  componentDidUpdate() {
    // this.Page.update()
    // console.error(newer, older)
    this.preProp = this.props.data
    // if (!this.debuggerLoad && this.store.getState().debugMode === 'true') {
    //   // vConsole
    //   this.vconsole = new VConsole()
    //   // this.debuggerLoad = true
    // } else if (this.store.getState().debugMode === 'false') {
    //   if (this.vconsole) {
    //     this.vconsole.destroy()
    //   }
    // }
  }
  componentWillReceiveProps(newProps) {
    let old = this.preProp
    let newer = newProps.data
    /**
     * setdata数据结构
     * ===============
     * pageIndex: 1
     * subIndex: 1
     * pageAmount: 20
     */

    // ### setPage更新 ###
    // ==========================
    this.Page.didUpdate(newer, old)
    // this.Whiteboard.didUpdate(newer, old)
    // this.PPT.didUpdate(newer, old)
    // ### history更新 ###
    // ==========================
    this.History.didUpdate(newer, old)

    // update
    if (this.pageData !== this.props.data.room.setPageData) {
      // this.pageData = this.props.data.room.setPageData
    }
  }
  // render
  render(props) {
    let _propsData = props.data
    return (
      // JSX
      <div class="tf_whiteboard_wp" style="display:block; width:100%; height:100%; overflow: hidden;">
        {/* 画板 */}
        <Whiteboard data={_propsData} />
        {/* 动画 */}
        <Animation data={_propsData} />
        {/* 课件 */}
        <PPT data={_propsData} />
        {/* 海报 */}
        <Poster data={_propsData} />
        {/* 调试面板 */}
        {_propsData.debugMode == 'true' ? < Test data={_propsData} /> : ''}
      </div>
    )
  }
}