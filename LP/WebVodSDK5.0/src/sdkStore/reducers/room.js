import * as actionTypes from '../constants/actionTypes'
import room from '../states/room'
import { updateObject, createReducer } from '../utils'

const updateExtConfig = (state, action) => {
  return updateObject(state, {
    extConfig: action.payload
  })
}

const updateToken = (state, action) => {
  return updateObject(state, {
    access_token: action.payload
  })
}

export default createReducer(room, {
  [actionTypes.UPDATE_EXT_CONFIG]: updateExtConfig,
  [actionTypes.UPDATE_TOKEN]: updateToken
})
