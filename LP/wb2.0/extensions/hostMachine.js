import { globalStore } from '../states/globalStore'
import * as TYPES from '../Action/action-types'
// import { STATIC } from '../states/staticState'
import * as tools from '../extensions/util'
import emitter from './emitter'
export const hostMachine = {
  //   machine: {},

  //   //资源失败重载
  //   // loadRetry: (oriUrl, updateErrorHostGroup, callback) => {
  //   loadRetry: (opt, that, errorHost) => {
  //     if (!opt.oriUrl) { return false }
  //     let store = globalStore.reducerStore
  //     // 记录请求的原始地址
  //     let _oriUrl = opt.oriUrl;
  //     // 临时域名组，是一个二维数组，每次进入都会从store重新取值
  //     let hostGroup = []//总域名分组，重试域名只在包含本数组的的子数组内重试
  //     hostGroup = hostGroup.concat(JSON.parse(JSON.stringify(store.getState().sourceReLoad.hostGroup)))
  //     // 记录的下标
  //     let group = ''
  //     let _index = 0
  //     let newHost = null
  //     for (let g in hostGroup) {
  //       if (hostGroup[g].includes(errorHost)) {
  //         tools.log(`WARN => hostGroup[${g}][${errorHost}]此域名即将被代理域名组删除`)
  //         // 删除错误的域名（每次进入的项下标都会不一样）
  //         _index = hostGroup[g].indexOf(errorHost)
  //         newHost = hostGroup[g].splice(_index + 1, 1)[0]
  //         // hostGroup[g].splice(_index, 1)
  //         // 记录起匹配到的域名组的某项的下标
  //         // if (hostGroup[g].length > 0) {
  //         //   group = g
  //         // }
  //       }
  //     }
  //     // 匹配到可以重试的域名组才进行重试
  //     if (newHost) {
  //       that.execute(_oriUrl, errorHost, opt, newHost)
  //     } else {
  //       console.log('WARN => 代理域名组没有匹配到，可能是原始数据域名组没有该项的组，或者全部重试完毕')
  //       // 域名全部都没有匹配到情况，暂时假借成功的状态重置useSchedule的running状态为false,同时重置loading
  //       emitter.emit('load:whiteboard:status', { status: true })
  //       // 计时器后要清除
  //     }
  //     that.clear(opt.oriUrl);
  //   },
  //   execute: function (_oriUrl, errorHost, opt, newHost) {
  //     let new_url = _oriUrl.replace(errorHost, newHost)
  //     if (globalStore.reducerStore.getState().page.isWebpSupport) {
  //       new_url = new_url.replace('.jpg', '.jpeg');
  //     }
  //     typeof opt.callback === 'function' && opt.callback(new_url);
  //   },
  //   schdule: function (opt) {
  //     let that = this
  //     // 创建计时器前先清除原有的
  //     that.clear(opt.oriUrl);
  //     that.machine[opt.oriUrl] = setTimeout(() => {
  //       let errorHost = opt.oriUrl.split('/')[2];
  //       that.loadRetry(opt, that, errorHost)
  //       emitter.emit(`whiteboard:image:${opt.type}`, { url: opt.oriUrl, type: opt.type })
  //     }, opt.time)
  //   },
  //   process: function (opt) {
  //     this.schdule(opt)
  //   },
  //   clear: function (oriUrl) {
  //     if (oriUrl) {
  //       if (this.machine[oriUrl]) {
  //         clearTimeout(this.machine[oriUrl])
  //         this.machine[oriUrl] = null
  //       }
  //     } else {
  //       // 清除全部不需要传参数
  //       for (let i in this.machine) {
  //         clearTimeout(this.machine[i])
  //         this.machine[i] = null
  //       }
  //     }
  //   }
  // }
  machine: {},
  // 检出错误域名所在的hostGroup数组中的分组
  inspectTryGroup: (that, opt, errorHost) => {
    if (!opt.oriUrl) { return false }
    let store = globalStore.reducerStore.getState()
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
          new Promise((resolve) => {
            globalStore.reducerStore.dispatch({
              type: TYPES.UPDATE_TRY_GROUP,
              payload: {
                tryGroup: [].concat(hostGroup[g])
              }
            })
            resolve()
          }).then(() => {
            that.fetchHost(that, opt, errorHost)
          })
          return
        }
      }
      // 域名全部都没有匹配到情况，暂时假借成功的状态重置useSchedule的running状态为false,同时重置loading
      emitter.emit('load:whiteboard:status', { status: true })
      tools.log('hostMachine WARN => tryGroup域名组是初始值null，没能从hostGroup匹配到')
    }
  },
  fetchHost(that, opt, errorHost) {
    let tryGroup = [].concat(globalStore.reducerStore.getState().sourceReLoad.tryGroup)
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
        emitter.emit('load:whiteboard:status', { status: true })
        tools.log('hostMachine WARN => tryGroup域名组已过滤完，重试结束')
      }
    }
    // that.clear(opt.oriUrl);
  },
  loadRetry: function (opt, errorHost, host) {
    let new_url = opt.oriUrl.replace(errorHost, host)
    if (globalStore.reducerStore.getState().page.isWebpSupport) {
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
      emitter.emit('whiteboard:image:error', { url: opt.oriUrl })
    } else {
      that.machine[opt.oriUrl] = setTimeout(() => {
        that.inspectTryGroup(that, opt, errorHost)
        emitter.emit('whiteboard:image:timeout', { url: opt.oriUrl })
      }, opt.time)
    }
  },
  process: function (opt) {
    // 创建计时器前先清除原有的
    this.clear(opt.oriUrl);
    this.schdule(opt)
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