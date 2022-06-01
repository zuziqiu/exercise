// Filename: socket.init.js
import io from '../vendor/socket.io'
import log from '../utils/log'
import member from "../plugins/member/member"
import tools from "../utils/tools"
import question from "../plugins/question/question"
import pako from 'pako'
import cmdHandle from './cmdHandle'
import { eventStore } from '../eventStore/index'
import { sdkStore } from "../states"
// 生命周期函数文件
import { lifeCycle } from './lifeCycle'
/**
 * socket 事件
 * ================
 */
let socket = {
  room: null,
  callback: null,
  obj: null,
  player: null,
  connectSuc: false,
  trigger: function (target, events, args) {
    switch (args.length) {
      case 0:
        target.trigger(events, '');
        return;
      case 1:
        target.trigger(events, args[0]);
        return;
      case 2:
        target.trigger(events, args[0], args[1]);
        return;
      case 3:
        target.trigger(events, args[0], args[1], args[2]);
        return;
      default:
        target.trigger(events, args);
    }
  },

  // 销毁
  destroy: function () {
    tools.debug('socket on destroy!')
    // socket对象
    if (this.obj) {
      this.obj.close()
      this.obj.destroy()
    }
    // 日志
    if (this.logTime) {
      clearInterval(this.logTime)
      this.logTime = null
    }
  },

  // Socket-server-connect-logic
  /**
   * @重连机制
   * 每次链接错误后将尝试 3 次，如连续 3 次错误, 选择下一个源
   * 每次链接错误后，将把错误的源重新push进 `that.room.websocket` 产生一个回路
   */
  getSocketServer: function () {
    var that = this,
      currentSocketServer = that.room.websocket.shift();
    tools.debug('[socket server get] ==>', currentSocketServer)
    // 重新插入队列循环调用
    // that.room.websocket.push(currentSocketServer);
    if (!currentSocketServer) {
      tools.warn('socket => 错误,请刷新页面重试!')
      eventStore.emit('socket:on:error')
      return false
    }
    return currentSocketServer;
  },

  // 原生SDK调用
  nativeEmitMatch: function (args) {
    tools.debug("native match===>", args);
    var eventName,
      packet,
      callback;
    // arguments
    if (args.length === 2) {
      eventName = args[0];
      callback = (typeof args[1] === "function") ? args[1] : "";
    } else if (args.length === 3) {
      eventName = args[0];
      packet = args[1];
      callback = (typeof args[2] === "function") ? args[2] : "";
    }

    // 事件切换
    switch (eventName) {
      // 提问
      case "question:ask":
        var obj = {
          action: "question",
          type: "question",
          typeId: "ask",
          replyId: packet.replyId || "",
          content: packet.msg
        };
        question.quesPost("ask", obj, callback);
        return true;
      // 回答
      case "question:reply":
        var obj = {
          action: "answer",
          type: "answer",
          typeId: "reply",
          replyId: packet.replyId,
          content: packet.msg
        };
        question.quesPost("reply", obj, callback);
        return true;

      // 获取问答列表
      case "question:get:list":
        question.getList(sdkStore.room.access_token, callback);
        return true;

      // 获取问答ById
      case "question:get:part":
        question.getQuestionById(packet.qid, callback);
        return true;
    }
  },

  // socket-emit 回调
  filterOnEmitCallbackData: function (retval) {
    return retval
  },

  // 本地发送到Socket服务器 Emit().
  emit: function () {
    var that = this;

    // 封装emit包
    var packet = {
      cmd: null,
      args: []
    },
      callback = null;
    packet.cmd = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      if (typeof arguments[i] === "function") {
        callback = arguments[i];
      } else {
        packet.args.push(arguments[i]);
      }
    }
    // 发送socket请求
    // emit => 响应
    if (this.obj) {
      // socket.emit
      packet = pako.deflate(JSON.stringify(packet), {
        to: 'string'
      });
      // emit响应成功
      this.obj.emit("income", packet, function (retval) {
        // 过滤服务器数据
        retval = that.filterOnEmitCallbackData(retval)
        // 头像处理
        if (typeof retval.length != 'undefined') {
          for (var m in retval) {
            retval[m] = member.dealMemberAvatar(retval[m]);
          }
        }
        else if (typeof retval.data?.a != 'undefined') {
          retval.data = member.dealMemberAvatar(retval.data);
        } else if (typeof retval.a != 'undefined') {
          retval = member.dealMemberAvatar(retval);
        }
        if (typeof retval.code !== 'undefined') {
          if (retval.code === -5) {
            window.location.reload();
          } else {
            callback?.(retval);
          }
        } else {
          callback?.(retval);
        }
      });
    }
  },
  // Gid逻辑
  isGid: function (packet) {
    let me = sdkStore.room.initData.user
    // 自己是 => 0 不过滤 || 接收端 => 0 不过滤
    if (me?.gid === 0 || packet?.args?.gid === 0) {
      tools.debug('On Public Gid ==> ' + me.gid, packet.args.gid)
      return true
    }
    // 过滤聊天
    else if (packet.cmd?.cmd === 'chat:send') {
      if (packet.args?.gid > 0) {
        let me = sdkStore.room.initData.user
        tools.debug('Socket on Gid ==>', 'me ==>' + me.gid, 'recive ==>' + packet.args.gid)
        if (me?.gid === packet.args.gid) {
          return true
        } else {
          return false
        }
      }
    }
    return true
  },
  // 过滤
  filters: function (packet) {
    // 如果当前cmd有third:开头则认为是自定义广播
    if (packet.cmd.indexOf('third:') > -1) {
      // 统一封装成third:broadcast发送
      eventStore.emit('third:broadcast', packet)
    } else {
      switch (packet.cmd) {
        // 虚拟用户
        case 'member:robots':
          member.setRobotList(packet.args.robots.list)
          break
        // 屏蔽敏感词
        case 'chat:send':
          if (packet.args) {
            // 机器人头像
            // if (packet.args.rn > -1) {
            // 	let robotIndex = packet.args.rn
            // 	let robotUser = member.getRobotListById(robotIndex)
            // 	if (robotUser && robotUser.avatar) {
            // 		packet.args.avatar = robotUser.avatar
            // 	}
            // }
            let conf = sdkStore.room.extConfig
            if (conf?.config.filterChat) {
              let msg = packet.args.msg
              if (msg.indexOf('**') > -1) {
                return false
              }
            }
          }
          break
        default:
          break
      }
    }
    return true
  },
  /**
   * @ 接受Socket服务器事件
   * @ 会做出一些排除逻辑 
   * */
  onBroadcast: function (packet) {
    var that = this;
    if (typeof packet !== 'object') {
      return;
    }
    var onCase = {},
      _ts = this,
      xid = _ts.room.curUser.xid,
      sid = _ts.room.curUser.sid;

    // 过滤信息
    if (!this.filters(packet)) {
      return
    }

    // GID 判断
    if (!this.isGid(packet)) {
      return
    }

    if (typeof xid === 'undefined') {
      return;
    }
    if (typeof packet.nosid !== 'undefined') {
      if (packet.nosid.length > 0) {
        if (tools.in_array(sid, packet.nosid)) {
          return;
        }
      }
    }
    if (typeof packet.noxid !== 'undefined') {
      if (packet.noxid.length > 0) {
        if (tools.in_array(xid, packet.noxid)) {
          return;
        }
      }
    }

    // 替换 => protocol(to https)
    try {
      // packet.args = tools.detectProtocol(JSON.stringify(packet.args));
      packet.args = JSON.parse(packet.args);
    } catch (err) {
      tools.debug("Broadcast-data parse Error => " + err);
    }
    // 广播
    tools.debug("Socket on: ======> " + packet.cmd, packet.args);
    onCase.cmd = packet.cmd;

    // iFrame跨域发送消息
    try {
      cmdHandle.process(packet);
    } catch (err) {
      tools.debug(err.message);
    }

    //packet.ext以后可能去掉，所以要判断一下
    if (packet.cmd === 'member:total' && typeof packet.ext !== 'undefined') {
      var _tmp = packet.args;
      onCase.args = packet.ext;
      onCase.args.total = _tmp;
    } else {
      onCase.args = packet.args;
    }
    return onCase;
  },
  // 初始化获取问答列表
  getQuestionList: function (access_token, callback) {
    question.getList(access_token, callback);
  },
  // socket日志队列管理
  loggerQueue: [],
  logTime: null,
  logger: function (type, exts) {
    let user = sdkStore.room.initData.user
    let logData = {
      uri: this.obj.io.uri,
      socket_id: this.obj.id || 0,
      status: type,
      xid: user.xid,
      roomid: user.roomid
    }
    if (exts) {
      Object.assign(logData, exts)
    }
    this.loggerQueue.push(logData)
    tools.debug('socket logger ==>', type, logData)
    if (!this.logTime) {
      this.logTime = setInterval(() => {
        let logPoster = this.loggerQueue.shift()
        if (logPoster) {
          log.socket(logPoster)
        }
      }, 2500)
    }
  },
  /**
   * 监听系统事件
   */
  listenSystemCmd: function (_socket) {
    var that = this,
      user = this.room.user,
      connect_error_times = 0;
    try {
      // socket => 链接成功
      _socket.on('connect', function () {
        // 执行生命周期函数：连接成功之后
        lifeCycle.lifeControler['finishSocket']?.next()
        // 执行生命周期函数：mounted
        lifeCycle.lifeControler['mounted']?.next()
        tools.debug('服务器链接成功...');
        that.connectSuc = true;
        _socket.socket_id = _socket.id;
        that.logger('connect')
        eventStore.emit('connect')
      });

      // 连接失败
      _socket.on('connect_failed', function (reason) {
        tools.debug('[connect_failed]连接服务器失败,失败信息:' + reason);
        eventStore.emit('connect_failed', reason)
        that.logger('connect_failed', {
          reason: reason
        })
      });

      // 连接错误
      _socket.on('connect_error', function (reason) {
        tools.debug('[connect_error]连接服务器错误,错误信息:' + reason + ' ==> 错误统计次数:' + connect_error_times);
        // 错误大于3次选择新源重连
        connect_error_times += 1;
        that.reConnect(connect_error_times)
        // logger
        that.logger('connect_error', {
          reason: reason
        })
        eventStore.emit('connect_error', reason)
      });

      // 放弃连接
      _socket.on('disconnect', function (reason) {
        tools.debug('[disconnect]正在重新连接:' + reason);
        that.logger('disconnect', {
          reason: reason
        })
        eventStore.emit('disconnect', reason)
      });

      // 重新连接
      _socket.on('reconnect', function (number) {
        tools.debug('[reconnect]正在重新连接:' + number);
        that.logger('reconnect', {
          number: number
        })
        eventStore.emit('reconnect', number)
      });

      // 重新连接中
      _socket.on('reconnecting', function (number) {
        tools.debug('[reconnecting]正在重新连接:' + number);
        that.logger('reconnecting', {
          number: number
        })
        eventStore.emit('reconnecting', number)
      });

      // 重新连接错误
      _socket.on('reconnect_error', function (reason) {
        tools.debug('[reconnect_error]重新连接失败!');
        that.logger('reconnect_error', {
          reason: reason
        })
        eventStore.emit('reconnect_error', reason)
      });

      // 重新连接失败
      _socket.on('reconnect_failed', function () {
        tools.debug('[reconnect_failed]重新连接失败...');
        that.logger('reconnect_failed')
        eventStore.emit('reconnect_failed')
      });

      // 初始化在线列表
      _socket.on('member:join:me', function (res) {
        tools.debug('初始化数据完成 ====> member:join:me');
        tools.debug(res);
        var xid = user.xid;
        // Change-Protocol
        try {
          res = tools.detectProtocol(JSON.stringify(res));
          res = JSON.parse(res);
        } catch (err) {
          tools.debug("members data parse Error" + err);
        }

        // 在线用户列表
        member.onlineUsers(res, xid);
        eventStore.emit('member:join:me', res)

        // 房间初始化
        if (!this.roomInited) {
          // tools.debug('房间初始化完成 ====> room:init');
          this.roomInited = true;
        }
      });
    } catch (err) {
      // alert(err.message);
      eventStore.emit('system:socket:error', "系统事件:" + err.message)
      throw new Error("系统事件:" + err.message);
    }
  },
  // 重连
  reConnect: function (connect_error_times) {
    var that = this
    if (connect_error_times > 3) {
      try {
        //关闭旧连接
        this.obj.close();
        var socketServer = that.getSocketServer()
        // 创建新连接
        that.connect(socketServer, that.callback)
      } catch (err) {
        console.error(`[connect_error]socket链接失败 => ${err}`)
      }
    }
  },
  // 连接服务器
  connect: function (server, callback) {
    if (!server) {
      return false;
    }
    var room = this.room
    const socketObject = io.connect(server, {
      timeout: 4000,
      reconnection: true,
      multiplex: false,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      query: 'access_token=' + room.access_token + '&sessionid=' + room.user.sessionid + '&xid=' + room.user.xid
    })
    // vars
    this.obj = socketObject
    // window.__socket = socketObject
    // 公共监听
    this.listenSystemCmd(socketObject)
    // callback
    callback(socketObject)
  },

  /**
   * 初始化链接 socket.
   */
  init: function (room, callback) {
    var d = room,
      _ts = this;

    // copy the room2socket.
    _ts.room = room;
    _ts.callback = callback; //回调

    if (!d.websocket || !d.access_token) {
      tools.debug('获取聊天服务器地址失败！');
      eventStore.emit('system:socket:error', "获取聊天服务器地址失败！")
      return false;
    }

    if (typeof _ts.room.websocket === 'string') {
      _ts.room.websocket = [_ts.room.websocket];
    }

    // 链接socket服务器
    var _socketServer = _ts.getSocketServer();
    this.connect(_socketServer, callback);

    // 建立iFrame通信(如果存在跨域通信设置参数)
    // if(!_ts.talkfunSender){
    // 	_ts.talkfunSender = new iframeCross();
    // }

  }
};

// exports
export default socket
// });