/**
 * 通过侦测微信WeixinJSBridge，触发IOS上video或者audo的播放事件
 * PS: WeixinJSBridge 是 微信开发人员添加的为webView添加的属性
 * WeixinJSBridgeReady事件： 监听WeixinJSBridgeReady事件，WeixinJSBridge加载完毕，触发该事件回调
 * getNetworkType事件： 侦测微信用户处于什么网络状态（WIFI,2G,3G,4G），可以用来ios的video或者audio自动播放
 */
'use strict';
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // CMD
        // console.warn('just support browser environment')
        module.exports = factory()
    } else {
        root.detectiveWxJsBridge = factory()
    }
}(window, function () {
    var global = this

    function invokeGetNetworkType(cb) {
        if (!/MicroMessenger/.test(window.navigator.userAgent)) {
            // console.log('需要在微信环境中使用')
            return false
        }
        var that = this
        if (global && global.WeixinJSBridge) 
        global.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
            cb && cb(that)
        }, false)
    }

    return function detectiveWxJsBridge(cb) {
        // WeixinJSBridge已经加载完成，可直接调用
        if (global && global.WeixinJSBridge && global.WeixinJSBridge.invoke) {
            return invokeGetNetworkType(cb)
        } else {
            // 监听 WeixinJSBridgeReady ,WeixinJSBridge加载完成，执行回调
            document.addEventListener('WeixinJSBridgeReady', function () {
                return invokeGetNetworkType(cb)
            })
        }
    }
}))