import { createStore, combineReducers, applyMiddleware } from 'redux'
import crateSagaMiddleware from 'redux-saga'
import vodSaga from './sagas'
import { composeWithDevTools } from 'redux-devtools-extension'
import { observer, observe } from 'redux-observers'
import reducers from './reducers'
// import { computed } from './states/computed'

const sagaMiddleware = crateSagaMiddleware(vodSaga)
let sdkStore = createStore(combineReducers(reducers), composeWithDevTools(applyMiddleware(sagaMiddleware)))
// sdkStore.computed = computed
// 启动 saga
sagaMiddleware.run(vodSaga)

// sdkStore.subscribeState = {}
// sdkStore.subscribeStateArys = []
// sdkStore.observeList = []
sdkStore.listen = (mapfn, callback) => {
  const myObserver = observer(mapfn, (dispatch, current, previous) => {
    // expect(previous).to.be.ok()
    // expect(current).to.not.eql(previous)
    callback(dispatch, current, previous, sdkStore.getState())
  })

  observe(sdkStore, [myObserver])
  // let spliter = mapfn.toString().split('=>')
  // let kstate = spliter[1]
  // if (typeof kstate !== 'string') {
  //   console.log('ERROR => Caller must be a string! => ', kstate, this)
  //   return false
  // }
  // caller(state)
  // if (!this.subscribeState) {
  //   this.subscribeState = {}
  //   this.subscribeStateArys = []
  //   this.observeList = []
  // }
  // if (!this.subscribeState.hasOwnProperty(kstate)) {
  // this.subscribeState[kstate] = observer(mapfn, (dispatch, cur, prev) => {
  //   callback(dispatch, cur, prev, state)
  // })
  // this.subscribeStateArys.push(this.subscribeState[kstate])
  // this.observeList.push(observe(sdkStore, this.subscribeStateArys))
  // } else {
  //   console.log('[WARN]!! Aready listened => ', kstate)
  // }
}
// mark 想下要怎么destroy
sdkStore.destroy = () => {
  this.subscribeState = {}
  this.subscribeStateArys = []
  if (this.observeList) {
    this.observeList.map((item) => {
      item && item()
    })
    this.observeList = []
  }
}
window.__sdkStore = sdkStore
export default sdkStore
