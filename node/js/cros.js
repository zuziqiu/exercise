var myajax=function(opt,successfn,errorfn){
var	type=opt.type?opt.type:"post",
	Datatype=opt.Datatypetype?opt.Datatype:"json",
	async=opt.async?opt.async:"true",
	cacheControl=opt["cache-control"]?opt["cache-control"]:null,
        postmanToken=opt["postman-token"]?opt["postman-token"]:null,
	data=opt.data?opt.data:null,
        opt.data.UserId= opt.data.UserId? opt.data.UserId:"46E19176-D96C-45CD-A05D-3B777A25191F";
	_api=opt._api?opt._api:null;
   	$.ajax({
            type: type,
            Datatype:Datatype,
            async: async,
            headers: {
                  "cache-control":cacheControl,
                   "postman-token":postmanToken,
                  "Content-type": "application/x-www-form-urlencoded",
	    	  "Authorization": "Basic QXBpQmFzaWM6MTIz",
             },
            "url": "http://test3.msqsoft.net/zkweixin/weiphp/index.php?s=api",
            data: data,
            success: function(response){
                successfn(response);
            },
            error: function(e){
                console.log("请求失败");
            }
        });

}
myajax({_api:"GiftList/GetGiftList",data:{
				"Type": "2",
			    "UserId": "46E19176-D96C-45CD-A05D-3B777A25191F",
			    "PageIndex": "2",
			    "PageCount": "10",
			    "Name": "",
			    "GiftClass": "3ecb2add-32b5-40e2-a1a7-2e9459388c18"}
		},function(response){
				
		    	
		    	$(".sel2 ol h2").html(opt);
		    	
                    
})
//
function test(opt){
	$ajax
}
