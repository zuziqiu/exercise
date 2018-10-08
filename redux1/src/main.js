/**
 * @author zuziqiu
 * @date 2018/9/11
 * @description Reudx + Preact
 * 入口文件
 */

// Needs
import { createStore, combineReducers } from 'redux'
import { state } from './states/baseState'
import * as Reducers from './reducer/index'
import { globalStore } from './states/globalStore'
import { MainTemplate } from './components/index'
// import { QtTransport } from './extensions/QtTransport'
import VConsole from 'vconsole'

/**
 * ## 初始化配置从服务器读取 ##
 * TODO...
 */

// Redux init.
export default function (id) {
  const _reducer = combineReducers(Reducers)
  const Store = createStore(_reducer, state)
  
  // Qt init
//   const Qt = new QtTransport()
//   globalStore.setQt(Qt)
  
  // Save store & init Components => (<Main />)
  globalStore.setStore(Store, MainTemplate, id)
}