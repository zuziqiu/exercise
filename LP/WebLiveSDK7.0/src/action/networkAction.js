import { action } from 'mobx';
import * as TYPES from './action-types'

export class networkAction {
  constructor(store) {
    this.store = store.network
  }
  dispatch(action) {
    this.network(this.store, action)
  }
  // 媒体[包括摄像头和桌面分享]
  @action network(state, action) {
    switch (action.type) {
      case TYPES.UPDATE_NETWORK_SPEED: {
        state.speed = action.payload.speed
      }
    }
  }
}