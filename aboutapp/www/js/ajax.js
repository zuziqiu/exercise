//angularjs$http.get封装  
var httpajax=function(opt,$http,callback){
	var	method=opt.method?opt.method:"POST",
	Datatype=opt.Datatypetype?opt.Datatype:"json",
	Async=opt.async?opt.async:true,
	_Url=opt.url?opt.url:"",
	//跨域
	crossDomain=opt.crossDomain?opt.crossDomain:true,
	cacheControl=opt.headers['cache-control']?opt.headers['cache-control']:"no-cache",
//  postmanToken=opt.headers['postman-token']?opt.headers['postman-token']:"",
	data=opt.data?opt.data:"",
	processData=opt.processData?opt.processData:false,
	contentType=opt.contentType?opt.contentType:false,
	mimeType=opt.mimeType?opt.mimeType:'',
	Content_Type=opt.headers['Content-Type']?opt.headers['Content-Type']:"application/x-www-form-urlencoded";
//	apitoken=opt.headers['apitoken']?opt.headers['apitoken']:"";
	//_api=opt._api?opt._api:null;
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
//		    "postman-token":postmanToken
		},
		"processData": processData,
		"contentType": contentType,
		"mimeType": mimeType,
	    'data': $.param(data)
	    
 	}).success(function(response){
 		callback&&callback(response)
   }).error(function(e){
   		try{
	   		navigator.notification.alert("网络异常，请检查网络",null,"提醒");
   		}catch(err){
   			alert("网络异常，请检查网络");
   		}
//      console.log("异步请求失败");
    })
}



var localStorageset=function(str1,str2){
	localStorage.setItem(str1,JSON.stringify(str2));
}
var localStorageget=function(str1){
	return JSON.parse(localStorage.getItem(str1));
}


var error_arr=[200,210,211,301];
var error_sw=false;

