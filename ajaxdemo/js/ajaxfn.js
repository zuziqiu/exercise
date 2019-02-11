function ajaxfn(method,url_,data,sucFn,errFn){
	//AJAX对象声明
	var ajax = null;
	if (window.XMLHttpRequest) {
		ajax= new XMLHttpRequest();
	} else{
		//IE 6/7/8
		ajax = new ActiveXObject("Msxml2.XMLHTTP");
	}
	
	// open send  发送请求：get/post
	if (method.toLowerCase() == "get") {
		//get
		ajax.open("GET",url_+"?"+data);
		ajax.send(null);
	} else{
		ajax.open("POST",url_);
		ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		ajax.send(data);
	}
	
	//状态
	ajax.onreadystatechange = function(){
		//请求状态
		if(this.readyState == 4){
			//HTTP状态码
			var s =this.status;
			if(s>=200&&s<300||s==304){
				sucFn(this.responseText);
			}else{
				errFn && errFn(this.responseText);
			}
		}
	}
}





















