/**
 * v1.5版本
 * Live.player(小班直播)播放器
 * Flash播放器: HT_LivePlayer.swf
 * 应用：用户可直播
 */


  /**
   * ===== Flash API =======
   * @播放流 cameraPlay(server:String='',id:String='') :Boolean
   * @停止播放 cameraStop() :Boolean
   * @推流 cameraPublish(server:String='', id:String='')
   * @检测摄像头和音频设备是否可用 checkCVUsable():Boolean
   */

// import libs
import tools from "../utils/tools"
import STATIC from './mt.static'
import map from "../utils/map"
  // livePlayer
  var livePlayer = {

    // 直播状态
    action: "stop",

    // 播放器加载状态
    livePlayerLoaded: false,

    // 主播放器ID
    mainPlayerId: null,
    containerId: null,
    playerId: null,
    playerCallback: null,

    // 当前pull对象
    userPullList: null,

    // 房间信息
    room: null,

    // 自己
    me: null,

    // 默认对象
    zhuboSmallRtmp: null,

    // 自己是否在讲台上
    isOnline: false,

    // Flash方法
    flash: null,

    // 初始化
    init: function (lpData) {

      tools.debug("liveCamera init data ==> ", lpData);

      // set action
      if (lpData.status && lpData.status !== "stop") {
        this.state("start");
      }

      // 合并对象
      var o = {};
      if (lpData.upUsers) {
        o = tools.assignObject(lpData.upUsers, o);
      }
      if (lpData.small_rtmp) {
        var me = {};
        me[lpData.small_rtmp.xid] = lpData.small_rtmp;
        this.zhuboSmallRtmp = me;
        o = tools.assignObject(o, me);
      }

      // 初始化事件
      // sava
      this.userPullList = o;
    },

    // 指令更新
    whiteboard: function (packet, cmd) {
      var retval = packet.args,
        that = this;
      if (retval.args) {
        if (retval.args.t && retval.args.t === "start") {
          // 更新small_rtmp
          if (retval.small_rtmp) {
            // var me = {};
            // me[retval.small_rtmp.xid] = retval.small_rtmp;
            // that.zhuboSmallRtmp = me;
            // 重load-小班数据
            that.init(retval);
          }
        }
      }
    },

    // 初始主播放器
    initPlayer: function (room) {
      var that = this;
      // 播放器未初始化
      if (!this.livePlayerLoaded) {
        return false;
      }
      // 设置 `curUser` 信息
      if (that.room) {
        this.me = this.room.curUser;
      }
      tools.debug('livePlayer-init.');

      // 设置 `usercamera` 对象
      var userCamera;
      if (that.room.userCamera) {
        userCamera = that.room.userCamera;
      } else {
        userCamera = {};
      }

      tools.debug("userCamera Data===>", userCamera);

      // 处理初始化用户数据
      that.doLiveCamera(userCamera);

    },
    // 初始化讲台操作
    doLiveCamera: function (data) {
      var that = this;
      if (data.upUsers) {
        // 流地址
        var pathId = null,
          push = null,
          pull = null;

        // 是否播放单个流?
        var meXid = this.room.curUser.xid;

        // 如果当前用户（自己）正在上讲台...
        if (data.upUsers[meXid] && data.status == "up") {
          that.isOnline = true;
          var curUpUserRtmp = data.upUsers[meXid];
          pathId = curUpUserRtmp.rtmp.path;
          push = curUpUserRtmp.rtmp.server_push;
          that.cameraPush(push, pathId);
          // 排除自己
          if (that.userPullList && that.userPullList[meXid]) {
            delete that.userPullList[meXid];
            // that.userPullList = data.upUsers;
          }
        }
        // 拉流逻辑播放
        // else{
        that.cameraPull();
        // }
        // rtmp 置空
        // that.room.usercamera.user.rtmp = null;
      }
    },
    // 推流
    cameraPush: function (path, id) {
      var that = this;
      this.getPlayer(function (player) {
        tools.debug("push camera ==> ", path, id);
        // setTimeout(function(){
        that.flash().jsCallFlash("live:player:open:camera", "", "livePlayer");
        // }, 200);
        player.cameraPublish(path, id);
      });
    },
    // 拉流
    cameraPull: function () {

      var that = this,
        isMePush = that.isOnline;

      // 执行flash方法
      if (this.flash) {
        tools.debug("camera pull ==> ", this.userPullList, isMePush);
        // 以 object 播放多个源
        if (isMePush) {
          this.flash().jsCallFlash("live:player:packet", this.userPullList, "cameraPlayer");
        }
        // 调用摄像头播放 stream
        else {
          this.flash().jsCallFlash("live:player:stream", STATIC.CAMERA_URL_STREAM, "cameraPlayer");
        }
      }
    },
    // 小班指令分发
    dispatch: function (packet) {
      var that = this,
        data = packet.args || null;
      tools.qtWebEngine(function (qtObj) {
        var _data = {
          act: packet.cmd
        }
        qtObj.JSSendMessage(JSON.stringify(_data))
      })
      switch (packet.cmd) {
        case "rtc:start":
          that.state("start");
          break;
        case "rtc:up":
          if (data) {
            that.up(data);
          }
          break;
        case "rtc:down":
          if (data) {
            that.down(data);
          }
          break;
        case "rtc:stop":
          if (data) {
            that.stop(data);
          }
          that.state("stop");
          break;
        case "rtc:cancel":
          that.down(data);
          break;
        // 踢下讲台
        case "rtc:kick":
          if (data) {
            that.down(data);
          }
          break;
        // 检测摄像头设备是否可用
        case "rtc:check:state":
          that.checkDeviceState(packet);
          break;
        // 邀请上讲台
        case "rtc:invite":
          that.invite(data);
          break;
      }
    },
    // 是否自己
    isMe: function (o) {
      var xid = this.room.curUser.xid;
      if (typeof o.xid === "string") {
        xid = this.room.curUser.xid.toString();
      }
      if (o && o.xid && o.xid === xid) {
        return true;
      } else {
        return false;
      }
    },

    // 新增单个
    add: function (user) {
      var that = this;
      if (!that.userPullList) {
        that.userPullList = {};
      }
      if (!that.userPullList[user.xid]) {
        that.userPullList[user.xid] = user;
      }
      // that.cameraPull();
    },

    // 删除单个
    remove: function (user) {
      var that = this;
      if (that.userPullList && that.userPullList[user.xid]) {
        delete that.userPullList[user.xid];
        // 删除FlashView容器
        if (that.flash) {
          that.flash().jsCallFlash("live:player:delete", {
            xid: user.xid
          }, "cameraPlayer");
        }
      }
      // that.cameraPull();
    },
    // 邀请某人上讲台
    invite(user) {
    },

    // 允许某人上讲台
    up: function (data) {
      var that = this;
      if (data && data.rtmp) {
        // 流地址
        var pathId = data.rtmp.path,
          push = data.rtmp.server_push,
          pull = data.rtmp.server_get;

        // 推(自己在讲台上)
        // if(data.xid == that.room.curUser.xid){
        if (that.isMe(data)) {
          that.isOnline = true;
          that.cameraPush(push, pathId);
        }
        // 新增上讲台用户对象
        else {
          that.add(data);
        }
        // 拉流播放
        that.cameraPull();
      }
    },

    // 主动下讲台
    down: function (user, force) {
      var that = this;

      // 删除对象
      this.remove(user);

      // 如果是自己，需要切换回初始化-rtmp地址播放
      // 如果传入 force 强制停止参数
      if (this.isMe(user) || force) {
        that.playerStop();
        that.isOnline = false;
        that.cameraPull();
      }

      // 重新拉流
      that.cameraPull();
    },

    // cameraplayer & liveplayer 同时停止
    playerStop: function () {
      var that = this;
      if (that.action !== "start") {
        return false;
      }
      if (this.flash) {
        tools.debug("stop & close all media...");
        this.flash().jsCallFlash("live:player:stop", "", "cameraPlayer");
        this.flash().jsCallFlash("live:player:stop", "", "livePlayer");
        that.flash().jsCallFlash("live:player:close:camera", "", "livePlayer");
      }
    },

    // 强制退出
    forceOut: function (callback) {
      if (callback) {
        callback();
      }
      this.stop();
    },
    // 清空
    clear: function () {
      this.playerStop();
      this.userPullList = that.zhuboSmallRtmp;
    },

    // 关闭讲台
    stop: function (data) {
      var that = this;

      // 关闭摄像头
      that.playerStop();

      if (data) {
        // 强制停止
        that.down(data, true);
      }

      // 重置数据
      that.isOnline = false;
      that.userPullList = that.zhuboSmallRtmp;
      if (that.room) {
        that.room.userCamera.upUsers = null;
        that.room.userCamera.applyList = [];
      }
    },

    // action => 讲台状态
    state: function (action) {
      tools.debug("live camera action ==> " + action);
      this.action = action;
      // 开讲台后嘉宾自动申请
    },

    // 踢出
    kick: function (user) {
      this.down(user);
    },
    // 设置
    setUserCamera: function () {
      var params = {},
        args = arguments,
        access_token = this.room.access_token,
        act,
        o,
        xid,
        callback;
      tools.debug("===>usercamera args", args);
      if (args.length > 0) {
        // act, object, callback
        if (args.length === 3) {
          act = args[0];
          callback = typeof (args[2]) === "function" ? callback = args[2] : function () { };

          // string
          if (typeof (args[1]) === "string" || typeof (args[1]) === "number") {
            xid = args[1];
            params = {
              act: act,
              xid: xid,
              access_token: access_token
            };
          }
          // xid, bor
          else if (typeof (args[1]) === "object") {
            o = args[1];
            params = {
              act: act,
              xid: o.xid,
              access_token: access_token
            };
            if (o.broad) {
              params.broad = o.broad
            }
            if (o.status != undefined) {
              params.status = o.status
            }
            if (o.job != undefined) {
              params.job = o.job
            }
          }
        }
        // act, callback
        else if (args.length === 2) {
          act = args[0];
          callback = typeof (args[1]) === "function" ? callback = args[2] : function () { };
          params = {
            act: act,
            access_token: access_token
          };
        }
      } else {
        return false;
      }
      tools.ajax({
        type: 'GET',
        url: STATIC.APP_HOST + '/live/webrtc.php',
        dataType: "jsonp",
        data: params,
        // jsonpCallback: "liveCameraCallback",
        success: function (retval) {
          tools.debug("userCamera post ===>", retval);
          if (retval) {
            tools.callback(callback, retval);
          }
        },
        error: function () {
          callback("error");
        }
      });
    },
    // 检查设备是否可用(以下指令由Flash回调)
    // ======================================
    // 发起：usercamera:check:state 检查状态(发起前检查)
    // 监听：usercamera:push:state 推流状态(返回:true/false)
    // 监听：usercamera:open:camera:state 打开状态(返回:true/false)
    checkDeviceState: function (o) {
      if (this.flash) {
        // this.flash().jsCallFlash("usercamera:check:state", "", "livePlayer");
        // 注册硬件检查状态
        if (o.callback) {
          map.put("live:player:check:microphone:state", o.callback);
        }
        // map.get("live:player:check:microphone:state")();
        this.flash().jsCallFlash("live:player:check:microphone:state", "", "livePlayer");
      }
    },
    // 设置主播放器
    setPlayer: function (callback) {
      var _ts = this,
        timer = null,
        handler = function () {
          if (!_ts.livePlayerLoaded) {
            //如果播放器未加载完成，则循环问
            timer = setTimeout(function () {
              handler();
            }, 200);
          } else {
            // //加载完成后，设置player
            // if(_ts.livePlayerLoaded === false){
            //     tools.getFlash(_ts.mainPlayerId);
            // }
            if (typeof callback === "function") {
              callback(tools.getFlash(_ts.mainPlayerId));
            }
            return tools.getFlash(_ts.mainPlayerId);
            // 设置主播放器
          }
        };
      handler();
    },
    // getplayer
    getPlayer: function (callback) {
      var tht = this;
      this.setPlayer(callback);
    },
    // 主播放器
    createPlayer: function (containerId, playerId, callback) {

      var that = this;

      // 创建条件
      containerId = containerId || that.containerId;
      playerId = playerId || that.playerId;
      callback = callback || that.playerCallback;

      tools.debug("render liveplayer ==> ", document.querySelector("#" + containerId), containerId, playerId);

      // DOM未创建，轮询调用本身，直到创建完成
      var playerWrap = document.querySelector("#" + containerId),
        times = 0;
      if (!playerWrap) {
        (function () {
          tools.debug("liveplayer self call ==> " + containerId);
          var _a = arguments;
          if (times > 10) {
            tools.debug("liveplayer create faild!");
            return false;
          }
          setTimeout(function () {
            var lpCon = document.querySelector("#" + containerId);
            if (lpCon) {
              that.render();
            } else {
              _a.callee();
            }
            times++;
          }, 300);
        })();
      } else {
        // 渲染
        that.render();
      }
    },

    // 渲染播放器
    render: function () {

      // 小班Flash播放器 ==> 已废弃 => 不会再创建
      return false

      // var that = this,
      //     containerId = that.containerId,
      //     playerId = that.playerId,
      //     callback = that.playerCallback;

      // // 非小班模式不创建摄像头
      // if(this.room.modeType && this.room.modeType != STATIC.ROOM.USER_CAMERA_MODE){
      //     return false;
      // }

      // var livePlayerUrl = this.room.livePlayerUrl,
      //     isShowDebug = (location.href.indexOf("debug=list") > 0) ? 'list' : '',
      //     swfVersionStr = "10.2.0",
      //     xiSwfUrlStr = "",
      //     // livePlayerUrl = livePlayerUrl, //this.room.swfUrl || testUrl,
      //     user = this.room.curUser;

      // livePlayerUrl = tools.flashDebugPath(livePlayerUrl);

      // // callback
      // if(typeof callback !== "function"){
      //     callback = function(){};
      // }

      // // setid
      // if(typeof playerId === "undefined"){
      //     throw new Error("播放器ID 未定义");
      //     return false;
      // }else{
      //     // 设置播放器id
      //     this.mainPlayerId = playerId;
      // }

      // // 主播放器
      // var flashvars = {
      //     bufferlength: STATIC.player.bufferlength,
      //     bufferTimeMax: STATIC.player.bufferTimeMax,
      //     bufferTimeArr : STATIC.player.bufferTimeArr,
      //     cmdTimeDelay : STATIC.player.cmdTimeDelay,
      //     xid : user.xid,
      //     uid : user.uid,
      //     pid : user.pid,
      //     roomid : user.roomid,
      //     initReadyId: STATIC.HT_LIVE_PLAYER,
      //     debug : isShowDebug
      // };

      // //使用服务器端配置覆盖
      // for(var k in this.room.flashvar){
      //     flashvars[k] = this.room.flashvar[k];
      // }

      // // 配置
      // var params = {};
      //     params.quality = "high";
      //     params.allowscriptaccess = "always";
      //     params.allowfullscreen = "true";
      //     params.wmode = "transparent";

      // // 参数
      // var attributes = {};
      //     attributes.id = playerId;
      //     attributes.name = playerId;
      //     attributes.align = "middle";

      // tools.debug("LivePlayer播放器渲染开始...");

      // // 创建播放器
      // try{
      //     swfobject.embedSWF(
      //         livePlayerUrl,
      //         containerId,
      //         "100%", 
      //         "100%", 
      //         swfVersionStr,
      //         xiSwfUrlStr, 
      //         flashvars, 
      //         params, 
      //         attributes
      //     );
      // }catch(e){
      //     tools.debug("liveplayer create Error ===> ", e);
      //     return false;
      // }
      // // 渲染
      // swfobject.createCSS("#"+playerId, "display:block;");
      // tools.debug("LivePlayer播放器渲染完成...");
    },

    // 播放器完成回调
    livePlayerCallback: function (callback) {
      var timer = null;
      var that = this;
      var handle = function () {
        if (that.livePlayerLoaded) {
          clearInterval(timer);
          return callback;
        }
      }
      timer = setInterval(function () {
        handle();
      }, 400);
    }
  };

  // exports
  export default livePlayer;