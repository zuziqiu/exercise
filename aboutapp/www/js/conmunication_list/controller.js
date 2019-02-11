angular.module('conmunication_list_controller',[])
.controller('chatList',function($scope,$state,$http){
	angular.element(".location_marker>div").click(function(){
		angular.element(".location_marker").find("div").removeClass("location_marker_choose")
		angular.element(this).addClass("location_marker_choose");
	})
//	angular.element(".friend_search").click(function(){
//		if(angular.element("input").val()!=""){
//			angular.element(".friend_list").children().css("display","block");
//		}
//	})
//	angular.element(".add_friend").click(function(){
//		angular.element(this).css({"background-color":"#e6e6e6","border-color":"#d1d1d1"}).html("<img src='img/list_finish.png' style='width:30%;' alt='' />")
//	})
	
	
	//聊天列表
	$scope.list=[{
		'imgUrl':'img/ic_message.png',
		'dataUrl':'#/personal_newt',
		'Name':'消息推送',
		'Time':'',
		'Content':'你的订单于2015年12月12日12:12被派送出去'
	},{
		'imgUrl':'img/ic_requests.png',
		'dataUrl':'#/personal_newf',
		'Name':'好友申请',
		'Time':'',
		'Content':'快递员牛魔王申请添加您为好友'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'KOFFING',
		'Time':'12:12',
		'Content':'对话内容：哈哈'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	},{
		'imgUrl':'img/header.png',
		'dataUrl':'#/Chats',
		'Name':'程序员',
		'Time':'12:12',
		'Content':'大家好我是程序员,以后叫我程序员就好了'
	}];
	
	$scope.newt_list=[{
		'imgUrl':'img/list_shunfeng.png',
		'Name':'订单状态',
		'Time':'12:23',
		'Content':'您的订单264648464852246846已被签收，谢谢您使用顺丰快递.如有疑问请咨询客服'
	},{
		'imgUrl':'img/list_shunfeng.png',
		'Name':'订单状态',
		'Time':'12:23',
		'Content':'您的订单264648464852246846已被签收，谢谢您使用顺丰快递.如有疑问请咨询客服'
	},{
		'imgUrl':'img/list_shunfeng.png',
		'Name':'订单状态',
		'Time':'12:23',
		'Content':'您的订单264648464852246846已被签收，谢谢您使用顺丰快递.如有疑问请咨询客服'
	},{
		'imgUrl':'img/list_shunfeng.png',
		'Name':'订单状态',
		'Time':'12:23',
		'Content':'您的订单264648464852246846已被签收，谢谢您使用顺丰快递.如有疑问请咨询客服'
	}]
	
	$scope.ontap=function(){
//		console.log(this.x.dataUrl)
//		$state.go(this.x.dataUrl);
	}
	
	//搜索添加好友
	$scope.friendSearch=function(){
		httpajax({
			"url": "?g=WebApi&m=user&a=searchFriends",
			'headers': {
			},
			"data":{
    			"condition": angular.element("input").val()
			}
		},$http,friendSearchsuccessfn1)
	}
	$scope.addFriend=function(id){
		httpajax({
			"url": "?g=WebApi&m=user&a=addFriend",
			'headers': {
			},
			"data":{
    			 "id": id
			}
		},$http,agreeFriendsuccessfn1)
	}
	function friendSearchsuccessfn1(response){
		console.log(response)
		if(response.resultCode==100){
			$scope.friendSearchList=response.resultData;
			$scope.has_add=$scope.friendSearchList[0].has_add;
			console.log($scope.has_add)
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg)
			}
		}
	}
	function agreeFriendsuccessfn1(response){
		console.log(response);
		if(response.resultCode==100){
			$scope.has_add=true
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg)
			}
		}
	}
	
})

//好友列表
.controller('friendsList',function($scope,$state,$http,factoryDistance){
	angular.element(".location_marker>div").click(function(){
		angular.element(".location_marker").find("div").removeClass("location_marker_choose")
		angular.element(this).addClass("location_marker_choose");
	})
	//好友列表
//	$scope.friends_list=[{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'威猛的小老虎',
//		'Content':'顺丰快递 | 800m',
//		'minimgUrl':['img/list_shunfeng.png',true]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'小老虎',
//		'Content':'申通快递 | 800m',
//		'minimgUrl':['img/list_shengtong.png',true]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'粉红色的鸡叔',
//		'Content':'这是我独特有个性的个性签名',
//		'minimgUrl':['',false]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'刚果来的小肥牛poipoi',
//		'Content':'邮政物流 | 800m',
//		'minimgUrl':['img/list_baogou.png',true]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'粉红色的鸡叔',
//		'Content':'这是我独特有个性的个性签名',
//		'minimgUrl':['',false]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'鸡叔',
//		'Content':'顺丰快递 | 800m',
//		'minimgUrl':['img/list_shunfeng.png',true]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'鸡叔',
//		'Content':'顺丰快递 | 800m',
//		'minimgUrl':['img/list_shunfeng.png',true]
//	},{
//		'imgUrl':'img/header.png',
//		'dataUrl':'#/Chats',
//		'Name':'鸡叔',
//		'Content':'顺丰快递 | 800m',
//		'minimgUrl':['img/list_shunfeng.png',true]
//	}];



	//获取好友列表
	httpajax({
		"url": "?g=WebApi&m=user&a=getFriendsList",
  		"method": "GET",
		'headers': {
		}
	},$http,successfn1)
	
	//删除好友请求
	$scope.deleteFriend=function(){
		$scope.Popupmainshow=false;
		$scope.friends_list.splice($scope.friends_list.indexOf($scope.deleteContain),1);
		httpajax({
			"url": "?g=WebApi&m=user&a=deleteFriend",
			"headers": {
			},
			"data": {
			    "id": $scope.deleteFriendId
			}
		},$http,successfn2)
	}
	function successfn1(response){
		if(response.resultCode==100){
			$scope.friends_list=response.resultData
			for(var i=0;i<$scope.friends_list.length;i++){
				if($scope.friends_list[i].user_type==3){
					factoryDistance.Distanceobj($scope.friends_list[i].courier_attrs.longitude,$scope.friends_list[i].courier_attrs.latitude,function(distance){
						$scope.friends_list[i].distance=" | "+distance;
					})
				}
			}
//			console.log($scope.friends_list)
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg)
			}
		}
	}
	function successfn2(response){
		console.log(response)
	}
	//删除好友弹窗
	$scope.Popupmainshow=false;
	$scope.Popupmainshowclick=function(id,contain){
		if(id){
			$scope.deleteFriendId=id;
			$scope.deleteContain=contain;
		}
		$scope.Popupmainshow=!$scope.Popupmainshow;
		
	}
	$scope.Popupclick=function(){
		event.cancelBubble=true;
	}
})





//好友申请 personal_newf
.controller('personalNewf',function($scope,$state,$http){
	//获取好友申请列表
	httpajax({
		"url": "?g=WebApi&m=user&a=getApplyFriendsList",
		"method": "GET",
		"headers": {
		}
	},$http,successfn1)
	//同意好友申请
	$scope.agreeFriend=function(id){
		$scope.this_index=this.$index;
		httpajax({
			"url": "?g=WebApi&m=user&a=agreeFriend",
			"headers": {
			},"data": {
			    "id": id
			}
		},$http,successfn2)
	}
	function successfn1(response){
		if(response.resultCode==100){
			$scope.agreeFriendslist=response.resultData;
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg)
			}
		}
	}
	function successfn2(response){
		if(response.resultCode==100){
			$scope.agreeFriendslist[$scope.this_index].type="1";
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg)
			}
		}
	}
	
})
//个人通知
.controller('personalNewt',function($scope,$state,$http){
	httpajax({
		"url": "?g=WebApi&m=orders&a=getNotifyLists",
		"method": "GET",
		"headers": {
		},
		"mimeType":"multipart/form-data",
		
	},$http,successfn1)
	function successfn1(response){
		console.log(response)
	}
})










.controller('chats',function($scope,$ionicScrollDelegate){
	var oldMinutes;
	angular.element("#write").keyup(function(){
		angular.element(this).height(0).height(this.scrollHeight);
		if(angular.element(this).val()!=""){
			angular.element("#send_go").fadeIn();
			angular.element("#send_add").fadeOut(0);
		}else{
			angular.element("#send_add").fadeIn();
			angular.element("#send_go").fadeOut(0);
		}
	})
	angular.element("#send_go").on("touchstart",function(){
		var nowtime=new Date();
		var nowMinutes=nowtime.getMinutes();
		if(nowtime.getMinutes()<10){
			nowMinutes="0"+nowtime.getMinutes();
		}
		if(nowMinutes==oldMinutes){
			angular.element(".chat_content").append("<div class='chat_right'><p style='background-color:#eee;margin:0;'></p><div><div ng-click=nextgo('My_details')></div>"+angular.element("#write").val()+"</div></div>");
		}else{
			oldMinutes=nowMinutes;
			angular.element(".chat_content").append("<div class='chat_right'><p>"+nowtime.getHours()+":"+nowMinutes+"</p><div><div ng-click=nextgo('My_details')></div>"+angular.element("#write").val()+"</div></div>");
		}
		angular.element("#write").val("").height(16);
		angular.element("#send_go").fadeOut(1,function(){
			angular.element("textarea[name=write_something]").focus();
			$ionicScrollDelegate.scrollBottom();
		});
		angular.element("#send_add").fadeIn();
//			console.log(angular.element("#send").outerHeight());
		angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
		event.cancelBubble=true;
	})
		
	$scope.scrollbottom=function(){
		$ionicScrollDelegate.scrollBottom();
	}
	
	var send_body1_sw=true;
	$scope.sendtop = function(){
			send_body1_sw=true;
//			angular.element(".send_top").css("bottom","");
			angular.element(".send_body1").slideUp(function(){
//				console.log(angular.element("#send").outerHeight());
				angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
			});
//			angular.element("#detail_main").css("display","none")
//			angular.element("#chat").slideDown();
			angular.element("textarea[name=write_something]").focus();
	}
	$scope.add_scrollbottom=function(){
//			angular.element("#detail_main").css("display","none")
//			angular.element("#chat").slideDown();
			if(send_body1_sw){
				send_body1_sw=false;
				angular.element("textarea[name=write_something]").blur();
//				angular.element(".send_top").css("bottom",angular.element(".send_body1").outerHeight());
				angular.element(".send_body1").slideDown(function(){
//					angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+68).prevAll().css("padding-bottom",0);
					angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
					$ionicScrollDelegate.scrollBottom();
				});
			}else{
				send_body1_sw=true;
//				angular.element(".send_top").css("bottom","");
				angular.element(".send_body1").slideUp(1,function(){
					angular.element("textarea[name=write_something]").focus();
					angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
					$ionicScrollDelegate.scrollBottom();
				});
			}
		event.cancelBubble=true;
	}
})
