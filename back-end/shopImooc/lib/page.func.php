<?php
// require_once '../include.php';
// $sql = "select * from imooc_admin";
// $totalRows = getResultNum($sql);
// $pageSize = 2;
// // 页码数，ceil()向上取整
// $totalPage = ceil($totalRows/$pageSize);
// $page = $_REQUEST['page']?(int)$_REQUEST['page']:1;
// // is_numeric — 检测变量是否为数字或数字字符
// if($page<1 || $page == null || !is_numeric($page)){
//     $page = 1;
// };
// if($page > $totalPage)$page=$totalPage;
// $offset = ($page-1)*$pageSize;
// // limit => 从指定下标开始取若干条数据
// $sql = "select * from imooc_admin limit {$offset}, {$pageSize}";
// $rows = fetchAll($sql);
// foreach ($rows as $row){
//     echo "编号:".$row['id']."<br/>";
//     echo "管理员名称:".$row['username']."<hr/>";
// };
// echo showPage($page, $totalPage, "cid=5");
function showPage($page, $totalPage, $where= null){
    $where = ($where == null)?null:"&".$where;
    $url = $_SERVER['PHP_SELF'];
    $index = ($page == 1)?"首页":"<a href='{$url}?page=1{$where}'>首页</a>";
    $last = ($page == $totalPage)?"尾页":"<a href='{$url}?page={$totalPage}{$where}'>尾页</a>";
    $prev = ($page == 1)?"上一页":"<a href='{$url}?page=".($page-1)."{$where}'>上一页</a>";
    $next = ($page == $totalPage)?"下一页":"<a href='{$url}?page=".($page+1)."{$where}'>下一页</a>";
    $str = "总共{$totalPage}页/当前是第{$page}页";
    $p = '';
    for($i=1;$i<=$totalPage;$i++){
        // 当前页无连接
        if($page == $i){
            $p.="[{$i}]";
        }
        else{
            $p.="<a href='{$url}?page={$i}{$where}'>[{$i}]</a>";
        }
    }
    $pageStr = $str.$index.$prev.$p.$next.$last;
    return $pageStr;
}