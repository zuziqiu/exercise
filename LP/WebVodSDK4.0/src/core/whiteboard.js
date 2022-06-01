// define(function (require) {

var tools = require("@tools"),
  map = require("@map"),
  room = require("./vod.room"),
  STATIC = require('./mt.static'),
  video = require('./video'),
  network = require('./network');
// core = require('./player.core');

// es6
import schedule from './schedule'
import core from './player.core'
// import { fabric } from 'fabric'
import whiteboardPlayer from './whiteboard.player'
import media from './mediaCore'
// import observeRect from "@reach/observe-rect"

/*
 @ 指令数据结构command
 @ =================
 @ {"p":1,"c":"c5|1|366|318|737|605|6.4|16711680|0.6","t":16}  //这是已存在画圆的命令
 @ {"p":1,"c":"r6|1|379|515|831|795|19.2|16711680|0.6","t":17} //新加画矩形的命令
 @ {"p":1,"c":"l10|1|189|315|526|302|6.4|16711680|0.6","t":18} //新加画直线的命令
*/

var COMMAND_START = 'start'; //直播开始
var COMMAND_STOP = 'stop'; //直播结束
var COMMAND_WAIT = 'wait'; //直播未开始
var COMMAND_GRAFFITI = 1; //涂鸦,清空画笔
var COMMAND_IMAGE = 11; //图片
var COMMAND_TEXT = 15; //文字
var COMMAND_CIRCLE = 16; //画圆
var COMMAND_ERASER = 20; //橡皮擦
var COMMAND_DRAW = 25; //画画
var COMMAND_DRAW_LIST = 31; //批量
var COMMAND_PAGE = 51; //翻页
var COMMAND_ARROW = 19; //箭头

var COMMAND_CAMERA_START = 101; //摄像头启动 
var COMMAND_CAMERA_STOP = 102; //摄像头关闭

var COMMAND_VIDEO_START = 103; //推流开始
var COMMAND_VIDEO_STOP = 104; //推流结束

var COMMAND_IMAGE_PRELOAD = 1111; //TODO:图片预加载
var COMMAND_POINTER = 1112; //TODO:教棍

//指令选项
var COMMAND_OPTIONS_ACTION_ADD = 1; //新增
var COMMAND_OPTIONS_ACTION_MOVE = 2; //移动

var COMMAND_OPTIONS_VISIBLE_SHOW = 1; //展示
var COMMAND_OPTIONS_VISIBLE_HIDE = 0; //隐藏

// 4:3 比例
var width = 0;
var height = 0;

// whiteboard 模块
var whiteboard = {
  whiteboardPlayer: whiteboardPlayer,
  mainContainerId: null,
  mainPlayerId: null,
  playType: 'live',
  playerInit: false, // 播放器是否完成初始化
  duration: 0,
  currentTime: 0,
  percent: 0,
  page: 0,
  st: 0,

  // 当前页数据
  currentPageData: {
    width: 0,
    height: 0,
    dom: null
  },

  // 计算后宽高
  width: width, //主播放器当前宽度(4:3)
  height: height, //主播放器当前高度(4:3)

  // 比例
  pptRatio: 0.75, //高宽比4:3 800x600
  pptRatio_1610: 0.625, //高宽比16:10 1280x800
  pptRatio_169: 0.5625, //高宽比16:9 1280x720
  pageRatio: (4 / 3),

  // PPT
  pptWidth: 1280, //基图原始的宽度
  pptHeight: 960, //基图原始的高度

  // 播放器画板(点线面通过这个比例传输)
  drawWidth: 1280,
  drawHeight: 960,

  // 白板
  whiteBoardWidth: 800,
  whiteBoardHeight: 600,

  // 矩阵
  pptMatrix: [], //PPT(canvas)控制矩阵
  imgMatrix: [], //PPT(image)矩阵

  // 比例尺
  ratio: 0.75,
  rwidth: 800,
  rheight: 600,

  // 元素对象
  pages: {},
  canvasObj: {},
  imageObj: {},
  drawObj: {},
  lineObj: {},
  dottedLineObj: {},
  circleObj: {},
  rectangleObj: {},
  ctx: {},
  arrowObj: {}, //arrowObj[objectId] 存储3个Canvas内置对象(箭头直线,箭头两端分叉线)
  commands: {}, //当前页数据

  // 播放器初始化
  mainPlayer: function (containerId, playerId, callback) {
    this.mainContainerId = containerId;
    this.mainPlayerId = playerId;
    if (typeof callback === "function") {
      var that = this;
      var player = {
        playerId: containerId,
        width: that.width,
        height: that.height
      };
      callback(player);
    }
    var canvasObj = this.getRatio()
    this.setCanvaOffset(canvasObj.width, canvasObj.height)
    // this.initPlayerObserve()
  },
  config: function (config) {
    if (typeof config === 'object') {
      if (config.playType) {
        this.playType = config.playType;
      }
    }
  },
  // 初始化播放器监听
  initPlayerObserve: function (room) {
    // 监听变化自动适配
    if (this.mainContainerId) {
      let dom = document.querySelector('#doc')
      var rects = null
      let startObserve = observeRect(dom, rect => {
        if (rects) {
          clearTimeout(rects)
        }
        rects = setTimeout(() => {
          this.resize(rect.width)
        }, 500)
      })
      startObserve.observe()
    }
  },
  // 销毁
  destroy: function () {
    if (this.ctx['canvas-draw']) {
      this.ctx['canvas-draw'].dispose()
    }
    this.ctx = {}
  },
  // 比例计算
  getRatio: function (width, height, ratio) {
    tools.debug('setting ratio', width, height, ratio)
    var that = this;
    var pptCon = document.querySelector('#' + this.mainContainerId)
    if (!pptCon) {
      return false
    }
    var ratio = ratio || that.pageRatio;
    var w = width || pptCon.clientWidth;
    var h = height || pptCon.scrollHeight;
    var _w, _h;

    // 大于比例
    if ((w / h) > ratio) {
      _w = h * ratio;
      _h = h;
    } else {
      _w = w;
      _h = w / ratio;
    }
    this.width = _w;
    this.height = _h;
    return {
      width: _w,
      height: _h
    };
  },
  // 创建 canvas-id
  canvasId: function (type) {
    return 'canvas-' + type;
  },
  // 创建 canvas 元素
  canvas: function (type) {
    //PPT和画图层分开2个canvas
    var elementId = this.canvasId(type);
    if (!this.canvasObj[elementId]) {
      var canvas = document.getElementById(elementId);
      if (!canvas) {
        var _rc = this.getRatio();
        // canvas
        var canvas = document.createElement('canvas');
        canvas.style.width = _rc.width + 'px';
        canvas.style.height = _rc.height + 'px';
        canvas.width = _rc.width;
        canvas.height = _rc.height;
        canvas.className = 'canvas-player';
        canvas.id = elementId;
        // container
        var container = document.getElementById(this.mainContainerId);
        container.style.width = _rc.width + 'px';
        container.style.height = _rc.height + 'px';
        container.style.background = '#ffffff';
        container.style.backgroundColor = '#ffffff';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.margin = 'auto';
        var pptContainer = core.getContainer(core.constant.MODE_EDUCATION);
        if (type === 'draw') {
          canvas.style.zIndex = '2';
        } else {
          canvas.style.zIndex = '1';
        }
        canvas.style.position = 'absolute';
        pptContainer.appendChild(canvas);
      }
      this.canvasObj[elementId] = canvas;
    }
    return this.canvasObj[elementId];
  },
  // 创建 Fabric
  context: function (type) {
    var elementId = this.canvasId(type);
    if (!this.ctx[elementId]) {
      tools.debug('create context ==>', type, elementId)
      var element = this.canvas(type);
      var context = new fabric.Canvas(elementId, {
        selection: false
      });
      this.setCanvaOffset(this.width, this.height)
      context.selection = false;
      context.setDimensions({
        width: this.width,
        height: this.height
      });
      context.calcOffset();
      this.ctx[elementId] = context;
      element.parentNode.style.position = 'absolute';
      element.parentNode.style.left = '0';
    }
    return this.ctx[elementId];
  },
  // 从id获取涂鸦元素
  getDrawObjectById: function (ctx, objectId) {
    if (objectId) {
      var objects = ctx.getObjects();
      for (var j = 0, olen = objects.length; j < olen; j++) {
        if (objects[j].id === objectId) {
          return objects[j];
        }
      }
    } else {
      return null;
    }
  },
  getPpt: function () {
    var ppt = document.getElementById('ppt-image');
    if (!ppt) {
      ppt = document.createElement('img');
      ppt.id = 'ppt-image';
      ppt.style.zIndex = '0';
      document.getElementById(this.mainContainerId).appendChild(ppt);
    }
    return ppt;
  },
  dispatch: function (command, push) {
    var that = this;
    if (typeof command === 'string') {
      command = JSON.parse(command);
    }
    // 批量
    // if (command.t == COMMAND_DRAW_LIST) {
    //   var jsonCommand;
    //   for (var i = 0, len = command.d.length; i < len; i++) {
    //     jsonCommand = JSON.parse(command.d[i]);
    //     if (push) { }
    //     that.execute(jsonCommand);
    //   }
    // } else {
    // if (push) { }
    // 单条数据
    that.execute(command);
    // }
  },
  initStorage: function () {
    // 持久化
    this.st = 0;
    this.pages = {};
    this.commands = {};
    this.imageObj = {};
    this.drawObj = {};
    this.canvasObj = {};
    this.ctx = {};
    core.initialize();
  },
  // 保存指令
  pushCommands: function (command) {
    if (tools.in_array(command.t, [COMMAND_IMAGE, COMMAND_ARROW, COMMAND_TEXT, COMMAND_CIRCLE, COMMAND_ERASER, COMMAND_DRAW, COMMAND_GRAFFITI, core.COMMAND.RUBBER])) {
      if (!this.commands[command.p]) {
        this.commands[command.p] = [];
      }
      this.commands[command.p].push(command);
    } else if (command.t == COMMAND_PAGE) {
      var baseUrl = command.c.split('|')[0];
      if (!this.isWhiteBoard(command.p)) {
        //白板没有清空指令
        var currentPage = this.getPage(command.p);
        if (currentPage) {
          var currentContent = currentPage.c.split('|');
          if (baseUrl != currentContent[0]) {
            //更换PPT，清空当前页的指令
            this.flushCommands(command.p);
          }
        }
      }
      this.pages[command.p] = command;
    }
  },
  flushCommands: function (page) {
    if (this.commands[page]) {
      delete this.commands[page];
    }
  },
  getCommands: function (command, callback) {
    var page = command.p;
    if (!this.commands[page] || this.commands[page].length === 0) {
      var that = this,
        baseUrl = STATIC.APP_HOST + '/live/command.php';
      //TODO:发送请求
      if (command.hd && command.hd === "f" || that.playerInit === false) {
        tools.debug('get commands.');
        //有划线才加载指令
        tools.ajax({
          type: 'GET',
          url: baseUrl,
          dataType: 'jsonp',
          data: 'access_token=' + room.getAccessToken() + '&page=' + page,
          success: function (retval) {
            if (retval.code === STATIC.CODE.SUCCESS) {
              tools.debug('get commands from server:', retval.data);
              that.commands[page] = retval.data;
              callback(retval.data);
            }
          }
        });
      }
    } else {
      callback(this.commands[page]);
    }
  },
  getPage: function (page) {
    return this.pages[page];
  },
  execute: function (command) {
    // PHP & socket
    if (typeof command === 'string') {
      try {
        command = JSON.parse(command);
      } catch (e) {
        return tools.debug('whiteboard h5 player execute command error:' + e);
      }
    }
    tools.debug('#### ======>> [执行指令]' + command.t + ' <<======= ####')
    tools.debug('whiteboard h5 player execute:', command);
    var content;
    var that = this;

    // 开始
    if (command.t == core.COMMAND.START) {
      if (!this.startLoaded) {
        this.start(command);
        this.startLoaded = true;
      }
    }
    // 翻页
    else if (command.t == core.COMMAND.PAGE) {
      this.setPage(command);
    }
    // 画板打开
    else if (command.t == core.COMMAND.WHITEBOARD_OPEN) {
      map.get('whiteboard:open')()
    } 
    // 画板关闭
    else if (command.t == core.COMMAND.WHITEBOARD_CLOSE) {
      map.get('whiteboard:close')()
    }
    // // 画线
    // else if (command.t == core.COMMAND.DRAW) {
    //   // this.stroke(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 图片
    // else if (command.t == core.COMMAND.IMAGE) {
    //   // this.image(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 箭头
    // else if (command.t == core.COMMAND.ARROW) {
    //   // this.arrow(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 圆
    // else if (command.t == core.COMMAND.CIRCLE) {
    //   // this.circle(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 矩形
    // else if (command.t == core.COMMAND.RECTANGLE) {
    //   // this.rectangle(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 直线
    // else if (command.t == core.COMMAND.LINE) {
    //   // this.line(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 虚线
    // else if (command.t == core.COMMAND.DOTTED_LINE) {
    //   // this.dottedLine(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // // 文字
    // else if (command.t == core.COMMAND.TEXT) {
    //   // this.text(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // 权限切换
    else if (command.t == core.COMMAND.LIVE_POWER_CHANGE) {
      this.livePowerChange(command)
    }
    // // 全部清除
    // else if (command.t == core.COMMAND.GRAFFITI) {
    //   this.graffiti(command);
    // }
    // // 选区擦除
    // else if (command.t == core.COMMAND.RUBBER) {
    //   // this.rubberErase(command);
    //   // 图形处理
    //   this.graphExecute(command)
    // }
    // 视频开关
    else if (command.t == COMMAND_VIDEO_START || command.t == COMMAND_VIDEO_STOP) {
      video.videoDo(command);
    }
    // 摄像头开关
    else if (command.t == COMMAND_CAMERA_START || command.t == COMMAND_CAMERA_STOP) {
      video.cameraDo(command);
    }
    // 图片预加载
    else if (command.t == core.COMMAND.IMAGE_PRELOAD) {
      this.imagePreload(command);
    }
    // 停止
    else if (command.t == core.COMMAND.STOP) {
      this.stop(command);
    }
    // 保存对象
    that.pageContent = content;
    that.graphExecute(command)
  },
  // 画板图形处理
  graphExecute: function (command) {
    // 图形处理
    var drawTarget = [
      COMMAND_DRAW_LIST,
      // COMMAND_ARROW, 箭头暂时不支持，注释
      COMMAND_DRAW,
      COMMAND_GRAFFITI,
      COMMAND_CIRCLE,
      COMMAND_IMAGE,
      core.COMMAND.RECTANGLE,
      core.COMMAND.LINE,
      core.COMMAND.DOTTED_LINE,
      core.COMMAND.TRIANGLE,
      core.COMMAND.TEXT,
      core.COMMAND.POINTER
    ]
    if (drawTarget.indexOf(parseInt(command.t)) > -1) {
      if (whiteboardPlayer.whiteboardObject) {
        tools.debug('图形渲染 ==>', command)
        whiteboardPlayer.whiteboardObject.render({
          data: command
        })
      }
    }
  },
  start: function (command) {
    var that = this,
      user = room.user || {};
    // h5 live 
    tools.debug('h5 live start');
    this.action = command.t || "start";
    video.action = command.t;
    this.initStorage();
    // Configs
    // 初始化设置
    if (!this.isSetup) {
      video.getCameraPlayer().pause();
      map.get("live:start")();
    }
    // 直播
    if (that.playType === "live") {
      map.get("live:start")();
    }
    // 初始化成功
    this.isSetup = true;
  },
  stop: function (command) {
    this.action = command.t;
    this.clear();
    this.initStorage();
    var v = video.getCameraPlayer();
    v.pause();
    this.action = "stop";
    map.get("live:stop")();
  },
  wait: function () {
    this.action = 'wait';
    if (this.action === COMMAND_START) {
      map.get("live:stop")();
    } else {
      map.get("live:wait")();
    }
  },
  // 权限切换
  livePowerChange: function (cmd) {
    this.commands = {}
    map.get('live:power:change')(cmd)
  },
  isDraw: function (ctx, objectId) {
    var foundObject = false;
    var objects = ctx.getObjects();
    for (var j = 0; j < objects.length; j++) {
      if (objects[j].id === objectId) {
        foundObject = true;
      }
    }
    return foundObject;
  },
  // 重绘(直播点播)
  redrawCommands: function (cmds) {
    var that = this,
      page = cmds.page || this.page;
    // 直播重绘
    if (that.playType === 'live') {
      that.getCommands(cmds, function (commands) {
        if (commands.length > 0) {
          for (var i = 0; i < commands.length; i++) {
            that.dispatch(commands[i]);
          }
        }
      });
    }
    // 点播重绘
    else if (that.playType === 'playback') {
      // todo...
    }
  },
  // 重置翻页
  resizePage: function () {
    // todo...
  },
  // 翻页操作
  setPage: function (command) {
    // 翻页
    media.emit('live:set:page', command)
    // outter
    map.get("live:set:page")(command);
  },
  // seek时需要额外处理翻页
  seekPage: function (command, callback) {
    this.setPage(command)
    command.t = command.t.toString()
    if (whiteboardPlayer.whiteboardObject) {
      whiteboardPlayer.whiteboardObject.setPage(command).then(() => {
        // 翻页时清空当前页涂鸦数据
        whiteboardPlayer.whiteboardObject.clearDrawData(command.p)
        callback && callback()
      })
    } else {
      schedule.addSchedule({
        callback: function () {
          whiteboardPlayer.whiteboardObject.setPage(command).then(() => {
            // 翻页时清空当前页涂鸦数据
            whiteboardPlayer.whiteboardObject.clearDrawData(command.p)
            callback && callback()
          })
        },
        type: 'wb'
      });
    }
  },
  //图片偏移矩阵
  transform: function (obj, matrix) {
    obj.style.setProperty('transform', 'matrix(' + matrix + ')');
    obj.style.setProperty('-ms-transform', 'matrix(' + matrix + ')'); //IE9
    obj.style.setProperty('-webkit-transform', 'matrix(' + matrix + ')'); //Safari and Chrome
    obj.style.setProperty('-o-transform', 'matrix(' + matrix + ')');
    //Opera
    obj.style.setProperty('-moz-transform', 'matrix(' + matrix + ')');
    //Firefox
  },
  // 图片
  image: function (command) {
    var that = this;
    var content = command.c.split('|');
    var objectId = content[0];
    var imageUrl = content[1];
    var visible = parseInt(content[2]) === COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var action = content[3];
    var options = content[4].split(',');
    var left = parseFloat(options[4]);
    var top = parseFloat(options[5]);

    var ctx = this.context('ppt');

    var scaleX = this.scaleX(ctx, command.p);
    var scaleY = this.scaleY(ctx, command.p);
    var matrixA = parseFloat(options[0]);
    var matrixD = parseFloat(options[3]);
    var matrix = []
    if (scaleX > 0) {
      matrix = [
        parseFloat(1),
        parseFloat(options[1]),
        parseFloat(options[2]),
        parseFloat(1),
        parseFloat(options[4]),
        parseFloat(options[5])
      ];
    }
    // 图片
    if (!that.imageObj[objectId]) {
      //if(action == COMMAND_OPTIONS_ACTION_ADD){
      if (scaleX <= 0) {
        return
      }
      that.imageObj[objectId] = objectId;
      fabric.Image.fromURL(imageUrl, function (img) {
        var origin = img.getOriginalSize()
        img.id = objectId;
        img.originWidth = origin.width;
        img.originHeight = origin.height;
        img.width = img.width;
        img.height = img.height;
        img.scaleX = scaleX
        img.scaleY = scaleY

        img.selectable = false;
        img.visible = visible; //是否显示
        img.transformMatrix = matrix;
        img.backgroundColor = 'red';

        that.imageObj[objectId] = img;
        ctx.add(img);
        img.setCoords();
      });
      //}
    } else {
      var time = 0;
      if (that.imageObj[objectId] === objectId) {
        time = 1;
      }
      function moveImage(time) {
        setTimeout(function () {
          if (that.imageObj[objectId] !== objectId) {
            that.imageObj[objectId].width = that.imageObj[objectId].originWidth;
            that.imageObj[objectId].height = that.imageObj[objectId].originHeight;

            that.imageObj[objectId].visible = visible;
            that.imageObj[objectId].transformMatrix = matrix;

            if (!that.isDraw(ctx, objectId)) {
              ctx.add(that.imageObj[objectId]);
            }

            //放到前面
            if (visible) {
              ctx.bringToFront(that.imageObj[objectId]);
              ctx.renderAll();
            } else {
              ctx.remove(that.imageObj[objectId]);
              delete that.imageObj[objectId];
            }
          } else {
            moveImage(time);
          }
        }, time * 1000);
      }
      moveImage(time);
    }
  },
  loadImage: function (url, callback) {
    var that = this;
    if (that.imageObj[url]) {
      return callback(that.imageObj[url]);
    }
    // 支持webp的，改为加载web
    tools.webpSupport(function (isWebpSupport) {
      if (isWebpSupport == true) {
        url = url.replace('.jpg', '.jpeg');
      }
      url = network.getRetryUrl(url);
      var img = new Image();
      img.src = url;
      img.onload = function () {
        that.imageObj[url] = img;
        callback(img);
      };
      //失败重load
      img.onerror = function () {
        network.loadRetry(url, function (_oriUrl) {
          that.loadImage(_oriUrl, callback);
        });
      }
    });
  },
  imagePreload: function (command) {
    //"{"st":439,"p":6,"c":"http://p1.rye-tech.com/doc/9a/08/ea/c460caa2165d19a2a39b6d13fa/|6|8|1,0,0,1,0,0|23356|1","t":1111}"    
    var content = command.c.split('|');
    var imageUrl = content[0] + content[1] + '_' + content[5] + '.jpg';
    this.loadImage(imageUrl, function (img) {
      tools.debug('image preload success:' + imageUrl);
    });
  },
  // 圆形
  circle: function (command) {
    //c7|1|368|251|477|318|4|16777215     
    //名字|是否显示|起始坐标X|起始坐标Y|终止坐标X|终止坐标Y|线粗细|颜色
    var ctx = this.context('draw');
    var content = command.c.split('|');
    var top, left, rx, ry;

    //椭圆矩形框的两个对角
    var objectId = content[0];
    var visible = content[1] == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var x1 = parseFloat(content[2]);
    var y1 = parseFloat(content[3]);
    var x2 = parseFloat(content[4]);
    var y2 = parseFloat(content[5]);

    if (x2 > x1) {
      top = y1;
      left = x1;
      rx = (x2 - x1) / 2;
      ry = (y2 - y1) / 2;
    } else {
      top = y1;
      left = x2;
      rx = (x1 - x2) / 2;
      ry = (y2 - y1) / 2;
    }

    var scaleX = this.scaleX(ctx, command.p);
    var scaleY = this.scaleY(ctx, command.p);

    if (!this.circleObj[objectId] || !this.isDraw(ctx, objectId)) {
      var c = new fabric.Ellipse({
        id: objectId,
        top: top * scaleX,
        left: left * scaleY,
        rx: rx,
        ry: ry,
        fill: '',
        stroke: this.getColor(content[7]),
        strokeWidth: parseInt(content[6]),
        scaleX: scaleX,
        scaleY: scaleY,
        selectable: false,
        visible: visible
      });
      ctx.add(c);
      this.circleObj[objectId] = c;
    } else {
      this.circleObj[objectId].visible = visible;
      ctx.renderAll();
    }
  },
  // 箭头
  arrow: function (command) {

    /**==== t=19箭头参数说明 ========
     * c 数据参数（ “|”分割 ）
     * 第一个参数：涂鸦实例名称
     * 第二个参数：是否显示（visible）
        
     * 第三个参数：开始坐标X （startX）
     * 第四个参数：开始坐标Y （startY）

     * 第五个参数：结束坐标X （endX）
     * 第六个参数：结束坐标X （endY）

     * 第七个参数：thickness 线的宽度
     * 第八个参数：颜色值
     * 第六个参数：透明度（lineAlpha）
    */

    var content = command.c.split('|'),
      ctx = this.context('draw'),
      objectId = content[0],
      that = this,
      visible = content[1]; //== COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;

    // 是否可见
    visible = (visible == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false);

    // arrow.objectId = {a, b, c};
    var arrowLine = objectId,
      arrow_head_1 = objectId + "_arrow_1",
      arrow_head_2 = objectId + "_arrow_2";

    // 缩放比例
    var scaleX = this.scaleX(ctx, command.p),
      scaleY = this.scaleY(ctx, command.p);

    // 箭头主线参数
    var x1 = parseInt(content[2], 10),
      y1 = parseInt(content[3], 10),
      x2 = parseInt(content[4], 10),
      y2 = parseInt(content[5], 10),
      thickness = parseInt(content[6], 10) * scaleX,
      opacity = parseInt(content[8], 10);

    // 设置节点
    var points = {
      sp: {
        x: x1,
        y: y1,
      },
      ep: {
        x: x2,
        y: y2
      }
    };
    // 创建箭头对象
    if (!this.arrowObj[objectId] || !this.isDraw(ctx, objectId)) {

      // 旋转角标
      var rotationConer = function (p, angle) {
        return {
          x: p.x * Math.cos(angle) + p.y * Math.sin(angle),
          y: p.y * Math.cos(angle) - p.x * Math.sin(angle)
        };
      };
      // 计算头部坐标
      var calcCoordinate = function (pos) {
        // (x1,y1), (x2,y2)
        var sp = pos.sp,
          ep = pos.ep;

        var dx = (ep.x - sp.x) * scaleX,
          dy = (ep.y - sp.y) * scaleY;

        // 计算两点间的弧度
        var angle = (Math.atan((dx) / (dy))),
          cep = rotationConer(ep, -angle),
          csp = rotationConer(sp, -angle);

        var p1 = {
          x: 0,
          y: 0
        };

        var p2 = {
          x: 0,
          y: 0
        };

        // 计算箭头分叉线长度
        var l = cep.y - csp.y,
          arrowWidth = 10 + thickness * 8;
        if (l > 0) {
          l = arrowWidth = arrowWidth * 1;
        } else {
          l = arrowWidth = arrowWidth * -1;
        }

        // 得到箭头长度坐标
        p1.x = cep.x + l; // * (a.sharp || timesX);
        p1.y = cep.y - l; // * (a.size || timesY);
        p2.x = cep.x - l; // * (a.sharp || timesX);
        p2.y = cep.y - l; // * (a.size || timesY);

        // 计算箭头旋转角度
        var g1 = rotationConer(p1, angle),
          g2 = rotationConer(p2, angle);

        return {
          g1: g1,
          g2: g2
        };
      };

      // 得到旋转后的箭头坐标组
      var posGroup = calcCoordinate(points);

      // 箭头基线 & 箭头交叉角
      var baseLine = [
        points.sp.x * scaleX,
        points.sp.y * scaleY,
        points.ep.x * scaleX,
        points.ep.y * scaleY
      ],
        o = [
          points.ep.x * scaleX,
          points.ep.y * scaleY,
          posGroup.g1.x * scaleX,
          posGroup.g1.y * scaleY,
        ],
        o2 = [
          points.ep.x * scaleX,
          points.ep.y * scaleY,
          posGroup.g2.x * scaleX,
          posGroup.g2.y * scaleY
        ];

      var arrow_1 = new fabric.Line(o, {
        id: arrow_head_1,
        stroke: this.getColor(content[7]),
        strokeWidth: thickness,
        cornerStyle: "circle",
        opacity: opacity,
        visible: visible
      });

      var arrow_2 = new fabric.Line(o2, {
        id: arrow_head_2,
        stroke: this.getColor(content[7]),
        strokeWidth: thickness,
        cornerStyle: "circle",
        opacity: opacity,
        visible: visible
      });

      var line = new fabric.Line(baseLine, {
        id: arrowLine,
        childs: [arrow_1, arrow_2], //箭头分叉子元素
        stroke: this.getColor(content[7]),
        strokeWidth: thickness,
        cornerStyle: "circle",
        opacity: opacity,
        visible: visible
      });

      line.selectable = false;
      arrow_1.selectable = false;
      arrow_2.selectable = false;

      // 添加到ctx
      ctx.add(line, arrow_1, arrow_2);

      // 存储arrow
      this.arrowObj[objectId] = {
        baseLine: line,
        arrow_n1: arrow_1,
        arrow_n2: arrow_2
      };

    } else {
      // 设置可见性
      this.arrowObj[objectId].baseLine.visible = visible;
      this.arrowObj[objectId].arrow_n1.visible = visible;
      this.arrowObj[objectId].arrow_n2.visible = visible;
      ctx.renderAll();
    }
  },

  // 矩形
  rectangle: function (command) {
    //{"st":7.2,"p":10002,"c":"r3|1|195|232|322|333|4|16711680|1","t":17}
    //<rectangle startTime="5" name="r4" visible="1" startX="232" startY="129" endX="345" endY="208" thickness="4" lineAlpha="1" color="16711680"/>
    var ctx = this.context('draw');
    var content = command.c.split('|');

    var top, left, width, height;

    //椭圆矩形框的两个对角
    var objectId = content[0];
    var visible = content[1] == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var x1 = parseFloat(content[2]);
    var y1 = parseFloat(content[3]);
    var x2 = parseFloat(content[4]);
    var y2 = parseFloat(content[5]);

    if (x2 > x1) {
      top = y2;
      left = x1;
      width = x2 - x1;
      height = y1 - y2;
    } else {
      top = y1;
      left = x1;
      width = x2 - x1;
      height = y2 - y1;
    }

    var scaleX = this.scaleX(ctx, command.p);
    var scaleY = this.scaleY(ctx, command.p);

    // create a rectangle object
    if (!this.rectangleObj[objectId] || !this.isDraw(ctx, objectId)) {
      var rect = new fabric.Rect({
        id: objectId,
        left: left * scaleX,
        top: top * scaleY,
        fill: '',
        width: width,
        height: height,
        stroke: this.getColor(content[7]),
        strokeWidth: parseInt(content[6]) / 2,
        scaleX: scaleX,
        scaleY: scaleY,
        selectable: false,
        visible: visible
      });

      // "add" rectangle onto canvas
      ctx.add(rect);
      this.rectangleObj[objectId] = rect;
    } else {
      this.rectangleObj[objectId].visible = visible;
      ctx.renderAll();
    }
  },
  // 直线
  line: function (command) {
    //{"st":46.4,"p":10002,"c":"l14|1|294|366|351|425|4|0|1","t":18}
    //<line startTime="24.8" name="l8" visible="1" startX="401" startY="333" endX="580" endY="362" thickness="4" lineAlpha="1" color="8474908"/>
    var ctx = this.context('draw');
    var content = command.c.split('|');
    var top, left;

    var objectId = content[0];
    var visible = content[1] == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var x1 = parseFloat(content[2]);
    var y1 = parseFloat(content[3]);
    var x2 = parseFloat(content[4]);
    var y2 = parseFloat(content[5]);

    if (x2 > x1) {
      top = y1;
      left = x1;
    } else {
      top = y1;
      left = x2;
    }

    var scaleX = this.scaleX(ctx, command.p);
    var scaleY = this.scaleY(ctx, command.p);

    if (!this.lineObj[objectId] || !this.isDraw(ctx, objectId)) {
      var coords = [
        x1 * scaleX,
        y1 * scaleY,
        x2 * scaleX,
        y2 * scaleY
      ];
      var line = new fabric.Line(coords, {
        id: objectId,
        //top:top,
        //left:left,
        fill: '',
        stroke: this.getColor(content[7]),
        strokeWidth: parseInt(content[6]) / 2,
        //scaleX:scaleX,
        //scaleY:scaleY,
        selectable: false,
        visible: visible
      });

      ctx.add(line);
      this.lineObj[objectId] = line;
    } else {
      this.lineObj[objectId].visible = visible;
      ctx.renderAll();
    }

  },
  // 虚线
  dottedLine: function (command) {
    //{"st":46.4,"p":10002,"c":"l14|1|294|366|351|425|4|0|1","t":18}
    //<line startTime="24.8" name="l8" visible="1" startX="401" startY="333" endX="580" endY="362" thickness="4" lineAlpha="1" color="8474908"/>
    var ctx = this.context('draw');
    var content = command.c.split('|');
    var top, left;

    var objectId = content[0];
    var visible = content[1] == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var x1 = parseFloat(content[2]);
    var y1 = parseFloat(content[3]);
    var x2 = parseFloat(content[4]);
    var y2 = parseFloat(content[5]);

    if (x2 > x1) {
      top = y1;
      left = x1;
    } else {
      top = y1;
      left = x2;
    }

    var scaleX = this.scaleX(ctx, command.p);
    var scaleY = this.scaleY(ctx, command.p);

    if (!this.dottedLineObj[objectId] || !this.isDraw(ctx, objectId)) {
      var coords = [
        x1 * scaleX,
        y1 * scaleY,
        x2 * scaleX,
        y2 * scaleY
      ];

      var dashA = 5 + (parseInt(content[6]) / 2),
        dashB = 5 + (parseInt(content[6]) / 2);

      var line = new fabric.Line(coords, {
        id: objectId,
        //top:top,
        //left:left,
        strokeDashArray: [dashA, dashB],
        fill: '',
        stroke: this.getColor(content[7]),
        strokeWidth: parseInt(content[6]) / 2,
        //scaleX:scaleX,
        //scaleY:scaleY,
        selectable: false,
        visible: visible
      });

      ctx.add(line);
      this.dottedLineObj[objectId] = line;
    } else {
      this.dottedLineObj[objectId].visible = visible;
      ctx.renderAll();
    }
  },
  // 文字
  text: function (command) {
    //{\"p\":2,\"c\":\"t6|%u5373%u53EF%u5F88%u5FEB%0D|16711680|20|1|1|1.600000023841858,0,0,1.600000023841858,301.65,40.8\",\"st\":1408,\"t\":15}    
    //name|text|color|size|visible|操作类型（新增、移动）|Matrix
    //matrix.a ,  matrix.b,  matrix.c,  matrix.d,  matrix.tx,  matrix.ty
    //TODO:中文解码，调整字体，调整字间距
    var ctx = this.context('draw');
    var scaleX = this.scaleX(ctx, command.p);
    var scaleY = this.scaleY(ctx, command.p);
    var content = command.c.split('|');
    var objectId = content[0];
    var options = content[6].split(',');

    // 替换[空格, 回车]
    var message = unescape(content[1] = content[1].replace(/%0D/ig, "\n").replace(/%20/ig, "\r"));
    var color = this.getColor(content[2]);
    var fontSize = parseInt(content[3]) * scaleX * options[0];

    //var strokeWidth = parseInt(content[4]);
    var visible = parseInt(content[4]) === COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var left = parseFloat(options[4]);
    var top = parseFloat(options[5]);
    var matrix = [
      parseFloat(options[0]),
      parseFloat(options[1]),
      parseFloat(options[2]),
      parseFloat(options[3]),
      parseFloat(options[4]) * scaleX,
      parseFloat(options[5]) * scaleY,
    ];

    if (!this.drawObj[objectId] || !this.isDraw(ctx, objectId)) {
      var text = new fabric.Text(message, {
        id: objectId,
        fill: color,
        fontSize: fontSize,
        visible: visible,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        transformMatrix: matrix,
        backgroundColor: '',
        textBackgroundColor: '',
        selectable: false
      });
      text.transformMatrix = matrix;
      if (text.setText) {
        text.setText(message);
      } else {
        text.set({
          text: message
        })
      }
      this.drawObj[objectId] = text;
      ctx.add(text);
    } else {
      if (this.drawObj[objectId].setText) {
        this.drawObj[objectId].setText(message);
      } else {
        this.drawObj[objectId].set({
          text: message
        })
      }
      this.drawObj[objectId].visible = visible;
      this.drawObj[objectId].transformMatrix = matrix;
      ctx.renderAll();
    }
  },
  isWhiteBoard: function (page) {
    return page > 10000 ? true : false;
  },
  scaleX: function (ctx, page) {
    return this.isWhiteBoard(page) ? ctx.width / this.whiteBoardWidth : ctx.width / this.drawWidth;
  },
  scaleY: function (ctx, page) {
    return this.isWhiteBoard(page) ? ctx.height / this.whiteBoardHeight : ctx.height / this.drawHeight;
  },
  // 线条
  stroke: function (command) {
    //"{"p":10002,"c":"instance542|16777215|4|0|M,214,350,M,214,350,L,214,354.6,C,214,359.2,217.6,374.5,C,221.2,389.8,228.3,412.8,C,235.4,435.8,237,439.4,C,238.5,442.9,242.1,443.4,C,245.6,443.9,262.5,442.9,C,279.3,441.9,301.7,435.8,C,324.1,429.6,346.5,423,C,368.9,416.4,373,415.4,L,377.1,414.3","st":432.2,"t":25}"

    var that = this;
    var ctx = this.context('draw');
    var c = command.c.split('|');
    var visible = c[3] == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var content = this.drawSerialize(ctx, command);
    var objectId = content.objectId;
    var data = content.graph.data;
    var item = {};
    var path = '';

    if (data.length > 0) {
      if (!this.drawObj[objectId] || !this.isDraw(ctx, objectId)) {
        for (var i = 0; i < data.length; i++) {
          item = data[i];
          if (item.name === 'M') {
            path += ' M ' + item.x + ' ' + item.y;
          } else if (item.name === 'L') {
            path += ' L ' + item.x + ' ' + item.y;
          } else if (item.name === 'C') {
            path += ' Q ' + item.x + ',' + item.y + ',' + item.archX + ',' + item.archY;
          }
        }

        var p = new fabric.Path(path, {
          id: objectId,
          fill: '',
          stroke: content.color,
          strokeWidth: content.thickness,
          selectable: false
        });
        this.drawObj[objectId] = p;
        ctx.add(p);
      } else {
        this.drawObj[objectId].visible = visible;
        ctx.renderAll();
      }
    }
  },
  drawSerialize: function (ctx, command) {
    //instance674|16777215|4|1|M,149.8,191.9,M,149.8,191.9,L,147.8,191.9,C,145.8,191.9,143.8,191.9,C,141.7,191.9,139.1,188.9,C,136.6,185.8,135.6,183.2,C,134.6,180.6,136.6,179.1,C,138.6,177.6,140.1,177.6,C,141.7,177.6,143.2,177.6,C,144.7,177.6,145.8,181.1,C,146.8,184.7,146.8,186.3,C,146.8,187.8,144.3,188.3,C,141.7,188.8,138.6,188.3,C,135.6,187.8,133.6,187.3,C,131.5,186.8,130.5,184.8,C,129.5,182.7,130,180.1,C,130.5,177.6,132,176.6,C,133.5,175.5,135.1,175,C,136.6,174.5,138.1,174.5,C,139.6,174.5,141.6,174.5,C,143.7,174.5,145.3,175.6,C,146.8,176.6,147.3,178.1,C,147.8,179.6,147.8,182.1,C,147.8,184.7,147.8,186.3,C,147.8,187.8,147.8,189.4,C,147.8,190.9,142.7,191.4,C,137.6,191.9,135.6,190.9,C,133.5,189.8,132,186.8,C,130.5,183.7,131,180.6,C,131.5,177.6,133.1,176.6,C,134.6,175.5,136.6,174,C,138.6,172.5,140.1,173,C,141.7,173.5,141.7,175.1,C,141.7,176.6,142.7,178.1,C,143.7,179.6,144.2,181.1,C,144.7,182.7,145.3,184.3,C,145.8,185.8,143.3,185.8,C,140.7,185.8,138.6,185.3,C,136.6,184.7,136.6,182.6,C,136.6,180.6,139.1,180.6,C,141.7,180.6,143.8,181.1,C,145.8,181.7,146.3,183.2,C,146.8,184.7,144.3,185.3,C,141.7,185.8,139.6,185.8,C,137.6,185.8,136.6,183.8,C,135.6,181.7,135.6,179.6,C,135.6,177.6,137.1,177.6,C,138.6,177.6,140.1,177.6,C,141.7,177.6,143.2,177.6,C,144.7,177.6,145.8,179.6,C,146.8,181.7,146.8,183.2,L,146.8,184.7
    var scaleX = this.scaleX(ctx, command.p);
    //var scaleY = this.scaleY(ctx,command.p);
    var scaleY = scaleX;
    var content = command.c;
    var json = {};
    var arr = content.split('|');
    var objectId = arr[0];
    var color = this.getColor(arr[1]);
    var thickness = arr[2] * scaleX;
    var visible = arr[3] == COMMAND_OPTIONS_VISIBLE_SHOW ? true : false;
    var path = arr[4];

    var a = path.split(',');

    var x = {
      lineStyle: {
        thickness: thickness,
        color: color
      },
      moveTo: {},
      data: []
    };

    var index = 0;
    if (a[0] === 'M') {
      x.moveTo = {
        x: a[1] * scaleX,
        y: a[2] * scaleY
      };
      index = 3;
    }

    var item = {};
    while (index < a.length) {
      switch (a[index]) {
        case 'M':
          item = {
            name: a[index],
            x: parseInt(a[index + 1]) * scaleX,
            y: parseInt(a[index + 2]) * scaleY
          };
          x.data.push(item);
          index += 3;
          break;
        case 'L':
          item = {
            name: a[index],
            x: parseInt(a[index + 1]) * scaleX,
            y: parseInt(a[index + 2]) * scaleY
          };
          x.data.push(item);
          index += 3;
          break;
        case 'C':
          item = {
            name: a[index],
            x: parseInt(a[index + 1]) * scaleX,
            y: parseInt(a[index + 2]) * scaleY,
            archX: parseInt(a[index + 3]) * scaleX,
            archY: parseInt(a[index + 4]) * scaleY
          };
          x.data.push(item);
          index += 5;
          break;
        default:
          break;
      }

    }

    json = {
      objectId: objectId,
      color: color,
      thickness: thickness,
      visible: visible,
      graph: x
    };
    return json;
  },
  getColor: function (color) {
    color = parseInt(color);
    color = color.toString(16);
    if (color.length < 6) {
      var appendLength = 6 - color.length;
      for (var i = 0; i < appendLength; i++) {
        color = '0' + color;
      }
    }
    color = '#' + color;
    return color;
  },
  graffiti: function (command) {
    this.context('draw').clear();
    //清空当前页的笔画
    if (this.commands[command.p]) {
      this.commands[command.p] = []
    }
  },
  // 区域擦除(t=26指令)
  rubberErase: function (command) {
    var ctx = this.context("draw"),
      draws = this.getDrawObjectById(ctx, command.c);

    // 设置不可见
    draws.setVisible(false);

    // 如有子元素, 遍历设置 
    if (draws.childs && draws.childs.length > 0) {
      for (var i = 0; i < draws.childs.length; i++) {
        var child = draws.childs[i];
        child.setVisible(false);
      }
    }
    // 渲染
    ctx.renderAll();
  },
  // 清空canvas数据
  clear: function () {
    tools.debug('draw do clear...')
    if (tools.isMobile()) {
      this.context('ppt').clear();
      this.context('draw').clear();
    }
  },
  // 重绘
  draw: function () {
    var command = this.getPage(this.page);
    tools.debug("drawing ==>", command);
    if (command) {
      this.execute(command);
    }
  },

  // 画布宽高
  setCanvaOffset: function (width, height) {
    var that = this
    tools.debug('cavans offset setting', width, height)
    // 设置画布大小
    that.canvasWidth = width;
    that.canvasHeight = height;
    core.canvasWidth = width;
    core.canvasHeight = height;
  },

  // 重置
  resize: function (width, height, callback) {
    /*if(width == this.width && height == this.height){
        tools.debug('resize the same.');
        return;
    }
    if((width / height) != (this.pptWidth / this.pptHeight)){
        tools.debug('resize rate is not equal to:'+(this.pptWidth / this.pptHeight));
        return;
    }*/
    // tools.debug('whiteboad on resize ==>', width, height)
    // var that = this,
    //   reset = this.getRatio(width, height);
    // width = reset.width;
    // height = reset.height;
    // // 画布设置
    // this.setCanvaOffset(width, height)
    // tools.debug("whiteboard do resize ... ", tools.flashChecker());
    // // 移动端(Fabric)
    // if (tools.isMobile()) {
    //   // clear draw
    //   this.clear();
    //   var ppt = document.getElementById('ppt-image');
    //   if (ppt) {
    //     ppt.width = width;
    //     ppt.height = height;
    //   }
    //   this.width = width;
    //   this.height = height;
    //   // canvas resize
    //   var ctxPpt = this.context('ppt');
    //   var ctxDraw = this.context('draw');
    //   ctxPpt.setDimensions({
    //     width: width,
    //     height: height
    //   });
    //   ctxDraw.setDimensions({
    //     width: width,
    //     height: height
    //   });
    //   ctxPpt.calcOffset();
    //   ctxDraw.calcOffset();
    //   ctxDraw.renderAll()
    //   ctxPpt.renderAll()
    //   // container
    //   var container = document.getElementById(this.mainContainerId);
    //   container.style.width = width + 'px';
    //   container.style.height = height + 'px';
    //   // redraw
    //   this.draw();
    //   tools.callback(callback);
    // }

    // // exports
    // return {
    //   width: width,
    //   height: height
    // }
    if (whiteboardPlayer.whiteboardObject) {
      whiteboardPlayer.whiteboardObject.whiteboardResize()
    }
  }
};
window.__player = whiteboard;
// return whiteboard;
export default whiteboard
// });