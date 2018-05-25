/**
 * 打赏-心
 */

"use strict";

define(function(require, exports, module){

    var reward = {

        liveid: '',

        //打赏功能
        bindEvent: function(){
            var that =  this;
            var $rewardCont = $(".reward_pop");       

                $(".reward_btn").on("touchend", function(){
                    $rewardCont.show();     
                });

                $rewardCont.on("touchend",".close", function(){
                    $rewardCont.hide();
                });

                $(".reward_container").on("click", "li", function(){
                    var setMoney = $(this).data("set");
                        that.rewardPost(setMoney);
                });

                $rewardCont.on("touchend", "#reward_confim", function(){
                    if( $("#reward_val").val() != "" ){
                        var setMoney = $("#reward_val").val();
                            that.rewardPost(setMoney);
                    }else{
                        $rewardCont.addClass("warn");
                    }
                });

                $("#reward_val").on("focus", function(){
                    $rewardCont.removeClass("warn");
                });

                //去除非数字符号
                $("#reward_val").on("keyup", function(){
                    var regx = /^[1-9]\d*$/; //匹配数字
                    var str = /[^\d^\.]+/;  //匹配非数字
                        if( !regx.test($(this).val()) ){
                            var rVal =  $(this).val().replace(str,'');
                                $(this).val(rVal);
                        }
                });
        },

        rewardPost: function(setMoney){
            var that = this;
                $.ajax({
                    url: '//open.talk-fun.com/live/pay.php?action=reward',
                    type: 'post',
                    dataType: 'json',
                    data:{
                        price: setMoney,
                        liveid: reward.liveid,
                        // reward_test: "0.01"
                    },
                    success:function(ret){
                        if(ret.code == 0){
                            if($("#mtAuthorPlayer").hasClass("camera_wechat")){
                                that.payUrlPost(ret.data.wapPayUrl);
                            }else{   
                                window.location.href = ret.data.wapPayUrl;
                            }
                             // window.open(ret.data.wapPayUrl,"","");
                        }
                    }
                });
        },

        payUrlPost: function(url){
            var that = this;
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                success: function(ret){
                    window.jsApiParameters = ret.data
                    that.callpay();
                }
            });
        },

        //调用微信JS api 支付
        jsApiCall: function(){
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest',
                jsApiParameters,
            function(res){
                WeixinJSBridge.log(res.err_msg);
                // alert(res.err_code+res.err_desc+res.err_msg);
                }
            );
        },

        callpay:function(){
          if (typeof WeixinJSBridge == "undefined"){
              if( document.addEventListener ){
                  document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
              }else if (document.attachEvent){
                  document.attachEvent('WeixinJSBridgeReady', jsApiCall); 
                  document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
              }
          }else{
              this.jsApiCall();
          }
        },

        //打赏通知
        rewardNotify: function(ret){
            var that = this;
            $(".reward_pop").hide(); 
            var notify = '<span class="isDiy_true"><i class="r_ward"></i><em>'+ret.nickname+'同学</em><i>送给</i><em class="teacher_name">老师</em>'+'<em class="r_how">'+ret.money+'个</em><em>红包</em></span>';
            plugins.chatNotify(notify,'isDiy');
        },


        // wechat -> false 
        isAlipay: function(){
            var that = this;
            var isWechat = $("#mtAuthorPlayer").hasClass("camera_wechat");
            var isPidurl = window.location.href.indexOf('orderId');
            if( isPidurl > -1){
                var orderId = window.location.href.split('&orderId=')[1].split('&')[0];
                    $.ajax({
                        url:'//open.talk-fun.com/live/pay.php?action=getOrderInfo',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            orderId: orderId
                        },
                        success: function(ret){
                            if(ret.code == 0){
                                that.aliPayMe(ret);
                            }
                        }
                    });
            }
        },

        aliPayMe: function(ret){
            var me = MT.me.xid;
            var callbackXid = ret.data.xid;
                if(me == callbackXid){
                    var notify = '<span class="isDiy_true"><i class="r_ward"></i><em>'+ret.data.nickname+'同学</em><i>送给</i><em class="teacher_name">老师</em>'+'<em class="r_how">'+ret.data.money+'个</em><em>红包</em></span>';
                    $("#chat_hall").append(notify);
                    plugins.scrollToBottom('chat');
                }
        },

        // 初始化
        init: function(){
            var that = this;
                that.isAlipay();
                that.bindEvent();
        }
    };

    module.exports = reward;
});