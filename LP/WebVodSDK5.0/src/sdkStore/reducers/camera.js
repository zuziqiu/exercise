import * as actionTypes from '../constants/actionTypes'
import cameraState from '../states/camera'
import { updateObject, createReducer } from '../utils'

const updateConfig = (state, { payload }) => {
  let updateObj = {}
  // 视频播放区高宽
  if (payload.width) {
    updateObj.cameraWidth = parseInt(payload.width)
  }
  if (payload.height) {
    updateObj.cameraHeight = parseInt(payload.height)
  }
  // 房间类型
  if (payload.playType) {
    updateObj.playType = payload.playType
  }
  // 播放器类型
  if (payload.pptPlayerType) {
    updateObj.pptPlayerType = payload.pptPlayerType
  }

  //视频播放类型
  if (payload.videoPlayType) {
    updateObj.videoPlayType = payload.videoPlayType
  }
  return updateObject(state, updateObj)
}

const updateCameraVideo = (state, { payload }) => {
  return updateObject(state, {
    cameraVideo: payload
  })
}

const updateCameraContainerId = (state, { payload }) => {
  return updateObject(state, {
    cameraContainerId: payload
  })
}

const updateCameraPlayerId = (state, { payload }) => {
  return updateObject(state, {
    cameraPlayerId: payload
  })
}
const updateCameraPlayer = (state, { payload }) => {
  return updateObject(state, {
    cameraPlayer: payload
  })
}

const updateCameraPlayStatus = (state, { payload }) => {
  return updateObject(state, {
    playStatus: payload
  })
}
const updateCameraH5Player = (state, { payload }) => {
  return updateObject(state, {
    h5Player: payload
  })
}
const updateCameraVolumeVal = (state, { payload }) => {
  return updateObject(state, {
    volumeVal: payload
  })
}
const updateCameraDurationTimmer = (state, { payload }) => {
  return updateObject(state, {
    durationTimmer: payload
  })
}
const updateCameraVideoURL = (state, { payload }) => {
  return updateObject(state, {
    videoUrl: payload
  })
}
const updateCameraCurrentDuration = (state, { payload }) => {
  return updateObject(state, {
    currentDuration: payload.currentDuration
  })
}

const updateCameraBn = (state, { payload }) => {
  return updateObject(state, {
    bn: payload
  })
}
const updateCameraBa = (state, { payload }) => {
  return updateObject(state, {
    ba: payload
  })
}
const updateCameraBx = (state, { payload }) => {
  return updateObject(state, {
    bx: payload
  })
}
const updateCameraDuration = (state, { payload }) => {
  return updateObject(state, {
    duration: payload
  })
}
const updateCameraSeekDuration = (state, { payload }) => {
  return updateObject(state, {
    seekDuration: payload
  })
}

const updateCameraTagName = (state, { payload }) => {
  return updateObject(state, {
    tagName: payload
  })
}
const updateCameraPlayBackRate = (state, { payload }) => {
  return updateObject(state, {
    playbackRate: payload
  })
}

export default createReducer(cameraState, {
  [actionTypes.UPDATE_CAMERA_CONFIG]: updateConfig,
  [actionTypes.UPDATE_CAMERA_VIDEO]: updateCameraVideo,
  [actionTypes.UPDATE_CAMERA_CONTAINER_ID]: updateCameraContainerId,
  [actionTypes.UPDATE_CAMERA_PLAYER_ID]: updateCameraPlayerId,
  [actionTypes.UPDATE_CAMERA_PLAYER]: updateCameraPlayer,
  [actionTypes.UPDATE_CAMERA_PLAY_STATUS]: updateCameraPlayStatus,
  [actionTypes.UPDATE_CAMERA_H5_PLAYER]: updateCameraH5Player,
  [actionTypes.UPDATE_CAMERA_VOLUME_VAL]: updateCameraVolumeVal,
  [actionTypes.UPDATE_CAMERA_DURATION_TIMMER]: updateCameraDurationTimmer,
  [actionTypes.UPDATE_CAMERA_VIDEO_URL]: updateCameraVideoURL,
  [actionTypes.UPDATE_CAMERA_CURRENT_DURATION]: updateCameraCurrentDuration,
  [actionTypes.UPDATE_CAMERA_BN]: updateCameraBn,
  [actionTypes.UPDATE_CAMERA_BA]: updateCameraBa,
  [actionTypes.UPDATE_CAMERA_BX]: updateCameraBx,
  [actionTypes.UPDATE_CAMERA_DURATION]: updateCameraDuration,
  [actionTypes.UPDATE_CAMERA_SEEK_DURATIOIN]: updateCameraSeekDuration,
  [actionTypes.UPDATE_CAMERA_TAG_NAME]: updateCameraTagName,
  [actionTypes.UPDATE_CAMERA_PLAY_BACK_RATE]: updateCameraPlayBackRate
})
