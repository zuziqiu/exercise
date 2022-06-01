'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory());
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.IframePostMessage = factory();
    }
}(this, function () {
    //    methods
    var IframePostMessage = function(options){

    if(Object.prototype.toString.call(options) !== '[object Object]') {
        throw new Error('options参数应该为一个对象');
    }
    if(options.attrs && Object.prototype.toString.call(options.attrs) !== '[object Object]') {
        throw new Error('attrs属性应该为一个对象');
    }
    // if(!options.targetUrl) {
    //     throw new Error('targetUrl为必须字段');
    // }
    // if(attrs) {
    //     if(typeof attrs === 'function'){
    //         cb = attrs;
    //         attrs = {};
    //     }else if(Object.prototype.toString.call(attrs) !== '[object Object]'){
    //         throw new Error('attrs应该为一个对象');
    //     }
    // }

    this._queue = [];

    //子iframe通信地址，必须
    this.targetUrl = options.targetUrl;
    //iframe ID和name
    this.iframeName = options.iframeName || 'talkfun_connector';
    this.iframeId = 'talkfun_connector';
    //插入点，dom对象,默认 body
    this.insert = options.insert instanceof HTMLElement ? options.insert : document.body;
    //属性
    this.attrs = options.attrs || {};
    this.cb = options.load || function(){};

    this._timer = null;
    this._hasListened = false;
    this._init(this.cb);
}

//初始化执行创建iframe方法
IframePostMessage.prototype._init = function(cb){
    this._createIframe(cb);
}

//创建iframe
IframePostMessage.prototype._createIframe = function(cb){
    var ifr = document.createElement('iframe');
    ifr.name = this.iframeName;
    ifr.id = this.iframeId;
    for(var k in this.attrs) {
        ifr.setAttribute(k,this.attrs[k])
    }
    //重新赋值，防止attrs定义了name属性，两个值不匹配
    this.iframeName = ifr.name;
    this.iframeId = ifr.id ? ifr.id : this.iframeId;

    ifr.src = this.targetUrl;
    ifr.onload = function(e){
        cb && cb(e);
    }
    ifr.onerror = function(e){
        cb && cb(e)
    }
    if(!document.getElementById(this.iframeId)) {
        this.insert.appendChild(ifr);
    }
}

IframePostMessage.prototype._handleParams = function(cmd,msg){
    //参数小于2个
    if(arguments.length <= 1) return console.error('请输入指令和消息');

    if(typeof cmd !== 'string') return console.log('第一个参数为指令且为字符串形式');

    return JSON.stringify({cmd:cmd,msg:msg});
}

//处理接受到的参数
IframePostMessage.prototype._handleReceivedParams = function(str){
    var obj = JSON.parse(str)
    var msg ;
    try{
        msg = JSON.parse(obj.msg)
    }catch(e){
        msg = obj.msg
    }
    return {
        cmd : obj.cmd,
        msg : msg
    }
}

IframePostMessage.prototype.sendMessage = function(cmd,msg){
    var that = this;
    this._queue.push(this._handleParams(cmd,msg))

    if(!this._timer) {
        this._timer = setInterval(function(){
            if(that._queue.length === 0) {
                clearInterval(that._timer);
                that._timer = null;
                return false;
            }
            window.frames[that.iframeName].postMessage(that._queue.shift(),"*");
        },100)
    }
}

IframePostMessage.prototype.receiveMessage = function(cb){
    var that = this;
    if(!this._hasListened) {
        if(window.attachEvent) {
            window.attachEvent('onmessage',function(e){
                cb && cb.call(that,that._handleReceivedParams(e.data))
            });
        }else {
            window.addEventListener('message',function(e){
                cb && cb.call(that,that._handleReceivedParams(e.data))
            });
        }
        this._hasListened = true;
    }
    return this;
}

    //    exposed public method
    return IframePostMessage;
}));





