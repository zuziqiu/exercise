<?php
    function connect(){
        $link = mysql_connect(DB_HOST, DB_USER, DB_PWD) or die("数据库链接失败:".mysql_errno().":".mysql_error());
        mysql_set_charset(DB_CHARSET);
        mysql_select_db(DB_DBNAME) or die("指定数据库打开失败");
        return $link;
    }
    // 插入
    function insert($table, $array){
        $keys = join(",",array_keys($array));
        $vals = "'".join("','",array_values($array))."'";
        $sql = "insert {$table}($keys) values({$vals})";
        mysql_query($sql);
        var_dump('insert 语句是：', $sql);
        return mysql_insert_id();
    }
    // 更新
    function update($table, $array, $where = null){
        foreach($array as $key=>$val){
            if($str == null){
                $sep="";
            }
            else{
                $sep=",";
            }
            $str.=$sep.$key."='".$val."'";
        }
        $sql = "update {$table} set {$str}".($where == null?null:" where ".$where);
        var_dump('update 语句是：', $sql);
        $result=mysql_query($sql);
        if($result){
            // 返回受影响的行的数目
            return mysql_affected_rows();
        }else{
            return false;
        }
    }
    // 删除
    function delete($table, $where){
        $where = $where == null?null:" where ".$where;
        $sql = "delete from {$table} {$where}";
        var_dump('delete 语句是：', $sql);
        mysql_query($sql);
        // 返回受影响的行的数目
        return mysql_affected_rows();
    }
    // 得到指定一条记录
    function fetchOne($sql, $result_type = MYSQL_ASSOC){
        $result = mysql_query($sql);
        // mysql_fetch_assoc() 函数从结果集中取得一行作为关联数组。
        // $row = mysql_fetch_assoc($result);

        // mysql_fetch_array() 函数从结果集中取得一行作为关联数组，或数字数组，或二者兼有
        $row = mysql_fetch_array($result, $result_type);
        return $row;
    }
    // 得到结果集中所有记录
    function fetchAll($sql, $result_type = MYSQL_ASSOC){
        $result = mysql_query($sql);
        while(@$row = mysql_fetch_array($result, $result_type)){
            $rows[] = $row;
        }
        return $rows;
    }

    // 得到结果集中的记录条数
    function getResultNum($sql){
        $result = mysql_query($sql);
        return mysql_num_rows($result);
    }
    
    /**
     * 得到上一步插入记录的ID号
     * @return number
     */
    function getInsertId(){
      return mysql_insert_id();
    }


?>