/**
 * ## 工具类 ##
 */
import { transaction } from 'mobx'
import { globalStore } from '../states/globalStore'
import { STATIC } from '../states/staticState'
import { cursor } from './cursor'
import wbEmitter from './wbEmitter'
import * as TYPES from '../Action/action-types'
export const getQueryStr = (name) => {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|#|$)', 'i')
  var r = window.location.search.substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}
const envFlag = getQueryStr('debug')
if (envFlag === 'list') {
  log('debug mode')
} else {
  // console.clear()
  // console.log = function () {
  //   return false
  // }
  // console.error = function () {
  //   return false
  // }
  // console.info = function () {
  //   return false
  // }
  // console.warn = function () {
  //   return false
  // }
  // console.debug = function () {
  //   return false
  // }
  // console.dir = function () {
  //   return false
  // }
}
export const log = function () {
  if (globalStore.store) {
    var state = globalStore.store
    if (state.room.debugMode === 'false') {
      return false
    }
  }
  let _args = Array.prototype.slice.call(arguments)
  _args.unshift('[WB]message ==>')
  console.log.apply(window.console, _args)
}
export const warn = function () {
  if (globalStore.store) {
    var state = globalStore.store
    if (state.room.debugMode === 'false') {
      return false
    }
  }
  let _args = Array.prototype.slice.call(arguments)
  _args.unshift('[WB]message ==>')
  console.warn.apply(window.console, _args)
}
export const error = function () {
  if (globalStore.store) {
    var state = globalStore.store
    if (state.room.debugMode === 'false') {
      return false
    }
  }
  let _args = Array.prototype.slice.call(arguments)
  _args.unshift('[WB]message ==>')
  console.error.apply(window.console, _args)
}
// to color
export const color = (color, forceType) => {
  let _color = color.toString()
  // 转换至forceType类型
  if (forceType === 'rgb') {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    var sColor = _color.toLowerCase()
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = '#'
        for (var i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        }
        sColor = sColorNew
      }
      //处理六位的颜色值
      var sColorChange = []
      for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
      }
      _color = sColorChange.join(',')
    } else {
      _color = sColor
    }
  } else if (forceType === 'rgb') {
  }
  // 转换为十六进制
  else {
    if (_color && _color.indexOf('#') > -1) {
      _color = _color.replace('#', '')
      var dec = parseInt(_color, 16)
      if (isNaN(dec)) {
        dec = 0
      }
      _color = dec //parseInt(_color, 16).toString();
    } else if (_color.indexOf('rgba') > -1) {
      // var values = color
      //   .replace(/rgba?\(/, '')
      //   .replace(/\)/, '')
      //   .replace(/[\s+]/g, '')
      //   .split(',');
      // var a = parseFloat(values[3] || 1),
      //   r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
      //   g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
      //   b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
      // _color = "#" +
      //   ("0" + r.toString(16)).slice(-2) +
      //   ("0" + g.toString(16)).slice(-2) +
      //   ("0" + b.toString(16)).slice(-2);
      _color = 'ffffff'
      var dec = parseInt(_color, 16)
      if (isNaN(dec)) {
        dec = 0
      }
      _color = dec //parseInt(_color, 16).toString();
    }
    // 000000 ==>  #000000
    else {
      _color = parseInt(color)
      var hex = Number(_color).toString(16)
      let _corLen = '0'.repeat(6 - hex.length)
      _color = '#' + _corLen + hex
    }
    log('color cover ==>', color, '==>', _color)
  }
  return _color
}
// object 转化为 c => `|` 数据结构
export const objectToCdata = (obj) => {
  if (obj) {
    let _okeys = Object.keys(obj)
    let c = []
    if (_okeys.length > 0) {
      _okeys.map((key) => {
        c.push(obj[key])
      })
    }
    return c.join('|')
  }
}
// `|` to json => {xx: xx}
export const CdataToObject = (cdata, t) => {
  if (cdata) {
    let cArray = cdata.split('|')
    // 翻页
    if (t == STATIC.PAGE) {
      return {
        path: cArray[0],
        page: cArray[1],
        code: cArray[2],
        martrc: cArray[3],
        color: cArray[4],
        subIndex: cArray[5]
      }
    }
    // 曲线
    else if (t == STATIC.CURVE) {
      return {
        id: cArray[0],
        color: cArray[1],
        strokeWidth: cArray[2],
        visible: cArray[3],
        pathData: cArray[4],
        opacity: cArray[5]
      }
    }
    // 图片
    else if (t == STATIC.IMAGE) {
      return {
        id: cArray[0],
        src: cArray[1],
        visible: cArray[2],
        optType: cArray[3],
        matrix: cArray[4]
      }
    }
    // 文字
    else if (t == STATIC.TEXT) {
      return {
        id: cArray[0],
        text: cArray[1],
        color: cArray[2],
        fontSize: cArray[3],
        visible: cArray[4],
        optType: cArray[5],
        matrix: cArray[6],
        isEncode: cArray[7]
      }
    }
    // 其他
    else if (t == STATIC.POINTER) {
      return {
        id: cArray[0],
        pointArr: cArray[1]
      }
    } else {
      return {
        id: cArray[0],
        visible: cArray[1],
        x1: cArray[2],
        y1: cArray[3],
        x2: cArray[4],
        y2: cArray[5],
        strokeWidth: cArray[6],
        color: cArray[7],
        opacity: cArray[8]
      }
    }
  }
}
// 设置PPT
export const renderPPT = ({ PAGE, SUB_PAGE, isSend }) => {
  log('Set PPT ==>', PAGE, SUB_PAGE)
  // 一旦更新页码, 查找PPT对应页码数据
  if (getMode(PAGE) === STATIC.PPT) {
    let getImg = function () {
      let IMG_URL = getPPTImg(PAGE, SUB_PAGE, isSend)
      // 切换到当前课件图片
      if (IMG_URL) {
        // 图片地址数据已经更新了
        if (IMG_URL == globalStore.store.cousewareResource.img) {
          wbEmitter.emit('wb:usePPT:status', { status: true })
        } else {
          transaction(() => {
            // 每次渲染新的PPT时都要重置加载的状态
            globalStore.actions.dispatch('pptInfoResource', {
              type: TYPES.PPT_INFO_SOURCE,
              payload: {
                pptInfoResource: {
                  loaded: 'false'
                }
              }
            })
            transaction(() => {
              globalStore.actions.dispatch('cousewareResource', {
                type: TYPES.UPDATE_DOC_IMG,
                payload: IMG_URL
              })
            })
          })
        }
      } else {
        // IMG_URL不存在的时候没有PPT加载情况，暂时假借成功的状态重置useSchedule的running状态为false,
        wbEmitter.emit('wb:usePPT:status', { status: true })
      }
    }
    if (window.qt) {
      getImg()
    } else {
      // 非客户端的画板都需要进行jpeg的支持检测
      webpSupport(function () {
        getImg()
      })
    }
  }
}
// 获取当前页图片
export const getPPTImg = (PAGE, SUB_PAGE, isSend) => {
  let Store = globalStore.store
  let ppt = Store['ppt']
  let img = ''
  if (ppt && ppt['pages'] && ppt['pages'][PAGE]) {
    if (window.qt) {
      // 客户端用本地路径
      img = ppt.path + '\\' + (PAGE + '_' + SUB_PAGE) + ppt.suffix
    }
    // server path
    else {
      if (ppt.serverPath && ppt.serverPath.match(/\/$/)) {
        img = ppt.serverPath + PAGE + '_' + SUB_PAGE + ppt.suffix
      } else {
        img = ppt.serverPath + '/' + PAGE + '_' + SUB_PAGE + ppt.suffix
      }
      img = detectProtocol(img)
      // 如果支持jpeg的话，就把jpg转化为jpeg
      if (Store.page.isWebpSupport) {
        img = img.replace('.jpg', '.jpeg')
      }
    }
    if (typeof isSend != 'undefined') {
      img += `#isSend=${isSend}`
      // let flag = img.indexOf('?') > -1
      // if (flag) {
      //   img += '&isSend=' + isSend
      // } else {
      //   img += '?isSend=' + isSend
      // }
    }
    // if (typeof ap != 'undefined') {
    //   let flag = img.indexOf('?') > -1
    //   if (flag) {
    //     img += '&ap=' + ap
    //   } else {
    //     img += '?ap=' + ap
    //   }
    // }
    log('ppt Get Img ==>\n', img)
    return img
  }
}
// 是否支持jpeg
export const webpSupport = (callback) => {
  let Store = globalStore.store
  if (window.qt) {
    // qt表示直播器，直播器读本地图片不用转换jpeg
    globalStore.actions.dispatch('page', {
      type: TYPES.WEBP_SUPPORT,
      payload: {
        isWebpSupport: 0
      }
    })
    callback && callback()
  } else {
    // 网页端判断是否支持jpeg
    if (Store.page.isWebpSupport == null) {
      let image = new Image()
      image.onerror = function () {
        globalStore.actions.dispatch('page', {
          type: TYPES.WEBP_SUPPORT,
          payload: {
            isWebpSupport: 0
          }
        })
        callback && callback()
      }
      image.onload = function () {
        if (image.width == 1) {
          globalStore.actions.dispatch('page', {
            type: TYPES.WEBP_SUPPORT,
            payload: {
              isWebpSupport: 1
            }
          })
        } else {
          globalStore.actions.dispatch('page', {
            type: TYPES.WEBP_SUPPORT,
            payload: {
              isWebpSupport: 0
            }
          })
        }
        callback && callback()
      }
      image.src = 'data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAUAgCdASoBAAEAL/3+/3+CAB/AAAFzrNsAAP5QAAAAAA=='
    } else {
      callback && callback()
    }
  }
}
// 是否画板类型
export const isWhiteboard = (page) => {
  let pageNum = parseInt(page)
  return pageNum > 10000 ? true : false
}
export const isAdmin = () => {
  let Store = globalStore.store
  return Store.room.curUser && (Store.room.curUser.role === 'admin' || Store.room.curUser.role === 'spadmin' || Store.room.curUser.role === 'jiabin')
}
export const isUser = () => {
  let Store = globalStore.store
  if (Store.room.curUser && Store.room.curUser.role === 'user') {
    return true
  } else {
    return false
  }
}
// 获取模式
export const getMode = (page) => {
  return isWhiteboard(page) ? STATIC.WHITEBOARD : STATIC.PPT
}
/* 
  整合要发送的数据
  type => 白板、海报、ppt
  operationCode => 操作码
  操作码说明：
  0: 翻页
  5: 向下滚动
  6: 向上滚动
  10: 海报
*/
export const getFlushData = ({ operationCode = 0 }) => {
  let state = globalStore.getState(),
    tpl = getCmdTpl(),
    // 动/静态PPT
    isTypeOfAnimatePPT = state.room.pptType,
    // 当前子页
    currentPage = state.page.currentPage,
    // 当前分页
    currentSubPage = state.page.currentSubPage,
    // 获取当前的模式（白板 / ppt）
    currentMode = getMode(currentPage),
    // 涂鸦数据
    pageDrawData = state.pageDrawData[currentMode][currentPage],
    // 涂鸦数据长度
    pageDataLen = Object.keys(pageDrawData || {}),
    // c数据中的path
    _path = null,
    // c数据中的矩阵的缩放值
    _scale = null,
    // c数据中的矩阵的滚动值
    _postTop = null,
    // c数据中的矩阵
    matrix = null,
    // c数据中的颜色
    bgColor = null
  // currentPage初始化是0，表示未应用任何白板或课件
  if (currentPage > 0) {
    // 获取ppt的flushData
    if (currentMode == STATIC.PPT) {
      // 有可能继承缓存，非法的img onload的时候触发
      if (!state.ppt.serverPath) {
        // currentPage是0
        return {
          p: 0
        }
      }
      // operationCode == 0是翻页，要自增id
      if (operationCode == 0) {
        tpl.n = globalStore.getId()
      } else {
        tpl.n = state.room.setPageData.id
      }
      // charAt() 方法可返回指定位置的字符。
      _path = state.ppt.serverPath.charAt(state.ppt.serverPath.length - 1) === '/' ? state.ppt.serverPath : state.ppt.serverPath + '/'
      // scale、postTop是组合成发送的矩阵，ppt的 postScale = STATIC.WHITEBOARD_BASE_WIDTH / IMG_DOM.width
      _scale = state.pptInfoResource.postScale.toFixed(3)
      _postTop = state.ppt.pages[currentPage] && state.ppt.pages[currentPage].postTop ? state.ppt.pages[currentPage].postTop : '0'
      // 组装矩阵
      matrix = `${_scale},0,0,${_scale},0,${_postTop}`
      bgColor = '16777215'
    }
    if (currentMode == STATIC.WHITEBOARD) {
      if (state.whiteboard[currentPage].effect == 1) {
        // 获取海报的flushData
        tpl.n = globalStore.getId()
        _path = state.whiteboard[currentPage].server_path
        matrix = '1,0,0,1,0,0'
        bgColor = color(state.whiteboard[currentPage].backgroundColor, 'rgba')
      } else {
        // 获取白板的flushData
        tpl.n = globalStore.getId()
        _path = ''
        matrix = '1,0,0,1,0,0'
        bgColor = color(state.whiteboard[currentPage].backgroundColor || state.wbProperty.backgroundColor) // 优先取当前画板页的颜色值来发送
      }
    }
    let cdata = {
      url: detectProtocol(_path),
      page: currentPage,
      operationCode: operationCode ? operationCode : 0,
      matrix: matrix,
      color: bgColor,
      subPage: currentSubPage
    }
    let cmdTpl = {
      st: tpl.st,
      x: tpl.x,
      p: currentPage,
      c: objectToCdata(cdata),
      t: STATIC.PAGE,
      n: tpl.n,
      ap: isTypeOfAnimatePPT,
      hd: pageDataLen.length > 0 ? 't' : 'f'
    }
    return cmdTpl
  } else {
    // currentPage是0，是初始化，表示未应用任何白板或课件，直接返回p = 0
    return {
      p: 0
    }
  }
}
// find key from array
export const findKlssById = (drawId) => {
  let canvas = globalStore.getFabric()
  let klssObj = canvas.getObjects()
  let _item = ''
  klssObj.forEach(function (item, index) {
    if (item.id === drawId) {
      _item = item
    }
  })
  return _item
}
// 获取c-id规则
export const setKlssVisiable = (drawId, visible) => {
  // let canvas = globalStore.getFabric()
  let klss = findKlssById(drawId)
  if (klss) {
    if (Object.prototype.toString.call(visible) === '[object Boolean]') {
      klss.visible = visible
      // if (visible) {
      //   klss.visible = true
      // } else {
      //   klss.visible = false
      // }
    }
  }
}
// 切开当前分页
export const pageSplit = (_pageSplit) => {
  if (_pageSplit) {
    _pageSplit = _pageSplit.toString()
    let _spliter = _pageSplit.split('_')
    if (_spliter.length === 1) {
      return {
        currentPage: _spliter[0],
        currentSubPage: '1'
      }
    } else if (_spliter.length === 2) {
      return {
        currentPage: _spliter[0],
        currentSubPage: _spliter[1]
      }
    }
  }
}
// 获取Tpl
export const getCmdTpl = () => {
  let _x = globalStore.getState().room.curUser ? globalStore.getState().room.curUser.xid : ''
  let tpl = {
    x: _x, //xid
    c: '', //c数据
    st: parseInt(new Date().getTime()), //发起时间
    n: '', //draw-id计数
    p: '', //页码
    hd: '', //是否存在涂鸦数据
    t: '' //类型
  }
  return tpl
}
// Remove object from key
export const removeKlss = (id, type) => {
  let fabric = globalStore.fabric
  // 非常有必要判断，因为异步加载vconsole的时候，外部可能调用emit传递数据更新page。就会触发remoKlss，此时fabric还没有实例化会报错
  if (fabric) {
    let klss = fabric.getObjects()
    let klssCounter = klss.length
    log('klss count ==>', klss.length)
    log('id => ' + id, 'type => ' + type)
    if (id) {
      // remove from type & id
      if (klss.length > 0) {
        klss.map((item) => {
          if (item.id === id) {
            fabric.remove(item)
          }
        })
      }
    }
    // remove all item
    else {
      for (let k = 0; k < klssCounter; k++) {
        log('remove item =>', klss[k].id)
        fabric.remove(klss[k])
      }
      // fabric.clear()
    }
    fabric.renderAll()
  }
}

// Disable select
export const disableKlssSelectable = (klss, enable) => {
  if (!klss) {
    log('klss is not define!')
    return
  }
  let locker = {
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingFlip: true,
    lockScalingX: true,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: true,
    hasRotatingPoint: false,
    hasControls: false
  }
  let lockType = {}
  if (!enable) {
    let enableSelect = {
      selectable: true,
      selection: true,
      selectionBackgroundColor: 'rgba(0, 0, 0, 0)',
      hasBorders: false
    }
    Object.assign(lockType, enableSelect)
  } else {
    let disableSelectAll = {
      selectable: false,
      selection: false,
      selectionBackgroundColor: 'rgba(0, 0, 0, 0.6)'
    }
    Object.assign(lockType, disableSelectAll)
  }
  klss.set(Object.assign(locker, lockType))
  return klss
}
// 更改协议类型
export const detectProtocol = (content) => {
  return content.replace(/http:\/\//gi, 'https://')
}
// 删除协议和域名
export const deleteProtocol = (content) => {
  return content.replace(/^.*?\:\/\/[^\/]+/, '')
}

// 获取文字聚焦的数组
export const textFocusArray = () => {
  let klssAllObject = globalStore.getFabric()._objects
  // 获取所有文字klss对象
  let textEditingArray = klssAllObject.filter((item) => item.isText && item.isEditing)
  return textEditingArray
}

export const setCursor = ({ brushType, target, _cursor }) => {
  // 使用异步才使fabric更新cursor成功
  setTimeout(() => {
    let canvas = globalStore.getFabric()
    // 获取所有klss对象
    let klssAllObject = canvas.getObjects()
    // 没有涂鸦权限的时候默认鼠标是箭头
    if (!globalStore.store.room.powerEnable) {
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    } else if (target) {
      // 有传入设置目标的时候就设置传入目标
      target.defaultCursor = _cursor
      target.hoverCursor = _cursor
    }
    // 如果画板事件被解绑
    else if (brushType === 'eventOff') {
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    }
    // 如果是图片笔画类型的额外处理逻辑
    else if (brushType === STATIC.IMAGE) {
      let klssAllImage = klssAllObject.filter((item) => item.isPicture)
      klssAllImage.map((item) => (item.hoverCursor = cursor.move))
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    }
    // erase 图片hoverCursor显示橡皮檫
    else if (brushType == STATIC.ERASE) {
      klssAllObject.map((item) => (item.hoverCursor = cursor.erase))
      canvas.defaultCursor = cursor.erase
      canvas.hoverCursor = cursor.erase
    } else if (brushType == '') {
      // 这里要判断空是因为图片应用后会默认把画笔类型重置
      // 图片默认
      let klssAllImage = klssAllObject.filter((item) => item.isPicture)
      klssAllImage.map((item) => (item.hoverCursor = cursor.initial))
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    } else if (brushType === STATIC.POINTER) {
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    } else {
      // 涂鸦工具等画笔类型
      klssAllObject.map((item) => (item.hoverCursor = cursor.draw))
      canvas.defaultCursor = cursor.draw
      canvas.hoverCursor = cursor.draw
    }
    canvas.renderAll()
  }, 0)
}
