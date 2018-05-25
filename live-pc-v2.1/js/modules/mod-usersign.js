/**
 * sign 点名模块
 */
(function(win){
	// var modBlock = "userSign";
	
	//普通用户签到弹框
	var userSign = {

	    timer : null,

	    singUrl: protocol +window.location.host+'/live/sign.php', //发起点名接口
	    //初始化
	    init:function(){
	        var that = this; 
	        that.bindEvents();    
	    },
	    /*
	    *@type 请求类型
	    *@jsonData 请求参数
	    *@requrl 请求url
	    *@callback 回调函数
	    */
	    //公共ajax请求
	    ajaxRequest: function(type,jsonData,requrl,callback){
	        $.ajax({
	            url: requrl,
	            method: type,
	            data: jsonData,
	            dataType: "jsonp",
	            success: function(data){
	                callback(data);
	            },
	            error: function(){

	            }
	        })
	    },

	    // 结束进隐藏签到弹框
	    signPopHide: function(){
	    	var that = this;
	        clearInterval(that.timer);
	        $(".user_sign_pop").hide();
	    },

	    //显示签到框
	    showSignPop: function(data){

	        //管理员不显示签到弹框
	        if(MT.me.role == "admin" || MT.me.role == "spadmin"){
	            return;
	        }
	        var signTemp = template("sign_pop",data);
	        $("body").append(signTemp);  
	        this.signCountDown(data.data.duration);
	    },

	    //签到倒计时
	    signCountDown: function(duration){
	        var second = duration,
	            that = this;
	        that.timer = setInterval(function(){
	            second--;
	            if(second == 0){ 
	                clearInterval(that.timer);
	                $(".user_sign_pop").hide();
	                return;
	            }
	            $(".user_sign_pop .time").html(second);
	        },1000);
	    },

	    bindEvents: function(){
	        var that = this;
	        $("body").on("click",".user_sign_pop .close_pop",function(){
	             $(".user_sign_pop").hide();
	        });

	        //签到
	        $("body").on("click",".user_sign_pop .sign_btn",function(){
	              that.userSign($(this));
	        });
	    },
	    //签到成功
	    signlSuccess: function(data){
	        if(data.code == 0){
	            $(".user_sign_pop").hide();
	            var notify = "通知: 你已确认签到";
	            if(data.data){
	                if(MT.me.xid == data.data.xid){
	                    HTSDK.tools.chatNotify(notify);
	                }    
	            }
	        }  
	    },

	    /*用户签到*/
	    userSign: function($this){
	        var id = $this.data("id"),
	            that = this;
	        var jsonData = {
	            access_token : window.access_token,
	            action : "sign",
	            signId : id
	        }
	        that.ajaxRequest("get",jsonData,that.singUrl,that.signlSuccess);
	    }
	}

	// 暴露
	var HTSDK = win.HTSDK || {};
	HTSDK.userSign = userSign;

})(window);
