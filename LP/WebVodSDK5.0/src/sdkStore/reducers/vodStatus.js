import * as actionTypes from '../constants/actionTypes'
import { vodStatus as vodStatusState } from '../states'
import { updateObject, createReducer } from '../utils'

export const updatePlayStatus = (state, action) => {
  return updateObject(state, {
    playStatus: action.payload.playStatus
  })
}

export const updateSeekStatus = (state, action) => {
  return updateObject(state, {
    seekStatus: action.payload.seekStatus
  })
}

export const updateCurrentTime = (state, action) => {
  return updateObject(state, {
    currentTime: action.payload.currentTime
  })
}

export const updateTotalTime = (state, action) => {
  return updateObject(state, {
    totalTime: action.payload.totalTime
  })
}

const updateCameraShouldDo = (state, { payload }) => {
  return updateObject(state, {
    cameraShouldDo: payload.cameraShouldDo
  })
}

export default createReducer(vodStatusState, {
  [actionTypes.UPDATE_PLAY_STATUS]: updatePlayStatus,
  [actionTypes.UPDATE_SEEK_STATUS]: updateSeekStatus,
  [actionTypes.UPDATE_CURRENT_TIME]: updateCurrentTime,
  [actionTypes.UPDATE_TOTAL_TIME]: updateTotalTime,
  [actionTypes.UPDATE_CAMERA_SHOULD_DO]: updateCameraShouldDo
})
