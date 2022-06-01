import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class cousewareResourceAction {
  constructor(store) {
    this.store = store.cousewareResource
  }
  dispatch(action) {
    this.cousewareResource(this.store, action)
  }
  // PPT地址
  @action cousewareResource(state, action) {
    switch (action.type) {
      case TYPES.UPDATE_DOC_IMG:
        state.img = action.payload
        break;
      default:
        return state
    }
  }
}