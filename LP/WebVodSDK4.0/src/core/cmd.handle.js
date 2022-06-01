// Filename: cmd handle.js
// http://open.talk-fun.com/docs/js/sdk.js.live.html
// 客户端发送数据
define(function (require) {
  // import libs
  var tools = require("@tools"),
    playerCore = require('./player.core'),
    // 发送指令到客户端
    iframeCross = require("../utils/iframeCross_v3.0"),
    // QT客户端传输
    qwebchannel = require('./qwebchannel');
  // postMessage 通信桥
  var talkfunSender = new iframeCross();
  // player
  var handle = {
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
      if (this.initLockScreen) {
        that.sendMsgToClient("screen:lock", {});
      }
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
      switch (arg.t) {
        case "start":
          talkfunSender.sendMessage("live:start", packet.args);
          that.sendMsgToClient("live:start", packet.args);
          break;
        case "stop":
          talkfunSender.sendMessage("live:stop", packet.args);
          that.sendMsgToClient("live:stop", packet.args);
          break;
        case playerCore.COMMAND.CAMERA_START:
          talkfunSender.sendMessage("camera:start", packet.args);
          that.sendMsgToClient("camera:start", packet.args);
          break;
        case playerCore.COMMAND.CAMERA_STOP:
          talkfunSender.sendMessage("camera:stop", packet.args);
          that.sendMsgToClient("camera:stop", packet.args);
          break;
        default:
          talkfunSender.sendMessage(packet.cmd, packet.args);
          that.sendMsgToClient(packet.cmd, packet.args);
          break;
      }
    },
    // 发送消息(跨域发送消息)
    send: function (packet) {
      talkfunSender.sendMessage(packet.t, packet.args, packet.type);
    },
    // 检查Flash插件
    hasFlashPluginMsgToClient: function () {
      tools.debug("Did hasFlashPluginMsgToClient?...", tools.flashChecker().flash);
      if (!tools.flashChecker().flash) {
        this.sendToTBrowser({
          type: 'flash_install'
        })
      }
    },
    // 客户端心跳
    clientHeartBeat: function (close) {
      var that = this
      if (this.qtObject) {
        if (!this.qtHeartBeatTimer) {
          var data = {
            type: 'heartbeat'
          }
          // 10's 发送一次心跳
          that.sendToTBrowser(data)
          this.qtHeartBeatTimer = setInterval(function () {
            that.sendToTBrowser(data)
          }, 10 * 2500);
        }
      }
    },
    // 与QT-WebBrowserEngine建立链接
    createConnectToClient: function () {
      var that = this;
      tools.debug("Create connect to QtBrowser!...");
      var args = arguments;
      try {
        new qwebchannel.QWebChannel(qt.webChannelTransport, function (channel) {
          that.qtObject = channel.objects.interactObj;
          window.bridge = channel.objects.interactObj;
          that.clientHeartBeat()
          that.hasFlashPluginMsgToClient()
          that.doInit()
          that.isTalkFunBrowser = 1;
        });
      } catch (e) {
        // 重连
        if (that.connentTimes < 3) {
          setTimeout(function () {
            args.callee();
            that.connentTimes += 1;
          }, 2000);
        }
        tools.debug("createConnectToClient ERROR ==> " + e.message);
        that.isTalkFunBrowser = -1;
        return 2;
      }
    },
    // 发送消息给 Talkfun-Browser
    sendToTBrowser: function (data) {
      var that = this
      if (that.qtObject && data) {
        tools.debug("Send cmd to TF-BROWSER success ===> ", data);
        that.qtObject.js2py(JSON.stringify(data))
      }
    },
    // 给客户端发消息
    sendMsgToClient: function (cmd, args) {
      var that = this;
      // 忽略
      if (!tools.isTalkFunBrowser()) {
        // 非锁屏浏览器
        return false;
      }
      // that.isTalkFunBrowser = 1;
      tools.debug("send to client: ====> ", cmd, args);
      // 在客户端内
      if (that.isTalkFunBrowser === 1) {
        // 只对普通用户发送 => 特殊消息
        var user = tools.getRoom().user;
        //  普通用户
        if (user.role !== 'admin' || user.role !== 'spadmin') {
          // 根据 cmd 是否是 screen:lock 或者 screen:unlock 给 stat 赋值
          // 加锁 || 初始化已被锁屏
          if (cmd === 'screen:lock') {
            var msg = {
              type: 'ctrl',
              status: true
            }
            that.sendToTBrowser(msg);
          }
          // 解锁条件
          else if (cmd === 'screen:unlock' || cmd === "live:stop" || cmd === "member:forceout" || cmd === "member:kick") {
            var msg = {
              type: 'ctrl',
              status: false
            }
            that.sendToTBrowser(msg);
          }
        }
      }
      tools.debug("isTalkFun-Browser ===> " + that.isTalkFunBrowser);
    },
    // 总入口
    init: function () {
      tools.debug("TF-Browser Init.");
      // to .py
      tools.isTalkFunBrowser() ? this.isTalkFunBrowser = 1 : this.isTalkFunBrowser = -1;
      // 初始化链接client
      if (tools.isTalkFunBrowser()) {
        this.createConnectToClient();
      }
    }
  };

  // exports
  return handle;
});