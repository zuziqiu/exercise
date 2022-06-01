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
			return arr.join('&')
		}
		/**
		 * @obsoleting 废弃的 用XML插件代替
		 * @param { JSON object } data 需要转换的json对象
		 * @param { boolean } isRoot 是否初始化根路径
		 */
		function json2xml(data, isRoot) {
			var xml = ''
			var tempTag = 'item'

			function convertTag(tagName, closeFlag) {
				return (closeFlag ? '</' : '<') + tagName + '>'
			}
			if (Object.prototype.toString.call(data) === '[object Object]') {
				for (var k in data) {
					if (data.hasOwnProperty(k)) {
						if (Object.prototype.toString.call(data[k]) === '[object Object]') {
							xml += convertTag(k) + json2xml(data[k]) + convertTag(k, true)
						} else if (Object.prototype.toString.call(data[k]) === '[object Array]') {
							// console.log(data[k])
							xml += convertTag(k) + json2xml(data[k]) + convertTag(k, true)
						} else {
							xml += convertTag(k) + (data[k] ? encodeURIComponent(data[k]) : '') + convertTag(k, true)
						}
					}
				}
			} else if (Object.prototype.toString.call(data) === '[object Array]') {
				for (var i = 0; i < data.length; i++) {
					var current = data[i]
					if (typeof current != 'object') {
						xml += convertTag(tempTag + i) + (current ? encodeURIComponent(current) : '') + convertTag(tempTag + i, true)
					} else {
						for (var z in current) {
							if (current.hasOwnProperty(z)) {
								if (Object.prototype.toString.call(current[z]) === '[object Object]') {
									xml += convertTag(z) + json2xml(current[z]) + convertTag(z, true)
								} else if (Object.prototype.toString.call(current) === '[object Array]') {
									xml += convertTag(z) + json2xml(current[z]) + convertTag(z, true)
								} else {
									xml += convertTag(z) + (current[z] ? encodeURIComponent(current[z]) : '') + convertTag(z, true)
								}
							}
						}
					}
				}
			}
			if (isRoot) {
				xml = convertTag('root') + xml + convertTag('root', true)
			}
			return xml
		}
		// objtree  https://github.com/rranauro/ObjTree
		var XML = (function(){
			// ========================================================================
			//  XML.ObjTree -- XML source code from/to JavaScript object like E4X
			// ========================================================================

			if (typeof (XML) == 'undefined') {
				var XML = function () {};
			}

			//  constructor

			XML.ObjTree = function () {
				return this;
			};

			//  class variables

			XML.ObjTree.VERSION = "0.23";

			//  object prototype

			XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
			XML.ObjTree.prototype.attr_prefix = '-';

			//  method: parseXML( xmlsource )

			XML.ObjTree.prototype.parseXML = function (xml) {
				var root;
				if (window.DOMParser) {
					var xmldom = new DOMParser();
					//      xmldom.async = false;           // DOMParser is always sync-mode
					var dom = xmldom.parseFromString(xml, "application/xml");
					if (!dom) return;
					root = dom.documentElement;
				} else if (window.ActiveXObject) {
					xmldom = new ActiveXObject('Microsoft.XMLDOM');
					xmldom.async = false;
					xmldom.loadXML(xml);
					root = xmldom.documentElement;
				}
				if (!root) return;
				return this.parseDOM(root);
			};

			//  method: parseHTTP( url, options, callback )

			XML.ObjTree.prototype.parseHTTP = function (url, options, callback) {
				var myopt = {};
				for (var key in options) {
					myopt[key] = options[key]; // copy object
				}
				if (!myopt.method) {
					if (typeof (myopt.postBody) == "undefined" &&
						typeof (myopt.postbody) == "undefined" &&
						typeof (myopt.parameters) == "undefined") {
						myopt.method = "get";
					} else {
						myopt.method = "post";
					}
				}
				if (callback) {
					myopt.asynchronous = true; // async-mode
					var __this = this;
					var __func = callback;
					var __save = myopt.onComplete;
					myopt.onComplete = function (trans) {
						var tree;
						if (trans && trans.responseXML && trans.responseXML.documentElement) {
							tree = __this.parseDOM(trans.responseXML.documentElement);
						}
						__func(tree, trans);
						if (__save) __save(trans);
					};
				} else {
					myopt.asynchronous = false; // sync-mode
				}
				var trans;
				if (typeof (HTTP) != "undefined" && HTTP.Request) {
					myopt.uri = url;
					var req = new HTTP.Request(myopt); // JSAN
					if (req) trans = req.transport;
				} else if (typeof (Ajax) != "undefined" && Ajax.Request) {
					var req = new Ajax.Request(url, myopt); // ptorotype.js
					if (req) trans = req.transport;
				}
				if (callback) return trans;
				if (trans && trans.responseXML && trans.responseXML.documentElement) {
					return this.parseDOM(trans.responseXML.documentElement);
				}
			}

			//  method: parseDOM( documentroot )

			XML.ObjTree.prototype.parseDOM = function (root) {
				if (!root) return;

				this.__force_array = {};
				if (this.force_array) {
					for (var i = 0; i < this.force_array.length; i++) {
						this.__force_array[this.force_array[i]] = 1;
					}
				}

				var json = this.parseElement(root); // parse root node
				if (this.__force_array[root.nodeName]) {
					json = [json];
				}
				if (root.nodeType != 11) { // DOCUMENT_FRAGMENT_NODE
					var tmp = {};
					tmp[root.nodeName] = json; // root nodeName
					json = tmp;
				}
				return json;
			};

			//  method: parseElement( element )

			XML.ObjTree.prototype.parseElement = function (elem) {
				//  COMMENT_NODE
				if (elem.nodeType == 7) {
					return;
				}

				//  TEXT_NODE CDATA_SECTION_NODE
				if (elem.nodeType == 3 || elem.nodeType == 4) {
					var bool = elem.nodeValue.match(/[^\x00-\x20]/);
					if (bool == null) return; // ignore white spaces
					return elem.nodeValue;
				}

				var retval;
				var cnt = {};

				//  parse attributes
				if (elem.attributes && elem.attributes.length) {
					retval = {};
					for (var i = 0; i < elem.attributes.length; i++) {
						var key = elem.attributes[i].nodeName;
						if (typeof (key) != "string") continue;
						var val = elem.attributes[i].nodeValue;
						if (!val) continue;
						key = this.attr_prefix + key;
						if (typeof (cnt[key]) == "undefined") cnt[key] = 0;
						cnt[key]++;
						this.addNode(retval, key, cnt[key], val);
					}
				}

				//  parse child nodes (recursive)
				if (elem.childNodes && elem.childNodes.length) {
					var textonly = true;
					if (retval) textonly = false; // some attributes exists
					for (var i = 0; i < elem.childNodes.length && textonly; i++) {
						var ntype = elem.childNodes[i].nodeType;
						if (ntype == 3 || ntype == 4) continue;
						textonly = false;
					}
					if (textonly) {
						if (!retval) retval = "";
						for (var i = 0; i < elem.childNodes.length; i++) {
							retval += elem.childNodes[i].nodeValue;
						}
					} else {
						if (!retval) retval = {};
						for (var i = 0; i < elem.childNodes.length; i++) {
							var key = elem.childNodes[i].nodeName;
							if (typeof (key) != "string") continue;
							var val = this.parseElement(elem.childNodes[i]);
							if (!val) continue;
							if (typeof (cnt[key]) == "undefined") cnt[key] = 0;
							cnt[key]++;
							this.addNode(retval, key, cnt[key], val);
						}
					}
				}
				return retval;
			};

			//  method: addNode( hash, key, count, value )

			XML.ObjTree.prototype.addNode = function (hash, key, cnts, val) {
				if (this.__force_array[key]) {
					if (cnts == 1) hash[key] = [];
					hash[key][hash[key].length] = val; // push
				} else if (cnts == 1) { // 1st sibling
					hash[key] = val;
				} else if (cnts == 2) { // 2nd sibling
					hash[key] = [hash[key], val];
				} else { // 3rd sibling and more
					hash[key][hash[key].length] = val;
				}
			};

			//  method: writeXML( tree )

			XML.ObjTree.prototype.writeXML = function (tree) {
				var xml = this.hash_to_xml(null, tree);
				return this.xmlDecl + xml;
			};

			//  method: hash_to_xml( tagName, tree )

			XML.ObjTree.prototype.hash_to_xml = function (name, tree) {
				var elem = [];
				var attr = [];
				for (var key in tree) {
					if (!tree.hasOwnProperty(key)) continue;
					var val = tree[key];
					if (key.charAt(0) != this.attr_prefix) {
						if (typeof (val) == "undefined" || val == null) {
							elem[elem.length] = "<" + key + " />";
						} else if (typeof (val) == "object" && val.constructor == Array) {
							elem[elem.length] = this.array_to_xml(key, val);
						} else if (typeof (val) == "object") {
							elem[elem.length] = this.hash_to_xml(key, val);
						} else {
							elem[elem.length] = this.scalar_to_xml(key, val);
						}
					} else {
						attr[attr.length] = " " + (key.substring(1)) + '="' + (this.xml_escape(val)) + '"';
					}
				}
				var jattr = attr.join("");
				var jelem = elem.join("");
				if (typeof (name) == "undefined" || name == null) {
					// no tag
				} else if (elem.length > 0) {
					if (jelem.match(/\n/)) {
						jelem = "<" + name + jattr + ">\n" + jelem + "</" + name + ">\n";
					} else {
						jelem = "<" + name + jattr + ">" + jelem + "</" + name + ">\n";
					}
				} else {
					jelem = "<" + name + jattr + " />\n";
				}
				return jelem;
			};

			//  method: array_to_xml( tagName, array )

			XML.ObjTree.prototype.array_to_xml = function (name, array) {
				var out = [];
				for (var i = 0; i < array.length; i++) {
					var val = array[i];
					if (typeof (val) == "undefined" || val == null) {
						out[out.length] = "<" + name + " />";
					} else if (typeof (val) == "object" && val.constructor == Array) {
						out[out.length] = this.array_to_xml(name, val);
					} else if (typeof (val) == "object") {
						out[out.length] = this.hash_to_xml(name, val);
					} else {
						out[out.length] = this.scalar_to_xml(name, val);
					}
				}
				return out.join("");
			};

			//  method: scalar_to_xml( tagName, text )

			XML.ObjTree.prototype.scalar_to_xml = function (name, text) {
				if (name == "#text") {
					return this.xml_escape(text);
				} else {
					return "<" + name + ">" + this.xml_escape(text) + "</" + name + ">\n";
				}
			};

			//  method: xml_escape( text )

			XML.ObjTree.prototype.xml_escape = function (text) {
				return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			};
			
			return XML
			/*
			// ========================================================================

			=head1 NAME

			XML.ObjTree -- XML source code from/to JavaScript object like E4X

			=head1 SYNOPSIS

				var xotree = new XML.ObjTree();
				var tree1 = {
						root: {
								node: "Hello, World!"
						}
				};
				var xml1 = xotree.writeXML( tree1 );        // object tree to XML source
				alert( "xml1: "+xml1 );

				var xml2 = '<?xml version="1.0"?><response><error>0</error></response>';
				var tree2 = xotree.parseXML( xml2 );        // XML source to object tree
				alert( "error: "+tree2.response.error );

			=head1 DESCRIPTION

			XML.ObjTree class is a parser/generater between XML source code
			and JavaScript object like E4X, ECMAScript for XML.
			This is a JavaScript version of the XML::TreePP module for Perl.
			This also works as a wrapper for XMLHTTPRequest and successor to JKL.ParseXML class
			when this is used with prototype.js or JSAN's HTTP.Request class.

			=head2 JavaScript object tree format

			A sample XML source:

				<?xml version="1.0" encoding="UTF-8"?>
				<family name="Kawasaki">
						<father>Yasuhisa</father>
						<mother>Chizuko</mother>
						<children>
								<girl>Shiori</girl>
								<boy>Yusuke</boy>
								<boy>Kairi</boy>
						</children>
				</family>

			Its JavaScript object tree like JSON/E4X:

				{
						'family': {
								'-name':    'Kawasaki',
								'father':   'Yasuhisa',
								'mother':   'Chizuko',
								'children': {
										'girl': 'Shiori'
										'boy': [
												'Yusuke',
												'Kairi'
										]
								}
						}
				};

			Each elements are parsed into objects:

				tree.family.father;             # the father's given name.

			Prefix '-' is inserted before every attributes' name.

				tree.family["-name"];           # this family's family name

			A array is used because this family has two boys.

				tree.family.children.boy[0];    # first boy's name
				tree.family.children.boy[1];    # second boy's name
				tree.family.children.girl;      # (girl has no other sisiters)

			=head1 METHODS

			=head2 xotree = new XML.ObjTree()

			This constructor method returns a new XML.ObjTree object.

			=head2 xotree.force_array = [ "rdf:li", "item", "-xmlns" ];

			This property allows you to specify a list of element names
			which should always be forced into an array representation.
			The default value is null, it means that context of the elements
			will determine to make array or to keep it scalar.

			=head2 xotree.attr_prefix = '@';

			This property allows you to specify a prefix character which is
			inserted before each attribute names.
			Instead of default prefix '-', E4X-style prefix '@' is also available.
			The default character is '-'.
			Or set '@' to access attribute values like E4X, ECMAScript for XML.
			The length of attr_prefix must be just one character and not be empty.

			=head2 tree = xotree.parseXML( xmlsrc );

			This method loads an XML document using the supplied string
			and returns its JavaScript object converted.

			=head2 tree = xotree.parseDOM( domnode );

			This method parses a DOM tree (ex. responseXML.documentElement)
			and returns its JavaScript object converted.

			=head2 tree = xotree.parseHTTP( url, options );

			This method loads a XML file from remote web server
			and returns its JavaScript object converted.
			XMLHTTPRequest's synchronous mode is always used.
			This mode blocks the process until the response is completed.

			First argument is a XML file's URL
			which must exist in the same domain as parent HTML file's.
			Cross-domain loading is not available for security reasons.

			Second argument is options' object which can contains some parameters:
			method, postBody, parameters, onLoading, etc.

			This method requires JSAN's L<HTTP.Request> class or prototype.js's Ajax.Request class.

			=head2 xotree.parseHTTP( url, options, callback );

			If a callback function is set as third argument,
			XMLHTTPRequest's asynchronous mode is used.

			This mode calls a callback function with XML file's JavaScript object converted
			after the response is completed.

			=head2 xmlsrc = xotree.writeXML( tree );

			This method parses a JavaScript object tree
			and returns its XML source generated.

			=head1 EXAMPLES

			=head2 Text node and attributes

			If a element has both of a text node and attributes
			or both of a text node and other child nodes,
			text node's value is moved to a special node named "#text".

				var xotree = new XML.ObjTree();
				var xmlsrc = '<span class="author">Kawasaki Yusuke</span>';
				var tree = xotree.parseXML( xmlsrc );
				var class = tree.span["-class"];        # attribute
				var name  = tree.span["#text"];         # text node

			=head2 parseHTTP() method with HTTP-GET and sync-mode

			HTTP/Request.js or prototype.js must be loaded before calling this method.

				var xotree = new XML.ObjTree();
				var url = "http://example.com/index.html";
				var tree = xotree.parseHTTP( url );
				xotree.attr_prefix = '@';                   // E4X-style
				alert( tree.html["@lang"] );

			This code shows C<lang=""> attribute from a X-HTML source code.

			=head2 parseHTTP() method with HTTP-POST and async-mode

			Third argument is a callback function which is called on onComplete.

				var xotree = new XML.ObjTree();
				var url = "http://example.com/mt-tb.cgi";
				var opts = {
						postBody:   "title=...&excerpt=...&url=...&blog_name=..."
				};
				var func = function ( tree ) {
						alert( tree.response.error );
				};
				xotree.parseHTTP( url, opts, func );

			This code send a trackback ping and shows its response code.

			=head2 Simple RSS reader

			This is a RSS reader which loads RDF file and displays all items.

				var xotree = new XML.ObjTree();
				xotree.force_array = [ "rdf:li", "item" ];
				var url = "http://example.com/news-rdf.xml";
				var func = function( tree ) {
						var elem = document.getElementById("rss_here");
						for( var i=0; i<tree["rdf:RDF"].item.length; i++ ) {
								var divtag = document.createElement( "div" );
								var atag = document.createElement( "a" );
								atag.href = tree["rdf:RDF"].item[i].link;
								var title = tree["rdf:RDF"].item[i].title;
								var tnode = document.createTextNode( title );
								atag.appendChild( tnode );
								divtag.appendChild( atag );
								elem.appendChild( divtag );
						}
				};
				xotree.parseHTTP( url, {}, func );

			=head2  XML-RPC using writeXML, prototype.js and parseDOM

			If you wish to use prototype.js's Ajax.Request class by yourself:

				var xotree = new XML.ObjTree();
				var reqtree = {
						methodCall: {
								methodName: "weblogUpdates.ping",
								params: {
										param: [
												{ value: "Kawa.net xp top page" },  // 1st param
												{ value: "http://www.kawa.net/" }   // 2nd param
										]
								}
						}
				};
				var reqxml = xotree.writeXML( reqtree );       // JS-Object to XML code
				var url = "http://example.com/xmlrpc";
				var func = function( req ) {
						var resdom = req.responseXML.documentElement;
						xotree.force_array = [ "member" ];
						var restree = xotree.parseDOM( resdom );   // XML-DOM to JS-Object
						alert( restree.methodResponse.params.param.value.struct.member[0].value.string );
				};
				var opt = {
						method:         "post",
						postBody:       reqxml,
						asynchronous:   true,
						onComplete:     func
				};
				new Ajax.Request( url, opt );

			=head1 AUTHOR

			Yusuke Kawasaki http://www.kawa.net/

			=head1 COPYRIGHT AND LICENSE

			Copyright (c) 2005-2006 Yusuke Kawasaki. All rights reserved.
			This program is free software; you can redistribute it and/or
			modify it under the Artistic license. Or whatever license I choose,
			which I will do instead of keeping this documentation like it is.

			=cut
			// ========================================================================
			*/
		}())

		/**
		 * 
		 * @param { Object } options ajax相关参数
		 */
		function ajaxs(options) {
			if (Object.prototype.toString.call(options) !== '[object Object]') {
				throw new Error('should passed an object.')
			}
			var abortTimer = null
			var xotree

			// 设置 请求的默认值
			var defaults = {
				url: '',
				type: 'get',
				dataType: 'json',
				data: {},
				timeout: 0,
				// 设置cors时发送cookie到服务器, 默认false不发送
				// withCredentials: false,

				// 设置jsonp跨域时 ?callback=fdsfs2313 的 callback 名字部分
				// jsonp: 'jsonp'

				// 设置jsonp的 回调函数的名字
				// jsonpCallback: 'tf_' + math.random()

				// true，异步
				async: true,

				// beforeSend中 显式 return false 可以中断ajax发送 (=== 强等)
				beforeSend: function (xhr) {
					return xhr
				},
				success: function () {},
				error: function () {}
			}

			// 把传入的参数拷贝进默认defaults
			defaults = extend(defaults, options)

			// console.log(defaults)
			// 请求类型
			var type = defaults.type.toLowerCase()

			// 请求地址
			var url = defaults.url

			//  请求的数据类型 json, jsonp ,xml ,html,text
			var dataType = defaults.dataType.toLowerCase()

			// 发送请求的数据
			var data = defaults.data

			// 是否发送同步请求 默认 false 异步
			var async = defaults.async

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
				var s = document.createElement('script')
				var dhead = document.getElementsByTagName('head')[0]

				// s.onload = function() {
				//   this.parentNode.removeChild(this)
				// }
				s.onerror = function () {
					throw new Error('script onerror: jsonp请求发送失败')
				}
				dhead.appendChild(s)

				// 设置回调函数
				window[jsonpCallback] = function (data) {
					clearTimeout(s.timer)
					dhead.removeChild(s)
					window[jsonpCallback] = null
					defaults.success && defaults.success(data)
				}
				s.src = url
				if (defaults.timeout) {
					s.timer = setTimeout(function () {
						dhead.removeChild(s)
						window[jsonpCallback] = null
						defaults.error && defaults.error({
							message: 'jsonp request timeout'
						})
					}, timeout)
				}

				// XMLHttpRequest
			} else {

				// 非IE6
				if (window.XMLHttpRequest) {
					var xhr = new XMLHttpRequest();
				} else {

					// IE6及其以下版本浏览器
					var xhr = new ActiveXObject('Microsoft.XMLHTTP');
				}

				// 设置 回调
				xhr.onreadystatechange = function () {
					var xmlDoc
					var data
					var status

					// 设置回调
					if (xhr.readyState === 1) {
						if (!abortTimer && timeout > 0) {
							abortTimer = setTimeout(function() {
								xhr.abort()
							}, timeout)
						}
					}
					if (xhr.readyState === 4) {
						status = xhr.status;
						if (status >= 200 && status < 300) {
							clearTimeout(abortTimer)
							abortTimer = null
							// 返回json对象
							if (dataType === 'json') {
								if (typeof xhr.responseText === 'object') {
									data = xhr.responseText
								} else {
									try {
										if (JSON.parse) {
											data = JSON.parse(xhr.responseText)
										} else {
											data = eval("(" + xhr.responseText + ")")
										}
									} catch (e) {
	
										// modern browser
										if (window.DOMParser) {
											xmlDoc = new window.DOMParser().parseFromString(xhr.responseText, 'text/xml')
											
											// firefox opera
										} else if (document.implementation.createDocument) {
											xmlDoc = document.implementation.createDocument("", "", null);
											xmlDoc.async = false;
											xmlDoc.load(xhr.responseText);
										} else {
	
											// ie low version
											xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
											xmlDoc.async = false;
											xmlDoc.loadXML(xhr.responseText);
										}
										if (!xotree) {
											xotree = new XML.ObjTree()
										}
	
										// xmlDOC是文档片段 需使用 documentElement
										data = xotree.parseDOM(xmlDoc.documentElement)
									}
								}

							// 返回 xml 格式的文档 用数组作为根节点的json对象转换成xml结构的事后，数组索引作为了xml的标签，在xml结构中，是语法错误
							} else if (dataType === 'xml') {
								if (xhr.responseXML) {
									data = xhr.responseXML
									if (data.documentElement) {
										data = data.documentElement
									}
								} else {
									try {

										// 数据是json的情况
										data = JSON.parse(xhr.responseText)
										if (!xotree) {
											xotree = new XML.ObjTree()
										}
										data = xotree.writeXML(data)
									} catch(e) {
										if (window.DOMParser) {
											xmlDoc = new window.DOMParser().parseFromString(xhr.responseText, 'text/xml')
											
											// firefox opera
										} else if (document.implementation.createDocument) {
											xmlDoc = document.implementation.createDocument("", "", null);
											xmlDoc.async = false;
											xmlDoc.load(xhr.responseText);
										} else {
	
											// ie low version
											xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
											xmlDoc.async = false;
											xmlDoc.loadXML(xhr.responseText);
										}
										data = xmlDoc.documentElement
									}
								}
							} else {

								// 纯文本之类的
								data = xhr.responseText
							}
							options.success && options.success(data);
						} else {
							options.error && options.error(status);
						}
					}
				}

				if (type === 'get') {
					if (url.lastIndexOf('?') > -1) {
						url = url + '&' + formatParam(data)
					} else {
						url = url + '?' + formatParam(data)
					}

					// open
					xhr.open(type, url, async)
					if ((defaults.beforeSend && defaults.beforeSend(xhr)) === false) {
						xhr = null
						return false
					}
					xhr.send(null)
				} else if (type === 'post') {

					// post提交设置请求头
					// open
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
					xhr.send(JSON.stringify(data))
				}
			}
		}
		return ajaxs
	}())
}))


// console.log(json2xml(a, true))
// json2xml(a)