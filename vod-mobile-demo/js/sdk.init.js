/**
 * @name sdk.init.js
 * @note 初始化SDK, sdkEventDispatch模块执行具体事件
 * @author [Marko]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {
    
    // SDK核心包
    var SDK = require("SDK");

    // 事件分发
    var sdkEventDispatch = require("./sdk.event.dispatch");

    // tools
    var tools = require("./tools");

    // config
    var config = require("./global.config");

    // 临时白名单配置
    // 白名单配置
	var whiteList = {
		"0": {
			safariOpenVideo: true
		},
        "11273": {
            forceAudio: true,
        },
		"11265": {
			safariOpenVideo: true
		},
        "11335": {
            forceAudio: true
        }
	};

    // 配置数据
	var extConfig = null;

	// 是否存在配置
	if(whiteList[window.partner_id]){
        // 强制音频模式(config.forceAudio)
        if(whiteList[window.partner_id].forceAudio){
            config.forceAudio = true;
            extConfig = whiteList[window.partner_id];
        }
	}else{
        // IOS-10+ 打开视频
        if(tools.getPlatformInfo().partform === "ios" && tools.getPlatformInfo().version > 10){
            whiteList[window.partner_id] = {
                safariOpenVideo: true
            };
            extConfig = whiteList[window.partner_id];
        }
    }

    tools.debug(whiteList[window.partner_id], tools.getPlatformInfo());
   

    // 初始化SDK
    // 读取全局变量 `window.mainConfig.access_token` 获得token
    var HTSDK = {};
    window.HTSDK = HTSDK;
    // has config.
    if(extConfig){
        HTSDK = new MT.SDK.main(window.mainConfig.access_token, extConfig);
        window.HTSDK = HTSDK;
    }
    // without config.
    else{
        HTSDK = new MT.SDK.main(window.mainConfig.access_token);
        window.HTSDK = HTSDK;
    }

    // fire cmd.
    sdkEventDispatch.fire(HTSDK);

    // 暴露
    module.exports = HTSDK;

});










