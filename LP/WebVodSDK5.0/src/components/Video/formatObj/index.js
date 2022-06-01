import hlsFormatObj from './hlsFormatObj'
import videoFormatObj from './videoFormatObj'
export default async (mediaDom, url) => {
  let formatObj = null
  let newHls = null // 实例化hls对象
  // 步骤1：判断url是m3u8格式
  if (/\.m3u8/gi.test(url)) {
    newHls = await hlsFormatObj()
    newHls.loadSource(url)
    newHls.attachMedia(mediaDom)
  }
  // 步骤2：如果指定m3u8格式的地址，需要先判断是否能使用hls
  if (newHls) {
    formatObj = {
      el: mediaDom,
      url: url,
      currentTime: function (currentTime) {
        if (currentTime) {
          this.el.currentTime = Math.floor(currentTime)
        } else {
          return mediaDom.currentTime
        }
      },
      playbackRate: function (rate) {
        mediaDom.playbackRate = rate
      },
      duration: function () {
        return mediaDom.duration
      },
      pause: function () {
        mediaDom.pause()
      },
      paused: function () {
        return mediaDom.paused
      },
      src: function (url) {
        if (url) {
          // if (!mainPlayer.newHls) {
          //   mainPlayer.newHls = new mainPlayer.Hls()
          // }
          if (Object.prototype.toString.call(url) == '[object String]') {
            mainPlayer.newHls.loadSource(url)
            this.url = url
          }
          // else {
          //   mainPlayer.newHls.loadSource(url[0].src)
          //   this.url = url[0].src
          // }
          newHls.attachMedia(mediaDom)
        } else {
          return this.url
        }
      },
      dispose: function () {}
    }
  } else {
    // 步骤3：(非m3u8格式 || m3u8格式但是不支持hls)时使用video.js
    formatObj = await videoFormatObj(mediaDom)
    formatObj.src(url)
    // 初始化设置声音
    // formatObj.volume(that.volumeVal)
    // 删除controls
    // formatObj.tech_.el_.removeAttribute('controls')
    // formatObj.src(url)
  }
  return formatObj
}
