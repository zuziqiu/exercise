angular.module("person_info_controller",[])
.controller('personInfo',function($scope,$http,$ionicLoading){
//	$ionicLoading.show({"template":"加载中"})
	httpajax({
		"url": "?g=WebApi&m=user&a=getUserInfo",
		"headers": {
		    "apitoken": "wCaRY9wFXm35F6s0iksHt3dCGvnrvMQ9",
		    "postman-token": "33f73a02-9ea8-5e79-659e-01f5094ef2ea"
		},
		"mimeType": "multipart/form-data"
	},$http,successfn1)
	function successfn1(response){
		$scope.list1=response.resultData;
//		$ionicLoading.hide();
//		console.log($scope.list1)
	}
	
})
.controller('personInfosz',function($scope){
	angular.element(".btn01").on("touchstart", function () {
		angular.element(".tip").fadeIn().fadeOut(function () {
		      localStorage.clear();
//			      localStorage.setItem("sign_data",false);
		      location = "#/tab";
		 });
	})
	angular.element("#clear").on("touchstart", function () {
		var sign_data_val = window.localStorage.getItem("sign_data");
		window.localStorage.clear();
		localStorage.setItem("sign_data", sign_data_val);
	})
})



.controller('personInfozl',function($scope,$http,$ionicLoading,$state,$cordovaFileTransfer){
	$ionicLoading.show({"template":"加载中"})
	httpajax({
		"url": "?g=WebApi&m=user&a=getUserInfo",
		"headers": {
		    "apitoken": "wCaRY9wFXm35F6s0iksHt3dCGvnrvMQ9",
		    "postman-token": "33f73a02-9ea8-5e79-659e-01f5094ef2ea"
		},
		"mimeType": "multipart/form-data"
	},$http,successfn1)
	function successfn1(response){
		$scope.list1=response.resultData;
		localStorageset("person_infozltxt",$scope.list1)
		$ionicLoading.hide();
//		console.log($scope.list1)
	}
	angular.element(".btn01").on("touchstart",function(){
		angular.element(".tip").fadeIn().fadeOut(function(){
			location='#/tab';
		});
	})
	angular.element("#head_portrait").on("click",function(){
		angular.element("#head_select").show();
	})
	angular.element("#cancle").add("#head_select").on("click",function(){
		angular.element("#head_select").hide();
	})
	angular.element("#head_select_content").on("click",function(){
		event.cancelBubble=true;
	})
	
//	$scope.$watch("addpersonaddress.person_name",function(newValue,oldValue){
//		$scope.addpersonaddress.person_name=newValue;
//  })
	

    //所有获取图片失败都回调此函数
    function onLoadImageFail(message) {
        
        try{
			navigator.notification.alert("操作失败，原因：" + message, null, "警告");
		}catch(err){
			alert("操作失败，原因：" + message);
		}
    }
    
    $scope.loadImageLocal=function(){
        //获取本地图片并显示在屏幕
        navigator.camera.getPicture(onLoadImageLocalSuccess, onLoadImageFail, {
            destinationType: Camera.DestinationType.FILE_URI,
//          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            sourceType: 0,
            quality:100,
//          //====关键设置=======================================
		    allowEdit:true, //出现裁剪框
		    targetWidth:200,//图片裁剪高度
		    targetHeight:200//图片裁剪高度
        });
    }
    //本地图片选择成功后回调此函数
    function onLoadImageLocalSuccess(imageURI){
    	var imageURI=imageURI.split('?')[0];
        var options = new FileUploadOptions(); //文件参数选项
        options.fileKey = "file";//向服务端传递的file参数的parameter name
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);//文件名
        options.method="POST";
        options.headers={"apiToken":localStorageget("access_token"),"cache-control":"no-cache"};
        options.processData=false;
        options.contentType=false;
        options.mimeType = "multipart/form-data";//文件格式，默认为image/jpeg
//      console.log(imageURI);
//		console.log(imageURI.substr(imageURI.lastIndexOf('/') + 1));
        var ft = new FileTransfer();//文件上传类
//      ft.onprogress = function (progressEvt) {//显示上传进度条
//          if (progressEvt.lengthComputable) {
//              navigator.notification.progressValue(Math.round(( progressEvt.loaded / progressEvt.total )*100));
//          }
//      }
//      navigator.notification.progressStart("提醒", "当前上传进度");
        ft.upload(imageURI, encodeURI('http://121.201.74.114/aboutapp/index.php?g=WebApi&m=user&a=avatarUpload'),onSuccess, onError, options);

		function onSuccess(r) {
			//navigator.notification.progressStop();//停止进度条
//			console.log("Code = " + r.responseCode);
//			console.log("Response = " + r.response);
//			console.log("Sent = " + r.bytesSent);
//			console.log(JSON.stringify(r));
			angular.element("#header").attr("src", imageURI);
			angular.element("#head_select").hide();
			try{
				navigator.notification.alert("文件上传成功！", null, "提醒");
			}catch(err){
				alert("文件上传成功！");
			}
			
	   }
	    function onError(error) {
	    	try{
				 navigator.notification.alert("文件不符或网络可能异常，请检查网络",null,"提醒");
			}catch(err){
				alert("文件不符或网络可能异常，请检查网络");
			}
	     
	      angular.element("#head_select").hide();
	    }

    }
    
    $scope.loadImageUpload=function(){
        //拍照上传并显示在屏幕
        navigator.camera.getPicture(onLoadImageLocalSuccess, onLoadImageFail, {
            destinationType: Camera.DestinationType.FILE_URI,
             quality:100,
//          //====关键设置=======================================
		    allowEdit:true, //出现裁剪框
		    targetWidth:200,//图片裁剪高度
		    targetHeight:200//图片裁剪高度
        });
    }
	$scope.personInfozlcgo=function(dataUrl){
		location=dataUrl
	}
})
//修改昵称及个性签名
.controller('personInfozlc',function($scope,$stateParams,$http){
	var url_info=unescape(document.URL.split("?")[1]);
	if(url_info==1){
		angular.element(".title").html("修改名称");
		angular.element(".YZ").attr("placeholder","请输入新的昵称");
	}else{
		angular.element(".title").html("修改个人签名");
		angular.element(".YZ").attr("placeholder","请输入新的个人签名");
	}
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(this).val()!=""){
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
	}).on('change',function(){
		angular.element(this).val(angular.element(this).val().split(15))
	});
	
	angular.element(".btn01").on("touchstart",function(){
		if(angular.element(".YZ").val()==""){
			return false;
		}else{
			if(url_info==1){
				$scope.user_nicename=angular.element(".YZ").val()
				$scope.signature=localStorageget("person_infozltxt").signature
			}else{
				$scope.user_nicename=localStorageget("person_infozltxt").user_nicename
				$scope.signature=angular.element(".YZ").val()
			}
			angular.element(".tip").fadeIn().fadeOut(function(){
					httpajax({
						"url": "?g=WebApi&m=user&a=updateUserInfo",
						"headers": {
						},
						"data": {
						    "user_nicename":$scope.user_nicename,
						    "signature":$scope.signature
						}
					},$http);
				history.go(-1);
			});
		}
	})
})

//修改密码
.controller('personInfoxm',function($rootScope,$scope,$http,$interval){
	var mobile=localStorageget("already_sign").user_login;
	$scope.mobileview=mobile.substr(0,3)+"****"+mobile.substr(7,4);
//	console.log($scope.mobileview);
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
		if(reg_pass.test(angular.element(".YZ").val())){
			httpajax({
				"url": "?g=WebApi&m=user&a=resetPwd",
				"headers": {
			  	},
			  	"processData": false,
				"contentType": false,
				"mimeType": "multipart/form-data",
				 "data": {
				 	"code":angular.element(".YZ").val(),
				 	"pwd":localStorageget("password")
				 }
			},$http,successfn2)
//			location="#/Person_infoxm_pass";
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
	
	//	倒计时
	$scope.send={
        canClick:false,
        second:60,
        get01text:"获取验证码",
        timer:null,
        ToSend : function(){
			$scope.send.canClick=true;
		    $scope.send.color="color:#999";
			$scope.send.get01text=$scope.send.second+"秒后重发";
			$scope.$apply();
			timer=$interval(function(){
				$scope.send.second--;
				$scope.send.get01text=$scope.send.second+"秒后重发";
			    if($scope.send.second===0){
			        $interval.cancel(timer);
			        $scope.send.second=60;
			        $scope.send.color="color:#000";
			        $scope.send.get01text="获取验证码";
			        $scope.send.canClick=false;
			    }
			},1000)
        }
    }
	angular.element(".get01").on("touchstart",function(){
		if(!$scope.send.canClick){
			httpajax({
				"url": "/WebApi/Login/sendCode/",
				"headers": {
				    "content-type": "application/x-www-form-urlencoded"
			  	},
			  	"data": {
			    	"mobile": localStorageget("already_sign").user_login
			  	}
			},$http,successfn3)
			$scope.send.ToSend();
			angular.element(".YZ").removeAttr("disabled");
		}
	})
	
	//修改密码异步请求判断验证码是否正确
	function successfn2(response){
		if(response.resultCode==100){
			location="#/Person_infoxm_pass";
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒")
   			}catch(err){
   				alert(response.resultMsg);
   			}
   			
	
		}
	}
	//查看请求验证码是否成功 可删除
	function successfn3(response){
//		console.log(response);
	}
	
})
//修改密码完成
.controller('PersonInfoxmPass',function($scope,$http){
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
			angular.element(".tip").fadeIn().fadeOut(function(){
				httpajax({
					"url": "?g=WebApi&m=user&a=changePwd",
					"headers": {
				  	},
				  	"mimeType": "multipart/form-data",
					"data":{
					  	"old_pwd":localStorageget("password"),
						"pwd":angular.element(".password").val()
					}
				},$http,successfn1)
			});
		}else if(angular.element(".password").val()==""){
			return false;
		}else{
			try{
				navigator.notification.alert("请输入非空格，6到20位的密码",null,"提醒");
   			}catch(err){
   				alert("请输入非空格，6到20位的密码")
   			}
   			
		}
	})
	
	function successfn1(response){
		if(response.resultCode==100){
			localStorageset("password",angular.element(".password").val())
			location=w_url;
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
   			}catch(err){
   				alert(response.resultMsg)
   			}
			
		}
	}
})

//修改绑定手机
.controller('personInfoxbp',function($scope,$interval){
	var t=60;
	var sw=true;
	var user_val;
	var reg_userup=/^\d*$/
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
		if(angular.element(".user").val()!=""&&angular.element(".YZ").val()!=""){
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
		var reg_pass=/^\S{6,20}$/;
	//				console.log($(".password").val());
		var w_url=angular.element(this).attr("data-url");
		if(reg_user.test(angular.element(".user").val())&&reg_pass.test(angular.element(".password").val())){
			angular.element(".tip").fadeIn().fadeOut(function(){
				top.location=w_url;
			});
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
	
	//	倒计时
	$scope.send={
        canClick:false,
        second:60,
        get01text:"获取验证码",
        timer:null,
        ToSend : function(){
			$scope.send.canClick=true;
		    $scope.send.color="color:#999";
			$scope.send.get01text=$scope.send.second+"秒后重发";
			$scope.$apply();
			timer=$interval(function(){
				$scope.send.second--;
				$scope.send.get01text=$scope.send.second+"秒后重发";
			    if($scope.send.second===0){
			        $interval.cancel(timer);
			        $scope.send.second=60;
			        $scope.send.color="color:#000";
			        $scope.send.get01text="获取验证码";
			        $scope.send.canClick=false;
			    }
			},1000)
        }
    }
	angular.element(".get01").on("touchstart",function(){
		var reg_user=/^\d{11}$/;
		if(!$scope.send.canClick&&reg_user.test(angular.element(".user").val())){
//			console.log(44)
			$scope.send.ToSend();
			angular.element(".YZ").removeAttr("disabled");
		}else if($scope.send.canClick){
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

//我的零钱	My_change
.controller("my_change",function($scope,$cordovaDatePicker){
	$scope.select_listfn=function(){
		angular.element(".select_show").toggle();
		event.cancelBubble=true;
	}
	
	//cordova时间插件
	var options = {
	    date: new Date(),
	    mode: 'date', // or 'time'
	    minDate: new Date() - 10000,
	    allowOldDates: true,
	    allowFutureDates: false,
	    doneButtonLabel: 'DONE',
	    doneButtonColor: '#F2F3F4',
	    cancelButtonLabel: 'CANCEL',
	    cancelButtonColor: '#000000'
	  };
	$scope.date_show=function(){
		$cordovaDatePicker.show(options).then(function(date){
	        alert(date);
	    });
	}
	
//	判断页面加载完毕
//	$scope.$watch('$viewContentLoaded', function(){
//		console.log(88)
//		angular.element("#main").height(document.body.clientHeight-angular.element(".person_header").outerHeight());
//	});
})
//提现
.controller("withdrawals",function($scope,$state){
//	金钱输入正则控制
	var reg_userup=/^\d*$|^(\d+)([.]{1})(\d{0,2})$/;
	$scope.prompt=false;
	$scope.paymomeyval=""
	$scope.$watch("paymomeyval",function(newValue,oldValue){
		if(reg_userup.test(newValue)){
			$scope.paymomeyval=""+newValue;
			if(newValue>5.55){
				$scope.prompt=true;
			}else{
				$scope.prompt=false;
			}
			
		}else{
			$scope.paymomeyval=""+oldValue;
		}
		
	})
	
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).css("display","none");
			$scope.paymomeyval=""
			$scope.prompt=false;
			$scope.$apply();
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(this).val()!=""){
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
		var w_url=angular.element(this).attr("data-url");
		if(angular.element(".paymomey").val()!=""){
			angular.element(".tip").fadeIn().fadeOut(function(){
				$state.go(w_url);
			});
		}else{
			return false;
		}
	});
	angular.element(".change_bank").on("touchstart",function(){
		$state.go("Bank_card");
	})
	
})



//添加银行卡
.controller("add_bank_card",function($scope,$state){
	var card_number_val;
	var reg_card_number=/^\d*$/;
	var reg1=/^(\d{16}|\d{19})$/;
	angular.element(".card_number").keydown(function(){
		if(reg_card_number.test(angular.element(this).val())){	
			card_number_val=angular.element(this).val();
		}
	})
	
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(!reg_card_number.test(angular.element(".card_number").val())){
			angular.element(".card_number").val(card_number_val);
		}
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(".name").val()!=""&&angular.element(".card_number").val()!=""){
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
		var w_url=angular.element(this).attr("data-url");
		if(angular.element(".name").val()!=""&&reg1.test(angular.element(".card_number").val())){
//			angular.element(".tip").fadeIn().fadeOut(function(){
				$state.go(w_url);
//			});
		}else{
			if(angular.element(".name").val()!=""&&angular.element(".card_number").val()!=""){
				try{
					navigator.notification.alert("请正确填写信息", null, "警告");
				}catch(err){
					alert("请正确填写信息");
				}
			}
			return false;
		}
	});
	
})



.controller("bank_card_information",function($scope,$state){
	var card_number_val;
	var reg_card_number=/^\d*$/;
	angular.element(".phone").keydown(function(){
		if(reg_card_number.test(angular.element(this).val())){	
			card_number_val=angular.element(this).val();
		}
	})
	
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(!reg_card_number.test(angular.element(".phone").val())){
			angular.element(".phone").val(card_number_val);
		}
		if(angular.element(this).val()==""){
			angular.element(this).next().css("display","none");
		}
		if(angular.element(this).val()!=""){
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
		var w_url=angular.element(this).attr("data-url");
		if(angular.element(".phone").val().length==11){
				$state.go(w_url);
		}else{
			if(angular.element(".phone").val()!=""){
				try{
					navigator.notification.alert("请正确填写信息", null, "警告");
				}catch(err){
					alert("请正确填写信息");
				}
			}
			return false;
		}
	});
	
})
//银行绑定手机卡验证
.controller("bank_card_SMS",function($rootScope,$scope,$ionicHistory,$interval){
//	$scope.mobileview=mobile.substr(0,3)+"****"+mobile.substr(7,4);
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
		if(reg_pass.test(angular.element(".YZ").val())){
			$ionicHistory.goBack(-3);
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
//	倒计时
	$scope.send={
        canClick:false,
        second:60,
        get01text:"获取验证码",
        timer:null,
        ToSend : function(){
			$scope.send.canClick=true;
		    $scope.send.color="color:#999";
			$scope.send.get01text=$scope.send.second+"秒后重发";
			$scope.$apply();
			timer=$interval(function(){
				$scope.send.second--;
				$scope.send.get01text=$scope.send.second+"秒后重发";
			    if($scope.send.second===0){
			        $interval.cancel(timer);
			        $scope.send.second=60;
			        $scope.send.color="color:#000";
			        $scope.send.get01text="获取验证码";
			        $scope.send.canClick=false;
			    }
			},1000)
        }
    }
	angular.element(".get01").on("touchstart",function(){
		if(!$scope.send.canClick){
			$scope.send.ToSend();
			angular.element(".YZ").removeAttr("disabled");
		}
	})
})
