import { computed, observable, configure } from 'mobx'
import tools from '../utils/tools'
import { mediaState } from './media'
import { memberState } from './member'
import { questionState } from './question'
import { roomState } from './room'
import { zhuboState } from './zhubo'
import { whiteboardState } from './whiteboard'
import { networkState } from './network'

//使用严格模式，全局范围的注册的监听对象只允许通过已经注册的action更新state
configure({ enforceActions: 'always' })

class Store {
  constructor() {
    // this.wbLocalStorage = {}
    // this._identifyId = localStorage['wbIdentifyId']
    // if (this._identifyId) {
    //   this.wbLocalStorage = localStorage[`_TF_WB_${this._identifyId}`] ? JSON.parse(localStorage[`_TF_WB_${this._identifyId}`]) : {}
    // }
    // this.wbLocalStorage = localStorage[`_TF_WB_`] ? JSON.parse(localStorage[`_TF_WB_`]) : {}
  }

  /**
   * 开始注册监听的数据
   */
  // 媒体数据
  @observable media = mediaState
  // 会员数据
  @observable member = memberState
  // 问答数据
  @observable question = questionState
  // 房间信息
  @observable room = roomState
  // 主播信息
  @observable zhubo = zhuboState
  // 课件数据
  @observable whiteboard = whiteboardState
  // 网络数据
  @observable network = networkState

  /* 
    计算属性
   */
  // 计算网页全屏的属性，摄像头、桌面分享/视频、课件任一的webFullScreen属性变化都会重新响应
  @computed get webFullScreen() {
    return {
      camera: this.media.player.camera.webFullScreen,
      video: this.media.player.video.webFullScreen,
      whiteboard: this.whiteboard.webFullScreen
    }
  }
  // 计算网页全屏的属性，摄像头、桌面分享/视频、课件任一的webFullScreen属性变化都会重新响应
  @computed get isWebFullScreen() {
    return this.media.player.camera.webFullScreen || this.media.player.video.webFullScreen || this.whiteboard.webFullScreen
  }
}
let __sdkStore = new Store()
if (tools.getQueryStr('sdkStore') == 'true' || process.env.NODE_ENV == 'development') {
  window.__sdkStore = __sdkStore
}
export const sdkStore = __sdkStore
