// Filename: cmd handle.js
// http://open.talk-fun.com/docs/js/sdk.js.live.html
// 客户端发送数据
// define(function (require) {
// import libs
import tools from "../utils/tools"
import playerCore from './player.core'
import map from '../utils/map'
// 发送指令到客户端
var iframeCross = require("../utils/iframeCross_v3.0"),
  // QT客户端传输
  qwebchannel = require('../utils/qwebchannel');
// postMessage 通信桥
var iframeSender = new iframeCross();
// player
let handle = {
  connentTimes: 0,
  qtHeartBeatTimer: null,
  qtObject: null, //Qt对象
  createConnectMaxCount: 0,
  isTalkFunBrowser: 0, // 1 客户端浏览器  2 普通浏览器
  initLockScreen: false, //初始化锁屏
  // 设置
  setting: function (key, res) {
    // this.initCmd = key;
    if (key === "screen:lock") {
      this.initLockScreen = true;
    } else if (key === "screen:unlock") {
      this.initLockScreen = false
    }
  },
  // do at init
  doInit: function () {
    var that = this;
    // init for it
  },
  // 注册
  on: function (cmd, callback) {
    map.put('client:' + cmd, callback)
  },
  // 调用
  get: function (cmd, response) {
    map.get('client:' + cmd)(response)
  },
  // emit[发送]
  emit: function (cmd, args, callback) {
    this.sendMsgToClient.call(this, cmd, args, 2, callback)
  },
  // 发送消息
  process: function (packet) {
    var arg = null,
      that = this;
    if (packet.args.args) {
      arg = packet.args.args
    } else if (packet.args) {
      arg = packet.args
    }
    // 消息管理
    /**
     * 收到消息 ==> 发给客户端(iframe)
     */
    tools.debug('clietn socket message ==>', packet)
    switch (arg.t) {
      case "start":
        // iframeSender.sendMessage("live:start", packet.args);
        that.sendMsgToClient("live:start", packet.args);
        break;
      case "stop":
        // iframeSender.sendMessage("live:stop", packet.args);
        that.sendMsgToClient("live:stop", packet.args);
        break;
      case playerCore.COMMAND.CAMERA_START:
        // iframeSender.sendMessage("camera:start", packet.args);
        that.sendMsgToClient("camera:start", packet.args);
        break;
      case playerCore.COMMAND.CAMERA_STOP:
        // iframeSender.sendMessage("camera:stop", packet.args);
        that.sendMsgToClient("camera:stop", packet.args);
        break;
      default:
        // iframeSender.sendMessage(packet.cmd, packet.args);
        that.sendMsgToClient(packet.cmd, packet.args, 'socket');
        break;
    }
  },
  // 发送消息(跨域发送消息)
  send: function (packet) {
    iframeSender.sendMessage(packet.t, packet.args, packet.type);
  },
  // 队列
  queue: [],
  timer: null,
  timeToSend: 800,
  // 发送消息给 Talkfun-Browser
  /**
   * 发送参数说明
   * @param {String} data 传输数据
   * @param {类型} type [1 => 接收] [2 => 发送] [3 => 不处理]
   */
  sendToTBrowser: function (data, type) {
    var that = this
    if (that.qtObject && data) {
      // that.qtObject.JSSendMessage(type, JSON.stringify(data))
      this.queue.push({
        payload: data,
        type: type
      })
      if (!this.timer) {
        this.timer = setInterval(() => {
          if (this.queue.length > 0) {
            let sender = this.queue.shift()
            tools.debug("Send cmd to TF-Client success ===> ", sender);
            that.qtObject.JSSendMessage(sender.type, JSON.stringify(sender.payload))
          } else {
            window.clearInterval(this.timer)
            this.timer = null
          }
        }, this.timeToSend);
      }
    }
  },
  // 给客户端发消息
  /**
   * 
   * @param {*} cmd 指令
   * @param {*} args 携带参数
   * @param {*} type 发送类型
   * @1: A=>B 单向传输; 
   * @2: A <==> B 双向传递; 
   * @3: X ==>(client) 内部处理
   */
  sendMsgToClient: function (cmd, args, type) {
    var that = this;
    tools.debug("TalkFun-Client emit ===> ", cmd, args, type);
    var _data = {
      cmd: cmd,
      data: args
    }
    if (!type) {
      type = 1
    }
    // qt-client 发送
    if (tools.isCloudLiveBrowser()) {
      that.sendToTBrowser(_data, type)
    } 
    // iframe 发送
    else {
      iframeSender.sendMessage(cmd, args, type);
    }
  },
  // 总入口
  init: function () {
    tools.debug('CmdHandle on init.')
    tools.debug("TF-Browser Init ==>", tools.isCloudLiveBrowser())
    // to .py
    var that = this
    tools.qtWebEngine(qtObject => {
      // copy.
      this.qtObject = qtObject
      // 初始化
      that.get('on:init', that)
      // 接收Qt数据
      // 接收格式 (cmd @String, data: Json)
      qtObject.SigSendMessageToJS.connect(function (data) {
        if (typeof data === 'string') {
          var _data = JSON.parse(data)
          if (_data.cmd && _data.data) {
            that.get(_data.cmd, _data.data)
          } else {
            that.get('client:data:callback', data);
          }
        }
      })
    })
    // iframe => 响应
    iframeSender.receiveMessage(res => {
      that.get(res.cmd, res.msg)
    })

  }
};

// exports
export default handle
