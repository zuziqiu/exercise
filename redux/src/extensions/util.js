/**
 * ## 工具类 ##
 */
import { globalStore } from '../states/globalStore'
import { STATIC } from '../states/staticState'
// import { Stroke } from './stroke'
// console
export const log = function () {
  let _args =  Array.prototype.slice.call(arguments)
  _args.unshift('[TF-LOG] ##>>')
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
  if (forceType === 'rgb'){
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = _color.toLowerCase();
    if(sColor && reg.test(sColor)){
      if(sColor.length === 4){
        var sColorNew = "#";
        for(var i=1; i<4; i+=1){
          sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for(var i=1; i<7; i+=2){
        sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
      }
      _color = sColorChange.join(",")
    }else{
      _color = sColor;	
    }
  } 
  // hex => dec
  else if(color && color.indexOf('#') > -1) {
    _color = _color.replace('#', '');
    var dec = parseInt(_color, 16);
    if (isNaN(dec)) {
      dec = 0;
    }
    _color = dec//parseInt(_color, 16).toString();
  }
  // 000000 ==>  #000000
  else{
    _color = parseInt(color);
    // _color = _color.toString(16);
    // if (_color.length < 6) {
    //   var appendLength = 6 - _color.length;
    //   for (let i = 0; i < appendLength; i++) {
    //       _color = '0' + _color;
    //   }
    // }
    var hex = Number(_color).toString(16)
    if (hex.length < 6) {
      hex = "00" + hex
    }
    _color = '#' + hex
    // _color = '#' + _color;
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
    if(t !== STATIC.CURVE){
      return {
        id: cArray[0],
        visible: cArray[1],
        x1: cArray[2],
        y1: cArray[3],
        x2: cArray[4],
        y2: cArray[5],
        strokeWidth:cArray[6],
        color: cArray[7],
        opacity: cArray[8],
      }
    } else {
      return {
        id: cArray[0],
        color: cArray[1],
        strokeWidth: cArray[2],
        visible: cArray[3],
        pathData: cArray[4],
        opacity: cArray[5],
      }
    }
  }
}
// 获取当前页图片
export const getPPTImg = (PAGE, SUB_PAGE) => {
  let Store = globalStore.reducerStore.getState()
  let PPT = Store['PPT']
  // let suffix = Store.room.setPageData.suffix
  // console.error(suffix, Store.room)
  let img = ''
  if (PPT && PPT['pages'] && PPT['pages'][PAGE]) {
    // let curPage = PPT['pages'][PAGE]
    // file:///xxxxx/xxxx/xx/1_1.jpg
    // server path
    if (window.qt) {
      // 本地路径
      img = PPT.path + '\\' + (PAGE + '_' + SUB_PAGE) + PPT.suffix
    } 
    // server
    else {
      img = PPT.serverPath + '/' + PAGE + '_' + SUB_PAGE + PPT.suffix
    }
    log('PPT Get Img ==>\n', img)
    return img
  }
}
// 是否画板类型
export const isWhiteboard = (page) => {
  let pageNum = parseInt(page)
  return (pageNum > 10000) ? true : false
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
  klssObj.forEach(function(item, index){
    if (item.id === drawId){
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
    if(Object.prototype.toString.call(visible) === "[object Boolean]"){
      if(visible){
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
// 分页(abandom)
export const pageDo = {
  // 上一页
  prev (page) {
    // todo..
  },
  // 下一页
  next (page) {
    // todo...
  }
}
// 获取Tpl
export const getCmdTpl = () => {
  let tpl = {
    x: '',  //xid
    c: '',  //c数据
    st: '', //发起时间
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
  if (id && type) {
    // remove from type & id
    if (klss.length > 0) {
      klss.map((item) => {
        if (item.type === type && item.id === id){
          fabric.remove(item)
        }
      })
    }
  } 
  // remove all item
  else {
    for (let k = 0; k < klssCounter; k++) {
      log('remove item =>', klss[0].id)
      fabric.remove(klss[0])
    }
  }
}

// Disable select
export const disableKlssSelectable = (klss, enable) => {
  if (!klss) {
    log('klss is not define!')
    return
  }
  let locker =  {
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
      selectionBackgroundColor: 'rgba(0, 0, 0, 0.4)'
    }
    Object.assign(lockType, enableSelect)
  }else {
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