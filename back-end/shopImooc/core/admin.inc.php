<?php

// 检查是否管理员
function checkAdmin($sql){
    // fetchone() ：
    // 返回单个的元组，也就是一条记录(row)，如果没有结果 则返回 null
    // fetchall() ：
    // 返回多个元组，即返回多个记录(rows),如果没有结果 则返回 ()(Pyhton)
    return fetchOne($sql);
}

// 检查登录
function checkLogined(){
    if($_SESSION['adminId'] == '' && $_COOKIE['adminId'] == ''){
        alertMes("未登录，请先登录","login.php");
    }
}

// 注销管理员
function logout(){
    $_SESSION = array();
    //  session_name() 存取目前 session 名称。
    // 语法: string session_name(string [name]);
    if(isset($_COOKIE[session_name()])){
        setcookie(session_name(), '', time()-1);
    }
    
    // 清除cookie
    if(isset($_COOKIE['adminId'])){
        setcookie(session_name(), '', time()-1);
    }
    if(isset($_COOKIE['adminName'])){
        setcookie(session_name(), '', time()-1);
    }
    session_destroy();


    // header() 函数向客户端发送原始的 HTTP 报头

    // 什么是头信息？
    // 这里只作简单解释，详细的自己看http协议。
    // 在 HTTP协议中，服务器端的回答(response)内容包括两部分：头信息(header) 和 体内容，这里的头信息不是HTML中的<head></head>部分，同样，体内容也不是<BODY>< /BODY>。头信息是用户看不见的，里面包含了很多项，包括：服务器信息、日期、内容的长度等。而体内容就是整个HTML，也就是你所能看见的全 部东西。

    // 头信息有什么用呢？
    // 头信息的作用很多，最主要的有下面几个：

    // 1、跳转：当浏览器接受到头信息中的 Location: xxxx 后，就会自动跳转到 xxxx 指向的URL地址，这点有点类似用 js 写跳转。但是这个跳转只有浏览器知道，不管体内容里有没有东西，用户都看不到。

    // 2、指定网页的内容： 同样一个XML文件，如果头信息中指定：Content-type: application/xml 的话，浏览器会将其按照XML文件格式解析。但是，如果头信息中是：Content-type: text/xml 的话，浏览器就会将其看作存文本解析。（浏览器不是按照扩展名解析文件的）

    // 3、附件： 不知道大家有没有注意，有些时候在一些网站下载东西，点下载连接以后，结果浏览器将这个附件当成网页打开 了，里面显示的都是乱码，这个问题也和头信息有关。有时候浏览器根据Content-type 来判断是打开还是保存，这样有时就会判断错误（主要是网站设计者忘记写Content-type）。其实，还有一个可以来指定该内容为附件、需要保存，这 个就是：Content-Disposition: attachment; filename="xxxxx"

    // 3、附件：
    // // 指定内容为附件
    // header('Content-Disposition: attachment; filename="downloaded.pdf"');
    // // 打开文件，并输出
    // readfile('original.pdf');
    header('location: login.php');
}

// 添加管理员
function addAdmin(){
    $arr = $_POST;
    $arr['password'] = md5($_POST['password']);
    if(insert("imooc_admin", $arr)){
        $mes = "添加成功<br/><a href='addAdmin.php'>继续添加</a>|<a href='listAdmin.php'>查看管理员列表</a>";
    }
    else{
        $mes = "添加失败<br/><a href='addAdmin.php'>重新添加</a>";
    }
    return $mes;
}

// 查看管理员列表
function getAllAdmin($where = null){
    $sql = "select id, username, email from imooc_admin {$where}";
    $rows = fetchall($sql);
    return $rows;
}

//  
function getAdeminByPage($pageSize=2){
    $sql = "select * from imooc_admin";
    global $totalRows;
    $totalRows = getResultNum($sql);
    // 页码数，ceil()向上取整
    global $totalPage;
    global $page;
    $totalPage = ceil($totalRows/$pageSize);
    $page = $_REQUEST['page']?$_REQUEST['page']:1;
    if($page<1 || $page == null || !is_numeric($page)){
        $page = 1;
    };
    if($page > $totalPage)$page=$totalPage;
    $offset = ($page-1)*$pageSize;
    $sql = "select * from imooc_admin limit {$offset}, {$pageSize}";
    $rows = fetchAll($sql);
    return $rows;
}

// 编辑管理员列表
function editAdmin($id){
    $arr = $_POST;
    $arr['password'] = md5($_POST['password']);
    if(update("imooc_admin", $arr, "id={$id}")){
        $mes = "编辑成功！</br><a href='listAdmin.php'>查看管理员列表</a>";
    }
    else{
        $mes ="编辑失败！</br><a href='listAdmin.php'>查看管理员列表</a>";
    }
    return $mes;
}

// 删除管理员
function delAdmin($id){
    if(delete("imooc_admin","id={$id}")){
        $mes = "删除成功！<a href='listAdmin.php'>查看管理员列表</a>";
    }
    else{
        $mes = "删除失败！<a href='listAdmin.php'>请重新删除</a>";
    }
    return $mes;
}

/**
 * 添加用户的操作
 * @param int $id
 * @return string
 */
function addUser(){
	$arr=$_POST;
	$arr['password']=md5($_POST['password']);
	$arr['regTime']=time();
	$uploadFile=uploadFile("../uploads");
	if($uploadFile&&is_array($uploadFile)){
		$arr['face']=$uploadFile[0]['name'];
	}else{
		return "添加失败<a href='addUser.php'>重新添加</a>";
	}
	if(insert("imooc_user", $arr)){
		$mes="添加成功!<br/><a href='addUser.php'>继续添加</a>|<a href='listUser.php'>查看列表</a>";
	}else{
		$filename="../uploads/".$uploadFile[0]['name'];
		if(file_exists($filename)){
			unlink($filename);
		}
		$mes="添加失败!<br/><a href='arrUser.php'>重新添加</a>|<a href='listUser.php'>查看列表</a>";
	}
	return $mes;
}
/**
 * 删除用户的操作
 * @param int $id
 * @return string
 */
function delUser($id){
	$sql="select face from imooc_user where id=".$id;
	$row=fetchOne($sql);
	$face=$row['face'];
	if(file_exists("../uploads/".$face)){
		unlink("../uploads/".$face);
	}
	if(delete("imooc_user","id={$id}")){
		$mes="删除成功!<br/><a href='listUser.php'>查看用户列表</a>";
	}else{
		$mes="删除失败!<br/><a href='listUser.php'>请重新删除</a>";
	}
	return $mes;
}
/**
 * 编辑用户的操作
 * @param int $id
 * @return string
 */
function editUser($id){
	$arr=$_POST;
	$arr['password']=md5($_POST['password']);
	if(update("imooc_user", $arr,"id={$id}")){
		$mes="编辑成功!<br/><a href='listUser.php'>查看用户列表</a>";
	}else{
		$mes="编辑失败!<br/><a href='listUser.php'>请重新修改</a>";
	}
	return $mes;
}