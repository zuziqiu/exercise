/**
 * 执行SDK事件队列
 * 用于某些事件需要延迟执行
 * 通过 join 添加, run 执行
 */
import tools from '../utils/tools'
import { lifeCycle } from './lifeCycle'
export const playerSchedule = {
  isLoaded: false,
  // defines
  queueArys: [],
  queueHash: {},
  runner: null,
  // 加入事件队列
  join: function (key, option) {
    tools.debug('sync event join ==>', key)
    if (!this.queueHash[key]) {
      this.queueHash[key] = option
      option.key = key
      this.queueArys.push(this.queueHash[key])
    }
    // 已初始化, 立刻执行(异步)
    if (this.isLoaded) {
      this.run()
    }
  },
  // 执行队列
  run: function (_parent) {
    var that = this
    return new Promise((reslove) => {
      if (this.queueArys.length > 0) {
        if (!this.runner) {
          this.runner = setInterval(function () {
            var o = that.queueArys.shift()
            if (o) {
              tools.debug('sync event fire ==>', o.key)
              o.callback.call(o.parent)
            }
            if (that.queueArys.length === 0) {
              clearInterval(that.runner)
              that.runner = null
              reslove()
              return false
            }
          }, 100)
        }
      }
    }).then(() => {
      // 执行生命周期函数：mounted
      lifeCycle.lifeControler['mounted']?.next()
    })
  }
}
  // window.__fire = playerSchedule
  // return playerSchedule;
// });