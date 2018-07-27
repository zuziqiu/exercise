<?php
    require_once '../lib/string.func.php';
    // require_once 'upload.func.php';
    header("content-type:text/html;charset=utf-8");
    function buildInfo(){
        $i = 0;
        foreach($_FILES as $v){
            if(is_string($v['name'])){
                $files[$i] = $v;
                $i++;
            } else {
                foreach($v['name'] as $key => $val){
                    $files[$i]['name'] = $val;
                    $files[$i]['size'] = $v['size'][$key];
                    $files[$i]['tmp_name'] = $v['tmp_name'][$key];
                    $files[$i]['error'] = $v['error'][$key];
                    $files[$i]['type'] = $v['type'][$key];
                    $i ++;
                }
            }
        }
        return $files;
    }
    // print_r(buildInfo());

    function uploadFile($path = "uploads", $allowExt = array("gif", "jpeg", "jpg", "png", "wbmp", "bmp"), $maxSize = 524288, $imgFlag = true ){
        if(!file_exists($path)){
            mkdir($path,0777,true);
        }
        $i=0;
        $files = buildInfo();
        print_r($files);
        foreach($files as $file){
            if($file['error'] == UPLOAD_ERR_OK){
                $ext = getExt($file['name']);
                if(!in_array($ext, $allowExt)){
                    exit("非法文件类型");
                }
                if($size > $maxSize){
                    exit("文件过大");
                }
                if($imgFlag){
                    $info = getimagesize($file['tmp_name']);
                    if(!$info){
                        exit("不是真正的文件类型");
                    }
                }
                $filename = getUniName().".".$ext;
                if(!file_exists($path)){
                    mkdir($path,0777,true);
                }
                $destination = $path."/".$filename;
                if(is_uploaded_file($file['tmp_name'])){
                    if(move_uploaded_file($file['tmp_name'], $destination)){
                        $file['name'] = $filename;
                        unset($file['error'],$file['tmp_error'],$file['size'],$file['type']);
                        $uploadedFiles[$i]=$file;
                        $i++;
                        // $mes = "文件上传成功";
                    } else {
                        // $mes = "文件移动失败";
                    }
                } else {
                    // $mes = "文件不是通过HTTP POST方式上传的";
                }
            } else {
                switch($file['error']){
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
                echo $mes;
            }
        }
        return uploadedFiles;
    }
    $fileInfo = uploadFile();
    print_r($fileInfo);