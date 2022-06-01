/**
 * ## Main 组件
 * ## 创建Fabric对象
 * ## 画板对象
 */
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
// Components
import { globalStore } from '../states/globalStore'
import { Whiteboard } from './Whiteboard'
import { Animation } from './Animation'
import { PPT } from './PPT'
import { Poster } from './Poster'
import { service } from '../service';
import { page } from '../core/page';
import * as TYPES from '../Action/action-types'
@observer
export class Main extends PureComponent {
  // construstor
  constructor() {
    super()
    this.pageData = null
    this.debuggerLoad = false
    this.vconsole = null
    this.state = {
      TestComponent: null,
      reloadCount: 0
    }
  }
  // mount
  componentDidMount() {
  }
  reload(event) {
    // event.target.className = `${event.target.className} reloading`
    globalStore.actions.dispatch('room', {
      type: TYPES.UPDATE_ROOM_RELOAD,
      payload: 'reload reloading'
    })
    // 清空当前页的涂鸦数据
    page.clearDrawData(globalStore.store.page.currentPage)
      .then(() => {
        // clear context2D canvas设置的涂鸦和颜色都会被还原
        globalStore.fabric.clearContext(globalStore.fabric.contextContainer)
      })
      .then(() => {
        // 更新当前页的涂鸦数据
        service.updateCurPageData().then((success) => {
          // 更新state.reloadCount，才能让Whiteboard模块重新渲染，需要触发到生命周期函数componentDidMount
          if (success) {
            this.setState({
              reloadCount: this.state.reloadCount + 1
            })
          }
        })
      })
  }
  // render
  render() {
    const _propsData = this.props.data;
    if (_propsData.room.debugMode == 'true') {
      if (!this.state.TestComponent) {
        import(/* webpackChunkName: 'Test' */ './Test').then(module => {
          this.setState({
            TestComponent: module.Test
          })
        })
      }
    }
    let wpStyle = { display: 'block', width: '100%', height: '100%', overflow: 'hidden' },
      renderFixStyle = {
        width: '1px', height: '1px', margin: '0', padding: '0', outline: 'none', position: 'absolute', zIndex: '99', left: '0', top: '0'
      }
    return (
      <>
        {Number(_propsData.room.gifSwitch) ? <img id="renderFix" src={require('../assets/img/render.gif').default} alt="控制重绘的开关" style={renderFixStyle} /> : null}
        <div className="tf_whiteboard_wp" style={wpStyle}>
          {/* 画板 */}
          <Whiteboard key={this.state.reloadCount} />
          {globalStore.store.room.reload != null ? <div onClick={this.reload.bind(this)} className={globalStore.store.room.reload}></div> : null}
          {/* 海报 */}
          <Poster />
          {/* 课件 */}
          <PPT />
          {/* 动画 */}
          <Animation />
          {/* 调试面板 */}
          {_propsData.room.debugMode == 'true' && this.state.TestComponent ? < this.state.TestComponent /> : ''}
        </div>
      </>
    )
  }
}