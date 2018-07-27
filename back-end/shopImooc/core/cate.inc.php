<?php
// 添加分类
function addCate(){
    $arr = $_POST;
    if(insert("imooc_cate", $arr)){
        $mes = "添加分类成功！<br/><a href='addCate.php'>继续添加</a>|<a href='listCate.php'>查看分类</a>";
    }
    else{
        $mes = "添加分类失败！<br/><a href='addCate.php'>重新添加</a>|<a href='listCate.php'>查看分类</a>";
    }
    return $mes;
}

// 根据ID得到指定分类信息
function getCateById($id){
    $sql = "select id, cName from imooc_cate where id= {$id}";
    return fetchOne($sql);
}

// 修改分类
function editCate($where){
    // $_POST => 接收来自form表单数据
    $arr = $_POST;
    // var_dump($arr);
    if(update("imooc_cate", $arr, $where)){
        $mes = "分类修改成功!<br/><a href='listCate.php'>查看分类</a>";
    }
    else{
        $mes = "分类修改失败!<br/><a href='listCate.php'>重新修改</a>";
    }
    return $mes;
}

// 删除分类
function delCate($where){
    if(delete("imooc_cate", $where)){
        $mes = "删除分类成功!<br/><a href='listCate.php'>查看分类</a>";
    }
    else{
        $mes = "删除失败!<br/><a href='listCate.php'>请重新操作</a>";
    }
    return $mes;
}