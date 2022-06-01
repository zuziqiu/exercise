import { action, set } from 'mobx'
import * as TYPES from './action-types'

export class memberAction {
  constructor(store) {
    this.store = store.member
  }
  dispatch(action) {
    this.member(this.store, action)
  }
  // 媒体[包括摄像头和桌面分享]
  @action member(state, action) {
    switch (action.type) {
      case TYPES.UPDATE_USER_LIST:
        switch (action.payload.kind) {
          case 'update':
            let __obj = {}
            __obj[action.payload.member.xid] = action.payload.member
            set(state.userList, __obj)
            // state.userList[action.payload.member.xid] = action.payload.member;
            break
          case 'delete':
            delete state.userList[action.payload.member.xid]
            break
        }
        break
      case TYPES.UPDATE_ONLINE_XIDS:
        state.onlineXids.push(action.payload.xid)
        break
      case TYPES.DELETE_ONLINE_XIDS:
        let __index = state.onlineXids.findIndex((item) => item == action.payload.user.xid)
        state.onlineXids.splice(__index, 1)
        break
      case TYPES.UPDATE_ROBOTLIST_OBJ:
        state.robotListObj = action.payload.robotListObj
        break
      case TYPES.UPDATE_GROUP:
        state.group = action.payload.group
        break
      default:
        return state
    }
  }
}
