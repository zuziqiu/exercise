import * as tools from '../extensions/util'
import { store } from '../states/index';
import { pageAction } from './pageAction';
import { wbPropertyAction } from './wbPropertyAction';
import { animatePPTAction } from './animatePPTAction';
import { roomAction } from './roomAction';
import { cousewareResourceAction } from './cousewareResourceAction';
import { sourceReLoadAction } from './sourceReLoadAction';
import { pptInfoResourceAction } from './pptInfoResourceAction';
import { pptAction } from './pptAction';
import { pageDrawDataAction } from './pageDrawDataAction';
import { historyAction } from './historyAction';
import { whiteboardAction } from './whiteboardAction';

class Action {
  constructor() {
    this.page = new pageAction(store)
    this.wbProperty = new wbPropertyAction(store)
    this.animatePPT = new animatePPTAction(store)
    this.room = new roomAction(store)
    this.cousewareResource = new cousewareResourceAction(store)
    this.sourceReLoad = new sourceReLoadAction(store)
    this.pptInfoResource = new pptInfoResourceAction(store)
    this.ppt = new pptAction(store)
    this.pageDrawData = new pageDrawDataAction(store)
    this.history = new historyAction(store)
    this.whiteboard = new whiteboardAction(store)
    // 经过这里注册的数据模块才会允许dispatch
    this.referenceArray = ['page', 'wbProperty', 'animatePPT', 'room', 'cousewareResource', 'sourceReLoad', 'pptInfoResource', 'ppt', 'pageDrawData', 'history', 'whiteboard']
  }
  dispatch(target, action) {
    [].concat(target).map(module => {
      if (this[module]) {
        [].concat(action).map(item => {
          this[module].dispatch(item)
        })
      } else {
        if (Object.prototype.toString.call(module) == '[object Object]') {
          module = JSON.stringify(module)
          tools.log(`${module}.action未定义 ==> ${JSON.stringify(module)}`)
        } else {
          tools.log(`module未定义 ==> `)
        }
      }
    })
  }
}

export const actions = new Action()