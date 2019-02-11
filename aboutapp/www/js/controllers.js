

//可删除文件


var arr1=["img/list_bottom.png","img/list_top.png"];
var count=0;
angular.module('ionicApp', ['ionic'])
//发布信息(总)
//.config(function($stateProvider){
//	$stateProvider
//		.state("index",{
//			templateUrl:"index.html"
//		})
//		.state("Release_order-selectks",{
//			templateUrl:"Release_order_selectks.html"
//		});
//}).controller("Release_order",function($scope,$state){
//	$state.go("index");
//})
//发布信息主页面
.controller("cargo_info",function($scope){
	$scope.select = function(){
		count++;
		$(".cargo_info>.detailed").stop(true);
		$(".cargo_info>div").eq(0).css("border-bottom-width",count%arr1.length+"px").find("img").attr("src",arr1[count%arr1.length]);
		if(arr1[count%arr1.length]=="img/list_top.png"){
			$(".cargo_info>.detailed").slideDown();
			
		}else{
			$(".cargo_info>.detailed").slideUp();
		}
	}
})
//选择快递员界面快递员列表
.controller("chooseExpressman",function($scope){
	$scope.expressmanrecords = [{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'威猛的小老虎',
		'Content':'顺丰快递 | 800m',
		'minimgUrl':['img/list_shunfeng.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'小老虎',
		'Content':'申通快递 | 800m',
		'minimgUrl':['img/list_shengtong.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'粉红色的鸡叔',
		'Content':'这是我独特有个性的个性签名',
		'minimgUrl':['',false]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'刚果来的小肥牛poipoi',
		'Content':'邮政物流 | 800m',
		'minimgUrl':['img/list_baogou.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'粉红色的鸡叔',
		'Content':'这是我独特有个性的个性签名',
		'minimgUrl':['',false]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'鸡叔',
		'Content':'顺丰快递 | 800m',
		'minimgUrl':['img/list_shunfeng.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'鸡叔',
		'Content':'顺丰快递 | 800m',
		'minimgUrl':['img/list_shunfeng.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'鸡叔',
		'Content':'顺丰快递 | 800m',
		'minimgUrl':['img/list_shunfeng.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'鸡叔',
		'Content':'顺丰快递 | 800m',
		'minimgUrl':['img/list_shunfeng.png',true]
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'',
		'Name':'鸡叔',
		'Content':'顺丰快递 | 800m',
		'minimgUrl':['img/list_shunfeng.png',true]
	}];
	
	$scope.loca = function(){
		top.location="Order_detail_main.html"
	}
})

//聊天界面
.controller("chatInterface",function($scope,$ionicScrollDelegate){
	$scope.scrollbottom=function(){
		$ionicScrollDelegate.scrollBottom();
	}
	
	$scope.send_body1_sw=true;
	$scope.sendtop = function(){
		$scope.send_body1_sw=true;
		$(".send_body1").slideUp(function(){
			$(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",$("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
		});
		$("#detail_main").css("display","none")
		$("#chat").slideDown();
		$("textarea[name=write_something]").focus();
	}
	$scope.add_scrollbottom=function(){
		$("#detail_main").css("display","none")
		$("#chat").slideDown();
		if($scope.send_body1_sw){
			$scope.send_body1_sw=false;
			$("textarea[name=write_something]").blur();
			$(".send_body1").slideDown(function(){
				$(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",$("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
				$ionicScrollDelegate.scrollBottom();
			});
		}else{
			$scope.send_body1_sw=true;
			$(".send_body1").slideUp(1,function(){
				$("textarea[name=write_something]").focus();
				$(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",$("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
				$ionicScrollDelegate.scrollBottom();
			});
		}
		event.cancelBubble=true;
	}
})
