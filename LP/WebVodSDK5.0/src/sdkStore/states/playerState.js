/*
 * 这里是播放器模块的state
 */
export default {
  techOrder: null,
  status: null,
  withUi: false,
  isFullscreenFlag: false,
  whiteboardPlayer: {
    wrapContainer: null,
    playerId: null,
    vodCallback: null
  },
  videoPlayer: {
    wrapContainer: null,
    playerId: null,
    vodCallback: null
  },
  cameraPlayer: {
    wrapContainer: null,
    playerId: null,
    vodCallback: null
  }
}
