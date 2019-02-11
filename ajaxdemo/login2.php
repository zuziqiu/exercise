<?php
	header("content-type:text/html;charset=utf-8");
	
	//获取用户上传的数据
	$user = $_POST["user"];
	$pwd = $_POST["password"];
	
	if($user == "abc" && $pwd == "123"){
		//echo "登录成功";
		//外面单引号，里面双引号
		echo '{"result":"成功","userid":"007"}';
	}else{
		echo "登录失败";
	}
?>