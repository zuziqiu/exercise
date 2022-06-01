/**
 * ## 直播端Desktop模块
 * 不跟 desktop.js 共用
 */
// define(function (require) {
import map from "../utils/map"
import tools from "../utils/tools"
import core from './player.core'
import flvPlayer from './flv.player'
import hlsPlayer from './hls.player'
import mediaCore from './mediaCore'
import playerEvent from './player.event'

// Execute
var desktop = {
  player: null,
  // 桌面分享媒体初始化状态
  playStatus: 'stop',
  videoPlayType: '',
  durationTimmer: null,
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
  // 开始
  startDurationTimmer: function () {
    var that = this;
    if (!that.durationTimmer) {
      // 如果在sdk里面
      if (tools.isMobileSDK()) {
        // todo..
      } else {
        var element = this.getPlayer();
        that.durationTimmer = setInterval(function () {
          if (element.currentTime) {
            that.currentTime = element.currentTime();
            if (core.playType === 'live') {
              schedule.setPlayDuration(that.currentTime);
            }
            if (that.currentTime >= that.duration) {
              that.stopDurationTimmer();
            }
          }
        }, 200);
      }
    }
  },
  // 停止
  stopDurationTimmer: function () {
    if (this.durationTimmer) {
      clearInterval(this.durationTimmer);
      this.durationTimmer = null;
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
    var videoUrl = "",
      that = this;

    // 直播
    if (core.playType === "live") {
      // 保存path
      tools.debug('Desktop / Video on Start...')
      mediaCore.emit('video:player')
    }
    map.get('live:desktop:start')(that.playStatus);
  },

  // 设置媒体播放状态
  setMeidaPlayStatus: function (state) {
    var that = this;
    // tools.debug("desktop play state ===> " + state);
    that.playStatus = state;
    core.playStatus = state;
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
        map.get('live:video:timeout')(that.bx);
      }
      that.waitLastTime = _nowTime;
    }
  },
  // 执行
  fire: function () {
    this.play()
    core.playStatus = "playing";
  },
  // @触发条件
  // @1 => 从vod.player触发
  // @2 => 直接点击视频控件
  play: function () {
    tools.debug('desktop playing.', this.player);
    // 防止多次触发该方法
    this.setMeidaPlayStatus("playing")
    map.get('live:desktop:play')()
    map.get("live:camera:play")()
  },
  // 暂停
  pause: function (command) {
    tools.debug('desktop pause.');
    if (this.player) {
      this.player.pause();
    }
    this.setMeidaPlayStatus("pause");
    map.get('live:desktop:pause')();
  },
  // 停止
  stop: function (command) {
    tools.debug('desktop call stop!');
    this.seekDuration = null;
    if (this.player) {
      this.player.pause();
    }
    map.get('live:desktop:stop')();
    this.setMeidaPlayStatus("ended");
    this.stopDurationTimmer();
    // this.destroy()
  }
};
// window.__desktop = desktop;
// return desktop;
export default desktop
// });