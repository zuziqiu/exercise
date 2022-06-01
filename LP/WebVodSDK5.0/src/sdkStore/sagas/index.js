import {
  put,
  takeEvery,
  all,
  call,
  select,
  takeLatest
} from 'redux-saga/effects'
import {
  GET_CHAT_LIST
} from '../constants/sagaTypes'
import {
  getlist
} from './api/chat'
// x.api -> sdkStore -> x.api 
const fetchChatList = function* ({
  payload
}) {
  try {
    const res = yield call(getlist, select(state => state.room.access_token))
    payload(res)
  } catch (e) {
    console.log(e)
  }
}

function* vodSage() {
  console.warn('this is vodSaga')
  yield takeEvery(GET_CHAT_LIST, fetchChatList)
}
export default vodSage