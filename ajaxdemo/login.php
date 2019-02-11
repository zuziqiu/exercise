<?php
	header("content-type:text/html;charset=utf-8");
	
	//获取用户上传的数据
	$user = $_GET["user"];
	$pwd = $_GET["password"];
	
	if($user == "abc" && $pwd == "123"){
		echo "登录成功";
	}else{
		echo "登录失败";
	}
?>