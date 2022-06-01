require ('./trtc-js-sdk')
import * as TWebLive from './tweblive'
export class tSdk {
  constructor () {
    this.TWebLive = TWebLive
  }
  createPlayer () {
    return this.TWebLive.createPlayer()
  }
}