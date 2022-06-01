export const roomState = {
  // DrawId 每次涂鸦自增
  drawId: 1,
  pageBase: 10002,
  // mode: 'WHITEBOARD', //WHITEBOARD or PPT
  roomType: '1', //房间模式
  pptType: 0, // 0=>普通PPT，1=>动画PPT
  setPageData: {}, //翻页数据
  powerEnable: true,
  // 是否开启刷新按钮
  reload: false, 
  // 给service模块请求数据用的token
  token: null,
  version: '3.0.5', //版本号
  curUser: null,
  // 画板id
  wbContainerId: null,
  // debug模式
  debugMode: 'false',
  gifSwitch: 0
}