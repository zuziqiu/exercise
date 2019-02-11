angular.module('personsign_info_controller',[])

//登录
.controller('sign_in',function($scope,$http,$ionicLoading,serverGeolocation){
	if(angular.element(".user").val()!=""&&angular.element(".password").val()!=""){
		angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
	}
	angular.element(".user").keydown(function(){
		if(reg_userup.test(angular.element(".user").val())){	
			user_val=angular.element(this).val();
		}
	})
	angular.element("input").keyup(function(){
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(!reg_userup.test(angular.element(".user").val())){
			angular.element(".user").val(user_val);
		}
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".user").val()!=""&&angular.element(".password").val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	angular.element("#sign").on("touchstart",function(){
		var reg_user=/^\d{11}$/;
		var reg_pass=/^\S{6,20}$/;
		w_url=angular.element(this).attr("data-url");
		if(reg_user.test(angular.element(".user").val())&&reg_pass.test(angular.element(".password").val())){
			if(!error_sw){
				error_sw=true;
				httpajax({
					  "url": "/WebApi/Login/mobilesSignIn",
					  "headers": {
					    "postman-token": "f9066151-541e-202d-f9c3-d05ba690256f"
					},
					  "data":{
					    "mobile": angular.element(".user").val(),
					    "password": angular.element(".password").val()
					  }
				},$http,sign_insuccessfn);
			}
		}else if(angular.element(".user").val()==""||angular.element(".password").val()==""){
			return false;
		}else{
			
			try{
				navigator.notification.alert("请正确填写您的信息",null,"提醒");
			}catch(err){
				alert("请正确填写您的信息");
			}
		}
	});
	function sign_insuccessfn(response){
		var sign_data=response;
		
//		for(var i=0;i<error_arr.length;i++){
//			if(error_arr[i]==sign_data.resultCode){
//				error_sw=true;
//				break;
//			}
//		}
//		if(error_sw){
//			error_sw=false;
//			
//			try{
//				navigator.notification.alert(sign_data.resultMsg,null,"提醒");
//			}catch(err){
//				alert(sign_data.resultMsg);
//			}
//		}else{
//			console.log(sign_data);
//			localStorageset("already_sign",sign_data.resultData);
//			localStorageset("password",angular.element(".password").val());
//			localStorageset("access_token",sign_data.resultData.access_token)
//			localStorage.setItem("sign_data",true);
//			serverGeolocation.Geolocationabj(function(address,area_id){
//				console.log(address,area_id);
//				angular.element(".tip").fadeIn().fadeOut(function(){
//							error_sw=false;
//							location=w_url;
//				});
//			})
//		}
		
		if(sign_data.resultCode==100){
//			console.log(sign_data);
			localStorageset("already_sign",sign_data.resultData);
			localStorageset("password",angular.element(".password").val());
			localStorageset("access_token",sign_data.resultData.access_token)
			localStorage.setItem("sign_data",true);
			serverGeolocation.Geolocationabj(function(address,area_id){
				console.log(address,area_id);
				angular.element(".tip").fadeIn().fadeOut(function(){
					location=w_url;
					error_sw=false;
				});
			})
		}else{
			error_sw=false;
			try{
				navigator.notification.alert(sign_data.resultMsg,null,"提醒");
			}catch(err){
				alert(sign_data.resultMsg);
			}
		}
		
	}
})

//注册
.controller('register',function($scope,$http){
	var sw=true;
	var t=60;
	var mobile_data=null;
	var register_data=null;
	angular.element(".user").keydown(function(){
		if(reg_userup.test(angular.element(".user").val())){	
			user_val=angular.element(this).val();
		}
	})
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(!reg_userup.test(angular.element(".user").val())){
			angular.element(".user").val(user_val);
		}
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".user").val()!=""&&angular.element(".YZ").val()!=""&&register_data==100){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	
	angular.element(".btn01").on("touchstart",function(){
		var reg_user=/^\d{11}$/;
		var reg_pass=/^\w{4,6}$/;
		w_url=angular.element(this).attr("data-url");
		if(reg_user.test(angular.element(".user").val())&&reg_pass.test(angular.element(".YZ").val())&&register_data==100){
			localStorage.setItem("register_data",[angular.element(".user").val(),angular.element(".YZ").val()]);
			location=w_url;
		}else if(angular.element(".user").val()==""||angular.element(".YZ").val()==""||register_data!=100){
			return false;
		}else{
			try{
				navigator.notification.alert("请正确填写您的信息",null,"提醒");
			}catch(err){
				alert("请正确填写您的信息");
			}
		}
	})
	angular.element(".register_get01").on("touchstart",function(){
		var reg_user=/^\d{11}$/;
		if(sw&&reg_user.test(angular.element(".user").val())){
			sw=false;
			countdown();
		}else if(!sw){
			return false;
		}else{
			try{
				navigator.notification.alert("请正确填写您的信息",null,"提醒");
			}catch(err){
				alert("请正确填写您的信息");
			}
		}
	});
	
	
	function register_successfn(response){
		register_data=response.resultCode;
		console.log(register_data)
		if(register_data!=100){
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg);
			}
			sw=true;
		}else{
			clearInterval(timer);
			angular.element(".register_get01").html(t+"秒后重发").css("color","#999");
			var timer=setInterval(function(){
				t--;
				angular.element(".register_get01").html(t+"秒后重发").css("color","#999");
				if(t<=0){
					clearInterval(timer);
					t=60;
					angular.element(".register_get01").html("获取验证码").css("color","#000");
					sw=true
				}
			},1000);
		}
	}
	function countdown(){
		mobile_data=angular.element(".user").val();
		httpajax({
				  "url": "/WebApi/Login/sendPinSignUp/",
				  "headers": {
				    "postman-token": "3f18ff9f-e1d2-e372-78da-1197fcb133eb"
			},
			"data": {
				"mobile":mobile_data
			}
		},$http,register_successfn);
	}
	
	
	
})



.controller('registerPass',function($scope,$http,serverGeolocation){
	//注册通过获取localStorage内容
	var lregister_data;
	angular.element("input").keyup(function(){
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".password").val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	angular.element(".btn01").on("touchstart",function(){
		var reg_pass=/^\S{6,20}$/;
		lregister_data=localStorage.getItem("register_data").split(",");
		w_url=angular.element(this).attr("data-url");
		if(reg_pass.test(angular.element(".password").val())){		
			if(!error_sw){
				error_sw=true;
				httpajax({
					"url": "/WebApi/Login/mobilesSignUp",
					"headers": {
					},
					"data": {
						"mobile":lregister_data[0],
					    "password":angular.element(".password").val(),
					    "code":lregister_data[1]
					}
				},$http,registerpass_successfn)
			}
		}else if(angular.element(".password").val()==""){
			return false;
		}else{
			try{
				navigator.notification.alert("请输入非空格，6到20位的密码",null,"提醒");
				error_sw=false;
			}catch(err){
				alert("请输入非空格，6到20位的密码");
			}
		}
	})
	
	$scope.gosign=function(){
		location="#/register";
	}
	//注册通过ajax请求成功调用函数
	function registerpass_successfn(response){
		var register_data=response;
		if(register_data.resultCode==100){
			httpajax({
				  "url": "/WebApi/Login/mobilesSignIn",
				  "headers": {
				    "postman-token": "f9066151-541e-202d-f9c3-d05ba690256f"
				},
				  "data":{
				    "mobile": lregister_data[0],
				    "password": angular.element(".password").val()
				  }
			},$http,sign_insuccessfn);
			
//			angular.element(".tip").fadeIn().fadeOut(function(){
//				localStorage.setItem("register_data",lregister_data[lregister_data.lenght]+angular.element(".password").val())
//				localStorage.setItem("sign_data",true);
//				location=w_url;
//			});
		}else{
			try{
				navigator.notification.alert(register_data.resultMsg,null,"提醒");
			}catch(err){
				alert(register_data.resultMsg);
			}
		}
	}
	//注册成功登录到主页异步请求回调函数
	function sign_insuccessfn(response){
		var sign_data=response;
		console.log(sign_data);
//		for(var i=0;i<error_arr.length;i++){
//			if(error_arr[i]==sign_data.resultCode){
//				error_sw=true;
//				break;
//			}
//		}
//		if(error_sw){
//			error_sw=false;
//			
//			try{
//				navigator.notification.alert(sign_data.resultMsg,null,"提醒");
//			}catch(err){
//				alert(sign_data.resultMsg,null,"提醒");
//			}
//		}else{
//			angular.element(".tip").fadeIn().fadeOut(function(){
//				error_sw=false;
//				localStorageset("password",angular.element(".password").val());
//				localStorage.setItem("register_data",lregister_data[lregister_data.lenght]+angular.element(".password").val())
//				localStorageset("already_sign",sign_data.resultData);
//				localStorageset("access_token",sign_data.resultData.access_token)
//				localStorage.setItem("sign_data",true);
//				location=w_url;
//			});
//		}
		
		if(sign_data.resultCode==100){
//			console.log(sign_data);
			localStorageset("password",angular.element(".password").val());
			localStorage.setItem("register_data",lregister_data[lregister_data.lenght]+angular.element(".password").val())
			localStorageset("already_sign",sign_data.resultData);
			localStorageset("access_token",sign_data.resultData.access_token)
			localStorage.setItem("sign_data",true);
			serverGeolocation.Geolocationabj(function(address,area_id){
				console.log(address,area_id);
				angular.element(".tip").fadeIn().fadeOut(function(){
					location=w_url;
					error_sw=false;
				});
			})
		}else{
			error_sw=false;
			try{
				navigator.notification.alert(sign_data.resultMsg,null,"提醒");
			}catch(err){
				alert(sign_data.resultMsg);
			}
		}
	}
	
	
})

.controller('retrieverPassword',function($scope){
	angular.element(".user").keydown(function(){
		if(reg_userup.test(angular.element(".user").val())){	
			user_val=angular.element(this).val();
		}
	})
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(!reg_userup.test(angular.element(".user").val())){
			angular.element(".user").val(user_val);
		}
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".user").val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	angular.element(".btn01").on("touchstart",function(){
		var reg_user=/^\d{11}$/;
		w_url=angular.element(this).attr("data-url");
		if(reg_user.test(angular.element(".user").val())){
			location=w_url;
		}else if(angular.element(".user").val()==""||angular.element(".password").val()==""){
			return false;
		}else{
			
			try{
				navigator.notification.alert("请正确填写您的信息",null,"提醒");
			}catch(err){
				alert("请正确填写您的信息");
			}
		}
	})
})
.controller('retrieverYz',function($scope){
	var t=60;
	var sw=true;
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".YZ").val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	
	angular.element(".btn01").on("touchstart",function(){
		var reg_pass=/^\w{4,6}$/;
		var w_url=angular.element(this).attr("data-url");
		if(reg_pass.test(angular.element(".YZ").val())){
			location=w_url;
		}else if(angular.element(".YZ").val()==""){
			return false;
		}else{
			
			try{
				navigator.notification.alert("请正确填写您的验证码",null,"提醒");
			}catch(err){
				alert("请正确填写您的验证码");
			}
		}
	})
	angular.element(".retrieverYz_get01").on("touchstart",function(){
		if(sw){
			sw=false;
			angular.element(".YZ").removeAttr("disabled")
			countdown();
		}else{
			return false;
		}
	})
	function countdown(){
		clearInterval(timer);
		angular.element(".retrieverYz_get01").html(t+"秒后重发").css("color","#999");
		var timer=setInterval(function(){
			t--;
			angular.element(".retrieverYz_get01").html(t+"秒后重发").css("color","#999");
			if(t<=0){
				clearInterval(timer);
				t=60;
				angular.element(".retrieverYz_get01").removeAttr("disabled").html("获取验证码").css("color","#000");
				sw=true;
			}
		},1000);
	}
})

.controller('retrieverPass',function($scope){
	angular.element("input").keyup(function(){
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".password").val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	angular.element(".btn01").on("touchstart",function(){
		var reg_pass=/^\S{6,20}$/;
		w_url=angular.element(this).attr("data-url");
		if(reg_pass.test(angular.element(".password").val())){
			localStorage.setItem("sign_data",true);
			angular.element(".tip").fadeIn().fadeOut(function(){
				
				location=w_url;
			});
		}else if(angular.element(".password").val()==""){
			return false;
		}else{
			
			try{
				navigator.notification.alert("请输入非空格，6到20位的密码",null,"提醒");
			}catch(err){
				alert("请输入非空格，6到20位的密码",null,"提醒");
			}
		}
	})
})

//登陆界面
var user_val;
var reg_userup=/^\d*$/,w_url="";


