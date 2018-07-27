<?php
    require_once '../lib/string.func.php';
    header("content-type:text/html;charset=utf-8");
    // print_r($_FILES);
    // $filename = $_FILES['myFile']['name'];
    // $type = $_FILES['myFile']['type'];
    // $tmp_name = $_FILES['myFile']['tmp_name'];
    // $error = $_FILES['myFile']['error'];
    // $size = $_FILES['myFile']['size'];
    function uploadFile($fileInfo, $path = "uploads", $allowExt = array("gif", "jpeg", "jpg", "png", "wbmp", "bmp"), $maxSize = 524288, $imgFlag = true ){
        // 判断下错误信息
        if($fileInfo['error'] == UPLOAD_ERR_OK){
            $ext = getExt($fileInfo['name']);
            if(!in_array($ext, $allowExt)){
                exit("非法文件类型");
            }
            if($size > $maxSize){
                exit("文件过大");
            }
            if($imgFlag){
                $info = getimagesize($fileInfo['tmp_name']);
                if(!$info){
                    exit("不是真正的文件类型");
                }
            }
            $filename = getUniName().".".$ext;
            if(!file_exists($path)){
                mkdir($path,0777,true);
            }
            $destination = $path."/".$filename;
            if(is_uploaded_file($fileInfo['tmp_name'])){
                if(move_uploaded_file($fileInfo['tmp_name'], $destination)){
                    $mes = "文件上传成功";
                } else {
                    $mes = "文件移动失败";
                }
            } else {
                $mes = "文件不是通过HTTP POST方式上传的";
            }
        } else {
            switch($fileInfo['error']){
                case 1:
                    $mes = "超过了配置文件上传文件的大小";
                    break;
                case 2:
                    $mes = "超过了表达设置上传文件的大小";
                    break;
                case 3:
                    $mes = "文件部分被上传";
                    break;
                case 4:
                    $mes = "没有文件被上传";
                    break;
                case 6:
                    $mes = "没有找到临时目录";
                    break;
                case 7:
                    $mes = "文件不可写";
                    break;
                case 8:
                    $mes = "由于PHP的扩展程序中断了文件上传";
                    break;    
            }
        }
        echo $mes;
    }
//服务器端进行的配置
//1》file_uploads = On,支持通过HTTP POST方式上传文件
//2》;upload_tmp_dir =临时文件保存目录
//3》upload_max_filesize = 2M默认值是2M，上传的最大大小2M
//4》post_max_size = 8M，表单以POST方式发送数据的最大值，默认8M
//客户端进行配置
//<input type="hidden" name="MAX_FILE_SIZE" value="1024"  />
//<input type="file" name="myFile" accept="文件的MIME类型,..."/>
