import { player } from '../states'
import { updateObject, createReducer } from '../utils'
import * as actionTypes from '../constants/actionTypes'

const updateVideoPlayerDom = (state, { payload }) => {
  return updateObject(state, {
    videoPlayer: payload
  })
}

const updateCameraPlayerDom = (state, { payload }) => {
  return updateObject(state, {
    cameraPlayer: payload
  })
}

const updateWhiteboardDom = (state, { payload }) => {
  return updateObject(state, {
    whiteboardPlayer: payload
  })
}

const updateFullScreenState = (state, { payload }) => {
  return updateObject(state, {
    isFullscreenFlag: payload
  })
}

export default createReducer(player, {
  [actionTypes.UPDATE_VIDEO_PLAYER_DOM]: updateVideoPlayerDom,
  [actionTypes.UPDATE_CAMERA_PLAYER_DOM]: updateCameraPlayerDom,
  [actionTypes.UPDATE_WHITEBOARD_DOM]: updateWhiteboardDom,
  [actionTypes.UPDATE_EXT_CONFIG]: updateFullScreenState
})
