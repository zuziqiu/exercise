/**
 * @name global.config
 * @note 全局配置
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 全局配置参数
    var config = {
		
        // ====== 基础变量 =======
        modetype: window.modetype,
		access_token: window.access_token,
		pptDisplay: window.pptDisplay,
        sdkVersion: window.sdkVersion,
        
        // ====== 标记变量 =======
		partner_id: window.partner_id, // 合作商id
		screenMode: parseInt(window.screenMode), // [0 => 大] | [1 => 中] | [2 => 小] | [3 => 单摄像头]
		screenLocation: parseInt(window.screenLocation), // 摄像头位置 [@0 => 上 | @1 => 下]
        cameraStatue: "stop", //摄像头的状态, [start / stop]
        switchFlag: (window.screenLocation) === "0" ? true : false, //摄像头 和 PPT区域是否切换
        mediaSwitch: "video", //音频摄像头切换video表示摄像头,audio表示音频
        currentMode: 0,//0课件模式，2桌面分享和插播
        manualClose: false,// 手动关闭摄像头 
        isOpen: true,//摄像头的状态,默认为开,关则为false
        isCompatible: window.location.href.indexOf("compatible=true") > -1 ? true : false, //是否开启兼容模式
        forceAudio: false // 强制语音模式
    };


    // 兼容模式强制切换(摄像头上,PPT下)
    if(config.isCompatible){
        config.screenMode = 0;
        config.screenLocation = 0;   
    }


    // 静态变量
    config.static = {
        "ROOM_MODE_0": 0, // 全摄像头模式
        "ROOM_MODE_1": 1, // 中摄像头模式
        "ROOM_MODE_2": 2, // 小摄像头模式
        "ROOM_MODE_3": 3 //  单摄像头模式(大会直播)
    }

    // 身份昵称
    config.role = {
        user: "学生",
        admin: "助教",
        spadmin: "老师"
    };

    // 暴露接口
    module.exports = config;
});

