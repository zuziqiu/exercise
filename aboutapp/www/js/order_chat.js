angular.module("order_chat",[])
.controller('chatInterface',function($scope,$ionicScrollDelegate){
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
		angular.element(".add_friend").on("touchstart",function(){
			angular.element(".add-check").fadeOut(function(){
				angular.element(".chat_content").css("padding-top","16px");
			})
			event.cancelBubble=true;
		})
		angular.element("#send_go").on("touchstart",function(){
			var nowtime=new Date();
			var nowMinutes=nowtime.getMinutes();
			if(nowtime.getMinutes()<10){
				nowMinutes="0"+nowtime.getMinutes();
			}
			if(nowMinutes==oldMinutes){
				angular.element(".chat_content").append("<div class='chat_right'><p style='background-color:#eee;margin:0;'></p><div><div></div>"+angular.element("#write").val()+"</div></div>");
			}else{
				oldMinutes=nowMinutes;
				angular.element(".chat_content").append("<div class='chat_right'><p>"+nowtime.getHours()+":"+nowMinutes+"</p><div><div></div>"+angular.element("#write").val()+"</div></div>");
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
		
		angular.element(".chat_leave").on("touchstart",function(){
			angular.element(".send_body1").slideUp();
			angular.element("#chat").css("display","none")
			angular.element("#detail_main").slideDown();
		})
	$scope.scrollbottom=function(){
		$ionicScrollDelegate.scrollBottom();
	}
	
	var send_body1_sw=true;
	$scope.sendtop = function(){
			send_body1_sw=true;
			angular.element(".send_top").css("bottom","");
			angular.element(".send_body1").slideUp(function(){
//				console.log(angular.element("#send").outerHeight());
				angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
			});
			angular.element("#detail_main").css("display","none")
			angular.element("#chat").slideDown();
			angular.element("textarea[name=write_something]").focus();
	}
	$scope.add_scrollbottom=function(){
			angular.element("#detail_main").css("display","none")
			angular.element("#chat").slideDown();
			if(send_body1_sw){
				send_body1_sw=false;
				angular.element("textarea[name=write_something]").blur();
				angular.element(".send_top").css("bottom",angular.element(".send_body1").outerHeight());
				angular.element(".send_body1").slideDown(function(){
					angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+68).prevAll().css("padding-bottom",0);
					$ionicScrollDelegate.scrollBottom();
				});
			}else{
				send_body1_sw=true;
				angular.element(".send_top").css("bottom","");
				angular.element(".send_body1").slideUp(1,function(){
					angular.element("textarea[name=write_something]").focus();
					angular.element(".chat_content>div:nth-last-of-type(1)").css("padding-bottom",angular.element("#send").outerHeight()+20).prevAll().css("padding-bottom",0);
					$ionicScrollDelegate.scrollBottom();
				});
			}
		event.cancelBubble=true;
	}
})