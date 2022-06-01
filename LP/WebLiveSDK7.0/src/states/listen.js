/**
 * 全局Store对象
 */
import { reaction } from 'mobx'
import * as tools from '../utils/tools'
export const sdkStoreListener = {
  reactionList: [],
  // 监听state,destroy时会销毁通过listen注册的reaction
  listen(fetchDataFn, callback) {
    try {
      reaction(
        fetchDataFn,
        (data, reaction) => {
          this.reactionList.push(reaction)
          callback?.(data)
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
          callback?.(data)
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
}