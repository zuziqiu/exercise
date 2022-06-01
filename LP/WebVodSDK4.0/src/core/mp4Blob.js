import event from './mediaEvent'
var PostbirdMp4ToBlob = {
  mimeCodec: 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"',
  mediaSource: null,
  // 检查是否支持 MediaSource 或者 mimeCodec
  checkSupported: function (cb) {
    // 暂时不使用
    return false
    // return window.MediaSource && window.MediaSource.isTypeSupported(this.mimeCodec);
    // if (typeof cb == 'function') {
    //   cb(this)
    // }
  },
  // 事件
  on: function (event, callback) {
    if (this.video) {
      this.video.addEventListener(event, callback, false)
    }
  },
  // 初始化 selector / assetUrl / mimeCodec / autoPlay
  // selector：video的选择器 exp: '#video'
  // assetUrl: video的请求地址 exp : './v.mp4'
  // mimeCodec: 编码模式  exp:  'video/mp4; codecs="avc1.640028, mp4a.40.2"'
  init: function (selector, assetUrl, mimeCodec) {
    if (selector.nodeType && selector.nodeType == 1) {
      this.video = selector
    } else {
      this.video = document.querySelector(selector); // 获取vide dom
    }
    if (!video) {
      new Error('mp4Player => 容器错误, 请检查后重试')
      return false
    }
    this.assetUrl = assetUrl;//'http://open.talk-fun.com/open/lab/demos/source/test.mp4';
    this.mimeCodec = mimeCodec || this.mimeCodec;
    if (this.checkSupported()) {
      this.mediaSource = new MediaSource
      this.start();// 开启
    }
    this.bindMeidaEvent()
    return this
  },
  bindMeidaEvent: function () {
    this.currentTime = event.currentTime
    this.duration = event.duration
    this.pause = event.pause
    this.play = event.play
    this.playbackRate = event.playbackRate
    this.src = event.src
  },
  start: function () {
    console.log('MediaSource on ==>', this.mediaSource.readyState); // closed 
    var source = document.createElement('source')
    if (this.video) {
      source.src = this.assetUrl
      source.type = 'video/mp4'
      this.video.appendChild(source)
      this.video.load()
    }
    // this.video.src = this.assetUrl
    // this.video.src = URL.createObjectURL(this.mediaSource);
    // this.mediaSource.addEventListener('sourceopen', this.sourceOpen.bind(this));// bind(this) 保证回调
  },
  // MediaSource sourceopen 事件处理
  sourceOpen: function (_) {
    var _this = this;
    console.log('MediaSource on ==>', this.mediaSource.readyState); // open
    var sourceBuffer = this.mediaSource.addSourceBuffer(this.mimeCodec);
    this.fetchAB(this.assetUrl, function (buf) {
      sourceBuffer.addEventListener('updateend', function (_) {
        _this.video.play(); // 播放视频
        console.log(_this.mediaSource.readyState); // ended
      });
      sourceBuffer.appendBuffer(buf);
    });
  },
  // 基于 XHR 的简单封装
  // arguments - url 
  // arguments - cb (回调函数)
  fetchAB: function (url, cb) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    // xhr.responseType = 'blob';
    xhr.onload = function () {
      cb(xhr.response);
    };
    xhr.send();
  }
}
export default PostbirdMp4ToBlob
