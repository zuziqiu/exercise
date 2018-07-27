<?php
    require_once './../include.php';
    $act = $_REQUEST['act'];
    $id = $_REQUEST['id'];
    if($act == 'logout'){
        logout();
    }
    else if($act == "addAdmin"){
        $mes = addAdmin();
    }
    else if($act == "editAdmin"){
        $mes = editAdmin($id);
    }
    else if($act == "delAdmin"){
        $mes = delAdmin($id);
    }
    else if($act == "addCate"){
        $mes = addCate();
    }
    else if($act == "editCate"){
        $where = "id={$id}";
        $mes = editCate($where);
    }
    else if($act == "delCate"){
        $where = "id={$id}";
        $mes = delCate($where);
    }
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<body>
    <?php
        if($mes){
            echo $mes;
        }
    ?>
</body>
</html>