// import tools from "../common/utils/tools"
// import core from './player.core'
let cmdSchedule = {

  initDuration: 0,         //服务器初始化时间
  playDuration: 0,         //播放的时间
  delayDuration: 7,        //延迟时间
  cmdDelay: 7,            //固定延迟时间
  wbjobs: [],
  sdkjobs: [],
  wbTimmer: null,
  sdkTimmer: null,
  wblock: false,
  sdklock: false,
  // 执行任务
  run: function ({ type }) {
    var that = this;
    if (type == 'wb') {
      that.wblock = false;
      if (that.wbjobs.length > 0) {
        if (!that.wbTimmer) {
          that.wbTimmer = setInterval(function () {
            if (that.wblock) {
              return;
            }
            for (var i = 0, len = that.wbjobs.length; i < len; i++) {
              // 没数据直接退出
              if (!that.wbjobs[i]) {
                break;
              }
              that.fire(that.wbjobs.shift());
            }
          }, 200);
        }
      }
    }
    if (type == 'sdk') {
      that.sdklock = false;
      if (that.sdkjobs.length > 0) {
        if (!that.sdkTimmer) {
          that.sdkTimmer = setInterval(function () {
            if (that.wblock) {
              return;
            }
            for (var i = 0, len = that.sdkjobs.length; i < len; i++) {
              // 没数据直接退出
              if (!that.sdkjobs[i]) {
                break;
              }
              that.fire(that.sdkjobs.shift());
            }
          }, 200);
        }
      }
    }
  },
  // 增加延时任务队列
  addSchedule: function ({ callback, position, type }) {
    var packet = {
      callback: callback
    };
    if (type == 'wb') {
      if (position && position === 'top') {
        this.wbjobs.unshift(packet);
      } else {
        this.wbjobs.push(packet);
      }
    } else {
      if (position && position === 'top') {
        this.sdkjobs.unshift(packet);
      } else {
        this.sdkjobs.push(packet);
      }
    }
  },
  // 清除任务
  clearSchedule: function () {
    this.wbjobs = [];
  },
  pause: function () {
    if (this.wbTimmer) {
      clearInterval(this.wbTimmer);
      this.wbTimmer = null;
    }
    this.wblock = true;
  },
  stop: function () {
    // this.initDuration = 0;
    // this.delayDuration = 0;
    // this.setPlayDuration(0);
    // this.clearSchedule();
  },
  // 执行命令
  fire: function (job) {
    if (job.callback && typeof (job.callback) === "function") {
      job.callback();
    }
  }
};

export default cmdSchedule