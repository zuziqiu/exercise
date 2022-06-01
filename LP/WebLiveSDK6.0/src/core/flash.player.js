import Store from '../core/store/'
import map from '../utils/map'
import tools from '../utils/tools'
import h5Player from './h5.player-core'
import STATIC from './mt.static'
import swfobject from '../vendor/swfobject'
import media from './mediaCore'
import MT from '../sdk.core'

/**
 * # FLASH播放器
 * # 摄像头 + 画板
 */
const flashPlayer = {
  // binds
  _playerLoaded: null,
  _cameraPlayerLoaded: null,
  // init
  init() {
    this.isSupported()
    this.windowInterface()
  },
  // on player load success
  onPlayerLoadSuccess() {
    // 执行 step 指令
    this.initRunStep()
  },
  // setp 指令
  initRunStep() {
    let initData = Store.getters('getInitData')
    const exeAry = [
      media.getStep(1),
      media.getStep(2),
      media.getStep(3),
      media.getStep(4),
      media.getStep(6),
      media.getStep(7)
    ]
    // 画板
    this.getPlayer(function (player) {
      exeAry.forEach(step => {
        if (step) {
          if (player.command) {
            player.command(step)
          }
        }
      })
    })
    // 播放视频流
    this.play()
  },
  // 是否支持
  isSupported() {
    let check = tools.flashChecker()
    if (!check.flash) {
      tools.warn('PPT播放器加载失败, 请安装或允许Flash插件 (https://get.adobe.com/cn/flashplayer/)')
      tools.warn('Chrome 启用 Flash Player 方法 ==> (https://www.flash.cn/help/article/article.php?id=45)')
    }
    return check.flash
  },
  // 播放
  play(stream) {
    let mode = Store.getters('getCurMode')
    tools.debug('Flash on play...', mode)
    // 避免桌面分享重复播放
    if (mode === 'DESKTOP') {
      return false
    }
    this.getCameraPlayer(camera => {
      if (this._cameraPlayerLoaded) {
        let rtmp = null
        if (stream && stream.rtmpPath) {
          rtmp = stream.rtmpPath
        } else {
          rtmp = media.getMediaList()['rtmpPath']
        }
        if (rtmp) {
          setTimeout(() => {
            camera.cameraPlay(rtmp.path, rtmp.id)
          }, 200)
        }
      }
    })
  },

  // 停止
  stop() {
    tools.debug('Flash on stop...')
    return new Promise((reslove, reject) => {
      this.getCameraPlayer(camera => {
        if (this._cameraPlayerLoaded) {
          camera.cameraStop()
          reslove()
        }
      })
    })
  },

  // 声音
  volume(range) {
    if (MT.live) {
      if (this._cameraPlayerLoaded) {
        MT.live.cameraSetVolume(range)
      }
    }
  },
  // 外部事件监听
  on(eventName, payload) {
    // 摄像头
    if (eventName === 'camera:player') {
      const camera = Store.getters('getPlayer')['camera']
      this.camera(camera.wrapContainer, camera.playerId, camera.callback)
    }
    // ppt/video => 播放器
    if (eventName === 'video:player' || eventName === 'ppt:player') {
      let wpDom = Store.getters('getPlayer')['video']

      if (wpDom.wrapContainer && wpDom.playerId) {
        this.mainPlayer(wpDom.wrapContainer, wpDom.playerId, wpDom.callback)
      }
    }
    // 销毁 => Flash
    if (eventName === 'flash:destroy:all') {
      this.destroy()
    }
    // socket通信指令
    if (eventName === 'socket:cmd') {
      tools.debug('flash execute command ==>', payload)
      var cmd = JSON.parse(payload) || ''
      // 103 ==> 调用 cameraPlay 播放视频
      if (cmd.t == STATIC.CMD.VIDEO_START) {
        setTimeout(() => {
          this.play()
        }, 500);
      }
      // Flash ==> cmd
      this.getPlayer(player => {
        player.command(payload)
      })
    }
    // 停止直播
    if (eventName === 'live:stop') {
      this.stop()
    }
  },
  // reload
  reload(stream) {
    tools.debug('Flash on reload!')
    let mode = Store.getters('getCurMode')
    if (stream) {
      let flashApi = this.windowInterface()
      this.stop().then(() => {
        if (mode === 'DESKTOP') {
          flashApi.jsCallFlash('live:player:stream', stream.source, 'mainPlayer')
        } else {
          flashApi.jsCallFlash('live:player:stream', stream.source, 'cameraPlayer')
        }
      })
    }
    // if (stream) {
    //   let path = stream.rtmpPath.path
    //   let id = stream.rtmpPath.id
    //   // this.getPlayer(player => {
    //   //   // player.pause2()
    //   //   setTimeout(() => {
    //   //     // player.play2(path, id)
    //   //     // player.command()
    //   //   }, 100)
    //   // })
    // this.play(stream)
  },
  // 设置主播放器
  setPlayer: function (callback) {
    let flashObj = tools.getFlash(this.mainPlayerId)
    if (flashObj) {
      tools.callback(callback, flashObj)
      return flashObj
    } else {
      return false
    }
  },
  // getplayer
  getPlayer: function (callback) {
    this.setPlayer(callback);
  },
  // 设置摄像头播放器
  setCameraPlayer: function (callback) {
    let flashObj = tools.getFlash(this.cameraPlayerId)
    if (flashObj) {
      tools.callback(callback, flashObj)
      return flashObj
    } else {
      return false
    }
  },
  // 获取摄像头信息
  getCameraPlayer: function (callback) {
    this.setCameraPlayer(callback);
  },
  // 主播放器
  mainPlayer: function (containerId, playerId, callback) {
    let initData = Store.getters('getInitData')
    tools.debug('mainPlayer do Start...')
    var isShowDebug = tools.isShowDebug() ? 'list' : '',
      isSmall = isShowDebug,
      swfVersionStr = "10.2.0",
      xiSwfUrlStr = "",
      mainPlayerSwf = tools.getStaticHost(initData.swfUrl),
      room = initData,
      user = initData.user;

    // 已载入
    if (this.setPlayer()) {
      return false
    }

    // 检查Flash
    var flashResult = tools.flashChecker()
    if (!flashResult.flash) {
      tools.warn('PPT播放器加载失败, 请安装或允许Flash插件 (https://get.adobe.com/cn/flashplayer/)')
      tools.warn('Chrome 启用 Flash Player 方法 ==> (https://www.flash.cn/help/article/article.php?id=45)')
      map.get('flash:load:error')(flashResult)
      return false
    }

    // 替换debug目录
    mainPlayerSwf = tools.flashDebugPath(mainPlayerSwf);

    // callback
    if (typeof callback !== "function") {
      callback = function () { };
    }

    // setid
    if (!containerId) {
      tools.warn('mainPlayer 播放器ID 未定义')
      // throw new Error("播放器ID 未定义");
      return false;
    } else {
      // 设置播放器id
      if (!playerId) {
        playerId = containerId + '_tflash'
      }
      this.mainPlayerId = playerId;
    }

    var replaceId = containerId + '_flash'
    var tempDiv = document.createElement('div')
    tempDiv.id = replaceId
    document.querySelector(`#${containerId}`).appendChild(tempDiv)

    // 主播放器
    var flashvars = {
      bufferlength: STATIC.player.bufferlength,
      bufferTimeMax: STATIC.player.bufferTimeMax,
      bufferTimeArr: STATIC.player.bufferTimeArr,
      cmdTimeDelay: STATIC.player.cmdTimeDelay,
      xid: user.xid,
      uid: user.uid,
      pid: user.pid,
      roomid: user.roomid,
      debug: isShowDebug
    };

    //使用服务器端配置覆盖
    for (var k in room.flashvar) {
      flashvars[k] = room.flashvar[k];
    }

    // 配置
    var params = {};
    params.quality = "high";
    // params.bgcolor = "#FFFFFF";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    params.wmode = "transparent";

    // 参数
    var attributes = {};
    attributes.id = playerId;
    attributes.name = playerId;
    attributes.align = "middle";

    let flashCallback = obj => {
      if (obj && obj.ref) {
        callback(obj.ref)
      }
    }

    tools.debug("主播播放器渲染开始...");
    // 创建播放器
    try {
      swfobject.embedSWF(
        mainPlayerSwf,
        replaceId,
        "100%",
        "100%",
        swfVersionStr,
        xiSwfUrlStr,
        flashvars,
        params,
        attributes,
        flashCallback
      );
    } catch (e) {
      tools.debug('[wb]flash on error', e);
    }
    // 渲染
    swfobject.createCSS("#" + playerId, "display:block;width:100%;height:100%;");
    tools.debug("主播播放器渲染完成...");
  },
  // 摄像头
  camera: function (containerId, playerId, callback) {
    tools.debug('Camera player do Start...')
    let initData = Store.getters('getInitData')
    var _ts = this,
      isShowDebug = (location.href.indexOf("debug=list") > 0) ? 'list' : '',
      swfVersionStr = "10.2.0",
      cameraPlayerSwf = tools.getStaticHost(initData.cameraUrl),
      xiSwfUrlStr = "",
      room = initData,
      user = initData.user;

    // 已载入播放器
    if (this.setCameraPlayer()) {
      // 直接播放
      this.play()
      return false
    }

    // 检查Flash
    var flashResult = tools.flashChecker()
    if (!flashResult.flash) {
      tools.warn('Camera播放器加载失败, 请安装/允许Flash插件 (https://get.adobe.com/cn/flashplayer/)')
      tools.warn('Chrome 启用 Flash Player 方法 ==> (https://www.flash.cn/help/article/article.php?id=45)')
      map.get('flash:load:error')(flashResult)
      return false
    }

    // 替换debug目录
    cameraPlayerSwf = tools.flashDebugPath(cameraPlayerSwf);

    // callback
    if (typeof callback !== "function") {
      callback = function () { };
    }

    // setid
    if (!containerId) {
      tools.warn('Flash[camera]容器ID未定义')
      // throw new Error("播放器ID 未定义");
      return false;
    } else {
      // 设置播放器id
      tools.debug('Flash[camera]容器ID完成 ==>', containerId)
      this.cameraPlayerId = playerId;
    }

    // 创建临时div
    var replaceId = containerId + '_flash'
    var tempDiv = document.createElement('div')
    tempDiv.id = replaceId
    document.querySelector(`#${containerId}`).appendChild(tempDiv)

    //摄像头播放器
    var flashvars = {
      bufferlength: STATIC.camera.bufferlength,
      bufferTimeMax: STATIC.camera.bufferTimeMax,
      bufferTimeArr: STATIC.player.bufferTimeArr,
      xid: user.xid,
      uid: user.uid,
      pid: user.pid,
      roomid: user.roomid,
      debug: isShowDebug
    };

    //使用服务器端配置覆盖
    for (var k in room.flashvar) {
      flashvars[k] = room.flashvar[k];
    }

    // 参数
    var params = {};
    params.quality = "high";
    // params.bgcolor = "#FFFFFF";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    params.wmode = "transparent";

    // 设置
    var attributes = {};
    attributes.id = playerId;
    attributes.name = playerId;
    attributes.align = "middle";

    // 创建播放器
    let flashCallback = obj => {
      if (obj && obj.ref) {
        callback(obj.ref)
      }
    }
    try {
      // 参数 => swfobject.embedSWF(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn);
      swfobject.embedSWF(
        cameraPlayerSwf,
        replaceId,
        '100%',
        '100%',
        swfVersionStr,
        xiSwfUrlStr,
        flashvars,
        params,
        attributes,
        flashCallback
      );
    } catch (e) {
      tools.debug('[camera]Flash on error ==>', e);
    }

    // 渲染
    swfobject.createCSS("#" + playerId, "display:block;");
    tools.debug("摄像头渲染完成...");
  },
  // 摄像头初始化全部完成后回调
  cameraCallback: function (cameraPlayer) {
    var timer = null;
    var that = this;
    var handle = function () {
      tools.debug('camera-callback:' + that._cameraPlayerLoaded);
      if (that._cameraPlayerLoaded) {
        clearInterval(timer);
        map.get("cameraCallback")(cameraPlayer);
        that.initRunStep('camera')
      }
    },
      timer = setInterval(function () {
        handle();
      }, 400);
    // 获取模式(极速/兼容)
    that.getCameraPlayer(function (camera) {
      try {
        var buffer = camera.getParams("buffer");
        that.liveBuffer = JSON.parse(buffer);
        tools.debug("当前缓冲模式:===>", that.liveBuffer);
      } catch (err) {
        // 兼容模式
        that.liveBuffer = 1;
        tools.debug("缓冲模式Error", err);
      }
    });
  },
  // 主播播放器完成回调
  mainPlayerCallback: function (callback) {
    var timer = null;
    var that = this;
    var handle = function () {
      that.initRunStep('mainPlayer')
      tools.debug('mainplayer-callback:' + that._playerLoaded);
      if (that._playerLoaded) {
        clearInterval(timer);
        return callback;
      }
    }
    timer = setInterval(function () {
      handle();
    }, 400);
  },
  /**
     * @Interface for flash()
     * @MT.live 与播放器交互的所有方法
     * @param {[room]} [传入房间信息]
    */
  windowInterface() {
    var parent = this;
    const room = Store.getters('getInitData')
    tools.debug('Flash global-Interface init...')
    var live = {
      // Flash 各个模完成后执行该方法
      // 由Flash端返回 `MODID`
      // FlashVars 传入=> initReadyId
      readyModule: function (MODID) {
        tools.debug('MT.live.readyModule', MODID);
        var that = this;
        // 默认传第一个
        MODID = MODID || STATIC.HT_MAIN_PLAYER;
        // 模块初始化分发
        switch (MODID) {

          // HT_01: 大播放器
          case STATIC.HT_MAIN_PLAYER:
            return STATIC.HT_MAIN_PLAYER;

          // HT_02: 摄像头播放器
          case STATIC.HT_CAMERA_PLAYER:
            return STATIC.HT_CAMERA_PLAYER;

          // HT_03: 摄像头播放器(推流&拉流)
          case STATIC.HT_LIVE_PLAYER:
            that.livePlayerLoaded();
            return STATIC.HT_LIVE_PLAYER;
            break;
        };
        return MODID;
      },
      // 直播(学生端)推流播放器
      livePlayerLoaded: function () {
        tools.debug('MT.live.livePlayerLoaded');
        livePlayer.livePlayerLoaded = true;
        livePlayer.getPlayer(function (_livePlayer) {
          // 避免不刷新情况下重复加载
          map.get("livePlayerCallback")(_livePlayer);
          livePlayer.initPlayer();
        });
      },
      // 主播放器初始化成功
      playerLoaded: function () {
        tools.debug('MT.live.mainPlayerLoaded');
        // this.playLoaded = true; // 主播放器加载标识
        parent._playerLoaded = true; // 主播放器加载标识
        parent.getPlayer(function (mainPlayer) {
          parent.mainPlayerCallback(map.get("mainPlayerCallback")(mainPlayer));
        });
        this.syncLoad("mainPlayer LoadSuccess...");
        return true;
      },
      // 初始摄像头播放器成功
      cameraPlayerLoaded: function () {
        tools.debug('MT.live.cameraPlayerLoaded');
        var _ts = this;
        // this.cameraPlayLoaded = true; // 摄像头加载标识
        parent._cameraPlayerLoaded = true; // 摄像头加载标识
        parent.getCameraPlayer(function (cameraPlayer) {
          parent.cameraCallback(cameraPlayer);
        });
        this.syncLoad("cameraPlayer LoadSuccess...");
        return true;
      },
      // 异步(两个播放器)全部加载完成
      times: 0,
      syncLoad: function (log) {
        tools.debug("syncLoad() ===> " + log);
        var that = this;
        if (parent._playerLoaded === true && parent._cameraPlayerLoaded === true) {
          parent.onPlayerLoadSuccess();
        }
      },
      // Flash获取当前房间模式
      getVoiceMode: function () {
        tools.debug('Flash call voiceMode')
        return 'rtmp'
      },
      // Desktop 开始播发
      desktopFirstPlay: function () {
        tools.debug('desktop fplay')
        map.get('live:media:play')('desktop')
      },
      // Camera 开始播放
      cameraFirstPlay: function () {
        tools.debug('camera fplay')
        map.get('live:media:play')('camera')
      },
      // 摄像头播放开始(音频、画面)
      cameraPlay: function (server, id) {
        // tools.debug('camera call play:' + player.cameraPlayerId);
        if (player.cameraPlayerId !== null) {
          tools.getFlash(player.cameraPlayerId).cameraPlay(server, id);
        }
        tools.debug('camera playing')
        // map.get('live:media:play')('cameraPlaying')
      },
      //展开摄像头画面
      cameraShow: function () {
        tools.debug('camera call show.');
        if (parent.cameraPlayerId !== null) {
          map.get("camera:start")();
        }
      },
      //收起摄像头画面
      cameraHide: function () {
        tools.debug('camera call hide.');
        if (parent.cameraPlayerId !== null) {
          map.get("camera:stop")();
        }
      },
      // 摄像头播放停止
      cameraStop: function () {
        tools.debug('camera call stop.');
          if (parent.cameraPlayerId !== null) {
            parent.getCameraPlayer(function (camera) {
              camera.cameraStop()
            });
          }
      },
      // 摄像头音量控制
      cameraSetVolume: function (volume) {
        tools.debug("MT.live.cameraSetVolume");
        parent.getCameraPlayer(cplayer => {
          cplayer.cameraSetVolume(volume)
        })
      },
      // [重要]大播放器 => 小播放器: swfRemote(volume)
      swfRemote: function (cmd) {
        tools.debug('remote cmd ==> ', cmd)
        parent.getCameraPlayer(cplayer => {
          cplayer.swfRemote(cmd)
        })
      },
      // [重要]大播放器调用小播放器(命令)
      cameraCommand: function (cmd) {
        tools.debug("MT.live.cameraCommand");
        parent.getCameraPlayer(cplayer => {
          cplayer.cameraCommand(cmd)
        })
      },
      // [重要]小播放器回调给大播放器(命令)
      optCommand: function (cmd) {
        tools.debug("MT.live.optCommand");
        parent.getPlayer(function (mainPlayer) {
          mainPlayer.optCommand(cmd);
        });
      },
      // js => Flash
      // @参数说明
      // #cmd => 自定义指令
      // #obj => JSON类型对象
      // #whichPlayer => 播放器标识
      jsCallFlash: function (cmd, obj, whichPlayer) {
        tools.debug("MT.live.jsCallFlash", obj)
        if (typeof obj === "object") {
          obj = JSON.stringify(obj)
        } else {
          obj = ""
        }
        switch (whichPlayer) {
          // 主播放器
          case "mainPlayer":
            parent.getPlayer(function (player) {
              player.jsCallFlash(cmd, obj, whichPlayer);
            });
            break;
          // 摄像头
          case "cameraPlayer":
            parent.getCameraPlayer(function (camera) {
              camera.jsCallFlash(cmd, obj, whichPlayer);
            });
            break;
          // 小班播放器
          case "livePlayer":
            parent.getPlayer(function (liveplayer) {
              liveplayer.jsCallFlash(cmd, obj, whichPlayer);
            });
            break;
        }
      },

      // Flash => js(Flash通知js事件)
      // packet参数为数组 callbackObj: returns [eventName, {params}]
      flashCallJs: function (packet) {
        tools.debug("MT.live.flashCallJs", packet)
        var cmd = "",
          callbackObj = {};
        if (packet) {
          // tools.debug("flash call js ====>", packet);
          if (typeof packet === "object" && packet.length > 0) {
            // cmd
            if (packet[0]) {
              cmd = packet[0];
            }
            // callback
            if (packet[1]) {
              callbackObj = packet[1];
            }
          }
          // Flash返回 {string: cmd, string-JSON: Object}
          try {
            callbackObj = JSON.parse(callbackObj);
          } catch (err) { }
          // tools.debug("Flash call js ===>", callbackObj);
          callbackObj = callbackObj;
          // map.get(cmd)(callbackObj);
        } else {
          // tools.debug("Flash call javascript Error", -1);
        }
      },
      // Flash掉用事件
      flashAnnounce: function (params) {
        tools.debug("MT.live.flashAnnounce");
        if (params) {
          params = params;
        } else {
          params = "";
        }
        map.get("player:announce")(params);
        return params;
      }
    }
    return live
  },
  // 销毁
  destroy() {
    // 销毁整个类
    const camera = Store.getters('getPlayer')['camera']
    const mainPlayer = Store.getters('getPlayer')['video']
    let cDom = document.querySelector('#' + camera.playerId)
    let wDom = document.querySelector('#' + mainPlayer.playerId)
    if (cDom) {
      cDom.parentNode.removeChild(cDom)
    }
    if (wDom) {
      wDom.parentNode.removeChild(wDom)
    }
    this._playerLoaded = null
    this._playerLoaded = null
  }
}
export default flashPlayer
