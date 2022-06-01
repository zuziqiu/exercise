import tools from '@tools'
export default {
  mediaElement: null,
  eventList: [],
  currentTime() {
    if (this.mediaElement) {
      return this.mediaElement.currentTime
    }
  },
  duration() {
    if (this.mediaElement) {
      return this.mediaElement.duration
    }
  },
  src() {

  },
  play () {

  },
  playbackRate() {

  },
  on(event, callback) {
    tools.debug('media event on ==>', event)
    if (this.mediaElement) {
      this.mediaElement.addEventListener(event, callback, false)
      var o = {
        event: event,
        callback: callback
      }
      this.eventList.push(o)
    }
  },
  off() {
  },
  init(element) {
    if (element) {
      this.mediaElement = element
    }
  },
}