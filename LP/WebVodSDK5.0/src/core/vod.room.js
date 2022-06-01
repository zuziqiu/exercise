/**
 * vod.room.js
 * 发送 `playback.php`
 * 发送 `heartBeat.php`
 */
// var tools = require('@tools'),
//   map = require('@map'),
// STATIC = require('./mt.static')
// import STATIC from './mt.static'
import tools from '../common/utils/tools'
import map from '../common/utils/map'
import STATIC from '@/sdkStore/states/staticState'

// room init
const room = {
  room: {},
  initAssignObj: null,
  initCallback: null,
  user: {},
  // 目标域名
  openDomainIndex: 0,
  // 状态
  ajaxState: 'wait',
  // open域名组
  openAry: ['open.talk-fun.com', 'open-1.talk-fun.com', 'open-2.talk-fun.com'],
  heartbeatInterval: 60,
  // 重试open
  initRetry: function (url) {
    // 错误log发送
    // 重试open
    if (this.openTimer) {
      clearTimeout(this.openTimer)
    }
    this.openTimer = setTimeout(() => {
      this.openDomainIndex += 1
      if (this.openDomainIndex > this.openAry.length - 1) {
        this.openDomainIndex = 0
      }
      tools.debug('正在切换资源 ==>', this.openAry[this.openDomainIndex])
      this.getInitData()
    }, 2000)
  },
  // init-data
  getInitData() {
    let that = this
    let appHost = this.openAry[this.openDomainIndex]
    let openUrl = 'https://' + appHost + '/live/playback.php'
    // 更新STATIC域名
    STATIC.URL.APP_HOST = 'https://' + appHost
    tools.debug('load init of ==>', STATIC.URL.APP_HOST)
    tools.ajax({
      type: 'GET',
      url: openUrl,
      data: that.initAssignObj,
      dataType: 'jsonp',
      timeout: 5000,
      jsonpCallback: 'vodCallback',
      cache: true, // 缓存请求地址
      success: function (res) {
        that.ajaxState = 'success'
        if (res.code === STATIC.CODE.SUCCESS && res.data) {
          var data = res.data
          that.initCallback && that.initCallback(res.data)
          that.room = res.data
          that.user = res.data.user
          // 如果 `vodLive = 1` 伪直播不发送心跳
          if (data.vodLive && data.vodLive == 1) {
            // 当前伪直播
            that.vodLiveType = true
          } else {
            // 检测心跳
            // that.heartBeat(that.room, access_token, 1);
          }
        } else {
          tools.error('点播加载错误 ==>', res)
          map.get('vod:room:error')(res)
        }
      },
      error: function () {
        tools.error('点播加载错误 ==> 正在重试')
        if (that.ajaxState !== 'success') {
          that.initRetry(openUrl)
        }
        tools.warn(STATIC.URL.APP_HOST + ' on timeout!')
      }
    })
  },
  init: function (access_token, extendObject, callback) {
    var extsAssign = {
      access_token: access_token
    }
    if (callback) {
      this.initCallback = callback
    }
    // 合并外部参数
    if (extendObject && extendObject.params) {
      Object.assign(extsAssign, extendObject.params)
    }
    this.initAssignObj = extsAssign
    // get-init-data
    this.getInitData()
  },
  // 轮询获取房间信息
  heartBeat: function (room, access_token, onload) {
    var _interval = this.heartbeatInterval * 1000,
      _load = onload,
      _ts = this,
      _timer = null
    var _heartBeat = function () {
      tools.ajax({
        type: 'GET',
        url: STATIC.URL.APP_HOST + '/live/heartbeat.php',
        data: 'v_type=2&onload=' + _load + '&access_token=' + access_token,
        success: function (retval) {
          tools.debug('vod-heartbeat===>', retval)
        }
      })
    }
    // 首次执行_heartBeat()
    _heartBeat()
    // 每隔 _interval 秒执行一次
    _timer = setInterval(function () {
      _heartBeat()
    }, _interval)
    // 首次1 第二次0
    if (_load === 1) {
      _load = 0
    }
  }
}

export default room
