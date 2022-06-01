// Filename: mt.static.js
define([], function(){

	// 静态类
	var STATIC = {
		ROOM: {}, // 房间模式
		player: {},// 播放器
		camera: {},// 摄像头
        CODE: {},// 系统代码
        CMD: {}
	};


	// socket => command指令
	STATIC.CMD.MODE = {
		WHITEBOARD: 'WHITEBOARD',
		PPT: 'PPT'
	}
	STATIC.CMD.WHITEBOARD_WIDTH = 800;
	STATIC.CMD.WHITEBOARD_HEIGHT = 600;
	STATIC.CMD.PAGE = '51'; //翻页
	STATIC.CMD.DRAW = '25'; //涂鸦
	STATIC.CMD.LINE = '18'; //直线
	STATIC.CMD.DOTTEDLINE = '21';//虚线
	STATIC.CMD.CLEAR = '1'; //清空所有涂鸦
	STATIC.CMD.DRAW_LIST = '31';//批量
	STATIC.CMD.VIDEO_START = '103';//视频流打开
	STATIC.CMD.OPEN_CAMERA = '101';//打开摄像头
	STATIC.CMD.LIVE_START = 'start';//START
	STATIC.CMD.LIVE_STOP = 'stop';//STOP
	STATIC.CMD.SCROLL_ON_DOWN = '5';//向下滚动
	STATIC.CMD.SCROLL_ON_UP = '6';//向上滚动


    //状态码，暴露到windows
  STATIC.CODE.SUCCESS = 0;
  STATIC.CODE.MEMBER_FORBIDDEN = 10034;

	// Commonly
	STATIC.CODE_SUCCESS = 0;
	STATIC.EC_SUCCESS = 0;
	STATIC.EC_GENERAL_ERROR = -1;

    // URL protocol
    STATIC.PROTOCOL = (("https:" == document.location.protocol) ? "https://" : "http://");

	// domain
	var _hostTmp = window.location.host.match(/open-[\d]+\.talk-fun\.com/);
	STATIC.APP_DOMAIN = _hostTmp ? _hostTmp[0] : window.apiHost || 'open.talk-fun.com';
	STATIC.APP_HOST = STATIC.PROTOCOL + STATIC.APP_DOMAIN;// 主域
	STATIC.STATIC_HOST = STATIC.PROTOCOL + "static-1.talk-fun.com";// 静态资源

	// Maplist
	STATIC.MT_ADDMAPLIST_ERROR = "绑定监听事件错误";

	// Socket.NOTE
	STATIC.SOCKET_CONNECT_NOTE = "初始化未完成,请稍后重试";

	// ======= 系统事件 =======
	STATIC.MT_CONNECTING = "connecting"; // 连接中
	STATIC.MT_CONNECT_SUCCESS = "connect"; // 连接成功
	STATIC.MT_CONNECT_FAILED = "connect_failed"; //连接失败
	STATIC.MT_CONNECT_ERROR = "error"; // 连接错误或失败
	STATIC.MT_DISCONNECT = "disconnect"; // 连接已断开
	STATIC.MT_RECONNECTING =  "reconnecting"; //重新连接中
	STATIC.MT_RECONNECTING_FAILED = "reconnecting_failed"; //重新连接失败


	// 课程相关
	STATIC.CODE.LIVE_COURSE_UNEXIST = 1260;  //课程不存在
	STATIC.CODE.LIVE_COURSE_CONFLICT = 1261; //课程时间冲突
	STATIC.CODE.LIVE_COURSE_END = 1262;      //课程已结束
	STATIC.CODE.LIVE_COURSE_NOT_START = 1263;//课程直播还没开始
	
	// ======= 主播放器参数 ======
	// { 播放器代码参数 }
	STATIC.PLAYER_CMD_START = 1;
	STATIC.PLAYER_CMD_PAUSE = 2;
	STATIC.PLAYER_CMD_STOP = 3;
	STATIC.PLAYER_CMD_RESUME = 4;
	// { 播放器缓存参数 }
	STATIC.player.bufferlength = 0.5;
	STATIC.player.bufferTimeMax = 1;
    STATIC.player.bufferTimeArr = '[0.8,1.5,3]';
    STATIC.player.cmdTimeDelay = 0;     //指令延迟时间

	// ======= 摄像头参数 =======
	// { 摄像头缓存参数 }
	STATIC.camera.bufferlength = 0.5;
	STATIC.camera.bufferTimeMax = 1;
    STATIC.camera.bufferTimeArr = '[0.8,1.5,3]';


	// 房间模式
	STATIC.VOICE_FLOW_DEFAULT = 1; // 强互动模式
	STATIC.VOICE_FLOW_ADAPTER = 2; // 弱互动模式

    //语音
    STATIC.VOICE_MODE_FREEDOM = 0;  //自由模式
    STATIC.VOICE_MODE_CHAIRMAN = 1; //主席模式
    STATIC.VOICE_MODE_QUEUE = 2;    //麦序模式
    STATIC.VOICE_MODE_HAND = 3;     //举手模式

    // ======= 直播播放器代码 =======
    STATIC.HT_MAIN_PLAYER = "HT_01"; //主播放器(PPT播放器)
    STATIC.HT_CAMERA_PLAYER = "HT_02"; //摄像头播放器(播放端)
    STATIC.HT_LIVE_PLAYER = "HT_03"; //摄像头播放器(学生端 推流&播放)

    // ======= 房间模式 =======
	STATIC.ROOM.USER_CAMERA_MODE = "5"; //小班模式
	
	// 存储当前CAMERA-RTMP对象
	STATIC.CAMERA_URL_STREAM = null;

	// 播放按钮
	STATIC.player.PLAY_ICON = 'data:image/png;base64,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'

	// Exports
	return STATIC;
});

