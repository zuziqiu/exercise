/**
 * ## Main 组件
 * ## 创建Fabric对象
 * ## 画板对象
 */
import { h, render, Component } from 'preact'
// Components
import { globalStore } from '../states/globalStore'
// import { Whiteboard } from './Whiteboard'
// import { PPT } from './PPT'
// import { Test } from './Test'
// import { Page } from '../core/page'
// import { History } from '../core/history'
// import VConsole from 'vconsole'
// import * as TYPE from '../Action/action-types'
// init.
export class Main extends Component {
  // construstor
  constructor () {
    super()
    // this.store = globalStore.reducerStore
    this.Page = null
    this.History = null
    // this.preProp = this.store.getState()
    this.pageData = null
    this.debuggerLoad = false
    this.vconsole = null
  }
  // mount
  componentDidMount () {
    // // 新建page
    // this.Page = new Page()
    // this.History = new History()
    // this.Whiteboard = new Whiteboard()
    // // this.preProp = this.props.data
  }
  shouldComponentUpdate () {
    // return false
  }
  // update
  componentDidUpdate () {
    // // this.Page.update()
    // // console.error(newer, older)
    // this.preProp = this.props.data
    // if (!this.debuggerLoad && this.store.getState().debugMode === 'true') {
    //   // vConsole
    //   // this.vconsole = new VConsole()
    //   // this.debuggerLoad = true
    // } else if (this.store.getState().debugMode === 'false') {
    //   if (this.vconsole) {
    //     this.vconsole.destroy()
    //   }
    // }
  }
  componentWillReceiveProps (newProps) {
    // let old = this.preProp
    // let newer = newProps.data
    // /**
    //  * setdata数据结构
    //  * ===============
    //  * pageIndex: 1
    //  * subIndex: 1
    //  * pageAmount: 20
    //  */

    // // ### setPage更新 ###
    // // ==========================
    // this.Page.didUpdate(newer, old)
    // this.Whiteboard.didUpdate(newer, old)
    // // this.PPT.didUpdate(newer, old)
    // // ### history更新 ###
    // // ==========================
    // this.History.didUpdate(newer, old)

    // // update
    // if (this.pageData !== this.props.data.room.setPageData) {
    //   // console.error(this.props.data.page)
    //   // this.pageData = this.props.data.room.setPageData
    // }
  }
  // render
  render (props) {
    // let _propsData = props.data
    return (
      // JSX
      <section>
        redux!!!!!!!!!!!!
      </section>
    )
  }
}