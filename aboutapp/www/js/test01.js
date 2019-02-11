angular.module("release_order_controller",['order_chat','release_order_timekey'])
.controller('releaseOrderMain',function($scope,$state,$http){
	if(localStorage.getItem("type_of_goods")){
		angular.element(".type_of_goods").html(localStorage.getItem("type_of_goods"));
	}
	if(localStorage.getItem("size_of_goods")){
		angular.element(".size_of_goods").html(localStorage.getItem("size_of_goods"));
	}
	if(localStorage.getItem("weight_of_goods")){
		angular.element(".weight_of_goods").html(localStorage.getItem("weight_of_goods"));
	}
	if(localStorage.getItem("remarks_word")){
		angular.element(".remarks_word").html(localStorage.getItem("remarks_word"));
	}
	if(localStorage.getItem("already_choose_express")){
		angular.element(".express_company").html(localStorage.getItem("already_choose_express"))
	}
	angular.element("#release").children().on("touchstart",function(){
		angular.element(this).parent().find(".ic_radio_selected").attr("src","img/ic_radio_nomal.png");
		angular.element(this).find(".ic_radio_selected").attr("src","img/ic_radio_selected.png");
		localStorageset("publish_way",angular.element(this).index());
		switch(angular.element(this).index()){
			case 0:
				angular.element("#appointment").html("预约发布")
				angular.element("#reward_text").html("悬赏发布")
				localStorageset("agreed_begin","");
				localStorageset("agreed_end","");
				localStorageset("reward","");
				break;
			case 1:
				angular.element("#reward_text").html("悬赏发布");
				localStorageset("reward","");
				break;
			case 2:
				angular.element("#appointment").html("预约发布")
				localStorageset("agreed_begin","");
				localStorageset("agreed_end","");
			break;
			default:;
		}
	})
	if(localStorageget("reward")){
		angular.element("#reward_text").html("悬赏发布<br /><p id='Show'>￥ "+localStorageget("reward")+"</p>");
	}
	//ion-footer-bar 显示隐藏控制开关
	$scope.payfooter_bar=true;
	//悬赏支付
	$scope.idreward=function(){
		angular.element("#pay").show();
		$scope.payfooter_bar=false;
	}
	angular.element("#paycancle").add("#pay").on("click",function(){
		angular.element("#pay").hide();
	})
	angular.element("#payconfirm").on("click",function(){
		if(angular.element(".pay").val()>0){
			localStorageset("reward",angular.element(".pay").val())
			angular.element("#reward_text").html("悬赏发布<br /><p id='Show'>￥ "+localStorageget("reward")+"</p>");
			if(angular.element(".pay").val()>5.55){
				$state.go('release_order_selectpay')
				angular.element("#pay").hide();
			}else{
				$state.go('release_order_pay')
				angular.element("#pay").hide();
			}	
		}
	})
	angular.element("#pay_main").on("click",function(){
		event.cancelBubble=true;
	})
	angular.element("input").keyup(function(){	
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","inline-block").on("touchstart",function(){
				angular.element(this).prev().val("").end().css("display","none");
			});
		}
	}).blur(function(){
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	});
	//发布创建订单
	angular.element(".btn01>button").eq(0).click(function(){
		httpajax({
			"url": "http://121.201.74.114/aboutapp/index.php?g=WebApi&m=orders&a=add",
			"headers": {
		  	},
		  	"mimeType": "multipart/form-data",
			"data":{
				"sender_address_id":"1",
				"recipient_address_id": "2",
				"express_company_id":localStorageget("choose_expressid")[0],
				"goods_kind_id":localStorageget("type_of_goodsid"),
				"goods_long":localStorage.getItem("size_of_goods").split('*').join("").split("cm")[0],
				"goods_width":localStorage.getItem("size_of_goods").split('*').join("").split("cm")[1],
				"goods_height":localStorage.getItem("size_of_goods").split('*').join("").split("cm")[2],
				"goods_weight":localStorage.getItem("weight_of_goods").split("kg")[0],
				"remark":localStorage.getItem("remarks_word"),
				"publish_way": localStorageget("publish_way"),
				"agreed_begin":localStorageget("agreed_begin"),
				"agreed_end": localStorageget("agreed_end"),
				"reward":localStorageget("reward")
			}
		},$http,successfn1)
	}).end().eq(1).click(function(){
		$state.go('release_order_choosepeo');
	})
	var arr1=["img/list_bottom.png","img/list_top.png"];
	var count=0;
	$scope.select = function(){
		count++;
		angular.element(".cargo_info>.detailed").stop(true);
		angular.element(".cargo_info>div").eq(0).css("border-bottom-width",count%arr1.length+"px").find("img").attr("src",arr1[count%arr1.length]);
		if(arr1[count%arr1.length]=="img/list_top.png"){
			angular.element(".cargo_info>.detailed").slideDown();
			
		}else{
			angular.element(".cargo_info>.detailed").slideUp();
		}
	}
	
	//发送者or接受者信息显示开关	不要删
	$scope.sendershowsw1=localStorageget("sender_or_recipientsw1").sendersw;
	$scope.recipientshowsw1=localStorageget("sender_or_recipientsw1").recipientsw;
	console.log($scope.sendershowsw1,$scope.recipientshowsw1)
	//检测发送者or接受者 
	$scope.Mainsender_recipientselect=function(identity){
		localStorageset("sendidentity",identity);
		$state.go('release_order_selectdz');
	}
	//发送者详细地址
	if(localStorageget("senderdz_detail")){
		$scope.senderdz_detail=localStorageget("senderdz_detail")
	}else{
		$scope.senderdz_detail=''
	}
	if(localStorageget("recipientdz_detail")){
		$scope.recipientdz_detail=localStorageget("recipientdz_detail")
	}else{
		$scope.recipientdz_detail=''
	}
	
	//异步请求回调函数
	function successfn1(response){
		if(response.resultCode==100){
			console.log(response)
			angular.element(".tip").fadeIn().fadeOut(
				history.go(-1)
			);
		}else{
			
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg);
			}
		}
	}
	
	
})



.controller('releaseOrderSelectdz',function($scope,$http,$state,$ionicLoading){
	//清空标记记录
	$scope.clearAdddz=function(){
		localStorageset('already_select1',['','','','']);
		$state.go("release_order_adddz");
	}
	
	
	//地址选择界面获取地址数据载入 
	httpajax({
		 "url": "http://121.201.74.114/aboutapp/index.php?g=WebApi&m=address&a=get",
		 "method": "GET",
		 "headers":{}
	},$http,successfn1)
	
	function successfn1(response){
		if(response.resultCode){
			$scope.insertaddress=response.resultData;
		}else{
			try{
				navigator.notification.alert(response.resultMsg,null,"提醒");
			}catch(err){
				alert(response.resultMsg);
			}
		}
	}
	
//	$scope.insertaddress=localStorageget('release_order_adddzsave');
	
	
	
	
	
//	console.log("11",$scope.insertaddress);
	//转到修改地址页面及初始修改地址页面开关控制
	$scope.gomodifydz=function(id_data){
		localStorageset("modifydz_id_data",id_data);
		localStorageset("modifydz_sw1",true);
		$state.go('release_order_modifydz')
	}
	
	
	//release_order_main页面插入详细地址
	
	$scope.Maindz_insert=function(id_index){
		var sender_or_recipientsw1=localStorageget("sender_or_recipientsw1");
		switch(localStorageget("sendidentity")){
			case 1:
				localStorageset("senderdz_detail",localStorageget('release_order_adddzsave')[id_index]);
				sender_or_recipientsw1.sendersw=false;
				
				break;
			case 2:
				localStorageset("recipientdz_detail",localStorageget('release_order_adddzsave')[id_index]);
				sender_or_recipientsw1.recipientsw=false;
				break;
			default:
		}
		localStorageset("sender_or_recipientsw1",sender_or_recipientsw1);
		$state.go('releaseordermain');
	}
	
})









.controller('releaseOrderAdddz',function($scope,$http,$state,$ionicLoading){
	var releasei=1;
	angular.element(document).find('textarea').bind('keyup',function(){
		angular.element(this).outerHeight(0).outerHeight(this.scrollHeight);
	}).end().find("#release").bind('click',function(){
		var arr=["img/ic_radio_nomal.png","img/ic_radio_selected.png"]
		releasei++;
		angular.element(this).find(".ic_radio_selected").attr("src",arr[releasei%2]);;
	})

	//三级联动
	$scope.three_level_linkage = function(pid,gourl,i,now_selectarea){
		localStorageset('addpersonaddress',$scope.addpersonaddress);
		localStorageset('area_id',pid);
		console.log(localStorageget('area_id'))
//		console.log(localStorageget('addpersonaddress'))
		$scope.url1=gourl;
		$scope.count1=i;
		$scope.now_selectarea=now_selectarea;
		httpajax({
			"url": "http://121.201.74.114/aboutapp/index.php?g=WebApi&m=basic&a=getArea&pid="+pid,
			"method": "GET",
			"headers": {
				"apitoken": "wCaRY9wFXm35F6s0iksHt3dCGvnrvMQ9",
				"postman-token": "81d25997-8c00-242d-7428-37b99d22c09b"
			}
		},$http,selectareasave)
	}
	if(localStorageget('selectareadata')){
		$scope.selectareadata=localStorageget('selectareadata');
		$scope.already_selectarr1=localStorageget('already_select1');
	}else{	
		$scope.selectareadata={"province":[],"city":[],"area1":[]}
		$scope.already_selectarr1=['','','',''];
	}
	if($scope.already_selectarr1.join("")){
		$scope.already_selectstr1=$scope.already_selectarr1.join(" ");
	}else{
		$scope.already_selectstr='';
	}
	function selectareasave(response){
		switch($scope.count1){
			case 0:
				$scope.selectareadata.province=response.resultData;
				$scope.already_selectarr1=['','','',''];
				break;
			case 1:
				$scope.selectareadata.city=response.resultData;
				$scope.already_selectarr1[2]='';
				$scope.already_selectarr1[3]='';
				break;
			case 2:
				$scope.selectareadata.area1=response.resultData;
				$scope.already_selectarr1[3]='';
				break;
			default:
		}
		$scope.already_selectarr1[$scope.count1]=$scope.now_selectarea;
		localStorageset('already_select1',$scope.already_selectarr1);
		localStorageset('selectareadata',$scope.selectareadata);
		if(response.resultData.length!=0){
			location=$scope.url1;
		}else if(angular.isNumber($scope.getindex_modifydz)){
			location="#/release_order_modifydz";
		}else{
			location="#/release_order_adddz";
		}
	}
	//修改数据
	if(localStorageget('modifydz_id_data')){	
		$scope.getindex_modifydz=localStorageget('modifydz_id_data').id_data;
	}
	if(angular.isNumber($scope.getindex_modifydz)){
//		console.log("11",$scope.getindex_modifydz)
		localStorageset('addpersonaddress',localStorageget('release_order_adddzsave')[$scope.getindex_modifydz]);
		if(localStorageget("modifydz_sw1")){
			localStorageset("modifydz_sw1",false);
			$scope.already_selectstr1=localStorageget('addpersonaddress').already_selectstr1;
		}
	}
	$scope.modifydz_save=function(){
		if($scope.addpersonaddress.person_name&&$scope.addpersonaddress.person_phone&&$scope.addpersonaddress.person_detail&&$scope.already_selectstr1){
			if((releasei%2+1)==2){
				for(var z=0;z<$scope.adddzsavearr1.length;z++){
					$scope.adddzsavearr1[z].status=1;
					$scope.adddzsavearr1[z].hidden=true;
				}
				$scope.hiddenmo=false;
			}else{
				$scope.hiddenmo=true;
			}
			$scope.adddzsavearr1[$scope.getindex_modifydz]={
				'person_name':$scope.addpersonaddress.person_name,
				'person_phone':$scope.addpersonaddress.person_phone,
				'already_selectstr1':$scope.already_selectstr1,
				'person_detail':$scope.addpersonaddress.person_detail,
				'status':releasei%2+1,
				"hidden":$scope.hiddenmo,
				"area_id":localStorageget('area_id')
			}
			localStorageset('release_order_adddzsave',$scope.adddzsavearr1);
			$scope.returnselectdz();
			localStorageset("modifydz_id_data",'');
			localStorageset("modifydz_sw1",true);
		}else{
			
			try{
				navigator.notification.alert("请把信息填写完整",null,"提醒");
			}catch(err){
				alert("请把信息填写完整");
			}
		}
	}
	$scope.modifydz_return=function(){
		$scope.returnselectdz();
		localStorageset("modifydz_id_data",'');
		localStorageset("modifydz_sw1",true);
	}
	
	
	
	

	//添加所有信息保存
	if(localStorageget("release_order_adddzsave")){
		$scope.adddzsavearr1=localStorageget("release_order_adddzsave");
	}else{
		$scope.adddzsavearr1=[];
	}
	
	if(localStorageget('addpersonaddress')){
		$scope.addpersonaddress=localStorageget('addpersonaddress');
//		console.log($scope.addpersonaddress)
	}else{
		$scope.addpersonaddress={
			person_name:'',
			person_phone:'',
			person_detail:''
		}
		console.log($scope.addpersonaddress)
	}
	localStorageset('addpersonaddress',$scope.addpersonaddress);
	
//	实时监控textarea数据
	$scope.$watch("addpersonaddress.person_name",function(newValue,oldValue){
		$scope.addpersonaddress.person_name=newValue;
    })
	$scope.$watch("addpersonaddress.person_phone",function(newValue,oldValue){ 
		var reg1=/^\d*$/;
		if(newValue.length<12&&reg1.test(newValue)){
			$scope.addpersonaddress.person_phone=newValue;
		}else{
			$scope.addpersonaddress.person_phone=oldValue;
		}
    })
	$scope.$watch("addpersonaddress.person_detail",function(newValue,oldValue){
		$scope.addpersonaddress.person_detail=newValue;
    })
	$scope.returnselectdz=function(){
		localStorageset('addpersonaddress','');
		$state.go('release_order_selectdz');
		
	}
	
	//添加地址提交
	$scope.release_order_adddzsave=function(){
		if($scope.addpersonaddress.person_name&&$scope.addpersonaddress.person_phone&&$scope.addpersonaddress.person_detail&&$scope.already_selectstr1){
			$ionicLoading.show({template:'发送中...'})
			if((releasei%2+1)==2){
				for(var z=0;z<$scope.adddzsavearr1.length;z++){
					$scope.adddzsavearr1[z].status=1;
					$scope.adddzsavearr1[z].hidden=true;
				}
				$scope.hiddenmo=false;
			}else{
				$scope.hiddenmo=true;
			}
			//本地数据保存
			$scope.adddzsavearr1[$scope.adddzsavearr1.length]={
				'person_name':$scope.addpersonaddress.person_name,
				'person_phone':$scope.addpersonaddress.person_phone,
				'already_selectstr1':$scope.already_selectstr1,
				'person_detail':$scope.addpersonaddress.person_detail,
				'status':releasei%2+1,
				"hidden":$scope.hiddenmo,
				"area_id":localStorageget('area_id')
			}
			//异步请求上传数据
			var form = {
				"name": $scope.addpersonaddress.person_name,
				"mobile": $scope.addpersonaddress.person_phone,
				"area_id":localStorageget('area_id'),
				"detail":$scope.addpersonaddress.person_detail,
				"status":releasei%2+1
			};
			httpajax({
			"url": "http://121.201.74.114/aboutapp/index.php?g=WebApi&m=address&a=add",
			"headers": {
			    "apitoken": "wCaRY9wFXm35F6s0iksHt3dCGvnrvMQ9",
			    "postman-token": "a6f8974b-6626-4ec2-4890-88ff3793bf28"
		  	},
			'data':form
			},$http,selectdzsendsuccessfn)
	
			function selectdzsendsuccessfn(response){
				console.log(form)
				if(response.resultCode==100){	
					$ionicLoading.hide()
					console.log(form);
					//本地数据保存
					localStorageset('release_order_adddzsave',$scope.adddzsavearr1);
					//清空标记记录及返回选择地址页面
					$scope.returnselectdz();
				}else{
					$ionicLoading.hide()
					try{
						navigator.notification.alert(response.resultMsg,null,"提醒");
					}catch(err){
						alert(response.resultMsg,null,"提醒");
					}
				}
			}

		}else{
			
			try{
				navigator.notification.alert("请把信息填写完整",null,"提醒");
			}catch(err){
				alert("请把信息填写完整");
			}
		}

	}
	
	
})


.controller('chooseExpressCompany',function($scope,$http){
	
	$scope.choose_express=function(event){
		console.log(this.x.id)
		var imgsrc=angular.element(event.target).children().eq(2)
		if(imgsrc.attr("src")=="img/ic_ checkbox _nomal.png"){
			imgsrc.attr("src","img/ic_ checkbox _selecte.png").parent().addClass("already_choose");
		}else{
			imgsrc.attr("src","img/ic_ checkbox _nomal.png").parent().removeClass("already_choose");
		}
	}
	
	
	angular.element(document).find(".choose_express_save").bind('click',function(){
		var str="";
		var arrid=[];
		for(var i=0; i<angular.element(document).find(".already_choose").length;i++){
			str += angular.element(document).find(".already_choose").eq(i).find("p").html() + " ";
			arrid[i] = angular.element(document).find(".already_choose").eq(i).index() + 1;
			if(i==angular.element(document).find(".already_choose").length-1){
				localStorage.setItem("already_choose_express",str);
				localStorageset("choose_expressid",arrid);
				history.go(-1);

			}
		}
	})
	
	
	angular.element(document).find(".location_marker>div").bind('click',function(){
		angular.element(document).find(".location_marker").find("div").removeClass("location_marker_choose")
		angular.element(this).addClass("location_marker_choose");
	})
	
	httpajax({
		 "url": "http://121.201.74.114/aboutapp/index.php?g=WebApi&m=basic&a=getExpress",
		  "method": "GET",
		  "headers": {
		    "apitoken": "wCaRY9wFXm35F6s0iksHt3dCGvnrvMQ9",
		    "postman-token": "1bdb7cff-2884-005b-1e92-141f9420d677"
		  },
		  "mimeType": "multipart/form-data"
	},$http,successfn1)
	function successfn1(response){
		$scope.list1=response.resultData;
	}
	
})

.controller('releaseOrderGoodst',function($scope,$http,$ionicLoading){
	$ionicLoading.show({template:"加载中..."});
	$scope.choose_goodst=function(event){
		var txt=angular.element(event.target).html().match(/[\u4e00-\u9fa5||\w]+/)[0];
			localStorage.setItem("type_of_goods",txt);
			localStorageset("type_of_goodsid",this.x.id);
			console.log(localStorageget("type_of_goodsid"))
			history.go(-1);
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
	angular.element(".btn01").on("click",function(){
		if(angular.element(".goods_style").val()==""){
			return false;
		}else{
			angular.element(".tip").fadeIn().fadeOut(function(){
				localStorage.setItem("type_of_goods",angular.element(".goods_style").val());
				history.go(-1);
			});
		}
	})
	angular.element(".other_come").on("touchstart",function(){
		angular.element(this).parent().fadeOut(function(){
			angular.element(".other").slideDown();
		});
	})
	
	httpajax({
		"url": "http://121.201.74.114/aboutapp/index.php?g=WebApi&m=basic&a=getGoodsKind",
		"method": "GET",
		"headers": {
		    "apitoken": "wCaRY9wFXm35F6s0iksHt3dCGvnrvMQ9",
		    "postman-token": "820e2d5c-a544-6b4e-5d75-808c69aeb405"
	  	},
	  	"mimeType": "multipart/form-data"
	},$http,successfn1)
	function successfn1(response){
		$scope.list1=response.resultData;
		$ionicLoading.hide();
	}
	
	
})






.controller('releaseOrderGoodssize',function($scope){
	var goods_val;
	var reg_userup=/^\d*$/,placeholder_val;
	var goods_btn_sw=true;
	angular.element("input").keydown(function(){
		if(reg_userup.test(angular.element(this).val())){	
			goods_val=angular.element(this).val();
		}
	})
	angular.element("input").keyup(function(){	
		if(!reg_userup.test(angular.element(this).val())){
			angular.element(this).val(goods_val);
		}
		if(angular.element(".goods_length").val()!=""&&angular.element(".goods_width").val()!=""&&angular.element(".goods_height").val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(this).attr("placeholder",placeholder_val);
	}).focus(function(){
		placeholder_val=angular.element(this).attr("placeholder");
		angular.element(this).attr("placeholder","");
	})
	angular.element(".btn01").on("touchstart",function(){
		if(angular.element(".goods_length").val()==""||angular.element(".goods_width").val()==""||angular.element(".goods_height").val()==""){
			return false;
		}else{
			if(goods_btn_sw){
				goods_btn_sw=false;
				angular.element(".tip").fadeIn().fadeOut(function(){
					localStorage.setItem("size_of_goods",angular.element(".goods_length").val()+"cm*"+angular.element(".goods_width").val()+"cm*"+angular.element(".goods_height").val()+"cm");
					history.go(-1);
				});
			}
			
		}
	})
})

.controller('releaseOrderGoodsw',function($scope){
	var goods_val;
	var reg_userup=/^\d*$/,placeholder_val;
	var goods_btn_sw=true;
	angular.element("input").keydown(function(){
		if(reg_userup.test(angular.element(this).val())){	
			goods_val=angular.element(this).val();
		}
	})
	angular.element("input").keyup(function(){	
		angular.element(this).next().css("display","inline-block").on("touchstart",function(){
			angular.element(this).prev().val("").end().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		});
		if(!reg_userup.test(angular.element(this).val())){
			angular.element(this).val(goods_val);
		}
		if(angular.element(this).val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(this).next().css("display","none");
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(this).attr("placeholder",placeholder_val);
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		placeholder_val=angular.element(this).attr("placeholder");
		angular.element(this).attr("placeholder","");
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	})
	angular.element(".btn01").on("touchstart",function(){
		if(angular.element(".goods_weight").val()==""){
			return false;
		}else{
//				if(goods_btn_sw){
//					goods_btn_sw=false;
				angular.element(".tip").fadeIn().fadeOut(function(){
					localStorage.setItem("weight_of_goods",angular.element(".goods_weight").val()+"kg");
					history.go(-1);
				});
//				}
			
		}
	})
})

.controller('releaseOrderRemarks',function($scope){
	var goods_btn_sw=true;
	angular.element("textarea").keyup(function(){
		angular.element(".remarks_word_length").html(angular.element(this).val().length+"/140");
		if(angular.element(this).val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(this).attr("placeholder",placeholder_val);
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		placeholder_val=angular.element(this).attr("placeholder");
		angular.element(this).attr("placeholder","");
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	})
	angular.element(".btn01").on("touchstart",function(){
		if(angular.element("#remarks_word").val()==""){
			return false;
		}else{
			if(goods_btn_sw){
				goods_btn_sw=false;
				angular.element(".tip").fadeIn().fadeOut(function(){
					localStorage.setItem("remarks_word",angular.element("#remarks_word").val());
					history.go(-1);
				});
			}
			
		}
	})
})

.controller('releaseOrderPay',function($scope){
	var goods_val;
	var reg_userup=/^\d*$/,placeholder_val;
	var goods_btn_sw=true;
	angular.element("input").keydown(function(){
		if(reg_userup.test(angular.element(this).val())){	
			goods_val=angular.element(this).val();
		}
	})
	angular.element("input").keyup(function(){	
		if(!reg_userup.test(angular.element(this).val())){
			angular.element(this).val(goods_val);
		}
		if(angular.element(this).val()!=""){
			angular.element(".btn01").css({"background-color":"#ffe500","color":"#181818"});
		}else{
			angular.element(".btn01").css({"background-color":"#ccc","color":"#fff"});
		}
	}).blur(function(){
		angular.element(this).attr("placeholder",placeholder_val);
		angular.element(".btn_clear").css("display","none");
	}).focus(function(){
		placeholder_val=angular.element(this).attr("placeholder");
		angular.element(this).attr("placeholder","");
		if(angular.element(this).val()!=""){
			angular.element(this).next().css("display","block");
		}
	})
	angular.element(".btn01").on("touchstart",function(){
		if(angular.element(".must_pay").val()==""){
			return false;
		}else{
			if(goods_btn_sw){
				goods_btn_sw=false;
				angular.element(".tip").fadeIn().fadeOut(function(){
//						localStorage.setItem("weight_of_goods",$(".YZ").val()+"kg");
					history.go(-1);
				});
			}
			
		}
	})
})

.controller('releaseOrderChoosepeo',function($scope){
	angular.element(".location_marker>div").click(function(){
		angular.element(".location_marker").find("div").removeClass("location_marker_choose")
		angular.element(this).addClass("location_marker_choose");
	})
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
	
})

.controller('orderDetailMain',function($scope){
	var oldMinutes;
	angular.element(".revoke_order").on("touchstart",function(){
		angular.element(".tip").fadeIn().fadeOut(function(){
			top.location="#/tab"
		});
	})
	angular.element(".order_patment").on("touchstart",function(){
		top.location="#/release_order_pay";
	})

})

.controller('orderAppointment',function($scope){
	angular.element(".order_patment").on("touchstart",function(){
		angular.element(".tip").fadeIn().fadeOut(function(){
			angular.element("#detail_main").css("display","none")
			angular.element("#chat").slideDown();
			angular.element(".goods_btn").fadeOut()
			angular.element(".detailed").append("<div class='item item-avatar' style='margin-bottom:54px'><span>订单状态</span><span>已转出</span></div>");
		});
	})
})
.controller('rewardOrderGet',function($scope){
	angular.element(".order_patment").on("touchstart",function(){
		angular.element(".tip").fadeIn().fadeOut(function(){
			angular.element("#detail_main").css("display","none")
			angular.element("#chat").slideDown();
		});
	})
})

.controller('rewardOrderMain',function($scope){
	angular.element(".order_patment").on("touchstart",function(){
		angular.element(".tip").fadeIn().fadeOut(function(){
			angular.element("#detail_main").css("display","none")
			angular.element("#chat").slideDown();
			angular.element(".tip>span").html("收货成功");
			angular.element(".order_patment").html("确认收货");
			angular.element(".detailed").append("<div class='item item-avatar'><span>订单状态</span><span>待收货</span></div>");
		});
	})
})
.controller('commonOrder',function($scope){
	angular.element(".order_patment").on("touchstart",function(){
		angular.element(".tip").fadeIn().fadeOut(function(){
			angular.element("#detail_main").css("display","none")
			angular.element("#chat").slideDown();
			angular.element(".goods_btn").fadeOut()
			angular.element(".item-note").html("待收件")
			angular.element(".detailed").append("<div class='item item-avatar' style='margin-bottom:54px'><span>订单状态</span><span>待收件</span></div>");
		});
	})
})