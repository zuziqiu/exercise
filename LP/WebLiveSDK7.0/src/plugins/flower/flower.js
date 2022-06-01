// 鲜花
// define(function (require) {
// import map from "../../utils/map"
import { STATIC } from '../../states/staticState'
import roomModule from '../../core/roomModule'
import member from '../member/member'
import tools from '../../utils/tools'
import { eventStore } from '../../eventStore/index'

// 鲜花模块
var flower = {
  flowerUrl: STATIC.APP_HOST + '/live/flower.php',
  access_token: roomModule.getAccessToken(),
  ajax: tools.ajax,
  initData: null,
  // 默认参数
  defaults: {
    amount: 0, //当前鲜花数
    duration: 0, //获得一朵鲜花时长
    passTime: 0, //过去总时间
    leftTime: 0 //还差多久获得第一朵鲜花
  },
  flowerDuration: 0,
  flowerTimer: null,
  // 原生调用
  nativeCall: function (cmd, obj) {
    if (tools.isInNative()) {
      if (window.SDK) {
        SDK.call(cmd, obj)
      }
    } else {
      return false
    }
  },
  // 鲜花自增
  flowerCountdown: function (retval, action) {
    // 对象
    var that = this,
      action = action || '',
      d = retval.data

    // 清理计时器
    clearTimeout(that.flowerTimer)

    // 当前鲜花数(get/send)
    if (action === 'get') {
      that.defaults.amount = d.amount || 0
    } else if (action === 'send') {
      that.defaults.amount = d.left_amount || 0
    } else {
      that.defaults.amount = d.amount
    }
    that.defaults.duration = d.time_interval //获得一朵鲜花时长
    that.defaults.passTime = d.pass_time //过去总时间
    that.defaults.leftTime = d.left_time //还差多久获得第一朵鲜花

    // 鲜花自增计算
    if (that.defaults.amount >= 3) {
      return false
    } else {
      var dfPasstime = that.defaults.passTime
      // 倒计时开始
      tools.debug('鲜花统计时间过去====> ' + dfPasstime)
      var curTempCount = 0
      var handler = function () {
        if (dfPasstime >= 0) {
          that.flowerTimer = setTimeout(function () {
            // 过去时长 / 获得一朵鲜花时间
            var fc = parseInt(dfPasstime / that.defaults.duration, 10)
            // 鲜花朵数
            // if (fc > 0 && fc <= 3) {
            if (3 >= fc && fc > 0) {
              if (curTempCount !== fc) {
                that.defaults.amount = fc
                eventStore.emit('flower:total', fc)
                that.nativeCall('flower:total', {
                  total: fc
                })
                curTempCount = fc
              }
            } else if (fc >= 3) {
              clearTimeout(that.flowerTimer)
              return false
            }
            dfPasstime += 1
            that.defaults.passTime = dfPasstime
            handler()
          }, 1000)
        }
      }
      handler()
    }
  },
  // 停止自增统计
  flowerStop: function () {
    var that = this
    that.defaults.amount = 0 //当前鲜花数
    that.defaults.duration = 0 //获得一朵鲜花时长
    that.defaults.passTime = 0 //过去总时间
    that.defaults.leftTime = 0 //还差多久获得第一朵鲜花
    clearTimeout(that.flowerTimer)
  },
  // 鲜花回调
  flowerCallback: function (retval) {
    var that = this
    if (retval.code === STATIC.CODE_SUCCESS) {
      // 直播中,鲜花初始化
      that.flowerDuration = retval.data.time_interval
      that.flowerCountdown(retval, 'get')
      var obj = {
        code: retval.code,
        amount: retval.data.amount
      }
      eventStore.emit('flower:get:init', obj)
      that.nativeCall('flower:get:init', obj)
    } else if (retval.code === 1202) {
      // 未直播或下课
      var obj = {
        code: retval.code,
        msg: retval.msg
      }
      that.flowerStop()
      eventStore.emit('flower:get:init', obj)
      that.nativeCall('flower:get:init', obj)
    } else if (retval.code === 15000) {
      // 未够时间获取第一朵鲜花
      var obj = {
        code: retval.code,
        leftTime: retval.data.left_time
      }
      eventStore.emit('flower:time:left', obj)
      that.nativeCall('flower:time:left', obj)
      that.flowerCountdown(retval)
    } else {
      eventStore.emit('flower:load:error', obj)
    }
  },
  // 获取鲜花
  getFlower: function (callback) {
    tools.debug('Plugins: flower init...')
    var that = this
    // 初始化调用 init.flower 数据
    if (that.initFlower) {
      that.flowerCallback(that.initFlower)
      that.initFlower = null
    }
    // 第二次由php发起
    else {
      tools.ajax({
        type: 'GET',
        url: that.flowerUrl,
        dataType: 'jsonp',
        data: {
          act: 'myflower',
          access_token: roomModule.getAccessToken()
        },
        success: function (retval) {
          that.flowerCallback(retval)
          if (callback) {
            callback(retval)
          }
        }
      })
    }
  },
  // 送鲜花
  sendFlower: function () {
    var that = this
    if (that.defaults.amount === 0) {
      // 还差n秒获得一朵鲜花
      var leftDuration = that.defaults.duration - that.defaults.passTime
      var data = {
        code: 15000,
        leftTime: leftDuration
      }
      eventStore.emit('flower:time:left', data)
      that.nativeCall('flower:time:left', data)
      return false
    }
    // 大于一朵可发送
    tools.ajax({
      type: 'GET',
      url: that.flowerUrl,
      data: {
        act: 'send',
        access_token: roomModule.getAccessToken()
      },
      dataType: 'jsonp',
      success: function (retval) {
        if (retval.code === STATIC.CODE_SUCCESS) {
          // 直播中,鲜花初始化
          that.flowerDuration = retval.data.time_interval
          that.flowerCountdown(retval, 'send')
          var obj = {
            code: retval.code,
            amount: 0
          }
          eventStore.emit('flower:get:init', obj)
          that.nativeCall('flower:get:init', obj)

          retval.data = member.dealMemberAvatar(retval.data)

          // that.nativeCall("flower:send", retval.data);
          if (tools.isMobileSDK() && tools.getSDKMode() == 2) {
            window.SDK.broadcast({
              cmd: 'flower:send',
              args: retval.data
            })
          } else {
            eventStore.emit('flower:send', retval.data)
          }
        } else if (retval.code === 1202) {
          // 未直播或下课
          var obj = {
            code: retval.code,
            msg: retval.msg
          }
          that.flowerStop()
          eventStore.emit('flower:get:init', obj)
          that.nativeCall('flower:get:init', obj)
        } else if (retval.code === 15000) {
          // 未够时间获取第一朵鲜花
          var obj = {
            code: retval.code,
            leftTime: retval.data.left_time
          }
          that.flowerDuration = retval.data.time_interval
          eventStore.emit('flower:time:left', obj)
          that.nativeCall('flower:time:left', obj)
          that.flowerCountdown(retval)
        }
      }
    })
  }
}
// exports
export default flower
// });
