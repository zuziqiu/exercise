import { computed, observable, configure } from 'mobx';
import { animatePPTState } from './animatePPT';
import { cousewareResourceState } from './cousewareResource';
import { historyState } from './history';
import { pageState } from './page';
import { pageDrawDataState } from './pageDrawData';
import { pptState } from './ppt';
import { pptInfoResourceState } from './pptInfoResource';
import { roomState } from './room';
import { sourceReLoadState } from './sourceReLoad';
import { wbPropertyState } from './wbProperty';
import { whiteboardState } from './whiteboard';

//使用严格模式，全局范围的注册的监听对象只允许通过已经注册的action更新state
configure({ enforceActions: 'always' })

class Store {
  constructor() {
    this.wbLocalStorage = {}
    this._identifyId = localStorage['wbIdentifyId']
    if (this._identifyId) {
      this.wbLocalStorage = localStorage[`_TF_WB_${this._identifyId}`] ? JSON.parse(localStorage[`_TF_WB_${this._identifyId}`]) : {}
    }
    // this.wbLocalStorage = localStorage[`_TF_WB_`] ? JSON.parse(localStorage[`_TF_WB_`]) : {}
  }

  /* 
    开始注册监听的数据
   */
  // 动态PPT数据模块
  @observable animatePPT = Object.assign(animatePPTState, this.wbLocalStorage['animatePPT'])
  // 课件地址
  @observable cousewareResource = Object.assign(cousewareResourceState, this.wbLocalStorage['cousewareResource'])
  // 历史
  @observable history = Object.assign(historyState, this.wbLocalStorage['history'])
  // page 表述页数、页码状态
  @observable page = Object.assign(pageState, this.wbLocalStorage['page'])
  // 涂鸦数据
  @observable pageDrawData = Object.assign(pageDrawDataState, this.wbLocalStorage['pageDrawData'])
  // ppt的属性，后缀、path、页数等
  @observable ppt = Object.assign(pptState, this.wbLocalStorage['ppt'])
  // ppt图片的属性，原始宽高、加载等状态
  @observable pptInfoResource = Object.assign(pptInfoResourceState, this.wbLocalStorage['pptInfoResource'])
  // 房间
  @observable room = Object.assign(roomState, this.wbLocalStorage['room'])
  // 资源重试
  @observable sourceReLoad = Object.assign(sourceReLoadState, this.wbLocalStorage['sourceReLoad'])
  // 画板属性，笔画、线宽、颜色等
  @observable wbProperty = Object.assign(wbPropertyState, this.wbLocalStorage['wbProperty'])
  // 白板页数等
  @observable whiteboard = Object.assign(whiteboardState, this.wbLocalStorage['whiteboard'])

  /* 
    计算属性
   */
  // 计算应用ppt某一页数的属性，任一属性变化都会重新应用
  @computed get computedPage() {
    return `${this.page.pptId}_${this.page.currentPage}_${this.page.currentSubPage}_${this.animatePPT.pptType}`
  }
}
export const store = new Store()