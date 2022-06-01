// import qs from 'qs';
import wbEmitter from '../extensions/wbEmitter'
import { globalStore } from '../states/globalStore'
import * as tools from '../extensions/util'
import * as TYPES from '../Action/action-types'

class Service {
  constructor() {

  }
  async updateCurPageData() {
    if (globalStore.store.room.token) {
      let hostTmp = window.location.host.match(/open-[\d]+\.talk-fun\.com/),
        domain = hostTmp ? hostTmp[0] : 'open.talk-fun.com',
        url = `https://${domain}/live/command.php` // 主域
      try {
        await import('axios').then(async (_axios) => {
          const res = await _axios.get(url, {
            params: {
              access_token: globalStore.store.room.token,
              page: globalStore.store.page.currentPage
            }
          })
          if (res.data.code == 0) {
            res.data.data.forEach(item => {
              tools.log('UPDATE_PAGE_DRAW_DATA ==>', item)
              // 更新pageDrawData
              wbEmitter.emit(TYPES.UPDATE_PAGE_DRAW_DATA, { drawData: item })
            })
            // 刷新后使reload失去旋转
            globalStore.actions.dispatch('room', {
              type: TYPES.UPDATE_ROOM_RELOAD,
              payload: 'reload'
            })
          }
        })
        return 1
      } catch (error) {
        tools.error(error);
        return 0
      }
    } else {
      tools.warn('not store.room.token')
      return 0
    }
  }
}
export const service = new Service()