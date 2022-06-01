/**
 * 执行SDK事件队列
 * 用于某些事件需要延迟执行
 * 通过 join 添加, run 执行
 */
define(function(require) {
  var tools = require('@tools')
  var sdkFire = {
    // defines
    queueArys: [],
    queueHash: {},
    runner: null,
    // 加入事件队列
    join: function(key, value){
      tools.debug('event join ==>', key)
      if (!this.queueHash[key]) {
        this.queueHash[key] = value
        this.queueArys.push(this.queueHash[key])
      }
    },
    // 执行队列
    run: function(_parent){
      var that = this
      if (this.queueArys.length > 0) {
        if (!this.runner) {
          this.runner = setInterval(function(){
            var o = that.queueArys.shift()
            tools.debug('event run ==>', o)
            if (o) {
              o.callback.call(o.parent)
            }
            if (that.queueArys.length === 0) {
              clearInterval(that.runner)
              that.runner = null
              return false
            }
          }, 100)
        }
      }
    }
  }
  return sdkFire;
});