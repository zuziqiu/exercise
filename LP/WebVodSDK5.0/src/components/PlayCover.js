import React, { memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import sdkStore from '../sdkStore'
import STATIC from '@/sdkStore/states/staticState'
import * as actionTypes from '@/sdkStore/constants/actionTypes'
const iconStyle = {
  width: '100%',
  height: '100%',
  zIndex: 100,
  top: 0,
  left: 0,
  cursor: 'pointer',
  backgroundImage: `url(${STATIC.PLAYER.PLAY_ICON})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '50% 50%',
  position: 'absolute'
}
const PlayCover = (props) => {
  let videoEvent = props.videoEvent
  const event = (type) => {
    videoEvent(type)
  }
  return (
    <div onClick={() => event('play')} style={iconStyle}>
      播放/暂停
    </div>
  )
}
export default memo(PlayCover)
