/**
 * @name global.config
 * @note 全局配置
 * @author [liangh, Marko.]
 * @version [v1.2.1]
 */
define(function(require, exports, module) {
    
    // 全局配置参数
    var config = {
        // 模式配置
        static: {
            ROOM_MODE_0: 0,
            ROOM_MODE_1: 1,
            ROOM_MODE_2: 2
        },
		modetype: window.modetype, //房间模式 1,2,3
		access_token: window.access_token, //验证key
		pptDisplay: window.pptDisplay, //?
		partner_id: window.partner_id, // 合作商ID
        screenMode: 0, // 摄像头大小设置 [0 => 大尺寸] [1 => 中尺寸] [2 => 小尺寸]
		screenLocation: window.screenLocation, // 摄像头显示位置 [1 => 下] [0 => 上]
		sdkVersion: window.sdkVersion, //当前 *.sdk 版本
        cameraStatue: "wait", // 摄像头的状态,start为开启
        switchFlag: (window.screenLocation) === "0" ? true : false, // (PPT & 视频)区域是否切换，true 为切换
        mediaSwitch: "video", // 音频摄像头切换video表示摄像头,audio表示音频
        currentMode: 0,// 0课件模式，2桌面分享和插播
        forceAudio: false, //是否强制开启语音模式
        isOpen: true,//摄像头的状态,默认为开true,关闭则为false;
        extConfig: null, //扩展配置参数]
        rotation: null, //旋转
        isRender: false,//模板是否加载完
        isCompatible: (window.location.href.match(/compatible=true/ig)) ? true : false, //是否开启兼容模式(解决安卓微信自动全屏问题)
        isShowCompatible: false //是否符合开启兼容模式?
    };

    // 暴露: config
    module.exports = config;

});

