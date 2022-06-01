import tools from "@tools"
import core from './player.core'
let schedule = {

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
  // socket 执行 whiteBoard
  // eventBus: function (command, callback) {
  //   var that = this;

  //   // 设置直播标题
  //   if (!command) {
  //     return;
  //   }

  //   try {
  //     if (command instanceof Array) {
  //       for (var i = 0; i < command.length; i++) {
  //         var commands = JSON.parse(command[i])
  //         if (
  //           commands.t == core.COMMAND.PAGE
  //           || commands.t == core.COMMAND.DRAW
  //           || commands.t == core.COMMAND.LINE
  //           || commands.t == core.COMMAND.DOTTED_LINE
  //           || commands.t == core.COMMAND.ARROW
  //           || commands.t == core.COMMAND.CIRCLE
  //           || commands.t == core.COMMAND.RECTANGLE
  //           || commands.t == core.COMMAND.TEXT
  //           || commands.t == core.COMMAND.DRAW_LIST
  //           || commands.t == core.COMMAND.GRAFFITI
  //           || commands.t == core.COMMAND.IMAGE
  //         ) {
  //           commands.receiveTime = tools.now();
  //           schedule.addSchedule(commands.st, commands, function (commands) {
  //             typeof callback === 'function' && callback(commands)
  //           });
  //         }
  //       }
  //     } else {
  //       if (
  //         command.t == core.COMMAND.PAGE
  //         || command.t == core.COMMAND.DRAW
  //         || command.t == core.COMMAND.LINE
  //         || command.t == core.COMMAND.DOTTED_LINE
  //         || command.t == core.COMMAND.ARROW
  //         || command.t == core.COMMAND.CIRCLE
  //         || command.t == core.COMMAND.RECTANGLE
  //         || command.t == core.COMMAND.TEXT
  //         || command.t == core.COMMAND.DRAW_LIST
  //         || command.t == core.COMMAND.GRAFFITI
  //         || command.t == core.COMMAND.IMAGE
  //       ) {
  //         command.receiveTime = tools.now();
  //         schedule.addSchedule(command.st, command, function (command) {
  //           typeof callback === 'function' && callback(command)
  //         });
  //       }
  //     }
  //   } catch (e) {
  //     console.error('schedule ==> ', e)
  //   }
  // },
  // updateDelay: function (data) {
  //   let that = this
  //   let disposeTime = 0
  //   if (live.liveTime && live.liveTime.disposeTime > 1) {
  //     disposeTime = Number(live.liveTime.disposeTime) + Number(data.disposeTime)
  //   } else {
  //     disposeTime = data.disposeTime
  //   }
  //   if (live.liveTime && live.liveTime.time - data.disposeTime) {
  //     that.cmdDelay = live.liveTime.time - (disposeTime - (data.buffered - data.curTime)) + 1
  //   }
  //   // console.error(live.liveTime, data.disposeTime, data.buffered, data.curTime, that.cmdDelay)
  // },
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

export default schedule