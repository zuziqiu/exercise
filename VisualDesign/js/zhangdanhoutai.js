window.onload=function(){
	c_change();
	bqList();
}
var index = 0;
var c_change=function(){
	$(".bill_menu").click(function(){
		index = $(".bill_menu").index($(this));
		$(this).css("border-bottom","2px solid #10aeff").siblings().css("border-bottom","none");
		$(".bill_query_main").children("div").eq(index).show().siblings().hide();
	})
}
var bqList=function(){
	$(".bill_query_list").click(function(){
		window.location.href="zhangdanchaxun01.html";
	});
};

