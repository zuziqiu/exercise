	var PageIndex = 1;
	var ProductClass = null ; 
	var ProductID;
	var Total;
	function btnclick(ProductCl){
		ProductClass = ProductCl;
		PageIndex=1;
		$(".sel2").remove();
		showLi(ProductClass);
		$("body").scrollTop(0);		//切换菜单后列表返回顶部
	}
	//礼品分类列表
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
	   	 	"Type": "0",
	   		"UserId": "46E19176-D96C-45CD-A05D-3B777A25191F",
	    	"PageIndex": PageIndex,
	   		"PageCount": "10",	
	    	"Name": "",
	   		"GiftClass": productClass,
	   		"BranchId": "3D7775B5-33D1-4348-B3AA-4CFD9AEE",
	   		"_api":"GiftList/GetGiftList"
		}
	}
	

	//	添加各类礼品分类详细
		$.ajax(SL).success(function (SL_data) {
			$(".sh_loading").hide();
			var sl_data = JSON.parse(SL_data);
			Total = sl_data.Total;
			//	暂无此类商品
			if ((sl_data.Data).length<1){
				if(PageIndex<2){
					$(".sel").eq(2).show();
				};
				return;
			}else{
				$(".sel").eq(2).hide();
				sl_data.Data.forEach(function (sd){
				$(".sel").eq(1).append("<li class=\"sel2\" data-transmit=" +sd.ProductID+ ">" +
												"<img src=" + sd.ImagePath + " alt=\"\"/>" +
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
				});
			};
		});
		
	}
	
$(function($) {
	showLi();
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
//		  	 	"GiftClass":"productClass",
		  	 	"BranchId": "3D7775B5-33D1-4348-B3AA-4CFD9AEEC0D2"
	  	}
	}
	
	$.ajax(settings).success(function (response) {
		$(".sh_loading").hide();
		//	动态生成按钮
	  	response.Data.forEach(function (product,index){
		  	if(index<7){
				$(".sel1").append("<button onclick=\"btnclick('" + product.ProductClass + "')\">" + product.ProductName + "</button>");
			}
		});	
		if(response.Data.length>7){
		  	$(".sel1").append("<button class=\"more_bt\">更多分类</button>");
			//	设置opi比较按钮数量加载后续按钮	  
			var opi =7,opu = 0;
			$(".sel1").on("click",".more_bt",function(){
				if(opu>0){return};
				opu ++;
		  		response.Data.forEach(function (product,index){
			  		if(opi>index){return}
					$(".more_show").append("<button onclick=\"btnclick('" + product.ProductClass + "')\">" + product.ProductName + "</button>");
					$(".more_show button").eq(0).css({"border":"none"})
				});
				$(".more_show").children().on("touchstart",function(){
					$(this).siblings().css({
						"background-color":"#fff","color":"#000"
					});
					$(this).css({
						"background-color":"#10aeff","color":"#fff"
					});
				});
				$(".more_show").children().on("click",function(){
					setTimeout(function(){
						$(".more_p").hide();
					},250);
				});
		  	})
		}
		
//		显示更多分类
		$(".sel1").on("click",".more_bt",function(){
			if($(".more_p").css("display")=="none"){
				$(".more_p").show();
			}else{
				$(".more_p").hide();
			}
		});
		
//		切换按钮改变背景颜色
		$(".sel1").children().on("touchstart",function(){
			$(this).siblings().css({
				"background-color":"#fff","color":"#000"
			});
			$(this).css({
				"background-color":"#10aeff","color":"#fff"
			});
			if($(this).text()!=="更多分类"){
				$(this).parent().siblings().hide();
				$(this).parent().siblings().children().find("button").css({
					"background-color":"#fff","color":"#000"
				});
			}
		});
	});

	//分类列表点击样式
	$(".sel").eq(1).on("touchstart",".sel2",function(){
		$(this).css("background-color","rgba(111,111,111,0.3)")
	}).on("touchend",".sel2",function(){
			$(this).css("background-color","#fff")
		})
	//跳转+传值
	$(".sel").eq(1).on("click",".sel2",function(){
		var transmit_val = $(this).data("transmit");
		document.cookie="transmit_val="+transmit_val;
		window.location.href="Gift02.html";
	})
	
	
//	声明
	var scrollTop,scrollHeight,windowHeight,selHeight,x1,x2,x3;
	//拉下加载更多	
	$(window).scroll(function(){
		scrollTop = $(this).scrollTop();
		scrollHeight = $(document).height();
		windowHeight = $(this).height();
		if(scrollTop + windowHeight == scrollHeight){}
		

		if(scrollTop + windowHeight == scrollHeight){
			PageIndex = PageIndex+1;
			$("body").on("touchstart",function(){
				x1=event.touches[0].clientY;
				$(this).on("touchmove",function(){	
					x2=event.touches[0].clientY;
					x3=x2-x1;
				}).on("touchend",function(){
					if(x3<-150&&(scrollHeight - scrollTop - windowHeight <=20)){
						if(PageIndex>1&&Total==$("#main > ol").eq(1).children().last().index()+1){
							$("#show2,.save_success").show();
							setTimeout(function(){
								$("#show2,.save_success").hide();
							},1000);
						}
					}
					x1=0;x2=0;x3=0;		//重置滑动距离
				})
			})
			//未分类的所有商品
			if(PageIndex>1&&Total!=$("#main > ol").eq(1).children().last().index()+1&&ProductClass == null){
				showLi();
			}
			if(PageIndex>1&&Total==$("#main > ol").eq(1).children().last().index()+1||ProductClass == null){return}
			showLi(ProductClass);
		}
	});
	
	$("#show2").click(function(){
		$("#show2,.save_success").hide();
	})
});
	