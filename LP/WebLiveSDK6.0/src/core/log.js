/**
 * 直播/点播(统计参数)
    * pt:2 // 2:点播 1:直播
    * pl:1 // 是否播放中
    * pn:1 // 日志计数
    * 
    * ctype:5 // 点播 专辑 剪辑 直播
    * 
    * 逻辑：
    * 1、初始化进入直播间未上课不发统计
    * 2、下课后不发统计
    * 3、上课过程中发统计
    * 
*/

// define(function (require) {
import STATIC from './mt.static'
import tools from '../utils/tools'
import state from './store/state'
import network from './network'
import store from './store'

const log = {
  LOG_HOST: 'https://log.talk-fun.com',
  baseHost: 'log.talk-fun.com',
  logGroup: null, // CDN序列组
  retryList: [], // 错误队列
  lock: false, // 测试锁
  reTimer: null, // 重试timer
  srcUrl: null,
  targetIndex: 0, // 目标CDN域名
  sdkVersion: null,
  loggerRunnerTimer: null, // runTimer
  // 资源logger队列
  loggerTypeList: [],
  // 默认
  setBaseParam: function (obj) {
    if (obj.sdkVersion) {
      this.sdkVersion = obj.sdkVersion
    }
    if (obj.srcUrl) {
      this.srcUrl = window.encodeURIComponent(obj.srcUrl);
    }
  },
  // 消息开关
  init: function (logConf, hostGroup) {
    this.logConfig = logConf;
    this.logGroup = tools.getHostGroup(this.baseHost, hostGroup);
    this.LOG_HOST = STATIC.PROTOCOL + this.logGroup[this.targetIndex];
  },
  // 重试逻辑
  // 从临时数组取出数据，将错误的数据进行重试
  doRetry: function (errHost, newHost) {
    if (this.retryList.length > 0) {
      if (!this.reTimer) {
        this.reTimer = setInterval(() => {
          let target = this.retryList.splice(0,1)
          // target.url = target.url.replace(this.LOG_HOST, host)
          target[0].url = target[0].url.replace(errHost, newHost)
          tools.debug('Log重新发送 ==>', target[0].url)
        }, 1500)
      }
    }
  },
  // 寻找下一个CDN节点
  logChangeHost: function () {
    if (!this.lock && this.logGroup) {
      this.lock = true
      this.targetIndex += 1
      if (this.targetIndex > this.logGroup.length - 1) {
        this.targetIndex = 0
      }
      let errHost = this.LOG_HOST
      let newHost = STATIC.PROTOCOL + this.logGroup[this.targetIndex]
      this.LOG_HOST = newHost
      // this.doRetry(errHost, newHost)
    }
  },
  // log加载错误
  // 推送错误数据到临时数组
  onError: function (type, param, obj) {
    tools.debug('Log加载错误 ==>', obj.url)
    this.logChangeHost()
    this.logDispatcher(type, param)
  },
  // logger分发器
  logDispatcher: function (type, params) {
    tools.debug('logger on added ==>', type, params)
    if (this.loggerTypeList) {
      this.loggerTypeList.push({type: type, data: params})
    }
    // 控制50条阀值
    if (this.loggerTypeList.length > 50) {
      this.loggerTypeList = this.loggerTypeList.slice(0, 50)
    }
    this.loggerRunner()
  },
  // 定时发送logger
  loggerRunner: function () {
    if (!this.loggerRunnerTimer) {
      this.loggerRunnerTimer = setInterval(() => {
        let loggerInfo = this.loggerTypeList.shift(0, 1)
        if (loggerInfo) {
          this.post(loggerInfo.type, loggerInfo.data)
        }
      }, 1500)
    }
  },
  // 发送
  post: function (type, params) {
    // console.warn(this.loggerTypeList)
    tools.debug('Post Statis on ==>', type, params)
    let url = type === 'error' ? this.LOG_HOST + '/stats.html' : this.LOG_HOST + `/stats/${type}.html`
    tools.ajax({
      type: 'GET',
      url: url,
      data: params,
      error: function (res) {
        // log.onError(res)
        log.onError(type, params, res)
      }
    });
  },
  // 销毁
  destroy: function () {
    tools.debug('logger on destroy.')
    if (this.loggerRunnerTimer) {
      clearInterval(this.loggerRunnerTimer)
      this.loggerRunnerTimer = null
      this.loggerTypeList = []
    }
  },
  // 资源错误
  res: function (url, mediaType, type = 'error') {
    var room = tools.getRoom() || { user: {} }
    var store = state
    var postData = {
      cid: store.global.liveData.liveId || 0,
      type: 4,
      pid: room.user.pid || 0,
      rid: room.user.roomid || 0,
      xid: room.user.xid || 0,
      url: window.encodeURIComponent(url),
      resType: mediaType,
      errorType: type,
      host: url.split('/')[2]
    }
    this.logDispatcher('res', postData)
    // return tools.ajax({
    //   type: 'GET',
    //   url: this.LOG_HOST + '/stats/res.html',
    //   data: postData,
    //   error: function (res) {
    //     log.onError(res)
    //   }
    // })
  },
  // socket 请求
  socket: function (params) {
    // 当 log = true 发送请求
    if (this.logConfig && this.logConfig.socket) {
      let room = tools.getRoom() || { user: {} }
      let postData = {
        uid: room.user.uid || 0,
        pid: room.user.pid || 0,
        rid: room.user.roomid || 0,
        xid: room.user.xid || 0
      }
      Object.assign(params, postData)
      this.logDispatcher('socket', params)
    }
  },
  // 播放统计
  play: function (params) {
    if (this.sdkVersion) {
      params.sdkVersion = this.sdkVersion
    }
    if (this.srcUrl) {
      params.srcUrl = this.srcUrl
    }
    // this.loggerTypeList['play'].push(params)
    this.logDispatcher('play', params)
  },
  // js Error
  errorReport: function (params) {
    if (typeof access_token != 'undefined') {
      params.access_token = access_token;
    }
    var that = this
    params.__type = 'jserror';
    this.logDispatcher('error', params)
  }
};
// exprose
// return log;
var reportMsgs = {};
window.addEventListener('error', () => {
  var types = ['Error', 'Script', 'Line', 'Column', 'StackTrace'];
  var errorMsg = '';
  var maxArgs = arguments.length;
  if (maxArgs > 5) {
    maxArgs = 5;
  }
  for (var i = 0; i < maxArgs; i++) {
    errorMsg = errorMsg + '|' + types[i] + ': ' + arguments[i];
  }
  var params = {
    type: 'JS-ERROR-LOG',
    msg: errorMsg,
  }
  if (typeof reportMsgs[params.msg] === 'undefined') {
    log.errorReport(params);
    reportMsgs[params.msg] = 1;
  }
}, false)
// window.__log = log
export default log
// });