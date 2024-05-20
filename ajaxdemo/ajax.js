'use strict';
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory)
	} else if (typeof exports === 'object') {
		// CMD
		console.warn('just support browser environment')
		module.exports = factory()
	} else {
		root.ajaxs = factory()
	}
}(this, function () {
	return (function () {
		/**
		 * 深拷贝
		 * @param { Object,... } 至少传入两个object 第一个参数为target，后续的所有object的属性都会拷贝进入target
		 * @return { Object } 返回一个新object
		 */
		function extend() {
			// 判断类型;typeof 判断数组时返回object
			var args = Array.prototype.slice.call(arguments)
			if (args.length <= 1) {
				if (Array.prototype.toString.call(args[0]) === '[object Object]') {
					console.warn('extend methods received one param or none, need two more.')
					return args[0]
				} else {
					throw new Error('Must passed an object.')
				}
			}
			var target = args.shift()
			for (var i = 0; i < args.length; i++) {
				var current = args[i]
				if (Array.prototype.toString.call(current) !== '[object Object]') {
					throw new Error('extend method\'s error: the' + (i + 1))
				}
				for (var k in current) {
					if (Object.prototype.toString.call(current[k]) === '[object Object]') {
						target[k] = {}
						extend(target[k], current[k])
					} else if (Object.prototype.toString.call(current[k]) === '[object Array]') {
						target[k] = current[k].slice()
					} else {
						target[k] = current[k]
					}
				}
			}
			return target
		}

		/**
		 * 
		 * @param {Object} obj 对象
		 * @return {Boolean} 判断对象是否为空对象
		 */
		function isEmptyObject(obj) {
			for (var k in obj) {
				// hasOwnProperty() 是否含有自身属性，判断空对象
				if (obj.hasOwnProperty(k)) {
					return false
				}
			}
			return true
		}

		/**
		 * url参数拼接
		 * @param { Object } data object
		 * @param { Boolean } encodeFlag encodeURIComponent 默认false不编码
		 */
		function formatParam(data, encodeFlag) {
			var arr = []

			// 是否编码
			var encodeFlag = encodeFlag || false
			var theName
			var value
			for (var key in data) {
				if (encodeFlag) {
					theName = encodeURIComponent(key)
					value = encodeURIComponent(data[key])
				} else {
					theName = key
					value = data[key]
				}
				arr.push(theName + '=' + value)
			}
			// join() 方法用于把数组中的所有元素放入一个字符串。
			return arr.join('&')
		}
		/**
		 * 
		 * @param { Object } options ajax相关参数
		 */
		function ajaxs(options) {
			if (Object.prototype.toString.call(options) !== '[object Object]') {
				throw new Error('should passed an object.')
			}
			var abortTimer = null
			var responseHeaderContentType = ''
			var dhead
			var s

			// 设置 请求的默认值
			var defaults = {
				url: '',
				type: 'get',
				dataType: 'json',
				data: {},
				timeout: 0,

				// 设置cors时发送cookie到服务器, 默认false不发送
				withCredentials: true,

				// 设置jsonp跨域时 ?callback=fdsfs2313 的 callback 名字部分
				// jsonp: 'jsonp'

				// 设置jsonp的 回调函数的名字 ?callback=fdsfs2313 的 fdsfs2313 部分
				// jsonpCallback: 'tf_' + math.random()

				// true，异步
				async: true,

				// false, 默认添加时间戳参数
				cache: false,

				// beforeSend中 显式 return false 可以中断ajax发送 (=== 强等)
				beforeSend: function (xhr) {
					return xhr
				},
				success: function () {},
				error: function () {}
			}

			// 把传入的参数拷贝进默认defaults
			// For Moden browser
			if (Object.assign) {
				defaults = Object.assign(defaults, options)
			} 
			// For IE
			else { 
				defaults = extend(defaults, options)
			}

			// 请求类型
			var type = defaults.type.toLowerCase()

			// 请求地址
			var url = defaults.url

			//  请求的数据类型 json, jsonp ,xml ,html,text
			// toLowerCase() => 转换成小写
			var dataType = defaults.dataType.toLowerCase()

			// 发送请求的数据
			if (typeof defaults.data === 'string') {
				var tempDataArr = defaults.data.split('&')
				var tempDataObj = {}
				for (var i = 0; i < tempDataArr.length; i++) {
					var cur = tempDataArr[i]
					var tempCurArr = cur.split('=')
					tempDataObj[tempCurArr[0]] = tempCurArr[1]
				}
				var data = tempDataObj
			} else {
				var data = defaults.data
			}
			
			// 是否发送同步请求 默认 true 异步
			var async = defaults.async

			// 是否传入时间戳参数
			var cache = defaults.cache
			var tTimeStampName = 'ht_tstamp'

			// 设置请求超时 中断请求 的 时间 单位： ms
			var timeout = defaults.timeout

			// 是否对 data 数据进行 encodeURIComponent 编码
			var encodeFlag = false

			// 设置请求头中的 Content-Type 属性
			var contentType = defaults.contentType

			// jsonp 情况
			if (dataType === 'jsonp') {
				var jsonp = data.jsonp || 'callback'
				var jsonpCallback
				if (defaults.jsonpCallback) {
					jsonpCallback = defaults.jsonpCallback
				} else {
					jsonpCallback = 'tf_tstamp' + (new Date().getTime()).toString() + (Math.random()).toString().slice(2)
				}
			
				url = url + '?' + jsonp + '=' + jsonpCallback
				url = url + '&' + formatParam(data)
				if (!cache) {
					url = url + '&' + tTimeStampName + '=' + (new Date().getTime()).toString()
				}
				s = document.createElement('script')
				if (!dhead) {
					dhead = document.getElementsByTagName('head')[0]
				}
				s.src = url
				// s.onload = function() {
				//   this.parentNode.removeChild(this)
				// }
				s.onerror = function () {
					throw new Error('script onerror: jsonp请求发送失败')
				}
				if (defaults.beforeSend && defaults.beforeSend() === false) {
					return false;
					s = null
				}
				dhead.appendChild(s)

				// 设置回调函数
				window[jsonpCallback] = function (data) {
					clearTimeout(s.timer)
					dhead.removeChild(s)
					window[jsonpCallback] = null
					defaults.success && defaults.success(data)
				}
				if (defaults.timeout) {
					s.timer = setTimeout(function () {
						dhead.removeChild(s)
						window[jsonpCallback] = null
						defaults.error && defaults.error({
							message: 'jsonp request timeout'
						})
					}, timeout)
				}
			} else if (dataType === 'script') {
				s = document.createElement('script')
				if (!dhead) {
					dhead = document.getElementsByTagName('head')[0]
				}
				if (!isEmptyObject(data)) {
					if (url.lastIndexOf('?') > -1) {
						url = url + '&' + formatParam(data)
					} else {
						url = url + '?' + formatParam(data)
					}
				}
				if (!cache) {
					if (url.lastIndexOf('?') > -1) {
						url =  url + '&' + tTimeStampName + '=' + (new Date().getTime()).toString()
					} else {
						url =  url + '&' + tTimeStampName + '=' + (new Date().getTime()).toString()
					}
				}
				s.src = url
				s.onload = function() {
					defaults.success && defaults.success(this)
					s = null
				}
				s.onerror = function() {
					defaults.error && defaults.error({message: 'script loaded error'})
					s = null
					// throw new Error('script load error')
				}
				if (defaults.beforeSend && defaults.beforeSend() === false) {
					return false
					s = null
				}
				dhead.appendChild(s)
				
				// XMLHttpRequest
			} else {

				// // 非IE6
				// if (window.XMLHttpRequest) {
				// 	var xhr = new XMLHttpRequest();
				// } else {

				// 	// IE6及其以下版本浏览器
				// 	var xhr = new ActiveXObject('Microsoft.XMLHTTP');
				// }
				// 
				var xhr = new XMLHttpRequest();
			    if ("withCredentials" in xhr) {
			  	  xhr = xhr;
			    } 

				// XDomainRequest for IE.
				else if (typeof XDomainRequest != "undefined") {
				   xhr = new XDomainRequest();
				}

				// CORS not supported.
				else {
				   xhr = null;
				}

				// 设置 回调
				xhr.onreadystatechange = function () {
					var res
					var status
					if (xhr.readyState === 1) {
						if (!abortTimer && timeout > 0) {
							abortTimer = setTimeout(function() {
				                // abort 之后应该会触发ajax 的 error 回调
				                xhr.abort()
				                abortTimer = null
							}, timeout)
						}
					}

					// 2
					if (xhr.readyState === 2) {
						responseHeaderContentType = xhr.getResponseHeader('Content-Type')
					}

					// 4
					if (xhr.readyState === 4) {
						status = xhr.status;
						if (status >= 200 && status < 300) {
							clearTimeout(abortTimer)
							abortTimer = null

							// 返回json对象
							if (dataType === 'json' && !(/javascript/.test(responseHeaderContentType))) {
									if (typeof xhr.responseText === 'object') {
										res = xhr.responseText
									} else {
					                  if (JSON.parse) {
					                  	if(typeof xhr.responseText === "string" && xhr.responseText.length > 0){
					                        res = JSON.parse(xhr.responseText)
					                    }else{
					                        res = {}
					                    }
					                    // data = JSON.parse(xhr.responseText)
					                  } else {
					                    res = eval("(" + xhr.responseText + ")")
					                  }
								}
							// 返回 xml 格式的文档 用数组作为根节点的json对象转换成xml结构的事后，数组索引作为了xml的标签，在xml结构中，是语法错误
							} else if (dataType === 'xml') {
								if (xhr.responseXML) {
									res = xhr.responseXML
									if (res.documentElement) {
										res = res.documentElement
									}
								}
							} 
							// json
							else {
								res = xhr.responseText
							}
							options.success && options.success(res)
						} else {
							options.error && options.error(status)
						}
					}
				}

				if (type === 'get') {
					if (!isEmptyObject(data)) {
						if (url.lastIndexOf('?') > -1) {
							url = url + '&' + formatParam(data)
						} else {
							url = url + '?' + formatParam(data)
						}
					}
					if (!cache) {
						if (url.lastIndexOf('?') > -1) {
							url = url + '&' + tTimeStampName + '=' + (new Date().getTime()).toString()
						} else {
							url = url + '?' + tTimeStampName + '=' + (new Date().getTime()).toString()
						}
					}

					// open
					xhr.open(type, url, async)
					
          			// beforeSend 钩子函数
					if ((typeof defaults.beforeSend === 'function' && defaults.beforeSend(xhr)) === false) {
						xhr = null
						return false
					}
					xhr.send(null)
				} else if (type === 'post') {
					// post提交设置请求头
					// open
					// console.error(data)
					xhr.open(type, url, async)
					if (contentType) {
						xhr.setRequestHeader('Content-Type', contentType)
					} else {
						// post默认请求头
						// xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8') 请求cnode社区验证accesstoken合法性，用到该请求头
						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					}
					if ((defaults.beforeSend && defaults.beforeSend(xhr)) === false) {
						xhr = null
						return false
					}

					// 如果JSON 对象不存在，则需要添加json2.js垫片库  https://github.com/douglascrockford/JSON-js
					// xhr.send(JSON.stringify(data))
					// ==============================
					// #### 解析 post-params 参数 ####
					// ==============================
					var _params = '',
						_postArrs = []
					if (typeof data === 'object'){
						// Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组
						var _postDatas = Object.keys(data),
							_it = '';
						if(_postDatas.length > 0){
							for (var _k in data) {
								_it = (_k + '=' + data[_k])
								_postArrs.push(_it)
							}
						}
						_params = _postArrs.join('&')
					}
					xhr.send(_params)
				}
			}
		}
		return ajaxs
	}())
}))