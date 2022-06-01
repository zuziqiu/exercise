"use strict";!function(root,factory){"function"==typeof define&&define.amd?define([],factory()):"object"==typeof exports?module.exports=factory():root.IframePostMessage=factory()}(this,function(){var IframePostMessage=function(options){if("[object Object]"!==Object.prototype.toString.call(options))throw new Error("options参数应该为一个对象");if(options.attrs&&"[object Object]"!==Object.prototype.toString.call(options.attrs))throw new Error("attrs属性应该为一个对象");this._queue=[],this.targetUrl=options.targetUrl,this.iframeName=options.iframeName||"talkfun_connector",this.iframeId="talkfun_connector",this.insert=options.insert instanceof HTMLElement?options.insert:document.body,this.attrs=options.attrs||{},this.cb=options.load||function(){},this._timer=null,this._hasListened=!1,this._init(this.cb)};return IframePostMessage.prototype._init=function(cb){this._createIframe(cb)},IframePostMessage.prototype._createIframe=function(cb){var ifr=document.createElement("iframe");ifr.name=this.iframeName,ifr.id=this.iframeId;for(var k in this.attrs)ifr.setAttribute(k,this.attrs[k]);this.iframeName=ifr.name,this.iframeId=ifr.id?ifr.id:this.iframeId,ifr.src=this.targetUrl,ifr.onload=function(e){cb&&cb(e)},ifr.onerror=function(e){cb&&cb(e)},document.getElementById(this.iframeId)||this.insert.appendChild(ifr)},IframePostMessage.prototype._handleParams=function(cmd,msg){return arguments.length<=1?console.error("请输入指令和消息"):"string"!=typeof cmd?console.log("第一个参数为指令且为字符串形式"):JSON.stringify({cmd:cmd,msg:msg})},IframePostMessage.prototype._handleReceivedParams=function(str){var msg,obj=JSON.parse(str);try{msg=JSON.parse(obj.msg)}catch(e){msg=obj.msg}return{cmd:obj.cmd,msg:msg}},IframePostMessage.prototype.sendMessage=function(cmd,msg){var that=this;this._queue.push(this._handleParams(cmd,msg)),this._timer||(this._timer=setInterval(function(){if(0===that._queue.length)return clearInterval(that._timer),that._timer=null,!1;window.frames[that.iframeName].postMessage(that._queue.shift(),"*")},100))},IframePostMessage.prototype.receiveMessage=function(cb){var that=this;return this._hasListened||(window.attachEvent?window.attachEvent("onmessage",function(e){cb&&cb.call(that,that._handleReceivedParams(e.data))}):window.addEventListener("message",function(e){cb&&cb.call(that,that._handleReceivedParams(e.data))}),this._hasListened=!0),this},IframePostMessage});