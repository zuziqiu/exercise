/**
 * 全局Store对象
 */
import * as TYPES from '../../Action/action-types'
export const globalStore = {
  // fabric 对象
  fabric: null,
  // getFabric
  getFabric () {
    return this.fabric
  },
  // 获取Qt对象
  getQt () {
    return this.Qt
  },
  // 全局ID计数
  getId () {
    let drawId = this.reducerStore.getState().drawId
    console.log('draw id ==>', drawId)
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