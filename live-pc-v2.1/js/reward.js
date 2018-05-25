//打赏
HTSDK.reward = {

    defaults: {
        liveid: null,
        checkOrderUrl: ''
    },

    //bindevent
    bindEvent: function(){
        var that = this;
        var dataObject = {};

        var $rewardConfim = $("#reward_confim");

            $rewardConfim.on("click", function(){
                var reg = /^\+?[1-9][0-9]*$/;

                if( $("#reward_val").val() != "" && $("#reward_val").val() >= 1 ){
                    dataObject.price = $("#reward_val").val();
                    dataObject.liveid = HTSDK.reward.defaults.liveid;
                    // dataObject.reward_test = "0.01";
                    that.getInfo(dataObject);
                }else if( $("#reward_val").val() < 1){
                    //console.info(reg.test($("#reward_val").val()));
                    $(".reward_pop .tips").html("金额请大于1元");
                    $(".reward_pop").addClass("warn");
                }//else {
                //     $(".reward_pop").addClass("warn");
                // }
            });

            $("#reward_val").on("focus", function(){
                $(".reward_pop").removeClass("warn");
            });

            $(".pop_reward_container").on("click",".close", function(){
                $(".pop_reward_container").hide();
            });


            $(".reward_pop").on("click", ".close", function(){
                $(".reward_pop").hide();
            });

            $(".reward_btn").on("mousemove", function(){
                $(".reward_pop").show();
            });

            $(".reward_btn").on("mouseout", function(){
                //setTimeout(function(){
                $(".reward_pop").hide();
                //},1500)
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



            //打赏金额
            $(".reward_container").on("click", "li", function(){
                dataObject.price = $(this).data("set");
                dataObject.liveid = HTSDK.reward.defaults.liveid;
                // dataObject.reward_test = "0.01";
                that.getInfo(dataObject);
            });

    },

    getInfo: function(dataObject){
        var that = this;
        $.ajax({
            url: protocol + window.location.host+ '/live/pay.php?action=reward',
            type: 'post',
            dataType: 'json',
            data: dataObject,
            success: function(ret){
                if(ret.code == 0){
                    that.dealInfo(ret.data);
                }
            }
        });
    },

    dealInfo: function(data){
        var that = this;
        $(".reward_money").html(data.money+'元');
        $("#reward_val").val("");
        if( data.wxpayUrl.length > 0){

            that.getWeChatQR(data.wxpayUrl);
        }
        if( data.alipayUrl.length > 0){
            var iframeDom = '<iframe id="iframe" scrolling="no" style="width: 120px; height:120px" src='+data.alipayUrl+' ></iframe>';
            $(".login_alipay").attr("href",data.alipayLoginUrl);
            //处理打赏的时候未支付成功，去掉支付宝iframe
            if( $("#iframe").size() > 0){
                $("#iframe").remove();
            }
            $(".alipay").append(iframeDom);
        }

        $(".pop_reward_container").show();
        $(".pay_container").show();

        var timeInterval = setInterval(function(){
            that.checkStatus(data);
        },2000);

        window.timeInterval = timeInterval;
    },

    //获取微信支付的二维码
    getWeChatQR: function(url){
        $.ajax({
            url: url,
            type: "post",
            dataType: 'json',
            success: function(ret){
                $("#wechat_qr").attr("src",ret.data);
            }
        });
    },

    //反复查询
    checkStatus: function(data){
        var that = this;
        $.ajax({
            url: data.checkOrder,
            type: "get",
            dataType: "json",
            success: function(ret){
                if( ret.code == "0" ){
                    window.clearInterval(timeInterval);
                }
            }
        });
    },

    //红包通知
    notifyReward: function(ret){
        var that = this;
        var notify = '<span class="isDiy_true"><em>'+ret.nickname+'同学</em><i>送给老师</i>'+'<em class="r_how">'+ret.money+'元红包</em><i class="r_ward"></i></span>';
            $(".pay_container").hide();
            $(".pay_result .tips").html('你已成功打赏'+ret.money+'元给讲师');
            $(".pay_result").show();
            setTimeout(function(){
                $(".pop_reward_container").hide();
                $(".pay_result").hide();
            },3000);
        HTSDK.tools.chatNotify(notify,'isDiy');
        if(ret.money >= 20){
            //that.rain();
        }
    },

    //红包雨
    rain: function(){
        var rainDom = '<div class="rain"></div>';
        $(".chat_wrap").append(rainDom);
    },  

    init: function(){
        var that = this;
            that.bindEvent();
            // that.rain();
    }

}