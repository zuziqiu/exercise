import * as actionTypes from '../constants/actionTypes'
import { vodControls as vodContrilsState } from '../states'

const vodControls = (state = vodContrilsState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_PROGRESS_STYLE:
      /*
       * 在文档中对外暴露接收3个key
       * trackStyle 已观看时长的轨道样式对象
       * railStyle 未观看时长的轨道样式对象
       * handleStyle 手柄样式对象
       */
      let _state = { ...state }
      Object.keys(action.payload).map((key) => {
        _state.progressStyle[key] = action.payload[key]
      })
      return _state
    case actionTypes.UPDATE_RATE_VALUE:
      state.playRate.rateValue = action.payload.rateValue
    default:
      return state
  }
}

export default vodControls
