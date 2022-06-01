/**
 * marker 水印功能
 */
import store from '../../core/store'
import tools from '@tools'
let marker = {
  idTimer: null,
  conId: null,
  markContent: null,
  // 随机
  randomPosition(dom) {
    if (this.idTimer) {
      window.clearTimeout(this.idTimer)
    }
    // 随机时间
    var getTime = () => {
      // 时间 = 10分钟 * 随机
      const SECOND_TIME = 60 // 秒
      const MIN_TIME = 10 // 分钟
      var baseTime = SECOND_TIME * MIN_TIME
      var range = Math.abs((Math.random() * 1).toFixed(1))
      return (baseTime * range) * 1000
    }
    // 渲染
    var markCore = () => {
      this.idTimer = setTimeout(() => {
        let keyDom = document.querySelector('#t-m-ran')
        if (!keyDom) {
          this.createMark(this.conId, this.markContent)
          return false
        }
        let r = this.getRan()
        keyDom.style.top = r.r1
        keyDom.style.left = r.r2
        // 递归调用
        markCore()
      }, getTime())
    }
    markCore()
  },
  // 获取随机
  getRan() {
    var r1 = ['5%', '8%', '12%', '22%', '31%', '43%', '50%', '60%', '70%', '80%', '85%'],
      r1p = Math.floor(Math.random() * r1.length),
      r2p = Math.floor(Math.random() * r1.length)
    return {
      r1: r1[r1p],
      r2: r1[r2p]
    }
  },
  // 销毁
  destroy() {
    if (this.idTimer) {
      window.clearTimeout(this.idTimer)
      this.idTimer = null
      let dom = document.querySelector('#t-m-ran')
      if (dom) {
        dom.parentNode.removeChild(dom)
      }
    }
  },
  // build
  createMark(id, markContent) {
    if (id) {
      this.conId = id
      this.markContent = markContent
      // creates
      let $outer = document.querySelector(id)
      let isExist = document.querySelector('#t-m-ran')
      if ($outer && !isExist) {
        var span = document.createElement('span')
        let data = store.getters('getInitData')
        let uid = 0
        if (data && data.user && data.user.uid) {
          uid = data.user.uid
        }
        let r = this.getRan()
        span.innerHTML = markContent ? markContent : uid
        span.className = 't-id-ctx'
        span.id = 't-m-ran'
        span.style.cssText = `
          position:absolute; 
          padding: 5px;
          z-index: 1500;
          top: ${r.r1};
          left: ${r.r2};
          color: rgba(202, 202, 202, 0.6);
          font-size: 12px;
        `
        $outer.appendChild(span)
        this.randomPosition(span)
      }
    }
  },
  // init
  init(container, markContent, cssText) {
    tools.debug('marker init ==>', container, markContent)
    this.createMark(container, markContent, cssText)
  }
}
export default marker