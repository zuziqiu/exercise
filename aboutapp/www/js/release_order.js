//问题
angular.module('release_order_timekey',[])
.controller('selecttimekey',function($scope){
	(function(){
		var that=angular.element("#selectTime");
		var nowdate=new Date();
		var thismonth=nowdate.getMonth()+1;
		var indexD=1,indexH=1,indexI=1,indexH1=1,indexI1=1;
		var initH=Math.round(nowdate.getHours());
		var initI=Math.round(nowdate.getMinutes());
		var initH1,initI1,initD=0;
		var DayScroll=null,HourScroll=null,MinuteScroll=null,HourScroll1=null,MinuteScroll1=null;
		var HourScrollsw=true;
		//用户选择覆盖默认
		var opts={
			beginhour:1,
			endhour:24,
			beginminute:0,
			endminute:59
		}
		
		$scope.timeKey=function(){
			createUL();
			init_iScroll();
			extendOptions();
//			that.blur();
			refreshTime();
			bindButton();
		}
		
//		that.bind(opts.event,function(){
//			
//		});
		//初始时间表
		function refreshTime(){
			HourScroll.refresh();
			MinuteScroll.refresh();
			HourScroll1.refresh();
			MinuteScroll1.refresh();
			DayScroll.refresh();
			initH=initH-1;
			if(initI+30>60){
				initH1=initH+1;
				initI1=initI+30-60;
			}else{
				initH1=initH;
				initI1=initI+30;
			}
			HourScroll.scrollTo(0,initH*62,100,true);
			MinuteScroll.scrollTo(0,initI*62,100,true);
			HourScroll1.scrollTo(0,initH1*62,100,true);
			MinuteScroll1.scrollTo(0,initI1*62,100,true);
			DayScroll.scrollTo(0,initD*62,100,true)
			initH=parseInt(nowdate.getHours());
		}
		
		//确定取消按钮绑定
		function bindButton(){
			angular.element("#dateconfirm").add("#datecancle").unbind("click").click(function(){
				if(angular.element(this).html()=="确定"){
					//确定的日期
					var sureday=nowdate.getDate()
					switch(indexD){
						case 2:
							sureday += 1
							break;
						case 3:
							sureday += 2
							break;
						default:;
					}
					localStorageset("agreed_begin",nowdate.getFullYear()+"-"+thismonth+"-"+sureday+" "+angular.element("#Hourwrapper ul li:eq("+indexH+")").html()+":"+angular.element("#Minutewrapper ul li:eq("+indexI+")").html()+":00");
					localStorageset("agreed_end",nowdate.getFullYear()+"-"+thismonth+"-"+sureday+" "+angular.element("#Hourwrapper ul li:eq("+indexH1+")").html()+":"+angular.element("#Minutewrapper ul li:eq("+indexI1+")").html()+":00");
					var datetxt=nowdate.getFullYear()+"-"+thismonth+"-"+sureday+
					"("+angular.element("#Daywrapper ul li:eq("+indexD+")").html()+")"+" "+angular.element("#Hourwrapper ul li:eq("+indexH+")").html()+":"+
					angular.element("#Minutewrapper ul li:eq("+indexI+")").html();
					indexD=1;
					angular.element("#appointment").html("预约发布<br /><p id='Show'>"+datetxt+"</p>");
				}
				angular.element("#Time").hide();
			})
		}
		
		//时间列表显示
		 function extendOptions(){
	        angular.element("#Time").show(); 
	   }
		//时间滑动
		function init_iScroll(){
			HourScroll = new iScroll("Hourwrapper",{
				snap:"li",
				hScroll:false,
				vScrollbar:false,
				onScrollStart:function(){
						indexH=Math.round((this.y/62)*(-1))+1;
						angular.element("#Hourwrapper>ul").css({
							"transform": "translate3d(0px,"+ (Math.round(this.y/62))*62 +"px, 0px)"
						}).find("li").removeClass("changefont").eq(indexH).addClass("changefont");
				
				},
				onScrollEnd:function(){
						indexH=Math.round((this.y/62)*(-1))+1;
						angular.element("#Hourwrapper>ul").find("li").removeClass("changefont").eq(indexH).addClass("changefont");
				}
			})
			MinuteScroll = new iScroll("Minutewrapper",{
				snap:"li",
				hScroll:false,
				vScrollbar:false,
				onScrollStart:function(){
					indexI=Math.round((this.y/62)*(-1))+1;
					angular.element("#Minutewrapper>ul").css({
						"transform": "translate3d(0px,"+ (Math.round(this.y/62))*62 +"px, 0px)"
					}).find("li").removeClass("changefont").eq(indexI).addClass("changefont");
				},
				onScrollEnd:function(){
					indexI=Math.round((this.y/62)*(-1))+1;
					angular.element("#Minutewrapper>ul").find("li").removeClass("changefont").eq(indexI).addClass("changefont");
				}
			})
			HourScroll1 = new iScroll("Hourwrapper1",{
				snap:"li",
				hScroll:false,
				vScrollbar:false,
				onScrollStart:function(){
					indexH1=Math.round((this.y/62)*(-1))+1;
					angular.element("#Hourwrapper1>ul").css({
						"transform": "translate3d(0px,"+ (Math.round(this.y/62))*62 +"px, 0px)"
					}).find("li").removeClass("changefont").eq(indexH1).addClass("changefont");
				},
				onScrollEnd:function(){
					indexH1=Math.round((this.y/62)*(-1))+1;
					angular.element("#Hourwrapper1>ul").find("li").removeClass("changefont").eq(indexH1).addClass("changefont");
				}
			})
			MinuteScroll1 = new iScroll("Minutewrapper1",{
				snap:"li",
				hScroll:false,
				vScrollbar:false,
				onScrollStart:function(){
					indexI1=Math.round((this.y/62)*(-1))+1;
					angular.element("#Minutewrapper1>ul").css({
						"transform": "translate3d(0px,"+ (Math.round(this.y/62))*62 +"px, 0px)"
					}).find("li").removeClass("changefont").eq(indexI1).addClass("changefont");
				},
				onScrollEnd:function(){
					indexI1=Math.round((this.y/62)*(-1))+1;
					angular.element("#Minutewrapper1>ul").find("li").removeClass("changefont").eq(indexI1).addClass("changefont");
				}
			})
			DayScroll = new iScroll("Daywrapper",{
				snap:"li",
				hScroll:false,
				vScrollbar:false,
				onScrollStart:function(){
					indexD=Math.round((this.y/62)*(-1))+1;
					angular.element("#Daywrapper>ul").css({
						"transform": "translate3d(0px,"+ (Math.round(this.y/62))*62 +"px, 0px)"
					}).find("li").removeClass("changefont").eq(indexD).addClass("changefont");
				},
				onScrollEnd:function(){
					indexD=Math.round((this.y/62)*(-1))+1;
					angular.element("#Daywrapper>ul").find("li").removeClass("changefont").eq(indexD).addClass("changefont");
				}
			})
		}
		//创建时间表
		function createUL(){
			angular.element("#Hourwrapper>ul").html(createHours_UL());
			angular.element("#Minutewrapper>ul").html(creatMinute_UL());
			angular.element("#Hourwrapper1>ul").html(createHours_UL());
			angular.element("#Minutewrapper1>ul").html(creatMinute_UL());
		}
		
		
		//创建--时--列表
		function createHours_UL(){
			var str="<li>&nbsp;</li>";
			for(var i=opts.beginhour;i<=opts.endhour;i++){
				if(i<10){
					i="0"+i;
				}
				str+="<li>"+i+"</li>"
			}
			return str+"<li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li>";
		}
		//创建--分--列表;
		function creatMinute_UL(){
			var str="<li>&nbsp;</li>";
			for(var i=opts.beginminute;i<=opts.endminute;i++){
				if(i<10){
					i="0"+i;
				}
				str+="<li>"+i+"</li>"
			}
			return str+"<li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li>";
		}
	})()
	
})