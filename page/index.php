<?php

require_once './DB.php';
class App
{
  private $db;
  public function __construct()
  {
    $this->db = new DB([
      'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=pages',
      'user' => 'root',
      'password' => 'huanghao',
      'charset' => 'utf-8'
    ]);
  }

  public function run()
  {
    // try {
      $pageSize = $_GET['$page_size'] ?? 10;
      $pageIndex = $_GET['page_index'];
      $data = $this->pagenation(intval($pageSize), intval($pageIndex));
      $pages = ceil($this->getCount() / $pageSize);
      $info = [
        // 'count' => $count,
        'pages' => $pages,
        'data' => $data
      ];
      return $this->returnSuccessData($info);
    // } catch (Exception $e) {
    //   return $this->returnData($e->getCode()(), $e->getMessage());
    // }
  }

  public function pagenation($pageSize, $pageIndex)
  {
    $sql = 'select id, title, type, data from page where type=1 order by date limit ? offset ?';

    $limit = $pageSize;
    $offset = $pageSize * ($pageIndex - 1);

    // $data = $this->db->query($sql,  [
    //   [$limit, PDO::PARAM_INT],
    //   [$offset, PDO::PARAM_INT]
    // ]);
    $data = $this->db->query($sql, [$limit, $offset]);
    return $data;
  }

  public function getCount()
  {
    $sql = 'select count(id) as count from page where type = 1 order by date';
    $data = $this->db->query($sql, '');
    return $data[0]['count'];
  }

  public function returnSuccessData($data)
  {
    $content = [
      'code' => 0,
      'message' => 'success',
      'info' => $data,
    ];

    return json_encode($content);
  }
  public function returnData($code, $message, $data = [])
  {
    $content = [
      'code' => $code,
      'message' => $message,
      'info' => $data,
    ];

    return json_encode($content);
  }
}

$app = new App();
$re = $app->run();
echo $re;
