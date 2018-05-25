/**
 * @name sdk.init.js
 * @note 初始化SDK, sdkEventDispatch模块执行具体事件
 * @author [Marko]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {
    
    // 全局基础显示配置
    var config = require("./global.config"),
        // SDK核心包
        SDK = require("SDK"),
        // 事件分发
        sdkEventDispatch = require("./sdk.event.dispatch"),
        // 初始化SDK
        HTSDK = {};

    // 有配置, 没配置
    if(config.extConfig){
        HTSDK = new MT.SDK.main(window.access_token, config.extConfig);
    }else{
        HTSDK = new MT.SDK.main(window.access_token);
    }

    // 启动事件监听
    sdkEventDispatch.fire(HTSDK);

    // 暴露
    module.exports = HTSDK;

});










