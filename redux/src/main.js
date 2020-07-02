/**
 * @author huangyongaho
 * @date 2020-7-1
 * @description Reudx
 * 入口文件
 */

// Needs
import { createStore, combineReducers } from 'redux'
import { state } from './states/baseData'
import * as Reducers from './reducer/index'

// Redux init.
export default function (id) {
  const _reducer = combineReducers(Reducers)
  const Store = createStore(_reducer, state)
  window.__store = Store
}