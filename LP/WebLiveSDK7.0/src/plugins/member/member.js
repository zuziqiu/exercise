// 在线用户列表
// imports
import tools from "../../utils/tools"
import room from "../../core/roomModule"
import { STATIC } from '../../states/staticState'
// import map from "../../utils/map"
import { sdkStore } from '../../states'
import { sdkAction } from '../../action'
import * as TYPES from '../../action/action-types'
import { eventStore } from '../../eventStore'
/**
 * 获取 Member 列表
 * ================
*/
let member = {
  // userList: new Object(),
  // onlineXids: new Array(),
  // robotListObj: new Object(),
  // robotListAry: new Array(),
  group: { "0": 0, "all": 0 },
  // 返回在线列表(数组类型)
  getOnlineList: function () {
    var list = [];
    for (var i = 0; i < sdkStore.member.onlineXids.length; i++) {
      var xid = sdkStore.member.onlineXids.slice()[i];
      if (sdkStore.member.userList[xid]) {
        list.push(sdkStore.member.userList[xid]);
      }
    };
    return list;
  },
  // 设置机器人头像
  setAvatars: function (list) {
    if (list?.length > 0) {
      list.forEach(user => {
        // user.avatar = 'http://api.btstu.cn/sjtx/api.php?' + Math.random() * 200
        // if (user && user.avatar) {
        // 	if (user.avatar.match(/talk-fun\.com/)) {
        // 		this.dealMemberAvatar(user)
        // 	}
        // }
        // 机器人头像
        if (user?.robot > 0 && user.rn > -1) {
          let robotUser = this.getRobotListById(user.rn)
          if (robotUser) {
            user.avatar = robotUser.avatar
          }
        }
        // 普通用户设置头像
        else if (user?.a > -1) {
          this.dealMemberAvatar(user)
        }
      })
    }
  },
  // 添加在线用户列表(用户类型)
  onlineUsers: function (data, curUserXid) {
    tools.debug('member.js => online list.');
    //用户列表
    var userList = sdkStore.member.userList,
      onlineXids = sdkStore.member.onlineXids.slice();

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
  },
  // 初始化用户列表View
  renderMember: function (list) {
    eventStore.emit('member:list', list)
  },
  // Voice权限
  renderMemberPower: function (xid, voice) {
    // tools.debug("Voice-power===>", xid, voice);
    eventStore.emit('member:voice:power', xid, voice)
  },
  // 添加用户
  addMember: function (user) {
    // 用户是否已存在(添加)
    tools.debug("===>addMember", user);
    var member = user.member;
    if (member?.xid) {
      var isInlist = this.get(member.xid);
      if (isInlist) {
        return false;
      } else {
        sdkAction.dispatch('member', {
          type: TYPES.UPDATE_ONLINE_XIDS,
          payload: {
            xid: member.xid.toString()
          }
        })
        sdkAction.dispatch('member', {
          type: TYPES.UPDATE_USER_LIST,
          payload: {
            kind: 'update',
            member: member
          }
        })
        // try {
        //   // sdkStore.member.onlineXids.push(member.xid.toString());
        //   sdkAction.dispatch('member', {
        //     type: TYPES.UPDATE_ONLINE_XIDS,
        //     payload: {
        //       xid: member.xid.toString()
        //     }
        //   })
        //   sdkAction.dispatch('member', {
        //     type: TYPES.UPDATE_USER_LIST,
        //     payload: {
        //       kind: 'update',
        //       member: member
        //     }
        //   })
        //   // sdkStore.member.userList[member.xid] = member;
        // } catch (err) {
        //   tools.debug("addMember ===>", member);
        //   tools.debug("addMember error ===>", err);
        //   tools.debug(err);
        // }
      }
      this.setOnlineTotal(user);
      this.countdown(user.total);
    }
    eventStore.emit('member:list', this.getOnlineList())
  },
  // 删除用户
  deleteMember: function (user) {
    // 用户是否已存在(删除)
    var isInlist = this.get(user.xid);
    if (isInlist) {
      try {
        // delete sdkStore.member.userList[user.xid];
        sdkAction.dispatch('member', {
          type: TYPES.UPDATE_USER_LIST,
          payload: {
            kind: 'delete',
            user: user
          }
        })
      } catch (err) {
        // mark？ 删除不了就要赋值？什么操作
        // sdkStore.member.userList[user.xid] = null;
      }
      // for (var i = 0; i < sdkStore.member.onlineXids.length; i++) {
      // 	if (user.xid == sdkStore.member.onlineXids[i]) {
      // 		sdkStore.member.onlineXids.splice(i, 1);
      // 	}
      // };
      sdkAction.dispatch('member', {
        type: TYPES.DELETE_ONLINE_XIDS,
        payload: {
          user: user
        }
      })
    }
    this.setOnlineTotal(user);
    this.countdown(user.total);
    eventStore.emit('member:list', this.getOnlineList())
  },
  setOnlineTotal: function (res) {
    let __group = {}
    if (typeof res == 'number') {
      // sdkStore.member.group['all'] = res;
      __group['all'] = res;
    } else {
      if (typeof res.group === 'object') {//新进入用户gid=0时length=0
        for (var gid in res.group.total) {
          tools.debug('groups ' + gid, res.group);
          // sdkStore.member.group[gid] = res.group.total[gid];
          __group[gid] = res.group.total[gid];
        }
      }
      if (typeof res.total !== 'undefined') {
        __group['all'] = res.total;
      } else if (typeof res.online.total !== 'undefined') {
        __group['all'] = res.online.total;
      }
    }
    sdkAction.dispatch('member', {
      type: TYPES.UPDATE_GROUP,
      payload: {
        group: __group
      }
    })
  },
  // 设置虚拟用户
  setRobotList: function (list) {
    if (list?.length > 0) {
      // this.robotListAry = list
      this.setAvatars(list)
      // this.setRobotListByObject(list)
      // mark setRobotListByObject这个注释的方式因为里面有forEach当时应该是抽出来，现在不需要了
      let __robotListObj = { ...list }
      sdkAction.dispatch('member', {
        type: TYPES.UPDATE_ROBOTLIST_OBJ,
        payload: {
          robotListObj: __robotListObj
        }
      })
    }
  },
  // 获取对象列表
  // setRobotListByObject: function (list) {
  // 	this.robotListObj = {}
  // 	list.forEach((item, index) => {
  // 		if (!this.robotListObj[index]) {
  // 			this.robotListObj[index] = item
  // 		}
  // 	})
  // },
  // 获取指定对象
  getRobotListById: function (id) {
    if (sdkStore.member.robotListObj[id]) {
      return sdkStore.member.robotListObj[id]
    } else {
      return null
    }
  },
  getOnlineTotal: function () {
    if (window.MT) {
      var me = window.MT.me;
    } else {
      // mark : 这段代码可能不工作
      // var me = map.get('sdk:curuser');
    }
    var _total = 0;
    if (typeof me.gid !== 'undefined' && me.gid > 0) {
      tools.debug('group ' + me.gid);
      _total = sdkStore.member.group[me.gid] + sdkStore.member.group[0];
    } else {
      tools.debug('group all');
      _total = sdkStore.member.group['all'];
    }
    return _total;
  },
  get: function (xid) {
    if (xid) {
      return sdkStore.member.userList[xid];
    }
  },
  // 在线总人数
  countdown: function (total) {
    var _total = this.getOnlineTotal();
    eventStore.emit('member:total', _total)
    if (window.SDK && tools.isMobileSDK()) {
      SDK.call("member:total", { total: _total });
    }
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
          callback?.(ret);
        }
      }
    });
  },
  // 踢出房间
  memberKick: function (data, callback) {
    tools.ajax({
      method: "GET",
      url: STATIC.APP_HOST + "/live/member.php",
      data: {
        xid: data.xid,
        act: "kick",
        hour: data.hour,
        access_token: data.token || window.access_token,
        ip: data.ip || ''
      },
      success: function (ret) {
        if (ret.code == 0) {
          callback?.(ret);
        }
      }
    });
  },
  // 撤销踢出
  backoutKick: function (user, callback) {
    tools.ajax({
      method: "GET",
      url: STATIC.APP_HOST + "/live/member.php",
      data: {
        xid: user.xid,
        act: "free",
        access_token: user.token || window.access_token,
        ip: user.ip || ''
      },
      success: function (ret) {
        if (ret.code == 0) {
          callback?.(ret);
        }
      }
    });
  },
  // 撤销踢出
  backoutKickIP: function (ip, callback) {
    tools.ajax({
      method: "GET",
      url: STATIC.APP_HOST + "/live/member.php",
      data: {
        ip: ip,
        act: "freeip"
      },
      success: function (ret) {
        if (ret.code == 0) {
          callback?.(ret);
        }
      }
    });
  },
  // 头像获取
  dealMemberAvatar(args) {
    // 机器人头像(ext.robotAvatar是否开启真实头像)
    // if (args.robot && args.robot > 0 && room.room.ext.robotAvatar && room.room.ext.robotAvatar > 0) {
    if (args.robot && args.robot > 0 && args.rn > -1) {
      // 对应虚拟对象头像
      var rUser = null
      if (this.getRobotListById) {
        rUser = this.getRobotListById(args.rn)
      }
      // 兼容上下文变化
      else {
        rUser = member.getRobotListById(args.rn)
      }
      // replace avatar
      if (rUser?.avatar) {
        args.avatar = rUser.avatar
      }
      // 默认头像
      else {
        args.avatar = room.room.ext.defaultAvatar[args.role] || room.room.ext.defaultAvatar.user;
      }
    }
    // 用户传入头像
    else if (args.a && args.xid && room.room.ext.avatarHost) {
      args.avatar = room.room.ext.avatarHost + '/avatar/' + (args.xid % 255) + '/' + (args.xid % 600) + '/' + (args.xid % 1024) + '/' + args.xid + '.jpg';
      if (typeof args.attr == 'object' && args.attr.v) {
        args.avatar += '?v=' + args.attr.v;
      }
    }
    // 默认头像
    else if (typeof args.a != 'undefined' && args.role && room.room.ext.avatarHost && room.room.ext.defaultAvatar) {
      args.avatar = room.room.ext.defaultAvatar[args.role] || room.room.ext.defaultAvatar.user;
    }
    tools.debug('getAvatar ==>', args)
    return args;
  }
};

// exports
export default member
// });
