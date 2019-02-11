<?php 
require_once '../include.php';
checkLogined();
$order=$_REQUEST['order']?$_REQUEST['order']:null;
$orderBy=$order?"order by p.".$order:null;
$keywords=$_REQUEST['keywords']?$_REQUEST['keywords']:null;
$where=$keywords?"where p.pName like '%{$keywords}%'":null;
//得到数据库中所有商品
$sql="select p.id,p.pName,p.pSn,p.pNum,p.mPrice,p.iPrice,p.pDesc,p.pubTime,p.isShow,p.isHot,c.cName from imooc_pro as p join imooc_cate c on p.cId=c.id {$where}  ";
$totalRows=getResultNum($sql);
$pageSize=2;
$totalPage=ceil($totalRows/$pageSize);
$page=$_REQUEST['page']?(int)$_REQUEST['page']:1;
if($page<1||$page==null||!is_numeric($page))$page=1;
if($page>$totalPage)$page=$totalPage;
$offset=($page-1)*$pageSize;
$sql="select p.id,p.pName,p.pSn,p.pNum,p.mPrice,p.iPrice,p.pDesc,p.pubTime,p.isShow,p.isHot,c.cName from imooc_pro as p join imooc_cate c on p.cId=c.id {$where} {$orderBy} limit {$offset},{$pageSize}";
$rows=fetchAll($sql);
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>-.-</title>
<link rel="stylesheet" href="styles/backstage.css">
<!-- <link rel="stylesheet" href="scripts/jquery-ui/css/ui-lightness/jquery-ui-1.10.4.custom.css" /> -->
<script src="../scripts/jquery-1.6.js"></script>
<!-- <script src="scripts/jquery-ui/js/jquery-ui-1.10.4.custom.js"></script>
<script src="scripts/jquery-ui/js/jquery-ui-1.10.4.custom.min.js"></script> -->
<style>
  /* .table{
    position: relative;
  } */
  .showDetail{
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: #3ac9ab;
  }
  .close_details {
    position: fixed;
    right: 0px;
    top: 0px;
    width: 30px;
    height: 20px;
    cursor: pointer;
    color: red;
    font-size: 16px;
  }
</style>
</head>

<body>
<div id="showDetail"  style="display:none;">

</div>
<div class="details">
                    <div class="details_operation clearfix">
                        <div class="bui_select">
                            <input type="button" value="添&nbsp;&nbsp;加" class="add" onclick="addPro()">
                        </div>
                        <div class="fr">
                            <div class="text">
                                <span>商品价格：</span>
                                <div class="bui_select">
                                    <select name="" id="" class="select" onchange="change(this.value)">
                                        <option value="">-请选择</option>
                                        <option value="iPrice asc">由低到高</option>
                                        <option value="iPrice desc">由高到低</option>
                                    </select>
                                </div>
                            </div>
                            <div class="text">
                                <span>上架时间：</span>
                                <div class="bui_select">
                                    <select name="" id="" class="select" onchange="change(this.value)">
                                        <option value="">-请选择</option>
                                        <option value="pubTime desc">最新发布</option>
                                        <option value="pubTime asc">历史发布</option>
                                    </select>
                                </div>
                            </div>
                            <div class="text">
                                <span>搜索</span>
                                <input type="text" value="" class="search" id="search" onkeypress="search()">
                            </div>
                        </div>
                    </div>
                    <!--表格-->
                    <table class="table" cellspacing="0" cellpadding="0">
                        <thead>
                            <tr>
                                <th width="10%">编号</th>
                                <th width="10%">商品名称</th>
                                <th width="10%">商品分类</th>
                                <th width="10%">是否上架</th>
                                <th width="10%">上架时间</th>
                                <th width="10%">慕课价格</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                        <?php foreach($rows as $row):?>
                            <tr>
                                <!--这里的id和for里面的c1 需要循环出来-->
                                <td><input type="checkbox" id="c1" class="check" value=<?php echo $row['id'];?>><label for="c1" class="label"><?php echo $row['id'];?></label></td>
                                <td><?php echo $row['pName']; ?></td>
                                <td><?php echo $row['cName'];?></td>
                                <td>
                                <?php 
                                  $show=($row['isShow']==1)?"上架":"下架";
                                  echo $show;
                                ?>
                                </td>
                                <td><?php echo date("Y-m-d H:i:s", $row['pubTime']);?></td>
                                <td><?php echo $row['iPrice'];?>元</td>
                                <td align="center">
                                	<input type="button" value="详情" class="btn" onclick="showDetail(<?php echo $row['id'];?>,'<?php echo $row['pName'];?>')">
                                  <input type="button" value="修改" class="btn" onclick=editePro(<?php echo $row['id'];?>)>
                                  <input type="button" value="删除" class="btn" onclick=delPro(<?php echo $row['id'];?>)>
					                        <div id="showDetail<?php echo $row['id'];?>" class="showDetail" style="display:none;">
                                    <div class='close_details' onclick="close_details(<?php echo $row['id'];?>)">x</div>
					                        	<table class="table" cellspacing="0" cellpadding="0">
					                        		<tr>
					                        			<td width="20%" align="right">商品名称</td>
					                        			<td><?php echo $row['pName'];?></td>
					                        		</tr>
					                        		<tr>
					                        			<td width="20%"  align="right">商品类别</td>
					                        			<td><?php echo $row['cName'];?></td>
					                        		</tr>
					                        		<tr>
					                        			<td width="20%"  align="right">商品货号</td>
					                        			<td><?php echo $row['pSn'];?></td>
					                        		</tr>
					                        		<tr>
					                        			<td width="20%"  align="right">商品数量</td>
					                        			<td><?php echo $row['pNum'];?></td>
					                        		</tr>
					                        		<tr>
					                        			<td  width="20%"  align="right">商品价格</td>
					                        			<td><?php echo $row['mPrice'];?></td>
					                        		</tr>
					                        		<tr>
					                        			<td  width="20%"  align="right">幕课网价格</td>
					                        			<td><?php echo $row['iPrice'];?></td>
					                        		</tr>
					                        		<tr>
					                        			<td width="20%"  align="right">商品图片</td>
                                        <?php 
					                        			$proImgs=getAllImgByProId($row['id']);
					                        			foreach($proImgs as $img):
					                        			?>
					                        			<img width="100" height="100" src="../uploads/<?php echo $img['albumPath'];?>" alt=""/> &nbsp;&nbsp;
					                        			<?php endforeach;?>
					                        		</tr>
					                        		<tr>
					                        			<td width="20%"  align="right">是否上架</td>
					                        			<td>
					                        			<?php 
					                        				$show=($row['isShow']==1)?"上架":"下架";
															            echo $show;
					                        			?>
					                        			</td>
					                        		</tr>
					                        		<tr>
					                        			<td width="20%"  align="right">是否热卖</td>
					                        			<td>
					                        			<?php 
					                        				$hot=($row['isShow']==1)?"热卖":"促销";
															            echo $hot;
					                        			?>
					                        			</td>
					                        		</tr>
					                        	</table>
					                        	<span style="display:block;width:80%; ">
					                        	商品描述<br/>
					                        	<?php echo $row['pDesc'];?>
					                        	</span>
					                        </div>
                                
                                </td>
                            </tr>
                           <?php endforeach;?>
                           <?php if($totalRows>$pageSize):?>
                            <tr>
                            	<td colspan="7"><?php echo showPage($page, $totalPage,"keywords={$keywords}&order={$order}");?></td>
                            </tr>
                            <?php endif;?>
                        </tbody>
                    </table>
                </div>
<script type="text/javascript">
function showDetail(id,t){
	$("#showDetail"+id).show()
}
function close_details(id) {
  $("#showDetail"+id).hide()
}
	function addPro(){
		window.location='addPro.php';
  }
  function editePro(id) {
    window.location.href = 'editPro.php?id=' + id;
  }
  function delPro(id) {
		if(window.confirm("您确认要删除嘛？添加一次不易，且删且珍惜!")){
			window.location="doAdminAction.php?act=delPro&id=" + id;
		}
  }
  function search() {
    if (event.keyCode == '13') {
      val = document.getElementById("search").value;
      window.location = 'listPro.php?keywords=' + val;
    }
  }
  function change(val) {
    window.location = 'listPro.php?order=' + val;
  }
</script>
</body>
</html>