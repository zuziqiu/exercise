/**
 * Actions
 */
import { getlist } from '../api/chat'
import * as TYPES from './types'
import tools from "@tools"
import state from './state'

const actions = {
  // 获取聊天
  [TYPES.GET_CHAT_LIST] (state, payload) {
    return getlist(payload)
  }
}

// commit
export default {
  dispatch(type, payload) {
    tools.debug('Dispatch =>', type, payload, TYPES[type])
    if (actions[type]) {
      return actions[type].call(this, state, payload)
    } else {
      throw new Error(`${type} Action未定义,请检查...`)
    }
  }
}