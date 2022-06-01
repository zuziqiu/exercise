import * as actionTypes from '../constants/actionTypes'
import { media as mediaState } from '../states'
import { updateObject, createReducer } from '../utils'

const updateMediaDataArray = (state, action) => {
  return updateObject(state, {
    mediaDataArray: action.payload.mediaDataArray
  })
}
const updateMediaUrl = (state, action) => {
  return updateObject(state, {
    mediaUrl: action.payload.mediaUrl
  })
}
export default createReducer(mediaState, {
  [actionTypes.UPDATE_MEDIA_DATA_ARRAY]: updateMediaDataArray,
  [actionTypes.UPDATE_MEDIA_URL]: updateMediaUrl
})
