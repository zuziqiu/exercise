import * as AgoraRTC from './AgoraRTC.js'
import * as AgoraRTS from './AgoraRTS.js'
export class agoraSdk{
  constructor () {
      this.AgoraRTC = AgoraRTC
  }
  // 检查浏览器对webrtc的兼容性
  checkCompatibility () {
    return this.AgoraRTC.checkSystemRequirements()
  }
  // 创建音视频对象
  createClient () {
    return this.AgoraRTC.createClient({
        'mode': 'live',
        'codec': "h264"
    })
  }
  createStream (spec) {
    return this.AgoraRTC.createStream(spec)
  }
  createDesktopStream (spec) {
    return this.AgoraRTC.createStream(spec)
  }
  enableLogUpload () {
    this.AgoraRTC.Logger.enableLogUpload()
  }
  disableLogUpload () {
    this.AgoraRTC.Logger.disableLogUpload()
  }
  initRts (client) {
    // 初始化h5播放器组件
    AgoraRTS.init(AgoraRTC, {
      wasmDecoderPath: "//static-1.talk-fun.com/open/maituo_v2/dist/rts-pack/agora/AgoraRTS.wasm",
      asmDecoderPath: "//static-1.talk-fun.com/open/maituo_v2/dist/rts-pack/agora/AgoraRTS.asm",
      /**
       * 直播模式下为了保证流畅度，拉大延迟到 5s
       */
      bufferDelay: 1000,
      maxBufferDelay: 10000
    }).catch(e => {
      if (e === "LOAD_DECODER_FAILED") {
        console.log("加载解码器失败！")
      }
      console.error(e)
    })
    AgoraRTS.proxy(client)
    return Promise.resolve()
  }
  checkCompatibilityRts () {
    return AgoraRTS.checkSystemRequirements()
  }
}