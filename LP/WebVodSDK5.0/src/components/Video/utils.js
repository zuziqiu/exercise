export const videoInstanceAdatper = (el, url, newHls) => {
  return {
    el: el,
    url: url,
    currentTime(value) {
      if (value) return el.currentTime = Math.floor(value)
      return el.currentTime
    },
    playbackRate(value) {
      if (value) return el.playbackRate = value
      return el.playbackRate
    },
    duration() {
      return el.duration
    },
    volume(value) {
      el.volume = value
    },
    paused() {
      return el.paused
    },
    play() {
      return el.play().catch(playErr => console.log(`playErr ==> ${playErr}`))
    },
    pause() {
      return el.pause()
    },
    src(value) {
      return url
    },
    dispose() {
      newHls.destroy();
    },
    on(eventName, callback) {
      el.addEventListener(eventName, callback)
    }
  }
}