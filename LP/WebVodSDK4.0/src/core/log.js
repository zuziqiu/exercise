/**
 * 直播/点播(统计参数)
    * cid:1274210 // init取到
    * type: play/pause/sotp
    * xid: 455423 
    * rid: 10021
    * uid: 1A841CB11AECE9C4
    * pid: 20
    * pf: html

    * pt:2 // 2:点播 1:直播
    * pl:1 // 是否播放中
    * pn:1 // 日志计数

    * br: Chrome //php记录
    * fv: MAC_21_0_0_216 //php记录
    * 
    * ctype:5 // 点播 专辑 剪辑 直播
*/

define(function (require) {
  var STATIC = require('./mt.static'),
    map = require('@map'),
    network = require('./network');

  var LOG_HOST = STATIC.PROTOCOL + 'log.talk-fun.com';

  var log = {
    srcUrl: null,
    sdkVersion: null,
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
    init: function (logConf) {
      this.logConfig = logConf;
    },

    // socket 请求
    socket: function (params) {
      // 当 log = true 发送请求
      if (this.logConfig && this.logConfig.socket) {
        network.ajax({
          type: 'GET',
          url: LOG_HOST + '/stats/socket.html',
          data: params
        });
      }
    },
    // 播放统计
    play: function (params) {
      // if (window.sdkVersion) {
      //   params.sdkVersion = window.sdkVersion;
      // }
      if (this.sdkVersion) {
        params.sdkVersion = this.sdkVersion
      }
      if (this.srcUrl) {
        params.srcUrl = this.srcUrl
      }
      network.ajax({
        type: 'GET',
        url: LOG_HOST + '/stats/play.html',
        data: params
      });
      map.get('vod:statis')()
    },
    res: function (postData) {
      var postData = {
        cid: 0,
        type: 4,
        pid: room.user.pid || 0,
        rid: room.user.roomid || 0,
        xid: room.user.xid || 0,
        url: window.encodeURIComponent(url),
        resType: mediaType,
        errorType: type,
        host: url.split('/')[2]
      }
      return tools.ajax({
        type: 'GET',
        url: this.LOG_HOST + '/stats/res.html',
        data: postData,
        error: function (res) {
          // log.onError(res)
        }
      })
    },
    // js Error
    errorReport: function (params) {
      if (typeof access_token != 'undefined') {
        params.access_token = access_token;
      }
      params.__type = 'jserror';
      network.ajax({
        type: 'GET',
        url: LOG_HOST + '/stats.html',
        data: params
      });
    }
  };

  var reportMsgs = {};
  window.onerror = function () {
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
  }
  // exprose
  return log;
});