import * as actionTypes from '../constants/actionTypes'
import {
  global
} from '../states'
import {
  updateObject,
  createReducer
} from '../utils'

const updateInitData = (state, action) => {
  return updateObject(state, {
    data: action.payload
  })
}

export default createReducer(global, {
  [actionTypes.UPDATE_INIT_DATA]: updateInitData
})