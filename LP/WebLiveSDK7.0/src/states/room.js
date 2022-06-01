export const roomState = {
  access_token: null,
  initData: null,
  appHost: null,
  conString: null,
  heartbeatInterval: null,
  live: null,
  modules: null,
  plugin: null,
  rtmp: null,
  curUser: null,
  zhubo: null,
  user: null,
  title: null,
  websocket: null,
  cameraUrl: null,
  swfUrl: null,
  livingDuration: null,
  announce: null,
  flashvar: null,
  initEvent: null,
  modeType: null,
  livePlayerUrl: null,
  resConfig: null,
  robots: null,
  roomModules: null,
  course: null,
  userCamera: null,
  ext: null,
  online: null,

  // 初始化传入配置
  extConfig: {
    config: {
      filterChat: false
    },
    video: {}
  },
  // core.Store.globle展开下面属性
  curMode: 0, // 当前模式
  // data: null, // initData
  loopMode: 0, // 不断流模式
  liveState: 'wait', // 直播状态
  // 直播数据更新
  liveData: {
    liveId: 0,
    courseId: 0
  },
  whiteboard: {
    version: 0,
    curPage: 0,
    url: null
  },
  // 网页全屏时需要强制隐藏的元素 hack
  webFullScreenOther: []
}
