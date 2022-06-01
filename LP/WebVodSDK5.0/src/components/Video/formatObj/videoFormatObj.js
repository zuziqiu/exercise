import core from '@/core/player.core'
import mediaCore from '@/core/mediaCore'
import map from '@/common/utils/map'
export default async (mediaDom) => {
  let videoJs = null
  // 步骤3：(非m3u8格式 || m3u8格式但是不支持hls)时使用video.js
  await import('video.js').then((res) => {
    videoJs = res.default
  })
  let __video = videoJs(
    mediaDom,
    {
      techOrder: ['html5'],
      // sources: _sources,
      width: 500,
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
    },
    function () {
      console.debug('desktop __video source 播放 ==> ')
    }
  )
  // // 初始化设置声音
  // __video.volume(that.volumeVal)

  // 删除controls
  // if (__video.tech_.el_.hasAttribute('controls')) {
  // __video.tech_.el_.removeAttribute('controls')
  // }

  // 设置src
  // if (videoUrl) {
  //   __video.src(videoUrl)
  // }
  // that.__video = __video
  // window.__desktop__ = that.__video

  // 点播加载
  // loadeddata
  __video.on('loadeddata', function (res) {
    // 验证资源准确性
    // if (!that.isChecked) {
    //   that.setMeidaPlayStatus('pause')
    //   return false
    // }

    // that.setMeidaPlayStatus('loadeddata')
    // event.
    map.get('live:video:loaded')('media')
    // seek()
    // setTimeout(function () {
    //   that.applySeek && that.applySeek()
    // }, 100)
  })

  // loadedmetadata
  __video.on('loadedmetadata', function (res) {
    // // 验证视频有效性
    // core.mediaValidate(this.duration(), function (isPass) {
    //   if (isPass) {
    //     that.isChecked = true
    //   } else {
    //     that.isChecked = false
    //   }
    // })
    // // seek桌面分享等待视频load完
    // if (that.seekDuration && that.seekDuration > 0) {
    //   tools.debug('seeking desktop ===> ' + that.seekDuration)
    //   setTimeout(() => {
    //     __video.currentTime(that.seekDuration)
    //     that.seekDuration = 0
    //   }, 100)
    // }
    // map.get('live:video:metadata')()
    // // seek桌面分享等待视频load完
    // if (that.seekDuration && that.seekDuration > 0) {
    //   tools.debug('seeking desktop ===> ' + that.seekDuration)
    //   setTimeout(() => {
    //     __video.currentTime(that.seekDuration)
    //     that.seekDuration = 0
    //   }, 100)
    // }
    map.get('live:video:metadata')()
  })
  __video.on('canplay', function () {
    // that.setMeidaPlayStatus('canplay')
    map.get('live:video:canplay')()
  })

  // playing
  __video.on('play', function () {
    map.get('live:video:playing')()
  })

  // pause
  __video.on('pause', function () {
    // that.seekDuration = null
    // that.setMeidaPlayStatus('pause')
    map.get('live:video:pause')()
  })

  // seeking
  __video.on('seeking', function () {
    // that.setMeidaPlayStatus('seeking')
    map.get('live:video:seeking')()
  })

  __video.on('seeked', function () {
    // that.setMeidaPlayStatus('seeked')
    // map.get("live:video:seeked")();
    map.get('live:seek:finish')()
  })

  // timeupdate
  var lastClearTime = 0
  __video.on('timeupdate', function () {
    var curTime = __video.currentTime()
    map.get('live:desktop:timeupdate')(curTime)
    map.get('live:camera:timeupdate')(curTime)
    //断网卡顿时，获取的时间可能会在一个小范围内来回变动，所以会出现小的情况
    // var _nowTime = Math.round(new Date().getTime() / 1000)
    // if (curTime <= that.currentDuration) {
    //   that.setWaitingTimes(_nowTime)
    // } else if (that.bx > 0 && _nowTime - lastClearTime > 1) {
    //   that.bx -= 1
    //   lastClearTime = _nowTime
    // }
    // that.currentDuration = curTime
    // if (curTime > 0) {
    //   that.setMeidaPlayStatus('playing')
    // }
  })

  // waiting
  __video.on('waiting', function (e) {
    // that.bn += 1
    // that.ba += 1
    map.get('live:video:waiting')()
    // that.setMeidaPlayStatus('waiting')
  })

  // ended
  __video.on('ended', function () {
    // that.setMeidaPlayStatus('ended')
  })

  // error
  __video.on('error', function () {
    // that.playStatus = 'error'
    // that.bn += 1
    // that.ba += 1
    // core.playStatus = that.playStatus
    // sdkStore.dispatch({
    //   type: actionTypes.UPDATE_PLAY_STATUS,
    //   payload: {
    //     playStatus: that.playStatus
    //   }
    // })
    // if (that.changeSource == 0) {
    //   that.changeSource = 1
    // }
    // that.setMeidaPlayStatus('error')
    map.get('live:video:error')(this)
    mediaCore.emit('live:video:error', that.changeSource)
  })

  // abort
  __video.on('abort', function () {
    // that.setMeidaPlayStatus('abort')
    map.get('live:video:abort')(this)
  })

  return __video
}
