/**
 * 全局Store对象
 */
import { reaction, toJS } from 'mobx'
import wbEmitter from '../extensions/wbEmitter'
import * as TYPES from '../Action/action-types'
import * as tools from '../extensions/util'
export const globalStore = {
  wbClass: null,
  // fabric 对象
  fabric: null,
  store: null,
  actions: null,
  reactionList: [],
  // 监听state,destroy时会销毁通过listen注册的reaction
  listen(fetchDataFn, callback) {
    try {
      reaction(
        fetchDataFn,
        (data, reaction) => {
          this.reactionList.push(reaction)
          callback && callback(data)
        }
      )
    }
    catch (error) {
      tools.error(`globalStore reaction error ==>${error}`)
    }
  },
  /* 
   * 监听state,destroy时也不会销毁通过listenKeep注册的reaction
   * 例如通过page注册的reaction指由在page实例化时注册，假设允许销毁，那么权限切换destroy => new，也不会重新实例化page，就不能响应数据变化
   */
  listenKeep(fetchDataFn, callback) {
    try {
      reaction(
        fetchDataFn,
        (data) => {
          callback && callback(data)
        }
      )
    }
    catch (error) {
      tools.error(`globalStore reaction error ==>${error}`)
    }
  },
  destroy() {
    this.reactionList.map(item => {
      item.dispose()
    })
    this.reactionList = []
  },
  // getFabric
  getFabric() {
    return this.fabric
  },
  // 获取Qt对象
  getCommandApi() {
    return this.webCommand
  },
  // get state
  getState() {
    if (this.store) {
      return toJS(this.store)
    } else {
      return { err: 'store null' }
    }
  },
  // 全局ID计数
  getId() {
    let drawId = this.store.room.drawId
    tools.log('draw id ==>', drawId)
    globalStore.actions.dispatch('room', {
      type: TYPES.DRAW_ID_INCREMENT
    })
    return drawId
  },
  getEmitter() {
    return wbEmitter
  },
  // 设置Qt
  setCommandApi(webCommand) {
    if (!this.webCommand && webCommand) {
      this.webCommand = webCommand
    }
  },
  setAction(actions) {
    this.actions = actions
  },
  setStore(store) {
    // 扩展Store对象
    this.store = store
    // if (MainTemplate) {
    //   MainTemplate(store)
    // }
    if (tools.getQueryStr('ws') == 'true') {
      window.__wbStore = this
    }
  }
}