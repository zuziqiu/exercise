import { action } from 'mobx';
import * as TYPES from './action-types'
import * as tools from '../extensions/util'

export class pptInfoResourceAction {
  constructor(store) {
    this.store = store.pptInfoResource
  }
  dispatch(action) {
    this.pptInfoResource(this.store, action)
  }
  // ppt信息
  @action pptInfoResource(state, action) {
    switch (action.type) {
      case TYPES.PPT_INFO_SOURCE:
        // return Object.assign({}, state, action.payload.pptInfoResource)
        state.width = action.payload.pptInfoResource.width || state.width
        state.height = action.payload.pptInfoResource.height || state.height
        state.ratio = action.payload.pptInfoResource.ratio || state.ratio
        state.scale = action.payload.pptInfoResource.scale || state.scale
        state.postScale = action.payload.pptInfoResource.postScale || state.postScale
        state.loaded = action.payload.pptInfoResource.loaded || state.loaded
        break;
      case TYPES.PPT_SCROLL_POST_TOP_INFO:
        state.scrollInfo = action.payload.scrollInfo
        break;
      default:
        return state
    }
  }
}