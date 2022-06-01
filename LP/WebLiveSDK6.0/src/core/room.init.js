// Filename: room.init.js


  // import
  import tools from "../utils/tools"
  import map from "../utils/map"
  import log from "./log"
  import network from "./network"
  import STATIC from "./mt.static"
  import store from './store'
  import rtsPlayer from './rts.player'

  // room.init
  let room = {
    // access_token
    access_token: null,
    // 目标域名
    openDomainIndex: 0,
    // 状态
    ajaxState: 'wait',
    // open域名组
    openAry: ['open.talk-fun.com', 'open-1.talk-fun.com', 'open-2.talk-fun.com'],
    // 获取access_token
    getAccessToken: function () {
      let token = store.getters('getToken')
      return token || window.access_token || null
    },
    course: null,
    setCourse: function (course) {
      this.course = course;
    },
    // 重试open
    initRetry: function (url) {
      // 错误log发送
      log.res(url, 'open')
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
    // 房间配置参数
    configs: null,
    isSmallClass: null,

    // 初始化 sdk.core 模块
    init: function (access_token, callback) {
      tools.debug('room.init.js => module init.');
      // 赋值
      // if (player) {
      //   this.player = player
      // }
      if (access_token) {
        this.access_token = access_token
      }
      if (callback) {
        this.initCallback = callback
      }
      // 请求数据
      this.getInitData()
    },
    // 请求initData
    getInitData: function () {
      var _ts = this
      let appHost = this.openAry[this.openDomainIndex]
      let openUrl = 'https://' + appHost + '/live/init.php'
      // 更新STATIC域名
      STATIC.APP_HOST = 'https://' + appHost
      // 获取room基本信息
      tools.ajax({
        type: "GET",
        url: openUrl,
        timeout: 5000,
        dataType: 'jsonp',
        data: {
          access_token: this.access_token,
          sdk: process.env.packVersion
        },
        success: function (retval) {
          _ts.ajaxState = 'success'
          // 大班低延迟模式
          if (retval.room && retval.room.modetype == STATIC.LOWDELAY_MODE) {
            // 请求 appid 相关
            rtsPlayer.getInfo(_ts.access_token)
          }
          // 错误统一暴露
          if (retval.code != STATIC.CODE.SUCCESS) {
            tools.error(retval)
          }
          // 成功
          if (retval.code === STATIC.CODE.SUCCESS) {

            var room = retval;

            // 设置room
            tools.setRoom(room);

            // 注册log信息 - log setting
            log.init(room.log, retval.hostGroup);

            // Change-Protocol
            try {
              room = tools.detectProtocol(JSON.stringify(room));
              room = JSON.parse(room);
            } catch (err) {
              tools.debug("room data parse Error " + err);
            }

            // _ts.access_token = access_token;
            if (room.course && room.course.course_id) {
              _ts.course = room.course;
            }

            //房间模式，检查是否被过期踢出过
            if (room.ext.liveEndExpire > 0 && room.ext.liveEndJumpUrl.indexOf('http') === 0) {
              if (window.localStorage) {
                if (window.localStorage.getItem('liveEndExpireToken') == _ts.access_token) {
                  window.location.href = room.ext.liveEndJumpUrl;
                  return;
                } else {
                  window.localStorage.removeItem('liveEndExpireToken')
                }
              }
            }

            _ts.room = room;
            // network.addHostGroup(room.hostGroup || {});

            // tell the room callback
            tools.debug("房间验证成功====>", room);

            // 房间callback
            try {
              map.get('live:init:success')()
              _ts.initCallback(room)
            } catch (err) {
              tools.error('初始化 callback出错 ==>', err)
            }
          }
          // code 课程范围[1260-1263]未允许进入
          else if (retval.code >= STATIC.CODE.LIVE_COURSE_UNEXIST && retval.code <= STATIC.CODE.LIVE_COURSE_NOT_START) {
            map.get("live:course:access:error")(retval);
          }
          // 系统错误信息
          else {
            map.get("system:room:error")(retval);
          }
        },
        // 请求错误
        error: function (res) {
          tools.debug('room init request errror ==>', res)
          tools.warn(`init (${openUrl}) 数据请求失败...`)
          // 重试
          if (_ts.ajaxState !== 'success') {
            _ts.initRetry(openUrl)
            map.get("system:room:error")("room请求超时,请重试...");
          }
        }
      })
    },
    //检查是否直播结束时间到设定时限，判断是否踢出
    liveEndExpieTimer: null,
    broadcastHandler: function (command) {
      var that = this;
      // 上课
      if (command.t == 'start') {
        if (that.liveEndExpieTimer) {
          clearTimeout(that.liveEndExpieTimer);
          that.liveEndExpieTimer = null;
        }
        if (that.isSmallClass) {
          // 小班
          rtsPlayer.init()
        }
      }
      // 下课
      else if (command.t == 'stop') {
        if (!tools.isMobileSDK() && that.room.ext.liveEndExpire > 0 && that.room.ext.liveEndJumpUrl.indexOf('http') === 0) {
          that.liveEndExpieTimer = setTimeout(function () {
            if (window.localStorage) {
              window.localStorage.setItem('liveEndExpireToken', that.getAccessToken());
            }
            window.location.href = that.room.ext.liveEndJumpUrl;
          }, that.room.ext.liveEndExpire * 1000);
        }
      }
    }
  }
  export default room
  