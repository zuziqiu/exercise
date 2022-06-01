var loader = {
  load(callback) {
    let link = document.createElement('link')
    link.href = '//open.talk-fun.com/open/maituo_v2/dist/debug/whiteboard-main.css'
    let script = document.createElement('script')
    script.src = '//open.talk-fun.com/open/maituo_v2/dist/debug/whiteboard.pack.js'
    script.addEventListener('load', function() {
      callback()
    })
    document.head.appendChild(link)
    document.body.appendChild(script)
  }
}
export default loader
