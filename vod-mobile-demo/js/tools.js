/**
 * @ => Tools for Vod-H5
 * @ => Marko.
 */
define(function(require, exports, module){
    
    // tools
    var tools = {
        
        // isDebug?
        isDebug: window.location.href.indexOf("vodlog=list") > -1 ? true : false,

        // log.
        log: function(){
            if(!this.isDebug){
                return false;
            }
            // Array.prototype.push.apply(c, arguments);
            if(window.console){
                window.console.log.apply(console, arguments);
            }
        },
        // copy -> log.
        debug: function(){
            if(!this.isDebug){
                return false;
            }
            var that = this;
            // console.info(arguments);
            // that.log.call(this, arguments);
            if(window.console){
                window.console.log.apply(console, arguments);
            }
        },
        // get platform Name. & version.
        getPlatformInfo: function(){
            
            // UA
            var ua = navigator.userAgent.toLowerCase(),
                os = null,
                version = -1,
                isIOS = ua.match(/iphone|ipad|ipod/ig) || false,
                isAndroid = ua.match(/android/ig) || false;
            
            // IOS
            if(isIOS){
                os = "ios";
                version = ua.match(/os\s([0-9_0-9]*)/)[1].replace("_", ".");
            }
            // Android
            else if(isAndroid){
                os = "android";
                version = ua.match(/android\s([0-9\.]*)/)[1];
            }

            // exports
            return {
                partform: os,
                version: parseFloat(version)
            }
        },

        // WeChat
        isWechat: function(){
            var ua = navigator.userAgent;
                isInWechat = ua.match(/micromessenger/ig);
            if(isInWechat){
                return true;
            }else{
                return false;
            }
        },

        // IOS.
        isIos: function(){
            if(this.getPlatformInfo().partform === "ios"){
                return true;
            }else{
                return false;
            }
        },

        // Android.
        isAndroid: function(){
            if(this.getPlatformInfo().partform === "android"){
                return true;
            }else{
                return false;
            }
        },

        // QQ
        isQQBrowser: function(){
            var ua = navigator.userAgent;
                isInWechat = ua.match(/mqqbrowser/ig);
            if(isInWechat){
                return true;
            }else{
                return false;
            }
        }
    };
    module.exports = tools;
});