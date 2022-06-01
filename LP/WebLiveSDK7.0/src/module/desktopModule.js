import tools from "../utils/tools"
import mediaControler from '../core/mediaControler'
import { eventStore } from '../eventStore'
import { sdkAction } from '../action'
import { sdkStore } from "../states"
import * as TYPES from '../action/action-types'
import { lifeCycle } from '../core/lifeCycle'

// Execute
let desktop = {
  player: null,
  // 桌面分享媒体初始化状态
  playStatus: 'stop',
  videoPlayType: '',
  currentTime: 0,
  currentDuration: 0, // 视频当前时间点
  bn: 0, //本次统计周期内卡顿次数
  ba: 0, //总卡顿次数
  bx: 0, //卡顿换源用到的卡顿数
  waitLastTime: 0, //上次卡顿统计时间
  desktopVideoDom: null,
  // 配置类型
  config: function (options) {
    if (options.videoPlayType) {
      this.videoPlayType = options.videoPlayType;
    }
  },
  // 声音
  volume: function (volume) {
    tools.debug("volume setting..", volume);
    if (this.player) {
      this.player.volume(volume);
    }
  },
  // 桌面分享开始
  start: function (command) {
    if (!command.c) {
      return;
    }
    tools.debug("desktop start: ===>", command);
    // 保存path
    tools.debug('Desktop / Video on Start...')
    mediaControler.emit('video:player')
    // }
    // 桌面分享媒体初始化状态
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'stop'
      }
    })
    // eventStore.emit('live:desktop:start', that.playStatus)
    eventStore.emit('live:desktop:start', sdkStore.media.player.status)
  },

  changeSource: 0,
  setWaitingTimes: function (_nowTime) {
    var that = this;

    if (_nowTime - that.waitLastTime >= 1) {
      that.bn += 1;
      that.ba += 1;
      if (that.bx < 15) {
        that.bx += 1;
      } else {
        that.bx = 0;
        that.changeSource = 1;
        eventStore.emit('live:video:timeout', that.bx)
      }
      that.waitLastTime = _nowTime;
    }
  },
  // 执行
  fire: function () {
    this.play()
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'playing'
      }
    })
  },
  // @触发条件
  // @1 => 从vod.player触发
  // @2 => 直接点击视频控件
  play: function () {
    tools.debug('desktop playing.', this.player);
    // 防止多次触发该方法
    // this.setMeidaPlayStatus("playing")
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'playing'
      }
    })
    eventStore.emit('live:desktop:play')
    eventStore.emit('live:camera:play')
  },
  // 暂停
  pause: function (command) {
    tools.debug('desktop pause.');
    if (this.player) {
      this.player.pause();
    }
    // this.setMeidaPlayStatus("pause");
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'pause'
      }
    })
    eventStore.emit('live:desktop:pause')
  },
  // 停止
  stop: function (command) {
    tools.debug('desktop call stop!');
    this.seekDuration = null;
    if (this.player) {
      this.player.pause();
    }
    eventStore.emit('live:desktop:stop')
    // this.setMeidaPlayStatus("ended");
    sdkAction.dispatch('media', {
      type: TYPES.UPDATE_MEDIA_STATUS,
      payload: {
        status: 'ended'
      }
    })
  },
  // 执行video方法
  videoRun: function () {
    mediaControler.emit('video:player')
    // 触发视频播放/桌面分享生命周期函数
    lifeCycle.lifeControler['createdVideoPlayer']?.next()
  },
};
window.__desktop = desktop;
// return desktop;
export default desktop
// });