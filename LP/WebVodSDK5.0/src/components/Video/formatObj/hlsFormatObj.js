export default async () => {
  // let hlsJs = null
  // await import('hls.js').then((res) => (hlsJs = res.default))
  let hlsJs = await import('hls.js').default
  if (hlsJs?.isSupported()) {
    let __hls = new hlsJs()
    __hls = new hlsJs()
    __hls.on(hlsJs.Events.ERROR, (e, data) => {
      if (data.fatal) {
        switch (data.type) {
          case hlsJs.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.error('fatal network error encountered, try to recover')
            // that.setMeidaPlayStatus('error')
            // that.bn += 1
            // that.ba += 1
            // if (that.changeSource == 0) {
            //   that.changeSource = 1
            // }
            // 切换线路
            // mediaCore.emit('live:video:error', that.changeSource)
            // map.get('live:video:error')(data)

            break
          case hlsJs.ErrorTypes.MEDIA_ERROR:
            console.error('fatal media error encountered, try to recover')
            __hls.recoverMediaError()
            break
          default:
            // cannot recover
            __hls.destroy()
            break
        }
      }
    })
    return __hls
  } else {
    return null
  }
}
