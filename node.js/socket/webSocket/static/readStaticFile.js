const fs = require('fs')
const path = require('path')
const mime = require('mime')

async function fetchFile(file) {
  let _data = await new Promise((resolve) => {
    fs.readFile(file, (err, data) => {
      resolve(err ? '拿不到文件' : data)
    })
  })
  return _data
}
async function readStaticFile(filePathName) {
  let ext = path.parse(filePathName).ext // 获取扩展名
  let data = null
  let mimeType = mime.getType(ext) || 'text/html'
  // 判断文件夹或者文件是否存在
  if (fs.existsSync(filePathName)) {
    if (fs.statSync(filePathName).isFile()) {
      data = await fetchFile(filePathName)
    } else {
      data = await fetchFile(path.join(filePathName, '/index.html'))
    }
  } else {
    data = 'not found'
  }
  return {
    mimeType,
    data
  }
}

module.exports = readStaticFile