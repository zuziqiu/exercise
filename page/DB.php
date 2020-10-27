<?php

class DB
{
  /* 
   * dsn mysql 链接
   */
  private $dsn;
  /* 
   * mysql 数据库用户名
   */
  private $user;
  /* 
   * mysql 数据库密码
   */
  private $password;
  /* 
   * mysql 数据库字符集
   */
  private $charset;
  /* 
   * pod 对象
   * @var PDO
   */
  private $pdoInstance;
  /* 
   * sql 对象
   * @var PDOStatement
   */
  private $pdoStmt;

  public function __construct($config = [])
  {
    $this->dsn = $config['dsn'];
    $this->user = $config['user'];
    $this->password = $config['password'];
    $this->charset = $config['charset'];

    $this->connect();
  }

  private function connect()
  {
    if (!$this->pdoInstance) {

      $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAME ' . $this->charset
      ];
      // 获取PDO变量
      $this->pdoInstance = new PDO($this->dsn, $this->user, $this->password);
      // 设置PDO对象错误处理方式
      $this->pdoInstance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
  }
  /* 
   * 通过sql query 数据
   */
  public function query($sql, $parameters)
  {
    if (!is_array($parameters)) {
      $parameters = [$parameters];
    }
    $this->pdoStmt = $this->pdoInstance->prepare($sql);
    $index = 1;
    foreach ($parameters as $parameter) {
      $this->pdoStmt->bindValue($index++, $parameter[0] ?? $parameter, $parameter[1] ?? PDO::PARAM_INT);
    }
    $execRe = $this->pdoStmt->execute();
    if (!$execRe) {
      throw new MYSQLException($this->pdoStmt->errorInfo()[2], $this->pdoStmt->errorCode());
    }

    $data = $this->pdoStmt->fetchAll(PDo::FETCH_ASSOC);
    return $data;
  }
}

class MYSQLException extends Exception
{
}
