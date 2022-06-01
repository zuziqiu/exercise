import React, { PureComponent } from 'react'
import { createPortal } from 'react-dom'
// import { Provider, connect } from 'react-redux'
import sdkStore from '../sdkStore'
import * as actionTypes from '@/sdkStore/constants/actionTypes'
require('../assets/style/rate.less')
// export const InitPlayRate = () => {
export class PlayRate extends PureComponent {
  constructor(props) {
    super()
    this.state = {
      showRangeBox: false
    }
  }
  showRangeBoxFun(event) {
    this.setState({
      showRangeBox: !this.state.showRangeBox
    })
  }
  selectSpeed({ event, speed }) {
    sdkStore.dispatch({
      type: actionTypes.UPDATE_RATE_VALUE,
      payload: {
        rateValue: speed
      }
    })
    // event.stopPropagation()
    // event.preventDefault()
  }
  render() {
    let { rateStyle, rateRange } = this.props.data
    return createPortal(
      <>
        <div id="rateBox" className="rateBox" style={rateStyle.entryButton} title="倍速播放" onClick={this.showRangeBoxFun.bind(this)}>
          {this.state.showRangeBox ? (
            <ul id="rangeBox" className="rangeBox">
              {rateRange.map((speed, index) => {
                return (
                  <li key={index} onClick={(event) => this.selectSpeed.bind(this)({ event, speed })}>
                    {speed}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      </>,
      document.querySelector('#rate')
    )
  }
}
//   let __PlayRate = connect((state) => state.vodControls.playRate)(PlayRate)

//   ReactDOM.render(
//     <Provider store={sdkStore}>
//       <__PlayRate />
//     </Provider>,
//     document.querySelector('#rate')
//   )
// }
