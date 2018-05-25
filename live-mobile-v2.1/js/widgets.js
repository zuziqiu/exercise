//author: xin
//time: 2016-08-01
//用途：方法模块
define(function(require, exports, module){
	
	var widgets = {

		isDebug: function(){
			var isDebug = false;
			window.location.href.indexOf("debug=list") > -1 ? isDebug = true : isDebug = false;
			return isDebug;
		},
 
		//水印功能
		aggregate: function(status,enable,uid){
			var that = this;

			if($("#pop_water_mark").size() > 0){
				return false;
			}
			
			var time = Math.random()*300000+180000;

				if( status == "start" && enable == 1){
					$("body").append('<span id="pop_water_mark" class="pop_xid" width="100%">'+uid+'</span>');
	                	var intervalId = setInterval(function(){
								var a = [["0","10","20%","30","40%","70%","90%"],["40%","30%","50%","70%","80","10%","20%"]];
								var n = Math.floor(Math.random()*a[0].length + 1)-1;
								var m = Math.floor(Math.random()*a[1].length + 1)-1;
									that.setTop(a[0][n],a[1][m]);
	                    },time);    
	                }

				if( enable == 1 && status == "stop"){
					$(".pop_xid").hide();
					clearInterval(intervalId);
				}
		},

		//设置水印top值
		setTop: function(y,x){
			$(".pop_xid").css({
				"top": y,
				"left": x
			});
		},

		init: function(){
			var that = this;
		}
	};
	//暴露
	module.exports = widgets;
});