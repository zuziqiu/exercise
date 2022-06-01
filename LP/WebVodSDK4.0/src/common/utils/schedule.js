/*=============================================================================
#     FileName: schedule.js
#         Desc: 任务队列
#       Author: lee
#        Email: luoliuyou@aipai.com
#        Phone: 13602436266
#     HomePage: http://www.weibo.com/myskynet
#      Version: 0.0.1
#   LastChange: 2015-05-30 12:31:49
#      History:
=============================================================================*/
define(function (require) {
  var tools = require('./tools');
  var schedule = {
    LAST_LIVE_TIME: -1, // 服务器开始推流的时间
    initDuration: 0, //服务器初始化时间
    playDuration: 0, //播放的时间
    delayDuration: 0, //延迟时间
    cmdDelay: 0, //固定延迟时间
    baseDuration: 0, //基线时间
    jobs: [],
    timmer: null,
    lock: false,
    // 设置时间点
    setPlayDuration: function (duration) {
      if (duration >= 0) {
        this.playDuration = duration;
        //TODO:记住时间点
        if (window.localStorage) {
          try {
            localStorage.setItem("playDuration", duration);
          } catch (err) {
            tools.debug("playDuration error: 不支持locaStorage");
          }
        }
      }
    },
    // disposetime 更新
    setDisposeTime: function (disposeTime) {
      if (this.LAST_LIVE_TIME > 0) {
        this.baseDuration = (this.LAST_LIVE_TIME + disposeTime) - this.cmdDelay
      }
      if (!this.setDisTimer) {
        this.setDisTimer = setInterval(function () {
          this.baseDuration += 1
        }.bind(this), 1000);
      }
    },
    // 增加延时任务队列
    addSchedule: function (starttime, command, callback, position) {
      var packet = {
        st: starttime,
        command: command,
        callback: callback
      };
      if (position && position === 'top') {
        this.jobs.unshift(packet);
      } else {
        this.jobs.push(packet);
      }
    },
    // 清除任务
    clearSchedule: function () {
      this.jobs = [];
    },
    // 执行任务
    run: function (playType) {
      tools.debug('涂鸦队列开启...')
      this.playType = playType || "live";
      this.lock = false;
      var that = this;
      if (!this.timmer) {
        var that = this;
        var cmd;
        if (!this.timmer) {
          function scheduleRunner() {
            this.timmer = setTimeout(function () {
              if (this.lock) {
                return;
              }
              if (that.jobs.length > 0) {
                for (var i = 0, len = that.jobs.length; i < len; i++) {
                  cmd = that.jobs[i];
                  // 指令执行规则: 
                  // 指令开始时间 <= (服务器初始化时间 + 当前视频播放时间 - 固定延迟)
                  // (|| 本地时间－服务器命令接收时间 > 5秒)
                  // tools.debug("schedule===>"+cmd.st, playType);
                  /*if(cmd.st <= (that.initDuration + that.playDuration - that.delayDuration) || (typeof cmd.command.receiveTime !== 'undefined' && tools.now() - cmd.command.receiveTime > 5)){
                      that.fire(that.jobs.shift());
                  }*/
                  // 没数据直接退出
                  if (!cmd) {
                    break;
                  }
                  // 点播
                  if (playType === "playback") {
                    if (cmd.st <= ((that.initDuration + that.playDuration) - that.delayDuration)) {
                      that.fire(that.jobs.shift());
                    } else {
                      break;
                    }
                  }
                  // 直播最大延迟5秒
                  else if (playType === "live") {
                    // 指令时间 <= (初始化时间 + 视频本地播放时间) - 固定延迟时间
                    // console.warn(cmd)
                    // console.warn(cmd.st, that.baseDuration)
                    // @条件1 => 服务器指令发送时间 <= (服务器初始化时间 + 本地视频播放时间) - 大致固定延迟时间
                    // @条件2 => 现在时间(s) - 服务器返回时间(s) > 固定延迟时间PHP返回
                    // HLS
                    // if (cmd.st && cmd.st <= ((that.initDuration + that.playDuration) - that.delayDuration) || (typeof cmd.command.receiveTime !== 'undefined' && tools.now() - cmd.command.receiveTime > that.cmdDelay)) {
                    // flv 格式可使用以下配置(使用disposeTime)
                    if (cmd.st && cmd.st <= that.baseDuration) {
                      that.fire(that.jobs.shift());
                      // log...
                      tools.debug("schedule ===> cmd.st:" + cmd.st + " initDuration:" + that.initDuration + " playDuration:" + that.playDuration + "delayDuration:" + that.delayDuration + " now:" + tools.now() + " cmdDelay ==> " + that.cmdDelay);
                    } else {
                      break;
                    }
                  }
                }
              }
              scheduleRunner();
            }, 200);
          }
          scheduleRunner();
        }
      }
    },
    // 暂停
    pause: function () {
      if (this.timmer) {
        clearTimeout(this.timmer)
        this.timmer = null
      }
      if (this.setDisTimer) {
        clearInterval(this.setDisTimer)
        this.setDisTimer = null
      }
      this.lock = true;
    },
    // 停止
    stop: function () {
      this.initDuration = 0;
      this.delayDuration = 0;
      this.setPlayDuration(0);
      this.pause();
      this.clearSchedule();
    },
    // 执行命令
    fire: function (job) {
      if (job.callback && typeof (job.callback) === "function") {
        job.callback(job.command);
      }
    }
  };

  window.schedule = schedule;
  return schedule;
});