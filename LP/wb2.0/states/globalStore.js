/**
 * 全局Store对象
 */
import * as TYPES from '../Action/action-types'
import { observer, observe} from 'redux-observers'
import * as tools from '../extensions/util'
export const globalStore = {
  // fabric 对象
  fabric: null,
  // 监听state
  listen (mapfn, callback) {
    let state = this.reducerStore.getState()
    // let spliter = (mapfn.toString().split('=>'))
    // let kstate = spliter[1]
    let kstate = mapfn.toString()
    if (typeof kstate !== 'string') {
      tools.log('ERROR => Caller must be a string! => ', kstate, this)
      return false
    }
    // caller(state)
    if (!this.subscribeState) {
      this.subscribeState = {}
      this.subscribeStateArys = []
      this.observeList = []
    }
    if (!this.subscribeState.hasOwnProperty(kstate)) {
      this.subscribeState[kstate] = observer(mapfn, (dispatch, cur, prev) => {
        callback(dispatch, cur, prev, state)
      })
      this.subscribeStateArys.push(this.subscribeState[kstate])
      this.observeList.push(observe(this.reducerStore, this.subscribeStateArys))
    } else {
      tools.log('[WARN]!! Aready listened => ', kstate)
    }
  },
  destroy () {
    this.subscribeState = {}
    this.subscribeStateArys = []
    if (this.observeList) {
      this.observeList.map(item => {
        item && item()
      })
      this.observeList = []
    }
  },
  // getFabric
  getFabric () {
    return this.fabric
  },
  // 获取Qt对象
  getQt () {
    return this.Qt
  },
  // get state
  getState () {
    if (this.reducerStore) {
      return this.reducerStore.getState()
    }
  },
  // 全局ID计数
  getId () {
    let drawId = this.reducerStore.getState().drawId
    tools.log('draw id ==>', drawId)
    this.reducerStore.dispatch({
      type: TYPES.DRAW_ID_INCREMENT
    })
    return drawId
  },
  // 设置Qt
  setQt (Qt) {
    if (!this.Qt && Qt) {
      this.Qt = Qt
    }
  },
  // reducer 将合并到这里...
  reducerStore: {},
  // Redux 方法合并
  setStore (reducer, callback, id) {
    // 扩展Store对象
    if (reducer) {
      Object.assign(this.reducerStore, reducer)
      if (callback) {
        callback(this.reducerStore, id)
      }
    }
    window._GS_ = this
  }
}