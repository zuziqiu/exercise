/**
 * @name flower.js
 * @note 送花模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    var plugins = require("./plugins");
    // var config = require("./global.config");
    var chat = require("./chat"); // 聊天模块
    var config = require("./global.config");
    // 模版
    /**
     * @鲜花模块
     */
    modFlower = {
        // 父容器
        $target: $("#chat"),
        // 当前对象
        e: {},

        _MT: null,
        // 事件绑定
        events:[
            {"touchend" : ["#mode_chat_post .flower", "send"]}, // 送花
        ],
        // 事件绑定
        binds: function(){
            var that = this;
            MT.tools.bindEvent(that.$target, that, that.events);
        },
        // 初始化界面
        init: function(HTSDK) {
            modFlower._MT = HTSDK;
            // 获取鲜花
            modFlower._MT.plugins("flower").getFlower();
            this.binds();
        },
        // 送花
        send: function(target) {
            modFlower.e = target;

            if(!chat.userAllGag()){
                return;
            }
            // 送花请求
            modFlower._MT.plugins("flower").sendFlower();
        },
        // 送花回调  modFlower._MT.plugins("flower")
        sendCallback: function(retval) {
            var that = this,
                d = retval,
                fcount = parseInt(d.amount, 10),
                _fw = "",
                now = new Date();
            //items
            for (var i = 0; i < fcount; i++) {
                _fw += '<i>flower</i>';
            };
            d.avatar= plugins.setAvatar(d);
            //系统消息
            var notify = '<span class="notice_flower chat_detail"><img src="'+d.avatar+'" class="avatar"/><div class="chat_left"><span class="vt">'+d.nickname+'</span><span class="chat_time">'+d.time+'</span></div><span class="flower_send"><span></span><span class="roses">'+_fw+'</span></span></span>';;
            if(d.role == "admin"){
                notify='<span class="notice_flower chat_detail"><img src="'+d.avatar+'" class="avatar"/><div class="chat_left"><span class="vt">'+d.nickname+'</span><div class="is_admin comm"><em>'+config.role.admin+'</em><span></span></div><span class="chat_time">'+d.time+'</span></div><span class="flower_send"><span></span><span class="roses">'+_fw+'</span></span></span>';
            }

            // 检查DOM
            plugins.checkChatSize();

            if(plugins.isGroups(retval.gid)){
                plugins.flowerNotify(notify);
            }   
        },
        // 剩余时间
        flowerTimeleft: function (sec) {
            this.tips(sec);
        },
        // 鲜花自增
        autoIncrease: function (flower) {
            var fw = parseInt(flower, 10);
            if(fw > 0 && fw <= 3){
                $("#mode_chat_post .flower .num").html(fw).show();
            }else{
                return;
            }
        },
        // 初始化鲜花
        flowerInit: function (ret) {
            this.tips(ret);
        },
        // 提示
        tips: function(data) {
            var $tg = $("#mode_chat_post .flower"),
                $fwtip = $(".chat"),
                $num = $tg.find(".num"),
                d = data,
                that = this,
                amount = d.amount;
            // 鲜花数提示
            if(d.code === 0){
                if(d.amount > 0){
                    $num.html(d.amount).show();
                }else{
                    $num.hide();
                }
                $tg.removeClass("disable");
            }else if(d.code === 15000){
                var leftTime = d.leftTime;
                if(leftTime > 0){
                    var $fe = $("#mode_chat_post .flower");
                    plugins.showComtip($fe, leftTime+"秒后可获一朵鲜花");
                }
                $tg.removeClass("disable");
                $num.hide();
            }else if(d.code === 1202){
                plugins.showComtip($(".flower"), "还没上课喔～");
            }
        }
    };

    // 暴露接口
    module.exports = modFlower;
});

