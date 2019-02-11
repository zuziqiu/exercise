$(function(){
	//绑定或取消门店
	$(".advertisement_main").on("click",".follows",function(event){
		$("#show").show();
		$("#no").click(function(){
			$("#show").hide();
		});
		event.stopPropagation();
		var _this = this;
		$("#yes").click(function(event){
			for(var i = 0; $(".advertisement_main").children().length>i;i++){
//				$(".advertisement_main").children().eq(i).find(".follows").children().eq(1).css("display","none").end().eq(0).css("display","block");
			}	
			$(_this).children().eq(1).css("display","block");
				
//			var last = $(_this).siblings().eq(0).children("span").html();
//			localStorage.setItem("key",last);
			var index = _data[0][$(_this).parent().index()].BranchID;
			_index = index;
			console.log(index);
//			会员资产转移(适用于集团模式)
			myajax({
					"cache-control": "no-cache",
					"postman-token": "d0e32ffb-d5a2-0f6f-d64f-66e3a0078a0a",
					"data": {
							  	"_api" :"MemberAssetsTransfer/SetMemberAssetsTransfer",
								"OpenID": "ospcgwllZQ98DVrhiKhaVcEjL6zc",
	    						"BranchID": index,
							},
				},'successfn2');
			$("#show").hide();
			event.stopPropagation();
			});
		});
});
		
