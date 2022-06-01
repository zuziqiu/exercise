import { STATIC } from "../states/staticState";
import { eventStore } from "../eventStore";
import liveControler from '../core/liveControler'
import mediaControler from '../core/mediaControler'
import cmdSchedule from '../core/cmdSchedule'
import tools from "../utils/tools"
import {lifeCycle} from '../core/lifeCycle'

const cameraPlayer = {
  // 执行camera方法[step]
  cameraRun: function () {
    this.doCameraStep()
    mediaControler.emit('camera:player')
    // 触发摄像头播放器生命周期函数
    lifeCycle.lifeControler['createdCameraPlayer']?.next()
  },
  // 执行step
  doCameraStep: function () {
    // 跑 => step 1,3,4,6
    var exeAry = [
      mediaControler.getStep(1),
      mediaControler.getStep(3),
      mediaControler.getStep(4),
      mediaControler.getStep(6)
    ]
    exeAry.forEach(item => {
      if (item) {
        liveControler.execute(item);
      }
    })
  },
  // 直行cmd指令
  cameraExecute: function (command) {
    // 摄像头开关
    if (command.t == STATIC.CMD.OPEN_CAMERA) {
      // 打开摄像头
      eventStore.emit('camera:start')
    } else if (command.t == STATIC.CMD.CLOSE_CAMERA) {
      // 隐藏摄像头
      eventStore.emit('camera:stop')
      tools.debug('camera stop ...')
    } else if (command.t == STATIC.CMD.VIDEO_START || command.t == STATIC.CMD.VIDEO_STOP) {
      tools.debug('Live Video Start ==> ' + command.t)
      tools.debug("Video Source:", command)
      // save stream.
      this.videoStreamPath = command.stream;
      // 设置开始推流时间(摄像头)
      // cmdSchedule.LAST_LIVE_TIME = command.st
      cmdSchedule.set('LAST_LIVE_TIME', command.st)
      // 开始推流
      if (command.t == STATIC.CMD.VIDEO_START) {
        // 设置媒体数据
        if (command.streams) {
          mediaControler.setStreams(command.streams)
        }
        // 播放
        mediaControler.emit('camera:player')
        // 设置比例
        if (command.c) {
          mediaControler.setRatio(command.c, 'camera')
        }
      }
      // 停止推流
      else if (command.t == STATIC.CMD.VIDEO_STOP) {
        tools.debug('Live Video Stop...', liveControler.action)
        if (command.lp == 0) {
          mediaControler.emit('media:destroy', 'camera')
        }
      }
    }
  }
}

export default cameraPlayer