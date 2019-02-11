angular.module('controller_peripheral', [])
//首页tab切换
//.controller('nav_tab',function($scope,$state,$location){
//	var arr=['#/tab/Peripheral_ordersy','#/tab/Peripheral_ordersp','#/tab/Peripheral_ordersd','#/tab/peripheral_ordersk',]
//	var i=0;
//	//console.log(localStorage.getItem("sign_data"));
//	function views(){
//		if(localStorage.getItem("sign_data")){
//			if(localStorage.getItem("indextab")){
////				location=localStorage.getItem("indextab").split(",")[0]
//				$location.href=localStorage.getItem("indextab").split(",")[0]
//				for(var i=0;i<3;i++){			
//					angular.element("#nav>a").eq(i).children().eq(0).css("display","block").end().eq(1).css("display","none");
//				}
//				angular.element("#nav>a").eq(localStorage.getItem("indextab").split(",")[1]).children().eq(0).css("display","none").end().eq(1).css("display","block");
//			}else{
////				location=arr[1];
//				$location.href=arr[1];
//			}
//		}else{
//			angular.element("#nav").find("a").attr("href","#/sign");
////			location=arr[0];
//			$location.href=arr[0];
//		}
//	}
//	views();
//	angular.element("#nav>a").click(function(){
//		angular.element(this).removeClass("activated");
//		for(var i=0;i<3;i++){			
//			angular.element("#nav>a").eq(i).children().eq(0).css("display","block").end().eq(1).css("display","none");
//		}
//		angular.element(this).children().eq(0).css("display","none").end().eq(1).css("display","block");
//	}).eq(0).click(function(){
//		if(localStorage.getItem("sign_data")){
//			i++;
//			localStorage.setItem("indextab",arr[i%arr.length]+","+angular.element(this).index());
//			angular.element(this).attr("href",arr[i%arr.length])
//		}
//		
//	}).end().eq(1).click(function(){
//		if(localStorage.getItem("sign_data")){
//			localStorage.setItem("indextab","#/tab/Comunication_list,"+angular.element(this).index());
//			angular.element(this).attr("href","#/tab/Comunication_list")
//		}
//	}).end().eq(2).click(function(){
//		if(localStorage.getItem("sign_data")){
//			localStorage.setItem("indextab","#/tab/Person_info,"+angular.element(this).index());
//			angular.element(this).attr("href","#/tab/Person_info")
//		}
//	})
//	$scope.indexfn = function(){
//		if(!localStorage.getItem("sign_data")){
////			location="#/sign";
//			$location.href="#/sign";
//		}
//	}
//})


//首页tab切换
.controller('nav_tab',function($scope,$state){
//	var arr=['#/tab/Peripheral_ordersy','#/tab/Peripheral_ordersp','#/tab/Peripheral_ordersd','#/tab/Peripheral_ordersk',]
//	var arr2=['tab.Peripheral_ordersy','tab.Peripheral_ordersp','tab.Peripheral_ordersd','tab.Peripheral_ordersk',]
	var i=0;
	
	function views(){
		if(localStorage.getItem("sign_data")){
			$scope.user_type=localStorageget("already_sign").user_type
			if(localStorage.getItem("indextab")){
				$state.go(localStorage.getItem("indextab").split(",")[0])
				for(var i=0;i<3;i++){			
					angular.element("#nav>a").eq(i).children().eq(0).css("display","block").end().eq(1).css("display","none");
				}
				angular.element("#nav>a").eq(localStorage.getItem("indextab").split(",")[1]).children().eq(0).css("display","none").end().eq(1).css("display","block");
			}else{
				if($scope.user_type==2){
					$state.go("tab.Peripheral_ordersp");
				}else if($scope.user_type==3){
					$state.go('tab.Peripheral_ordersk');
				}else{
					
				}
//				$state.go(arr2[1]);
			}
		}else{
			angular.element("#nav").find("a").attr("href","#/sign");
			$state.go('tab.Peripheral_ordersy');
		}
	}
	views();
	angular.element("#nav>a").click(function(){
		angular.element(this).removeClass("activated");
		for(var i=0;i<3;i++){			
			angular.element("#nav>a").eq(i).children().eq(0).css("display","block").end().eq(1).css("display","none");
		}
		angular.element(this).children().eq(0).css("display","none").end().eq(1).css("display","block");
	}).eq(0).click(function(){
		if(localStorage.getItem("sign_data")){
			if($scope.user_type==2){
				localStorage.setItem("indextab","tab.Peripheral_ordersp,"+angular.element(this).index());
				angular.element(this).attr("href","#/tab/Peripheral_ordersp")
			}else if($scope.user_type==3){
				localStorage.setItem("indextab","tab.Peripheral_ordersk,"+angular.element(this).index());
				angular.element(this).attr("href","#/tab/Peripheral_ordersk")
			}else{
				
			}
//			i++;
//			localStorage.setItem("indextab",arr2[i%arr.length]+","+angular.element(this).index());
//			angular.element(this).attr("href",arr[i%arr.length])
		}
		
	}).end().eq(1).click(function(){
		if(localStorage.getItem("sign_data")){
			localStorage.setItem("indextab","tab.Comunication_list,"+angular.element(this).index());
			angular.element(this).attr("href","#/tab/Comunication_list")
		}
	}).end().eq(2).click(function(){
		if(localStorage.getItem("sign_data")){
//			localStorage.setItem("indextab","tab.Person_info,"+angular.element(this).index());
//			angular.element(this).attr("href","#/tab/Person_info");
			if($scope.user_type==2){
				localStorage.setItem("indextab","tab.Person_info,"+angular.element(this).index());
				angular.element(this).attr("href","#/tab/Person_info");
			}else if($scope.user_type==3){
				localStorage.setItem("indextab","tab.Person_info_express,"+angular.element(this).index());
				angular.element(this).attr("href","#/tab/Person_info_express");
			}else{
				
			}
		}
	})
	$scope.indexfn = function(){
		if(!localStorage.getItem("sign_data")){
//			location="#/sign";
			$state.go("sign");
		}
	}
})








//周边订单首页
//.controller("Main_refresh",['$scope','$timeout','$http','$location','$cordovaBarcodeScanner','$ionicSlideBoxDelegate','$state',function($scope,$timeout,$http,$location,$cordovaBarcodeScanner,$ionicSlideBoxDelegate,$state){
.controller("Main_refresh",function($scope,$timeout,$http,$location,$cordovaBarcodeScanner,$ionicSlideBoxDelegate,$state,serviceAjax){
	var timer;
	angular.element("body").on("touchstart",function(){
		angular.element(".state").fadeOut();
	})
	angular.element(".col").on("touchstart",function(){
		angular.element(".col").not(":eq("+angular.element(this).index()+")").css("background-color","rgba(0,0,0,0)").end().eq(angular.element(this).index()).css("background-color","rgba(0,0,0,0.3)");
		angular.element(".state_content").not(".state_content:eq("+angular.element(this).index()+")").css("display","none").end().eq(angular.element(this).index()).slideDown();
		
	})
	angular.element(".state .item").on("touchstart",function(){
		angular.element(".state").fadeIn();
		event.cancelBubble=true;
	}).not(".state_content_sp").children().on("touchstart",function(){
		angular.element(this).parent().find(".ic_radio_selected").attr("src","img/ic_radio_nomal.png")
		angular.element(this).children().children().attr("src","img/ic_radio_selected.png");;
	})
	angular.element(".state_content_sp").children().on("touchstart",function(){
		if(angular.element(this).children().children().attr("src")=="img/ic_radio_nomal.png"){
			angular.element(this).children().children().attr("src","img/ic_radio_selected.png").parent().parent().addClass("already_choose");
		}else{
			angular.element(this).children().children().attr("src","img/ic_radio_nomal.png").parent().parent().removeClass("already_choose");
		}
	})
	angular.element(".row_list").click(function(){
		if(angular.element(this).offset().top>48){
			angular.element(".state").css("padding-top",angular.element(this).offset().top-2);
		}else{
			angular.element(".state").css("padding-top","48px");
		}
	})
	//我的订单异步请求
	httpajax({
		"url": "?g=WebApi&m=orders&a=getmyorders",
		 "headers": {
	  	},
	  	"mimeType": "multipart/form-data",
	  	"data":{
	  		"page":"1"
	  	}
	},$http,myordersucessfn1)
	$scope.myorderif=false;
	function myordersucessfn1(response){
		var result=response.resultData;
		var nowtime=new Date();
		if(response.resultCode==100){
			console.log(result)
			try{
				$scope.newmyorder=result[0].order[0];
				$scope.newmyordertime=$scope.newmyorder.create_time.split(" ")[0];
				$scope.myorderif=true;
			}catch(err){
				
			}
		}
	}
	//获取周边定单
	function release_order(page,status,goods_kind_id,express_company_id,code){
		httpajax({
			"url": "?g=WebApi&m=orders&a=getAroundOrders",
			"headers": {
			},
			"mimeType": "multipart/form-data",
	  		"data": {
	  			"page":page,
	  			"status":status,
	  			"goods_kind_id":goods_kind_id,
	  			"express_company_id":express_company_id,
	  			"code":code
	  		}
		},$http,release_ordersuccessfn1)
	}
	release_order("1","1","1","1","156151")
	function release_ordersuccessfn1(response){
		var result=response.resultData;
		try{
			$scope.result_order=result.orders
//			console.log($scope.result_order)
		}catch(err){}
	}
	
	//快递员获取我的快递订单，已接受的最新订单
	function ExpressOrders(status,goods_kind_id,express_company_id){
		serviceAjax.httpajax({
			"url": "?g=WebApi&m=orders&a=getExpressOrders",
			"headers": {
			},
			"mimeType": "multipart/form-data",
	  		"data": {
	  			"page":1,
	  			"status":status,
	  			"goods_kind_id":goods_kind_id,
	  			"express_company_id":express_company_id,
	  		}
		})
	}
	
	
	
	
	
	
	
	
	
	
	
	//控制release_order_main发送者和接受者列表信息的开关
	$scope.nav_release=function(){
		//初始化创建订单
		localStorageset("sender_or_recipientsw1",{"sendersw":true,"recipientsw":true});
		localStorage.removeItem("type_of_goods");
		localStorage.removeItem("size_of_goods");
		localStorage.removeItem("weight_of_goods");
		localStorage.removeItem("remarks_word");
		localStorage.removeItem("already_choose_express");
		localStorageset("publish_way","0");
		localStorageset("agreed_begin","");
		localStorageset("agreed_end","");
		localStorageset("reward","")
		localStorage.removeItem("type_of_goodsid");
		localStorage.removeItem("choose_expressid");
		localStorage.removeItem("senderdz_detail");
		localStorage.removeItem("recipientdz_detail");
		$state.go('releaseordermain');
		
	}


	$scope.myAtiveSlide=0;
	$scope.statesw=true;
	$scope.doRefresh = function(){	
		$scope.statesw=false;
		$timeout(function(){
			$timeout(function(){
				$scope.statesw=true;
			},1000);
			$scope.$broadcast('scroll.refreshComplete');
		},2000);
	};
	$scope.fn = function(){
		if($scope.statesw){
			(function($){
				angular.element(".state").fadeIn();
			})(jQuery)
		}
	}
	$scope.indexfn = function(){
		if(!localStorage.getItem("sign_data")){
			location="#/sign";
		}
	}
	//二维码扫码功能
	$scope.$on('$ionicView.enter', function(e) {
	})
	$scope.scanBarcode = function() {
//		top.location="index.html";
	    $cordovaBarcodeScanner.scan().then(function(imageData) {
	    	//cordova.InAppBrowser.open(imageData.text, '_system', 'location=yes');
	//      alert(imageData.text);
	//      console.log("Barcode Format -> " + imageData.format);
	//      console.log("Cancelled -> " + imageData.cancelled);
	  	}, function(error) {
	//      console.log("An error happened -> " + error);
	    });
	}
	
	//轮播图片获取
	httpajax({
		url: "?g=WebApi&m=basic&a=getslide",
		method: "get",
		'headers': {
		}
	},$http,peripheral_carousel_figure)
	$scope.imgcarousel=[]
	function peripheral_carousel_figure(response){
		$scope.imgcarousel=response.resultData;
        $ionicSlideBoxDelegate.$getByHandle('slideimgs').update();
        $ionicSlideBoxDelegate.$getByHandle('slideimgs').loop(true);
	
	}
	
	
})


//快递单列表
.controller('express_order_list',function($scope,$state){
	function getDateStr(count){
		var datatime=new Date();
		datatime.setDate(datatime.getDate()+count)//获取日期及判断
		var y=datatime.getFullYear();
		var m=datatime.getMonth()+1;
		var d=datatime.getDate();
		return y+"-"+m+"-"+d;
	}
	$scope.list_all=[{
		'dataTime':getDateStr(0),
		'cost': 10,
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':1,
		'send_order':1
	},{
		'dataTime':getDateStr(0),
		'cost': 10,
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':2,
		'send_order':1
	},{
		'dataTime':getDateStr(-1),
		'cost': 10,
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':1,
		'send_order':1
	},{
		'dataTime':"2016-09-23",
		'cost': 10,
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':1,
		'send_order':1
	},{
		'dataTime':"2016-09-23",
		'cost': 350,
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':1,
		'send_order':1
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2,
		'order_kind':1
	}];
	
	
	$scope.list_accept=[{
		'dataTime':getDateStr(0),
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':1
	},{
		'dataTime':getDateStr(-1),
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1,
		'order_kind':2
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':1
	}];
	
	
	$scope.list_turnOut=[{
		'dataTime':getDateStr(0),
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2,
		'order_kind':1
	},{
		'dataTime':getDateStr(-1),
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2,
		'order_kind':2
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':2
	}];
	$scope.list_alreadyturnOut=[{
		'dataTime':getDateStr(0),
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':3,
		'order_kind':1
	},{
		'dataTime':getDateStr(-1),
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':3,
		'order_kind':2
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':3
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':3
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':3
	},{
		'dataTime':"2016-09-23",
		'area':'广东省深圳市',
		'area_detail':'禅城区季华六路九鼎国4座1112',
		'status':3
	}];
	function selectstatelist(arr){
		
		$scope.expressOrderList=arr;
		for(var i=0;i<$scope.expressOrderList.length;i++){
			
			if($scope.expressOrderList[i].dataTime==getDateStr(0)){
				$scope.expressOrderList[i].dataTime="今天";
			}else if($scope.expressOrderList[i].dataTime==getDateStr(-1)){
				$scope.expressOrderList[i].dataTime="昨天";
			}else{
				break;
			}
		}
		
	}
//	console.log(getDateStr(0));
	$scope.expressOrderList=[];
	selectstatelist($scope.list_all);
	angular.element(".header_a_select").children().bind("click",function(){
		
		angular.element(".header_a_select").find("a").removeClass("already_select");
		angular.element(this).addClass("already_select");
		switch(angular.element(this).index()){
			case 0:
				$scope.expressOrderList=[];
				selectstatelist($scope.list_all);
				break;
			case 1:
				$scope.expressOrderList=[];
				selectstatelist($scope.list_accept)
				break;
			case 2:
				$scope.expressOrderList=[];
				selectstatelist($scope.list_turnOut)
				break;
			case 3:
				$scope.expressOrderList=[];
				selectstatelist($scope.list_alreadyturnOut)
				break;
			default:
		}
		$scope.$apply()
	})
	
	$scope.expressOrderListDetail=function(order_kind){
		
		switch(order_kind){
			case 1:
				$state.go("reward_order_get");
			break;
			case 2:
				$state.go("order_appointment");
			break;
			default:;
		}
	}
	$scope.send_order=function(){
		$state.go("release_order_choosepeo");
		event.cancelBubble=true;
	}
	
	
})

//我的订单 My_order_management
.controller("my_order_management",function($scope,$http,$state){
	//我的订单异步请求
	httpajax({
		"url": "?g=WebApi&m=orders&a=getmyorders",
		 "headers": {
	  	},
	  	"mimeType": "multipart/form-data",
	  	"data":{
	  		"page":"1"
	  	}
	},$http,myordersucessfn1)
	function myordersucessfn1(response){
		var result=response.resultData;
//		var nowtime=new Date();
		if(response.resultCode==100){
			$scope.myorder=result;
		}else{
			try{
				navigator.notification.alert(sign_data.resultMsg,null,"提醒");
			}catch(err){
				alert(sign_data.resultMsg);
			}
		}
	}
	
	angular.element(".header_a_select").children().bind("click",function(){
		angular.element(".header_a_select").find("a").removeClass("already_select");
		angular.element(this).addClass("already_select");
		$scope.$apply()
	})
	$scope.evaluate=function(){
		$state.go("Order_comment");
		event.cancelBubble=true;
	}
	
})

//订单评价	Order_comment
.controller("order_comment",function($scope,$http,$state){
	angular.element(".comment_star>img").bind("click",function(){
//		console.log(angular.element(this).attr("src"))
		var imgsrc=angular.element(this).attr("src");
		if(imgsrc=="img/ic_star_nomal.png"){
				angular.element(this).attr("src","img/ic_star_selected.png").prevUntil("span").attr("src","img/ic_star_selected.png").end().nextAll().attr("src","img/ic_star_nomal.png");
		}else{
			angular.element(this).attr("src","img/ic_star_nomal.png").nextAll().attr("src","img/ic_star_nomal.png");
		}
	})
	angular.element(document).find('textarea').bind('keyup',function(){
		angular.element(this).outerHeight(0).outerHeight(this.scrollHeight);
		if(angular.element(this).val()!=''){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#333"})
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
//			console.log(44)
		}
	})
	angular.element(".btn01").bind("click",function(){
		if(angular.element("textarea").val()!=''){
			angular.element(".tip").fadeIn().fadeOut(function(){
				$state.go('My_order_management')
			})
		}else{
			return false;
		}
	})

	
})






