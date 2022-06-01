import * as TYPES from '../constants/actionTypes'
import {
  whiteboard as whiteboardState
} from '../states'

import {
  createReducer
} from '../utils'


export default createReducer(whiteboardState, {
  [TYPES.WHITEBOARD_VERSION]: () => {

  }
})