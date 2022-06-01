define(function(require) {

    var tools = require('../utils/tools'),
        map = require('../utils/map');
        videojs = require("videojs"),
        core = require('./player.core'),
        SDK = require('../controllers/sdk_control');

    var COMMAND_CAMERA_START = 101; //摄像头启动
    var COMMAND_CAMERA_STOP = 102; //摄像头关闭
    var COMMAND_VIDEO_START = 103; //推流开始
    var COMMAND_VIDEO_STOP = 104; //推流结束

    var video = {
        cameraContainerId: null,
        cameraPlayerId: null,
        playType: 'live',
        pptPlayerType: "flash",
        videoPlayType:'',
        
        // 摄像头初始化状态
        playStatus: "stop",

        cameraWidth: 280,
        cameraHeight: 210,
        durationTimmer: null,
        videoUrl: null,
        duration: null,
        currentDuration: 0, //摄像头视频当前时间点
        stream: [], //原生点播流
		bn:0,//本次统计周期内卡顿次数
        ba:0,//总卡顿次数
        bx:0,//卡顿换源用到的卡顿数
        waitLastTime:0,//上次卡顿统计时间
        
        // sdk开发调用方法
        callSdk: function(cmd, toggle){
            SDK.exportCmd(cmd, toggle);
        },
        config: function(options) {
            if (typeof options === "object") {
                // 视频播放区高宽
                if (options.width) {
                    this.cameraWidth = parseInt(options.width);
                }
                if (options.height) {
                    this.cameraHeight = parseInt(options.height);
                }
                // 房间类型
                if (options.playType) {
                    this.playType = options.playType;
                }
                // 播放器类型
                if(options.pptPlayerType){
                    this.pptPlayerType = options.pptPlayerType;
                }

                //视频播放类型
                if(options.videoPlayType){
                    this.videoPlayType = options.videoPlayType;
                }
            }
        },
        camera: function(containerId, playerId, callback) {
            this.cameraContainerId = containerId;
            this.cameraPlayerId = playerId;
            // get camera
            if(!tools.isMobileSDK()){
                var camera = this.cameraPlayer;
                //callback && callback(camera);
                this.cameraCallback = callback;
            }
        },
        // 获取 media 元素
        getCamera: function(flag) {
            if(tools.isMobileSDK()){
                return false;
            }

            var that = this,
                element = {};
            
            // has MediaObject.
            if(this.cameraVideo){
                tools.debug("Get Camera Element ==>", this.cameraVideo);
                return this.cameraVideo;
            }

            // without Create.
            else{
                
                tools.debug("Createing the Camera Element ==>", this.cameraPlayerId, this.cameraVideo);

                // 强制音频
                if(core.isForceAudio() || flag === "audio"){
                    element = document.createElement('audio');
                    element.setAttribute("preload", "auto");
                    element.className = 'camera_audio';
                }

                // 强制视频
                else if(core.isForceVideo() || flag === "video"){
                    element = document.createElement('video');
                    element.setAttribute("preload", "auto");
                    element.className = 'camera_video';
                }

                // 微信
                else if (tools.isWechat()) {
                    element = document.createElement('video');
                    element.setAttribute("preload", "auto");
                    element.className = 'camera_wechat';
                
                // iPhone特殊配置
                } else if (core.isCreateAudio()) {
                    //iphone 里面播放video会全屏，所以使用audio
                    element = document.createElement('audio');
                    element.className = 'camera_iphone';
                
                // iPad
                } else if (tools.isIpad()) {
                    element = document.createElement('video');
                    element.className = 'camera_ipad';
                    element.setAttribute("preload", "none");
                
                // Android
                } else if (tools.isAndroid()) {
                    element = document.createElement('video');
                    element.className = 'camera_android';
                    element.setAttribute("preload", "auto");
                } 
                // PC or Other
                else {
                    //ioswebview可以禁止全屏
                    element = document.createElement('video');
                    element.className = 'camera_default';
                }

                // el.
                element.id = this.cameraPlayerId;

                // TODO:修改为外部传入container
                element.setAttribute("autoplay", "");
                element.setAttribute("autoplay", "true");
                element.setAttribute("webkit-playsinline", "webkit-playsinline");
                element.setAttribute("playsinline", "");
                element.setAttribute("x5-playsinline", "");
                // 禁止下载
                element.setAttribute('controlsList', 'nodownload')
                element.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                }, false);

                // 兼容模式
                if(tools.isCompatible()){
                    element.setAttribute("x5-video-player-type", "h5");
                    element.style["object-position"] = "0 0";
                }
                
                // render
                var docEl = document.getElementById(this.cameraContainerId);
                docEl.appendChild(element);

                // copy.
                this.cameraVideo = element;
            }
            return element;
        },

        // vjs camera
        getCameraPlayer: function () {
            return this.cameraVideo;
        },

        // 创建 or 获取 vjs播放器
        getVideojsPlayer: function(mediaEl, callback){
            
            var that = this;
            
            // 未创建player.
            if(!that.cameraPlayer){

                // 默认设置
                var _techObj = ["html5", "flash"];

                if(that.videoPlayType === 'html5'){
                    _techObj = ["html5", "flash"];
                }

                // 移动
                if(tools.isMobile()){
                    _techObj = ["html5"];
                }
                
                // 优先选择
                if(window.location.href.indexOf("vjs=flash") > -1){
                    _techObj = ["flash", "html5"];
                }else if(window.location.href.indexOf("vjs=html5") > -1){
                    _techObj = ["html5", "flash"];
                }

                // sources
                var _sources = core.getVideoSource(that.videoUrl),
                    defaultWidth = document.querySelector("#"+this.cameraContainerId).clientWidth || 280;

                // 未加载
                if(!mediaEl){
                    tools.debug('摄像头视频标签未定义.')
                    return false;
                } 
                // 设置默认样式
                else {
                    mediaEl.parentNode.style['width'] = '100%'
                    mediaEl.parentNode.style['height'] = '100%'
                }
                    
                // 设置视频播放器
                var cameraPlayer = videojs(mediaEl, {
                    techOrder: _techObj,
                    sources: _sources,
                    preload: true,
                    width: defaultWidth,
                    bigPlayButton: false,
                    errorDisplay: false,
                    loadingSpinner: false,
                    posterImage: true,
                    textTrackSettings: false,
                    textTrackDisplay: false,
                    controlBar: false,
                    controls: false,
                    autoplay: true
                }, function(){
                    // 视频加载完毕(开始播放)
                    that.videoLoadState = true;
                    var _videoDom = (this.el_.firstChild)
                    _videoDom.style.width = '100%'
                    _videoDom.style.height = '100%'
                    // 兼容暴露对象 => tech_.el_ 对象
                    this.el_.tech_ = {}
                    this.el_.tech_.el_ = this.el_
                    that.cameraCallback(this.el_);
                    // set style
                    this.el_.style['width'] = '100%'
                    this.el_.style['height'] = '100%'
                    if(typeof callback === "function"){
                        callback();
                    }
                });

                that.cameraPlayer = cameraPlayer;
                window.__video__ = that.cameraPlayer;
                
                // 点播事件
                if(this.playType === 'playback') {
                    
                    // load data
                    cameraPlayer.on("loadeddata", function(res){
                        
                        // 验证资源准确性
                        if(!that.isChecked){
                            that.pause();
                            return false;
                        }

                        // H5端loaded统一调用暂停
                        if(tools.isMobile() && tools.isAndroid()){
                            // cameraPlayer.play();
                        }

                        // event.
                        map.get('live:video:loaded')("media");

                        // 1.5s之后seek到指定时间点(fix安卓切换源不会自动seek问题)
                        if(that.seekDuration && that.seekDuration > 0){
                            tools.debug("seeking===>" + that.seekDuration);
                            // H5
                            if(tools.isMobile()){
                                setTimeout(function(){
                                    that.seek(that.seekDuration);
                                    that.play();
                                    that.seekDuration = 0;
                                }, 1000);
                            }
                            // PC
                            else{
                                if (that.seekDuration > 0) {
                                    that.seek(that.seekDuration);
                                }
                                that.play();
                                that.seekDuration = 0;
                            }
                            that.isSeekFinished = true;
                        }
                    });

                    // loadedmetadata
                    cameraPlayer.on("loadedmetadata", function(res){
                        // 验证视频有效性
                        core.mediaValidate(this.duration(), function(isPass){
                            if(isPass){
                                that.isChecked = true;
                            }else{
                                that.isChecked = false;
                            }
                        });
                        map.get('live:video:metadata')();
                    });

                    // timeupdate
                    var lastClearTime = 0;
                    cameraPlayer.on("timeupdate", function(){
                        
                        var curTime = cameraPlayer.currentTime();                        

                        //断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
                        var _nowTime = Math.round(new Date().getTime()/1000);
                        if (curTime <= that.currentDuration) {
                            that.setWaitingTimes(_nowTime);
                        }
                        else if(that.bx > 0 && _nowTime - lastClearTime > 1){
                            that.bx -= 1;
                            lastClearTime = _nowTime;
                        }

                        that.currentDuration = curTime;
                        
                        // that.playStatus = "playing";
                        // core.playStatus = that.playStatus;
                        that.setMeidaPlayStatus("playing");
                        map.get('live:camera:timeupdate')(curTime)
                    });

                    // loadstart
                    cameraPlayer.on("loadstart", function(){
                        map.get("live:video:loadstart")();
                    });

                    // firstbufferinfo - (for pc only)
                    cameraPlayer.on("firstbufferinfo", function(){
                        var res = cameraPlayer.techGet_("firstbufferinfo");
                        map.get("live:loading:info")(res);
                    });

                    // play.
                    cameraPlayer.on('play', function(){
                        that.play();
                        map.get("live:video:playing")();
                    });

                    // canplay
                    cameraPlayer.on("canplay", function(){
                        // 初次加载监听 `canplay`
                        map.get("live:video:playing")();
                        that.firstLoad = true;
                    });

                    // pause
                    cameraPlayer.on('pause',function(){
                        that.setMeidaPlayStatus("pause");
                        map.get("live:video:pause")();
                    });

                    // seeking
                    cameraPlayer.on('seeking',function(){
                        that.setMeidaPlayStatus("seeking");
                        map.get("live:video:seeking")();
                        that.isSeekFinished = false;
                        if(cameraPlayer.duration() == cameraPlayer.currentTime()){
                            that.playStatus = 'ended';
                            core.playStatus = that.playStatus;
                        }
                    });

                    // seeked
                    cameraPlayer.on('seeked',function(){
                        // core.playStatus = that.playStatus;
                        that.setMeidaPlayStatus("seeked");
                        map.get("live:seek:finish")();
                        that.isSeekFinished = true;
                    });

                    // waiting
                    cameraPlayer.on('waiting',function(){
                        that.bn += 1;
                        that.ba += 1;
                        
                        // that.playStatus = 'waiting';
                        // core.playStatus = that.playStatus;
                        that.setMeidaPlayStatus("waiting");

                        map.get("live:video:waiting")();
                    });

                    // ended
                    cameraPlayer.on('ended',function(){
                        
                        // that.playStatus = 'ended';
                        // map.get("live:video:ended")();
                        // core.playStatus = that.playStatus;
                        that.setMeidaPlayStatus("ended");
                        map.get("live:video:ended")();
                    });

                    // error
                    cameraPlayer.on("error", function(info){
                        // that.playStatus = 'error';
                        // core.playStatus = that.playStatus;
                        that.setMeidaPlayStatus("error");
                        that.bn += 1;
                        that.ba += 1;
                        if(that.changeSource == 0){
                            that.changeSource = 1;
                        }
                        map.get('live:video:error')(info);
                    });

                    cameraPlayer.on('durationchange',function(){
                        
                        // that.playStatus = 'waiting';
                        // core.playStatus = that.playStatus;

                        that.setMeidaPlayStatus("durationchange");
                        map.get("live:video:durationchange")();
                    });

                    // abort
                    cameraPlayer.on("abort", function(){
                        that.setMeidaPlayStatus("abort");
                        map.get('live:video:abort')(this);
                    });
                }
                // 微信自动播放
                if(tools.isWechat()){
                    tools.detectiveWxJsBridge(function(){
                        that.play();
                    });
                }
                return cameraPlayer;
            }
            // 已创建
            else{
                // 如不是同一个源, 需切换
                if(that.cameraPlayer.src() !== that.videoUrl){
                    var _sources = core.getVideoSource(that.videoUrl);
                    that.playStatus = 'waiting';
                    that.cameraPlayer.src(_sources);
                }
                // 微信自动播放
                if(tools.isWechat()){
                    tools.detectiveWxJsBridge(function(){
                        that.play();
                    });
                }
                // that.play();
                return that.cameraPlayer;
            }
        },

        // 设置媒体播放状态
        setMeidaPlayStatus: function(state){
            var that = this;
            that.playStatus = state;
            core.playStatus = state;
        },

        playRate: function(rate){
            var that = this;
            if(!that.cameraPlayer || that.cameraPlayer.techName_ == 'Flash'){
                return;
            }
            return that.cameraPlayer.playbackRate(rate);
        },

        // 销毁标签(videojs)
        destroy: function(){
            // 销毁 cameraVideo 对象
            if(this.cameraVideo){
                this.cameraVideo = null;
            }
            // 销毁 videojs 元素
            if(this.cameraPlayer){
                this.cameraPlayer.dispose();
                this.cameraPlayer = null;
            }
        },

        //注: 时间轴运行
        startDurationTimmer: function() {
            var that = this;
            if (!that.durationTimmer) {
                // 如果在sdk里面
                if (tools.isMobileSDK()) {
                    that.durationTimmer = setInterval(function() {
                        map.get('live:duration')(schedule.playDuration, that.duration, schedule.playDuration / that.duration);
                    }, 500);
                } else {
                    // var element = this.cameraPlayer;
                    that.durationTimmer = setInterval(function() {
                        if (core.currentDuration > 0) {
                            // that.currentTime = element.currentTime();
                            // schedule.setPlayDuration(core.currentDuration);
                            if(core.currentDuration >= that.duration){
                                that.stopDurationTimmer();
                            }
                            // map.get('live:duration')(element.currentTime(), that.duration, element.currentTime() / that.duration);
                        }
                    }, 200);
                }
            }
        },
        // 时间轴停止
        stopDurationTimmer: function() {
            if (this.durationTimmer) {
                clearInterval(this.durationTimmer);
                this.durationTimmer = null;
            }
        },
        getVideoUrl: function(content) {
            if (this.playType === 'playback') {
                return content;
            } else {
                content = content.replace('rtmp://', 'http://').split('|');
                return content[0] + '/' + content[1] + '/playlist.m3u8';
            }
        },
        seek: function(duration) {
            var that = this;
                that.bx = 0;
            that.seekDuration = duration;
            tools.debug('video seek ===> ' + that.seekDuration)
            if (this.playType === 'playback') {
                if (tools.isMobileSDK()) {
                    setTimeout(function(){
                        SDK.seek(duration);
                        that.play();
                    }, 100);
                } else {
                    var v = that.cameraPlayer;
                    if(v){
                        that.cameraPlayer.currentTime(duration);
                        that.play();
                        that.startDurationTimmer();
                    }
                }
                that.changeSource = 0;
            }
        },
        // @触发条件
        // @1 => 从vod.player触发
        // @2 => 直接点击视频控件
        playHandle: null,
        play: function() {
            var that = this;
            if(that.cameraPlayer && that.cameraPlayer.paused()){
                if(tools.isMobile()){
                    that.cameraPlayer.play();
                }
                // pc 延迟seek 播放条件
                else{
                    that.cameraPlayer.pause();
                    if(that.playHandle){
                        clearTimeout(that.playHandle)
                    }
                    that.playHandle = setTimeout(function(){
                        tools.debug("video start play now...");
                        that.cameraPlayer.play();
                    }, 100)
                }
            }
            
            // that.setMeidaPlayStatus("playing");
            core.vodPlayer.tick();
            this.startDurationTimmer();
        },
        pause: function() {
            if (tools.isMobileSDK()) {
                SDK.pause();
            } else {
                var v = this.cameraPlayer;
                if(v){
                    v.pause();
                    this.playStatus = 'pause';
                }
            }
            
            this.setMeidaPlayStatus("pause");
            core.vodPlayer.pauseTick();
            this.stopDurationTimmer();
        },
        stop: function() {
            tools.debug('video call stop!')
            if (tools.isMobileSDK()) {
                SDK.mediaStop();
            } else {
                var v = this.cameraPlayer;
                //v.currentTime(v.duration());
                //如果是调用pause的话
                if(v){
                    v.pause();
                }   
            }
            this.setMeidaPlayStatus("ended");
            this.stopDurationTimmer();
        },
        volume: function(volume) {
            if (tools.isMobileSDK()) {

            } else {
                if(this.cameraPlayer){
                    this.cameraPlayer.volume(volume);
                }
            }
        },
        // video视频数据
        videoDo: function(command) {
            tools.debug("videoDo", command);
            var that = this;
            // 视频开始
            if (command.t == COMMAND_VIDEO_START) {
                // 原生App播放器执行
                if (tools.isMobileSDK()) {
                    tools.debug('SDK video start:', content);
                    var content = [];
                    // 点播
                    if (that.playType === 'playback') {
						content[0] = command.c;
						content[1] = '';
                    } else {
                        content = command.c.split('|');
                    }
                    SDK.audioStart(content[0], content[1]);
                    this.stream = content;
                }
                // H5播放器执行
                else {
                    if(command.c.length == 0){
                        return;
                    }
                    var videoUrl = this.getVideoUrl(command.c);
                    // 相同视频
                    if(this.videoUrl === videoUrl){
                        return false;
                    }
                    
                    this.videoUrl = videoUrl;
                    tools.debug('play video:' + videoUrl);
                    
                    var video = this.getCamera();

                    // 版本优先
                    var _techObj = ["html5", "false"]; //默认
                    
                    // 创建 videojs 播放器
                    that.getVideojsPlayer(video);
                }
                // 执行任务队列(时间轴)
                that.startDurationTimmer();
            } 
            // 停止
            else if (command.t == COMMAND_VIDEO_STOP) {
                this.stop();
            }
        },
        changeSource:0,
		setWaitingTimes: function(_nowTime) {
			var that = this;
			if (_nowTime - that.waitLastTime >= 1) {
				that.bn += 1;
				that.ba += 1;

                if (that.bx < 15) {
                    that.bx += 1;
                } else {
                    that.bx = 0;
                    that.changeSource = 1;
                    map.get('live:video:timeout')(that.bx);
                }
				that.waitLastTime = _nowTime;                
			}
		},

        // 摄像头开关
        cameraDo: function(command) {
            tools.debug("cameraDo", command);
            var that = this;
            // 开启摄像头
            if (command.t == COMMAND_CAMERA_START) {
                // Native原生
                if (tools.isMobileSDK()) {
                    SDK.cameraStart(that.stream[0], that.stream[1]);
                } 
                // H5
                else {
                    var v = this.getCamera();
                    v.width = this.cameraWidth;
                    v.height = this.cameraHeight;
                }
                map.get('camera:start')(v);
            } 
            // 关闭摄像头
            else if (command.t == COMMAND_CAMERA_STOP) {
                // Native原生
                if (tools.isMobileSDK()) {
                    setTimeout(function() {
                        SDK.cameraStop();
                    }, 500);
                } 
                // H5
                else {
                    var v = this.getCamera();
                    v.width = 0;
                    v.height = 0;
                }
                map.get('camera:stop')(v);
            }
        }
    };

    window.video = video;
    return video;
});
