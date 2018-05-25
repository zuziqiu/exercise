/**
 * @name set.js
 * @note  投票模块
 * @author [liangh]
 * @version [v1.0.1]
 */
define(function(require, exports, module) {
    // 模版
    var TMOD = require("TMOD");
    var room = require("./room");
    var plugins = require("./plugins");
/**
 * @抽奖模块
 */
lottery = {
    timer: null,
    t1: null,
    t2: null,
    t3: null,
    _MT: null,
    loXids: {},//中奖客户的xid集合
    // 关闭抽奖
    closeLottery: function(){
        $("#mode_lottery").on("touchend",".close_icon",function(){
            $(".pop_cloud_background").hide();
            $("#mode_lottery").hide();
            plugins.voiceOrVideo();
        });
    },
    // 开始抽奖(动画)
    startLottery: function(){  
        //是否管理员 是否是模式二
        if(plugins.isAdmin() || MT.getSDKMode() == 2){
            return false;
        }
        if( MT.getSDKMode() == 1){
            SDK.cameraHide();
        }

        this.loXids = {};
         
        plugins.isVideo();
        //初始化去掉如果抽中自己的情况样式
        $('.lotter_inner').show();
        $('.mod_lottery').removeClass('me');
        $('.me_nickname').hide();
        $("#mtAuthorPlayer").addClass('onepx');
        $('.lotter_inner').removeClass('win_ret');
        $('.operation').removeClass('meClose');
        $(".pop_cloud_background").show();
        var $lottery = $("#mode_lottery");
        $lottery.show();
        $it1 = $("#roller_con").find(".it_1"),
        $it2 = $("#roller_con").find(".it_2"),
        $it3 = $("#roller_con").find(".it_3");
        $it1.addClass("scroll1");
        $it2.addClass("scroll2");
        $it3.addClass("scroll3");
        $("#roller_con").show();
        $(".award_user_info").hide();
        // 抽奖
        $("#roller_con").show();
        $(".award_user_info").hide();
        lottery.closeLottery();
    },

    //显示序号所有中奖人
    lotteryNumWinners: function(ret){
        var d= ret.result,
            winners= '';//中奖人   
        for(var i = 0;i<d.length;i++){
            this.loXids[d[i].xid] = d[i].xid;
            var num = "0"+(i+1);
            if(i==(d.length-1)){
                winners+=num+"."+d[i].nickname;
            }else{

                winners+=num+"."+d[i].nickname+"&nbsp;&nbsp;&nbsp;&nbsp;";
            }      
        }; 
        return winners;
    },

    //所有中奖人
    lotteryWinners:function(ret){
        var d= ret.result,
            winners= '';//中奖人
        for(var i = 0;i<d.length;i++){
            this.loXids[d[i].xid] = d[i].xid;
            if(i==(d.length-1)){
                winners+= d[i].nickname;
            }else{
                winners+= d[i].nickname+"、";
            }      
        }; 
        return winners;
    },



    // 停止抽奖
    stopLottery: function(retval){
        $(".pop_cloud_background").show();
        //是否为模式2
        if( MT.getSDKMode() == 2){
            return false;
        }else if( MT.getSDKMode() == 1){
            SDK.cameraHide();
        }

        var me = MT.me,
            meXid = me.xid,
            that= this,
            names = "",
            launch_nickname = retval.result[0].launch_nickname,
            $lottery = $("#mode_lottery");
        names = lottery.lotteryWinners(retval);    
        // 显示结果
        setTimeout(function(){
            var notify = '通知:'+'<i></i>'+'<span>'+launch_nickname+'</span>'+'发起了抽奖，恭喜 <em class="name">'+names+'</em> 中奖！';
            plugins.chatNotify(notify);

            names = lottery.lotteryNumWinners(retval); 
            
            if(that.loXids[meXid] === meXid){
                // 自己中奖
                lottery.renderLottery(names, true);

                if(partner_id != "11443"){
                    $(".award_user_info span").html("恭喜你，中奖了");
                }else{
                    $(".lotter_title").show();
                    $(".award_user_info span").addClass("cfont");
                    $(".award_user_info span").html("(请中奖的同事务必将此页截屏发至箭闻)");
                }
            }else{
                // 未中奖
                lottery.renderLottery(names, false);
                if(partner_id != "11443"){
                    $(".award_user_info span").html("中奖人");
                }else{
                    $(".lotter_title").show();
                    $(".award_user_info span").addClass("cfont");
                    $(".award_user_info span").html("(请中奖的同事务必将此页截屏发至箭闻)");
                }
            }
            
        }, 200);
    },
    // 显示抽奖信息
    renderLottery: function(nickname, flag){
        $("#mode_lottery").show();
        plugins.isVideo();
        // 抽奖模块
        var timer = this.timer,
            $it1 = $("#roller_con").find(".it_1"),
            $it2 = $("#roller_con").find(".it_2"),
            $it3 = $("#roller_con").find(".it_3");
       /*$("#roller_con").fadeIn(80);*/

        // 停止动作恢复默认
        $it1.removeClass("scroll1");
        $it2.removeClass("scroll2");
        $it3.removeClass("scroll3");
        $("#loter_info").html(nickname);
        $(".me_nickname").html(nickname);
        $("#roller_con").hide();
        $(".award_user_info").show();
        lottery.closeLottery();
        // 是否自己中奖
        if(flag){
            $('.mod_lottery').addClass('me');
            $('.me_nickname').show();
            $('.operation').addClass('meClose');
        }else{

        }
    },
    //事件绑定
    init:function(HTSDK){
        var that = this;
    }
};
    // 暴露接口
    module.exports = lottery;
});

