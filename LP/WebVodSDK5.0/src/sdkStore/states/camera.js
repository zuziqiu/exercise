export default {
  tagName: 'video',
  cameraVideo: null,
  cameraContainerId: null,
  cameraPlayerId: null,
  playType: 'live',
  pptPlayerType: 'html5',
  videoPlayType: '',
  playStatus: 'stop', // 摄像头的状态
  // 原生播放器
  h5Player: null,
  volumeVal: 100,
  cameraWidth: 280,
  cameraHeight: 210,
  durationTimmer: null,
  videoUrl: null,
  duration: null,
  currentDuration: 0, //摄像头视频当前时间点
  stream: [], //原生点播流
  bn: 0, //本次统计周期内卡顿次数
  ba: 0, //总卡顿次数
  bx: 0, //卡顿换源用到的卡顿数
  waitLastTime: 0, //上次卡顿统计时间
  seekDuration: null,
  playbackRate: null
}
