import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
import * as tools from './util'
import wbEmitter from './wbEmitter'
import { store } from '../states'
export const hostMachine = {
  machine: {},
  // 检出错误域名所在的hostGroup数组中的分组
  inspectTryGroup: (that, opt, errorHost) => {
    if (!opt.oriUrl) { return false }
    let store = globalStore.store
    // tryGroup初始化为[]，这里已经更新过tryGroup
    if (store.sourceReLoad.tryGroup.length > 0) {
      that.fetchHost(that, opt, errorHost)
    } else {
      // tryGroup初始化为null，这里进行赋值
      let hostGroup = [] //总域名分组，重试r域名只在包含本数组的的子数组内重试
      hostGroup = hostGroup.concat(JSON.parse(JSON.stringify(store.sourceReLoad.hostGroup)))
      for (let g in hostGroup) {
        if (hostGroup[g].includes(errorHost)) {
          // 记录起当前匹配到的域名组，后续的替换都是用这个域名组
          globalStore.actions.dispatch('sourceReLoad', {
            type: TYPES.UPDATE_TRY_GROUP,
            payload: {
              tryGroup: [].concat(hostGroup[g])
            }
          })
          that.fetchHost(that, opt, errorHost)
          return
        }
      }
      // 域名全部都没有匹配到情况，暂时假借成功的状态重置useSchedule的running状态为false,同时重置loading
      wbEmitter.emit('wb:usePPT:status', { status: true })
      tools.log('hostMachine WARN => 没能从hostGroup匹配到，请检查hostGroup以及是否包含targetHost')
    }
  },
  fetchHost(that, opt, errorHost) {
    let tryGroup = [].concat(store.sourceReLoad.tryGroup)
    if (tryGroup.includes(errorHost)) {
      let _index = tryGroup.indexOf(errorHost)
      // 取出下一个域名
      let spliceHost = tryGroup.slice(_index + 1, _index + 2)[0]
      if (spliceHost) {
        tools.log(`hostMachine WARN => tryGroup[${errorHost}] 此错误域名将被替换`)
        tools.log(`hostMachine WARN => tryGroup[]=>${spliceHost} 此域名用于重试`)
        that.loadRetry(opt, errorHost, spliceHost)
      } else {
        // 域名全部重试完的情况，暂时假借成功的状态重置useSchedule的running状态为false,同时重置loading
        wbEmitter.emit('wb:usePPT:status', { status: true })
        tools.log('hostMachine WARN => tryGroup域名组已过滤完，重试结束')
      }
    }
    // that.clear(opt.oriUrl);
  },
  loadRetry: function (opt, errorHost, host) {
    let new_url = opt.oriUrl.replace(errorHost, host)
    if (globalStore.store.page.isWebpSupport) {
      new_url = new_url.replace('.jpg', '.jpeg');
    }
    typeof opt.callback === 'function' && opt.callback(new_url);
  },
  schdule: function (opt) {
    let that = this
    let errorHost = opt.oriUrl.split('/')[2];
    // 0秒不做异步直接执行
    if (!opt.time) {
      that.inspectTryGroup(that, opt, errorHost)
      wbEmitter.emit('wb:image:error', { url: opt.oriUrl })
    } else {
      that.machine[opt.oriUrl] = setTimeout(() => {
        that.inspectTryGroup(that, opt, errorHost)
        wbEmitter.emit('wb:image:timeout', { url: opt.oriUrl })
      }, opt.time)
    }
  },
  process: function (opt) {
    if (!window.qt) {
      // 创建计时器前先清除原有的
      this.clear(opt.oriUrl);
      this.schdule(opt)
    }
  },
  clear: function (oriUrl) {
    if (oriUrl) {
      if (this.machine[oriUrl]) {
        clearTimeout(this.machine[oriUrl])
        this.machine[oriUrl] = null
      }
    }
    else {
      // 清除全部不需要传参数
      for (let i in this.machine) {
        clearTimeout(this.machine[i])
        this.machine[i] = null
      }
    }
  }
}