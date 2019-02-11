<?php
    $filename = "x5.jpg";
    // 创建源画布资源（提供source）
    $src_image = imagecreatefromjpeg($filename);
    // 原图宽高
    list($src_w, $src_h) = getimagesize($filename);
    // 缩放比例
    $scale = 0.5;
    // 取整缩放后宽高
    $dst_w = ceil($src_w*$scale);
    $dst_h = ceil($src_h*$scale);
    // 创建画布资源(采集source在此目标画布)
    $dst_image = imagecreatetruecolor($dst_w, $dst_h);
    // 重采样
    imagecopyresampled($dst_image, $src_image,0,0,0,0, $dst_w, $dst_h, $src_w, $src_h);
    header("content-type:image/jpeg");
    imagejpeg($dst_image,"uploads/".$filename);
    imagedestroy($src_image);
    imagedestroy($dst_image);
