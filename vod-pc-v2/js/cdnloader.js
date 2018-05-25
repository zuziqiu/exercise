/**
 * @author: Marko.
 * @version: v2.2.0
 * @desc: 用于重载用户CDN资源加载失败. 必须要打包后生效
 */

/**
 * @手动依赖配置Demo
 * 
 *  window.TALKFUN_SCRIPT_DEPENS = [
 *      "//static-1.talk-fun.com/open/cooperation/shangde/live-pc/js/libs.min.js",
 *      "//static-1.talk-fun.com/open/maituo_v2/dist/sdk-pc.min.js?v1",
 *      "/player-war/js/newLive/rye-tech/live/sdk.cmd.js",
 *      "/player-war/js/newLive/rye-tech/live/sdk.call.js
 *      "//static-1.talk-fun.com/open/cooperation/common/js/sdk.admin.js"
 *  ];
 *  
 *  => execute CDN code...
*/

/**
 * @Note: 自动模式和手动模式区别: 
 * @ ==> intelligent(自动模式) => 自动组成(检测页面符合 <script src="(.*).js"> 标签), 自动组成 ==> [a.js, b.js, c.js]
 * @ ==> manual(手动模式) => 判断是否存在`window.TALKFUN_SCRIPT_DEPENS`变量, 按`window.TALKFUN_SCRIPT_DEPENS`依赖加载文件
 */
// vilidate CDN Resource
(function(w){

	// 读取 window.TALKFUN_CDN_HOSTS 配置
	var cdnQueue = null;
	if(window.TALKFUN_CDN_HOSTS && typeof window.TALKFUN_CDN_HOSTS === "object" && window.TALKFUN_CDN_HOSTS.length > 0){
		cdnQueue = window.TALKFUN_CDN_HOSTS;
	}
	// Resource Host Config.
	else{
		cdnQueue = [
			"static-1.talk-fun.com",
			"static-2.talk-fun.com",
			"static-3.talk-fun.com",
			"static.talk-fun.com"
		];
	}
	
	// configs
	var configs = w.TALKFUN_SCRIPT_DEPENS || [],
		body = w.document.body,
		// CDN参数
		CUR_STATIC_HOST = cdnQueue[0],
		cdnReg = /(static\-[\d]|static)\.talk-fun\.com/g,
		isDebug = (window.location.href.indexOf("cdnlog=list") > -1),
		protocol = w.document.location.protocol,
		validateFile = protocol + "//"+ cdnQueue[0] + "/t.js",
		
		// timeout setting
		loadFileTimeout = 15000, //15's load file timeout
		loadFileTimer = null, //file[name] timeout object

		// when file load error autoincrease
		execTimes = 0;

	// TALKFUN_CDN_HOST
	// w.TALKFUN_CDN_HOST = cdnQueue[0];

	// hack foreach.
	if(!Array.prototype.forEach){
		Array.prototype.forEach = function(fun) {
			var len = this.length;
			if (typeof fun != "function") throw new TypeError();
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in this) fun.call(thisp, this[i], i, this);
			}
		};
	}

	// Find index form Array.
	var searchIndex = function(sourceAry, target, fun) {
		var len = sourceAry.length;
		if (typeof fun != "function") {
			throw new TypeError()
		};
		for (var i = 0; i < len; i++) {
			if(sourceAry[i] === target){
				fun.call(sourceAry, sourceAry[i], i);
			}
		}
	};

    // HTML Collections => Array.
	var htmlCollectionToArray = function(collections){
		return Array.prototype.slice.call(collections, 0);
	};

	// Replace Resource
	w.TF_getStaticHost = function(res){
		var regx = cdnReg,
			_math = res.match(regx);
		if(_math){
			return res.replace(regx, CUR_STATIC_HOST);
		}else{
			return res;
		}
	};

	// log
	var log = function(){
		if(!isDebug){
			return false;
		}
		var _a = arguments;
		if(w.console){
			console.log.apply(console, arguments);
		}
	};

	// log上报
	var postLog = function(type, data){
		log("Post Log ===> " + data);
		ajax({
			url: protocol + "//log.talk-fun.com/stats.html",
			method: "GET",
			data: {
				"__type": "static",
				"state": type || "",
				"errorfile": data || ""
			}
		});
	};

	// Instance of XHR
	var getXhr = function(){

		// XHR-Object
		var xhrExpose = {
			xhr: null,
			name: null
		};

		// if IE < 10
		var ie = navigator.userAgent.match(/MSIE\s(\d.*?);/i) || null;
		if(ie && ie.length > 0){
			ie = parseInt(ie[1], 10);
		}

		// For IE8 - IE9 cross domain
		if(window.XDomainRequest && ie < 10){
			xhrExpose.xhr = new XDomainRequest();
			xhrExpose.name = "XDomainRequest";
		}

		// For Moden Browser.
		else if(window.XMLHttpRequest){
			xhrExpose.xhr = new XMLHttpRequest();
			xhrExpose.name = "XMLHttpRequest";
		}
		// For IE.
		else if(window.ActiveXObject){
			try {
				xhrExpose.xhr = new ActiveXObject("MSXML2.XMLHTTP.3.0");
				xhrExpose.name = "ActiveXObject";
			}
			catch(ex) {
				return null;
			}
		}
		return xhrExpose;
	}

	// get Ajax Params
	var ajaxOptions = function(options){

		if(!options){
			options = {};
			return false;
		}
		
		// need to this params
		var coreParams = ["url", "method", "timeout", "dataType", "data", "success", "error"];

		// set defaults
		coreParams.forEach(function(key, index){

			// value.
			var value = options[key];
			
			// validate the params.
			switch(key){
				
				// url
				case "url":
					value = (typeof value === "string") ? value : "";
					options[key] = value;
					break;
				
				// method
				case "method":
					value = (typeof value === "string") ? value : "GET";
					options[key] = value;
					break;

				// dataType
				case "dataType":
					value = (typeof value === "string") ? value : null;
					options[key] = value;
					break;

				// timeout
				case "timeout":
					value = parseInt(value, 10) || 0;
					options[key] = value;
					break;
				
				// data - params
				case "data":
					value = (typeof value === "object") ? value : null;
					var objectStrings = "";
					// JSON-Object to SeiralString
					if(value){
						var paramsArray = [],
							_key = "";
						for(var item in value){
							_key = item + "=" + value[item]
							paramsArray.push(_key);
						}
						objectStrings = encodeURI(paramsArray.join("&"));
					}
					// Combine Datas
					// GET.
					if(options.url && options.method.toLowerCase() === "get"){
						var connectSymbol = "?";
						if(options.url.indexOf("?") > -1){
							connectSymbol = "&";
						}
						options.url = options.url + connectSymbol + objectStrings;
					}
					// // POST.
					// else if(options.url && options.method.toLowerCase() === "post"){}
					options[key] = objectStrings;
					break;
				
				// statechange - callbacks
				case "success":
					value = (typeof value === "function") ? value : function(){}
					options[key] = value;
					break;

				case "error":
					value = (typeof value === "function") ? value : function(){}
					options[key] = value;
					break;
			}
		});
		return options;
	};

	/**
	 * @ function ajax
	 * @ajax({
	 *  url: "//test.file",
	 *  method: "GET/POST",
	 *  dataType: "post data type"
	 *  timeout: 1000,
	 *  data: {a:1, b:2, c:3} //Must be Object
	 *  
	 * })
	 */
	var ajax = function(options){
		
		// Reset Options
		options = ajaxOptions(options);
		
		// Get XMLHttpRequest / ActiveXObject
		var XHR = getXhr(),
			xmlHttp = XHR.xhr,
			xhrName = XHR.name;

		// ResponeType Setting
		if(options.dataType){
			xmlHttp.responeType = options.dataType;
		}
		
		// xmlHttp.open
		xmlHttp.open(options.method, options.url, true);

		// Timeout Setting
		xmlHttp.timeout = options.timeout;

		// Different Of [GET / POST]
		if(options.method.toLowerCase() === "post"){
			if(xmlHttp.setRequestHeader){
				xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			xmlHttp.send(options.data);
		}
		// GET => data
		else{
			// fire.
			xmlHttp.send(null);
		}

		// Different of XHR-Callbacks
		// API => https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
		if(xhrName === "XMLHttpRequest"){
			
			// timeout
			// xmlHttp.addEventListener("timeout", function(){}, false);

			// Request onreadystatechange
			xmlHttp.onreadystatechange = function() {
				/**
					ReadyState
					================
					0: 请求未初始化
					1: 服务器连接已建立
					2: 请求已接收
					3: 请求处理中
					4: 请求已完成，且响应已就绪
				*/
				if (xmlHttp.readyState === 4) {
					// todo...
					if (xmlHttp.status >= 200 && xmlHttp.status < 400) {
						options.success.call(null, xmlHttp);
					} else {
						options.error.call(null, xmlHttp);
					}
				} else {
					// todo...
				}
			};

		}
		// XDomainRequest || ActiveXObject
		// API => https://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx#events
		else{
			xmlHttp.onload = function(res){
				options.success.call(null, xmlHttp);
			}
			xmlHttp.onerror = function(res){
				options.error.call(null, xmlHttp);
			}
		}
	}

	// TalkFun 资源加载器
	var depens = {},
		fileQueues = [],
		loadError = false,
		loadFileTimer = {},
		tryTimes = 0;

	if(isDebug){
		window.loadFileTimer = loadFileTimer;
		window.tryTimes = tryTimes;
		window.fileQueues = fileQueues;
	}

	// get correct host
	var getHostPath = function(url){
		return url.match(cdnReg)[0];
	};

	// 文件相应timeout计时
	var setAppendTimeout = function(name, timeoutCallback){
		log("Do timeout job ==> " + name);
		if(!loadFileTimer[name]){
			// return;
			loadFileTimer[name] = setTimeout(function(){
				log("load file timeout...");
				timeoutCallback();
			}, loadFileTimeout);
		}
	};

	// 当文件触发Error事件, 不读取超时(因为文件会先进入重试机制)
	var clearTimeoutSetter = function(name){
		if(loadFileTimer[name]){
			log("clear Timeout job ==> ", name);
			clearTimeout(loadFileTimer[name]);
			loadFileTimer[name] = null;
		}
	};

	// 错误尝试下一项
	var tryNextOne = function(errSrc, sourceArg, el, callback, errorType, elOnloadCallback, fileAttrs){

		// todo queue max length...
		log("Error-Source ==> " + errSrc +" => ("+errorType+")");

		// 清空超时计算
		clearTimeoutSetter(errSrc);
		
		// removeChild
		if(el.parentNode){
			el.removeEventListener("load", elOnloadCallback);
			el.parentNode.removeChild(el);
		}

		// 把解析错误的 host 从 cdn 队列里剔除
		var host = getHostPath(errSrc);
		if(host){
			searchIndex(cdnQueue, host, function(value, index){
				log("Delete CDN-HOST item ==> " + value);
				cdnQueue.splice(index, 1);
			});
		}

		// static-hosts 列表全部重试完毕, 执行退出且抛出异常
		if(cdnQueue.length === 0){
			doExit(callback, errorType);
			return false;
		}

		// 从首个开始调用
		var nextSource = "";
		nextSource = errSrc.replace(cdnReg, cdnQueue[0]);

		// 调用 插入js/css 方法本身(替换资源 host)
		setTimeout(function(){
			sourceArg.callee(nextSource, callback, fileAttrs);
			log("try next one ==> " + nextSource);
		}, 100);

		// Post Error Log
		postLog(errorType, errSrc);

	};

	// 退出
	var doExit = function(callback, errorType){
		if(typeof callback === "function"){
			var errorObject = {
				type: errorType,
				msg: "资源加载" + (errorType === "error" ? "错误" : "超时")
			}
			callback(null, errorObject);
		}
		log("=====> ##### Resources Load "+errorType+"! ##### <======");
	};

	// get "#attr={JSON-STRING格式}" object
	var getAttrs = function(attrObj){
		log("Attributes ==> ", attrObj);
		if(!attrObj){
			return false;
		}else{
			return attrObj;
		}
	};

	// 插入 .js 文件
	var append_js_file = function(src, cb, fileAttrs){

		var a = arguments,
			js = document.createElement("script");

		// event onload callback
		var onloadFn = function(e){
			cb(src);
		};

		// attrs设置
		var attrs = getAttrs(fileAttrs);
		if(attrs){
			// 设置 Attributes 参数
			var	jsonAttrs = attrs;
			for(var _name in jsonAttrs){
				js.setAttribute(_name, jsonAttrs[_name]);
			}
			// 清空 src => #attrs 参数
			// src = src.replace(attrs.params, "");
		}

		// 设置src
		js.src = src;

		// onload
		js.addEventListener("load", onloadFn, false);

		// // onerror
		js.addEventListener("error", function(e){
			clearTimeoutSetter(src);
			tryNextOne(src, a, js, cb, "error", onloadFn, fileAttrs);
		}, false);

		// append
		document.body.appendChild(js);

		// 超时处理
		setAppendTimeout(src, function(){
			tryNextOne(src, a, js, cb, "timeout", onloadFn, fileAttrs);
		});
	};

	// 插入 .css 文件
	// 因为兼容问题 .css 文件直接插入dom不做检测处理
	var append_css_file = function(src, cb){
		var a = arguments,
			css = document.createElement("link");

		// create LINK
		css.rel = "stylesheet";
		css.type = "text/css";
		css.href = src;

		// // event onload callback
		// var onloadFn = function(e){
		// 	cb(src);
		// };

		// // onload
		// css.addEventListener("load", onloadFn, false);

		// // onerror
		// css.addEventListener("error", function(e){
		// 	clearTimeoutSetter(src);
		// 	tryNextOne(src, a, css, cb, "error", onloadFn);
		// }, false);

		// append
		document.head.appendChild(css);
		cb(src);

		// // 超时处理
		// setAppendTimeout(src, function(){
		// 	tryNextOne(src, a, css, cb, "timeout", onloadFn);
		// });

	};

	// other file
	var append_other_file = function(file, callback){
		callback(file);
	}

    // 成功后内部替换操作
    var doSuccess = function(){

		log("loader on success...");

        // replaces <img> in dom
        var imgs = document.querySelectorAll("img");
        imgs = htmlCollectionToArray(imgs);
        if(imgs.length > 0){
            imgs.forEach(function(e, i){
                if(cdnReg.test(e.src)){
                    var src = e.src;
                    src = src.replace(cdnReg, CUR_STATIC_HOST);
                    e.src = src;
                    log("[#IMG]" + e.src);
                }
            });
        }
    };

	// 分发处理资源
	var fetchFile = function(file, cb){

		log("\n===========> ProcessFile... <=============");
		log(file, "\n\n");


		// 带参数.js/.css文件解析(todo..css)
		// 格式{src: "xxxx", attrs:{xx:xx}}
		if(typeof file === "object" && typeof file.src === "string" && typeof file.attrs === "object"){
			append_js_file(file.src, cb, file.attrs);
		}
		// 普通文件
		else if(typeof file === "string"){
			var fileIs = file.match(/\.js|\.css/i) || null;

			// !not match target
			if(!fileIs){
				append_other_file(file, cb);
			}
			
			// js
			if(fileIs && fileIs[0].indexOf(".js") > -1){
				append_js_file(file, cb);
			}

			// css
			else if(fileIs && fileIs[0].indexOf(".css") > -1){
				append_css_file(file, cb);
			}
		}
	};

	// 执行文件队列
	var fetchFileList = function(fqueue, callback){

		var q = fqueue;
		(function(src){
            var _a = arguments;
			// Do => renderFile(src, cb)
			fetchFile(q[0], function(source, errorDetail){

				// 如果 errorDetail 存在则需要退出
				if(errorDetail){
					callback(errorDetail, null);
					return false;
				}

				// 成功后清空超时的计算
				clearTimeoutSetter(source);

				// 删除已加载的队列
				q.splice(0, 1);

				// 重置加载次数
				tryTimes = 0;

				// execute it when success
				log("[###SUCCESS] ==> " + source);
				log("File-Queue ==> ", q);
				// var p = document.createElement("p");
				// p.innerHTML = source;
				// document.body.appendChild(p);

				// 获取正确资源host
				// if(!this.successOnce){
				if(cdnReg.test(source)){
					w.TALKFUN_STATIC_HOST = getHostPath(source);
					CUR_STATIC_HOST = getHostPath(source);
				}
				// }

				// 全部加载完毕
				if(q.length === 0){
					log("ALL Resource Loaded.");
					// execute callback
					if(typeof callback === "function"){
						callback(null, "success");
					}
                    // call on Success
                    doSuccess();
					return false;
				}

				// 按顺序读取队列文件
				setTimeout(function() {
					// 如有正确资源地址,直接替换
					if(cdnReg.test(q[0]) && CUR_STATIC_HOST){
						q[0] = q[0].replace(cdnReg, CUR_STATIC_HOST);
					}
					_a.callee(q[0]);
				}, 10);
			});
		})(q[0]);
	};

	// 处理资源队列
	var doQusTimer = null;
	var renderFiles  = function(fqueue, callback){
		if(!doQusTimer){
			clearTimeout(doQusTimer);
			doQusTimer = null;
		}
		if(fqueue && fqueue.length > 0){
			fileQueues = fileQueues.concat(fqueue);
		}
		if(!doQusTimer){
			doQusTimer = setTimeout(function(){
				fetchFileList(fileQueues, callback);
			}, 100);
		}
	};

	// loader [], callback
	w.talkfunLoader = {};
	
	// TODO... 串行 | 并行
	w.talkfunLoader.parallel = function(){};

	// 初始化
	w.talkfunLoader.series = function(files, callback){
		var fQueue = files || [];
		fQueue.unshift(validateFile);
		if(fQueue && fQueue.length > 0){
			renderFiles(fQueue, callback);
		}
	};

// end.
})(window);