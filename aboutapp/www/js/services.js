angular.module('aboutapp_services',[])
//用户与快递员的距离
.factory("factoryDistance",function(){
	return{
		Distanceobj: function(longitude,latitude,callback){
			var map = new BMap.Map("allmap"); //实例化一个地图对象
			map.centerAndZoom(new BMap.Point(116.331398,39.897445),17); //设置地图元素的可视层
			var mypoint=localStorageget("mypoint")
			var pointA = new BMap.Point(mypoint.longitude,mypoint.latitude);  // 自己位置创建点坐标A
			var pointB = new BMap.Point(longitude,latitude);  // 快递员位置创建点坐标B
			//alert('距离是：'+(map.getDistance(pointA,pointB)).toFixed(2)+' 米。');  //获取两点距离,保留小数点后两位
			var distance=(map.getDistance(pointA,pointB)).toFixed(0)
			if(distance>1000){
				distance=(distance/1000).toFixed(2)+"km"
			}else{
				distance=distance+"m"
			}
			callback(distance);
    	}
	}
		
})

.service("serviceAjax",function($http,$ionicLoading){
	return {
		httpajax:function(opt,callback){
			
			var	method=opt.method?opt.method:"POST",
			Datatype=opt.Datatypetype?opt.Datatype:"json",
			Async=opt.async?opt.async:true,
			_Url=opt.url?opt.url:"",
			//跨域
			crossDomain=opt.crossDomain?opt.crossDomain:true,
			cacheControl=opt.headers['cache-control']?opt.headers['cache-control']:"no-cache",
			data=opt.data?opt.data:"",
			processData=opt.processData?opt.processData:false,
			contentType=opt.contentType?opt.contentType:false,
			mimeType=opt.mimeType?opt.mimeType:'',
			Content_Type=opt.headers['Content-Type']?opt.headers['Content-Type']:"application/x-www-form-urlencoded";
		 	$ionicLoading.show({"template":"加载中"})
		 	$http({
			    'url':"http://121.201.74.114/aboutapp/index.php"+ _Url,
				'crossDomain':crossDomain,
			    'method': method,
			    'Datatype':Datatype,
			    'async': Async,
			    'headers': {
				    "Content-Type": Content_Type,
				    "cache-control":cacheControl,
				    "apiToken":localStorageget("access_token")
				},
				"processData": processData,
				"contentType": contentType,
				"mimeType": mimeType,
			    'data': $.param(data)
		 	}).success(function(response){
		 		$ionicLoading.hide();
		 		callback&&callback(response)
		   }).error(function(e){
		   		$ionicLoading.hide();
		   		try{
			   		navigator.notification.alert("网络异常，请检查网络",null,"提醒");
		   		}catch(err){
		   			alert("网络异常，请检查网络");
		   		}
		    })
		}
	}
		
})



//用户定位请求
.service("serverGeolocation",function($http){
	return {
		Geolocationabj: function(callback){
			var map = new BMap.Map("allmap"); //实例化一个地图对象
			//var point = new BMap.Point(116.331398,39.897445); //设置地图中心的位置
			map.centerAndZoom(new BMap.Point(116.331398,39.897445),17); //设置地图元素的可视层
			var geolocation = new BMap.Geolocation();
			var gc = new BMap.Geocoder();//地址逆解析
			var address;
			geolocation.getCurrentPosition(function(r){
				if(this.getStatus() == BMAP_STATUS_SUCCESS){
					map.panTo(r.point);
					//获取当前位置定位
				    gc.getLocation(r.point, function(rs){
				    	var addComp = rs.addressComponents;
				    	address = {
				    		"addressstr1":addComp.province+" "+addComp.city+" "+addComp.district,
							"point":r.point
//				    		"area":addComp.district,
				    	}
			    		httpajax({
							"url":"?g=WebApi&m=address&a=getPosition",
							"headers": {},
							"mimeType": "multipart/form-data",
							"data":{
								"area":addComp.district,
								"longitude":r.point.lng,
								"latitude":r.point.lat
							}
						},$http,geosuccessfn1)
				    });
				}else {
					alert('failed'+this.getStatus());
				}        
			},{enableHighAccuracy: true})
			function geosuccessfn1(response){
				if(response.resultCode==100){
					localStorageset("mypoint",{"longitude":address.point.lng,"latitude":address.point.lat})
					callback(address,response.resultData.area_id)
				}else{
					try{
						navigator.notification.alert(response.resultMsg,null,"提醒");
					}catch(err){
						alert(response.resultMsg)
					}
				}
			}
    	}
	}
		
})
