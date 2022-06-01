/**
 * 子: => 接收文件
 * ==> 外网正式使用版本 <=====
 */

define(function (require) {

  var tools = require('./tools')

  var IframePostMessage = function (options) {

    if (options && Object.prototype.toString.call(options) !== '[object Object]') {
      throw new Error('参数应该为一个对象');
    }
    this.queue = [];
    // this.targetUrl = options.targetUrl;
    // this.iframeTag = options.iframeTag || 'talkfun_connector';
    // this.sendMessageToChild = options.sendMessageToChild || false;
    this.timer = null;
    this.hasListened = false;
    this._init();

  }


  IframePostMessage.prototype._init = function () {
    // if(!this.targetUrl) throw new Error('请传入通信地址');
    // if(!parent.window.frames[this.iframeTag])
  }


  IframePostMessage.prototype._handleParams = function (cmd, msg, type) {
    //参数小于2个
    if (arguments.length <= 2) return console.error('请输入指令和消息');

    if (typeof cmd !== 'string') return false;

    var type = type || 'broadcast';

    return JSON.stringify({ 
      cmd: cmd, 
      msg: JSON.stringify(msg), 
      type: type 
    });
  }

  //处理接受到的参数
  IframePostMessage.prototype._handleReceivedParams = function (str) {
    var obj = str
    if (typeof str === 'string') {
      try {
        obj = JSON.parse(str)
      } catch(err) {
        tools.debug('_handleReceivedParams ==> parse JSON Error!')
      }
    }
    var msg;
    try {
      msg = JSON.parse(obj.msg)
    } catch (e) {
      msg = obj.msg
    }
    return {
      cmd: obj.cmd,
      msg: msg
    }
  }

  IframePostMessage.prototype.sendMessage = function (cmd, msg, type) {
    // if(!parent.window.frames[this.iframeTag]) return false;
    var that = this;
    this.queue.push(this._handleParams(cmd, msg, type))

    if (!this.timer) {
      this.timer = setInterval(function () {
        if (that.queue.length === 0) {
          clearInterval(that.timer);
          that.timer = null;
          return false;
        }
        tools.debug('TalkFun ==> iFrame postMessage', cmd, msg, type)
        parent.window.postMessage(that.queue.shift(), '*');
      }, 100)
    }
  }

  IframePostMessage.prototype.receiveMessage = function (cb) {
    var that = this;
    if (!this._hasListened) {
      if (window.attachEvent) {
        window.attachEvent('onmessage', function (e) {
          cb && cb.call(that, that._handleReceivedParams(e.data))
        });
      } else {
        window.addEventListener('message', function (e) {
          cb && cb.call(that, that._handleReceivedParams(e.data))
        });
      }
      this._hasListened = true;
    }
    return this;
  }
  return IframePostMessage
})