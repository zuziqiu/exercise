
//链接首页
$(".backmain").click(function(){
	location="index.html";
})

$(".clk1").add(".footer>li").add(".recharge").children().add(".portrait").add(".blidc").add(".arrow").add(".go").add(".nav").click(function(){
		var go=$(this).attr("data-url");
		if(go==-1){
			history.go(-1);
		}else{
			location=go;
		}
		console.log(go);
})

//类名buy按钮的样式切换
$(".buy").on("touchstart",function(){
	$(this).css("color","blue");
}).on("touchend",function(){
	$(this).css("color","#fff");
}).click(function(){
	var come=$(this).attr("data-url");
	location=come;
})



//关于首页header样式生成
function fn1(){
	var hul=$(".hright>ol");
	var left=0;
	for(var i=1;i<hul.length;i++){
		var wul=hul.width()+hul.eq(i-1).offset().left-$(".hright").offset().left+12;
		console.log(hul.eq(i-1).offset().left);
		hul.eq(i).css("left",wul);
	}
}
fn1();
$(window).resize(function(){
	fn1();
})

var PageIndex = 1;
var ProductClass = null ; 
//$(".func3").click(function(){
//	showBt();
//	showLi(productClass);
//});
//礼品按钮分类
	var settings = {
		  	"url":"http://test3.msqsoft.net/zkweixin/weiphp/index.php?s=api",
		  	"method": "POST",
		 	"dataType" : "json",
		  	"headers": {
			    "content-type": "application/x-www-form-urlencoded",
			    "Authorization": "Basic QXBpQmFzaWM6MTIz"
		  	},
		  	"data":{
		  	 	"_api": "GetProductClass/GetProductClass",	
		  	 	"GiftClass":"productClass"
	  	}
	}
	
//	 onclick=\"showLi('" + product.ProductClass + "')\"
	$.ajax(settings).success(function (response) {
		//	动态生成按钮
	  	response.Data.forEach(function (product){
//			$(".sel1").append("<button>" + product.ProductName + "</button>");
		$(".sel1").append("<button onclick=\"btnclick('" + product.ProductClass + "')\">" + product.ProductName + "</button>");
		});
		
		$(".sel1 button").eq(0).css({"background-color":"#10aeff","color":"#fff"}).siblings().click(function(){
			$(".sel2").css("display","none");
		});
		//	切换按钮改变背景颜色
		for(var i=2;i<$(".sel").length;i++){
			$(".sel").eq(i).css("display","none");
		}
		$(".sel1").children().on("touchstart",function(){
			$(".sel1").children().not($(this)).css({
				"background-color":"#fff",
				"color":"#000"
			})
			$(this).css({
				"background-color":"#10aeff",
				"color":"#fff"
			})
		});
		$(".sel1 button").eq(0).click();
	});
	
	
	
	
		function btnclick(ProductCl){
			ProductClass = ProductCl;
			PageIndex=1;
			$(".sel2").remove();
			showLi(ProductClass);
		};
		
		
		
//礼品分类详细
function showLi(productClass) {
var SL = {
	"async": true,
    "crossDomain": true,
    "url": "http://test3.msqsoft.net/zkweixin/weiphp/index.php?s=api",
    "method": "POST",
    "headers": {
    	"Content-type": "application/x-www-form-urlencoded",
    	"Authorization": "Basic QXBpQmFzaWM6MTIz",
   		"Cache-control": "no-cache",
    	"Postman-token": "8778d57e-6a17-9d45-f4f6-b039e593f6dd"
    },
    "data": {
   	 	"Type": "2",
   		"UserId": "46E19176-D96C-45CD-A05D-3B777A25191F",
    	"PageIndex": PageIndex,
   		"PageCount": "10",	
    	"Name": "",
   		"GiftClass": productClass,
   		"_api":"GiftList/GetGiftList"
  }
}
//	添加各类礼品分类详细
	$.ajax(SL).success(function (SL_data) {
		var sl_data = JSON.parse(SL_data);
		//	暂无此类商品
		if ((sl_data.Data).length<1){
			if(PageIndex<2){
				$(".sel").eq(2).show();
			};
			return;
		}else{
			$(".sel").eq(2).hide();
			sl_data.Data.forEach(function (sd){
			$(".sel").eq(1).append("<li class=\"sel2\" data-url=\"Gift02.html\">" +
											"<img src=" + sd.ImagePath + "alt=\"\"/>" +
											"<ol>"+
												"<h2>" + sd.Name + "</h2>" +
												"<li class=\"col\">" +
													"<span class=\"ic_token\"></span>"+
													"积分:" + sd.ExchangePoint +
												"</li>" +
												"<li class=\"col\">" +
													"<span class=\"ic_lotterytickets\"></span>" +
													"彩票:"+ sd.ExchangeTickets +
												"</li>" +
											"</ol>" +
										"</li>");
					//("<button>" + product.ProductName + "</button>");
					//$(".sel1").eq(1).append("<button onclick=\"showLi('" + product.ProductClass + "')\">" + product.ProductName + "</button>");
			});
		};
	});
//拉下加载更多	
$(window).scroll(function(){
　　var scrollTop = $(this).scrollTop();
　　var scrollHeight = $(document).height();
　　var windowHeight = $(this).height();
　　if(scrollTop + windowHeight == scrollHeight){
		PageIndex = PageIndex+1;
　　　  　	showLi(productClass);
　　}
});

			$(".sel").eq(1).on("touchstart",function(){
					$(this).css("background-color","rgba(111,111,111,0.3)")
				}).on("touchend",function(){
					$(this).css("background-color","#fff")
				}).click(function(){
					location.href="Gift02.html";
			})
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
//$.ajax(settings).success(function (response) {
//	var i = 1;
//	response = JSON.parse(response);
//	response.Data.forEach(function(product){
//	$(".sel1 button[name='fenlei_"+i+"']").text(product.ProductName);
//		i++;
//	});
//});
//$.ajax({
//	url:"http://test3.msqsoft.net/zkweixin/weiphp/index.php?s=api/GetProductClass/GetProductClass",
//	type:"post",
//	dataType:"json",
//  data:$("#mCard_main form" ).serialize(),
// 	success:function(data){
// 	var i = 1;
// 	data.Data.forEach(function(product){
// 	$(".sel1 button[name='fenlei_"+i+"']").text(product.ProductName);
// 		console.log(11);
// 		i++;
// 		});
// 	},
//	error:function(){
//		alert("发生错误")
//	},
//});