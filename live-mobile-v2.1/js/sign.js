/**
 * @name sign.js
 * @note 点名签到模块
 * @author [liagh]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {

    // 模版
    var TMOD = require("TMOD");
    var plugins = require("./plugins");// 扩展方法

   /* var room = require("./room");*/
    // 点名签到模块
    //普通用户签到弹框
	var sign ={

	    singUrl: '//open.talk-fun.com/live/sign.php', //发起点名接口

	    timer: null,

	    isLoad: false,

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
	        clearInterval(sign.timer); 
	        plugins.voiceOrVideo();
	        $(".user_sign_pop").hide();
	    },

	    //显示签到框
	    showSignPop: function(data){
	        //管理员不显示签到弹框
	        if(MT.me.role == "admin" || MT.me.role == "spadmin"){
	            return;
	        }
	        var signTemp = TMOD("sign_pop",data);
	        $("body").append(signTemp);  
	        plugins.isVideo();
	        sign.signCountDown(data.data.duration);
	    },

	    //签到倒计时
	    signCountDown: function(duration){
	        var second = duration,
	            that = this;
	        clearInterval(sign.timer);    
	        sign.timer = setInterval(function(){
	            second--;
	            if(second == 0){ 
	                $(".user_sign_pop").hide();
	                plugins.voiceOrVideo();
	                return;
	            }
	            $(".user_sign_pop .time").html(second);
	        },1000);
	    },

	    //聊天区通知
	    showNotice: function(data,state){
	        var notify = "";
	        if(state === "start"){
	            notify = '管理员 <em>'+data.data.nickname+'</em> 在 '+data.data.time+'  开始点名';
	        }else{
	            notify = "点名结束";
	        }
	        if(MT.me.xid == data.data.xid){
	        	plugins.chatNotify(notify);
	        }
	        
	    },

	    bindEvents: function(){
	        var that = this;
	        $("body").on("click",".user_sign_pop .close_pop",function(){
	             $(".user_sign_pop").hide();
	             plugins.voiceOrVideo();
	        });

	        //签到
	        $("body").on("click",".user_sign_pop .sign_btn",function(){
				console.log("123")
	        	if(!sign.isLoad){
	        		sign.isLoad = true;
	            	that.userSign($(this));
	        	}
	        });  
	    },
	    //签到成功
	    signlSuccess: function(data){
	        if(data.code == 0){
	            $(".user_sign_pop").hide();
	            var notify = "通知: 你已确认签到";
	            plugins.voiceOrVideo();
	            plugins.chatNotify(notify);
	        }  
	        sign.isLoad = false;
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


    // 暴露接口
    module.exports = sign;
});

