<?php
    require_once '../lib/string.func.php';
    $filename = "x5.jpg";
    // thumb($filename);
    thumb($filename,"image_50/".$filename, 50, 50, true);
    thumb($filename,"image_220/".$filename, 50, 50, true);
    thumb($filename,"image_350/".$filename, 50, 50, true);
    thumb($filename,"image_800/".$filename, 50, 50, true);
    function thumb($filename, $destination= null,$dst_w= null, $dst_h= null, $isReservedSource= true, $scale= 0.5){
        // 得到文件宽高类型
        list($src_w,$src_h,$imagetype)=getimagesize($filename);
        if(is_null($dst_w) || is_null($dst_h)){
            $dst_w = ceil($src_w * $scale);
            $dst_h = ceil($src_h * $scale);
        }
        // mime类型
        $mime = image_type_to_mime_type($imagetype);
        // 组装成这个方法imagecreatefromjpeg() =>创建画布资源
        $createFun = str_replace("/", "createfrom", $mime);
        $outFun = str_replace("/", null, $mime);
        $src_image = $createFun($filename);
        $dst_image = imagecreatetruecolor($dst_w, $dst_h);
        // imagecopyresampled:
        // dst_image 目标图象连接资源。
        // src_image 源图象连接资源。
        // dst_x 目标 X 坐标点。
        // dst_y 目标 Y 坐标点。
        // src_x 源的 X 坐标点。
        // src_y 源的 Y 坐标点。
        // dst_w 目标宽度。
        // dst_h 目标高度。
        // src_w 源图象的宽度。
        // src_h 源图象的高度。
        imagecopyresampled($dst_image, $src_image, 0,0,0,0, $dst_w, $dst_h, $src_w, $src_h);
        if ($destination && !file_exists(dirname($destination))) {
            // mkdir() => 创建目录
            // dirname() 函数返回路径中的目录部分。
            mkdir(dirname($destination), 0777, true);
        }
        $dstFilename = $destination == null?getUniName().".".getExt($filename):$destination;
        $outFun($dst_image, $dstFilename);
        imagedestroy($src_image);
        imagedestroy($dst_image);
        if(!$isReservedSource){
            // unlink() 函数删除文件。这里操作删除源文件
            unlink($filename);
        }
        return $dstFilename;
    };