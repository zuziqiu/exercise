/*
 * @Author:lianghua
 * @Date: 2018-03-20 14:19:19 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-03-21 14:08:45
 */
define(function(require, exports, module) {
    var TMOD = require("TMOD");
    var plugins = require('./plugins');
    var congif = require('./global.config');
    var h5player = {
        //倍速盒子显示与否标志
        isSpeedTypeBoxShow : false,

        // 倍速播放开关
        playRate_info : {
            enable: 1
        },
        // 初始化
        init: function () {
           var that = this;
           if (!plugins.isAndroid()) {
               if ($('.set_speed').lenght === 0){
                var str = '<div class="set_speed"><i></i></div>' 
                $('.mod_ctrs').append(str);
               }
                setTimeout (function () {
                    that.h5PlayerTpl();
                    that.bindEvents();
                }, 500)
           } else {
           // 如果是安卓则隐藏设置按钮
               $('.set_speed').hide()
           }
        },
         //渲染，插入模版
        h5PlayerTpl : function(){
            var html5PlayerTpl = TMOD('player_speed',{});
            //插入点
            $('#mod_ppt').append(html5PlayerTpl);
        },
        getTargets : function(){
            return {
                //倍速按钮
                $speedBtn : $('.set_speed'),
                $speedBtnInner : $('.player_now_speed'),
                //倍速盒子
                $speedTypeBox : $('.player_speed'),
            }
        },
        bindEvents: function () {
            var targets = this.getTargets(),
            that = this;
            targets.$speedBtn.on('touchend',function(){
                config.isSpeedTypeBoxShow = !config.isSpeedTypeBoxShow;
                if (!$(".full_screen").hasClass("isFullScreen") && !$(".v_full_screen").hasClass("isFullScreen")) {
                    if (config.isSpeedTypeBoxShow) {
                        if (config.rotationType === "vertical") {
                            targets.$speedTypeBox.css({ "transform": "rotate(0deg)", "zIndex": 9999, "bottom": "32px", "right": "5px", "position": "absolute" })
                        } else {
                            targets.$speedTypeBox.css({ "transform": "rotate(0deg)", "zIndex": 9999, "bottom": "32px", "right": "0", "position": "absolute" })
                        }
                        targets.$speedTypeBox.show();
                    } else {
                        targets.$speedTypeBox.hide();
                    }
                } else {
                    if (config.isSpeedTypeBoxShow) {
                        if (config.rotationType === "vertical") {
                            targets.$speedTypeBox.css({ "zIndex": 100004, "position": "fixed", "bottom": "130px", "right": $("#mod_ppt_wrap").width() - 30 - targets.$speedTypeBox.width() - targets.$speedTypeBox.height(), "transform": "rotate(90deg)", "transformOrigin": "left top" })
                        } else {
                            targets.$speedTypeBox.css({ "zIndex": 100004, "position": "fixed", "bottom": "30px", "right": "0", "transform": "rotate(0deg)", "transformOrigin": "left top" })
                        }
                        targets.$speedTypeBox.show();
                    } else {
                        targets.$speedTypeBox.hide();
                    }
                }
            });

            targets.$speedTypeBox.on('touchend','li',function(){
                //点击li   点击事件冒泡到 $speedBtn上，触发点击事件，隐藏倍速盒子
                var speed = $(this).data('speed') ;
                var type = $(this).html();
                window.__vodPlayer.playRate(speed);
                $('.player_speed li').removeClass('bg');
                $(this).addClass('bg');
            });
        }
    }
    module.exports = h5player;
})