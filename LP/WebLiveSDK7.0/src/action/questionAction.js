import { action } from 'mobx';
import * as TYPES from './action-types'

export class questionAction {
  constructor(store) {
    this.store = store.question
  }
  dispatch(action) {
    this.question(this.store, action)
  }
  // 问答
  @action question(state, action) {
    switch (action.type) {
      case TYPES.ADD_QUESTION_ID:
        state.allQids.add(action.payload.id)
        break;
      case TYPES.DELETE_QUESTION_ID:
        state.allQids.delete(action.payload.id)
        break;
    }
  }
}