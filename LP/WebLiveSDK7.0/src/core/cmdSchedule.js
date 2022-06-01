import tools from '../utils/tools'
import { sdkStore } from '../states'
import { eventStore } from '../eventStore'
// cmdSchedule
let cmdSchedule = {
  LAST_LIVE_TIME: -1, // 服务器开始推流的时间
  MAX_CMD_DURATION: 15, //指令最大延迟
  initDuration: 0, //服务器初始化时间
  playDuration: 0, //播放的时间
  delayDuration: 0, //延迟时间
  timeupdate: 0, // timeupdate
  cmdDelay: 0, //固定延迟时间
  baseDuration: 0, //基线时间
  curPlayDuration: 0, // 当前播放时间(直播时间轴)
  jobs: [],
  timmer: null,
  lock: false,
  timeType: null, // 时间标志
  // 设置参数
  set(key, val) {
    tools.debug('cmdSchedule set ==> ', key, val)
    if (this.hasOwnProperty(key)) {
      this[key] = val
    } else {
      tools.warn(key + 'is Not definded!')
    }
  },
  // 监听
  on(eventName, payload) {
    tools.debug('cmdSchedule on event ==>', eventName, payload)
    switch (eventName) {
      case 'media:destroy':
        if (payload === 'global') {
          let state = sdkStore.room.liveState
          // 如果不在直播,不需要进行监听
          if (state !== 'start') {
            this.stop()
          }
        }
        break
      default:
        break
    }
  },
  // 103时间设置
  // setLastLiveTime (time) {
  //   this.LAST_LIVE_TIME = time
  // },
  // 设置时间点
  setPlayDuration: function (duration) {
    if (duration >= 0) {
      this.playDuration = parseInt(duration)
      this.updatePlayDuration(this.playDuration)
    }
  },
  // 计算延迟时间
  setDelayTime: function (timeObj) {
    let that = this
    var disposeTime = 0;
    // 推流时间叠加
    // 如果有 SEI 优先使用 废弃 onTextData
    if (this.timeType === 'SEI' || timeObj.type === 'SEI') {
      // disposeTime ==> 更新本地基础时间
      disposeTime = timeObj.disposeTime
      this.setDisposeTime(disposeTime)
    } else {
      disposeTime = timeObj.disposeTime + this.LAST_LIVE_TIME
      this.setDisposeTime(disposeTime)
    }
    tools.debug('cmdDelay ==>', that.cmdDelay)
    tools.debug('disposeTime ==>', disposeTime)
    return that.cmdDelay
  },
  // disposetime更新 => 更新基线时间[目前只有flv有]
  setDisposeTime: function (disposeTime) {
    // 推流st时间 + disposeTime
    if (this.LAST_LIVE_TIME >= 0) {
      // 更新基线时间
      this.baseDuration = Number(disposeTime)
      this.timeupdate = 0
    }
  },
  // 更新当前时间轴(由 [video => timeupdate] 更新)
  // hls => 直接减延迟
  updatePlayDuration: function (videoTimeupdate) {
    this.autoUp()
  },
  // 自计时
  autoUp: function (timeUpdate) {
    if (!this.setDisTimer) {
      this.setDisTimer = setInterval(() => {
        this.timeupdate += 1
        this.curPlayDuration = this.baseDuration + this.timeupdate
        eventStore.emit('live:time', this.curPlayDuration)
        tools.long('this.curPlayDuration==>', this.curPlayDuration, 'Sei/Dispose==>', this.baseDuration)
      }, 1000)
    }
  },
  // 重置
  reset: function () {
    tools.debug('cmdSchedule on reset...')
    this.timeupdate = 0
    this.curPlayDuration = 0
    this.playDuration = 0
    this.initDuration = 0
    this.baseDuration = 0
    this.cmdDelay = 0
  },
  // 获取当前直播时间
  getCurLiveTime: function () {
    return this.curPlayDuration
  },
  // 增加延时任务队列
  addSchedule: function (starttime, command, callback, position) {
    var packet = {
      st: starttime,
      command: command,
      callback: callback
    };
    tools.debug('cmdSchedule add ==>', command);
    if (position === 'top') {
      this.jobs.unshift(packet);
    } else {
      this.jobs.push(packet);
    }
    return Promise.resolve(packet)
  },
  // 清除任务
  clearSchedule: function () {
    this.jobs = [];
  },
  // 执行任务
  run: function () {
    // tools.debug('涂鸦队列开启...')
    // this.playType = playType || "live";
    this.lock = false;
    var that = this;
    var cmd;
    if (!this.timmer) {
      tools.debug('cmdSchedule start run cmd...')
      function scheduleRunner() {
        that.timmer = setInterval(function () {
          if (this.lock) {
            return;
          }
          if (that.jobs.length > 0) {
            for (var i = 0, len = that.jobs.length; i < len; i++) {
              cmd = that.jobs[i];
              // 没数据直接退出
              if (!cmd) {
                break;
              }
              // if (playType === "live") {
              // 指令时间 <= (初始化时间 + 视频本地播放时间) - 固定延迟时间
              // @条件1 => 服务器指令发送时间 <= (服务器初始化时间 + 本地视频播放时间) - 大致固定延迟时间
              // @条件2 => 现在时间(s) - 服务器返回时间(s) > 固定延迟时间PHP返回

              // ## 延迟计算方法：
              // [1]计算流媒体到本地时间延迟差(cmdDelay)
              // [2]设置最大延迟不能超过 MAX_CMD_DURATION
              if ((tools.now() - cmd.command.receiveTime) >= that.cmdDelay || tools.now() - cmd.command.receiveTime > that.MAX_CMD_DURATION) {
                that.fire(that.jobs.shift());
                // Logger..
                tools.debug("cmdSchedule ===> cmd.st:" + cmd.st + " initDuration:" + that.initDuration + " playDuration:" + that.playDuration + "delayDuration:" + that.delayDuration + " now:" + tools.now() + " cmdDelay ==> " + that.cmdDelay);
              } else {
                break;
              }
              // }
            }
          }
        }, 200);
      }
      scheduleRunner();
    }
  },
  // 暂停
  pause: function () {
    // 队列时间
    if (this.timmer) {
      clearInterval(this.timmer)
      this.timmer = null
    }
    // dispose自动计时
    if (this.setDisTimer) {
      clearInterval(this.setDisTimer)
      this.setDisTimer = null
    }
    this.lock = true;
  },
  // 停止
  stop: function () {
    tools.debug('cmdSchedule on stop...')
    this.initDuration = 0;
    this.delayDuration = 0;
    this.setPlayDuration(0);
    this.pause();
    this.clearSchedule();
    this.reset()
  },
  // 执行命令
  fire: function (job) {
    if (job.callback && typeof (job.callback) === "function") {
      job.callback(job.command);
    }
  }
};

// return cmdSchedule;
export default cmdSchedule