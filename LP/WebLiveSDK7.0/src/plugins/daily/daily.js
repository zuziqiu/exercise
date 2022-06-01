import { sdkStore } from '../../states'
import tools from '../../utils/tools'
export const daily = {
  // 转出年月日时分秒格式
  formatDateTime(date) {
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    m = m < 10 ? '0' + m : m
    var d = date.getDate()
    d = d < 10 ? '0' + d : d
    var h = date.getHours()
    h = h < 10 ? '0' + h : h
    var minute = date.getMinutes()
    minute = minute < 10 ? '0' + minute : minute
    var second = date.getSeconds()
    second = second < 10 ? '0' + second : second
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
  },
  write({ type, data }) {
    // 初始化数据未有时，liveId和courseI都是0，不允许写缓存
    if (!(sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId)) return
    // 获取id
    let dailyId = `daily_id_${sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId}`,
      newLocalstorage = [
        {
          time: this.formatDateTime(new Date()),
          type,
          data
        }
      ]
    if (localStorage[dailyId]) {
      newLocalstorage = JSON.parse(localStorage[dailyId]).concat(newLocalstorage)
      // 给日志分配localStorage 1M大小，避免其他应用无法使用的情况
      if (this.localStorageSize() > 1 * 1024) {
        newLocalstorage.splice(0, 20) // 删除10条最旧的数据
      }
    }
    localStorage[dailyId] = JSON.stringify(newLocalstorage)
  },
  fetchDaily() {
    if (localStorage[`daily_id_${sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId}`]) {
      // daily = dailyDebug 可以在url指定，方便开发人员调试
      if (sdkStore.room.extConfig?.config?.daily == 'dailyDebug') {
        // 直接在控制台打印全部daily
        tools.log(localStorage[`daily_id_${sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId}`])
      } else {
        if (tools.isWechat()) {
          this.print()
        } else {
          this.downloadFile()
        }
      }
    } else {
      tools.debug('暂无日志记录')
    }
  },
  print() {
    require(['html2canvas'], (html2canvas) => {
      let temporaryContainer = document.createElement('div')
      temporaryContainer.style.width = '100%'
      temporaryContainer.style.position = 'fixed'
      temporaryContainer.style.left = '-10000px'
      temporaryContainer.style.top = '-10000px'
      temporaryContainer.style.letterSpacing = '1px'
      temporaryContainer.id = 'fetch_id'
      temporaryContainer.innerHTML = `<p style="text-align:center; font-size: 24px">长按图片保存日志</p> 
      ${JSON.parse(localStorage[`daily_id_${sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId}`]).map((item) => '<br/>NEXT: ' + JSON.stringify(item))}`
      document.body.append(temporaryContainer)
      html2canvas(document.querySelector('#fetch_id'), {
        scale: 2
      }).then(function (canvas) {
        document.body.removeChild(temporaryContainer)
        var img = new Image()
        img.src = canvas.toDataURL('image/png')
        img.style.position = 'fixed'
        img.style.width = '100%'
        img.style.top = '10%'
        img.style.left = '0'
        img.style.zIndex = 10000
        img.id = 'dailyImgId'
        document.body.append(img)
        setTimeout(() => {
          document.querySelector('#dailyImgId').onclick = function (e) {
            document.body.removeChild(document.querySelector('#dailyImgId'))
          }
        }, 1000)
      })
    })
  },
  downloadFile() {
    const a = document.createElement('a')
    // 1. 转 blob
    a.href = this.createBase64(localStorage[`daily_id_${sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId}`])
    a.style.display = 'none'
    // 3. a 标签 下载
    a.download = `daily_id_${sdkStore.room.liveData.liveId || sdkStore.room.liveData.courseId}`
    document.body.append(a)
    a.click()

    // 该代码为兼容 safari ，否则会报 webkitblobresource 错误1
    setTimeout(() => {
      // 4. revokeObjectURL() 释放 内存中的 url
      window.URL.revokeObjectURL(a.href)
      document.body.removeChild(a)
    }, 1000)
  },
  createBase64(str, mineType) {
    const blob = new Blob([str], {
      type: mineType || 'text/plain'
    })

    return window.URL.createObjectURL(blob)
  },
  upload() {},
  localStorageSize(type = 'l') {
    var obj = ''
    var size = 0
    if (type === 'l') {
      if (!window.localStorage) {
        tools.debug('浏览器不支持localStorage')
      } else {
        obj = window.localStorage
      }
    } else {
      if (!window.sessionStorage) {
        tools.debug('浏览器不支持sessionStorage')
      } else {
        obj = window.sessionStorage
      }
    }
    if (obj !== '') {
      for (var item in obj) {
        if (obj.hasOwnProperty(item)) {
          size += obj.getItem(item).length
        }
      }
      tools.debug('当前已用localStorage：' + (size / 1024).toFixed(2) + 'KB')
    }
    return size / 1024
  }
}
