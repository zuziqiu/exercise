// Filename: socket.init.js
// define(function (require) {
// import package
import io from 'socket.io-client'
import log from './log'
import tools from '@tools'
import map from '@map'
import Store from '@Store'
import pako from 'pako'

/**
 * socket 事件
 * ================
 */
const socket = {
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
		this.obj.close()
		this.obj = null
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
		// 重新插入队列循环调用
		that.room.websocket.push(currentSocketServer);
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
				question.getList(MT.room.access_token, callback);
				return true;

			// 获取问答ById
			case "question:get:part":
				question.getQuestionById(packet.qid, callback);
				return true;
		}
	},

	// 头像
	dealMemberAvatar: function(args) {
		let _data = Store.getters('getInitData')
		if (!_data) {
			return ''
		}
		if (args.a && args.xid && _data.avatarHost) {
			args.avatar = _data.avatarHost + '/avatar/' + (args.xid % 255) + '/' + (args.xid % 600) + '/' + (args.xid % 1024) + '/' + args.xid + '.jpg';
		} else if (typeof args.a != 'undefined' && args.role && _data.avatarHost && _data.defaultAvatar) {
			args.avatar = _data.defaultAvatar[args.role] || _data.defaultAvatar.user;
		}
		return args;
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
		if (this.obj) {
			// socket.emit
			packet = pako.deflate(JSON.stringify(packet), {
				to: 'string'
			});
			this.obj.emit("income", packet, function (retval) {
				if (typeof retval.length != 'undefined') {
					for (var m in retval) {
						retval[m] = that.dealMemberAvatar(retval[m]);
					}
				} else if (retval.data && typeof retval.data.a != 'undefined') {
					retval.data = that.dealMemberAvatar(retval.data);
				} else if (typeof retval.a != 'undefined') {
					retval = that.dealMemberAvatar(retval);
				}
				if (typeof retval.code !== 'undefined') {
					if (retval.code === -5) {
						window.location.reload();
					} else {
						callback && callback(retval);
					}
				} else {
					callback && callback(retval);
				}
			});
		}
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
		var idata = Store.getters('getInitData')
		var onCase = {},
			_ts = this,
			xid = idata.user.xid,
			sid = idata.user.sid;
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

		// In SDK && mode=2
		//因为要对广播内容调用sdk.core的 packetHandler进行处理，而这个是先执行的，
		//所以把原生的也broadcast也抽到sdk.core，在packetHandler后执行

		// 替换 => protocol
		try {
			packet.args = tools.detectProtocol(JSON.stringify(packet.args));
			packet.args = JSON.parse(packet.args);
		} catch (err) {
			tools.debug("Broadcast-data parse Error => " + err);
		}
		// 广播
		tools.debug("Socket on: ======> " + packet.cmd, packet.args);
		onCase.cmd = packet.cmd;

		// iframe跨域发送消息
		// 特殊消息截取
		try {
			// cmdHandle.process(packet);
		} catch (err) {
			tools.debug(err.message);
		}

		// iframe通信协议
		// if(that.talkfunSender){
		// 	that.talkfunSender.sendMessage(packet.cmd, packet.args);
		// }

		//packet.ext以后可能去掉，所以要判断一下
		if (packet.cmd === 'member:total' && typeof packet.ext !== 'undefined') {
			var _tmp = packet.args;
			onCase.args = packet.ext;
			onCase.args.total = _tmp;
		} else {
			onCase.args = packet.args;
		}
		// 暴露
		// map.get(packet.cmd, packet.args)
		return onCase;
	},
	// 初始化获取问答列表
	getQuestionList: function (access_token, callback) {
		question.getList(access_token, callback);
	},
	/**
	 * 监听系统事件
	 */
	listenSystemCmd: function (_socket) {
		var that = this,
			user = this.room.user,
			connect_error_times = 0;
		try {
			// 连接成功
			_socket.on('connect', function () {
				tools.debug('服务器链接成功...');
				that.connectSuc = true; //socket链接成功
				_socket.socket_id = _socket.id;
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=connect&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				try {
					map.get("connect")();
				} catch (err) { }
			});

			// 连接失败
			_socket.on('connect_failed', function (reason) {
				tools.debug('连接服务器失败,失败信息:' + reason);
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=connect_failed&reason=' + reason + '&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("connect_failed")(reason);
			});

			// 连接错误
			_socket.on('connect_error', function (reason) {
				// 错误大于3次选择新源重连
				connect_error_times++;
				// if(connect_error_times > 3){
				try {
					//关闭旧连接
					_socket.close();
					var _socketServer = that.getSocketServer();
					//创建新连接
					that.connect(_socketServer, that.callback);
				} catch (e) { }
				// }

				tools.debug('连接服务器错误,错误信息:' + reason + ',times:' + connect_error_times);
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=connect_error&reason=' + reason + '&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("connect_error")(reason);
			});

			// 放弃连接
			_socket.on('disconnect', function (reason) {
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.socket_id + '&status=disconnect&reason=' + reason + '&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("disconnect")(reason);
			});

			// 重新连接
			_socket.on('reconnect', function (number) {
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=reconnect&number=' + number + '&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("reconnect")(number);
			});

			// 
			_socket.on('reconnect_attempt', function (number) {
				// todo..
			});

			// 重新连接中
			_socket.on('reconnecting', function (number) {
				tools.debug('正在重新连接:' + number);
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=reconnecting&number=' + number + '&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("reconnecting")(number);
			});

			// 重新连接错误
			_socket.on('reconnect_error', function (reason) {
				tools.debug('重新连接失败!');
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=reconnect_error&reason=' + reason + '&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("reconnect_error")(reason);
			});

			// 重新连接失败
			_socket.on('reconnect_failed', function () {
				tools.debug('重新连接失败...');
				log.socket('uri=' + _socket.io.uri + '&socket_id=' + _socket.id + '&status=reconnect_failed&xid=' + user.xid + '&pid=' + user.pid + '&roomid=' + user.roomid);
				map.get("reconnect_failed")();
			});

			// 监听 whiteboard 包
			_socket.on('_broadcast', function (packet) {
				var obj = that.onBroadcast(packet);
				if (obj && obj.cmd) {
					map.get(obj.cmd)(obj.args || {})
				}
			})

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
				// member.onlineUsers(res, xid);
				map.get("member:join:me")(res)

				// 房间初始化
				if (!this.roomInited) {
					// tools.debug('房间初始化完成 ====> room:init');
					this.roomInited = true;
				}
			});
		} catch (err) {
			// alert(err.message);
			map.get("system:socket:error")("系统事件:" + err.message);
			throw new Error("系统事件:" + err.message);
		}
	},
	//连接服务器
	connect: function (server, callback) {
		if (!server) {
			return false;
		}
		var room = this.room;
		var socketObject = this.obj = io.connect(server, {
			timeout: 2000,
			reconnection: true,
			multiplex: false,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			query: {
				'access_token': room.access_token,
				'sessionid': room.user.sessionid,
				'xid': room.user.xid
			}
		});

		// 监听
		this.listenSystemCmd(socketObject);
		this.onBroadcast(socketObject)
		window.__socket = socketObject

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
		let access_token = Store.getters('getToken')
		_ts.room.access_token = access_token
		if (!d.websocket) {
			tools.debug('获取聊天服务器地址失败！');
			map.get("system:socket:error")('获取聊天服务器地址失败！');
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
// return socket;
export default socket
// });