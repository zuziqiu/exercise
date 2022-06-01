import { sdkStore } from '../states'
import { mediaAction } from './mediaAction'
import { memberAction } from './memberAction'
import { questionAction } from './questionAction'
import { zhuboAction } from './zhuboAction'
import { roomAction } from './roomAction'
import { whiteboardAction } from './whiteboardAction'
import { networkAction } from './networkAction'
import * as tools from '../utils/tools'
/**
 * @ignore
 * @example
 * import {sdkAction} from path.resolve(__dirname, './src/action)
 * sdkAction.dispatch('aciton modules', {
 *  type: 'action-types',
 *  payload: {data}
 * })
 */
class Action {
  constructor() {
    this.room = new roomAction(sdkStore)
    this.media = new mediaAction(sdkStore)
    this.member = new memberAction(sdkStore)
    this.question = new questionAction(sdkStore)
    this.zhubo = new zhuboAction(sdkStore)
    this.whiteboard = new whiteboardAction(sdkStore)
    this.network = new networkAction(sdkStore)
    // this.referenceArray = ['page', 'wbProperty', 'animatePPT', 'room', 'cousewareResource', 'sourceReLoad', 'pptInfoResource', 'ppt', 'pageDrawData', 'history', 'whiteboard']
  }
  dispatch(target, action) {
    ;[].concat(target).map((module) => {
      if (this[module]) {
        if (action) {
          ;[].concat(action).map((item) => {
            this[module].dispatch(item)
          })
          // console.log(`${module}.action ==> ${JSON.stringify(module)}`)
        } else {
          console.warn(`${module}.action未定义 ==> ${JSON.stringify(module)}`)
        }
      } else {
        console.warn(`${module}未定义`)
      }
    })
  }
}

const __sdkAction = new Action()
if (tools.getQueryStr('sdkStore') == 'true' || process.env.NODE_ENV == 'development') {
  window.__sdkAction = __sdkAction
}
export const sdkAction = __sdkAction
