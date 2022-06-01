/**
 * @author echo
 * @date 2021、03
 * @description react + mobx
 * 入口文件
 */

import { toJS, transaction, autorun } from 'mobx'
import { actions } from './Action/index';
import { store } from './states/index'
import { globalStore } from './states/globalStore'
import { MainTemplate } from './components/index'
import wbEmitter from './extensions/wbEmitter'
import * as TYPES from './Action/action-types'
import { page } from './core/page'
import * as tools from './extensions/util'
import { graphic } from './graphic'
  ; require('./assets/main.less')


// Redux init.
export class WhiteBoard {
  constructor({ id, powerEnable = true, isAdmin = null, hostGroup = [], reload = true, token = '12345' }) {
    this.vconsole = null
    this.tools = tools
    this.events = TYPES
    // this.init({ id, powerEnable, isAdmin, hostGroup, reload, token })
    /* 
      constructor中定义async可以让该类在外部实例化时用await，实现等待类的内部某些逻辑初始化完毕
      具体用法：awati new class()
    */
    return (async () => {
      await this.init({ id, powerEnable, isAdmin, hostGroup, reload, token })
      tools.log(`id:${id}, powerEnable:${powerEnable}, isAdmin:${isAdmin}`)
      return this;
    })();
  }
  // 入口
  async init({ id, powerEnable, isAdmin, hostGroup, reload, token }) {
    // 小班会用到this.__wbStore这个内部属性
    this.__wbStore = globalStore
    // 把actions挂载到globalStore
    globalStore.setAction(actions)
    // 把store挂载到globalStore，执行组件把store挂在组件上
    globalStore.setStore(store)
    if (this.tools.getQueryStr('wbDebug') === 'true' || store.room.debugMode == 'true') {
      localStorage.setItem('vConsole_switch_x', 40)
      localStorage.setItem('vConsole_switch_y', 40)
      await require(['vconsole'], (VConsole) => {
        this.vconsole = new VConsole()
        globalStore.wbClass = this
        if (store.room.debugMode == 'false') {
          globalStore.actions.dispatch('room', {
            type: 'FIRE_DEBUG_MODE',
            payload: {
              visible: 'true'
            }
          })
        }
      })
    }
    // 更新资源重试的域名组（目前有用于PPT图片加载重试）
    globalStore.actions.dispatch('sourceReLoad', {
      type: TYPES.UPDATE_HOST_GROUP,
      payload: {
        hostGroup: hostGroup || []
      }
    })
    globalStore.actions.dispatch('room',
      [{
        type: TYPES.UPDATE_ROOM_SET_TOKEN,
        payload: 'QZkJTMkVDO0ADM4YWNwcjZxIzYxIGMxIGZhZTO5QmN1wHf81nI1QjM3ETNy8VO5YDO1ETMiojIl1WYuJnIsAjOiEmIsAjOiQWanJCLiUDNycTM1IjI6ICZp9VZzJXdvNmIsIiI6IichRXY2FmIsAjOiIXZk5WZnJCLwMjMwIzN3IjNxojIlJXawhXZiwCMzIjN1gjNyYTM6ISZtlGdnVmciwSXbpjIyRHdhJCLiIXZzVnI6ISZs9mciwSMyEzM0ADO3QjOiQWa4JCLikTN1YTdclTYyUTdcJiOiUWbh52ajlmbiwCM6ICZpJmIsICOwcDMwEzXuVGcvJiOiQWa1JCL5kjN4UTMxojIklWbv9mciwCMyojIklGciwCMyojIkl2XyVmb0JXYwJye'
      },
      // 是否开启刷新按钮
      {
        type: TYPES.UPDATE_ROOM_RELOAD,
        payload: reload ? 'reload' : null
      },
      // 初始化的涂鸦权限
      {
        type: TYPES.UPDATE_ROOM_DRAW_ENABLE,
        payload: powerEnable
      },
      // save 画板容器id
      {
        type: TYPES.WHITEBOARD_CONTAINER_ID,
        payload: {
          id: id
        }
      }]
    )

    MainTemplate(store)
    // 管理员以上身份会通过spy监听所有mobx的更新来设置本地缓存
    if (isAdmin) {
      let _identifyId = localStorage['wbIdentifyId']
      if (_identifyId) {
        let key = `_TF_WB_${_identifyId}`
        autorun((event) => {
          console.log('autorun => ', event)
          localStorage.setItem(key, JSON.stringify(globalStore.getState()))
        })
      }
    }
    this.listener()
  }
  listener() {
    globalStore.listen(
      () => { return { debugMode: toJS(store.room.debugMode) } },
      ({ debugMode }) => {
        if (debugMode == 'true') {
          if (!this.vconsole) {
            require(['vconsole'], (VConsole) => {
              this.vconsole = new VConsole()
            })
          }
        } else {
          this.vconsole.destroy()
          this.vconsole = null
        }
      }
    )
  }
  // 让画板拥有发送数据能力
  emit(key, command, callback) {
    wbEmitter.emit(key, command, callback)
  }
  // 让画板注册事件监听
  on(event, handler) {
    wbEmitter.on(event, handler)
  }
  // 允许画板提供外部修改内部状态的权限
  // dispatch(modolus, { type, payload }) {
  dispatch(data) {
    /* 
      payload是外界传入的数据，一定要小心处理。
      1、判断是否有
      2、强转一次，防止外界传入深拷贝对象
      3、............
     */
    // console.warn('wb:dispatch', JSON.stringify(data))
    return new Promise((resolve) => {
      transaction(() => {
        [].concat(data).map(item => {
          if (typeof item.modules == 'undefined') {
            this.tools.error('调用dispatch, modules 未定义 => ', item)
          } else if (typeof item.payload == 'undefined') {
            this.tools.error('调用dispatch, payload 未定义 => ', item)
          } else if (typeof item.type == 'undefined') {
            this.tools.error('调用dispatch, type 未定义 => ', item)
          } {
            globalStore.actions.dispatch(item.modules, {
              type: item.type,
              payload: JSON.parse(JSON.stringify(item.payload))
            })
          }
        })
      })
      resolve()
    })
  }
  // 销毁
  destroy() {
    return new Promise((resolve, reject) => {
      page.clearDrawData().then(() => {
        // clear context2D
        wbEmitter.emit('whiteboard:removeListenResize')
        if (globalStore.fabric.contextContainer) {
          globalStore.fabric.clearContext(globalStore.fabric.contextContainer)
        }
      }).then(() => {
        // 禁用fabric
        globalStore.fabric.dispose()
      }).then(() => {
        globalStore.destroy()
        // 会清除相关的dom
        wbEmitter.emit('whiteboard:clearDom')
        resolve()
      })
    })
  }
  // 获取画板的数据
  getWbData() {
    return globalStore.getState()
  }
  // 获取文字聚焦的数组（是fabric的对象）
  getTextFocusArray() {
    return this.tools.textFocusArray()
  }
  // 使用画笔
  use(type, payload) {
    graphic.use(type, payload)
  }
}