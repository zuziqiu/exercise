
//链接首页
$(".backmain").click(function(e){
	location="index.html";
	e.stopPropagation;
})

$(".footer>li").add(".recharge").children().add(".func1,.func2,.func3,.func5").add(".portrait").add(".ic_leftarrow").add(".go").add(".nleft").add(".nright").add(".contact>span").click(function(){
		var go=$(this).attr("data-url");
		if(go==-1){
			history.go(-1);
		}else{
			location=go;
		}
		console.log(go);
})

//类名buy按钮的样式切换
$(".buy").on("touchstart",function(){
	$(this).css("color","blue");
}).on("touchend",function(){
	$(this).css("color","#fff");
}).click(function(){
	var come=$(this).attr("data-url");
	location=come;
})





//加载提示
$(document).ajaxStart(function(){
	$(".sh_loading").show();
	$(".loadEffect").show();
});
$(document).ajaxStop(function(){
	if($(".sh_loading").css('display')=="block"){
	    setTimeout(function () {
	    	$(".loadEffect").hide();
	    	$(".loading_tips").html("加载失败");
	    	$(".sh_loading").click(function(){
	    		$(this).hide();
	    	});
	    	setTimeout(function () {
	    		$(".sh_loading").hide();
	    	},5000);
	    },10000);
	};
});
	
//异步请求封装	
//var counti=1;
var myajax=function(opt,action){
var	method=opt.method?opt.method:"POST",
	Datatype=opt.Datatypetype?opt.Datatype:"json",
	Async=opt.Async?opt.Async:"true",
	crossDomain=opt.crossDomain?opt.crossDomain:"true",
	cacheControl=opt["cache-control"]?opt["cache-control"]:null,
    postmanToken=opt["postman-token"]?opt["postman-token"]:null,
	data=opt.data?opt.data:null,
	_api=opt._api?opt._api:null;
 	$.ajax({
   			crossDomain:crossDomain,
            method: method,
            Datatype:Datatype,
            async: Async,
            headers: {
            "cache-control":cacheControl,
            "postman-token":postmanToken,
            "Content-type": "application/x-www-form-urlencoded",
	    	"Authorization": "Basic QXBpQmFzaWM6MTIz",
            },
            "url": "http://test3.msqsoft.net/zkweixin/weiphp/index.php?s=api",
            "UserId":"46E19176-D96C-45CD-A05D-3B777A25191F",
            data: data,
            success: function(response){
                //console.log("异步请求成功");
				
                $(".sh_loading").hide();
               	 successfn(response,action);
            },
            error: function(e){
                console.log("异步请求失败");
            }
        });

}
