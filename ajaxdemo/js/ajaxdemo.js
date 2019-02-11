//$(function($){
//	$("#btn").click(function(){
//		var request=new XMLHttpRequest();
//		request.open("POST","ajaxdemo.php");
//		var data="name="+document.getElementById("namevalue").value;
//		request.setRequestHeader("content-type","application/x-www-form-urlencoded");
//		request.send(data)
//		request.onreadystatechange=function(){
//			if(request.readyState==4){
//				if(request.status==200){
//					document.getElementById("result").innerHTML=this.responseText;
//				}
//			}
//		}
//	});
//});

$(function($){
	$("#btn").click(function(){
			var da = $("#namevalue").val();
			$.ajax({
				url:"ajaxdemo.php",
				type:"post",
				dataType:"json",
				data:"name="+da,
//				data:$("#mCard_main form" ).serialize(),
				success:function(){
					alert(11111);
					$("#result").html("name");
				},
				error:function(){
					alert("发生错误")
				}
			});
	});
});
