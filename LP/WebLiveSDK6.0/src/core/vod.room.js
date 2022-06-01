/**
 * vod.room.js
 * 发送 `playback.php`
 * 发送 `heartBeat.php`
 */
define(function (require) {
  var tools = require("./utils/tools"),
    map = require("./utils/map"),
    STATIC = require('./core/mt.static');

  // room init
  var room = {
    access_token: null,
    room: {},
    user: {},
    heartbeatInterval: 60,
    getAccessToken: function () {
      return this.access_token;
    },
    init: function (access_token, extendObject, callback) {
      var that = this;
      this.access_token = access_token;
      var extsAssign = {
        access_token: access_token
      }
      // 合并外部参数
      if (extendObject && extendObject.params) {
        Object.assign(extsAssign, extendObject.params)
      }
      tools.ajax({
        type: 'GET',
        url: STATIC.APP_HOST + '/live/playback.php',
        data: extsAssign,
        dataType: 'jsonp',
        jsonpCallback: "vodCallback",
        cache: true, // 缓存请求地址
        success: function (res) {
          if (res.code === STATIC.CODE.SUCCESS && res.data) {
            var data = res.data;
            callback && callback(res.data);
            that.room = res.data;
            that.user = res.data.user;
            // 如果 `vodLive = 1` 伪直播不发送心跳 
            if (data.vodLive && data.vodLive == 1) {
              // 当前伪直播
              that.vodLiveType = true;
            } else {
              // 检测心跳
              that.heartBeat(that.room, access_token, 1);
            }
          } else {
            tools.error('点播加载错误', res)
            map.get("vod:room:error")(res);
          }
        }
      });
    },
    // 轮询获取房间信息
    heartBeat: function (room, access_token, onload) {
      var _interval = this.heartbeatInterval * 1000,
        _load = onload,
        _ts = this,
        _timer = null;
      var _heartBeat = function () {
        tools.ajax({
          type: 'GET',
          url: STATIC.APP_HOST + '/live/heartbeat.php',
          data: 'v_type=2&onload=' + _load + '&access_token=' + access_token,
          success: function (retval) {
            tools.debug("vod-heartbeat===>", retval);
          }
        });
      };
      // 首次执行_heartBeat()
      _heartBeat();
      // 每隔 _interval 秒执行一次
      _timer = setInterval(function () {
        _heartBeat();
      }, _interval);
      // 首次1 第二次0
      if (_load === 1) {
        _load = 0;
      }
    }
  };
  return room;
});