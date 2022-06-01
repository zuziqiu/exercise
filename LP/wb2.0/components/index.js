// 入口文件
import { h, render, Component } from 'preact'
import { Provider, connect } from 'preact-redux'
import { Main } from './Main'
import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import { removeListener } from 'resize-detector'
import emitter from '../extensions/emitter'

/**
 * @param {核心组件入口} 
 */
export const MainTemplate = (Store, id) => {
  // 渲染 dom id
  let domCon = null
  let _id = '#' + id
  if (document.querySelector(_id)) {
    domCon = document.querySelector(_id)
    domCon.innerHTML = ''
  } else {
    let div = document.createElement('div')
    div.id = id
    document.body.appendChild(div)
    domCon = div
  }
  domCon.style.position = 'relative'
  // save con
  globalStore.reducerStore.dispatch({
    type: TYPES.WHITEBOARD_CONTAINER,
    payload: _id
  })
  // preact ? todo...
  const Core = () => (
    <Provider store={Store}>
      <CoreApp />
    </Provider>
  )

  // 监听destroy
  // window.emitter = emitter
  let whiteboard_clearDom_callback = function () {
    if (domCon.childElementCount > 0) {
      document.querySelector(Store.getState().room.whiteboardContainerId) && removeListener(document.querySelector(Store.getState().room.whiteboardContainerId))
      emitter.off('whiteboard:clearDom', whiteboard_clearDom_callback)
      destroyPreact()
    }
  }
  emitter.on('whiteboard:clearDom', whiteboard_clearDom_callback)

  // 绑定state
  const CoreApp = connect(state => state)(() => (<Main data={Store.getState()} />))

  // Render
  const root = render(<Core />, domCon)
  // destroy preact
  let destroyPreact = () => {
    render(null, domCon, root);
  }
}