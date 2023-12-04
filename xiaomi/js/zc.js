$(function($){
	$("form input").focus(function(){
		$(this).css("outline","none");
		$(this).parent(".int").css("border","1px solid orange");
		}).blur(function(){
		var $parent=$(this).parent();
		$parent.find(".formtips").remove();
		if($(this).is("#username")){
			if(this.value=="" || this.value.length<6){
				var errorname="请输入至少六位的用户名";
				$parent.append('<small id='onError' class='formtips errorname'>'+errorname+'</small>');
			}else{
				var okname="用户名通过";
				$parent.append("<small class='formtips okname'>"+okname+"</small>");
			}
		}
		if($(this).is("#email")){
			if(this.value==""||(this.value!="" && ! /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(this.value))){
				var erroremail="请输入正确的邮箱格式";
				$parent.append('<small id="onError" class="formtips erroremail">'+erroremail+'</small>');
			}else{
				var okemail="邮箱通过";
				$parent.append("<small class='formtips okemail'>"+okemail+"</small>")
			}
		}
		if($(this).is("#phone")){
			if(this.value==""||(this.value!="" && ! /^0?1[3|4|5|8][0-9]\d{8}$/.test(this.value))){
				var errorphone="请输入正确的手机号码";
				$parent.append('<small id="onError" class="formtips errorphone">'+errorphone+'</small>');
			}else{
				var okphone="手机通过";
				$parent.append("<small class='formtips okphone'>"+okphone+"</small>")
			}
		}
	});
	$("#send").click(function(){
		$("form input").triggerHandler("blur");
		var numError=$("form #onError").length;
		if(numError){
			alert("请完整填写信息")
			return false;
		}
	alert("恭喜！注册成功！");
	});
		
		$(function(){  
		  //判断浏览器是否支持placeholder属性
		  supportPlaceholder='placeholder'in document.createElement('input'),
		  placeholder=function(input){
		    var text = input.attr('placeholder'),
		    defaultValue = input.defaultValue;
		    if(!defaultValue){
		      input.val(text).addClass("phcolor");
		    }
		    input.focus(function(){
		      if(input.val() == text){
		        $(this).val("");
		      }
		    });
		    input.blur(function(){
		      if(input.val() == ""){
		        $(this).val(text).addClass("phcolor");
		      }
		    });
		    //输入的字符不为灰色
		    input.keydown(function(){
		      $(this).removeClass("phcolor");
		    });
		  };
		  //当浏览器不支持placeholder属性时，调用placeholder函数
		  if(!supportPlaceholder){
		    $('input').each(function(){
		      text = $(this).attr("placeholder");
		      if($(this).attr("type") == "text"){
		        placeholder($(this));
		      }
		    });
		  }
		});
});
