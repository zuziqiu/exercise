import Store from './store'
import tools from '@tools'
// import STATIC from './mt.static'
import mediaCore from './mediaCore'
import core from './player.core'
// import vodPlayer from './vod.player'
import map from "@map"
// import videojs from "video.js"
// import log from './log'
import store from './store'
// import Hls from 'hls.js'
/* 
  *构建桌面分享&视频插播
  */

const mainPlayer = {
  player: null,

  // 桌面分享媒体初始化状态
  playStatus: 'stop',
  videoPlayType: '',
  volumeVal: 1,
  durationTimmer: null,
  currentTime: 0,
  currentDuration: 0, // 视频当前时间点
  bn: 0, //本次统计周期内卡顿次数
  ba: 0, //总卡顿次数
  bx: 0, //卡顿换源用到的卡顿数
  waitLastTime: 0, //上次卡顿统计时间
  desktopVideoDom: null,
  applySeek: null,
  init: function () {
    // this.getPlayer()
  },
  crete: function () {

  },
  mount: function () {

  },
  destory: function () {

  },
  // 事件
  on(eventName, payload) {
    tools.long('videoPlayer emit on ==>', eventName, payload)
    switch (eventName) {
      // create
      case 'video:player':
        this.init()
        break
      // destroy
      case 'main:destroy':
        this.destroy(payload)
        break
      // videoError
      case 'live:video:error':
        // core.changeSource()
        break
      default:
        break
    }
  },

  config: function (options) {
    if (options.videoPlayType) {
      this.videoPlayType = options.videoPlayType;
    }
  },
  // video-player
  getPlayer: function () {
    var that = this;
    var playerCtx = Store.getters('getPlayer')
    var playerId = playerCtx.videoPlayer.playerId || 'mt-desktop-player';
    var element = document.getElementById(playerId);
    if (!element) {
      tools.debug('create desktop player.')
      // 创建桌面分享元素
      if (core.isCreateAudio()) {
        element = document.createElement('audio');
      }
      else {
        element = document.createElement('video');
      }
      element.id = playerId;

      // 设置样式 & 属性
      mediaCore.setAttrs(element)
      mediaCore.commonEvent(element)

      // player重置
      if (tools.isMobile()) {
        element.style.position = "absolute";
        element.style.width = "100%";
        element.style.height = "100%";
        element.style.left = '0';
        element.setAttribute("preload", "auto");
      } else {
        element.style.width = "100%";
        element.style.height = "100%";
      }

      // save
      this.desktopVideoDom = element

      // 添加元素
      let videoWp = playerCtx.videoPlayer.wrapContainer
      // 设置controls
      var opts = store.getters('getExtData')
      if (opts.config.controls) {
        mediaCore.setControls('video', videoWp)
      }
      document.querySelector('#' + videoWp).appendChild(element);
      if (typeof playerCtx.videoPlayer.vodCallback === 'function') {
        playerCtx.videoPlayer.vodCallback(element)
      }
    }

    return element;
  },
  startDurationTimmer: function () {
    var that = this;
    if (!that.durationTimmer) {
      // 如果在sdk里面
      var element = this.getPlayer();
      that.durationTimmer = setInterval(function () {
        if (element.currentTime) {
          that.currentTime = element.currentTime();

          if (core.playType === 'live') {
            schedule.setPlayDuration(that.currentTime);
          }

          if (that.currentTime >= that.duration) {
            that.stopDurationTimmer();
          }
        }
      }, 200);
    }
  },
  stopDurationTimmer: function () {
    if (this.durationTimmer) {
      clearInterval(this.durationTimmer);
      this.durationTimmer = null;
    }
  },
  volume: function (volume) {
    tools.debug("volume setting..", volume);
    this.volumeVal = volume
    if (this.player) {
      this.player.volume(volume);
    }
  },
  Hls: null,
  Videojs: null,
  // 桌面分享
  start: async function (command, seek) {
    if (!command.c) {
      return;
    }

    let playerCtx = store.getters('getPlayer')
    tools.debug("desktop start: ===>", command);

    var videoUrl = "",
      _sources = {},
      that = this;

    var video = this.getPlayer(),
      // echo 逻辑调整
      defaultWidth = document.querySelector('#' + playerCtx.videoPlayer.wrapContainer).clientWidth || 800;

    // 点播
    if (core.playType === "playback") {

      // 保存path
      this.desktopStreamPath = command.c;
      videoUrl = core.getVideoUrl(command.c);
      _sources = core.getVideoSource(videoUrl);

      // 非当前视频重新切换源
      if (videoUrl !== this.videoUrl) {
        this.videoUrl = videoUrl;
        if (that.player) {
          that.playStatus = 'waiting';
          that.player.src(_sources);
        }
      }
    }
    // videoUrl
    tools.debug('start desktop:' + videoUrl);

    // 如播放器还没创建
    // 通过优先版本参数设置
    var _techObj = ["html5"]; //默认

    if (that.videoPlayType == 'html5') {
      _techObj = ["html5"];
    }

    // 创建播放器
    if (!that.player) {
      // 假如传入m3u8并且媒体支持则播放m3u8
      var config = Store.getters('getExtData').config
      var isM3U8 = /\.m3u8/ig.test(videoUrl);
      // if (config && config.techOrder == 'HLS' && !this.Hls) {
      if (isM3U8 && !this.Hls) {
        // if (config && config.techOrder == 'HLS' && !this.Hls) {
        // await import ('hls.js').then(Hls => {})
        await import('hls.js').then(res => this.Hls = res.default)
      }

      if (this.Hls && this.Hls.isSupported()) {
        if (!this.newHls) {
          this.newHls = new this.Hls();
        }
        this.newHls.loadSource(videoUrl);
        this.newHls.attachMedia(video);
        this.newHls.on(this.Hls.Events.ERROR, (e, data) => {
          if (data.fatal) {
            switch (data.type) {
              case this.Hls.ErrorTypes.NETWORK_ERROR:
                // try to recover network error
                console.error("fatal network error encountered, try to recover");
                that.setMeidaPlayStatus("error");
                that.bn += 1;
                that.ba += 1;
                if (that.changeSource == 0) {
                  that.changeSource = 1;
                }
                // 切换线路
                mediaCore.emit('live:video:error', that.changeSource)
                map.get('live:video:error')(data);

                break;
              case this.Hls.ErrorTypes.MEDIA_ERROR:
                console.error("fatal media error encountered, try to recover");
                this.newHls.recoverMediaError();
                break;
              default:
                // cannot recover
                this.newHls.destroy();
                break;
            }
          }
        })
        player = {
          el: video,
          url: _sources[0].src,
          currentTime: function (currentTime) {
            if (currentTime) {
              this.el.currentTime = Math.floor(currentTime)
            } else {
              return this.el.currentTime
            }
          },
          playbackRate: function (rate) {
            this.el.playbackRate = rate
          },
          duration: function () {
            return this.el.duration
          },
          pause: function () {
            this.el.pause()
          },
          paused: function () {
            return this.el.paused
          },
          src: function (url) {
            if (url) {
              if (!mainPlayer.newHls) {
                mainPlayer.newHls = new mainPlayer.Hls();
              }
              if (Object.prototype.toString.call(url) == '[object String]') {
                mainPlayer.newHls.loadSource(url);
                this.url = url
              } else {
                mainPlayer.newHls.loadSource(url[0].src);
                this.url = url[0].src
              }
              mainPlayer.newHls.attachMedia(this.el);
              mainPlayer.newHls.on(mainPlayer.Hls.Events.ERROR, (e, data) => {
                tools.debug('hls error', e, data)
              })
            } else {
              return this.url
            }
          },
          dispose: function () {

          }
        }
        this.player = player;
        this.h5Player = video
        this.h5Player.removeAttribute('controls')
        // 点播加载
        if (core.playType === 'playback') {

          // loadeddata
          player.el.onloadeddata = function (res) {

            // 验证资源准确性
            if (!that.isChecked) {
              that.setMeidaPlayStatus("pause");
              return false;
            }

            that.setMeidaPlayStatus("loadeddata");

            // event.
            map.get('live:video:loaded')("media");
            // seek()
            setTimeout(function () {
              that.applySeek && that.applySeek()
            }, 100)
          };

          // loadedmetadata
          player.el.onloadedmetadata = function (res) {

            // 验证视频有效性
            core.mediaValidate(this.duration, function (isPass) {
              if (isPass) {
                that.isChecked = true;
              } else {
                that.isChecked = false;
              }
            });
            // seek桌面分享等待视频load完
            if (that.seekDuration && that.seekDuration > 0) {
              tools.debug("seeking desktop ===> " + that.seekDuration);
              setTimeout(() => {
                player.currentTime(that.seekDuration)
                that.seekDuration = 0
              }, 100)
            }
            map.get('live:video:metadata')();
          };

          player.el.oncanplay = function () {
            that.setMeidaPlayStatus("canplay");
            map.get("live:video:canplay")();
          };

          // playing
          player.el.onplay = function () {
            map.get("live:video:playing")();
          };

          // pause
          player.el.onpause = function () {
            that.seekDuration = null;
            that.setMeidaPlayStatus("pause");
            map.get("live:video:pause")();
          };

          // seeking
          player.el.onseeking = function () {
            that.setMeidaPlayStatus("seeking");
            map.get("live:video:seeking")();
          };

          player.el.onseeked = function () {
            that.setMeidaPlayStatus("seeked");
            // map.get("live:video:seeked")();
            map.get('live:seek:finish')();
          };

          // timeupdate
          var lastClearTime = 0;
          player.el.ontimeupdate = function (e) {
            var curTime = player.currentTime();
            map.get("live:desktop:timeupdate")(curTime);
            map.get('live:camera:timeupdate')(curTime)
            //断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
            var _nowTime = Math.round(new Date().getTime() / 1000);
            if (curTime <= that.currentDuration) {
              that.setWaitingTimes(_nowTime);
            } else if (that.bx > 0 && _nowTime - lastClearTime > 1) {
              that.bx -= 1;
              lastClearTime = _nowTime;
            }
            that.currentDuration = curTime;
            if (curTime > 0) {
              that.setMeidaPlayStatus("playing");
            }
          };

          // waiting
          player.el.onwaiting = function () {
            that.bn += 1;
            that.ba += 1;
            map.get("live:video:waiting")();
            that.setMeidaPlayStatus("waiting");
          };

          // ended
          player.el.onended = function () {
            that.currentDuration = 0
            that.setMeidaPlayStatus("ended");
          };

          // error
          // player.el.onerror = function () {
          //   that.playStatus = 'error';
          //   that.bn += 1;
          //   that.ba += 1;
          //   core.playStatus = that.playStatus;
          //   if (that.changeSource == 0) {
          //     that.changeSource = 1;
          //   }
          //   that.setMeidaPlayStatus("error");
          //   map.get('live:video:error')(this);
          //   mediaCore.emit('live:video:error', that.changeSource)
          // };

          // abort
          player.el.onabort = function () {
            that.setMeidaPlayStatus("abort");
            map.get('live:video:abort')(this);
          };
        }
      } else {
        if (!this.Videojs) {
          await import('video.js').then(res => this.Videojs = res.default)
        }
        var player = this.Videojs(video, {
          techOrder: _techObj,
          // sources: _sources,
          width: defaultWidth,
          // volume: that.volumeVal,
          bigPlayButton: false,
          errorDisplay: false,
          loadingSpinner: false,
          posterImage: false,
          textTrackSettings: false,
          textTrackDisplay: false,
          controlBar: false,
          controls: false,
          preload: true,
          autoplay: true
        }, function () {
          tools.debug('desktop player source 播放 ==> ' + videoUrl)
        });

        // 初始化设置声音
        player.volume(that.volumeVal)

        // 删除controls
        // if (player.tech_.el_.hasAttribute('controls')) {
        player.tech_.el_.removeAttribute('controls')
        this.h5Player = player.tech_.el_
        // }

        // 设置src
        if (videoUrl) {
          player.src(videoUrl)
          // 直播才能执行
          if (core.playType === 'live') {
            player.load()
          }
        }
        that.player = player;
        window.__desktop__ = that.player;


        // 点播加载
        if (core.playType === 'playback') {

          // loadeddata
          player.on("loadeddata", function (res) {
            // 验证资源准确性
            if (!that.isChecked) {
              that.setMeidaPlayStatus("pause");
              return false;
            }

            that.setMeidaPlayStatus("loadeddata");
            // event.
            map.get('live:video:loaded')("media");
            // seek()
            setTimeout(function () {
              that.applySeek && that.applySeek()
            }, 100)
          });

          // loadedmetadata
          player.on("loadedmetadata", function (res) {

            // 验证视频有效性
            core.mediaValidate(this.duration(), function (isPass) {
              if (isPass) {
                that.isChecked = true;
              } else {
                that.isChecked = false;
              }
            });
            // seek桌面分享等待视频load完
            if (that.seekDuration && that.seekDuration > 0) {
              tools.debug("seeking desktop ===> " + that.seekDuration);
              setTimeout(() => {
                player.currentTime(that.seekDuration)
                that.seekDuration = 0
              }, 100)
            }
            map.get('live:video:metadata')();
            // seek桌面分享等待视频load完
            if (that.seekDuration && that.seekDuration > 0) {
              tools.debug("seeking desktop ===> " + that.seekDuration);
              setTimeout(() => {
                player.currentTime(that.seekDuration)
                that.seekDuration = 0
              }, 100)
            }
            map.get('live:video:metadata')();
          });
          player.on('canplay', function () {
            that.setMeidaPlayStatus("canplay");
            map.get("live:video:canplay")();
          })

          // playing
          player.on('play', function () {
            map.get("live:video:playing")();
          });

          // pause
          player.on('pause', function () {
            that.seekDuration = null;
            that.setMeidaPlayStatus("pause");
            map.get("live:video:pause")();
          });

          // seeking
          player.on('seeking', function () {
            that.setMeidaPlayStatus("seeking");
            map.get("live:video:seeking")();
          });

          player.on("seeked", function () {
            that.setMeidaPlayStatus("seeked");
            // map.get("live:video:seeked")();
            map.get('live:seek:finish')();
          });

          // timeupdate
          var lastClearTime = 0;
          player.on("timeupdate", function () {
            var curTime = player.currentTime();
            map.get("live:desktop:timeupdate")(curTime);
            map.get('live:camera:timeupdate')(curTime)
            //断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
            var _nowTime = Math.round(new Date().getTime() / 1000);
            if (curTime <= that.currentDuration) {
              that.setWaitingTimes(_nowTime);
            } else if (that.bx > 0 && _nowTime - lastClearTime > 1) {
              that.bx -= 1;
              lastClearTime = _nowTime;
            }
            that.currentDuration = curTime;
            if (curTime > 0) {
              that.setMeidaPlayStatus("playing");
            }
          });

          // waiting
          player.on('waiting', function (e) {
            that.bn += 1;
            that.ba += 1;
            map.get("live:video:waiting")();
            that.setMeidaPlayStatus("waiting");
          });

          // ended
          player.on('ended', function () {
            that.setMeidaPlayStatus("ended");
          });

          // error
          player.on("error", function () {
            that.playStatus = 'error';
            that.bn += 1;
            that.ba += 1;
            core.playStatus = that.playStatus;
            if (that.changeSource == 0) {
              that.changeSource = 1;
            }
            that.setMeidaPlayStatus("error");
            map.get('live:video:error')(this);
            mediaCore.emit('live:video:error', that.changeSource)
          });

          // abort
          player.on("abort", function () {
            that.setMeidaPlayStatus("abort");
            map.get('live:video:abort')(this);
          });
        }
      }
    } else {
      // seek()
      that.applySeek && that.applySeek()
    }

    // 微信端自动播放
    if (tools.isWechat()) {
      tools.detectiveWxJsBridge(function () {
        // 苹果手机才能自动播放
        if (tools.isIos()) {
          player.play()
        } else {
          player.load()
          player.play()
        }
      });
    } else {
      that.play()
    }
    var o = {
      videoUrl: videoUrl,
    }
    map.get('live:desktop:start')(that.playStatus);
    // return Promise.resolve()
  },

  // 设置媒体播放状态
  setMeidaPlayStatus: function (state) {
    var that = this;
    tools.long("video on event ===> " + state, 'desktop');
    // 抛出事件
    mediaCore.emit('vod:video:' + state, state)
    that.playStatus = state;
    core.playStatus = state;
    map.get('vod:media:event')(state)
  },

  playRate: function (rate) {
    var that = this;
    if (!that.player || that.player.techName_ == 'Flash') {
      return;
    }
    return that.player.playbackRate(rate);
  },

  changeSource: 0,
  setWaitingTimes: function (_nowTime) {
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
  // 重载 
  reloadDesktop: function () {
    var that = this;
    if (that.player) {
      var _sources = core.getVideoSource(that.videoUrl);
      that.player.src(that.videoUrl);
      that.player.load();
      that.player.play();
    }
  },
  seek: function (duration) {
    tools.debug('loadeddata desktop seek:' + duration);
    if (duration < 0) {
      return
    }
    this.seekDuration = duration;
    if (this.player) {
      this.player.currentTime(duration);
      // this.player.play();
      this.play()
    }
    this.changeSource = 0;
  },
  // 执行
  fire: function () {
    this.play()
    core.playStatus = "playing";
  },
  // @触发条件
  // @1 => 从vod.player触发
  // @2 => 直接点击视频控件
  play: function () {
    tools.debug('desktop playing.', this.player);
    this.setMeidaPlayStatus("playing");
    core.elementPlay(this.h5Player, (type) => {
      if (type === 'error') {
        this.pause()
      } else {
        this.setMeidaPlayStatus("playing");
        map.get('live:desktop:play')();
        // core.vodPlayer.tick();
      }
    })

    // map.get('live:desktop:play')();
  },
  pause: function (command) {
    tools.debug('vod desktop pause.');
    if (this.player) {
      this.player.pause();
    }
    this.setMeidaPlayStatus("pause");
    map.get('live:desktop:pause')();
  },
  stop: function (command) {
    tools.debug('desktop call stop!');
    this.seekDuration = null;
    if (this.player) {
      this.player.pause();
    }
    map.get('live:desktop:stop')();
    this.setMeidaPlayStatus("ended");
    this.stopDurationTimmer();
  },
  // 销毁
  destroy: function () {
    tools.debug('Desktop player destroy.');
    //切换之后需要销毁一些东西
    this.seekDuration = null;
    if (this.player) {
      if (core.playType === 'live') {
        this.player.pause()
        this.player.off()
        this.player.dispose()
        this.player = null
        if (this.desktopVideoDom) {
          this.desktopVideoDom.parentNode.removeChild(this.desktopVideoDom)
        }
      } else {
        this.player.dispose()
        this.player = null
      }
    }
    // var v = this.getPlayer();
    // this.stop();
    // v = null;
  }
}
export default mainPlayer