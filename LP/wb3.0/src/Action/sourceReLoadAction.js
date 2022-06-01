import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class sourceReLoadAction {
  constructor(store) {
    this.store = store.sourceReLoad
  }
  dispatch(action) {
    this.sourceReLoad(this.store, action)
  }
  // 资源重试
  @action sourceReLoad(state, action) {
    switch (action.type) {
      case TYPES.UPDATE_HOST_GROUP:
        state.hostGroup = action.payload.hostGroup
        break;
      case TYPES.UPDATE_TRY_GROUP:
        state.tryGroup = action.payload.tryGroup
        break;
      default:
        return state
    }
  }
}