import * as actionTypes from '../constants/actionTypes'
import { updateObject, createReducer } from '../utils'
import videoState from '../states/video'

// const updateVideoPlayerDom = (state, { payload }) => {
//   return updateObject(state, {
//     videoPlayer: payload
//   })
// }
const updateVideoContainerId = (state, { payload }) => {
  return updateObject(state, {
    videoContainerId: payload.containerId
  })
}
const updateVideoPlayerId = (state, { payload }) => {
  return updateObject(state, {
    playerId: payload.playerId
  })
}
const updateVideoPlayStatus = (state, { payload }) => {
  return updateObject(state, {
    playStatus: payload.playStatus
  })
}
export default createReducer(videoState, {
  [actionTypes.UPDATE_VIDEO_CONTAINER_ID]: updateVideoContainerId,
  [actionTypes.UPDATE_VIDEO_PLAYER_ID]: updateVideoPlayerId,
  [actionTypes.UPDATE_VIDEO_PLAY_STATUS]: updateVideoPlayStatus
})
