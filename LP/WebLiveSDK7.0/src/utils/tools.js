// Filename: tools.js
import { STATIC } from '../states/staticState'
define(function (require) {
  var ajaxs = require('../extends/ajax.js'),
    qwebchannel = require('./qwebchannel'),
    _detectiveWxJsBridge = require('../extends/detectiveWxJsBridge.js')
  var tools = {
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
    crc32: function (str, crc) {
      var table =
        '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D'
      /* Number */
      // crc32 = function ( /* String */ str, /* Number */ crc) {
      if (typeof crc === 'undefined') {
        crc = 0
      }
      var n = 0 //a number between 0 and 255
      var x = 0 //an hex number
      crc = crc ^ -1
      for (var i = 0, iTop = str.length; i < iTop; i++) {
        n = (crc ^ str.charCodeAt(i)) & 0xff
        x = '0x' + table.substr(n * 9, 8)
        crc = (crc >>> 8) ^ x
      }
      return crc ^ -1
      // };
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
      var val = ''
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
    getQueryStr: function (name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      var r = window.location.search.substr(1).match(reg)
      if (r != null) return unescape(r[2])
      return null
    },
    // 切换Dom
    replaceDom: function (domA, domB) {
      if (domA && domB) {
        var rDomA = domA
        var rDomB = domB
        var domAParent = rDomA.parentNode
        var domBParent = rDomB.parentNode
        // 插入 domB ==> 移除domA
        domAParent.replaceChild(rDomB, rDomA)
        // domB ==> domA
        if (domBParent.prepend) {
          domBParent.prepend(rDomA)
        } else {
          domBParent.appendChild(rDomA)
        }
      } else {
        this.warn('Dom A/B must be defined!')
      }
    },

    // 深度拷贝
    deepClone: function (obj) {
      var objClone = Array.isArray(obj) ? [] : {}
      if (obj && typeof obj === 'object') {
        for (var key in obj) {
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

    // 获取当前域名组
    getHostGroup: function (url, group) {
      let targetGroup = null
      if (url && group) {
        if (group.length > 0) {
          group.forEach(function (hostItem) {
            if (hostItem?.length > 0) {
              hostItem.forEach(function (item) {
                if (url.indexOf(item) > -1) {
                  targetGroup = hostItem
                }
              })
            }
          })
        }
      }
      return targetGroup
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
      if (_match?.length > 0) {
        var index = _match.length - 1
        curMode = parseInt(_match[index].replace('sdkmode=', ''), 10)
      }
      return curMode
    },
    // 是否原生App(模式二)
    isInNative: function () {
      if (this.isMobileSDK() && this.getSDKMode() === 2) {
        return true
      } else {
        return false
      }
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
    isShowDebug: function () {
      return window.location.href.indexOf('sdkDebug=list') > -1
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
      if (console?.time) {
        console.time(key)
      }
    },
    // debugtime end
    debugTimeEnd: function (key) {
      if (console?.timeEnd) {
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
      if (console?.warn) {
        var _args = Array.prototype.slice.call(arguments)
        _args.unshift('[TalkFun WARN message]')
        console.warn.apply(console, _args)
      }
    },
    // error
    error: function () {
      if (console?.error) {
        var _args = Array.prototype.slice.call(arguments)
        _args.unshift('[TalkFun ERROR message]')
        console.error.apply(console, _args)
      }
    },
    // 长log
    long: function () {
      if (location.href.indexOf('sdkDebug=long') > -1) {
        this.debug.apply(this, arguments)
      }
    },
    // debug
    debug: function () {
      var isDebug = this.isShowDebug()
      if (typeof console !== 'undefined' && isDebug) {
        var _args = Array.prototype.slice.call(arguments)
        _args.unshift('[TalkFun LOG message]')
        // log apply.
        console.debug(..._args)
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
        if (navigator.plugins?.length > 0) {
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
      return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
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
      if (platform === 'Android' || platform === 'IOS') {
        return true
      } else {
        return false
      }
    },
    isMobileSDK: function () {
      var ua = navigator.userAgent.toLowerCase()
      if (ua.indexOf('talkfun-ios-sdk') > -1 || ua.indexOf('talkfun-android-sdk') > -1) {
        return true
      }
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
      if (this.userAgent('TALK_FUN_2.0')) {
        return true
      }
      return false
    },
    // userAgent
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

    // 获取 flv 地址格式
    getFlvVideoUrl: function (stream) {
      // return document.location.protocol + this.stream2flv(stream)
      return `${STATIC.PROTOCOL}${this.stream2flv(stream)}`
    },

    /**
     * @直播stream组装规则:(课件模式 | 桌面分享模式)
     * hls => http:// + hosts.hls + domain + / + app + / + path + / + ext.m3u8 ( query ? "?" + query : '')
     * ngb => http:// + ip + / + hosts.hls + domain + / app + / + path + ext.m3u8 + (query ? "?" + query : '')
     */
    getVideoUrl: function (mainStream) {
      var that = this,
        content = mainStream,
        urlStream = ''
      tools.debug('stream content => ', content)
      // 点播
      // if (this.playType == 'playback') {
      //   return content;
      // }
      // 直播
      // else {
      // m3u8地址组装
      urlStream = `${document.location.protocol}//${that.stream2m3u8(content)}`
      // exports
      return urlStream
      // }
    },
    // stream to m3u8
    stream2m3u8: function (content) {
      // the Ruls.
      var urlStream = ''
      if (!content.hosts) {
        return false
      }
      // 地址组装
      urlStream = content.hosts.hls + content.domain + '/' + content.app + '/' + content.path + '/' + content.ext.m3u8 + (content.query.length > 0 ? '?' + content.query : '')
      tools.debug(`get hls url ==> ${STATIC.PROTOCOL}${urlStream}`)
      return urlStream
    },
    // stream to flv
    stream2flv: function (content) {
      // the Ruls.
      var urlStream = ''
      // 地址组装
      urlStream = content.hosts.flv + content.domain + '/' + content.app + '/' + content.path + content.ext.flv + (content.query.length > 0 ? '?' + content.query : '')
      tools.debug(`get flv url ==> ${STATIC.PROTOCOL}${urlStream}`)
      return urlStream
    },
    // stream to rtmp
    stream2Rtmp: function (content) {
      // the Ruls.
      var urlStream = ''
      // 地址组装
      urlStream = 'rtmp://' + content.hosts.rtmp + content.domain + '/' + content.app + '/' + content.path
      tools.debug('get rtmp url ==>', urlStream)
      return urlStream
    },
    // path / id 返回(仅供flash使用)
    stream2RtmpPath: function (content) {
      // the Ruls.
      var urlStream = {
        path: 'rtmp://' + content.hosts.rtmp + content.domain + '/' + content.app + '/',
        id: content.path
      }
      // 地址组装
      // urlStream = 'rtmp://' + content.hosts.rtmp + content.domain + "/" + content.app + "/" + content.path
      tools.debug('get rtmp path ==>', urlStream)
      return urlStream
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
    ajax: function (options) {
      return ajaxs(options)
    },
    detectiveWxJsBridge: function (cb) {
      return _detectiveWxJsBridge(cb)
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
  // exports
  return tools
})
