/**
 * 大班低延迟摄像头木块
 */
import {agoraSdk} from '../vendor/agora/agora-sdk.js'
import tools from "../utils/tools"
import STATIC from "./mt.static"
var rtsPlayer = {
  sdk: new agoraSdk(),
  client: null,
  containerId: '',
  info: {

  },
  camera () {
    // 播放视频容器保存当前上下文
    this.containerId = arguments[0] || arguments[1]
  },
  getInfo (access_token) {
    let that = this
    tools.ajax({
      type: 'GET',
      url: STATIC.APP_HOST + '/live/webrtc.php',
      dataType: "jsonp",
      data: {
        act: 'mediaChannelKey',
        access_token
      },
      // jsonpCallback: "liveCameraCallback",
      success: function (retval) {
        that.info = retval.data
        console.error(retval.data)
      },
      error: function () {
        callback("error")
      }
    });
  },
  // 上课后执行init方法
  init () {
    let that = this
    if (that.sdk.checkCompatibilityRts()) {
      // 支持rts，1、创建client和rts组件
      that.client = that.sdk.createClient()
      console.error(that.info)
      that.sdk.initRts(that.client).then(() => {
        // 2、初始化client
        that.client.init(that.info.appID, () => {
          // 2.1 join
          that.client.join(that.info.channelKey, that.info.channel, parseInt(that.info.xid), (uid) => {
            console.error(uid + 'join success')
            // 2.2 监听事件
            that.client.on("stream-added", function(e) {
              // 有新流add
              var stream = e.stream
              that.client.subscribe(stream, { video: true, audio: true })
            })
            that.client.on("stream-subscribed", function(e) {
              // 订阅成功
              var stream = e.stream
              console.error(that.containerId)
              if (that.containerId) {
                // 播放
                stream.play(that.containerId)
              }
            })
          })
        })
      }, (err) => {
        console.error(err, 'client初始化失败')
      })
    } else {
      // 不支持rts
    }
  }
}
// window.__rtsPlayer = rtsPlayer
export default rtsPlayer