import { globalStore } from '../states/globalStore'
import * as TYPE from '../Action/action-types'
import { STATIC } from '../states/staticState'
import * as tools from '../extensions/util'
import emitter from './emitter'
export const hostMachine = {
  machine: null,

  //资源失败重载
  // loadRetry: (oriUrl, updateErrorHostGroup, callback) => {
  loadRetry: (opt, that, errorHost) => {
    if (!opt.oriUrl) { return false }
    let store = globalStore.reducerStore
    // 记录请求的原始地址
    let _oriUrl = opt.oriUrl;
    let hostGroup = [].concat(store.getState().sourceReLoad.hostGroup) //总域名分组，重试域名只在包含本数组的的子数组内重试
    // let _currentGroup = [].concat(store.getState().sourceReLoad.currentGroup)
    // new Promise((resolve) => {
    let group = ''
    for (let g in hostGroup) {
      if (hostGroup[g].includes(errorHost)) {
        console.error(`WARN => hostGroup[${g}][${errorHost}]此域名即将被删除`)
        // 删除错误的域名
        hostGroup[g].splice(hostGroup[g].indexOf(errorHost), 1)
        // 记录起匹配到的域名组
        if (hostGroup[g].length > 0) {
          group = g
        }
        // store.dispatch({
        //   type: TYPE.UPDATE_CURRENT_HOST_GROUP,
        //   payload: {
        //     currentGroup: _currentGroup,
        //   }
        // })
      }
    }
    // 匹配到可以重试的域名组才进行重试
    if (group) {
      // resolve(group)
      that.execute(_oriUrl, errorHost, opt, store, group)
    } else {
      console.error('WARN => hostGroup域名没有匹配到，可能是原始数据域名组没有，或者重试后的被删减并且更新到了localstorage')
      // 域名全部都没有匹配到情况，暂时假借成功的状态重置useSchedule的running状态为false,同时重置loading
      emitter.emit('load:whiteboard:status', { status: true })
      // store.dispatch({
      //   type: TYPE.UPDATE_CURRENT_HOST_GROUP,
      //   payload: {
      //     currentGroup: [],
      //   }
      // })
      // 计时器后要清除
      that.clear();
    }
    // }).then((g) => {
    //  that.execute(_oriUrl, errorHost, opt, store, g)
    // })
  },
  execute: function (_oriUrl, errorHost, opt, store, g) {
    // if (store.getState().sourceReLoad.hostGroup[g].length > 0) {
    let new_url = _oriUrl.replace(errorHost, store.getState().sourceReLoad.hostGroup[g][0])
    typeof opt.callback === 'function' && opt.callback(new_url);
    // } else {
    //   // 域名全部重试完的时候没有PPT加载情况，暂时假借成功的状态重置useSchedule的running状态为false,同时重置loading
    //   emitter.emit('load:whiteboard:status', { status: true })
    //   console.error('WARN => hostGroup域名已经全部重试')
    // }
  },
  schdule: function (opt) {
    let that = this
    // 创建计时器前先清除原有的
    that.clear()
    that.machine = setInterval(() => {
      // let store = globalStore.reducerStore
      let errorHost = opt.oriUrl.split('/')[2];
      // if (store.getState().sourceReLoad.currentGroup.length > 0) {
      that.loadRetry(opt, that, errorHost)
      // }
      // else {
      //   let hostGroup = [].concat(store.getState().sourceReLoad.hostGroup)
      //   new Promise((resolve) => {
      //     for (let g in hostGroup) {
      //       for (let h in hostGroup[g]) {
      //         if (hostGroup[g][h] == errorHost) {
      //           store.dispatch({
      //             type: TYPE.UPDATE_CURRENT_HOST_GROUP,
      //             payload: {
      //               currentGroup: hostGroup[g],
      //             }
      //           })
      //         }
      //       }
      //     }
      //     resolve()
      //   }).then(() => {
      //     that.loadRetry(opt, that, errorHost)
      //   })
      // }
    }, opt.time)
  },
  process: function (opt) {
    this.schdule(opt)
  },
  clear: function () {
    if (this.machine) {
      clearInterval(this.machine)
      this.machine = null
    }
  }
}
// let store = globalStore.reducerStore
// tools.loadRetry(img.target.src, function (g, host) {
//   console.warn('WARN => hostGroup[' + g + '][' + host + ']此域名失败')
//   // 记录错误的域名
//   // g 代表域名的组别，比如PPT组的域名、视频组的域名
//   store.dispatch({
//     type: TYPE.UPDATE_ERROR_GROUP,
//     payload: {
//       g: g,
//       host: host
//     }
//   })
//   return Promise.resolve()
// }, function (newUrl) {
//   // UPDATE_DOC_IMG
//   store.dispatch({
//     type: TYPE.UPDATE_DOC_IMG,
//     payload: newUrl
//   })
// })