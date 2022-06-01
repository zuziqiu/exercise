/**
 * State数据
 */
const state = {
  api: {
    host: window.apiHost || 'open.talk-fun.com'
  },
  // token
  token: null,
  // 初始化传入配置
  extConfig: {
    config: {
      whiteboardVersion: null,
      filterChat: false,
    },
    video: {}
  },
  // 全局
  global: {
    curMode: 0, // 当前模式
    data: null, // initData
    loopMode: 0, // 不断流模式
    liveState: 'wait', // 直播状态
    // 直播数据更新
    liveData: {
      liveId: 0,
      courseId: 0
    }
  },
  // 画板
  whiteboard: {
    version: 0,
    curPage: 0,
    url: null
  },
  // 播放器
  player: {
    techOrder: null,
    status: null,
    withUi: false,
    isFullScreen: false, // 全屏
    media: {
      wrapContainer: null,
      playerId: null
    },
    camera: {
      wrapContainer: null,
      playerId: null
    },
    video: {
      wrapContainer: null,
      playerId: null
    },
    whiteboard: {
      wrapContainer: null,
      playerId: null
    }
  },
  // 视频
  video: {
    poster: null,
    autoplay: true,
    controls: false
  }
}

export default state
