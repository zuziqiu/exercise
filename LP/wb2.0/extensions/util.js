/**
 * ## 工具类 ##
 */
import { globalStore } from '../states/globalStore'
import { STATIC } from '../states/staticState'
import { cursor } from './cursor'
import emitter from './emitter'
import * as TYPES from '../Action/action-types'
// import { Stroke } from './stroke'
// console// 添加调试模式
export const getQueryStr = (name) => {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  var r = window.location.search.substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}
const envFlag = getQueryStr('debug')
if (envFlag === 'list') {
  console.log('debug mode')
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
  // var state = globalStore.getState()
  if (globalStore.reducerStore.getState) {
    var state = globalStore.reducerStore.getState()
    if (state.debugMode === 'false') {
      return false
    }
  }
  let _args = Array.prototype.slice.call(arguments)
  _args.unshift('[WB]message ==>')
  window.console.log.apply(window.console, _args)
  // let logmode = true
  // // logtxt = ''
  // if (logmode) {
  //   logtxt += _args.toString()
  //   if (document.querySelector('#web-log')) {
  //     // console.error(logtxt)
  //     // document.querySelector('#web-log').innerHTML = logtxt
  //   }
  // }
}
// to color
export const color = (color, forceType) => {
  let _color = color
  // #000000 ==> 0
  if (forceType === 'rgb') {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = _color.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = "#";
        for (var i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      _color = sColorChange.join(",")
    } else {
      _color = sColor;
    }
  }
  // hex => dec
  else if (color && color.indexOf('#') > -1) {
    _color = _color.replace('#', '');
    var dec = parseInt(_color, 16);
    if (isNaN(dec)) {
      dec = 0;
    }
    _color = dec//parseInt(_color, 16).toString();
  }
  // 000000 ==>  #000000
  else {
    _color = parseInt(color);
    var hex = Number(_color).toString(16)
    let _corLen = '0'.repeat(6 - hex.length)
    _color = '#' + _corLen + hex
  }
  log('color cover ==>', color, '==>', _color)
  return _color;
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
        opacity: cArray[5],
      }
    }
    // 图片
    else if (t == STATIC.IMAGE) {
      return {
        id: cArray[0],
        src: cArray[1],
        visible: cArray[2],
        optType: cArray[3],
        matrix: cArray[4],
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
        isEncode: cArray[7],
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
        opacity: cArray[8],
      }
    }
    // 非曲线
    // else if(t !== STATIC.CURVE){
    //   return {
    //     id: cArray[0],
    //     visible: cArray[1],
    //     x1: cArray[2],
    //     y1: cArray[3],
    //     x2: cArray[4],
    //     y2: cArray[5],
    //     strokeWidth:cArray[6],
    //     color: cArray[7],
    //     opacity: cArray[8],
    //   }
    // }
    // // 其他
    // else {
    //   return {
    //     id: cArray[0],
    //     color: cArray[1],
    //     strokeWidth: cArray[2],
    //     visible: cArray[3],
    //     pathData: cArray[4],
    //     opacity: cArray[5],
    //   }
    // }
  }
}
// 设置PPT
export const renderPPT = ({ PAGE, SUB_PAGE, isSend, ap }) => {
  log('Set PPT ==>', PAGE, SUB_PAGE)
  // 一旦更新页码, 查找PPT对应页码数据
  if (getMode(PAGE) === STATIC.PPT) {
    if (window.qt) {
      let IMG_URL = getPPTImg(PAGE, SUB_PAGE, isSend, ap)
      // 切换到当前课件图片
      if (IMG_URL) {
        // 图片地址数据已经更新了
        if (IMG_URL == globalStore.reducerStore.getState().cousewareResource.img) {
          emitter.emit('load:whiteboard:status', { status: true })
        } else {
          globalStore.reducerStore.dispatch({
            type: TYPES.UPDATE_DOC_IMG,
            payload: IMG_URL
          })
        }
      } else {
        // IMG_URL不存在的时候没有PPT加载情况，暂时假借成功的状态重置useSchedule的running状态为false,
        emitter.emit('load:whiteboard:status', { status: true })
      }
    } else {
      webpSupport(function () {
        let IMG_URL = getPPTImg(PAGE, SUB_PAGE, isSend, ap)
        // 切换到当前课件图片
        if (IMG_URL) {
          // 图片地址数据已经更新了
          if (IMG_URL == globalStore.reducerStore.getState().cousewareResource.img) {
            emitter.emit('load:whiteboard:status', { status: true })
          } else {
            globalStore.reducerStore.dispatch({
              type: TYPES.UPDATE_DOC_IMG,
              payload: IMG_URL
            })
          }
        } else {
          // IMG_URL不存在的时候没有PPT加载情况，暂时假借成功的状态重置useSchedule的running状态为false,
          emitter.emit('load:whiteboard:status', { status: true })
        }
      })
    }
  }
}
// 获取当前页图片
export const getPPTImg = (PAGE, SUB_PAGE, isSend, ap) => {
  let Store = globalStore.reducerStore.getState()
  let PPT = Store['PPT']
  // console.error('pptdata', PPT)
  // let suffix = Store.room.setPageData.suffix
  // console.error(suffix, Store.room)
  let img = ''
  if (PPT && PPT['pages'] && PPT['pages'][PAGE]) {
    // let curPage = PPT['pages'][PAGE]
    // file:///xxxxx/xxxx/xx/1_1.jpg
    // 如果支持jpeg的话，就把jpg转化为jpeg
    // server path
    if (window.qt) {
      // 本地路径
      img = PPT.path + '\\' + (PAGE + '_' + SUB_PAGE) + PPT.suffix
    }
    // server
    else {
      if (PPT.serverPath && PPT.serverPath.match(/\/$/)) {
        img = PPT.serverPath + PAGE + '_' + SUB_PAGE + PPT.suffix
      } else {
        img = PPT.serverPath + '/' + PAGE + '_' + SUB_PAGE + PPT.suffix
      }
      img = detectProtocol(img)
    }
    if (typeof isSend != 'undefined') {
      let flag = img.indexOf('?') > -1
      if (flag) {
        img += '&isSend=' + isSend
      } else {
        img += '?isSend=' + isSend
      }
    }
    if (typeof ap != 'undefined') {
      let flag = img.indexOf('?') > -1
      if (flag) {
        img += '&ap=' + ap
      } else {
        img += '?ap=' + ap
      }
    }
    log('PPT Get Img ==>\n', img)
    //支持webp的，改为加载web
    if (Store.page.isWebpSupport) {
      img = img.replace('.jpg', '.jpeg');
    }
    return img
  }
}
// 是否支持jpeg
export const webpSupport = (callback) => {
  let Store = globalStore.reducerStore.getState()
  if (Store.page.isWebpSupport == null) {
    let image = new Image();
    image.onerror = function () {
      globalStore.reducerStore.dispatch({
        type: TYPES.WEBP_SUPPORT,
        payload: {
          isWebpSupport: 0
        }
      })
      callback && callback()
    };
    image.onload = function () {
      if (image.width == 1) {
        globalStore.reducerStore.dispatch({
          type: TYPES.WEBP_SUPPORT,
          payload: {
            isWebpSupport: 1
          }
        })
      } else {
        globalStore.reducerStore.dispatch({
          type: TYPES.WEBP_SUPPORT,
          payload: {
            isWebpSupport: 0
          }
        })
      }
      callback && callback()
    }
    image.src = 'data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAUAgCdASoBAAEAL/3+/3+CAB/AAAFzrNsAAP5QAAAAAA==';
  } else {
    callback && callback()
  }
}
// 是否画板类型
export const isWhiteboard = (page) => {
  let pageNum = parseInt(page)
  return (pageNum > 10000) ? true : false
}
export const isAdmin = () => {
  let Store = globalStore.reducerStore.getState()
  return Store.room.curUser && (Store.room.curUser.role === 'admin' || Store.room.curUser.role === 'spadmin' || Store.room.curUser.role === 'jiabin')
}
export const isUser = () => {
  let Store = globalStore.reducerStore.getState()
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
    if (Object.prototype.toString.call(visible) === "[object Boolean]") {
      if (visible) {
        klss.visible = true
      } else {
        klss.visible = false
      }
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
// 获取state
export const getState = () => {
  return globalStore.reducerStore.getState()
}
// 分页(abandom)
export const pageDo = {
  // 上一页
  prev(page) {
    // todo..
  },
  // 下一页
  next(page) {
    // todo...
  }
}
// 获取Tpl
export const getCmdTpl = () => {
  let _x = getState().room.curUser ? getState().room.curUser.xid : ''
  let tpl = {
    x: _x,  //xid
    c: '',  //c数据
    st: parseInt(new Date().getTime() / 1000), //发起时间
    n: '',  //draw-id计数
    p: '',  //页码
    hd: '', //是否存在涂鸦数据
    t: ''   //类型
  }
  return tpl
}
// Remove object from key
export const removeKlss = (id, type) => {
  let fabric = globalStore.fabric
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
    fabric.clear()
    // fabric.clear() 会清空canvas的颜色，下面进行重设
    var _store = globalStore.reducerStore.getState()
    if (_store.WHITEBOARD[_store.page.currentPage]) {
      fabric.backgroundColor = _store.WHITEBOARD[_store.page.currentPage].backgroundColor
    } else {
      if (_store.room.ret && _store.room.ret.backgroundColor) {
        fabric.backgroundColor = _store.room.ret.backgroundColor
      }
    }
  }
  fabric.renderAll()
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
  return content.replace(/http:\/\//ig, "https://");
}
// 删除协议和域名
export const deleteProtocol = (content) => {
  return content.replace(/^.*?\:\/\/[^\/]+/, "")
}
// //资源失败重载
// export const loadRetry = (errorUrl, updateErrorHostGroup, callback) => {
//   let state = globalStore.reducerStore.getState()
//   // 记录请求的原始地址
//   let oriUrl = errorUrl;
//   // 失败的域名
//   let errorHost = errorUrl.split('/')[2];
//   // hostGroup: [], //域名分组，重试域名只在包含本域名的组内重试
//   let hostGroup = state.sourceReLoad.hostGroup
//   for (let g in hostGroup) {
//     for (let h in hostGroup[g]) {
//       if (hostGroup[g][h] == errorHost) {
//         updateErrorHostGroup(g, errorHost).then(() => {
//           let arrs = hostGroup[g].concat(state.sourceReLoad.errorLoadGroup[g] || '')
//           let useful_group = arrs.filter((item) =>
//             arrs.indexOf(item) === arrs.lastIndexOf(item)
//           )
//           if (useful_group.length > 0) {
//             let new_url = oriUrl.replace(errorHost, useful_group[0])
//             typeof callback === 'function' && callback(new_url);
//           } else {
//             console.warn('hostGroup[' + g + ']域名已经全部重试')
//           }
//         })
//       }
//     }
//   }
// }

// 获取文字聚焦的数组
export const textFocusArray = () => {
  let klssAllObject = globalStore.getFabric()._objects
  // 获取所有文字klss对象
  let textEditingArray = klssAllObject.filter(item => item.isText && item.isEditing)
  return textEditingArray
}

export const setCursor = ({ brushType, target, _cursor }) => {
  // 使用异步才使fabric更新cursor成功
  setTimeout(() => {
    let canvas = globalStore.getFabric()
    // 获取所有klss对象
    let klssAllObject = canvas.getObjects()
    // 没有涂鸦权限的时候默认鼠标是箭头
    if (!globalStore.reducerStore.getState().room.powerEnable) {
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
      let klssAllImage = klssAllObject.filter(item => item.isPicture)
      klssAllImage.map(item => item.hoverCursor = cursor.move)
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    }
    // erase 图片hoverCursor显示橡皮檫
    else if (brushType == STATIC.ERASE) {
      klssAllObject.map(item => item.hoverCursor = cursor.erase)
      canvas.defaultCursor = cursor.erase
      canvas.hoverCursor = cursor.erase
    } else if (brushType == '') {
      // 这里要判断空是因为图片应用后会默认把画笔类型重置
      // 图片默认
      let klssAllImage = klssAllObject.filter(item => item.isPicture)
      klssAllImage.map(item => item.hoverCursor = cursor.initial)
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    } else if (brushType === STATIC.POINTER) {
      canvas.defaultCursor = cursor.initial
      canvas.hoverCursor = cursor.initial
    }
    else {
      // 涂鸦工具等画笔类型
      klssAllObject.map(item => item.hoverCursor = cursor.draw)
      canvas.defaultCursor = cursor.draw
      canvas.hoverCursor = cursor.draw
    }
    canvas.renderAll()
  }, 0);
}