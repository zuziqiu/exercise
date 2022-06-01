
/**
 * 模拟vuex响应
 */
export default {
  // token
  token: null,
  // 初始化传入配置
  extConfig: {
    config: {
      whiteboardVersion: '2.5.8',
      playIcon: true, // 播放按钮功能
      history: true // 记忆播放功能
    },
    video: {}
  },
  // 全局
  global: {
    curMode: null,
    data: null,
    liveData: {
      liveId: 0,
      courseId: 0
    }
  },
  // 播放器
  player: {
    techOrder: null,
    status: null,
    withUi: false,
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
    // mainPlayer: {
    //   wrapContainer: null,
    //   playerId: null
    // }
  },
  // 视频
  video: {
    poster: null,
    autoplay: true,
    controls: false
  }
}