<?php
    require_once '../include.php';
    $page= $_REQUEST['page']?(int)$_REQUEST['page']:1;
    $sql = "select * from imooc_cate";
    $totalRows = getResultNum($sql);
    $pageSize = 2;
    $totalPage = ceil($totalRows/$pageSize);
    if($page<1||$page==null||!is_numeric($page))$page = 1;
    if($page >= $totalPage)$page = $totalPage;
    $offset = ($page -1)*$pageSize;
    // Order By Asc,升序 Order By Desc降序排列
    $sql = "select id,cName from imooc_cate order by id asc limit {$offset},{$pageSize}";
    $rows = fetchAll($sql);
    if(!$rows){
        alertMes('sorry,没有分类,请添加！');
        exit;
    }   
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="styles/backstage.css">
</head>
<body>
    <div class="details">
        <div class="details_operation clearfix">
            <div class="bui_select">
                <input type="button" value="添&nbsp;&nbsp;加" class="add"  onclick="addAdmin()">
            </div>
        </div>
        <!--表格-->
        <table class="table" cellspacing="0" cellpadding="0">
            <thead>
                <tr>
                    <th width="15%">编号</th>
                    <th width="25%">分类</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <?php $i=1; foreach ($rows as $key):?>
                <tr>
                    <!--这里的id和for里面的c1 需要循环出来-->
                    <td><input type="checkbox" id="c1" class="check"><label for="c1" class="label"><?php echo $key['id'];?></label></td>
                    <td><?php echo $key['cName'];?></td>
                    <td align="center">
                        <input type="button" value="修改" class="btn" onclick="editCate(<?php echo $key['id'];?>)">
                        <input type="button" value="删除" class="btn"  onclick="delCate(<?php echo $key['id'];?>)">
                    </td>
                </tr>
                <?php $i++;endforeach;?>
                <!-- 总条数大于分页数才进入分页 -->
                <?php if($totalRows>$pageSize):?>
                    <tr>
                    	<td colspan="4"><?php echo showPage($page, $totalPage); ?></td>
                    </tr>
                <?php endif;?>
            </tbody>
        </table>
    </div>
    <script type="text/javascript">
        function editCate(id){
            window.location = "editCate.php?id=" + id;
        };
        
        function delCate(id){
            if(window.confirm("确定要删除吗")){
                window.location = "doAdminAction.php?act=delCate&id=" + id;
            }
        };

        function addAdmin(){
            window.location = "addCate.php";
        }
    </script>
</body>
</html>
