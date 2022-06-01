'use strict'
import { STATIC } from './states/staticState'
import * as TYPES from './action/action-types'
import socket from './core/socketModule'
import room from './core/roomModule'
import tools from './utils/tools'
import member from './plugins/member/member'
import plugins from './plugins'
import chat from './plugins/chat/chat'
import network from './plugins/network/network'
import question from './plugins/question/question'
import pako from 'pako'
import cmdHandle from './core/cmdHandle'
import cmdStatis from './core/liveStats'
import log from './utils/log'
import { playerSchedule } from './core/playerSchedule'
import queue from './utils/queue'
import pptPreview from './extends/pptPreview'
// import manager from './plugins/manager/manager'

import liveControler from './core/liveControler'
import desktopPlayer from './module/desktopModule'
import whiteboardPlayer from './module/whiteboardModule'
import cameraPlayer from './module/cameraModule'
import mediaControler from './core/mediaControler'
// 状态管理
import * as SDK_TYPES from './action/action-types'
import { sdkStore } from './states'
import { sdkAction } from './action'
import { eventStore } from './eventStore'
import { toJS, spy } from 'mobx'
// 生命周期函数文件
import { lifeCycle } from './core/lifeCycle'
// player
tools.debug(`TF_JSSDK v${process.env.packVersion}-${new Date().getTime()}`)
tools.debug(`Build from ${process.env.GIT_PACK}`)

// 客户端 <==> 浏览器
cmdHandle.init()

// 基础信息
var version = window.sdkVersion || process.env.packVersion
tools.debug('SDK-Core-Version: ' + version)
tools.debug('Current-UA ===> ' + navigator.userAgent)

// 设置版本号
log.setBaseParam({
  sdkVersion: version
})

// Socket.Player
socket.player = liveControler

/**
 * @name TFSDK 全局定义
 */
export class TFSDK {
  /**
   * @constructs TFSDK
   * @param {string} access_token token（建议请求后端接口获取，必填）
   * @param {object} config 初始化配置（可选）
   * @param {function} callback 回调（可选）
   * @description sdk构造函数
   * @example
   *  var TF = new TFSDK(access_token, {
   *     config: {
   *        techOrder: 'FLV' || 'HLS' || 'FLASH', // 流媒体格式
   *        controls: true // 播放器的控件（全屏等）
   *     },
   *     video: {
   *       autoplay: true, // 自动播放
   *       controls: false, // 媒体原生控件
   *       preload: 'auto', // 预加载
   *       poster: false, // 海报
   *      }
   *   }, function (initData) {
   *      todo(...)
   *   });
   */
  constructor() {
    // 读取arguments
    var that = this,
      args = arguments

    tools.debug('Talk-Fun JS-SDK Params', tools.argumentToArray(arguments))

    // 头像工具
    this.getAvatar = member.dealMemberAvatar

    // token
    var access_token = null,
      extend = {},
      callback = null

    // 是否实例化
    if (!this.init) {
      console.error('实例化 window.MT 对象失败, 请重试!')
      //   msg: '实例化 window.MT 对象失败, 请重试!'
      // })
      eventStore.emit('system:room:error', {
        msg: '实例化 window.MT 对象失败, 请重试!'
      })
      return false
    }

    // 可配置参数(最多3项)
    if (3 >= args.length && args.length > 0) {
      // 开启全局mobx 状态监听
      if (eval(tools.getQueryStr('storeDebug'))) {
        spy((event) => {
          if (event.arguments) {
            console.log(`更新模块：${event.name} \n 供应数据：${JSON.stringify(event.arguments[1])}`)
          }
        })
      }
      // 第一个参数是token，且是string
      if (typeof args[0] === 'string') {
        access_token = args[0]
      }
      // 第二个参数是扩展，且是对象
      if (typeof args[1] === 'object') {
        extend = args[1]
        // 第三个参数是callback，且是function
        if (typeof args[2] === 'function') {
          callback = args[2]
        }
      }
      // 第二个参数是callback，且是function
      else if (typeof args[1] === 'function') {
        callback = args[1]
      }

      /*
       * 获取url的扩展参数
       * extDaily 是否开启日志
       * extTestSpeed 是否开启测速
       * extControls 是否开启自定义控件
       * controls 是否开启原生控件
       * poster 是否开启海报
       * autoplay 是否开启自动播放
       */
      let urlParams = {
        config: {
          daily: eval(tools.getQueryStr('extDaily')) ?? extend?.config?.daily ?? false,
          testSpeed: eval(tools.getQueryStr('extTestSpeed')) ?? extend?.config?.testSpeed ?? false,
          controls: eval(tools.getQueryStr('extControls')) ?? extend?.config?.controls ?? false
        },
        video: {
          controls: eval(tools.getQueryStr('controls')) ?? extend?.video?.controls ?? false,
          poster: eval(tools.getQueryStr('poster')) ?? extend?.video?.poster ?? false,
          autoplay: eval(tools.getQueryStr('autoplay')) ?? extend?.video?.autoplay ?? false
        }
      }

      extend.config = Object.assign(extend.config || {}, urlParams.config)
      extend.video = Object.assign(extend.video || {}, urlParams.video)

      sdkAction.dispatch('room', {
        type: TYPES.UPDATE_EXTENSION_CONFIG,
        payload: extend
      })
      // callback undefined也会在后面判断，这里逻辑复杂不判断了
      that.init(access_token, callback)
    }
    // 非法
    else {
      tools.warn('参数错误, 请传入正确token值')
      //   msg: '参数错误, 请传入正确token值'
      // })
      eventStore.emit('system:room:error', {
        msg: '参数错误, 请传入正确token值'
      })
    }
    // access_token
    this.access_token = access_token
  }

  /**
   * @namespace lifeCycle
   * @description 生命周期函数
   */
  /**
   * @function finishInterface
   * @param {function} callback 回调
   * @description 生命周期函数：初始化接口之后
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.finishInterface(function(data) {
   *    todo(...)
   *  });
   */
  finishInterface(callback) {
    lifeCycle.join('finishInterface', (data) => {
      callback?.(data)
    })
  }
  /**
   * @function beforeSocket
   * @param {function} callback 回调
   * @description 生命周期函数：初始化socket之前
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.beforeSocket(function(data) {
   *    todo(...)
   *  })
   */
  beforeSocket(callback) {
    lifeCycle.join('beforeSocket', (data) => {
      callback?.(data)
    })
  }
  /**
   * @function finishSocket
   * @param {function} callback 回调
   * @description 生命周期函数：初始化socket之后
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.finishSocket(function(data) {
   *    todo(...)
   *  })
   */
  finishSocket(callback) {
    lifeCycle.join('finishSocket', (data) => {
      callback?.(data)
    })
  }
  /**
   * @function createdCameraPlayer
   * @param {function} callback 回调
   * @description 生命周期函数：初始化socket之后
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.createdCameraPlayer(function(data) {
   *    todo(...)
   *  })
   */
  createdCameraPlayer(callback) {
    lifeCycle.join('createdCameraPlayer', (data) => {
      callback?.(data)
    })
  }
  /**
   * @function createdVideoPlayer
   * @param {function} callback 回调
   * @description 生命周期函数：初始化socket之后
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.createdVideoPlayer(function(data) {
   *    todo(...)
   *  })
   */
  createdVideoPlayer(callback) {
    lifeCycle.join('createdVideoPlayer', (data) => {
      callback?.(data)
    })
  }
  /**
   * @function createdCoursewarePlayer
   * @param {function} callback 回调
   * @description 生命周期函数：初始化socket之后
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.createdCoursewarePlayer(function(data) {
   *    todo(...)
   *  })
   */
  createdCoursewarePlayer(callback) {
    lifeCycle.join('createdCoursewarePlayer', (data) => {
      callback?.(data)
    })
  }
  /**
   * @function mounted
   * @param {function} callback 回调
   * @description 生命周期函数：初始化接口请求成功和socket完成连接
   * @memberof lifeCycle
   * @instance
   * @example
   *  TF.mounted(function(data) {
   *    todo(...)
   *  })
   */
  mounted(callback) {
    lifeCycle.join('mounted', (initData) => {
      // 清楚临时数据
      eventStore.temporaryData = null
      // callback?.(initData)
      callback?.(initData)
    })
  }
  /**
   * @namespace player
   * @description 播放器
   */

  /**
   * @function whiteboardPlayer 课件播放器
   * @param {sting} containerId 页面中已渲染的容器的id，将在该容器内创建课件播放器
   * @param {sting} playerId 创建的画板播放器会被赋予该id（自定义）
   * @param {callbak} callbak 播放器回调函数
   * @memberof player
   * @instance
   * @example
   * TF.whiteboardPlayer('containerId', 'playerId', function (player) {
   *   ('课件播放器 => 初始化成功')
   * })
   */
  whiteboardPlayer = (containerId, playerId, callback) => {
    playerSchedule.join('whiteboard:player', {
      parent: whiteboardPlayer,
      callback: function () {
        liveControler.whiteboardEntry(containerId, playerId, callback)
      }
    })
  }

  /**
   * @function camera 摄像头播放器
   * @param {sting} containerId 页面中已渲染的容器的id，将在该容器内创建摄像头播放器
   * @param {sting} playerId 创建的摄像头播放器会被赋予该id（自定义）
   * @param {callbak} callbak 播放器回调函数
   * @memberof player
   * @instance
   * @example
   * TF.camera('containerId', 'playerId', function (player) {
   *   ('摄像头播放器 => 初始化成功')
   * })
   */
  camera(containerId, playerId, callback) {
    // 注册摄像头
    liveControler.cameraEntry.apply(liveControler, arguments)
    // 异步执行
    playerSchedule.join('live:camera:player', {
      parent: this,
      callback: function () {
        // // 注册摄像头
        // liveControler.cameraEntry(containerId, playerId, callback)
        cameraPlayer.cameraRun()
      }
    })
  }

  /**
   * @function videoPlayer 视频播放 & 桌面分享的播放器
   * @param {String} containerId 页面中已渲染的容器的id，将在该容器内创建视频播放器
   * @param {String} playerId 创建的播放器会被赋予该id（自定义）
   * @param {function} callback 播放器回调函数
   * @memberof player
   * @instance
   * @example
   * TF.videoPlayer('containerId', 'playerId', function (player) {
   *   ('视频播放器 => 初始化成功')
   * })
   */
  videoPlayer(containerId, playerId, callback) {
    playerSchedule.join('live:main:player', {
      parent: this,
      callback: function () {
        // H5播放器
        liveControler.mainPlayer(containerId, playerId, callback)
        // callback
        desktopPlayer.videoRun()
      }
    })
  }

  /**
   * @function mainPlayer 视频播放 & 桌面分享的播放器
   * @deprecated mainPlayer即将废弃
   * @param {String} containerId 页面中已渲染的容器的id，将在该容器内创建视频播放器
   * @param {String} playerId 创建的播放器会被赋予该id（自定义）
   * @param {function} callback 播放器回调函数
   * @memberof player
   * @instance
   */
  mainPlayer(containerId, playerId, callback) {
    this.videoPlayer.apply(this, arguments)
  }

  /**
   * @function mediaPlayer （桌面分享 & 视频插播 || 摄像头） 播放器（将来合并）
   * @param {sting} containerId 传入media的父级容器id，将在该容器内创建media播放器（自定义）
   * @param {sting} playerId 创建的media播放器会被赋予该id（自定义）
   * @param {callbak} callbak 播放器回调函数
   * @memberof player
   * @instance
   * @ignore
   */
  mediaPlayer = (containerId, playerId, callback) => {
    playerSchedule.join('media:player', {
      parent: this,
      callback: function () {
        liveControler.mediaPlayer(containerId, playerId, callback)
      }
    })
  }

  /**
   * @function getTools 工具类
   * @returns {object} tools工具类
   * @memberof TFSDK
   * @instance
   */
  getTools() {
    return tools
  }

  /**
   * @param {string} access_token token
   * @param {function} initCallback function
   * @ignore
   */
  init(access_token, callback) {
    var that = this
    // 更新token
    // Store.commit(TYPES.UPDATE_TOKEN, access_token)
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_ACCESS_TOKEN,
      payload: {
        access_token: access_token
      }
    })
    // 初始化请求 init.php
    room.init(
      access_token,
      function (initData) {
        tools.debug('Get Start =>', initData)
        if (initData) {
          // window.MT.SDK.initDataObj = initData
          // 提交数据
          // Store.commit(TYPES.UPDATE_INIT_DATA, initData)
          sdkAction.dispatch('room', {
            type: TYPES.UPDATE_INIT_DATA,
            payload: {
              initData: initData
            }
          })
          // 执行生命周期函数：请求接口成功之后
          lifeCycle.lifeControler['finishInterface']?.next()
          // 更新课程数据
          liveControler.updateCourseData(initData.course || null)
          // 执行room.init
          that.serverRoom = initData
          that.room(initData, callback)
          // 初始化播放器
          liveControler.init()
        }
      },
      liveControler
    )
  }

  /**
   * @param {object} retval
   * @param {function} initcallback
   * @ignore
   */
  room = async function (retval, initcallback) {
    // Seter
    var d = retval,
      that = this
    // roomInfo = window.MT.room = {};

    // InitData [初始化數據]
    // roomInfo.initData = d.InitData;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_INIT_DATA,
      payload: {
        initData: d
      }
    })

    // appHost [主域名]
    // roomInfo.appHost = d.appHost;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_APP_HOST,
      payload: d.appHost
    })

    // conString [语音云配置]
    // roomInfo.conString = d.conString;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_CON_STRING,
      payload: d.conString
    })

    // heartbeatInterval [一些数据收集请求时间]
    // roomInfo.heartbeatInterval = d.heartbeatInterval;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_HEARTBEAT_INTERVAL,
      payload: d.heartbeatInterval
    })

    // live [是否直播中]
    // roomInfo.live = d.live;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_LIVE,
      payload: d.live
    })

    // modules [模块]
    // roomInfo.modules = d.modules;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_MODULES,
      payload: d.live
    })

    // plugin [插件]
    // roomInfo.plugin = d.plugin;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_PLUGIN,
      payload: d.plugin
    })

    // rtmp [RTMP模式]
    // roomInfo.rtmp = d.rtmp;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_RTMP,
      payload: d.rtmp
    })

    // user [当前用户]
    // roomInfo.curUser = member.dealMemberAvatar(d.user);
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_CUR_USER,
      payload: member.dealMemberAvatar(d.user)
    })

    // zhubo [主播信息]
    // roomInfo.zhubo = d.zhubo;
    // sdkAction.dispatch('room', {
    //   type: SDK_TYPES.UPDATE_ZHUBO,
    //   payload: d.zhubo
    // })
    sdkAction.dispatch('zhubo', {
      type: SDK_TYPES.MERGE_STATE,
      payload: d.zhubo
    })

    // 用户信息
    // roomInfo.user = d.user;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_USER,
      payload: d.user
    })

    // 直播标题
    // roomInfo.title = d.InitData.title;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_TITLE,
      payload: d.InitData.title
    })

    // websocket url [socket链接地址]
    // roomInfo.websocket = d.websocket;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_WEBSOCKET,
      payload: d.websocket
    })

    // cameraUrl [摄像头地址]
    // roomInfo.cameraUrl = d.cameraUrl;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_CAMERA_URL,
      payload: d.cameraUrl
    })

    // swfUrl [主播播放器地址]
    // roomInfo.swfUrl = d.swfUrl;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_SWF_URL,
      payload: d.swfUrl
    })

    // duration [当前直播时间]
    // roomInfo.livingDuration = d.live.duration;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_LIVING_DURATION,
      payload: d.live.duration
    })

    // 滚动&通知 [普通消息通知]
    // roomInfo.announce = d.announce;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_ANNOUNCE,
      payload: d.announce
    })

    // Flashvars
    // roomInfo.flashvar = d.flashvar;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_FLASHVAR,
      payload: d.flashvar
    })

    // 持久化广播事件
    // roomInfo.initEvent = d.initEvent;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_INIT_EVENT,
      payload: d.initEvent
    })

    // 保存access_token
    // roomInfo.access_token = this.access_token;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_ACCESS_TOKEN,
      payload: {
        access_token: this.access_token
      }
    })

    // modeType
    // roomInfo.modeType = d.room.modetype;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_MODE_TYPE,
      payload: d.room.modetype
    })

    // 小班播放器路径
    // roomInfo.livePlayerUrl = d.livePlayerUrl;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_LIVE_PLAYER_URL,
      payload: d.livePlayerUrl
    })

    //res上传接口
    // roomInfo.resConfig = d.resConfig;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_RES_CONFIG,
      payload: d.resConfig
    })

    // 统计
    cmdStatis.setData(d)

    // action
    if (d.InitData.action) {
      liveControler.action = d.InitData.action
      // core.setPlayerStatus(d.InitData.action)
      // 更新播放状态
      sdkAction.dispatch('media', {
        type: TYPES.UPDATE_MEDIA_STATUS,
        payload: {
          status: d.InitData.action
        }
      })
    }

    // 鲜花初始化数据
    if (d.flower) {
      that.plugins('flower').initFlower = d.flower
    }

    // 机器人
    if (d.room.robotList) {
      var rblist = d.room.robotList
      member.setRobotList(rblist.list)
      // roomInfo.robots = rblist;
      sdkAction.dispatch('room', {
        type: SDK_TYPES.UPDATE_ROBOTS,
        payload: rblist
      })
    }

    // 模块设置
    if (d.modules) {
      // roomInfo.roomModules = d.modules;
      sdkAction.dispatch('room', {
        type: SDK_TYPES.UPDATE_ROOM_MODULES,
        payload: d.modules
      })
    }

    // 课程
    if (d.course) {
      // roomInfo.course = d.course;
      sdkAction.dispatch('room', {
        type: SDK_TYPES.UPDATE_COURSE,
        payload: d.course
      })
    }

    // 小班数据
    if (d.usercamera) {
      // roomInfo.userCamera = d.usercamera;
      sdkAction.dispatch('room', {
        type: SDK_TYPES.UPDATE_USER_CAMERA,
        payload: d.userCamera
      })
      if (d.usercamera.inviteList2) {
        eventStore.emit('rtc:invite', d.usercamera.inviteList2)
      }
      if (d.usercamera.zhujiang) {
        setTimeout(() => {
          eventStore.emit('rtc:zhujiang', d.usercamera.zhujiang)
        }, 100)
      }
    } else {
      // roomInfo.userCamera = {};
      sdkAction.dispatch('room', {
        type: SDK_TYPES.UPDATE_USER_CAMERA,
        payload: {}
      })
    }

    // 聊天列表
    if (d.room.chatList) {
      if (d.room.chatList?.length > 0) {
        member.setAvatars(d.room.chatList)
      }
      eventStore.emit('chat:list', d.room.chatList)
    }

    // 拓展
    // roomInfo.ext = d.ext;
    sdkAction.dispatch('room', {
      type: SDK_TYPES.UPDATE_EXT,
      payload: d.ext
    })

    // 在线人数
    if (d.room?.online) {
      // roomInfo.online = d.room.online;
      sdkAction.dispatch('room', {
        type: SDK_TYPES.UPDATE_ONLINE,
        payload: d.room.online
      })
    }

    // ====@ set room.info ==== //
    // 兼容代码 : 由于视图层 sdk.live.cmd 文件，通过 .zhubo.title = 'xxx' 直接修改引起mobx报错
    let roomClone = toJS(sdkStore.room)
    // window.MT.room = roomClone;

    // copy => room
    this.roomObject = d
    this.roomInfo = roomClone

    // 判断socket链接情况
    // if(roomInfo.websocket && roomInfo.websocket.length === 0){
    tools.debug('房间初始化完成 ====> room:init')
    that._applyByInit(this.roomInfo, d)

    // 全体禁言
    if (d.room.chat) {
      if (d.room.chat.disableall > 0) {
        //   status: d.room.chat.disableall
        // })
        eventStore.emit('chat:disable:all', {
          status: d.room.chat.disableall
        })
      }
    }
    // 执行生命周期函数：初始化socket之前
    lifeCycle.lifeControler['beforeSocket']?.next()
    // socket inited && room inited.
    socket.init(that.roomInfo, function (_socket) {
      tools.debug('room data ==>', that.roomInfo)

      // 执行socket相关操作
      that._listen(_socket)
    })

    // 如果没有延迟队列 => 需执行initStep
    if (playerSchedule.queueArys.length === 0) {
      liveControler.doStep()
    }

    // 执行sdk顺序队列
    playerSchedule.run(that)
    playerSchedule.isLoaded = true

    // 执行外部传入callback
    tools.callback(initcallback, d)
  }

  /**
   * @function getLiveState 获取直播状态
   * @description 获取直播状态
   * @returns {string} [返回直播状态]
   * @memberof TFSDK
   * @instance
   */
  getLiveState() {
    var state = 'wait'
    var that = this
    if (!this.firstRun) {
      if (typeof liveControler.action === 'string') {
        // liveControler.action = room.room.InitData.action;
        state = liveControler.action
      }
      this.firstRun = true
    } else {
      state = liveControler.action
    }
    tools.debug('getLiveState => ' + state)
    return state
  }

  /**
   * @function getSDKMode 获取当前模式
   * @description 获取sdk模式 不知道做什么的
   * @returns {number | string} 获取sdk模式
   * @ignore
   */
  getSDKMode() {
    // 共3种模式 [1 / 2 / 3]
    return tools.getSDKMode()
  }

  /**
   * 音视频动态切换元素
   * @param {object} obj.data- {type: "video" / "audio"}
   * @ignore
   */
  changeMediaElement(obj) {
    return liveControler.changeMediaElement(obj)
  }

  /**
   * 媒体播放器控制选项配置
   * @param {object}
   * @ignore
   */
  setMediaControl(opts) {
    tools.debug('setting controls ==> ', opts)
    var configs = {
      // 全屏
      fullscreenButton: opts.fullscreenButton,

      // 音量
      volumeButton: opts.volumeButton
    }
    if (liveControler.setConfig) {
      liveControler.setConfig(configs)
    }
  }

  /**
   * 切换播放器位置
   * 需要重新初始化
   * @deprecated
   * @ignore
   */
  changePosition(flag) {
    liveControler.initPlayer(null)
  }
  /**
   * @function volume 设置音量
   * @param {float} volume 音量
   * @description (包括 桌面分享 & video) 0 - 1 设置
   * @memberof TFSDK
   * @instance
   * @example
   * TF.volum(0.1)
   */
  volume(volume) {
    if (liveControler.volume) {
      liveControler.volume(volume)
    }
  }

  /**
   * 注意：执行emit().时, 匹配 `eventName` 进入下列分支方法.
   * @param {args} param arguments参数
   * @ignore
   */
  emitTrigger(args) {
    // tools.debug("emitTrigger===>", args);
    var eventName, packet, callback
    // arguments
    if (args.length === 2) {
      eventName = args[0]
      callback = typeof args[1] === 'function' ? args[1] : ''
    } else if (args.length === 3) {
      eventName = args[0]
      packet = args[1]
      callback = typeof args[2] === 'function' ? args[2] : ''
    }

    // 事件切换
    switch (eventName) {
      // 提问
      case 'question:ask':
        var obj = {
          action: 'question',
          type: 'question',
          typeId: 'ask',
          filter: packet.filter ? packet.filter : null,
          replyId: packet.replyId || '',
          content: packet.msg,
          ext: args[1].ext
        }
        question.quesPost('ask', obj, callback)
        return true

      // 回答
      case 'question:reply':
        var obj = {
          action: 'answer',
          type: 'answer',
          typeId: 'reply',
          replyId: packet.replyId,
          content: packet.msg
        }
        question.quesPost('reply', obj, callback)
        return true

      // 获取问答列表
      case 'question:get:list':
        question.getList(sdkStore.room.access_token, callback)
        return true

      // 获取问答ById
      case 'question:get:part':
        question.getQuestionById(packet.qid, callback)
        return true
      case 'question:delete':
        // question.allQids.del(packet.qid);
        sdkAction.dispatch('question', {
          type: SDK_TYPES.DELETE_QUESTION_ID,
          payload: {
            id: packet.qid
          }
        })
        return true

      // 弹幕
      case 'danmaku:open':
      case 'danmaku:close':
        var pack = {
          eventName: eventName,
          data: packet
        }
        // chat.danmakuHandle(pack, player);
        return true
    }
  }

  /**
   * 执行 `Emit()` 和 `on()`方法都会执行该方法(包括服务器响应事件)
   * @param  {object} packet [cmd压缩包]
   * @returns {object | string} [返回传输命令]
   * @ignore
   */
  packetHandler(packet) {
    // 替换头像规则
    packet.args = member.dealMemberAvatar(packet.args)

    // 内部处理
    switch (packet.cmd) {
      // 白板
      case 'video:whiteboard':
        // 暴露
        if (packet) {
          var command = JSON.parse(packet.args.metadata)
          eventStore.emit('core:whiteboard', command)
          // 课程 & 直播 => 数据更新
          var updateData = {
            liveId: 0,
            courseId: 0
          }
          if (command.live) {
            updateData.liveId = command.live.liveid
          }
          if (command.liveid || command.course_id) {
            if (command.liveid) {
              updateData.liveId = command.liveid
            }
            if (command.course_id) {
              updateData.courseId = command.course_id
            }
          }
          liveControler.updateCourseData(command)
          tools.debug('Update live data ==>', updateData)
          eventStore.emit('live:data:update', updateData)

          // 设置课程
          if (typeof packet.args.course_id !== 'undefined') {
            room.setCourse({
              course_id: packet.args.course_id
            })
          }

          // 播放器白板
          if (liveControler.videoOrwhiteBoardOnSocket) {
            liveControler.videoOrwhiteBoardOnSocket(packet, command)
          }
          room.broadcastHandler(command)
        }
        // whiteboard 错误上报
        else {
          eventStore.emit('whiteboard:error')
        }
        break

      // 聊天
      case 'chat:send':
        // 弹幕 弹幕还没有
        // chat.danmaku(packet, player)
        break

      //===========提问========
      case 'question:ask':
        // question.allQids.add(packet.args.qid);
        sdkAction.dispatch('question', {
          type: SDK_TYPES.ADD_QUESTION_ID,
          payload: {
            id: packet.args.qid
          }
        })
        break
      case 'question:reply':
        //提问时没有广播给普通用户，回答的时候一起广播
        //所以这里把广播的问题分拆出来处理
        // if (typeof packet.args.question !== 'undefined' && question.allQids.exists(packet.args.replyId) == false) {
        console.log(typeof packet.args.question !== 'undefined')
        console.log(typeof packet.args.question !== 'undefined')
        if (typeof packet.args.question !== 'undefined' && !sdkStore.question.allQids.has(packet.args.replyId)) {
          packet.args.question.cmd = 'question:ask'
          var questionPack = {
            cmd: 'question:ask',
            args: packet.args.question
          }
          var _package = this.packetHandler(questionPack)
          if (_package) {
            if (tools.isMobileSDK() && tools.getSDKMode() == 2) {
              window.SDK.broadcast(questionPack)
            } else {
              eventStore.emit('question:ask', _package)
            }
          }
        }
        break
      case 'question:delete':
        // question.allQids.del(packet.args.qid);
        sdkAction.dispatch('question', {
          type: SDK_TYPES.DELETE_QUESTION_ID,
          payload: {
            id: packet.args.qid
          }
        })
        break

      // 伪直播转换成功
      case 'fakelive:video:converted':
        // vodLive.set({
        //   'converted': true
        // })
        break

      // 发起投票
      case 'vote:pub':
        if (packet.args.rightUser) {
          for (var r in packet.args.rightUser) {
            packet.args.rightUser[r] = member.dealMemberAvatar(packet.args.rightUser[r])
          }
        }
        break

      // 桌面分享
      case 'video:player':
        try {
          liveControler.controlPlayer(packet)
        } catch (err) {}
        eventStore.emit('video:player', packet.args.action)
        break

      // 用户离线
      case 'member:leave':
        member.deleteMember(packet.args)
        break

      // 用户加入
      case 'member:join:other':
        packet.args.member = member.dealMemberAvatar(packet.args.member)
        var u = packet.args.member
        if (u?.uid.indexOf('client_') > -1) {
          return false
        }
        member.addMember(packet.args)
        break
      case 'member:total':
        member.setOnlineTotal(packet.args)
        packet.args = member.getOnlineTotal()
        break

      // 投票相关处理
      case 'vote:new':
        plugins.vote.setData(packet)
        break

      /**
       * ======== 小班 =========
       */
      // case "rtc:up":
      // case "rtc:down":
      // case "rtc:kick":
      // case "rtc:stop":
      // case "rtc:apply":
      // case "rtc:cancel":
      // case "rtc:force:out":
      // case "rtc:start":
      // case "rtc:ready":
      // case "rtc:invite":
      // case "rtc:zhujiang":
      //   livePlayer.dispatch(packet);
      // break;
    }
    // 默认
    return packet.args
  }

  /**
   * @param {room}
   * @ignore
   */
  _applyByInit(_rsRoom, sourceInitData) {
    var that = this,
      _room = _rsRoom

    // 设置全局变量(需要废弃)
    // that.export2Window();

    // total
    if (that.roomObject.room.online) {
      eventStore.emit('member:total', that.roomObject.room.online)
    }

    // 投票初始化对象
    plugins.vote.init(_room)

    // 设置`room`对象
    liveControler.room = _room

    // 房间模式
    eventStore.emit('room:mode:type', _room.modeType)

    // // 播放器
    // eventStore.emit('mainPlayer')

    // // 摄像头
    // eventStore.emit('camera')

    // 房间课程设置暴露（后面不要暴露属性了，这个属性应该是挂载了初始化数据的，下一次改掉）
    if (room.room) {
      eventStore.emit('live:room:configs', room.room.room)
    }

    // 当前直播相关信息(初始化)
    // if (_rsRoom.live) {
    //   var liveData = {
    //     liveId: _rsRoom.live.liveid || 0,
    //     courseId: _rsRoom.user.course_id || 0
    //   }
    //   eventStore.emit('live:data:update', liveData)
    // }
    let _liveData = toJS(sdkStore.room.liveData)
    eventStore.emit('live:data:update', _liveData)

    // 机器人
    eventStore.emit('live:robots:users', _room.robots)

    // 初始化小班模式 `usercamera:init`
    if (_room.userCamera) {
      eventStore.emit('rtc:init', _room.userCamera)
    }

    // initData.
    if (_room.initData) {
      eventStore.emit('core:initdata', _room.initData)
    }

    // 模块设置
    if (_room.roomModules) {
      eventStore.emit('live:room:modules', _room.roomModules)
    }

    // 课程
    if (_room.course) {
      eventStore.emit('live:course', _room.course)
    }

    // 初始化签到
    if (sourceInitData.signList && sourceInitData.signList.length > 0) {
      sourceInitData.signList.forEach((item) => {
        let signObj = {
          data: item || null
        }
        eventStore.emit('sign:new', signObj)
      })
    }

    // 清晰度选择
    if (sourceInitData.definition) {
      eventStore.emit('live:definition', sourceInitData.definition)
    }

    // 持久化广播事件
    that.broadcastEventInit(_room.initEvent)

    // 设置自己
    // window.MT.me = _room.curUser;

    // 初始化选择网络
    network.init(room, liveControler)

    // 房间初始化完成
    eventStore.emit('room:init')
  }

  /**
   * 暴露window事件
   * @ignore
   */
  export2Window() {
    var room = window.MT.room,
      that = this

    tools.debug('SDK => window export done...')

    // 设置全局变量 {window.MT}
    window.MT = window.MT || {}
    window.MT.SYS_CODE = version
    // 系统代码
    window.MT.CODE = STATIC.CODE
    // 静态资源
    window.MT.STATIC_HOST = STATIC.STATIC_HOST
    // 自己
    window.MT.me = room.curUser
    // 主播信息
    // window.MT.zhubo = room.zhubo;
    window.MT.zhubo = toJS(sdkStore.zhubo)
    // 直播标题
    window.MT.title = room.title
    //额外信息
    window.MT.ext = room.ext
    // 工具
    window.MT.tools = tools
    // 直播状态
    window.MT.getLiveState = that.getLiveState
    // SDK模式
    window.MT.getSDKMode = that.getSDKMode
    // 直播时间
    window.MT.liveDuration = room.livingDuration || -1
    // 通知&公告
    window.MT.announce = room.announce
    //聊天
    window.MT.chat = chat
    // 网络选择
    window.MT.network = network || {}
    // 查看详细信息
    window.MT.getDetail = member.getMemberDetail || {}
    // map
    // window.__map = map;
    //创建删除video audio
    window.MT.changeMediaElement = that.changeMediaElement
    return window.MT
  }

  /**
   * @function getMtData 获取room（房间信息）
   * @returns {object}
   * @description getMtData：获取room（房间信息）
   * @memberof TFSDK
   * @instance
   * @example
   * TF.getMtData()
   */
  getMtData() {
    return window.MT.room
  }

  /**
   * window.MT.broadcastEventInit 持久化广播事件
   * @ignore
   */
  broadcastEventInit(cmds) {
    var that = this
    if (cmds?.length > 0) {
      for (var i = 0; i < cmds.length; i++) {
        var cmd = cmds[i]['cmd'],
          ret = cmds[i]['args']
        that.get(cmd, ret)
        // 消息初始化操作
        cmdHandle.setting(cmd, ret)
      }
    }
  }
  /**
   * window.MT.getModules 获取数据库
   * @ignore
   */
  getStore() {
    return toJS(sdkStore)
  }
  /**
   * window.MT.getModules 获取模块
   * @ignore
   */
  getModules(callback) {
    if (typeof callback !== 'undefined' && typeof callback === 'function') {
      callback(toJS(sdkStore.room.modules))
    }
    return toJS(sdkStore.room.modules)
  }

  /**
   * @function playerTechOrder 切换流地址
   * @description playerTechOrder：切换流地址
   * @param {string} - flash | flv | hls
   * @memberof TFSDK
   * @instance
   * @example
   * TF.playerTechOrder('flv')
   */
  playerTechOrder(type) {
    liveControler.setPlayerTechOrder(type)
  }

  /**
   * @function destroy 销毁sdk对象
   * @memberof TFSDK
   * @instance
   * @example
   * TF.destroy() 销毁sdk对象
   */
  destroy() {
    // 关闭网络
    network.reset()
    // socket
    socket.destroy()
    // 视频 & 画板
    liveControler.destroyAll()
    // 销毁
    queue.destroy()
    // window.MT
    // if (window.MT) {
    //   window.MT = null
    // }
    // window.MT = {
    //   SDK: tools.deepClone(window.MT)
    // }
  }

  /**
   * window.MT.pptPreview 交互
   * @param {object} [传入信息]
   * @ignore
   */
  pptPreview(opts) {
    var baseOpt = {
      wrap: null,
      callback: null,
      next: null,
      prev: null
    }
    baseOpt = Object.assign(baseOpt, opts)
    pptPreview.init(baseOpt)
    // return Promise.resolve(wrapDom)
  }

  /**
   * 监听socket事件
   * @param {socket} Socket
   * @ignore
   */
  _listen(_socket) {
    var _ts = this

    // 聊天队列注册
    queue.init('chat:send', {
      min_run_num: 1,
      max_queue_time: 5000,
      max_queue_len: 1000,
      callback: function (v) {
        packetCall(v)
      }
    })

    // on _broadcast
    var obj = {}

    // Socket:包处理
    var packetCall = function (_obj) {
      tools.debug('obj===>', _obj)
      if (typeof _obj !== 'undefined') {
        // is Event in maplist

        // Trigger the Special Events
        try {
          var _ori = _obj
          var handleRes = _ts.packetHandler(_obj)
          if (handleRes) {
            if (tools.isMobileSDK() && tools.getSDKMode() == 2) {
              _ori.args = handleRes
              window.SDK.broadcast(_ori)
            } else {
              // var onEvent = map.get(_obj.cmd);
              // onEvent(handleRes);
              eventStore.emit(_obj.cmd, handleRes)
              eventStore.emit('_liveIframe:broadcast', _obj.cmd, handleRes)
            }
          }
        } catch (err) {
          // throw new Error("方法未定义");
          tools.debug(err)
        }
      }
    }

    // 未压缩命令
    _socket.on('_broadcast', function (packet) {
      // tools.debug('socket on : _broadcast', packet);
      // 压缩
      /*try{
        //packet = JSON.parse(packet);
      }catch(err){
        tools.debug("===>_broadcast Error", err);
      }*/
      // package
      tools.debug('package=====> ', packet)
      // 单条命令处理
      if (typeof packet.cmd !== 'undefined') {
        // 排除
        var obj = socket.onBroadcast(packet)
        if (obj?.cmd == 'chat:send') {
          //for(var j=0;j<500;j++){//测试，重复500条
          queue.add(obj.cmd, obj)
          //}
        } else {
          // 调用packet
          packetCall(obj)
        }

        // 批量命令处理
      } else if (packet.length) {
        //多命令缓冲
        // [{cmd:'cmd1',args:[]},{cmd:'cmd2',args:[]}]
        for (var i = 0, l = packet.length; i < l; i++) {
          var obj = socket.onBroadcast(packet[i])
          if (obj?.cmd == 'chat:send') {
            queue.add(obj.cmd, obj)
          } else {
            // 调用packet
            packetCall(obj)
          }
        }
      }
    })

    // 服务器压缩命令
    _socket.on('_bro:zip', function (packet) {
      // tools.debug('socket on : _broadcast:zip', packet);
      // 压缩
      try {
        packet = pako.inflate(packet, {
          to: 'string'
        }) // json string
        packet = JSON.parse(packet)
      } catch (err) {
        tools.debug('_bor:zip ERROR====> ', err.message)
      }
      // package
      //tools.debug("package=====> ",packet);
      // 单条命令处理
      if (typeof packet.cmd !== 'undefined') {
        // 排除
        obj = socket.onBroadcast(packet)
        // 调用packet
        packetCall(obj)
        // 批量命令处理
      } else if (packet.length) {
        //多命令缓冲
        // [{cmd:'cmd1',args:[]},{cmd:'cmd2',args:[]}]
        for (var i = 0, l = packet.length; i < l; i++) {
          obj = socket.onBroadcast(packet[i])
          packetCall(obj)
        }
      }
    })
  }

  // window 暴露调试
  _windowDebugger() {
    window.__Tmedia__ = media
    window.__Tlog__ = log
    // window.__Tstore__ = Store
    window.__Troom__ = room
    window.__Tsocket__ = socket
    // window.__Tmap__ = map
    window.__Tplayer__ = player
    window.__member__ = member
    window.__Twb__ = whiteboardPlayer
  }

  /**
   * 发送socket方法
   * @function emit 发送socket方法
   * @param {String} eventName key
   * @param {object} packet {data}
   * @param {function} callback 回调
   * @memberof TFSDK
   * @instance
   * @example
   * TF.emit('chat:send', {data}, function() {
   *    todo(...)
   * })
   */
  emit() {
    var that = this,
      args = arguments.length,
      param = arguments
    tools.debug('emit===>', param, socket.connectSuc)
    // 发送命令
    if (socket.connectSuc) {
      // 处理内部指令(本地截取)
      var isSpecial = that.emitTrigger(param)
      if (isSpecial) {
        return false
      }

      // package
      var _package = {
        cmd: param[0]
      }

      // 2项参数: ("test:Evetn", callback(ret))
      if (args === 2) {
        if (typeof param[0] === 'string' && typeof param[1] === 'function') {
          var eventName = param[0],
            callback = param[1]
          socket.emit(eventName, function (retval) {
            callback(retval)
            _package.args = retval
            that.packetHandler(_package)
          })
        }
      }
      // 3项参数: ("test:Event", {param: obj} || obj, callback(ret))
      else if (args === 3) {
        if (typeof param[0] === 'string' && typeof param[1] !== 'undefined' && typeof param[2] === 'function') {
          var eventName = param[0],
            packet = param[1],
            callback = param[2]
          if (eventName === 'chat:send') {
            if (packet.msg) {
              packet.msg = chat.toUBB(packet.msg)
            }
          }
          socket.emit(eventName, packet, function (retval) {
            // todo something...
            if (retval.code === STATIC.CODE.SUCCESS) {
              callback(retval)
              _package.args = retval
              that.packetHandler(_package)
            } else {
              callback(retval)
            }
          })
        }
      } else {
        //TODO...
        return param
      }
    }
    // 报错
    else {
      eventStore.emit('emit:error', STATIC.SOCKET_CONNECT_NOTE)
      // alert(STATIC.SOCKET_CONNECT_NOTE+": "+eventName);
    }
  }

  /**
   * 聊天模块 from chat.js
   * 删除
   * 回复
   * @ignore
   */
  chat = {
    delete: chat.delete,
    reply: chat.reply,
    private: chat.private
  }

  /**
   * 用于注册监听事件
   * @function on 注册监听事件（从Events事件集）
   * @param {String} eventName key
   * @param {function} callback 回调
   * @memberof TFSDK
   * @instance
   * @example
   * TF.on('live:start', function() {
   *    todo(...)
   * })
   */
  on(eventName, callback) {
    if (eventName?.length > 0 && typeof eventName === 'string' && typeof callback === 'function') {
      // 注册事件到maplist
      // mark eventStore全部接管之后就要删除map
      // map.put(eventName, callback);
      eventStore.on(eventName, callback)
      // 注册到 vodLive 队列
      // vodLive.register(eventName, callback)
    } else {
      alert(STATIC.MT_ADDMAPLIST_ERROR + ': ' + eventName)
    }
  }

  /**
   * 用于调用已注册事件
   * @param {eventName} String
   * @param {callback} function
   * @ignore
   * @deprecated get方法用于map（已废弃）
   */
  get(eventName, callback) {
    if (typeof eventName !== 'undefined' && eventName.length > 0 && typeof eventName === 'string') {
      // 调用maplist的事件
      eventStore.emit(eventName, callback)
    } else {
      alert(STATIC.MT_ADDMAPLIST_ERROR + ': ' + eventName)
    }
  }

  /**
   * 获取在线用户列表
   * @function member 获取在线用户列表
   * @param {function} callback
   * @memberof TFSDK
   * @instance
   * @example
   * TF.member(function(data) {
   *    todo(data)
   * })
   */
  member(callback) {
    // userlist
    if (socket.connectSuc) {
      // mark  这里要读sdkStore的数据
      // callback(member.userList);
      callback(toJS(sdkStore.member.userList))
    } else {
      return false
    }
  }

  /**
   * @function getQuestion 初始化获取提问列表
   * @param {function} callback 回调函数
   * @returns {array} 返回提问的列表
   * @memberof TFSDK
   * @instance
   * @example
   * TF.getQuestion(function(data) {
   *    todo(data)
   * })
   */
  getQuestion(callback) {
    question.getList(room.getAccessToken(), callback)
  }

  /**
   * cmd.handle 信息发射器(iFrame, Talkfun-Browser)等...
   * @param {string} key flash:check
   * @param {object} data {"stat":"0"}
   * @param {string} type
   * @ignore
   */
  cmdHandleEmit(cmd, args, type) {
    cmdHandle.sendMsgToClient(cmd, args, type)
  }

  /**
   * cmd.handle 接收iframe / py.信息
   * @param {string} key flash:check
   * @param {function} callback 回调
   * @ignore
   */
  cmdHandleOn(cmd, callback) {
    cmdHandle.on.apply(this, arguments)
  }

  /**
   * @function plugins [sdk插件]
   * @param {string | null} type plugin类型[投票, 鲜花, 抽奖, 评分]
   * @returns {object} 返回plugin对象或者plugin对象成员[投票, 鲜花, 抽奖, 评分]
   * @memberof TFSDK
   * @instance
   */
  plugins(type) {
    // [投票, 鲜花, 抽奖, 评分]
    if (plugins[type]) {
      return plugins[type]
    }
    return plugins
  }

  /**
   * @function playerResize 课件resize
   * @param {string} width
   * @param {string} height
   * @ignore
   * @deprecated playerResize是调用课件的resize，但是命名太狭窄，以后去掉改为whiteboardResize。以后将会废弃
   */
  playerResize(width, height) {
    if (liveControler.whiteboardResize) {
      return liveControler.whiteboardResize(width, height)
    }
  }

  /**
   * @function webFullScreenOther 网页全屏时隐藏指定dom元素
   * @param {string | array} 传入的id、类名
   * @description 由于网页全屏的时候可能会有样式置顶不受控制，webFullScreenOther可以记录或释放在网页全屏时需要强制隐藏的dom元素
   * @memberof TFSDK
   * @instance
   * @example
   * TF.webFullScreenOther('#id', '.class', ['#id', '.class'])
   */
  webFullScreenOther() {
    // 获取传入的id、类名，需要携带标识符
    let arg = tools.argumentToArray(arguments)
    sdkAction.dispatch('room', {
      type: TYPES.UPDATE_WEBFULLSCREEN_OTHER,
      payload: {
        domArr: arg
      }
    })
  }

  /**
   * @function whiteboardResize 课件resize
   * @param {number} width 当前外部容器的宽度
   * @param {number} height 当前外部容器的高度
   * @description whiteboardResize 1、使得课件播放器重新resize自适应容器大小，2、返回object是sdk根据传入的(100, 100)计算外部容器的宽高比例，从而可以调整在3:4容器使用9:16课件形成的黑边
   * @memberof TFSDK
   * @instance
   * @returns {object} {width, height}
   * @example
   * var object = TF.whiteboardResize(100, 100)
   * todo(object)
   */
  whiteboardResize(width, height) {
    if (liveControler.whiteboardResize) {
      return liveControler.whiteboardResize(width, height)
    }
  }

  // 播放
  play() {
    liveControler.play()
  }

  // 暂停
  pause() {
    liveControler.pause()
  }

  // 重载
  reload() {
    liveControler.reload()
  }

  // 线路选择
  setLine(key) {
    mediaControler.setLine(key)
  }

  // 点赞
  like(times, callback) {
    like.like(times, callback)
  }
  // 踢出房间
  memberKick(user, callback) {
    member.memberKick(user, callback)
  }
  // 解除踢出
  backoutKick(user, callback) {
    member.backoutKick(user, callback)
  }
  // 解除IP
  backoutKickIP(user, callback) {
    member.backoutKickIP(user.ip, callback)
  }
}
