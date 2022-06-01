/**
 * PPT预览功能
 * {
 *  @function callback [传入callback]
 *  @next dom [下一页]
 *  @prev dom [上一页]
 *  @wrap dom [包裹容器][#必须]
 * }
 */
import tools from '../utils/tools'
// import h5Player from './h5.player-core'
import { STATIC } from '../states/staticState'
// import state from '../core/store/state'
import { sdkStore } from '../states'
export default {
  dom: null,
  isInitDone: false,
  opts: null,
  pageIndex: 0,
  pptUrls: [],
  cmd: {
    url: null
  },
  docList: [],
  // 设置url
  setCurPageCommand(url) {
    if (!this.isInitDone) {
      return false
    }
    if (url) {
      if (url === this.cmd.url) {
        return false
      }
      this.reset()
      this.cmd.url = url
      this.getDocList()
    }
  },
  // 初始化
  init(opts) {
    // dom 元素
    if (!document.querySelector(opts.wrap)) {
      tools.debug('ppt preview dom is not found!')
      this.isInitDone = false
      return false
    } else {
      tools.debug('ppt preview init ==>', opts)
      this.dom = opts.wrap
      this.opts = opts
      this.isInitDone = true
    }
    // 绑定事件
    this.bindEvent()
  },
  bindEvent() {
    let $next = document.querySelector(this.opts.next)
    let $prev = document.querySelector(this.opts.prev)
    if ($next) {
      $next.addEventListener('click', () => {
        this.next()
      }, false)
    }
    if ($prev) {
      $prev.addEventListener('click', () => {
        this.prev()
      }, false)
    }
  },
  // get doc list
  getDocList() {
    var that = this
    tools.ajax({
      method: 'GET',
      url: STATIC.APP_HOST + '/live/document.php',
      data: {
        act: 'preview',
        url: encodeURIComponent(this.cmd.url),
        access_token: sdkStore.room.access_token
      },
      success: function (res) {
        if (res?.data.length > 0) {
          that.docList = res.data
          that.computed(res.data)
          that.get(1)
        }
      },
      error: function (res) {
        console.error('ppt load preview error', res)
      }
    })
    // : https://open.talk-fun.com/live/document.php?act=preview&id=675460&access_token=3MzMjhDMYwJye
    //   return tools.ajax({
    //   })
  },
  computed(list) {
    if (list.length > 0) {
      let _list = []
      list.forEach(item => {
        item.urls.forEach(sitem => {
          _list.push(sitem)
        })
      })
      this.pptUrls = _list
    }
  },
  get(index) {
    if (index <= 0) {
      index = 1
    }
    if (index > 0) {
      if (index > this.pptUrls.length) {
        index = this.pptUrls.length
      }
      let curImg = this.pptUrls[index - 1]
      // webp is supported?
      tools.webpSupport((isWebpSupport) => {
        if (isWebpSupport) {
          curImg = curImg.replace('.jpg', '.jpeg')
        }
        let o = {
          curPage: index,
          total: this.pptUrls.length,
          img: curImg
        }
        tools.debug('cur ppt preview object ==>', o)
        tools.callback(this.opts.callback, o)
        // this.opts.callback(output)
        if (this.opts.wrap && !this.imgDom) {
          this.imgDom = document.createElement('img')
          this.imgDom.src = curImg
          this.imgDom.style.display = 'block'
          this.imgDom.style.width = '100%'
          this.imgDom.style.height = 'auto'
          document.querySelector(this.opts.wrap).appendChild(this.imgDom)
        } else {
          this.imgDom.src = curImg
        }
      })
      this.pageIndex = index
    }
  },
  // reset
  reset() {
    this.docList = []
    this.pptUrls = []
    this.pageIndex = 1
  },
  // next
  next() {
    this.pageIndex += 1
    this.get(this.pageIndex)
  },
  // prev
  prev() {
    this.pageIndex -= 1
    this.get(this.pageIndex)
  }
}