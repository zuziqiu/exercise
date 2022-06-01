/**
 * Actions
 */
import * as TYPES from './types'
import state from './state'
import tools from '../../utils/tools'

const actions = {
  getChatList() {
    // todo...
  }
}

// dispatch
export default {
  dispatch(type, payload) {
    tools.debug('Dispatch =>', type, payload)
    if (actions[type]) {
      return actions[type].call(this, state, payload)
    } else {
      throw new Error(`Action ==> ${type} 未定义,请检查...`)
    }
  }
}