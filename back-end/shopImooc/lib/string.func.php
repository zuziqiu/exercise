<?php
    function buildRandomString($type=1,$length=4){
        if($type === 1){
            // $arr = array('Hello','World!','I','love','Shanghai!')
            // echo join(" ",$arr)--> Hello World! I love Shanghai! 
            // range(0, 9)--> Array ( [0] => 0 [1] => 1 [2] => 2 [3] => 3 [4] => 4 [5] => 5 ...) 
            $chars=join("",range(0,9));
        }
        else if($type === 2){
            // array_merge合并数组,重复时以后面为准
            $chars=join("",array_merge(range("a","z"),range("A","Z")));
        }
        else if($type === 3){
            $chars=join("",array_merge(range("a", "z"),range("A", "Z"),range(0,9)));
        }
        // strlen函数返回字符串的长度：
        if($length>strlen($chars)){
            // die() || exit() 函数输出一条消息，并退出当前脚本。exit()函数是 die() 函数的别名。
            exit("字符串长度不够");
        }
        // str_shuffle打乱所有字符
        $char = str_shuffle($chars);
        // substr返回字符串的一部分：第二个参数时开始位置（必须），第三参数时返回的长度
        return substr($chars, 0, $length);
    };

    // 生成唯一字符串
    function getUniName(){
        return md5(uniqid(microtime(true),true));
    };

    // 得到文件的扩展名
    function getExt($filename){
        return strtolower(end(explode(".",$filename)));
    };

    
?>