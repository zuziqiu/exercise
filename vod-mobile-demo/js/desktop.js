/**
 * @name desktop.js
 * @note 桌面分享
 * @author [marko.hoo]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    

    // 聊天模块
    var desktop = {
        onPlay: function () {
            $("#click_play").hide();
        }
    };
    
    // 暴露接口
    module.exports = desktop;
});

