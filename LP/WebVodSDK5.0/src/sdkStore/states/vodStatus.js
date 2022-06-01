import { createSelector } from 'reselect'
import {media as mediaState} from './media'
export default {
  playType: 'live',
  vodPlayer: null, //存储 `vodPlayer.js` 对象方法
  currentMediaSourceIndex: 0, //当前播放媒体资源
  mainContainerId: null,
  curMeidaData: null, //当前媒体详细信息
  mode: 0,
  containers: {},
  playStatus: 'wait',
  currentMode: '0', //默认模式
  currentTime: 0,
  totalTime: 0,
  seekStatus: 'done', // wait|done
  cameraShouldDo: 'wait',
  // vodDuration: createSelector(
  //   (state) => {
  //     return {
  //       mediaState
  //     }
  //   },
  //   (mediaCurrentDuration) => {
  //     return mediaCurrentDuration
  //   }
  // )
}
