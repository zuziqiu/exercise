import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import sdkStore from '@/sdkStore'
// import * as actionTypes from '@/sdkStore/constants/actionTypes'
import PlayProgress from './PlayProgress'
import { PlayRate } from './PlayRate'
import Camera from './Camera'
import Video from './Video'
export const ComponentEntry = () => {
  class indexComponent extends PureComponent {
    constructor() {
      super()
    }
    render() {
      let state = this.props
      return (
        <>
          {/* 摄像头 */}
          {state.camera.cameraContainerId ? <Camera /> : null}
          {/* 视频（桌面分享/视频插播） */}
          {state.video.videoContainerId ? <Video /> : null}
          <PlayProgress />
          <PlayRate data={state.vodControls.playRate} />
        </>
      )
    }
  }
  let __indexComponent = connect((state) => state)(indexComponent)
  ReactDOM.render(
    <Provider store={sdkStore}>
      <__indexComponent />
    </Provider>,
    document.createElement('div')
    // document.querySelector('#component')
  )
}
