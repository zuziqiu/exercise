var ajaxs = require('./ajax.js'),
  qwebchannel = require('./qwebchannel'),
  _detectiveWxJsBridge = require('./detectiveWxJsBridge.js');
const tools = {
  // 获取url参数
  getQueryStr: function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) return unescape(r[2])
    return null
  },
  // 时间格式 (时:分:秒.毫秒)
  getTime: function () {
    var d = new Date()
    //补0
    var zeroize = function (value) {
      var length = 2
      value = new String(value)
      for (var i = 0, zeros = ''; i < length - value.length; i++) {
        zeros += '0'
      }
      return zeros + value
    }
    return zeroize(d.getHours()) + ':' + zeroize(d.getMinutes()) + ':' + zeroize(d.getSeconds()) + '.' + zeroize(d.getMilliseconds())
  },
  timestamp: function (ms) {
    var _t = new Date().getTime()
    if (!ms) {
      _t = Math.round(_t / 1000)
    }
    return _t
  },
  // Second to hh:mm:ss
  second2HMS: function (d) {
    d = parseInt(d)
    var h = Math.floor(d / 3600)
    var m = Math.floor((d % 3600) / 60)
    var s = Math.floor((d % 3600) % 60)
    let val = null

    function format(num) {
      if (num > 0) {
        if (num >= 10) {
          val = num
        } else {
          val = '0' + num
        }
      } else {
        val = '00'
      }
      return val
    }
    var hr = format(h)
    var min = format(m)
    var sec = format(s)
    var hms = hr + ':' + min + ':' + sec
    return hms
  },
  // 更改协议类型
  detectProtocol: function (content) {
    return content.replace(/http:\/\//gi, window.location.protocol + '//')
  },
  // 进入fullscreen
  fullscreen: function (ele) {
    if (ele.requestFullscreen) {
      ele.requestFullscreen()
    } else if (ele.mozRequestFullScreen) {
      ele.mozRequestFullScreen()
    } else if (ele.webkitRequestFullscreen) {
      ele.webkitRequestFullscreen()
    } else if (ele.msRequestFullscreen) {
      ele.msRequestFullscreen()
    } else if (ele.webkitEnterFullscreen) {
      ele.webkitEnterFullscreen()
    }
  },
  // 退出全屏
  exitFullscreen: function () {
    if (document.exitFullScreen) {
      document.exitFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (element.msExitFullscreen) {
      element.msExitFullscreen()
    }
  },
  // 深度拷贝
  deepClone: function (obj) {
    var objClone = Array.isArray(obj) ? [] : {}
    if (obj && typeof obj === 'object') {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          //判断ojb子元素是否为对象，如果是，递归复制
          if (obj[key] && typeof obj[key] === 'object') {
            objClone[key] = this.deepClone(obj[key])
          } else {
            //如果不是，简单复制
            objClone[key] = obj[key]
          }
        }
      }
    }
    return objClone
  },

  // 设置room
  setRoom: function (room) {
    this.room = room
  },

  // 获取room
  getRoom: function () {
    if (this.room) {
      return this.room
    } else {
      return null
    }
  },

  // 获取对象类型
  _typeof: function (obj) {
    var _type = Object.prototype.toString.call(obj)
    // var _types = ['Undefined', 'Object', 'Number', 'Boolean', 'Null', 'Array']
    // if (_type.match(/String/)) {
    // 	return 'String'
    // }
    // return Object.prototype.toString.call(obj);
    return _type
      .replace(/object /, '')
      .replace(/^\[|\]$/g, '')
      .toLowerCase()
  },

  // 从 window.TF_getStaticHost 获取正确CDN-HOST
  getStaticHost: function (content) {
    if (window.TF_getStaticHost) {
      return window.TF_getStaticHost(content)
    } else {
      return content
    }
  },

  // 合并对象
  // {a:1}, {a:3} ==> {a:1, a:2, a:3}
  /**
   * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
   * @param obj1
   * @param obj2
   * @returns obj3 a new object based on obj1 and obj2
   */
  assignObject: function (obj1, obj2) {
    var obj3 = {}
    for (var attrname in obj1) {
      obj3[attrname] = obj1[attrname]
    }
    for (var attrname in obj2) {
      obj3[attrname] = obj2[attrname]
    }
    return obj3
  },

  // 筛选数组对象某一项
  sortObjByKey: function (list, key) {
    function compare(a, b) {
      a = a[key]
      b = b[key]
      var type = typeof a === 'string' || typeof b === 'string' ? 'string' : 'number'
      var result
      if (type === 'string') result = a.localeCompare(b)
      else result = a - b
      return result
    }
    return list.sort(compare)
  },
  // 获取sdk模式
  getSDKMode: function () {
    // 共3种模式 [1 / 2 / 3]
    // 模式1: html5 + 原生视频模式
    // 模式2: ppt h5 + 原生
    // 暂未开通
    var _match = window.location.href.match(/sdkmode=[0-9]/gi),
      curMode = 0
    // 取地址最后传入模式
    if (_match && _match.length > 0) {
      var index = _match.length - 1
      curMode = parseInt(_match[index].replace('sdkmode=', ''), 10)
    }
    return curMode
  },
  // 是否原生App(模式二)
  isInNative: function () {
    return false
  },
  // qt-web初始化
  qtWebEngine: function (callback) {
    var that = this
    if (!this.isCloudLiveBrowser()) {
      return false
    }
    try {
      new qwebchannel.QWebChannel(qt.webChannelTransport, function (channel) {
        that.debug('QtWebEngine start success!')
        var qtObject = channel.objects.interactObj
        if (callback) {
          callback(qtObject)
        }
        // window.bridge = channel.objects.interactObj;
      })
    } catch (err) {
      this.debug('qtweb on error => ', err)
    }
  },
  // log
  htmlLog: function (msg) {
    if (!msg) {
      return false
    }

    // create
    var p = document.createElement('p')

    // log
    if (!document.querySelector('#talkfun_frontend_ht_logs')) {
      var divlog = document.createElement('div')
      divlog.id = 'talkfun_frontend_ht_logs'
      divlog.style.height = 'auto'
      divlog.style.overflow = 'auto'
      divlog.style.position = 'fixed'
      divlog.style['-webkit-overflow-scrolling'] = 'touch'
      divlog.style.left = '0'
      divlog.style.top = '20%'
      divlog.style.bottom = '0'
      divlog.style.zIndex = '99999999'
      divlog.innerHTML = '<p>start...</p>'
      // append
      document.querySelector('body').appendChild(divlog)
    }

    // msg format
    try {
      var logs = JSON.stringify(Array.prototype.slice.call(msg))
      logs = logs.replace(/^\[/, '').replace(/\]$/, '')
      p.innerHTML = logs
    } catch (err) {
      p.innerHTML = 'LOG_ERROR ==> ' + err.message
    }

    p.style.backgroundColor = '#000000'
    p.style.color = '#58FF19'
    p.style.marginTop = '5px'
    p.style.padding = '2%'
    p.style.width = '96%'
    p.style.wordBreak = 'break-all'

    // prepend logs
    var body = window.document.body
    var parent = document.getElementById('talkfun_frontend_ht_logs')
    parent.insertBefore(p, document.querySelector('#talkfun_frontend_ht_logs p'))
  },
  // 是否显示debug
  isShowDebug: function (type) {
    let debugType = null
    if (type === 'long' || type === 'lilst') {
      debugType = 'debug=' + type
    } else {
      debugType = 'debug=list'
    }
    return window.location.href.indexOf(debugType) > -1
  },
  // small_v1
  flashDebugPath: function (swfUrl) {
    // 替换为 v1 目录 leval[\d] 关键字清理掉
    if (window.location.href.indexOf('swf=v1') > -1) {
      var debugPath = 'static/swf/debug/small_v1/'
      if (/static\/swf\/debug\//.test(swfUrl)) {
        return swfUrl.replace(/static\/swf\/debug\//, debugPath).replace(/level[\d]\//, '')
      } else {
        return swfUrl.replace(/static\/swf\//, debugPath).replace(/level[\d]\//, '')
      }
    } else {
      return swfUrl
    }
  },
  // 是否显示html-log样式
  isShowHtmlLog: function () {
    return window.location.href.indexOf('htmllog=true') > -1
  },
  // debugtime start
  debugTimeStart: function (key) {
    if (console && console.time) {
      console.time(key)
    }
  },
  // debugtime end
  debugTimeEnd: function (key) {
    if (console && console.timeEnd) {
      console.timeEnd(key)
    }
  },

  // 禁止控制台
  disableConsole: function (flag) {
    if (!flag) {
      return
    }
    // window.console = {
    // 	debug: ()=>{

    // 	},
    // 	log: ()=>{

    // 	},
    // 	info: ()=>{

    // 	},
    // 	warn: ()=>{

    // 	},
    // 	error: ()=>{

    // 	}
    // }
  },
  argumentToArray: function (args) {
    return Array.prototype.slice.call(args)
  },
  // warn
  warn: function () {
    if (console && console.warn) {
      var _args = Array.prototype.slice.call(arguments)
      _args.unshift('[TalkFun WARN message]')
      console.warn.apply(console, _args)
    }
  },
  // error
  error: function () {
    if (console && console.error) {
      var _args = Array.prototype.slice.call(arguments)
      _args.unshift('[TalkFun ERROR message]')
      console.error.apply(console, _args)
    }
  },
  // long
  long: function () {
    var isDebug = this.isShowDebug('long')
    if (isDebug) {
      this.debug.apply(this, arguments)
    }
  },
  // debug
  debug: function () {
    if(window.location.search.indexOf('debug=list') === -1) return
    var isDebug = this.isShowDebug('list')
    if (typeof console !== 'undefined' && isDebug) {
      var _args = Array.prototype.slice.call(arguments)
      _args.unshift('[TalkFun LOG message]')
      // log apply.
      console.log.apply(console, _args)
      // show htmllog.
      if (this.isShowHtmlLog()) {
        this.htmlLog(_args)
      }
    }
  },
  // 获取Flash对象
  getFlash: function (flashName) {
    if (navigator.appName.indexOf('Microsoft') != -1) {
      try {
        return document[flashName]
      } catch (e) {
        return window[flashName]
      }
    } else {
      return document[flashName]
    }
  },
  // 判断是否有Flash插件
  flashChecker: function () {
    var hasFlash = false, //是否安装了Flash
      VSwf = {}, //版本信息
      flashVersion = -1 //Flash版本
    if (document.all) {
      try {
        var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
      } catch (err) {}
      if (swf) {
        hasFlash = true
        VSwf = swf.GetVariable('$version')
        flashVersion = parseInt(VSwf.split(' ')[1].split(',')[0])
      }
    } else {
      if (navigator.plugins && navigator.plugins.length > 0) {
        var swf = navigator.plugins['Shockwave Flash']
        if (swf) {
          hasFlash = true
          var words = swf.description.split(' ')
          for (var i = 0; i < words.length; ++i) {
            if (isNaN(parseInt(words[i]))) continue
            flashVersion = parseInt(words[i])
          }
        }
      }
    }
    return {
      flash: hasFlash,
      version: flashVersion
    }
  },
  // 是否在数组里
  in_array: function (find, search, showRes) {
    for (var i = 0; i < search.length; i++) {
      if (find == search[i]) {
        // 选项
        if (showRes) {
          return {
            key: i,
            item: search[i]
          }
          break
        }
        return true
      }
    }
    return false
  },

  // 数组查找
  find: function (_find, arr) {
    if (this.in_array(_find, arr)) {
      return this.in_array(_find, arr, true)
    } else {
      return false
    }
  },

  // 删除数组某个元素
  without: function (ary, value) {
    var len = ary.length
    for (var i = 0; i < len; i++) {
      if (ary[i] === value) {
        ary.splice(i, 1)
      }
    }
    return ary
  },
  // get platform Name. & version.
  getPlatformInfo: function () {
    // UA
    var ua = navigator.userAgent.toLowerCase(),
      os = null,
      version = -1,
      isIOS = ua.match(/iphone|ipad|ipod/gi) || false,
      isAndroid = ua.match(/android/gi) || false

    // IOS
    if (isIOS) {
      os = 'ios'
      version = ua.match(/os\s([0-9_0-9]*)/)[1].replace('_', '.')
    }
    // Android
    else if (isAndroid) {
      os = 'android'
      version = ua.match(/android\s([0-9\.]*)/)[1]
    }

    // exports
    return {
      partform: os,
      version: parseFloat(version)
    }
  },
  // 取最接近数值
  closeSet: function (arr, find) {
    // 如果数组为空
    if (arr && arr.length === 0) {
      return null
    }
    // search the closeset value.
    find = Math.abs(find)
    var a = arr,
      alen = a.length
    if (typeof a[0]['st'] !== 'undefined') {
      var b = []
      for (var i = 0; i < alen; i++) {
        b.push(a[i]['st'])
      }
      a = b
    }
    for (var i = 0; i < alen; i++) {
      var r = 0
      if (a[i] === find) {
        return (r = arr[i])
      }

      // 大于当前, 取上一个
      // seek[19.9] ==> [19.8, 20.1, 22.4] ==> 取19.8
      else if (a[i] > find) {
        return (r = arr[i - 1])
      }

      // 大于最后一项
      else if (find > a[a.length - 1]) {
        return (r = arr[a.length - 1])
      }
    }
  },
  // 是否启动兼容模式
  isCompatible: function () {
    if (window.location.href.indexOf('compatible=true') > -1) {
      return true
    } else {
      return false
    }
  },
  // 是否IE
  isIE: function () {
    var myNav = navigator.userAgent.toLowerCase(),
      isIe = false
    if (myNav.indexOf('msie') > -1 || myNav.indexOf('.net') > -1) {
      isIe = true
    }
    return isIe
  },
  // 获取平台
  platform: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('macintosh') > -1) {
      return 'MacOS'
    } else if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('ios-sdk') > -1) {
      return 'IOS'
    } else if (ua.indexOf('android') > -1 || ua.indexOf('android-sdk') > -1) {
      return 'Android'
    } else if (ua.indexOf('linux') > -1) {
      return 'Linux'
    } else if (ua.indexOf('windows') > -1) {
      return 'Windows'
    }
    return 'Unknow'
  },
  // QQ
  isQQMobile: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('qqbrowser') > -1 || ua.indexOf('qq') > -1) {
      return true
    }
    return false
  },
  // UC
  isUCMobile: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('ucbrowser') > -1) {
      return true
    }
    return false
  },
  // Safari
  isSafari: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('safari') > -1) {
      return true
    }
    return false
  },
  // touch 支持
  touchSupport: function () {
    return 'ontouchstart' in window
  },
  // Wechat
  isWechat: function () {
    if (navigator.userAgent.indexOf('MicroMessenger') > -1) {
      return true
    }
    return false
  },
  isMobile: function () {
    var platform = this.platform()
    // return true
    // // 无法读取 flash 当 h5 处理
    // if (!this.flashChecker().flash) {
    // 	return true
    // }
    // if (platform === 'Android' || platform === 'IOS' || platform === 'MacOS' ) {
    if (platform === 'Android' || platform === 'IOS') {
      return true
    }
    // return true
    return false
  },
  isTalkFunBrowser: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('talkfun-browser') > -1) {
      return true
    }
    return false
  },
  // 直播器新版
  isCloudLiveBrowser: function () {
    if (this.userAgent('TALK_FUN_2.0') > -1) {
      return true
    }
    return false
  },
  userAgent: function (agentName) {
    var ua = navigator.userAgent.toLowerCase()
    agentName = agentName.toLowerCase()
    if (ua.indexOf(agentName) > -1) {
      return true
    }
    return false
  },
  isIphone: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('iphone') > -1) {
      return true
    }
    return false
  },
  isIpad: function () {
    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('ipad') > -1) {
      return true
    }
    return false
  },
  // 是否安卓平台
  isAndroid: function () {
    if (this.getPlatformInfo().partform === 'android') {
      return true
    } else {
      return false
    }
  },
  // 是否苹果平台
  isIos: function () {
    if (this.getPlatformInfo().partform === 'ios') {
      return true
    } else {
      return false
    }
  },
  // 内容插入指定位置
  insertPosition: function (focusEl, _value) {
    var cm_el = focusEl,
      _ts = this,
      myField = cm_el,
      myValue = _value
    //Chooese the target
    myField.focus()
    //IE support
    if (document.selection) {
      myField.focus()
      sel = document.selection.createRange()
      sel.text = myValue
      sel.select()
    }
    //Mozilla & Netspace support
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart
      var endPos = myField.selectionEnd
      // save scrollTop before insert
      var restoreTop = myField.scrollTop
      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length)
      if (restoreTop > 0) {
        myField.scrollTop = restoreTop
      }
      myField.focus()
      myField.selectionStart = startPos + myValue.length
      myField.selectionEnd = startPos + myValue.length
    } else {
      myField.value += myValue
      myField.focus()
    }
  },
  /**
   * [替换 UBB 字符]
   * @param  {[key: value]} _package [表情包]
   * @param  {[String]} msg [内容带UBB编码]
   * @return {[String]} [返回带UBB转换]
   */
  ubb2img: function (_package, msg) {
    var reg = /\[.+?\]/g,
      _elmoti = '',
      _ts = this,
      face = _package,
      str = msg
    str = str.replace(reg, function (ubb) {
      if (typeof face[ubb] !== 'undefined') {
        _elmoti = '<img src="' + face[ubb] + '"/>'
      } else {
        _elmoti = ubb
      }
      return _elmoti
    })
    return str
  },
  // 'S 转换时间格式 ==> min
  formatTime: function (second) {
    var min = parseInt(second / 60)
    if (min === 0) {
      min = 1
    }
    return min
  },
  // 时间
  urlHashMap: function () {
    var _hash = window.location.hash.substring(1),
      _kv = []
    if (_hash) {
      var _group = _hash.split('&')
      for (var i in _group) {
        var _tmp = _group[i].split('=')
        _kv[_tmp[0]] = _tmp[1] ? _tmp[1] : ''
      }
    }
    return _kv
  },
  callback: function (callback, retval) {
    if (typeof callback === 'function') {
      if (typeof retval !== 'undefined') {
        callback(retval)
      } else {
        callback()
      }
    }
  },
  // @params  事件绑定(parentElement, this, string:this.callback);
  // @example 调用例子:
  // events: [
  //	 {"click": ["#nav span", "changeNav"] }
  // ]
  bindEvent: function (target, that, events) {
    var tools = this
    var arglen = arguments.length
    /*addEventListener = window.addEventListener || function (eventName, listener) {
		        	return attachEvent('on' + eventName, listener);
		     	},
		     	querySelector = window.document.querySelector || function(id){
		     		return document.getElementById(id);
		     	};*/
    if (arglen === 3) {
      // 绑定
      if (typeof window.addEventListener !== 'undefined') {
        // get set
        var $target = target || arguments[0],
          that = that || arguments[1],
          eventlist = events || arguments[2]

        for (var i = 0; i < eventlist.length; i++) {
          for (var _event in eventlist[i]) {
            // 代理
            var _callback = that[eventlist[i][_event][1]],
              _delegate = eventlist[i][_event][0]

            // 点击事件
            if (_event === 'click') {
              _event = tools.isMobile() ? 'touchstart' : 'click'
            }

            // 绑定
            $target.on(_event, _delegate, _callback)
            // support for IE8+
            /*document.querySelector($target).addEventListener("click", function(e){
								var _eventTarget = e.currentTarget;
								// _callback(_eventTarget);
								console.info(e.target, _event);
							}, false);*/
            // console.info($target, _event, _callback);
          }
        }
      } else {
        tools.debug('事件绑定参数出错.')
      }
    }
  },
  now: function () {
    return new Date().getTime() / 1000
  },
  isWebpSupport: null,
  webpSupport: function (callback) {
    var that = this
    if (that.isWebpSupport !== null) {
      callback(that.isWebpSupport)
    } else {
      var image = new Image()
      image.onerror = function () {
        that.isWebpSupport = false
        callback(that.isWebpSupport)
      }
      image.onload = function () {
        if (image.width == 1) {
          that.isWebpSupport = true
        } else {
          that.isWebpSupport = false
        }
        callback(that.isWebpSupport)
      }
      image.src = 'data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAUAgCdASoBAAEAL/3+/3+CAB/AAAFzrNsAAP5QAAAAAA=='
    }
  },
  ajax: function (options) {
    return window.ajaxs(options)
  },
  detectiveWxJsBridge: function (cb) {
    return window.detectiveWxJsBridge(cb)
  },
  guid: '',
  getGuid: function () {
    var that = this
    if (!that.guid) {
      if (window.localStorage) {
        that.guid = window.localStorage.getItem('tfsdk.guid')
        if (!that.guid) {
          that.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })
          window.localStorage.setItem('tfsdk.guid', that.guid)
        }
      } else {
        that.guid = navigator.userAgent
          .toLowerCase()
          .substr(30, 36)
          .replace(/[^\w\-]/g, '-')
      }
    }

    return that.guid
  },
  timers: {},
  operationTimer: function (o, k, t) {
    var _ts = this
    o[k] = false
    if (typeof t !== 'number') {
      return false
    }
    if (t > 0) {
      if (_ts.timers[k]) {
        clearTimeout(_ts.timers[k])
      }
      _ts.timers[k] = setTimeout(function () {
        o[k] = true
      }, t * 1000)
    } else {
      o[k] = true
    }
  }
}
export default tools
