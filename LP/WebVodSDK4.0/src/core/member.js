// 在线用户列表
define(function (require) {
	// imports
	var tools = require("@tools"),
		room = require("./room.init"),
		STATIC = require('./mt.static'),
		map = require("@map");
	/**
	 * 获取 Member 列表
	 * ================
	*/
	var member = {
		userList: new Object(),
		onlineXids: new Array(),
		group: { "0": 0, "all": 0 },
		// 返回在线列表(数组类型)
		getOnlineList: function () {
			var list = [];
			for (var i = 0; i < this.onlineXids.length; i++) {
				var xid = this.onlineXids[i];
				if (this.userList[xid]) {
					list.push(this.userList[xid]);
				}
			};
			return list;
		},
		// 添加在线用户列表(用户类型)
		onlineUsers: function (data, curUserXid) {
			tools.debug('member.js => online list.');
			var _ts = this;
			//用户列表
			var userList = _ts.userList,
				onlineXids = _ts.onlineXids;

			// 用户角色
			var spadmin = data.online.spadmin.data,
				admin = data.online.admin.data,
				user = data.online.user.data,
				guest = data.online.guest.data,

				// 角色信息
				spadminInitList = [],
				adminInitList = [],
				userInitList = [],
				guestInitList = [];

			// 发起者
			for (var sakey in spadmin) {
				spadmin[sakey].self = false;
				if (spadmin[sakey].xid === curUserXid) {
					spadmin[sakey].self = true;
					spadminInitList.unshift(spadmin[sakey]);
				} else {
					spadminInitList.push(spadmin[sakey]);
				}
			}

			// 管理员
			for (var akey in admin) {
				admin[akey].self = false;
				if (admin[akey].xid === curUserXid) {
					admin[akey].self = true;
					adminInitList.unshift(admin[akey]);
				} else {
					adminInitList.push(admin[akey]);
				}
			}

			// 普通用户
			for (var ukey in user) {
				user[ukey].self = false;
				if (user[ukey].xid === curUserXid) {
					user[ukey].self = true;
					userInitList.unshift(user[ukey]);
				} else {
					userInitList.push(user[ukey]);
				}
			}

			// guest游客
			for (var gkey in guest) {
				guest[gkey].self = false;
				if (guest[gkey].xid === curUserXid) {
					guest[gkey].self = true;
					guestInitList.unshift(guest[gkey]);
				} else {
					guestInitList.push(guest[gkey]);
				}
			}

			// 合并
			var allList = adminInitList.concat(spadminInitList, userInitList, guestInitList);

			// 设置Hashtable {key:value}
			for (var i = 0; i < allList.length; i++) {
				if (allList[i] && typeof allList[i] === "object" && allList[i].xid !== "null") {
					// 注意：当Socket.重连
					// 需要判断用户是否已存在当前用户队列
					// 如用户不存在允许加入，否则放弃
					var xid = allList[i].xid;
					if (userList[xid]) {
						return false;
					}
					try {
						var key = allList[i].xid.toString(),
							value = allList[i];
						userList[key] = value;
						onlineXids.push(key);
					} catch (err) {
						tools.debug("onlineUsers ===>", allList);
						tools.debug("onlineUsers error ===>", err);
					}
				}
			};
			// 初始化渲染
			this.renderMember(allList);
			// 用户总数
			this.setOnlineTotal(data);
			this.countdown(data.online.total);
			// Debug:调试变量
			window.__onlineXids = this.onlineXids;
			window.__userList = this.userList;
		},
		// 初始化用户列表View
		renderMember: function (list) {
			map.get("member:list")(list);
		},
		// Voice权限
		renderMemberPower: function (xid, voice) {
			// tools.debug("Voice-power===>", xid, voice);
			map.get("member:voice:power")(xid, voice);
		},
		// 添加用户
		addMember: function (user) {
			// 用户是否已存在(添加)
			tools.debug("===>addMember", user);
			var _u = user.member;
			if (_u && _u.xid) {
				var isInlist = this.get(_u.xid);
				if (isInlist) {
					return false;
				} else {
					try {
						this.onlineXids.push(_u.xid.toString());
						this.userList[_u.xid] = _u;
					} catch (err) {
						tools.debug("addMember ===>", user);
						tools.debug("addMember error ===>", err);
						tools.debug(err);
					}
				}
				this.setOnlineTotal(user);
				this.countdown(user.total);
			}
			map.get("member:list")(this.getOnlineList());
		},
		// 删除用户
		deleteMember: function (user) {
			// 用户是否已存在(删除)
			var _u = user;
			var isInlist = this.get(_u.xid);
			if (isInlist) {
				try {
					delete this.userList[_u.xid];
				} catch (err) {
					this.userList[_u.xid] = null;
				}
				for (var i = 0; i < this.onlineXids.length; i++) {
					if (_u.xid == this.onlineXids[i]) {
						this.onlineXids.splice(i, 1);
					}
				};
			}
			this.setOnlineTotal(user);
			this.countdown(_u.total);
			map.get("member:list")(this.getOnlineList());
		},
		setOnlineTotal: function (res) {
			if (typeof res == 'number') {
				this.group['all'] = res;
			} else {
				if (typeof res.group === 'object') {//新进入用户gid=0时length=0
					for (var gid in res.group.total) {
						tools.debug('groups ' + gid, res.group);
						this.group[gid] = res.group.total[gid];
					}
				}
				if (typeof res.total !== 'undefined') {
					this.group['all'] = res.total;
				} else if (typeof res.online.total !== 'undefined') {
					this.group['all'] = res.online.total;
				}
			}

		},
		getOnlineTotal: function () {
			if (window.MT) {
				var me = window.MT.me;
			} else {
				var me = map.get('sdk:curuser');
			}
			var _total = 0;
			if (typeof me.gid !== 'undefined' && me.gid > 0) {
				tools.debug('group ' + me.gid);
				_total = this.group[me.gid] + this.group[0];
			} else {
				tools.debug('group all');
				_total = this.group['all'];
			}
			return _total;
		},
		get: function (xid) {
			if (xid) {
				return this.userList[xid];
			}
		},
		// 初始化语音权限更改TODO...
		modeVoiceProwers: function (data) {

			// 服务器数据
			var that = this,
				xids = data.xids, //权限列表
				Vmode = data.mode;//语音模式

			if (!xids && !Vmode) {
				return false;
			}

			// 本地列表
			var uxids = this.onlineXids,
				ulen = this.onlineXids.length || 0,
				userList = this.userList;

			// ======== 强制转换类型 ===========
			// 改变语音权限(1:允许 0:禁止)
			var Oxids = [],// 本地xid
				Axids = [],// 服务器xid
				Local = {};// 本地对象
			// 语音模式差异
			if (Vmode == 0) {
				// // 自由模式默认开启语音
				// for (var i = 0; i < ulen; i++) {
				// 	var xid = userList[uxids[i]].xid;
				// 	this.userList[xid].voice.enable = 1;
				// 	this.renderMemberPower(xid, this.userList[xid].voice);
				// }
				// 能说话 (==> 1)
				if (that.me) {
					that.me.voice.enable = 1;
					that.renderMemberPower(that.me.xid, that.me.voice);
				}
				// 自由模式语音黑名单(不能说话 ==> 0)
				if (xids) {
					this.VoicePowerSetting(xids, 0);
				}
			} else {
				// for (var i = 0; i < ulen; i++) {
				// 	var xid = userList[uxids[i]].xid;
				// 	this.userList[xid].voice.enable = 0;
				// 	this.renderMemberPower(xid, this.userList[xid].voice);
				// }
				if (that.me) {
					that.me.voice.enable = 0;
					that.renderMemberPower(that.me.xid, that.me.voice);
				}
				// 其他模式允许发言白名单
				if (xids) {
					this.VoicePowerSetting(xids, 1);
				}
			}
		},
		// 更改单个语音权限(传入voice对象)
		modifyOneVoicePrower: function (xid, voice, me) {
			// 存储自己数据
			if (me) {
				this.me = me;
				this.me.voice = voice;
				this.userList[xid] = me;
			}
			// 如果存在用户队列则修改权限
			var user = this.userList[xid];
			if (user) {
				this.userList[xid].voice = voice;
				this.renderMemberPower(xid, voice);
			}
		},
		// 更改多人说话权限(传入voice对象)
		VoicePowerSetting: function (xids, voicePower) {
			var that = this;
			if (xids && xids.length > 0) {
				for (var i = 0, len = xids.length; i < len; i++) {
					// if(this.userList[xids[i]]){
					// 	this.userList[xids[i]].voice.enable = voicePower;
					// 	this.renderMemberPower(xids[i], this.userList[xids[i]].voice);
					// }
					// 只激活自己的语音状态
					if (that.me.xid == xids[i]) {
						this.me.voice.enable = voicePower;
						this.renderMemberPower(xids[i], this.userList[xids[i]].voice);
					}
				};
			}
		},
		// 在线总人数
		countdown: function (total) {
			var _total = this.getOnlineTotal();
			map.get("member:total")(_total);
		},
		// 获取学员详细信息
		getMemberDetail: function (xid, callback) {
			tools.ajax({
				method: "GET",
				url: STATIC.APP_HOST + "/live/member.php",
				data: {
					xid: xid,
					act: "info",
					access_token: room.getAccessToken()
				},
				success: function (ret) {
					if (ret.code == 0) {
						if (callback) {
							callback(ret);
						}
					}
				}
			});
		},
		// 头像获取
		dealMemberAvatar: function (args) {
			if (args.a && args.xid && room.room.ext.avatarHost) {
				args.avatar = room.room.ext.avatarHost + '/avatar/' + (args.xid % 255) + '/' + (args.xid % 600) + '/' + (args.xid % 1024) + '/' + args.xid + '.jpg';
			} else if (typeof args.a != 'undefined' && args.role && room.room.ext.avatarHost && room.room.ext.defaultAvatar) {
				args.avatar = room.room.ext.defaultAvatar[args.role] || room.room.ext.defaultAvatar.user;
			}
			return args;
		}
	};

	// exports
	return member;
});
