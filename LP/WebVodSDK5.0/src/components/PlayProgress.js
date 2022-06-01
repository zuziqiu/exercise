import React, { memo, PureComponent, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from 'react-redux'
// import { Provider, connect } from 'react-redux'
import sdkStore from '@/sdkStore'
import * as actionTypes from '@/sdkStore/constants/actionTypes'
import player from '../core/vod.player'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
const __Slider = Slider.createSliderWithTooltip(Slider)


// export class PlayProgress extends PureComponent {
//   constructor(props) {
//     super()
//   }
//   onChange(e) {
//     sdkStore.dispatch({
//       type: actionTypes.UPDATE_SEEK_STATUS,
//       payload: {
//         seekStatus: 'wait'
//       }
//     })
//     sdkStore.dispatch({
//       type: actionTypes.UPDATE_CURRENT_TIME,
//       payload: {
//         currentTime: e
//       }
//     })
//   }
//   onAfterChange(e) {
//     sdkStore.dispatch({
//       type: actionTypes.UPDATE_SEEK_STATUS,
//       payload: {
//         seekStatus: 'done'
//       }
//     })
//     player.seek(e) // mark 应该更新数据库，然后监听数据库seek done更新，调用player.seek
//   }
//   formatSeconds(value) {
//     let result = parseInt(value)
//     let h = Math.floor(result / 3600).toString()
//     let m = (Math.floor(result / 60) % 60).toString()
//     let s = Math.floor(result % 60).toString()

//     return `${h.padStart(2, 0)}:${m.padStart(2, 0)}:${s.padStart(2, 0)}`
//   }
//   render() {
//     let { totalTime, currentTime, trackStyle, railStyle, handleStyle } = this.props.data
//     return createPortal(
//       <__Slider
//         className="playProgress"
//         defaultValue={0}
//         value={currentTime}
//         max={totalTime}
//         tipFormatter={this.formatSeconds}
//         onChange={this.onChange.bind(this)}
//         onAfterChange={this.onAfterChange.bind(this)}
//         // 未观看时长的背景色
//         railStyle={railStyle}
//         // 已观看时长的背景色
//         trackStyle={trackStyle}
//         handleStyle={handleStyle}
//       />,
//       document.querySelector('#slider')
//     )
//   }
// }
const PlayProgress = () => {
  const dispatch = useDispatch()
  const vodStatus = useSelector((state) => state.vodStatus)
  const progressStyle = useSelector((state) => state.vodControls.progressStyle)
  //  data={{ ...state.vodStatus, ...state.vodControls.progressStyle }}
  //     let { totalTime, currentTime, trackStyle, railStyle, handleStyle } = this.props.data
  const onChange = useCallback((e) => {
    dispatch({
      type: actionTypes.UPDATE_SEEK_STATUS,
      payload: {
        seekStatus: 'wait'
      }
    })
    dispatch({
      type: actionTypes.UPDATE_CURRENT_TIME,
      payload: {
        currentTime: e
      }
    })
  }, [])
  const onAfterChange = useCallback((e) => {
    dispatch({
      type: actionTypes.UPDATE_SEEK_STATUS,
      payload: {
        seekStatus: 'done'
      }
    })
    player.seek(e) // mark 应该更新数据库，然后监听数据库seek done更新，调用player.seek
  }, [])
  const formatSeconds = useCallback((value) => {
    let result = parseInt(value)
    let h = Math.floor(result / 3600).toString()
    let m = (Math.floor(result / 60) % 60).toString()
    let s = Math.floor(result % 60).toString()
    return `${h.padStart(2, 0)}:${m.padStart(2, 0)}:${s.padStart(2, 0)}`
  }, [])
  return createPortal(
    <__Slider
      className="playProgress"
      defaultValue={0}
      value={vodStatus.currentTime}
      max={vodStatus.totalTime}
      tipFormatter={formatSeconds}
      onChange={onChange.bind(this)}
      onAfterChange={onAfterChange.bind(this)}
      // 未观看时长的背景色
      railStyle={progressStyle.railStyle}
      // 已观看时长的背景色
      trackStyle={progressStyle.trackStyle}
      handleStyle={progressStyle.handleStyle}
    />,
    document.querySelector('#slider')
  )
}

export default memo(PlayProgress)
