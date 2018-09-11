// 入口文件
import { h, render, Component } from 'preact'
import { Provider, connect } from 'preact-redux'
import { Main } from './main'
/**
 * @param {核心组件入口} 
 */
export const MainTemplate = (Store, id) => {
  // 渲染 dom id
  let div = document.createElement('div')
  div.id = id
  document.body.appendChild(div)
  // preact ? todo...
  const Core = () => (
    <Provider store={ Store }>
      <CoreApp />
    </Provider>
  )

  // 绑定state
  const CoreApp = connect(state => state)( () => (<Main data={ Store.getState() } />) )

  // Render
  render(<Core />, document.querySelector('#' + id))
}